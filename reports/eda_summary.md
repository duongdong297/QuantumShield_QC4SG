# Exploratory Data Analysis Summary

## 1. Overview
- **Total Records:** 7392
- **Missing Values:** 0
- **Extreme Outliers (99th percentile):** 74 province-months

## 2. Dengue Distribution & Patterns
- **Distribution:** Highly right-skewed. Suggests the need for log transformation (e.g., `log1p(dengue_cases)`) or Poisson/Negative Binomial objective functions in modeling.
- **Seasonality:** Clear seasonal peaks observed in mid-to-late year (rainy season). Month-of-year is a critical feature.
- **Yearly Trend:** Variations year-over-year indicate that recent historical lags (e.g., autoregressive features) will be necessary to capture baseline shifts.

## 3. Environmental Correlations
**Spearman Rank Correlation (Non-linear relationships):**
- Temperature vs Dengue: 0.131
- Humidity vs Dengue: 0.188
- Rainfall vs Dengue: 0.241

**Modeling Decisions Derived:**
1. **Target Transformation:** Use log-transformation for the target variable to handle extreme right skewness.
2. **Lag Features:** Since environmental variables show moderate correlation, testing lags (t-1, t-2, t-3) is critical to account for mosquito incubation periods.
3. **Temporal Features:** Month and Year must be included to capture strong seasonality and yearly baseline shifts.
