# Feature Engineering Summary

## Dataset Information
- **Initial Rows:** 7392
- **Final Rows (after dropping NaNs due to lags/targets):** 6237
- **Total Features Count:** 45

## Feature Count By Category
- **Spatial Features:** 2
- **Seasonal Features:** 4
- **Dengue Lag Features:** 5
- **Weather Lag Features:** 9
- **Rolling Mean Features:** 8
- **Rolling Std Features:** 6
- **Trend Features:** 2
- **Target Columns:** 3

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
