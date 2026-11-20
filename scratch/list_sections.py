with open(r'c:\ISL Major Project\scratch\html_2158.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
sections = re.findall(r'<section[^>]*class=["\']([^"\']+)["\'][^>]*>', text)
print('Sections in html_2158:', sections)
