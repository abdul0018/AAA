"""Flat house-style SVG props for the IELTS reel (no-credit fallback of explainer-reel/references/illustrations.md).
Palette: cream #F2F0EA paper, warm greys, khaki/tan, accent yellow #FFCC40, red #FF4D4D. No outlines, soft 2-tone shading."""
import os
os.makedirs('public/img', exist_ok=True)
H = "font-family:'Inter Display','Inter',sans-serif;font-weight:800"
M = "font-family:'DejaVu Sans Mono',monospace;font-weight:700"
def save(name, w, h, body):
    open(f'public/img/{name}.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>')

def paper(x, y, w, h, r=14, c='#F2F0EA', sh='#D8D3C6'):
    return f'<rect x="{x+8}" y="{y+10}" width="{w}" height="{h}" rx="{r}" fill="rgba(0,0,0,0.28)"/><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{c}"/><rect x="{x}" y="{y+h-18}" width="{w}" height="18" rx="{r}" fill="{sh}" opacity="0.6"/>'

for v in ['8.0', '7.5']:
    save('score' + v.replace('.', ''), 560, 420, paper(10, 10, 530, 390, 26, '#FFCC40', '#E0A92A') +
         f'<text x="275" y="300" text-anchor="middle" style="{H};font-size:250px;letter-spacing:-8px" fill="#1F2121">{v}</text>')

bars = ''.join(f'<rect x="{40+i*120}" y="{360-h}" width="84" height="{h}" rx="8" fill="{c}"/><rect x="{40+i*120}" y="{360-h}" width="30" height="{h}" rx="8" fill="rgba(255,255,255,0.18)"/>'
               for i, (h, c) in enumerate([(120, '#8E9196'), (180, '#A3A6AB'), (150, '#8E9196'), (300, '#FFCC40')]))
save('bars', 540, 380, bars + '<rect x="20" y="360" width="500" height="8" rx="4" fill="#C9C5BB"/>')

for n in (1, 2, 3):
    save(f'folder{n}', 300, 240, f'<path d="M20 40 h90 l24 26 h146 v150 h-260z" fill="rgba(0,0,0,0.28)" transform="translate(8,10)"/>'
         f'<path d="M20 40 h90 l24 26 h146 v150 h-260z" fill="#C9A26B"/><rect x="20" y="86" width="260" height="130" rx="10" fill="#DDB97E"/>'
         f'<rect x="20" y="190" width="260" height="26" rx="8" fill="#C9A26B"/><text x="58" y="76" style="{M};font-size:30px" fill="#3B2F20">{n}</text>')

lines = lambda x, y, n, w, gap=34, c='#B9B4A8': ''.join(f'<rect x="{x}" y="{y+i*gap}" width="{w - (60 if i % 3 == 2 else 0)}" height="10" rx="5" fill="{c}"/>' for i in range(n))
save('reading', 460, 560, paper(10, 10, 430, 530) + f'<text x="46" y="80" style="{M};font-size:24px" fill="#4A4A4A">READING PASSAGE 1</text>' + lines(46, 120, 11, 350))

save('headphones', 460, 400,
     '<path d="M70 250 Q70 60 230 60 Q390 60 390 250" fill="none" stroke="rgba(0,0,0,0.28)" stroke-width="44" transform="translate(8,10)"/>'
     '<path d="M70 250 Q70 60 230 60 Q390 60 390 250" fill="none" stroke="#8E9196" stroke-width="44" stroke-linecap="round"/>'
     '<path d="M96 240 Q96 92 230 92 Q364 92 364 240" fill="none" stroke="#FFCC40" stroke-width="12" stroke-linecap="round"/>'
     '<rect x="30" y="210" width="110" height="170" rx="40" fill="#6E7176"/><rect x="320" y="210" width="110" height="170" rx="40" fill="#6E7176"/>'
     '<rect x="50" y="230" width="40" height="130" rx="18" fill="#8E9196"/><rect x="340" y="230" width="40" height="130" rx="18" fill="#8E9196"/>')

save('form', 640, 300, paper(10, 10, 610, 270) +
     f'<text x="50" y="110" style="{M};font-size:34px" fill="#2B2B2B">1. RAQAM:</text><rect x="300" y="100" width="270" height="6" fill="#2B2B2B"/>'
     f'<text x="50" y="210" style="{M};font-size:34px" fill="#2B2B2B">2. ISM:</text><rect x="300" y="200" width="270" height="6" fill="#2B2B2B"/>')

for name, lab, num in [('card15', '1-VARIANT', '15'), ('card50', '2-VARIANT', '50')]:
    save(name, 320, 360, paper(10, 10, 290, 330) + f'<text x="155" y="80" text-anchor="middle" style="{M};font-size:24px" fill="#4A4A4A">{lab}</text>'
         f'<text x="155" y="260" text-anchor="middle" style="{H};font-size:170px;letter-spacing:-6px" fill="#1F2121">{num}</text>')

save('mic', 300, 620,
     '<rect x="146" y="300" width="16" height="250" fill="#6E7176"/><rect x="60" y="540" width="180" height="40" rx="20" fill="#5B5E63"/>'
     '<path d="M70 200 Q70 330 150 330 Q230 330 230 200" fill="none" stroke="#8E9196" stroke-width="16"/>'
     '<rect x="88" y="40" width="124" height="250" rx="62" fill="#8E9196"/>'
     + ''.join(f'<rect x="100" y="{70+i*26}" width="100" height="8" rx="4" fill="#6E7176"/>' for i in range(8)) +
     '<rect x="88" y="40" width="40" height="250" rx="20" fill="rgba(255,255,255,0.15)"/>')

save('laptop', 760, 500,
     '<rect x="98" y="30" width="580" height="370" rx="22" fill="rgba(0,0,0,0.3)"/><rect x="90" y="20" width="580" height="370" rx="22" fill="#2B2D33"/>'
     '<rect x="114" y="44" width="532" height="322" rx="10" fill="#F2F0EA"/>'
     f'<text x="380" y="210" text-anchor="middle" style="{H};font-size:82px;letter-spacing:-3px" fill="#1F2121">GOPREP<tspan fill="#E8A21B">.GG</tspan></text>'
     '<rect x="190" y="232" width="380" height="9" rx="4" fill="#FFCC40"/>'
     f'<text x="380" y="300" text-anchor="middle" style="{M};font-size:24px" fill="#4A4A4A">SPEAKING · MOCK TEST</text>'
     '<path d="M30 400 h700 l-40 60 h-620z" fill="#3A3C43"/><rect x="320" y="408" width="120" height="14" rx="7" fill="#2B2D33"/>')

for n in (1, 2, 3):
    save(f'mock{n}', 300, 280, paper(10, 10, 270, 250) + f'<text x="40" y="100" style="{H};font-size:36px" fill="#1F2121">MOCK TEST</text>'
         f'<text x="40" y="205" style="{H};font-size:96px" fill="#E8A21B">{n}</text>')

pins = ''.join(f'<rect x="{70+i*36}" y="22" width="12" height="40" rx="4" fill="#9A9DA3"/><rect x="{70+i*36}" y="258" width="12" height="40" rx="4" fill="#9A9DA3"/>'
               f'<rect x="22" y="{70+i*36}" width="40" height="12" rx="4" fill="#9A9DA3"/><rect x="258" y="{70+i*36}" width="40" height="12" rx="4" fill="#9A9DA3"/>' for i in range(6))
save('aichip', 320, 320, pins + '<rect x="58" y="58" width="204" height="204" rx="22" fill="#2B2B2B"/><rect x="84" y="84" width="152" height="152" rx="14" fill="none" stroke="#FFCC40" stroke-width="6"/>'
     f'<text x="160" y="190" text-anchor="middle" style="{H};font-size:84px" fill="#F2F0EA">AI</text>')

rows = ['Fluency &amp; Coherence', 'Lexical Resource', 'Grammatical Range', 'Pronunciation']
rb = ''.join(f'<text x="50" y="{210+i*70}" style="{M};font-size:24px" fill="#2B2B2B">{r}</text><rect x="44" y="{226+i*70}" width="500" height="3" fill="#2B2B2B"/>'
             + ''.join(f'<rect x="{430+j*40}" y="{184+i*70}" width="34" height="34" rx="4" fill="none" stroke="#2B2B2B" stroke-width="3"/><text x="{447+j*40}" y="{210+i*70}" text-anchor="middle" style="{M};font-size:22px" fill="#2B2B2B">{9-j}</text>' for j in range(3))
             for i, r in enumerate(rows))
save('descriptors', 600, 560, paper(10, 10, 570, 530) + f'<text x="50" y="100" style="{H};font-size:46px" fill="#1F2121">BAND DESCRIPTORS</text>'
     f'<text x="52" y="136" style="{M};font-size:18px" fill="#8A867C">IELTS SPEAKING · PUBLIC VERSION</text>' + rb)

import math
pts = ' '.join(f'{170 + (150 if k % 2 == 0 else 62) * math.cos(math.radians(-90 + k * 36)):.1f},{170 + (150 if k % 2 == 0 else 62) * math.sin(math.radians(-90 + k * 36)):.1f}' for k in range(10))
save('star', 340, 340, f'<polygon points="{pts}" fill="rgba(0,0,0,0.3)" transform="translate(8,10)"/><polygon points="{pts}" fill="#E8B04B"/>'
     f'<text x="170" y="196" text-anchor="middle" style="{H};font-size:48px" fill="#2B2B2B">ZO\'R!</text>')

txt = ['Nowadays, many people', '<tspan font-weight="700">thinks</tspan> that technology', '<tspan font-weight="700">do</tspan> our life better. In', 'my opinion, this is true',
       'in some extent. <tspan font-weight="700">And also,</tspan>', 'people can talk with', 'their family very fast.', 'Secondly, it is cheap and', 'everyone can use it every']
tb = ''.join(f'<text x="50" y="{160+i*52}" style="font-family:\'DejaVu Sans Mono\',monospace;font-size:27px" fill="#2B2B2B">{l}</text>' for i, l in enumerate(txt))
save('essay', 620, 700, paper(10, 10, 590, 670) + f'<text x="50" y="90" style="{M};font-size:20px" fill="#8A867C">WRITING TASK 2 · DRAFT</text>' + tb)
print('ok', sorted(os.listdir('public/img')))
