import os
import re

def restore_argon(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert my Dark Slate theme back to a balanced Argon theme
    replacements = {
        "'#0f172a'": "'#f8f9fe'",     # Slate 900 -> Argon main bg
        "'#1e293b'": "'#ffffff'",     # Slate 800 -> Cards white
        "'#020617'": "'#11cdef'",     # Slate 950 -> Argon vibrant header blue
        "'#f1f5f9'": "'#32325d'",     # Slate 100 -> Argon dark text
        "'#cbd5e1'": "'#525f7f'",     # Slate 300 -> Argon gray text
        "'#94a3b8'": "'#8898aa'",     # Slate 400 -> Argon light gray text
        "'#334155'": "'#e9ecef'",     # Slate 700 -> Argon borders
    }

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # Also add soft shadows to the white cards to prevent "đau mắt" (harshness)
    # The user complained white cards are harsh, so a subtle shadow and border-radius softens it.
    content = content.replace("borderRadius: '8px',", "borderRadius: '12px', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, 0.15)',")
    content = content.replace("borderRadius: '6px',", "borderRadius: '12px', boxShadow: '0 0 2rem 0 rgba(136, 152, 170, 0.15)',")

    # Fix the critical tags which were '#fef2f2' and now look glaring
    # Let's use Tailwind's softer colors for tags
    content = content.replace("'#fef2f2'", "'#ffe4e6'") # Rose-100
    content = content.replace("'#ffedd5'", "'#ffedd5'") # Orange-100
    content = content.replace("'#fef9c3'", "'#fef9c3'") # Yellow-100

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

restore_argon('d:/Project/QuantumShield/dashboard/src/App.tsx')
restore_argon('d:/Project/QuantumShield/dashboard/src/components/layout/Sidebar.tsx')

print("Argon theme restored and balanced!")
