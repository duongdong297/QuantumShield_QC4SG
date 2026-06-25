import pandas as pd
import sys

# ponytail: Minimal, production-ready dataset merge without boilerplate.

dengue = pd.read_csv("data/processed/dengue_clean.csv")
weather = pd.read_csv("data/processed/weather_clean.csv")

# Merge
master = pd.merge(dengue, weather, on=["province", "year_month"], how="inner")
master = master[["province", "year_month", "dengue_cases", "temperature", "humidity", "rainfall"]]

# Validation
if len(master) != 7392:
    sys.exit(f"Validation failed: expected 7392 rows, got {len(master)}")

if master.duplicated(subset=["province", "year_month"]).any():
    sys.exit("Validation failed: duplicates found in province/year_month keys")

if master.isnull().any().any():
    sys.exit(f"Validation failed: missing values found\n{master.isnull().sum()}")

provinces = master["province"].nunique()
if provinces != 77:
    sys.exit(f"Validation failed: expected 77 provinces, got {provinces}")

months_per_province = master.groupby("province")["year_month"].nunique()
if (months_per_province != 96).any():
    sys.exit("Validation failed: not all provinces have 96 months")

# Summary
print(f"Validation successful!")
print(f"Rows: {len(master)}, Columns: {len(master.columns)}")
print(f"Provinces: {provinces}")
print(f"Months per province: 96")
print(f"Missing values: 0")

master.to_csv("data/processed/master_dataset.csv", index=False)
print("Saved master dataset to data/processed/master_dataset.csv")
