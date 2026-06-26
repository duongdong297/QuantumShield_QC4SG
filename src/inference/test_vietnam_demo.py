import pandas as pd
import numpy as np
import json
import argparse
from src.inference.pipeline import run_pipeline
from src.inference.export_dashboard import export_to_backend_json

def generate_mock_history(province, lat, lng, base_date):
    # ponytail: minimal dummy data for any generic unseen location matching schema
    end_date = pd.to_datetime(base_date)
    dates = pd.date_range(end=end_date, periods=15, freq="ME")
    df = pd.DataFrame({
        'year_month': dates.strftime('%Y-%m'),
        'province': province,
        'lat': lat,
        'lon': lng,
        'dengue_cases': np.random.randint(50, 500, size=15).astype(float),
        'temperature': np.random.uniform(25, 35, size=15),
        'humidity': np.random.uniform(60, 90, size=15),
        'rainfall': np.random.uniform(0, 200, size=15)
    })
    return df

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--lat', type=float, default=21.0285)
    parser.add_argument('--lng', type=float, default=105.8542)
    parser.add_argument('--date', type=str, default='2022-12-01')
    parser.add_argument('--province', type=str, default='Hanoi')
    args = parser.parse_args()

    print(f"--- Generalized Inference Demo ({args.province}) ---")
    df = generate_mock_history(province=args.province, lat=args.lat, lng=args.lng, base_date=args.date)
    
    # 1. Pipeline predicts independently
    result = run_pipeline(df, base_date=args.date, lat=args.lat, lng=args.lng, horizon=1)
    print("Raw Inference Result:")
    print(json.dumps(result, indent=2))
    
    # 2. Exporter purely formats to backend API contract
    print("\n--- Exporting to Backend API Contract ---")
    payload = export_to_backend_json(result)
    print(json.dumps(payload, indent=2))
    print("\nValidated export at artifacts/data.json successfully.")

if __name__ == "__main__":
    main()
