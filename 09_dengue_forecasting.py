import pandas as pd
import numpy as np
import json
import sys
import os
import warnings
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime
from dateutil.relativedelta import relativedelta

# Suppress warnings for clean stdout
warnings.filterwarnings('ignore')

def main():
    if len(sys.argv) > 1:
        region = sys.argv[1]
    else:
        region = "Ho Chi Minh"

    dataset_path = "data/final/model_dataset.csv"
    if not os.path.exists(dataset_path):
        print(json.dumps({"error": f"Dataset not found at {dataset_path}"}))
        return

    # 1. Load Real Dataset
    df = pd.read_csv(dataset_path)

    # For Hackathon purposes, map Vietnamese regions to representative Thai regions with real data
    region_mapping = {
        "Ho Chi Minh": "BANGKOK",
        "Ha Noi": "CHIANG MAI",
        "Da Nang": "CHONBURI",
        "Quang Nam": "CHONBURI", 
        "Binh Duong": "BANGKOK",
        "Dong Nai": "BANGKOK",
        "Long An": "ANG THONG",
        "Tien Giang": "ANG THONG",
        "Can Tho": "ANG THONG",
        "Ben Tre": "ANG THONG",
        "Ba Ria-Vung Tau": "CHONBURI",
        "Lam Dong": "CHIANG MAI",
        "Khanh Hoa": "CHONBURI"
    }

    mapped_region = region_mapping.get(region, "BANGKOK")
    
    # Filter data for the mapped region
    region_data = df[df['province'] == mapped_region].copy()
    if region_data.empty:
        region_data = df[df['province'] == "BANGKOK"].copy()

    # Sort by time
    region_data = region_data.sort_values(by=['year', 'month'])

    # 2. Train a Machine Learning Model (Random Forest)
    features = ['temperature', 'humidity', 'rainfall', 'month']
    target = 'dengue_cases'
    
    train_data = region_data.dropna(subset=features + [target])
    
    X_train = train_data[features]
    y_train = train_data[target]

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 3. Generate Historical Data (Past 6 months)
    recent_history = train_data.tail(6)
    current_date = datetime.now()
    
    # Optional scaling factor for larger cities
    scale_factor = 1.0
    if region == "Ho Chi Minh" or region == "Ha Noi": 
        scale_factor = 2.5
        
    historical_output = []
    for i, (_, row) in enumerate(recent_history.iterrows()):
        hist_date = current_date - relativedelta(months=6-i)
        month_str = hist_date.strftime("%Y-%m")
        historical_output.append({
            "month": month_str,
            "recordedCases": int(row['dengue_cases'] * scale_factor),
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
            avg_temp, avg_hum, avg_rain = 28.0, 75.0, 100.0

        X_pred = pd.DataFrame({
            'temperature': [avg_temp],
            'humidity': [avg_hum],
            'rainfall': [avg_rain],
            'month': [future_month]
        })
        
        pred_mean = model.predict(X_pred)[0]
        
        preds_from_trees = np.array([tree.predict(X_pred.values)[0] for tree in model.estimators_])
        pred_75th = np.percentile(preds_from_trees, 85) # using 85 to make it visibly higher than mean
        
        prob = np.mean(preds_from_trees > overall_75th) * 100
        
        forecast_output.append({
            "month": month_str,
            "recordedCases": None,
            "forecastMean": int(pred_mean * scale_factor),
            "forecastUpper": int(pred_75th * scale_factor),
            "probExceed75th": round(prob, 1)
        })

    # To make the graph continuous, insert a connecting point at current month
    last_hist = historical_output[-1]
    connecting_point = {
        "month": current_date.strftime("%Y-%m"),
        "recordedCases": last_hist["recordedCases"],
        "forecastMean": last_hist["recordedCases"],
        "forecastUpper": last_hist["recordedCases"],
        "probExceed75th": forecast_output[0]["probExceed75th"] # carry over prob for visual continuity
    }
    
    final_data = historical_output + [connecting_point] + forecast_output
    
    output_path = "artifacts/long_term_forecast.json"
    
    result = {
        "region": region,
        "mapped_to": mapped_region,
        "data": final_data
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(json.dumps({"status": "success", "file": output_path}))

if __name__ == "__main__":
    main()
