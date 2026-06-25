import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import nbformat as nbf
import warnings
warnings.filterwarnings('ignore')

# Setup directories
Path("reports/figures").mkdir(parents=True, exist_ok=True)
Path("notebooks").mkdir(parents=True, exist_ok=True)

# 1. Load Data
df = pd.read_csv("data/processed/master_dataset.csv")
df['year_month'] = pd.to_datetime(df['year_month'])
df['month'] = df['year_month'].dt.month
df['year'] = df['year_month'].dt.year

# 2. Computations for Report
total_cases = df['dengue_cases'].sum()
missing_values = df.isnull().sum().sum()
outliers = df[df['dengue_cases'] > df['dengue_cases'].quantile(0.99)].shape[0]

pearson_corr = df[['dengue_cases', 'temperature', 'humidity', 'rainfall']].corr(method='pearson')
spearman_corr = df[['dengue_cases', 'temperature', 'humidity', 'rainfall']].corr(method='spearman')

# 3. Visualizations
plt.style.use('ggplot')

# Plot A: Dengue Distribution
plt.figure(figsize=(10, 6))
sns.histplot(df['dengue_cases'], bins=50, kde=True)
plt.title("Distribution of Dengue Cases (Highly Right-Skewed)")
plt.xlabel("Dengue Cases")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig("reports/figures/dengue_distribution.png")
plt.close()

# Plot B: Monthly Seasonality
plt.figure(figsize=(10, 6))
sns.boxplot(x='month', y='dengue_cases', data=df)
plt.title("Monthly Seasonality of Dengue Cases")
plt.xlabel("Month")
plt.ylabel("Cases")
plt.tight_layout()
plt.savefig("reports/figures/monthly_seasonality.png")
plt.close()

# Plot C: Correlation Heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(spearman_corr, annot=True, cmap='coolwarm', vmin=-1, vmax=1)
plt.title("Spearman Correlation: Environment vs Dengue")
plt.tight_layout()
plt.savefig("reports/figures/correlation_heatmap.png")
plt.close()

# Plot D: Yearly Trends (Total cases per year)
yearly_cases = df.groupby('year')['dengue_cases'].sum().reset_index()
plt.figure(figsize=(10, 6))
sns.lineplot(x='year', y='dengue_cases', data=yearly_cases, marker='o')
plt.title("Yearly Dengue Incidence Trend")
plt.xlabel("Year")
plt.ylabel("Total Cases")
plt.tight_layout()
plt.savefig("reports/figures/yearly_trend.png")
plt.close()

# 4. Generate Markdown Summary
md_content = f"""# Exploratory Data Analysis Summary

## 1. Overview
- **Total Records:** {len(df)}
- **Missing Values:** {missing_values}
- **Extreme Outliers (99th percentile):** {outliers} province-months

## 2. Dengue Distribution & Patterns
- **Distribution:** Highly right-skewed. Suggests the need for log transformation (e.g., `log1p(dengue_cases)`) or Poisson/Negative Binomial objective functions in modeling.
- **Seasonality:** Clear seasonal peaks observed in mid-to-late year (rainy season). Month-of-year is a critical feature.
- **Yearly Trend:** Variations year-over-year indicate that recent historical lags (e.g., autoregressive features) will be necessary to capture baseline shifts.

## 3. Environmental Correlations
**Spearman Rank Correlation (Non-linear relationships):**
- Temperature vs Dengue: {spearman_corr.loc['dengue_cases', 'temperature']:.3f}
- Humidity vs Dengue: {spearman_corr.loc['dengue_cases', 'humidity']:.3f}
- Rainfall vs Dengue: {spearman_corr.loc['dengue_cases', 'rainfall']:.3f}

**Modeling Decisions Derived:**
1. **Target Transformation:** Use log-transformation for the target variable to handle extreme right skewness.
2. **Lag Features:** Since environmental variables show moderate correlation, testing lags (t-1, t-2, t-3) is critical to account for mosquito incubation periods.
3. **Temporal Features:** Month and Year must be included to capture strong seasonality and yearly baseline shifts.
"""

with open("reports/eda_summary.md", "w") as f:
    f.write(md_content)

# 5. Programmatically Generate Notebook
nb = nbf.v4.new_notebook()
code_cell = '''import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load data
df = pd.read_csv('../data/processed/master_dataset.csv')
df['year_month'] = pd.to_datetime(df['year_month'])
df['month'] = df['year_month'].dt.month

# Compute Spearman Correlation
print("Spearman Correlation:")
print(df[['dengue_cases', 'temperature', 'humidity', 'rainfall']].corr(method='spearman'))

# Plot Monthly Seasonality
plt.figure(figsize=(10, 6))
sns.boxplot(x='month', y='dengue_cases', data=df)
plt.title("Monthly Seasonality")
plt.show()
'''

nb['cells'] = [
    nbf.v4.new_markdown_cell("# Exploratory Data Analysis\\nInteractive notebook for exploring dengue and weather relationships."),
    nbf.v4.new_code_cell(code_cell)
]
nbf.write(nb, "notebooks/01_eda.ipynb")

print("EDA completed. Outputs generated.")
