import json

with open(r'C:\Users\hegde\.gemini\antigravity\brain\bb93b6b8-ba51-4229-9e97-7287f135f8c6\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('step_index') == 2158:
            for tc in data.get('tool_calls', []):
                if 'speech_to_sign.html' in str(tc.get('args', {}).get('Path', '')):
                    content = tc['args']['Content']
                    with open(r'c:\ISL Major Project\scratch\html_2158.html', 'w', encoding='utf-8') as out:
                        out.write(content)
                    print('Wrote html_2158.html, length:', len(content))
