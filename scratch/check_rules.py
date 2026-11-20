with open(r'c:\ISL Major Project\scratch\real_old_css.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
keywords = ['stage-viewport-container', 'avatarCanvas', 'hud-phrase-banner', 'linguistic-side-card', 'quick-phrases-bar', 's2s-input-deck']
for kw in keywords:
    m = re.search(r'\.' + kw + r'[^\{]*\{[^\}]*\}', text)
    if m:
        print(f'=== {kw} ===\n', m.group(0)[:250], '\n')
    else:
        print(f'=== {kw} NOT FOUND ===')
