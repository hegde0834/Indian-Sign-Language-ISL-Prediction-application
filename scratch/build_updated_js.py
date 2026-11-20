# Script to generate enhanced speech_to_sign.js with Real Human Video + Realistic Human 3D Avatar
import re

with open(r'c:\ISL Major Project\speech_to_sign.js', 'r', encoding='utf-8') as f:
    orig = f.read()

# Let's inspect where MOTION_DATASET starts and ends
m_start = orig.find('const MOTION_DATASET = [')
m_end = orig.find('  // 2. APPLICATION STATE')

print(f"MOTION_DATASET span: {m_start} to {m_end}")
