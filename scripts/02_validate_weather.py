# scripts/02_validate_weather.py

from pathlib import Path
import pandas as pd


WEATHER_INPUT = "thailand_weather_2015_2025.csv"
DENGUE_REF = "data/processed/dengue_clean.csv"
OUTPUT_FILE = "data/processed/weather_clean.csv"
REPORT_FILE = "reports/weather_validation_report.md"


PROVINCE_NAME_MAP = {
    "Bangkok Metropolis": "BANGKOK",
    "Bueng Kan": "BUNGKAN",
    "Buri Ram": "BURIRAM",
    "Chai Nat": "CHAINAT",
    "Chon Buri": "CHONBURI",
    "Kamphaeng Phet": "KAMPAENG PHET",
    "Lop Buri": "LOPBURI",
    "Nong Bua Lam Phu": "NONG BUA LAMPHU",
    "Phra Nakhon Si Ayutthaya": "PHRA NAKHON SI AYUDHYA",
    "Prachin Buri": "PHACHINBURI",
    "Prachuap Khiri Khan": "PRACHUAP KHILIKHAN",
    "Roi Et": "ROI ET",
    "Sa Kaeo": "SA KAEO",
    "Samut Prakan": "SAMUT PRAKARN",
    "Samut Songkhram": "SAMUT SONGKHAM",
    "Si Sa Ket": "SI SAKET",
    "Sing Buri": "SINGBURI",
    "Suphan Buri": "SUPHANBURI",
    "Trat": "TRAD",
}

report_lines = []


def report(text=""):
    """Append a line to the report and print it."""
    print(text)
    report_lines.append(text)


report("=" * 60)
report("LOADING DATA")
report("=" * 60)

weather = pd.read_csv(WEATHER_INPUT)
dengue = pd.read_csv(DENGUE_REF)

report(f"Weather raw rows: {len(weather):,}")
report(f"Weather columns: {list(weather.columns)}")
report(f"Dengue reference rows: {len(dengue):,}")
report(f"Dengue provinces: {dengue['province'].nunique()}")
report(f"Dengue year_month range: {dengue['year_month'].min()} to {dengue['year_month'].max()}")


report("")
report("=" * 60)
report("STEP 1: DROP MONTH-13 ROWS")
report("=" * 60)

month13_mask = weather["month"] % 100 == 13
month13_count = month13_mask.sum()
report(f"Month-13 rows found: {month13_count}")

weather = weather[~month13_mask].copy()
report(f"Rows after dropping month-13: {len(weather):,}")


report("")
report("=" * 60)
report("STEP 2: CONVERT DATE FORMAT")
report("=" * 60)

weather["year"] = weather["month"] // 100
weather["month_num"] = weather["month"] % 100
weather["year_month"] = (
    weather["year"].astype(str)
    + "-"
    + weather["month_num"].astype(str).str.zfill(2)
)

report(f"Date format sample: {weather['month'].iloc[0]} -> {weather['year_month'].iloc[0]}")
report(f"Year range: {weather['year'].min()} to {weather['year'].max()}")
report(f"Unique year_month values: {weather['year_month'].nunique()}")

# Drop the original 'month' column and helper columns
weather = weather.drop(columns=["month", "year", "month_num"])



report("")
report("=" * 60)
report("STEP 3: STANDARDIZE PROVINCE NAMES")
report("=" * 60)

# Apply explicit mapping first, then fallback to .upper()
weather["province_original"] = weather["province"].copy()
weather["province"] = weather["province"].map(
    lambda name: PROVINCE_NAME_MAP.get(name, name.upper())
)

mapped_count = weather[
    weather["province"] != weather["province_original"].str.upper()
].shape[0]
report(f"Provinces remapped (beyond simple .upper()): {len(PROVINCE_NAME_MAP)} rules")
report(f"Rows affected by custom mapping: {mapped_count}")


report("")
report("=" * 60)
report("STEP 4: VALIDATE PROVINCE COVERAGE")
report("=" * 60)

weather_provinces = set(weather["province"].unique())
dengue_provinces = set(dengue["province"].unique())

report(f"Weather provinces: {len(weather_provinces)}")
report(f"Dengue provinces: {len(dengue_provinces)}")

in_weather_not_dengue = sorted(weather_provinces - dengue_provinces)
in_dengue_not_weather = sorted(dengue_provinces - weather_provinces)

if len(in_weather_not_dengue) == 0 and len(in_dengue_not_weather) == 0:
    report("PASS: Province sets match exactly.")
else:
    if in_weather_not_dengue:
        report(f"FAIL: In weather but NOT in dengue: {in_weather_not_dengue}")
    if in_dengue_not_weather:
        report(f"FAIL: In dengue but NOT in weather: {in_dengue_not_weather}")


report("")
report("=" * 60)
report("STEP 5: FILTER TO DENGUE TEMPORAL RANGE")
report("=" * 60)

dengue_months = set(dengue["year_month"].unique())
report(f"Dengue unique months: {len(dengue_months)}")
report(f"Dengue range: {min(dengue_months)} to {max(dengue_months)}")

before_filter = len(weather)
weather = weather[weather["year_month"].isin(dengue_months)].copy()
after_filter = len(weather)

report(f"Rows before temporal filter: {before_filter:,}")
report(f"Rows after temporal filter: {after_filter:,}")
report(f"Rows removed: {before_filter - after_filter:,}")


report("")
report("=" * 60)
report("STEP 6: CHECK FOR DUPLICATES")
report("=" * 60)

dup_mask = weather.duplicated(
    subset=["province", "year_month"], keep=False
)
dup_count = dup_mask.sum()

if dup_count == 0:
    report("PASS: No duplicate province-month pairs.")
else:
    report(f"FAIL: {dup_count} duplicate rows found.")
    dup_rows = weather[dup_mask].sort_values(["province", "year_month"])
    report(dup_rows.head(20).to_string(index=False))



report("")
report("=" * 60)
report("STEP 7: CHECK PROVINCE-MONTH COMPLETENESS")
report("=" * 60)

expected = pd.MultiIndex.from_product(
    [sorted(dengue_provinces), sorted(dengue_months)],
    names=["province", "year_month"],
)
actual = pd.MultiIndex.from_frame(
    weather[["province", "year_month"]]
)

missing_pairs = expected.difference(actual)
extra_pairs = actual.difference(expected)

report(f"Expected province-month pairs: {len(expected):,}")
report(f"Actual province-month pairs: {len(actual):,}")
report(f"Missing pairs: {len(missing_pairs)}")
report(f"Extra pairs: {len(extra_pairs)}")

if len(missing_pairs) == 0:
    report("PASS: All expected province-month pairs present.")
else:
    report("FAIL: Missing province-month pairs detected.")
    missing_df = pd.DataFrame(
        missing_pairs.tolist(), columns=["province", "year_month"]
    )
    report(missing_df.to_string(index=False))

report("")
report("=" * 60)
report("STEP 8: CHECK MISSING VALUES")
report("=" * 60)

missing_vals = weather[["temperature", "humidity", "rainfall"]].isnull().sum()
report("Missing values per column:")
for col, count in missing_vals.items():
    status = "PASS" if count == 0 else "FAIL"
    report(f"  {col}: {count} ({status})")


report("")
report("=" * 60)
report("STEP 9: DATA QUALITY - ABNORMAL VALUES")
report("=" * 60)

# Reasonable ranges for Thailand monthly averages
quality_checks = {
    "temperature": {"min": 10.0, "max": 45.0, "unit": "deg C"},
    "humidity": {"min": 0.0, "max": 100.0, "unit": "%"},
    "rainfall": {"min": 0.0, "max": 100.0, "unit": "mm/day"},
}

for col, bounds in quality_checks.items():
    col_data = weather[col]
    below = (col_data < bounds["min"]).sum()
    above = (col_data > bounds["max"]).sum()
    report(f"\n{col} ({bounds['unit']}):")
    report(f"  Range in data: {col_data.min():.2f} to {col_data.max():.2f}")
    report(f"  Expected range: {bounds['min']} to {bounds['max']}")
    report(f"  Below minimum: {below}")
    report(f"  Above maximum: {above}")
    if below == 0 and above == 0:
        report(f"  PASS: All values within expected range.")
    else:
        report(f"  WARNING: {below + above} values outside expected range.")

# Summary statistics
report("\nSummary statistics:")
report(
    weather[["temperature", "humidity", "rainfall"]]
    .describe()
    .to_string()
)


report("")
report("=" * 60)
report("STEP 10: MONTHS PER PROVINCE")
report("=" * 60)

months_per_prov = weather.groupby("province")["year_month"].nunique()
report(f"Expected: 96 months per province")
report(f"Min: {months_per_prov.min()}, Max: {months_per_prov.max()}")

bad_provinces = months_per_prov[months_per_prov != 96]
if len(bad_provinces) == 0:
    report("PASS: Every province has exactly 96 months.")
else:
    report(f"FAIL: {len(bad_provinces)} provinces do not have 96 months.")
    report(bad_provinces.to_string())


report("")
report("=" * 60)
report("SAVING OUTPUTS")
report("=" * 60)

# Select and order final columns
clean = weather[["province", "year_month", "temperature", "humidity", "rainfall"]].copy()
clean = clean.sort_values(["province", "year_month"]).reset_index(drop=True)

# Save cleaned CSV
Path("data/processed").mkdir(parents=True, exist_ok=True)
clean.to_csv(OUTPUT_FILE, index=False)
report(f"Saved: {OUTPUT_FILE}")
report(f"Shape: {clean.shape[0]:,} rows x {clean.shape[1]} columns")


Path("reports").mkdir(parents=True, exist_ok=True)

# Build the markdown report
md_lines = []
md_lines.append("# Weather Dataset Validation Report")
md_lines.append("")
md_lines.append("## Overview")
md_lines.append("")
md_lines.append(f"- **Input file:** `{WEATHER_INPUT}`")
md_lines.append(f"- **Reference file:** `{DENGUE_REF}`")
md_lines.append(f"- **Output file:** `{OUTPUT_FILE}`")
md_lines.append(f"- **Raw rows:** {pd.read_csv(WEATHER_INPUT).shape[0]:,}")
md_lines.append(f"- **Clean rows:** {clean.shape[0]:,}")
md_lines.append(f"- **Provinces:** {clean['province'].nunique()}")
md_lines.append(f"- **Months per province:** {months_per_prov.min()}")
md_lines.append("")
md_lines.append("## Province Name Mapping")
md_lines.append("")
md_lines.append("The following province names required custom mapping beyond simple `.upper()` conversion:")
md_lines.append("")
md_lines.append("| Weather (original) | Dengue (standardized) |")
md_lines.append("|---|---|")
for weather_name, dengue_name in sorted(PROVINCE_NAME_MAP.items()):
    md_lines.append(f"| {weather_name} | {dengue_name} |")
md_lines.append("")
md_lines.append("## Validation Log")
md_lines.append("")
md_lines.append("```")
for line in report_lines:
    md_lines.append(line)
md_lines.append("```")
md_lines.append("")
md_lines.append("## Columns in Output")
md_lines.append("")
md_lines.append("| Column | Type | Description |")
md_lines.append("|---|---|---|")
md_lines.append("| `province` | string | Province name (UPPER CASE, matches dengue dataset) |")
md_lines.append("| `year_month` | string | Month in `YYYY-MM` format |")
md_lines.append("| `temperature` | float | Monthly average temperature (deg C) |")
md_lines.append("| `humidity` | float | Monthly average relative humidity (%) |")
md_lines.append("| `rainfall` | float | Monthly average precipitation (mm/day) |")

with open(REPORT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines) + "\n")

report(f"Saved: {REPORT_FILE}")
report("")
report("Done.")
