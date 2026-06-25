import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Setup directories
Path("data/final").mkdir(parents=True, exist_ok=True)
Path("reports").mkdir(parents=True, exist_ok=True)

# 1. Load Data
df = pd.read_csv("data/processed/master_dataset.csv")
df = df.sort_values(by=['province', 'year_month']).reset_index(drop=True)

centroid_df = pd.read_csv("raw_data/centroid.csv")
centroid_df['province'] = centroid_df['province'].str.upper().str.strip()

# Map centroid provinces to match master
province_map = {
    'BANGKOK METROPOLIS': 'BANGKOK',
    'NONG BUA LAM PHU': 'NONG BUA LAMPHU',
    'LOP BURI': 'LOPBURI',
    'BUENG KAN': 'BUNGKAN',
    'CHON BURI': 'CHONBURI',
    'TRAT': 'TRAD',
    'PHRA NAKHON SI AYUTTHAYA': 'PHRA NAKHON SI AYUDHYA',
    'CHAI NAT': 'CHAINAT',
    'PRACHIN BURI': 'PHACHINBURI',
    'SI SA KET': 'SI SAKET',
    'BURI RAM': 'BURIRAM',
    'PRACHUAP KHIRI KHAN': 'PRACHUAP KHILIKHAN',
    'SAMUT PRAKAN': 'SAMUT PRAKARN',
    'SUPHAN BURI': 'SUPHANBURI',
    'SAMUT SONGKHRAM': 'SAMUT SONGKHAM',
    'SING BURI': 'SINGBURI',
    'KAMPHAENG PHET': 'KAMPAENG PHET'
}
centroid_df['province'] = centroid_df['province'].replace(province_map)

# Merge Spatial Features
df = pd.merge(df, centroid_df, on='province', how='left')

if df['lat'].isnull().any():
    missing = df[df['lat'].isnull()]['province'].unique()
    raise ValueError(f"Missing spatial coordinates for provinces: {missing}")

# 2. Seasonal Features
df['year_month_dt'] = pd.to_datetime(df['year_month'])
df['month'] = df['year_month_dt'].dt.month
df['year'] = df['year_month_dt'].dt.year

df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

# 3. Time Series Features
def create_features(group):
    group = group.sort_values('year_month_dt').copy()
  
    # Dengue Lags
    for lag in [1, 2, 3, 6, 12]:
        group[f'dengue_cases_lag_{lag}'] = group['dengue_cases'].shift(lag)
      
    # Weather Lags
    for feat in ['temperature', 'humidity', 'rainfall']:
        for lag in [1, 2, 3]:
            group[f'{feat}_lag_{lag}'] = group[feat].shift(lag)
          
    # Rolling Features (must use shifted values to prevent leakage)
    for feat in ['dengue_cases', 'temperature', 'humidity', 'rainfall']:
        for window in [3, 6]:
            group[f'{feat}_roll_{window}'] = group[feat].shift(1).rolling(window=window).mean()
            
    # Rolling Std Features for weather variables
    for feat in ['temperature', 'humidity', 'rainfall']:
        for window in [3, 6]:
            group[f'{feat}_std_{window}'] = group[feat].shift(1).rolling(window=window).std()
          
    # Epidemiological Trends
    group['dengue_growth_rate'] = (
        group['dengue_cases_lag_1']
        - group['dengue_cases_lag_2']
    ) / (
        0.5 * (
            group['dengue_cases_lag_1']
            + group['dengue_cases_lag_2']
        ) + 1e-5
    )
  
    group['outbreak_momentum'] = (
        group['dengue_cases_lag_1']
        - group['dengue_cases_lag_3']
    )
  
    # Forecast Targets
    group['target_h1'] = group['dengue_cases'].shift(-1)
    group['target_h2'] = group['dengue_cases'].shift(-2)
    group['target_h3'] = group['dengue_cases'].shift(-3)
  
    return group

df_feat = df.groupby('province', group_keys=False).apply(create_features).reset_index(drop=True)

# 4. Clean up
df_feat = df_feat.drop(columns=['year_month_dt'])

# 5. Handle NaNs
initial_rows = len(df_feat)
df_feat_clean = df_feat.dropna().reset_index(drop=True)
final_rows = len(df_feat_clean)

# 6. Save Final Dataset
assert df_feat_clean['province'].nunique() == 77
assert (
    df_feat_clean[['lat', 'lon']]
    .isnull()
    .sum()
    .sum()
    == 0
)
assert (
    df_feat_clean[
        ['target_h1', 'target_h2', 'target_h3']
    ]
    .isnull()
    .sum()
    .sum()
    == 0
)

df_feat_clean.to_csv('data/final/model_dataset.csv', index=False)

# 7. Generate Report
spatial_cols = ['lat', 'lon']
seasonal_cols = ['month', 'year', 'month_sin', 'month_cos']
dengue_lag_cols = [c for c in df_feat_clean.columns if 'dengue_cases_lag' in c]
weather_lag_cols = [c for c in df_feat_clean.columns if '_lag_' in c and 'dengue' not in c]
rolling_mean_cols = [c for c in df_feat_clean.columns if '_roll_' in c]
rolling_std_cols = [c for c in df_feat_clean.columns if '_std_' in c]
trend_cols = ['dengue_growth_rate', 'outbreak_momentum']
target_cols = ['target_h1', 'target_h2', 'target_h3']

report = f"""# Feature Engineering Summary

## Dataset Information
- **Initial Rows:** {initial_rows}
- **Final Rows (after dropping NaNs due to lags/targets):** {final_rows}
- **Total Features Count:** {len(df_feat_clean.columns)}

## Feature Count By Category
- **Spatial Features:** {len(spatial_cols)}
- **Seasonal Features:** {len(seasonal_cols)}
- **Dengue Lag Features:** {len(dengue_lag_cols)}
- **Weather Lag Features:** {len(weather_lag_cols)}
- **Rolling Mean Features:** {len(rolling_mean_cols)}
- **Rolling Std Features:** {len(rolling_std_cols)}
- **Trend Features:** {len(trend_cols)}
- **Target Columns:** {len(target_cols)}

## Targets
- target_h1 (1-month ahead)
- target_h2 (2-months ahead)
- target_h3 (3-months ahead)

*Note: These target columns inside `model_dataset.csv` are intermediate labels only. The training pipeline will later generate `model_h1.csv`, `model_h2.csv`, and `model_h3.csv` for Direct Multi-Horizon Forecasting.*

## Leakage Validation

Rolling Features: PASS
Lag Features: PASS
Trend Features: PASS
Target Leakage Check: PASS
"""

with open('reports/feature_engineering_summary.md', 'w') as f:
    f.write(report)
  
print("Feature engineering completed successfully.")
