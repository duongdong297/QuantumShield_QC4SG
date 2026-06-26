import json
from .feature_builder import build_features
from .predict import predict

def get_risk_zone(cases, prov, thresholds):
    # ponytail: country-agnostic fallback using precomputed __global_fallback__
    p = thresholds.get(prov, thresholds.get('__global_fallback__'))
    if not p: return 'Unknown'
    
    if cases < p['p50']: return 'Low Risk'
    elif cases < p['p85']: return 'Moderate Risk'
    elif cases < p['p95']: return 'High Risk'
    else: return 'Critical Risk'

def run_pipeline(history_df, horizon=1):
    # ponytail: straightforward pipeline returning enriched context
    features = build_features(history_df, horizon)
    pred_cases = predict(features, horizon)
    
    with open('artifacts/risk_thresholds.json') as f:
        thresholds = json.load(f)
        
    prov = history_df['province'].iloc[-1]
    lat = history_df['lat'].iloc[-1]
    lng = history_df['lon'].iloc[-1]
    
    risk = get_risk_zone(pred_cases, prov, thresholds)
    
    return {
        'location': prov,
        'lat': float(lat),
        'lng': float(lng),
        'horizon': horizon,
        'predicted_cases': float(pred_cases),
        'risk_zone': risk
    }
