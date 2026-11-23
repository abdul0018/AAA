"""Mercedes S-Class Magic Body Control reel (v2): storyboard -> public/props.json (times from words.json).

v2 fixes: one fixed pothole position in every scene (no jumping road), hard cuts between scenes (no
double-exposed titles/cars), an opening headline in every scene (no empty gaps), cars keep moving, a close-up
of the wheel dropping while the body stays level, no stray glows, handle @autopodveska.uz.
"""
import json

W = json.load(open('words.json'))
def T(word, n=1):
    k = 0
    for w in W:
        if w['w'].lower().strip('.,:!?') == word.lower().strip('.,:!?'):
            k += 1
            if k == n: return w['s']
    raise KeyError(word)
END = W[-1]['e'] + 1.1
GY = 1300   # road surface
POT = 760   # pothole centre x, the same in every scene
S_RATIO = 437 / 1314
C_RATIO = 404 / 1005

def car(src, w, cx, ratio=S_RATIO, **kw):
    h = w * ratio
    return dict(src=src, w=w, x=cx, y=GY - h / 2 + 4, **kw)
def cam(cx, w): h = w * S_RATIO; return (cx - w / 2 + 0.585 * w, GY - h + 0.1 * h)  # top of the windscreen
def wheels(cx, w): h = w * S_RATIO; y = GY - h + 0.79 * h; return [(cx - w / 2 + 0.195 * w, y), (cx - w / 2 + 0.81 * w, y)]
def front_wheel_over(x, w): return x - 0.31 * w  # car centre x that puts the front wheel at x

def road():
    # pothole.png: 1281x135, road surface at 22 % of its height, pothole centred at 50 %
    w = 1700; h = 135 * w / 1281
    return dict(src='img/pothole.png', w=w, x=POT, y=GY - 0.22 * h + h / 2, anim='none', z=0)

def scan(c, x0, x1, at, draw=0.5):  # fan of dashed beams from the camera to the road ahead
    return [dict(d=f"M{c[0]:.0f},{c[1]:.0f} L{x:.0f},{GY - 4}", at=at + i * 0.08, draw=draw, color='#FFCC40', width=6, dash=[18, 12], march=160)
            for i, x in enumerate((x0, (x0 + x1) / 2, x1))]

scenes = []
def scene(start, end, **kw): scenes.append([start, end, kw])
rel = lambda t, s0: round(t - s0, 3)

t1, t2, t3, t4, t5, t6, t7, t8, t9, t10 = 0.0, T('bu', 2), T('oddiy'), T('s-klassda'), T('chuqur'), T('gidravlik'), T('natijada'), T('burilishda'), T('faqat'), T('sizningcha')

# 1 HOOK: the car "sees" the pothole before you do
c = cam(260, 600)
scene(t1, t2, _beat='HOOK', handlePos='center',
      titles=[dict(text="Chuqurni\noldindan ko'radi", at=0.05, underline=True)],
      layers=[road(), car('img/sclass_side.png', 600, 180, anim='none', moves=[dict(at=0, dur=t2 + 0.3, x=270)])],
      flows=scan((c[0] - 80, c[1]), 640, 900, rel(T('chuqurni'), 0) + 0.05),
      glows=[dict(at=rel(T('chuqurni'), 0) + 0.3, x=POT, y=GY + 30, r=210)],
      marks=[dict(type='question', at=rel(T("ko'radi"), 0), x=POT, y=GY - 260, size=90)])

# 2 Name: Mercedes S-Class, Magic Body Control
scene(t2, t3, _beat='NAME', handlePos='left', transition='cut', ground=dict(y=GY, x0=60, x1=1020),
      titles=[dict(text='Magic Body\nControl', kicker='Mersedes S-klass', at=0.05, underline=True)],
      layers=[car('img/sclass_side.png', 900, 520, anim='zoomOut', animDur=0.6, moves=[dict(at=0.6, dur=t3 - t2, x=560)])],
      glows=[dict(at=0.3, x=540, y=GY - 140, r=460, flicker=False)])

# 3 Ordinary car: the wheel drops, the shock reaches the cabin
cw = 640; tdrop = rel(T('tushadi'), t3)
cx_hit = POT - 0.31 * cw * -1 - 0.0  # flipped car: its front wheel is on the right
cx_hit = POT - 0.30 * cw            # centre x with the front (right) wheel over the hole
ccar = car('img/cobalt_side.png', cw, 150, C_RATIO, flip=True, anim='none', shakeAt=[tdrop, rel(T('silkinish'), t3)])
ccar['moves'] = [dict(at=0, dur=tdrop, x=cx_hit), dict(at=tdrop, dur=0.12, y=ccar['y'] + 46, rot=4),
                 dict(at=tdrop + 0.45, dur=0.3, y=ccar['y'], rot=0), dict(at=tdrop + 0.45, dur=t4 - t3 - tdrop, x=980)]
scene(t3, t4, _beat='ORDINARY CAR', handlePos='right', transition='cut',
      titles=[dict(text='Oddiy mashina', at=0.0, out=rel(T('silkinish'), t3) - 0.12),
              dict(text='Silkinish salonga', at=rel(T('silkinish'), t3) - 0.05, underline=True)],
      layers=[road(), ccar],
      marks=[dict(type='cross', at=rel(T('keladi'), t3), x=540, y=780, size=90)],
      shakeAt=[tdrop])

# 4 Stereo camera behind the windscreen scans 15 m ahead, 3 mm accuracy
sw = 560; sx = 240; c = cam(sx, sw); tU = rel(T('u'), t4)
scene(t4, t5, _beat='STEREO CAMERA', handlePos='right', transition='cut',
      titles=[dict(text='S-klassda esa', at=0.0, out=rel(T('ikki'), t4) - 0.12),
              dict(text="Ikki ko'zli\nkamera", at=rel(T('ikki'), t4) - 0.05, out=tU - 0.1, underline=True)],
      layers=[road(), car('img/sclass_side.png', sw, 120, anim='none', moves=[dict(at=0, dur=0.8, x=sx)])],
      insets=[dict(src='img/camera.png', at=rel(T('ikki'), t4), out=tU - 0.1, x=660, y=760, r=190, target=dict(x=c[0], y=c[1]))],
      flows=scan(c, 600, 940, tU, draw=0.6),
      counters=[dict(at=rel(T("o'n"), t4), dur=0.6, from_=0, to=15, suffix=' METR', sub='3 mm aniqlik', subAt=rel(T('uch'), t4))],
      glows=[dict(at=tU + 0.4, x=POT, y=GY + 30, r=210)])

# 5 The computer commands every wheel
cw5 = 860; c = cam(540, cw5); wh = wheels(540, cw5); tH = rel(T('har'), t5)
scene(t5, t6, _beat='EVERY WHEEL', handlePos='left', transition='cut', ground=dict(y=GY, x0=60, x1=1020),
      titles=[dict(text="Chuqur ko'rindi", at=0.0, out=tH - 0.12),
              dict(text="Har bir g'ildirakka\nbuyruq", at=tH - 0.05, underline=True, size=70)],
      layers=[car('img/sclass_side.png', cw5, 540, anim='fade')],
      flows=[dict(d=f"M{c[0]:.0f},{c[1]:.0f} Q{(c[0] + x) / 2:.0f},{c[1] - 130:.0f} {x:.0f},{y - 85:.0f}", at=tH + 0.1 + i * 0.15, draw=0.45,
                  color='#FFCC40', width=6, dash=[14, 10]) for i, (x, y) in enumerate(wh)],
      boxes=[dict(at=rel(T('buyruq'), t5) + i * 0.1, x=x, y=y, w=190, h=190, radius=95) for i, (x, y) in enumerate(wh)],
      glows=[dict(at=rel(T('buyruq'), t5), x=x, y=y, r=170) for (x, y) in wh])

# 6 Hydraulic strut lowers / raises the wheel in advance
sy = 1040; tDn, tUp = rel(T('tushiradi'), t6), rel(T("ko'taradi"), t6)
scene(t6, t7, _beat='HYDRAULIC STRUT', handlePos='right', transition='cut',
      titles=[dict(text='Gidravlik stoyka', at=0.0, underline=True)],
      layers=[dict(src='img/strut.png', w=360, x=540, y=sy, anim='pop', animDur=0.5,
                   moves=[dict(at=tDn - 0.1, dur=0.25, y=sy + 70), dict(at=tUp - 0.1, dur=0.3, y=sy - 50)])],
      tags=[dict(text='Gidravlika', at=0.5, x=790, y=sy - 300, bg='#FFCC40'),
            dict(text='Pastga', at=tDn, out=tUp - 0.1, x=290, y=sy + 120, bg='#F2F1EC'),
            dict(text='Yuqoriga', at=tUp, x=290, y=sy - 60, bg='#F2F1EC')])

# 7 PAYOFF: the wheel drops into the hole, the body stays still. Not a drop of water spilled.
pw = 680; tT2 = rel(T('tushadi', 2), t7); tSt = rel(T('stakandagi'), t7); tK = rel(T('kuzov'), t7)
xc = front_wheel_over(POT, pw)
scene(t7, t8, _beat='PAYOFF', handlePos='center', transition='cut',
      titles=[dict(text="G'ildirak tushadi", at=0.0, out=tK - 0.12),
              dict(text='Kuzov qimirlamaydi', at=tK - 0.05, out=tSt - 0.1, underline=True),
              dict(text="Suv to'kilmaydi", at=tSt - 0.05, underline=True)],
      layers=[road(), car('img/sclass_side.png', pw, 60, anim='none', moves=[dict(at=0, dur=tT2 + 0.2, x=xc), dict(at=tT2 + 0.2, dur=tSt - tT2 + 1.2, x=980)]),
              dict(src='img/glass.png', w=140, x=540, y=760, at=tSt, anim='pop', z=3)],
      insets=[dict(src='img/strut.png', at=tT2 - 0.15, out=tSt - 0.15, x=780, y=760, r=170, zoom=1.0, focusY=0.75, target=dict(x=POT, y=GY - 60))],
      marks=[dict(type='check', at=tK + 0.5, x=300, y=760, size=90, out=tSt - 0.15),
             dict(type='check', at=rel(T("to'kilmaydi"), t7) + 0.2, x=690, y=640, size=80)])

# 8 Curve: it leans into the turn like a motorcyclist
tE = rel(T('egiladi'), t8)
scene(t8, t9, _beat='CURVE LEAN', handlePos='left', transition='cut', ground=dict(y=1330, x0=180, x1=900),
      titles=[dict(text='Burilishda', at=0.0, out=rel(T('ichkariga'), t8) - 0.12),
              dict(text='Ichkariga egiladi', at=rel(T('ichkariga'), t8) - 0.05, underline=True)],
      layers=[dict(src='img/sclass_rear.png', w=660, x=540, y=1050, anim='fade', origin='50% 100%',
                   moves=[dict(at=tE - 0.45, dur=0.8, rot=-2.8)])],
      tags=[dict(text='mototsiklchi kabi', at=rel(T('mototsiklchi'), t8), out=tE + 1.2, x=540, y=650, bg='#FFCC40')],
      marks=[dict(type='check', at=rel(T('otmaydi'), t8), x=540, y=640, size=80)])

# 9 The catch: daylight and up to 130 km/h
tK9, tS9 = rel(T('kunduzi'), t9), rel(T('soatiga'), t9)
scene(t9, t10, _beat='LIMITS', handlePos='right', transition='cut', ground=dict(y=GY, x0=60, x1=1020),
      titles=[dict(text='Bitta sharti bor', at=0.0, out=tK9 - 0.12),
              dict(text='Faqat kunduzi', at=tK9 - 0.05, out=tS9 - 0.12, underline=True)],
      counters=[dict(at=tS9, dur=1.0, from_=0, to=130, suffix=' KM/SOAT', sub='gacha', subAt=tS9 + 1.0)],
      layers=[car('img/sclass_side.png', 700, 200, anim='none', moves=[dict(at=0, dur=t10 - t9, x=820)])])

# 10 LOOP CTA
scene(t10, END, _beat='CTA', handlePos='center', transition='cut',
      titles=[dict(text="Bizning yo'llarga\nchidaydimi?", kicker='Sizningcha', at=0.05, underline=True)],
      layers=[road(), car('img/sclass_side.png', 600, 200, anim='none', moves=[dict(at=0, dur=END - t10, x=300)])],
      marks=[dict(type='question', at=rel(T('chidaydimi?'), t10), x=POT, y=GY - 260, size=100)])

out = [dict(dur=round(en - st, 3), **s) for st, en, s in scenes]
txt = json.dumps(dict(handle='@autopodveska.uz', voiceover='vo.wav', muteAll=True, scenes=out), ensure_ascii=False, indent=1).replace('"from_"', '"from"')
open('public/props.json', 'w').write(txt)
print('scenes', len(out), 'total', round(sum(s['dur'] for s in out), 2))
