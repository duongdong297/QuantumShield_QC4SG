import pandas as pd
import joblib
import json
from pathlib import Path

# ponytail: Minimal manual export script to freeze AI artifacts as requested
Path('artifacts').mkdir(exist_ok=True)

m1 = joblib.load('models/model_h1.pkl')

with open('artifacts/feature_columns.json', 'w') as f:
    json.dump(m1['feature_names'], f, indent=2)

with open('artifacts/model_metadata.json', 'w') as f:
    json.dump({k: v for k, v in m1.items() if k != 'model'}, f, indent=2)

# Compute global fallback for unseen inference locations
risk_thresholds = joblib.load('models/province_percentiles.pkl')
p50_avg = sum(p['p50'] for p in risk_thresholds.values()) / len(risk_thresholds)
p85_avg = sum(p['p85'] for p in risk_thresholds.values()) / len(risk_thresholds)
p95_avg = sum(p['p95'] for p in risk_thresholds.values()) / len(risk_thresholds)
risk_thresholds['__global_fallback__'] = {'p50': p50_avg, 'p85': p85_avg, 'p95': p95_avg}

with open('artifacts/risk_thresholds.json', 'w') as f:
    json.dump(risk_thresholds, f, indent=2)

with open('artifacts/risk_rules.json', 'w') as f:
    json.dump({'p50': 0.50, 'p85': 0.85, 'p95': 0.95}, f, indent=2)

metrics = pd.read_csv('reports/baseline_model_comparison.csv').to_dict(orient='records')
with open('artifacts/metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)

df = pd.read_csv('data/final/model_dataset.csv', nrows=1)
schema = {col: str(dtype) for col, dtype in df.dtypes.items()}
with open('artifacts/feature_schema.json', 'w') as f:
    json.dump(schema, f, indent=2)

print("Artifacts exported to artifacts/ directory successfully.")
