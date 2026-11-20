with open(r'c:\ISL Major Project\speech_to_sign.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's inspect the dataset items in speech_to_sign.js
import re
print("Length of current speech_to_sign.js:", len(code))
