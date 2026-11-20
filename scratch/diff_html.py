with open(r'c:\ISL Major Project\scratch\html_2158.html', 'r', encoding='utf-8') as f:
    old = f.read()

with open(r'c:\ISL Major Project\speech_to_sign.html', 'r', encoding='utf-8') as f:
    new = f.read()

import difflib
diff = list(difflib.unified_diff(old.splitlines(), new.splitlines(), fromfile='old_2158', tofile='current'))
print(f'Diff lines count: {len(diff)}')
for line in diff[:60]:
    print(line)
