import os

filepath = 'd:/Project/QuantumShield/dashboard/src/App.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change the chart background from cyan (#11cdef) to Dark Navy (#172b4d)
content = content.replace("backgroundColor: '#11cdef', // Dark Navy", "backgroundColor: '#172b4d',")

# 2. Change pure white (#ffffff) to a soft neutral gray-slate (#f1f5f9) to avoid glaring brightness
content = content.replace("'#ffffff'", "'#f1f5f9'")

# 3. Sidebar also uses #ffffff, so it becomes #f1f5f9 as well, which is softer.
# We also update Sidebar.tsx
sidebar_path = 'd:/Project/QuantumShield/dashboard/src/components/layout/Sidebar.tsx'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    sb_content = f.read()
sb_content = sb_content.replace("'#ffffff'", "'#f1f5f9'")
with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(sb_content)

# 4. If the main background is #f8f9fe, we can make it slightly darker so cards pop out
content = content.replace("'#f8f9fe'", "'#e2e8f0'")

# 5. Fix the text color inside the chart since it might have been #ffffff and now is #f1f5f9, which is fine (soft white text).

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Colors softened!")
