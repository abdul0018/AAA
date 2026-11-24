"""EV x men's health reel (3d-skill): storyboard -> public/props.json. Times come from words.json (ElevenLabs alignment)."""
import json

W = json.load(open('words.json'))
def T(word, n=1):
    k = 0
    for w in W:
        if w['w'].lower().strip('.,:!?"') == word.lower().strip('.,:!?"'):
            k += 1
            if k == n: return w['s']
    raise KeyError(word)
END = round(W[-1]['e'] + 2.6, 2)
MAIN = dict(src='img/xray_main_a.png', iw=1344, ih=752)   # 3/4 x-ray Li L9
SIDE = dict(src='img/xray_side_a.png', iw=1344, ih=752)   # side x-ray with ghost driver + HV cable
YEL, ORG, RED = '#F6C343', '#F5A524', '#F0473E'

ch = [('savol', 0.0), ('chat', T("do'stim")), ('pol ostida', T('batareya', 2)), ("o'lchov", T('norvegiyada')), ('taqqoslash', T('benzinli')),
      ('radiatsiya?', T('bu')), ('teplovizor', T('asl')), ('isitgich', T('tadqiqotda')), ('maslahat', T('shuning')), ('xulosa', T('xullas'))]
cuts = [c[1] for c in ch] + [END]
scenes = []
def scene(i, items, caption=True): scenes.append(dict(from_=round(cuts[i], 3), to=round(cuts[i + 1], 3), caption=caption, items=items))

# 1 SAVOL: the question headline over the x-ray car
scene(0, [
    dict(kind='headline', at=0.05, y=290, size=118, lines=[dict(text='ELEKTROMOBIL', color=YEL), dict(text='ERKAKLAR'), dict(text='SALOMATLIGIGA'), dict(text='ZARARLIMI?')]),
    dict(kind='xray', **MAIN, x=540, y=1270, w=1080, at=0.3, cam=[dict(at=0, dur=3.5, s=1.06)],
         overlays=[dict(type='pulse', x=505, y=470, rx=250, ry=75, at=0.6), dict(type='laser', x1=40, y1=246, x2=250, y2=222, at=1.0)]),
], caption=False)

# 2 CHAT: "sell it, the battery under you irradiates you"
scene(1, [
    dict(kind='chat', at=cuts[1], y=1130, title="Bolalar · avto", members="6 ta a'zo", msgs=[
        dict(at=T('oldi') - 0.35, me=True, photo=True, caption='Li L9 oldim!'),
        dict(at=T('sotib') - 0.1, from_='Jasur', text='Aka, sotib yuboring.'),
        dict(at=T('tagingdagi') - 0.1, from_='Jasur', text='Tagingizdagi batareya sizni nurlantiradi'),
    ]),
])

# 3 POL OSTIDA: battery under the floor, hundreds of amps, a magnetic field around the cables
tz, tm = T('tezlashganda'), T('magnit')
scene(2, [
    dict(kind='xray', **SIDE, x=540, y=880, w=1080, at=cuts[2], cam=[dict(at=cuts[2], dur=cuts[3] - cuts[2], s=1.1, dx=-30)],
         overlays=[dict(type='pulse', x=667, y=518, rx=340, ry=45, at=T('pol')),
                   dict(type='flow', pts=[[380, 520], [700, 520], [975, 512], [1000, 495], [1015, 462], [1045, 444]], at=tz),
                   dict(type='rings', x=667, y=518, rx=380, ry=95, at=tm)]),
    dict(kind='stat', at=T('yuzlab') - 0.1, y=1420, value='YUZLAB A', label='TEZLASHGANDA TOK', gauge=0.9),
    dict(kind='label', at=tm, y=1600, text='MAGNIT MAYDON', color=ORG),
])

# 4 O'LCHOV: SINTEF measurements, feet 20 % / head 2 % of the ICNIRP level
scene(3, [
    dict(kind='label', at=cuts[3] + 0.2, y=470, text='SINTEF · NORVEGIYA', color='#6FA8FF', size=30),
    dict(kind='xray', **SIDE, x=540, y=780, w=1040, at=cuts[3],
         overlays=[dict(type='pulse', x=667, y=518, rx=330, ry=40, at=cuts[3]),
                   dict(type='rings', x=667, y=518, rx=360, ry=85, at=cuts[3] + 0.3),
                   dict(type='marker', x=930, y=455, at=T('oyoq') - 0.1, value='20%', label='OYOQ OSTIDA', side='right'),
                   dict(type='marker', x=752, y=222, at=T('bosh') - 0.1, value='2%', label='BOSH', side='left')]),
    dict(kind='grid100', at=T('eng') - 0.2, y=1370, header="100 KATAK = XALQARO ME'YOR", steps=[
        dict(at=T('yigirma'), n=20, big='20%', sub='oyoq ostida', tag='ELEKTROMOBIL'),
        dict(at=T('ikki'), n=2, big='2%', sub='bosh balandligida', tag='ELEKTROMOBIL')]),
])

# 5 TAQQOSLASH: petrol car 10 %, a hair dryer far more
scene(4, [
    dict(kind='compare', at=cuts[4], y=1050, header="ME'YORGA NISBATAN · MAGNIT MAYDON", rows=[
        dict(at=cuts[4] + 0.1, label='Elektromobil', value=20, text='20%'),
        dict(at=T('ham') + 0.2, label='Benzinli', value=10, text='10%', color='#9AA3B5'),
        dict(at=T('soch') - 0.05, label='Soch quritgich', value=175, text="me'yordan ko'p", color=RED)]),
])

# 6 RADIATSIYA EMAS
scene(5, [
    dict(kind='notrad', at=cuts[5], strikeAt=T('emas') - 0.1, subAt=T('isbotlanmagan') - 0.6, y=1040,
         title='RADIATSIYA EMAS', sub="bepushtlikka ta'siri isbotlanmagan"),
])

# 7 TEPLOVIZOR: heat is the real enemy; testes need to be 2-3 degrees cooler
scene(6, [
    dict(kind='thermal', at=cuts[6], y=1060, tempFrom=34.0, tag="NORMA: TANADAN 2–3° SALQIN", tagAt=T('ular')),
])

# 8 ISITGICH: one hour on a heated seat -> over 37 degrees
th, to = T('harorat'), T('oshgan')
scene(7, [
    dict(kind='thermal', at=cuts[7], y=1060, heatAt=T('isitgichida') - 0.2, tempFrom=34.0, tempTo=37.3, tempAt=th, tempDur=to - th + 0.3,
         tag="1 SOAT · O'RINDIQ ISITGICHI", tagAt=T('bir') - 0.1),
    dict(kind='pill', at=T('sperma') - 0.1, y=470, text="sperma sifatiga ta'sir qilishi mumkin", color=RED),
])

# 9 MASLAHAT: switch the heater off once warm; take breaks
scene(8, [
    dict(kind='switch', at=cuts[8], offAt=T("o'chiring") - 0.05, y=820, title="O'RINDIQ ISITGICHI", sub="QIZIGACH O'CHIRING"),
    dict(kind='timer', at=T('uzoq') - 0.1, y=1150, title='TANAFFUS', sub="UZOQ YO'LDA"),
])

# 10 XULOSA + question
ts = T('siz')
scene(9, [
    dict(kind='headline', at=T('batareyadan') - 0.1, out=ts - 0.05, y=330, size=110, lines=[dict(text='BATAREYA EMAS,'), dict(text='ISITGICH', color=YEL)]),
    dict(kind='headline', at=ts - 0.05, y=330, size=110, lines=[dict(text='ISITGICHNI', color=YEL), dict(text='YOQASIZMI?')]),
    dict(kind='xray', **MAIN, x=540, y=1150, w=1080, at=cuts[9], cam=[dict(at=cuts[9], dur=END - cuts[9], s=1.08)],
         overlays=[dict(type='pulse', x=505, y=470, rx=230, ry=60, at=cuts[9], color='rgba(255,170,40,0.25)'),
                   dict(type='pulse', x=770, y=350, rx=110, ry=60, at=T("o'rindiq", 3) - 0.1, color='rgba(255,80,50,0.75)')]),
], caption=False)

props = dict(handle='@autopodveska.uz', avatar='AP', subtitle='elektromobil va salomatlik', end=END, words=W,
             highlight=['nurlantiradi', 'radiatsiya', 'issiqlik'], chapters=[dict(name=n, at=round(a, 3)) for n, a in ch], scenes=scenes, muteAll=True)
txt = json.dumps(props, ensure_ascii=False, indent=1).replace('"from_"', '"from"')
open('public/props.json', 'w').write(txt)
print('end', END)
for s in scenes: print(round(s['from_'], 2), round(s['to'] - s['from_'], 2), [i['kind'] for i in s['items']])
