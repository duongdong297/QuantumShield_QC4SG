import pandas as pd
import numpy as np
import json
from src.inference.pipeline import run_pipeline
from src.inference.export_dashboard import export_to_backend_json

def generate_mock_history(province="Hanoi", lat=21.0285, lng=105.8542):
    # ponytail: minimal dummy data for any generic unseen location matching schema
    dates = pd.date_range(start="2022-01-01", periods=15, freq="M")
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
    print("--- Generalized Inference Demo ---")
    df = generate_mock_history(province="Da Nang", lat=16.0544, lng=108.2022)
    
    # 1. Pipeline predicts independently
    result = run_pipeline(df, horizon=1)
    print("Raw Inference Result:")
    print(json.dumps(result, indent=2))
    
    # 2. Exporter purely formats to backend API contract
    print("\n--- Exporting to Backend API Contract ---")
    payload = export_to_backend_json(result)
    print(json.dumps(payload, indent=2))
    print("\nValidated export at artifacts/data.json successfully.")

if __name__ == "__main__":
    main()
