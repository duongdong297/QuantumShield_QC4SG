import json
import re

filepath = r'd:\Project\QuantumShield\dashboard\public\vietnam.json'
try:
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    names = []
    for f in data.get('features', []):
        props = f.get('properties', {})
        name = props.get('Name') or props.get('name')
        if name:
            names.append(name)
    
    print("Found names:", names[:10])
except Exception as e:
    print("Error:", e)
