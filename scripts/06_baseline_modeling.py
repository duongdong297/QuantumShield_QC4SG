import pandas as pd
import numpy as np
import joblib
import xgboost as xgb
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
from sklearn.model_selection import TimeSeriesSplit 
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Directories
Path("models").mkdir(parents=True, exist_ok=True)
Path("reports/figures").mkdir(parents=True, exist_ok=True)

# Load data
df = pd.read_csv("data/final/model_dataset.csv")

# ─────────────────────────────────────────────
# 1. Dataset Sanity Report
# ─────────────────────────────────────────────
print("--- Dataset Sanity Report ---")
print("Dataset Shape:", df.shape)
target_cols = ['target_h1', 'target_h2', 'target_h3']
print("Features Count:", df.shape[1] - len(target_cols) - 2)

# 2. Chronological Split
train_mask = df['year'] <= 2020
val_mask   = df['year'] == 2021
test_mask  = df['year'] == 2022

train = df[train_mask].copy()
val   = df[val_mask].copy()
test  = df[test_mask].copy()

print(f"\nTrain: {train.shape[0]} rows | Val: {val.shape[0]} rows | Test: {test.shape[0]} rows")

# 3. Province Percentiles — chỉ từ Train

province_percentiles = {}
for prov in train['province'].unique():
    prov_data = train[train['province'] == prov]['dengue_cases']
    province_percentiles[prov] = {
        'p50': prov_data.quantile(0.50),
        'p85': prov_data.quantile(0.85),
        'p95': prov_data.quantile(0.95)
    }
joblib.dump(province_percentiles, 'models/province_percentiles.pkl')


def get_risk_zone(cases, prov, percentiles_dict):
    if prov not in percentiles_dict:
        return 'Unknown'
    p = percentiles_dict[prov]
    if cases < p['p50']:   return 'Low Risk'
    elif cases < p['p85']: return 'Moderate Risk'
    elif cases < p['p95']: return 'High Risk'
    else:                  return 'Critical Risk'



def smoothed_target_encode(series_train, target_train, series_apply, global_mean, alpha=10):
    """
    Bayesian smoothing: blend province mean với global mean.
    alpha=10 → cần ≥10 mẫu mới tin hoàn toàn vào mean tỉnh.
    """
    stats = target_train.groupby(series_train).agg(['mean', 'count'])
    smooth = (stats['count'] * stats['mean'] + alpha * global_mean) / (stats['count'] + alpha)
    return series_apply.map(smooth).fillna(global_mean)


# 5. Helper: Compute Metrics
def compute_metrics(y_true, y_pred, model_name, horizon):
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    mask = y_true > 0
    mape = mean_absolute_percentage_error(y_true[mask], y_pred[mask]) * 100 if mask.sum() > 0 else np.nan
    return {
        'Horizon': f'h{horizon}',
        'Model':   model_name,
        'MAE':     mean_absolute_error(y_true, y_pred),
        'RMSE':    np.sqrt(mean_squared_error(y_true, y_pred)),
        'R2':      r2_score(y_true, y_pred),
        'MAPE(%)': round(mape, 2)
    }


# ─────────────────────────────────────────────
# 6. Modeling Loop
# ─────────────────────────────────────────────
tscv = TimeSeriesSplit(n_splits=5)

metrics_records = []
xgb_h1_model    = None
xgb_h1_features = None
xgb_h1_X_test   = None

drop_cols = [
    'province', 'year_month',
    'target_h1', 'target_h2', 'target_h3',
    'dengue_cases',
    'temperature', 'humidity', 'rainfall',
]

for h in [1, 2, 3]:
    print(f"\n{'='*50}")
    print(f" Horizon h{h}")
    print(f"{'='*50}")
    target_col  = f'target_h{h}'
    global_mean = train[target_col].mean()

    X_train = train.copy()
    X_val   = val.copy()
    X_test  = test.copy()

    # ── Target Encoding với TimeSeriesSplit OOF ──────────
    X_train['province_target_ưencoded'] = np.nan

    for tr_idx, oof_idx in tscv.split(train):
        fold_train = train.iloc[tr_idx]
        encoded = smoothed_target_encode(
            series_train=fold_train['province'],
            target_train=fold_train[target_col],
            series_apply=train.iloc[oof_idx]['province'],
            global_mean=global_mean
        )
        X_train.iloc[oof_idx, X_train.columns.get_loc('province_target_encoded')] = encoded.values

    X_train['province_target_encoded'].fillna(global_mean, inplace=True)

    X_val['province_target_encoded']  = smoothed_target_encode(
        train['province'], train[target_col], X_val['province'],  global_mean)
    X_test['province_target_encoded'] = smoothed_target_encode(
        train['province'], train[target_col], X_test['province'], global_mean)

    # ── Tách features / targets ──────────────────────────
    y_train = X_train[target_col]
    y_val   = X_val[target_col]
    y_test  = X_test[target_col]

    X_train = X_train.drop(columns=drop_cols)
    X_val   = X_val.drop(columns=drop_cols)
    X_test  = X_test.drop(columns=drop_cols)

    # ── Baseline 0: Naive (carry-forward đúng horizon) ───
    lag_col = f'dengue_lag{h}'
    if lag_col in test.columns:
        naive_preds = test[lag_col].values
    else:
        naive_preds = test['dengue_cases'].shift(h).fillna(test['dengue_cases'].iloc[0]).values
    print(f"  Naive source: '{lag_col if lag_col in test.columns else 'dengue_cases shift'}'")

    # ── Baseline 1: Linear Regression ────────────────────
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    lr_preds = lr.predict(X_test)

    # ── Baseline 2: Random Forest ─────────────────────────
    rf = RandomForestRegressor(
        n_estimators=300,
        max_depth=10,
        min_samples_leaf=5,    
        max_features=0.7,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)

    # XGBoost với Early Stopping
    
    xgb_model = xgb.XGBRegressor(
        n_estimators=1000,        
        max_depth=5,
        learning_rate=0.03,       
        subsample=0.8,
        colsample_bytree=0.7,
        reg_lambda=1.5,
        reg_alpha=0.1,            
        min_child_weight=5,       
        early_stopping_rounds=30,
        random_state=42
    )
    xgb_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],  
        verbose=False
    )
    xgb_preds = xgb_model.predict(X_test)
    print(f"  XGBoost best iteration: {xgb_model.best_iteration}")

    if h == 1:
        xgb_h1_model    = xgb_model
        xgb_h1_features = X_train.columns
        xgb_h1_X_test   = X_test.copy()

    # ── FIX: đóng gói model bundle đầy đủ metadata ───────
    model_bundle = {
        'model':          xgb_model,
        'feature_names':  list(X_train.columns),
        'train_period':   ('2016-01', '2020-12'),
        'val_period':     ('2021-01', '2021-12'),
        'test_period':    ('2022-01', '2022-09'),
        'best_iteration': xgb_model.best_iteration,
        'trained_at':     pd.Timestamp.now().isoformat(),
    }
    joblib.dump(model_bundle, f'models/model_h{h}.pkl')

    # ── Tính metrics cho tất cả models ───────────────────
    models_dict = {
        'Naive':             naive_preds,
        'Linear Regression': lr_preds,
        'Random Forest':     rf_preds,
        'XGBoost':           xgb_preds,
    }

    for model_name, preds in models_dict.items():
        record = compute_metrics(y_test, preds, model_name, h)
        metrics_records.append(record)
        print(f"  {model_name:20s} MAE={record['MAE']:.2f}  RMSE={record['RMSE']:.2f}  R2={record['R2']:.3f}  MAPE={record['MAPE(%)']:.1f}%")

    # ── FIX: Province-level R² để detect tỉnh predict tệ ─
    test_prov_eval = test[['province']].copy()
    test_prov_eval['y_true'] = y_test.values
    test_prov_eval['y_pred'] = xgb_preds

    province_r2 = (
        test_prov_eval
        .groupby('province')
        .apply(lambda g: r2_score(g['y_true'], g['y_pred']) if len(g) > 1 else np.nan)
        .dropna()
        .sort_values()
    )
    province_r2.to_csv(f'reports/province_r2_h{h}.csv', header=['R2'])
    print(f"\n  Top 5 tỉnh predict tệ nhất (h{h}):")
    print(province_r2.head(5).to_string())

# ─────────────────────────────────────────────
# 7. Save & Print Metrics
# ─────────────────────────────────────────────
metrics_df = pd.DataFrame(metrics_records)
print("\n\n--- Model Comparison Matrix ---")
print(metrics_df.to_string(index=False))
metrics_df.to_csv('reports/baseline_model_comparison.csv', index=False)

# ─────────────────────────────────────────────
# 8. XGBoost h1 Feature Importance
# ─────────────────────────────────────────────
importance = xgb_h1_model.feature_importances_
feat_imp = (
    pd.DataFrame({'Feature': xgb_h1_features, 'Importance': importance})
    .sort_values('Importance', ascending=False)
    .head(20)
)
0
expected_features = ['dengue_lag1', 'rainfall_lag2', 'month_cos']
top20_set = set(feat_imp['Feature'].tolist())
missing = [f for f in expected_features if f in xgb_h1_features and f not in top20_set]
if missing:
    print(f"\n[WARN] Feature kỳ vọng không nằm trong Top 20: {missing}")
else:
    print(f"\n[OK] Tất cả feature kỳ vọng đều xuất hiện trong Top 20.")

plt.figure(figsize=(10, 8))
sns.barplot(x='Importance', y='Feature', data=feat_imp, palette='Blues_r')
plt.title('Top 20 Features - XGBoost (h1)')
plt.tight_layout()
plt.savefig('reports/figures/xgb_h1_feature_importance.png', dpi=150)
plt.close()

# ─────────────────────────────────────────────
# 9. Outbreak Classification trên h1 test predictions
# ─────────────────────────────────────────────
test_eval = test[['province', 'year_month', 'target_h1']].copy()
test_eval['predicted_cases']    = xgb_h1_model.predict(xgb_h1_X_test)
test_eval['predicted_risk_zone'] = test_eval.apply(
    lambda row: get_risk_zone(row['predicted_cases'], row['province'], province_percentiles), axis=1
)

# Thêm: actual risk zone để so sánh
test_eval['actual_risk_zone'] = test_eval.apply(
    lambda row: get_risk_zone(row['target_h1'], row['province'], province_percentiles), axis=1
)
risk_accuracy = (test_eval['predicted_risk_zone'] == test_eval['actual_risk_zone']).mean()

print(f"\n--- Risk Zone Classification Preview (Top 5) ---")
print(test_eval[['province', 'year_month', 'predicted_cases', 'predicted_risk_zone', 'actual_risk_zone']].head().to_string(index=False))
print(f"\nRisk Zone Accuracy: {risk_accuracy:.1%}")

test_eval.to_csv('reports/risk_zone_predictions_h1.csv', index=False)

print("\nBaseline modeling completed successfully.")