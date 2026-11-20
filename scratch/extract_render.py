with open(r'c:\ISL Major Project\speech_to_sign.js', 'r', encoding='utf-8') as f:
    text = f.read()

r_start = text.find('render: function () {')
r_end = text.find('  // 8. PLAY KEYFRAME ANIMATION SEQUENCE')

print(f"render span: {r_start} to {r_end} (length: {r_end - r_start})")
with open(r'c:\ISL Major Project\scratch\render_snippet.js', 'w', encoding='utf-8') as f:
    f.write(text[r_start:r_end])
