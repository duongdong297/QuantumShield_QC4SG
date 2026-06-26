import json
import pandas as pd

def export_to_backend_json(inference_result, filepath='artifacts/data.json'):
    cases = inference_result['predicted_cases']
    risk_zone = inference_result['risk_zone']
    region = inference_result['location']
    lat = inference_result['lat']
    lng = inference_result['lng']
    base_date = inference_result['base_date']
    horizon = inference_result['horizon']
    
    # Calculate prediction month
    prediction_month = (pd.to_datetime(base_date) + pd.DateOffset(months=horizon)).strftime('%Y-%m')
    
    # Static mappings for API requirements
    risk_score_map = {'Low Risk': 20, 'Moderate Risk': 60, 'High Risk': 85, 'Critical Risk': 95}
    risk_score = risk_score_map.get(risk_zone, 50)
    
    is_alert = risk_zone in ['High Risk', 'Critical Risk']
    
    payload = {
        "prediction_month": prediction_month,
        "alert": {
            "active": is_alert,
            "region": region,
            "probability": risk_score,
            "message": f"Dengue risk is {risk_zone} based on forecasting models." if is_alert else "Risk is contained."
        },
        "forecast": {
            "beds": int(cases * 0.1),
            "kits": int(cases * 1.5),
            "staffTeams": max(1, int(cases / 100))
        },
        "hotspots": [
            {
                "lat": lat,
                "lng": lng,
                "region": region,
                "riskScore": risk_score
            }
        ]
    }
    
    with open(filepath, 'w') as f:
        json.dump(payload, f, indent=2)
        
    return payload
