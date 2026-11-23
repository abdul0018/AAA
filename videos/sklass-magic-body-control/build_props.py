"""Mercedes S-Class Magic Body Control reel: storyboard -> public/props.json (times from words.json)."""
import json

W = json.load(open('words.json'))
def T(word, n=1):
    k = 0
    for w in W:
        if w['w'].lower().strip('.,:!?') == word.lower().strip('.,:!?'):
            k += 1
            if k == n: return w['s']
    raise KeyError(word)
END = W[-1]['e'] + 1.0
GY = 1300  # road surface

def car(src, w, cx, ratio):  # returns layer dict + geometry helpers for a side-view car standing on the road
    h = w * ratio
    cy = GY - h / 2 + 4
    return dict(src=src, w=w, x=cx, y=cy), h

S_RATIO = 437 / 1314
C_RATIO = 404 / 1005
def cam(cx, w): h = w * S_RATIO; return (cx - w / 2 + 0.585 * w, GY - h + 0.1 * h)  # top of the windscreen
def wheels(cx, w): h = w * S_RATIO; y = GY - h + 0.79 * h; return [(cx - w / 2 + 0.195 * w, y), (cx - w / 2 + 0.81 * w, y)]

def road(px=760, at=0.0, anim='none'):
    # pothole.png: 1281x135, road surface at 22 % of height, pothole centred at 50 %
    w = 1900; h = 135 * w / 1281
    return dict(src='img/pothole.png', w=w, x=px, y=GY - 0.22 * h + h / 2, at=at, anim=anim, z=0)

def scan(c, x0, x1, at, draw=0.5):  # fan of dashed beams from the camera to the road ahead
    return [dict(d=f"M{c[0]:.0f},{c[1]:.0f} L{x:.0f},{GY - 4}", at=at + i * 0.08, draw=draw, color='#FFCC40', width=6, dash=[18, 12], march=160) for i, x in enumerate((x0, (x0 + x1) / 2, x1))]

scenes = []
def scene(start, end, **kw): scenes.append([start, end, kw])
rel = lambda t, s0: round(t - s0, 3)

t1, t2, t3, t4, t5, t6, t7, t8, t9, t10 = 0.0, T('bu', 2), T('oddiy'), T('s-klassda'), T('chuqur'), T('gidravlik'), T('natijada'), T('burilishda'), T('faqat'), T('sizningcha')

# 1 HOOK: the car "sees" the pothole before you do
L, h = car('img/sclass_side.png', 640, 250, S_RATIO)
L.update(anim='none', moves=[dict(at=0, dur=t2 - 0.2, x=300)])
c = cam(300, 640)
scene(t1, t2, _beat='HOOK', handlePos='center',
      titles=[dict(text="Chuqurni\noldindan ko'radi", at=0.05, underline=True)],
      layers=[road(880), L],
      flows=scan(c, 760, 1010, rel(T('chuqurni'), 0) + 0.1),
      glows=[dict(at=rel(T('chuqurni'), 0) + 0.3, x=880, y=GY + 25, r=200)],
      marks=[dict(type='question', at=rel(T("ko'radi"), 0), x=880, y=GY - 250, size=90)])

# 2 Name: Mercedes S-Class, Magic Body Control
L, h = car('img/sclass_side.png', 900, 540, S_RATIO)
L.update(anim='zoomOut', animDur=0.6)
scene(t2, t3, _beat='NAME', handlePos='left', ground=dict(y=GY, x0=80, x1=1000),
      titles=[dict(text='Magic Body\nControl', kicker='Mersedes S-klass', at=rel(T('medjik'), t2) - 0.15, underline=True)],
      layers=[L], glows=[dict(at=0.3, x=540, y=GY - 140, r=480)])

# 3 Ordinary car: the wheel drops, the shock reaches the cabin
L, h = car('img/cobalt_side.png', 700, 230, C_RATIO)
tdrop = rel(T('tushadi'), t3)
L.update(flip=True, anim='none', shakeAt=[tdrop, rel(T('silkinish'), t3)],
         moves=[dict(at=0, dur=tdrop, x=560), dict(at=tdrop, dur=0.12, y=L['y'] + 58, rot=4), dict(at=tdrop + 0.5, dur=0.35, y=L['y'], rot=0, x=660)])
scene(t3, t4, _beat='ORDINARY CAR', handlePos='right',
      titles=[dict(text='Oddiy mashina', at=0.0, out=rel(T('silkinish'), t3) - 0.15), dict(text='Silkinish salonga', at=rel(T('silkinish'), t3) - 0.1, underline=True)],
      layers=[road(560), L],
      marks=[dict(type='cross', at=rel(T('keladi'), t3), x=540, y=760, size=90)],
      shakeAt=[tdrop])

# 4 Stereo camera behind the windscreen scans 15 m ahead, 3 mm accuracy
c = cam(280, 600)
L, h = car('img/sclass_side.png', 600, 280, S_RATIO)
tU = rel(T('u'), t4)
scene(t4, t5, _beat='STEREO CAMERA', handlePos='right',
      titles=[dict(text="Ikki ko'zli\nkamera", at=rel(T('ikki'), t4) - 0.1, out=tU - 0.1, underline=True)],
      layers=[road(900), dict(L, anim='slideLeft', animDur=0.5)],
      insets=[dict(src='img/camera.png', at=rel(T('ikki'), t4), out=tU - 0.1, x=640, y=720, r=180, target=dict(x=c[0], y=c[1]))],
      flows=scan(c, 720, 1040, tU, draw=0.6),
      counters=[dict(at=rel(T("o'n"), t4), dur=0.6, from_=0, to=15, suffix=' METR', sub='3 mm aniqlik', subAt=rel(T('uch'), t4))],
      glows=[dict(at=rel(T('chuqur'), t4) if False else tU + 0.4, x=900, y=GY + 25, r=200)])

# 5 The computer commands every wheel
L, h = car('img/sclass_side.png', 880, 540, S_RATIO)
c = cam(540, 880); wh = wheels(540, 880)
tH = rel(T('har'), t5)
scene(t5, t6, _beat='EVERY WHEEL', handlePos='left', ground=dict(y=GY, x0=60, x1=1020),
      titles=[dict(text="Har bir g'ildirakka\nbuyruq", at=tH - 0.15, underline=True, size=70)],
      layers=[dict(L, anim='fade')],
      flows=[dict(d=f"M{c[0]:.0f},{c[1]:.0f} Q{(c[0] + x) / 2:.0f},{c[1] - 120:.0f} {x:.0f},{y - 70:.0f}", at=tH + 0.1 + i * 0.15, draw=0.45, color='#FFCC40', width=6, dash=[14, 10]) for i, (x, y) in enumerate(wh)],
      boxes=[dict(at=rel(T('buyruq'), t5) + i * 0.1, x=x, y=y, w=190, h=190, radius=95) for i, (x, y) in enumerate(wh)],
      glows=[dict(at=rel(T('buyruq'), t5), x=x, y=y, r=170) for (x, y) in wh])

# 6 Hydraulic strut lowers / raises the wheel in advance
sy = 1040
tDn, tUp = rel(T('tushiradi'), t6), rel(T("ko'taradi"), t6)
scene(t6, t7, _beat='HYDRAULIC STRUT', handlePos='right',
      titles=[dict(text='Gidravlik stoyka', at=0.0, underline=True)],
      layers=[dict(src='img/strut.png', w=360, x=540, y=sy, anim='pop', animDur=0.5, glow=dict(at=0.4, r=260, dy=-300),
                   moves=[dict(at=tDn - 0.1, dur=0.25, y=sy + 70), dict(at=tUp - 0.1, dur=0.3, y=sy - 50)])],
      tags=[dict(text='Gidravlika', at=0.5, x=790, y=sy - 300, bg='#FFCC40')])

# 7 PAYOFF: the wheel drops into the hole, the body stays still. Not a drop of water spilled.
L, h = car('img/sclass_side.png', 760, 200, S_RATIO)
tSt = rel(T('stakandagi'), t7)
L.update(anim='none', moves=[dict(at=0, dur=tSt - 0.2, x=700)])
scene(t7, t8, _beat='PAYOFF', handlePos='center',
      titles=[dict(text='Kuzov qimirlamaydi', at=rel(T('kuzov'), t7) - 0.1, out=tSt - 0.1, underline=True),
              dict(text="Suv to'kilmaydi", at=tSt - 0.05, underline=True)],
      layers=[road(560), L, dict(src='img/glass.png', w=150, x=540, y=720, at=tSt, anim='pop', z=3)],
      marks=[dict(type='check', at=rel(T('qimirlamaydi'), t7) + 0.2, x=540, y=760, size=90, out=tSt - 0.1),
             dict(type='check', at=rel(T("to'kilmaydi"), t7) + 0.2, x=700, y=620, size=80)])

# 8 Curve: it leans into the turn like a motorcyclist
tE = rel(T('egiladi'), t8)
scene(t8, t9, _beat='CURVE LEAN', handlePos='left', ground=dict(y=1330, x0=180, x1=900),
      titles=[dict(text='Ichkariga egiladi', at=rel(T('ichkariga'), t8) - 0.15, underline=True)],
      layers=[dict(src='img/sclass_rear.png', w=680, x=540, y=1050, anim='fade', origin='50% 100%',
                   moves=[dict(at=tE - 0.4, dur=0.8, rot=-2.6)])],
      flows=[dict(d='M820,700 Q700,560 540,560 Q380,560 290,660', at=tE - 0.3, draw=0.6, color='#FFCC40', width=8, dash=None)],
      marks=[dict(type='check', at=rel(T('otmaydi'), t8), x=540, y=600, size=80)])

# 9 The catch: daylight and up to 130 km/h
tK, tS = rel(T('kunduzi'), t9), rel(T('soatiga'), t9)
L, h = car('img/sclass_side.png', 700, 540, S_RATIO)
scene(t9, t10, _beat='LIMITS', handlePos='right', ground=dict(y=GY, x0=120, x1=960),
      titles=[dict(text='Bitta sharti bor', at=0.0, out=tK - 0.15), dict(text='Kunduzi', at=tK - 0.1, out=tS - 0.15, underline=True)],
      counters=[dict(at=tS, dur=1.0, from_=0, to=130, suffix=' KM/SOAT')],
      layers=[dict(L, anim='none')],
      glows=[dict(at=tK, x=860, y=640, r=200)])

# 10 LOOP CTA
L, h = car('img/sclass_side.png', 760, 330, S_RATIO)
scene(t10, END, _beat='CTA', handlePos='center',
      titles=[dict(text="Bizning yo'llarga\nchidaydimi?", kicker='Sizningcha', at=0.05, underline=True)],
      layers=[road(820), dict(L, anim='fade')],
      marks=[dict(type='question', at=rel(T('chidaydimi?'), t10), x=820, y=GY - 250, size=100)])

out = []
for i, (st, en, s) in enumerate(scenes):
    s = dict(dur=round(en - st, 3), **s)
    out.append(s)
txt = json.dumps(dict(handle='@autopodveska.uzb', voiceover='vo.wav', muteAll=True, scenes=out), ensure_ascii=False, indent=1).replace('"from_"', '"from"')
open('public/props.json', 'w').write(txt)
print('scenes', len(out), 'total', round(sum(s['dur'] for s in out), 2))
for (st, en, s) in scenes: print(f"{st:6.2f} {en - st:5.2f} {s['_beat']}")
