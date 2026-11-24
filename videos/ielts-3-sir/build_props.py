"""IELTS 3-secrets reel (goprep.gg ad) in the explainer-reel dark-board style -> public/props.json."""
import json
W = json.load(open('words.json'))
def T(word, n=1):
    k = 0
    for w in W:
        if w['w'].lower().strip('.,:!?"') == word.lower().strip('.,:!?"'):
            k += 1
            if k == n: return w['s']
    raise KeyError(word)
END = 44.09  # the reference's own audio length (its original voiceover is kept)
RED = '#FF4D4D'; YEL = '#FFCC40'; CREAM = '#F2F1EC'
cuts = [0.0, T('hozir'), T('birinchi'), T('bilingki'), T('ikkinchi'), T('agar'), T('doim'), T('uchinchi'), T('shunchaki'), T("ko'pchilik"), T('lekin'), T('u'), T('va', 2), END]
scenes = []
def scene(i, fn):
    s0 = cuts[i]
    def r(t): return round(t - s0, 3)
    scenes.append(dict(dur=round(cuts[i + 1] - s0, 3), transition='cut', **fn(r)))

# 1 HOOK: IELTS 8.0 is not that hard
scene(0, lambda r: dict(handlePos='center',
    titles=[dict(text='IELTS 8.0', at=0.05, out=r(T('aslida')) - 0.1), dict(text='Aslida unchalik\nqiyin emas', at=r(T('aslida')) - 0.05, underline=True)],
    layers=[dict(src='img/score80.svg', w=520, x=500, y=980, anim='pop', animDur=0.5, rotate=-4),
            dict(src='img/man_stand.png', w=130, x=850, y=1130, at=0.4, anim='slideRight')],
    glows=[dict(at=0.2, x=500, y=980, r=420)]))

# 2 +1-2 band, three secrets
scene(1, lambda r: dict(handlePos='left',
    titles=[dict(text='Ballingizni\nosongina +1–2', at=0.05, out=r(T('uchta')) - 0.1, underline=True, size=80), dict(text='Uchta sir', at=r(T('uchta')) - 0.05, underline=True)],
    layers=[dict(src='img/bars.svg', w=560, x=540, y=900, anim='fade'),
            *[dict(src=f'img/folder{n}.svg', w=260, x=x, y=1360, at=r(T('uchta')) + n * 0.12, anim='pop') for n, x in [(1, 250), (2, 540), (3, 830)]]],
    tags=[dict(text='+1–2 ball', at=r(T('bir-ikki')), x=760, y=650, bg=YEL)]))

# 3 SECRET 1 Reading: True/False/Not Given + absolute words
scene(2, lambda r: dict(handlePos='right',
    titles=[dict(text='Reading', kicker='1-sir', at=0.05, out=r(T('olveys')) - 0.1, underline=True), dict(text="Qat'iy so'zlar", kicker='True / False / Not Given', at=r(T('olveys')) - 0.05, underline=True)],
    layers=[dict(src='img/reading.svg', w=420, x=540, y=1000, anim='slideUp')],
    tags=[dict(text='TRUE', at=r(T('tru')), x=250, y=1360, bg=CREAM), dict(text='FALSE', at=r(T('fols')), x=540, y=1410, bg=CREAM), dict(text='NOT GIVEN', at=r(T('not')), x=820, y=1360, bg=CREAM),
          dict(text='ALWAYS', at=r(T('olveys')), x=540, y=860, bg=YEL, size=58), dict(text='ONLY', at=r(T('ounli')), x=540, y=990, bg=YEL, size=58), dict(text='NEVER', at=r(T('never')), x=540, y=1120, bg=YEL, size=58)],
    boxes=[dict(at=r(T('olveys')) + 0.15, x=540, y=860, w=330, h=100, radius=50, color=RED), dict(at=r(T('ounli')) + 0.15, x=540, y=990, w=250, h=100, radius=50, color=RED),
           dict(at=r(T('never')) + 0.15, x=540, y=1120, w=290, h=100, radius=50, color=RED)]))

# 4 95 % -> the answer is not TRUE
scene(3, lambda r: dict(handlePos='center',
    counters=[dict(at=r(T("to'qson")) - 0.2, dur=0.8, from_=0, to=95, suffix='%', sub='javob TRUE bo\'lmaydi', subAt=r(T('javob')))],
    titles=[dict(text='Bilingki', at=0.0, out=r(T("to'qson")) - 0.25)],
    tags=[dict(text='TRUE', at=r(T('javob')) - 0.1, x=540, y=1050, bg=CREAM, size=96)],
    marks=[dict(type='cross', at=r(T("bo'lmaydi")), x=540, y=1050, size=170)]))

# 5 SECRET 2 Listening: numbers and names
scene(4, lambda r: dict(handlePos='left',
    titles=[dict(text='Listening', kicker='2-sir', at=0.05, out=r(T('ehtiyot')) - 0.1, underline=True), dict(text="Ehtiyot bo'ling!", at=r(T('ehtiyot')) - 0.05, underline=True)],
    layers=[dict(src='img/headphones.svg', w=420, x=540, y=830, anim='pop'), dict(src='img/form.svg', w=620, x=540, y=1240, at=r(T('raqam')) - 0.2, anim='slideUp')],
    boxes=[dict(at=r(T('raqam')) + 0.2, x=651, y=1180, w=300, h=64, radius=12, color=RED), dict(at=r(T('ism')) + 0.05, x=651, y=1277, w=300, h=64, radius=12, color=RED)]))

# 6 the speaker changes their mind
scene(5, lambda r: dict(handlePos='right',
    titles=[dict(text='Gapirayotgan odam', at=0.05, out=r(T('fikrini')) - 0.1, size=76), dict(text="Fikrini o'zgartirsa", at=r(T('fikrini')) - 0.05, underline=True, size=76)],
    layers=[dict(src='img/man_point.png', w=330, x=330, y=1100, anim='slideRight')],
    tags=[dict(text='Oh, sorry…', at=r(T('o,')), x=720, y=720, bg=CREAM, size=54), dict(text='Wait, actually…', at=r(T('veyt,')), x=700, y=860, bg=YEL, size=54)]))

# 7 the second option is always the right one
scene(6, lambda r: dict(handlePos='center',
    titles=[dict(text="Ikkinchi variant\nto'g'ri", kicker='doim', at=0.05, underline=True)],
    layers=[dict(src='img/card15.svg', w=300, x=330, y=1060, anim='pop', rotate=-5), dict(src='img/card50.svg', w=300, x=750, y=1060, at=0.12, anim='pop', rotate=4)],
    marks=[dict(type='cross', at=r(T('ikkinchi', 2)), x=330, y=1060, size=160), dict(type='check', at=r(T("to'g'ri")), x=750, y=1300, size=110)],
    boxes=[dict(at=r(T("to'g'ri")), x=750, y=1060, w=340, h=400, radius=40, color=YEL)]))

# 8 SECRET 3 Speaking: no tutor
scene(7, lambda r: dict(handlePos='left',
    titles=[dict(text='Speaking', kicker="3-sir · eng zo'r", at=0.05, out=r(T('ustoz')) - 0.1, underline=True), dict(text='Ustoz qidirmayman', at=r(T('ustoz')) - 0.05, underline=True, size=80)],
    layers=[dict(src='img/mic.svg', w=250, x=330, y=1080, anim='slideUp'), dict(src='img/man_stand.png', w=130, x=760, y=1100, at=r(T('ustoz')) - 0.3, anim='fade')],
    tags=[dict(text='Ustoz', at=r(T('ustoz')) - 0.2, x=760, y=640, bg=CREAM)],
    marks=[dict(type='cross', at=r(T('qidirmayman')) + 0.1, x=760, y=1080, size=200)]))

# 9 goprep.gg mock tests
scene(8, lambda r: dict(handlePos='right',
    titles=[dict(text='goprep.gg', kicker='Shunchaki', at=r(T('goprep')) - 0.1, underline=True)],
    layers=[dict(src='img/laptop.svg', w=760, x=540, y=950, anim='pop', animDur=0.5),
            *[dict(src=f'img/mock{n}.svg', w=250, x=x, y=1420, at=r(T('mok')) + (n - 1) * 0.13, anim='pop', rotate=(n - 2) * 5) for n, x in [(1, 270), (2, 540), (3, 810)]]]))

# 10 people don't trust AI marking
scene(9, lambda r: dict(handlePos='center',
    titles=[dict(text='AI tekshiruviga\nishonmaydi', kicker="Ko'pchilik", at=0.05, underline=True)],
    layers=[dict(src='img/aichip.svg', w=260, x=540, y=880, at=r(T('ey-ay')) - 0.1, anim='pop'),
            *[dict(src='img/man_stand.png', w=w, x=x, y=1330, at=0.1 + i * 0.08, anim='fade') for i, (x, w) in enumerate([(170, 100), (370, 112), (700, 108), (900, 98)])]],
    marks=[dict(type='question', at=r(T('ishonmaydi')), x=760, y=850, size=120)]))

# 11 but this AI marks by the official band descriptors
scene(10, lambda r: dict(handlePos='left',
    titles=[dict(text="Rasmiy IELTS\ntalablari", kicker='Lekin', at=0.05, underline=True)],
    layers=[dict(src='img/descriptors.svg', w=620, x=520, y=980, anim='slideUp'), dict(src='img/aichip.svg', w=200, x=850, y=1390, at=r(T('ey-ay', 2)) - 0.1, anim='pop')],
    flows=[dict(d='M850,1290 L760,1190', at=r(T('rasmiy')), draw=0.4, color=RED, width=6, dash=None)],
    marks=[dict(type='check', at=r(T('baholaydi')), x=520, y=1320, size=90)]))

# 12 no flattery, an exact score
scene(11, lambda r: dict(handlePos='center',
    titles=[dict(text="Maqtab qo'ymaydi", at=r(T('maqtab')) - 0.1, out=r(T('aniq')) - 0.1, size=80), dict(text='Aniq ball', at=r(T('aniq')) - 0.05, underline=True)],
    layers=[dict(src='img/star.svg', w=320, x=540, y=980, anim='pop', out=r(T('balki'))), dict(src='img/score75.svg', w=480, x=540, y=980, at=r(T('aniq')) - 0.1, anim='pop', rotate=3)],
    marks=[dict(type='cross', at=r(T("qo'ymaydi")) + 0.05, x=540, y=980, size=180, out=r(T('balki')))],
    shakeAt=[r(T("qo'ymaydi")) + 0.05]))

# 13 every mistake explained
scene(12, lambda r: dict(handlePos='center',
    titles=[dict(text='Har bir xato\ntushuntiriladi', at=0.05, underline=True)],
    layers=[dict(src='img/essay.svg', w=600, x=520, y=1080, anim='slideUp')],
    boxes=[dict(at=r(T('xatoingizni')) - 0.1, x=322, y=938, w=112, h=46, radius=8, color=RED), dict(at=r(T('xatoingizni')) + 0.15, x=296, y=988, w=50, h=46, radius=8, color=RED),
           dict(at=r(T('xatoingizni')) + 0.4, x=598, y=1088, w=176, h=46, radius=8, color=RED)],
    tags=[dict(text='Grammar', at=r(T('xatoingizni')) - 0.05, x=880, y=930, bg=YEL, size=40), dict(text='Vocab', at=r(T('xatoingizni')) + 0.2, x=880, y=1000, bg=YEL, size=40),
          dict(text='Coherence', at=r(T('xatoingizni')) + 0.45, x=880, y=1090, bg=YEL, size=40)]))

txt = json.dumps(dict(handle='@autopodveska.uz', voiceover='ref_audio.wav', muteAll=True, scenes=scenes), ensure_ascii=False, indent=1).replace('"from_"', '"from"')
open('public/props.json', 'w').write(txt)
print('scenes', len(scenes), 'total', round(sum(s['dur'] for s in scenes), 2))
