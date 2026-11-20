with open(r'c:\ISL Major Project\scratch\step2_js.js', 'r', encoding='utf-8') as f:
    text = f.read()

r_start = text.find('render: function () {')
r_end = text.find('  // ---------------------------------------------------------------------------\n  // 8. PLAY KEYFRAME ANIMATION SEQUENCE')

print(f"render section start: {r_start}, end: {r_end}")
