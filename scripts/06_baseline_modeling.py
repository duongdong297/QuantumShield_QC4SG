import pandas as pd
import numpy as np
import joblib
import xgboost as xgb
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
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

# 1. Dataset Sanity Report
print("--- Dataset Sanity Report ---")
print("Dataset Shape:", df.shape)
target_cols = ['target_h1', 'target_h2', 'target_h3']
print("Features Count:", df.shape[1] - len(target_cols) - 2) # excluding targets, province, year_month

# 2. Chronological Split
# Train: 2015-2020, Val: 2021, Test: 2022
train_mask = (df['year'] <= 2020)
val_mask = (df['year'] == 2021)
test_mask = (df['year'] == 2022)

train = df[train_mask].copy()
val = df[val_mask].copy()
test = df[test_mask].copy()

# 3. Calculate Province Percentiles (Outbreak Classification) using ONLY Train Data
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
    if cases < p['p50']: return 'Low Risk'
    elif cases < p['p85']: return 'Moderate Risk'
    elif cases < p['p95']: return 'High Risk'
    else: return 'Critical Risk'

metrics_records = []
xgb_h1_model = None
xgb_h1_features = None

# Modeling Loop
for h in [1, 2, 3]:
    target_col = f'target_h{h}'
    
    # Simple Mean Target Encoding for province on Train, map to Val/Test to prevent leakage
    prov_mean = train.groupby('province')[target_col].mean()
    
    X_train = train.copy()
    X_val = val.copy()
    X_test = test.copy()
    
    X_train['province_target_encoded'] = X_train['province'].map(prov_mean)
    # Fill any unseen with global train mean
    X_val['province_target_encoded'] = X_val['province'].map(prov_mean).fillna(X_train['province_target_encoded'].mean())
    X_test['province_target_encoded'] = X_test['province'].map(prov_mean).fillna(X_train['province_target_encoded'].mean())
    
    # Drop string variables and targets to isolate features
    drop_cols = ['province', 'year_month', 'target_h1', 'target_h2', 'target_h3']
    
    y_train = X_train[target_col]
    X_train = X_train.drop(columns=drop_cols)
    
    y_val = X_val[target_col]
    X_val = X_val.drop(columns=drop_cols)
    
    y_test = X_test[target_col]
    X_test = X_test.drop(columns=drop_cols)
    
    # Baseline 0: Naive (Carry-forward current dengue_cases)
    naive_preds = X_test['dengue_cases']
    
    # Baseline 1: Linear Regression
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    lr_preds = lr.predict(X_test)
    
    # Baseline 2: Random Forest
    rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    
    # Baseline 3: XGBoost (Champion Candidate)
    xgb_model = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, early_stopping_rounds=10)
    xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    xgb_preds = xgb_model.predict(X_test)
    
    if h == 1:
        xgb_h1_model = xgb_model
        xgb_h1_features = X_train.columns
        
    # Serialize champion (we serialize XGBoost as the MVP core)
    joblib.dump(xgb_model, f'models/model_h{h}.pkl')
    
    # Log Metrics
    models_dict = {
        'Naive': naive_preds,
        'Linear Regression': lr_preds,
        'Random Forest': rf_preds,
        'XGBoost': xgb_preds
    }
    
    for model_name, preds in models_dict.items():
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)
        metrics_records.append({
            'Horizon': f'h{h}',
            'Model': model_name,
            'MAE': mae,
            'RMSE': rmse,
            'R2': r2
        })

# 4. Save & Print Metrics
metrics_df = pd.DataFrame(metrics_records)
print("\n--- Model Comparison Matrix ---")
print(metrics_df.to_string(index=False))
metrics_df.to_csv('reports/baseline_model_comparison.csv', index=False)

# 5. XGBoost h1 Feature Importance
importance = xgb_h1_model.feature_importances_
feat_imp = pd.DataFrame({'Feature': xgb_h1_features, 'Importance': importance})
feat_imp = feat_imp.sort_values(by='Importance', ascending=False).head(20)

plt.figure(figsize=(10, 8))
sns.barplot(x='Importance', y='Feature', data=feat_imp)
plt.title('Top 20 Features - XGBoost (h1)')
plt.tight_layout()
plt.savefig('reports/figures/xgb_h1_feature_importance.png')
plt.close()

# 6. Test the Outbreak Classification Layer on h1 test predictions
test_eval = test[['province', 'year_month', 'target_h1']].copy()
test_eval['predicted_cases'] = xgb_h1_model.predict(X_test)
test_eval['predicted_risk_zone'] = test_eval.apply(lambda row: get_risk_zone(row['predicted_cases'], row['province'], province_percentiles), axis=1)

print("\n--- Risk Zone Classification Preview (Top 5) ---")
print(test_eval[['province', 'year_month', 'predicted_cases', 'predicted_risk_zone']].head().to_string(index=False))

print("\nBaseline modeling completed successfully.")
