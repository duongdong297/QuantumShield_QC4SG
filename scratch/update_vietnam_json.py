import json
import re

def remove_accents(input_str):
    if not isinstance(input_str, str):
        return input_str
    s = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', input_str)
    s = re.sub(r'[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]', 'A', s)
    s = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', s)
    s = re.sub(r'[ÈÉẸẺẼÊỀẾỆỂỄ]', 'E', s)
    s = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', s)
    s = re.sub(r'[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]', 'O', s)
    s = re.sub(r'[ìíịỉĩ]', 'i', s)
    s = re.sub(r'[ÌÍỊỈĨ]', 'I', s)
    s = re.sub(r'[ùúụủũưừứựửữ]', 'u', s)
    s = re.sub(r'[ÙÚỤỦŨƯỪỨỰỬỮ]', 'U', s)
    s = re.sub(r'[ỳýỵỷỹ]', 'y', s)
    s = re.sub(r'[ỲÝỴỶỸ]', 'Y', s)
    s = re.sub(r'[Đ]', 'D', s)
    s = re.sub(r'[đ]', 'd', s)
    return s

filepath = r'd:\Project\QuantumShield\dashboard\public\vietnam.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for f in data.get('features', []):
    props = f.get('properties', {})
    if 'Name' in props:
        props['Name'] = remove_accents(props['Name'])
    if 'name' in props:
        props['name'] = remove_accents(props['name'])

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)

print("vietnam.json updated")
