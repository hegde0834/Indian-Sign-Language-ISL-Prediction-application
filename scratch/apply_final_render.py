with open(r'c:\ISL Major Project\scratch\step2_js.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Read the realistic human render code
with open(r'c:\ISL Major Project\scratch\new_human_render.js', 'r', encoding='utf-8') as f:
    new_render = f.read()

r_start = text.find('render: function () {')
r_end = text.find('  // ---------------------------------------------------------------------------\n  // 8. PLAY KEYFRAME ANIMATION SEQUENCE')

assert r_start != -1 and r_end != -1, "Render section markers not found"
final_text = text[:r_start] + new_render + "\n\n  " + text[r_end:]

with open(r'c:\ISL Major Project\speech_to_sign.js', 'w', encoding='utf-8') as f:
    f.write(final_text)

print("speech_to_sign.js successfully updated with Real Human Video + Realistic Human 3D Avatar! Length:", len(final_text))
