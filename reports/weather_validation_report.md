# Weather Dataset Validation Report

## Overview

- **Input file:** `thailand_weather_2015_2025.csv`
- **Reference file:** `data/processed/dengue_clean.csv`
- **Output file:** `data/processed/weather_clean.csv`
- **Raw rows:** 10,241
- **Clean rows:** 7,392
- **Provinces:** 77
- **Months per province:** 96

## Province Name Mapping

The following province names required custom mapping beyond simple `.upper()` conversion:

| Weather (original) | Dengue (standardized) |
|---|---|
| Bangkok Metropolis | BANGKOK |
| Bueng Kan | BUNGKAN |
| Buri Ram | BURIRAM |
| Chai Nat | CHAINAT |
| Chon Buri | CHONBURI |
| Kamphaeng Phet | KAMPAENG PHET |
| Lop Buri | LOPBURI |
| Nong Bua Lam Phu | NONG BUA LAMPHU |
| Phra Nakhon Si Ayutthaya | PHRA NAKHON SI AYUDHYA |
| Prachin Buri | PHACHINBURI |
| Prachuap Khiri Khan | PRACHUAP KHILIKHAN |
| Roi Et | ROI ET |
| Sa Kaeo | SA KAEO |
| Samut Prakan | SAMUT PRAKARN |
| Samut Songkhram | SAMUT SONGKHAM |
| Si Sa Ket | SI SAKET |
| Sing Buri | SINGBURI |
| Suphan Buri | SUPHANBURI |
| Trat | TRAD |

## Validation Log

```
============================================================
LOADING DATA
============================================================
Weather raw rows: 10,241
Weather columns: ['province', 'month', 'temperature', 'humidity', 'rainfall']
Dengue reference rows: 7,392
Dengue provinces: 77
Dengue year_month range: 2015-01 to 2022-12

============================================================
STEP 1: DROP MONTH-13 ROWS
============================================================
Month-13 rows found: 770
Rows after dropping month-13: 9,471

============================================================
STEP 2: CONVERT DATE FORMAT
============================================================
Date format sample: 201501 -> 2015-01
Year range: 2015 to 2025
Unique year_month values: 123

============================================================
STEP 3: STANDARDIZE PROVINCE NAMES
============================================================
Provinces remapped (beyond simple .upper()): 19 rules
Rows affected by custom mapping: 2091

============================================================
STEP 4: VALIDATE PROVINCE COVERAGE
============================================================
Weather provinces: 77
Dengue provinces: 77
PASS: Province sets match exactly.

============================================================
STEP 5: FILTER TO DENGUE TEMPORAL RANGE
============================================================
Dengue unique months: 96
Dengue range: 2015-01 to 2022-12
Rows before temporal filter: 9,471
Rows after temporal filter: 7,392
Rows removed: 2,079

============================================================
STEP 6: CHECK FOR DUPLICATES
============================================================
PASS: No duplicate province-month pairs.

============================================================
STEP 7: CHECK PROVINCE-MONTH COMPLETENESS
============================================================
Expected province-month pairs: 7,392
Actual province-month pairs: 7,392
Missing pairs: 0
Extra pairs: 0
PASS: All expected province-month pairs present.

============================================================
STEP 8: CHECK MISSING VALUES
============================================================
Missing values per column:
  temperature: 0 (PASS)
  humidity: 0 (PASS)
  rainfall: 0 (PASS)

============================================================
STEP 9: DATA QUALITY - ABNORMAL VALUES
============================================================

temperature (deg C):
  Range in data: 17.31 to 34.92
  Expected range: 10.0 to 45.0
  Below minimum: 0
  Above maximum: 0
  PASS: All values within expected range.

humidity (%):
  Range in data: 37.45 to 93.58
  Expected range: 0.0 to 100.0
  Below minimum: 0
  Above maximum: 0
  PASS: All values within expected range.

rainfall (mm/day):
  Range in data: 0.00 to 33.49
  Expected range: 0.0 to 100.0
  Below minimum: 0
  Above maximum: 0
  PASS: All values within expected range.

Summary statistics:
       temperature     humidity     rainfall
count  7392.000000  7392.000000  7392.000000
mean     26.402120    76.878475     4.720697
std       2.521402    11.842415     4.347564
min      17.310000    37.450000     0.000000
25%      25.190000    69.780000     0.950000
50%      26.580000    81.200000     3.915000
75%      27.800000    85.832500     7.270000
max      34.920000    93.580000    33.490000

============================================================
STEP 10: MONTHS PER PROVINCE
============================================================
Expected: 96 months per province
Min: 96, Max: 96
PASS: Every province has exactly 96 months.

============================================================
SAVING OUTPUTS
============================================================
Saved: data/processed/weather_clean.csv
Shape: 7,392 rows x 5 columns
```

## Columns in Output

| Column | Type | Description |
|---|---|---|
| `province` | string | Province name (UPPER CASE, matches dengue dataset) |
| `year_month` | string | Month in `YYYY-MM` format |
| `temperature` | float | Monthly average temperature (deg C) |
| `humidity` | float | Monthly average relative humidity (%) |
| `rainfall` | float | Monthly average precipitation (mm/day) |
