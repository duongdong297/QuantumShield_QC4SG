import json

def export_to_backend_json(inference_result, filepath='artifacts/data.json'):
    # ponytail: Pure formatter keeping business rules isolated from ML pipeline
    cases = inference_result['predicted_cases']
    risk_zone = inference_result['risk_zone']
    region = inference_result['location']
    lat = inference_result['lat']
    lng = inference_result['lng']
    
    # Static mappings for API requirements
    risk_score_map = {'Low Risk': 20, 'Moderate Risk': 60, 'High Risk': 85, 'Critical Risk': 95}
    risk_score = risk_score_map.get(risk_zone, 50)
    
    is_alert = risk_zone in ['High Risk', 'Critical Risk']
    
    payload = {
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
