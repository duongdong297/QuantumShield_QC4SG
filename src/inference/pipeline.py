import json
from .feature_builder import build_features
from .predict import predict

def get_risk_zone(cases, prov, thresholds):
    if prov not in thresholds: return 'Unknown'
    p = thresholds[prov]
    if cases < p['p50']: return 'Low Risk'
    elif cases < p['p85']: return 'Moderate Risk'
    elif cases < p['p95']: return 'High Risk'
    else: return 'Critical Risk'

def run_pipeline(history_df, horizon=1):
    # ponytail: straightforward 3-step pipeline. No abstractions.
    features = build_features(history_df, horizon)
    pred_cases = predict(features, horizon)
    
    with open('artifacts/risk_thresholds.json') as f:
        thresholds = json.load(f)
        
    prov = history_df['province'].iloc[-1]
    risk = get_risk_zone(pred_cases, prov, thresholds)
    
    return {
        'province': prov,
        'horizon': horizon,
        'predicted_cases': pred_cases,
        'risk_zone': risk
    }
