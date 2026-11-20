import re

with open(r'c:\ISL Major Project\speech_to_sign.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open(r'c:\ISL Major Project\scratch\real_old_css.css', 'r', encoding='utf-8') as f:
    css = f.read()

classes_in_html = set(re.findall(r'class=["\']([^"\']+)["\']', html))
all_html_classes = set()
for cstr in classes_in_html:
    for c in cstr.split():
        all_html_classes.add(c)

missing = [c for c in sorted(all_html_classes) if ('.' + c) not in css]
print(f'Total HTML classes: {len(all_html_classes)}')
print(f'Missing in real_old_css: {len(missing)}')
print('Missing:', missing)
