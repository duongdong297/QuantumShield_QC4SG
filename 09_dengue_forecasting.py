import pandas as pd
import numpy as np
import json
import sys
import os
import warnings
import unicodedata
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime
from dateutil.relativedelta import relativedelta

# Suppress warnings for clean stdout
warnings.filterwarnings('ignore')

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return u"".join([c for c in nfkd_form if not unicodedata.combining(c)]).lower()

def main():
    if len(sys.argv) > 1:
        region_raw = sys.argv[1]
    else:
        region_raw = "Ha Noi"

    dataset_path = "data/final/real_vietnam_dataset.csv"
    if not os.path.exists(dataset_path):
        print(json.dumps({"error": f"Dataset not found at {dataset_path}"}))
        return

    # 1. Load Real Dataset
    df = pd.read_csv(dataset_path)

    # Normalize requested region
    normalized_region = remove_accents(region_raw)
    
    # Map back to exactly what is in the CSV
    csv_mapping = {
        "ha noi": "Ha Noi",
        "dak lak": "Dak Lak",
        "khanh hoa": "Khanh Hoa",
        "dong nai": "Dong Nai"
    }

    mapped_region = csv_mapping.get(normalized_region, None)

    if not mapped_region:
        print(json.dumps({"error": f"Chưa có dữ liệu thực tế cho tỉnh/thành này. Vui lòng chọn Hà Nội, Đắk Lắk, Khánh Hòa, hoặc Đồng Nai."}))
        return

    # Filter data for the mapped region
    region_data = df[df['region'] == mapped_region].copy()
    if region_data.empty:
        print(json.dumps({"error": f"Không có dữ liệu lịch sử cho {mapped_region}"}))
        return

    # Sort by time
    region_data = region_data.sort_values(by=['year', 'month'])

    # 2. Train a Machine Learning Model (Random Forest)
    features = ['temperature', 'humidity', 'rainfall']
    target = 'dengue_cases'
    
    train_data = region_data.dropna(subset=features + [target])
    
    if len(train_data) < 10:
         print(json.dumps({"error": f"Không đủ dữ liệu cho {mapped_region} để huấn luyện mô hình."}))
         return

    X_train = train_data[features]
    y_train = train_data[target]

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 3. Generate Historical Data (Past 6 months)
    recent_history = train_data.tail(6)
    current_date = datetime.now()
        
    historical_output = []
    for i, (_, row) in enumerate(recent_history.iterrows()):
        hist_date = current_date - relativedelta(months=6-i)
        month_str = hist_date.strftime("%Y-%m")
        historical_output.append({
            "month": month_str,
            "recordedCases": int(row['dengue_cases']),
            "forecastMean": None,
            "forecastUpper": None,
            "probExceed75th": None
        })

    # 4. Forecast Future Data (Next 6 months)
    forecast_output = []
    overall_75th = np.percentile(y_train, 75)

    for i in range(1, 7):
        future_date = current_date + relativedelta(months=i)
        future_month = future_date.month
        month_str = future_date.strftime("%Y-%m")
        
        # Average weather for this month historically
        month_hist = train_data[train_data['month'] == future_month]
        if not month_hist.empty:
            avg_temp = month_hist['temperature'].mean()
            avg_hum = month_hist['humidity'].mean()
            avg_rain = month_hist['rainfall'].mean()
        else:
            avg_temp = train_data['temperature'].mean()
            avg_hum = train_data['humidity'].mean()
            avg_rain = train_data['rainfall'].mean()

        # Add some random noise for realism
        temp_val = avg_temp + np.random.normal(0, 0.5)
        hum_val = avg_hum + np.random.normal(0, 2)
        rain_val = max(0, avg_rain + np.random.normal(0, 10))

        X_future = pd.DataFrame([[temp_val, hum_val, rain_val]], columns=features)
        
        # Extract predictions from all trees to get distribution
        tree_preds = [tree.predict(X_future.values)[0] for tree in model.estimators_]
        
        mean_pred = np.mean(tree_preds)
        std_pred = np.std(tree_preds)
        
        upper_bound = np.percentile(tree_preds, 75)
        
        # Calculate probability of exceeding the overall historical 75th percentile
        prob_exceed = sum(1 for p in tree_preds if p > overall_75th) / len(tree_preds)

        forecast_output.append({
            "month": month_str,
            "recordedCases": None,
            "forecastMean": max(0, int(mean_pred)),
            "forecastUpper": max(0, int(upper_bound)),
            "probExceed75th": round(prob_exceed * 100, 1)
        })

    # 5. Combine and Output JSON
    final_output = historical_output + forecast_output
    
    # Write to a JSON file (the Go backend will read this or stdout)
    os.makedirs("artifacts", exist_ok=True)
    with open("artifacts/long_term_forecast.json", "w") as f:
        json.dump(final_output, f)
        
    print(json.dumps(final_output))

if __name__ == "__main__":
    main()
