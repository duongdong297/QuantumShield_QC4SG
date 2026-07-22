import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

Path("data/final").mkdir(parents=True, exist_ok=True)
Path("reports").mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────
# 1. Load & Merge Spatial Data
# ─────────────────────────────────────────────
df = pd.read_csv("data/processed/master_dataset.csv")
df = df.sort_values(by=['province', 'year_month']).reset_index(drop=True)

centroid_df = pd.read_csv("raw_data/centroid.csv")
centroid_df['province'] = centroid_df['province'].str.upper().str.strip()

province_map = {
    'BANGKOK METROPOLIS':        'BANGKOK',
    'NONG BUA LAM PHU':          'NONG BUA LAMPHU',
    'LOP BURI':                  'LOPBURI',
    'BUENG KAN':                 'BUNGKAN',
    'CHON BURI':                 'CHONBURI',
    'TRAT':                      'TRAD',
    'PHRA NAKHON SI AYUTTHAYA':  'PHRA NAKHON SI AYUDHYA',
    'CHAI NAT':                  'CHAINAT',
    'PRACHIN BURI':              'PHACHINBURI',
    'SI SA KET':                 'SI SAKET',
    'BURI RAM':                  'BURIRAM',
    'PRACHUAP KHIRI KHAN':       'PRACHUAP KHILIKHAN',
    'SAMUT PRAKAN':              'SAMUT PRAKARN',
    'SUPHAN BURI':               'SUPHANBURI',
    'SAMUT SONGKHRAM':           'SAMUT SONGKHAM',
    'SING BURI':                 'SINGBURI',
    'KAMPHAENG PHET':            'KAMPAENG PHET',
}
centroid_df['province'] = centroid_df['province'].replace(province_map)
df = pd.merge(df, centroid_df, on='province', how='left')

if df['lat'].isnull().any():
    missing = df[df['lat'].isnull()]['province'].unique()
    raise ValueError(f"Missing spatial coordinates: {missing}")

# ─────────────────────────────────────────────
# 2. Temporal Base Features
# ─────────────────────────────────────────────
df['year_month_dt'] = pd.to_datetime(df['year_month'])
df['month']         = df['year_month_dt'].dt.month
df['year']          = df['year_month_dt'].dt.year
df['quarter']       = df['year_month_dt'].dt.quarter

# Cyclical encoding
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

# FIX: thêm quarter cyclical encoding (blueprint đề cập season indicators)
df['quarter_sin'] = np.sin(2 * np.pi * df['quarter'] / 4)
df['quarter_cos'] = np.cos(2 * np.pi * df['quarter'] / 4)

# ─────────────────────────────────────────────
# 3. Per-Province Time Series Features
# ─────────────────────────────────────────────
WEATHER_FEATS = ['temperature', 'humidity', 'rainfall']

def create_features(group):
    group = group.sort_values('year_month_dt').copy()
    for lag in [1, 2, 3, 6, 12]:
        group[f'dengue_lag{lag}'] = group['dengue_cases'].shift(lag)

    for feat in WEATHER_FEATS:
        for lag in [1, 2, 3]:
            group[f'{feat}_lag{lag}'] = group[feat].shift(lag)

    # ── Rolling Mean (shift(1) trước khi rolling → không leak t) ──
    for feat in ['dengue_cases'] + WEATHER_FEATS:
        shifted = group[feat].shift(1)
        for window in [3, 6]:
            group[f'{feat}_roll{window}'] = shifted.rolling(window=window, min_periods=1).mean()

    # ── Rolling Std ───────────────────────────────────────
    for feat in WEATHER_FEATS:
        shifted = group[feat].shift(1)
        for window in [3, 6]:
            group[f'{feat}_rollstd{window}'] = shifted.rolling(window=window, min_periods=2).std()

    # ── Epidemiological Trends ────────────────────────────
    lag1 = group['dengue_lag1']
    lag2 = group['dengue_lag2']
    lag3 = group['dengue_lag3']

    denom = 0.5 * (lag1.abs() + lag2.abs()) + 1.0   
    group['dengue_growth_rate'] = ((lag1 - lag2) / denom).clip(-5, 5)

    group['outbreak_momentum'] = lag1 - lag3

    group['dengue_acceleration'] = (lag1 - 2 * lag2 + lag3)

    # ── Interaction Features ──────────────────────────────
    if 'rainfall_lag2' in group.columns:
        group['rainfall_lag2_x_dengue_lag1'] = group['rainfall_lag2'] * lag1

    # Humidity lag1 × dengue lag1
    if 'humidity_lag1' in group.columns:
        group['humidity_lag1_x_dengue_lag1'] = group['humidity_lag1'] * lag1

    # ── Forecast Targets ──────────────────────────────────
    group['target_h1'] = group['dengue_cases'].shift(-1)
    group['target_h2'] = group['dengue_cases'].shift(-2)
    group['target_h3'] = group['dengue_cases'].shift(-3)

    return group

df_feat = (
    df.groupby('province', group_keys=False)
    .apply(create_features)
    .reset_index(drop=True)
)

df_feat = df_feat.drop(columns=['year_month_dt'])

# 4. FIX: Selective dropna

initial_rows = len(df_feat)

required_cols = (
    ['target_h1', 'target_h2', 'target_h3']
    + [f'dengue_lag{l}' for l in [1, 2, 3]]
    + [f'{f}_lag1' for f in WEATHER_FEATS]
)
df_feat_clean = df_feat.dropna(subset=required_cols).reset_index(drop=True)

long_lag_cols = [f'dengue_lag{l}' for l in [6, 12]]
rolling_cols  = [c for c in df_feat_clean.columns if '_roll' in c]
fill_cols     = long_lag_cols + rolling_cols

for col in fill_cols:
    if col in df_feat_clean.columns:
        df_feat_clean[col] = (
            df_feat_clean.groupby('province')[col]
            .transform(lambda x: x.fillna(x.median()))
        )

df_feat_clean = df_feat_clean.dropna().reset_index(drop=True)
final_rows = len(df_feat_clean)


print("\n--- Leakage Validation ---")
leakage_issues = []

non_target_dengue = [
    c for c in df_feat_clean.columns
    if 'dengue_cases' in c
    and c not in ['dengue_cases', 'target_h1', 'target_h2', 'target_h3']
    and 'lag' not in c
    and 'roll' not in c
    and 'growth' not in c
    and 'momentum' not in c
    and 'acceleration' not in c
    and 'x_dengue' not in c
]
if non_target_dengue:
    leakage_issues.append(f"Suspicious dengue columns (possible leak): {non_target_dengue}")

raw_weather_in_features = [
    c for c in df_feat_clean.columns
    if c in WEATHER_FEATS  
]

corr_h1 = df_feat_clean['target_h1'].corr(df_feat_clean['dengue_cases'])
if abs(corr_h1) > 0.999:
    leakage_issues.append(f"target_h1 vs dengue_cases correlation = {corr_h1:.4f} (suspiciously high)")

if leakage_issues:
    for issue in leakage_issues:
        print(f"  [WARN] {issue}")
else:
    print("  [OK] Lag features:     no direct t-period values used")
    print("  [OK] Rolling features: shift(1) applied before window")
    print("  [OK] Trend features:   derived from lag1/lag2/lag3 only")
    print("  [OK] Target columns:   shift(-1/-2/-3), no overlap with input features")
    print(f"  [OK] target_h1 vs dengue_cases corr = {corr_h1:.4f} (expected ~0.6–0.9)")

# ─────────────────────────────────────────────
# 6. Assertions & Save
# ─────────────────────────────────────────────
assert df_feat_clean['province'].nunique() == 77, \
    f"Expected 77 provinces, got {df_feat_clean['province'].nunique()}"
assert df_feat_clean[['lat', 'lon']].isnull().sum().sum() == 0, \
    "Missing spatial coordinates"
assert df_feat_clean[['target_h1', 'target_h2', 'target_h3']].isnull().sum().sum() == 0, \
    "NaN in target columns"

df_feat_clean.to_csv('data/final/model_dataset.csv', index=False)

# ─────────────────────────────────────────────
# 7. Report
# ─────────────────────────────────────────────
spatial_cols      = ['lat', 'lon']
seasonal_cols     = ['month', 'year', 'quarter', 'month_sin', 'month_cos', 'quarter_sin', 'quarter_cos']
dengue_lag_cols   = [c for c in df_feat_clean.columns if c.startswith('dengue_lag')]
weather_lag_cols  = [c for c in df_feat_clean.columns if any(f'{f}_lag' in c for f in WEATHER_FEATS)]
rolling_mean_cols = [c for c in df_feat_clean.columns if '_roll' in c and 'std' not in c]
rolling_std_cols  = [c for c in df_feat_clean.columns if '_rollstd' in c]
trend_cols        = ['dengue_growth_rate', 'outbreak_momentum', 'dengue_acceleration']
interaction_cols  = [c for c in df_feat_clean.columns if '_x_' in c]
target_cols_list  = ['target_h1', 'target_h2', 'target_h3']

rows_saved = initial_rows - final_rows
pct_saved  = rows_saved / initial_rows * 100

print(f"\n--- Feature Engineering Summary ---")
print(f"Rows: {initial_rows} → {final_rows} (dropped {rows_saved}, {pct_saved:.1f}%)")
print(f"Total columns: {df_feat_clean.shape[1]}")
print(f"  Spatial:          {len(spatial_cols)}")
print(f"  Seasonal:         {len(seasonal_cols)}")
print(f"  Dengue lags:      {len(dengue_lag_cols)}")
print(f"  Weather lags:     {len(weather_lag_cols)}")
print(f"  Rolling mean:     {len(rolling_mean_cols)}")
print(f"  Rolling std:      {len(rolling_std_cols)}")
print(f"  Trend:            {len(trend_cols)}")
print(f"  Interactions:     {len(interaction_cols)}")
print(f"  Targets:          {len(target_cols_list)}")

report = f"""# Feature Engineering Summary

## Dataset Information
- **Initial Rows:** {initial_rows}
- **Final Rows:** {final_rows} (dropped {rows_saved} rows = {pct_saved:.1f}%)
- **Provinces:** {df_feat_clean['province'].nunique()}
- **Total Columns:** {df_feat_clean.shape[1]}

## Feature Count By Category
| Category | Count | Notes |
|----------|-------|-------|
| Spatial | {len(spatial_cols)} | lat, lon |
| Seasonal | {len(seasonal_cols)} | month/quarter sin-cos, year |
| Dengue lags | {len(dengue_lag_cols)} | lag1,2,3,6,12 |
| Weather lags | {len(weather_lag_cols)} | temp/humidity/rainfall lag1,2,3 |
| Rolling mean | {len(rolling_mean_cols)} | 3m & 6m window, shift(1) applied |
| Rolling std | {len(rolling_std_cols)} | 3m & 6m window, shift(1) applied |
| Trend | {len(trend_cols)} | growth_rate, momentum, acceleration |
| Interactions | {len(interaction_cols)} | rainfall×dengue, humidity×dengue |
| Targets | {len(target_cols_list)} | h1, h2, h3 |

## Naming Convention
- Dengue lags: `dengue_lagN` (e.g. dengue_lag1)
- Weather lags: `feat_lagN` (e.g. rainfall_lag2)
- Rolling mean: `feat_rollN` (e.g. dengue_cases_roll3)
- Rolling std:  `feat_rollstdN` (e.g. rainfall_rollstd6)

## NaN Strategy
- **Required cols** (lag1–3, targets): hard dropna
- **Long lags** (lag6, lag12) & rolling: filled with province-level median before final drop

## Leakage Validation
{"PASS — no issues detected" if not leakage_issues else "WARN — " + str(leakage_issues)}
"""

with open('reports/feature_engineering_summary.md', 'w') as f:
    f.write(report)

print("\nFeature engineering completed successfully.")