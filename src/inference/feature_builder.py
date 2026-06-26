import pandas as pd
import numpy as np
import json
import joblib

def build_features(history_df: pd.DataFrame, horizon: int = 1) -> pd.DataFrame:
    df = history_df.sort_values('year_month').copy()
    
    # 1. Temporal
    df['year_month_dt'] = pd.to_datetime(df['year_month'])
    df['month'] = df['year_month_dt'].dt.month
    df['year'] = df['year_month_dt'].dt.year
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
    
    # 2. Lags & Rolling
    weather_feats = ['temperature', 'humidity', 'rainfall']
    for lag in [1, 2, 3, 6, 12]:
        df[f'dengue_lag{lag}'] = df['dengue_cases'].shift(lag)
        
    for feat in weather_feats:
        for lag in [1, 2, 3]:
            df[f'{feat}_lag{lag}'] = df[feat].shift(lag)
            
    for feat in ['dengue_cases'] + weather_feats:
        shifted = df[feat].shift(1)
        for w in [3, 6]:
            df[f'{feat}_roll{w}'] = shifted.rolling(w, min_periods=1).mean()
            
    # 3. Trends
    lag1 = df['dengue_lag1']
    lag2 = df['dengue_lag2']
    lag3 = df['dengue_lag3']
    
    denom = 0.5 * (lag1.abs() + lag2.abs()) + 1.0   
    df['dengue_growth_rate'] = ((lag1 - lag2) / denom).clip(-5, 5)
    df['outbreak_momentum'] = lag1 - lag3
    df['dengue_acceleration'] = (lag1 - 2 * lag2 + lag3)

    # 4. Target Encoding from serialized model bundle
    bundle = joblib.load(f'models/model_h{horizon}.pkl')
    encoding_map = bundle['target_encoding']
    global_mean = encoding_map.get('__global_mean__', 0.0)
    
    df['province_target_encoded'] = df['province'].map(encoding_map).fillna(global_mean)

    # Extract latest row for inference
    latest = df.iloc[[-1]].copy()
    
    # 5. Column ordering & completeness validation
    with open('artifacts/feature_columns.json') as f:
        cols = json.load(f)
    
    for c in cols:
        if c not in latest.columns:
            latest[c] = 0.0
            
    return latest[cols]
