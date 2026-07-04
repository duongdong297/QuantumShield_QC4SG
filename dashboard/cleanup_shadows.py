import os

filepath = 'd:/Project/QuantumShield/dashboard/src/App.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the injected duplicate boxShadow
content = content.replace("borderRadius: '12px', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, 0.15)',", "borderRadius: '12px',")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Duplicate boxShadows removed!")
