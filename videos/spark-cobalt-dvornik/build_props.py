"""Spark vs Cobalt rear-wiper reel: storyboard -> public/props.json (times from words.json)."""
import json, numpy as np
from PIL import Image

W = json.load(open('words.json'))
def T(word, n=1):
    k = 0
    for w in W:
        if w['w'].lower().strip('.,:!?') == word.lower():
            k += 1
            if k == n: return w['s']
    raise KeyError(word)
END = W[-1]['e']

def place(name, w, cx, cy):
    im = Image.open(f'public/img/{name}').convert('RGBA')
    s = w / im.width
    return dict(im=im, s=s, x0=cx - w / 2, y0=cy - im.height * s / 2, w=w, h=im.height * s, cx=cx, cy=cy, src=f'img/{name}')

def rear_col(P, lo, hi):
    a = solid_alpha(P) > 128
    H = a.shape[0]
    return max(np.nonzero(a[r])[0].max() for r in range(int(H * lo), int(H * hi)) if a[r].any())

def solid_alpha(P):
    from PIL import ImageFilter
    # erode horizontally so a thin roof antenna doesn't count as roof
    return np.array(P['im'].split()[-1].filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9)))

def top_contour(P, cut=None):
    a = solid_alpha(P) > 128
    if cut is not None: a = a[:, :cut + 1]
    ys = np.array([np.argmax(a[:, i]) if a[:, i].any() else a.shape[0] for i in range(a.shape[1])], float)
    xs = np.arange(a.shape[1])
    return P['x0'] + xs * P['s'], P['y0'] + ys * P['s']

def smooth(y, k):
    k = max(1, int(k)); pad = np.pad(y, k, mode='edge'); ker = np.ones(2 * k + 1) / (2 * k + 1)
    return np.convolve(pad, ker, 'valid')

def path(pts):
    pts = [(float(x), float(y)) for x, y in pts]
    return 'M' + ' L'.join(f'{x:.0f},{y:.0f}' for x, y in pts)

def streamline(P, gap, x_start, tail, attached, cut):
    """Line `gap` px above the roof contour, from x_start to the car's rear edge (`cut` column), then the tail."""
    X, Y = top_contour(P, cut)
    # upper envelope: the air cannot dip into the windscreen corner
    Yl = smooth(Y, 6) - gap
    Yl = smooth(np.minimum.accumulate(Yl[::-1])[::-1] * 0 + Yl, 18 + gap * 0.35)
    xr = X[-1]
    pts = [(x_start, Yl[int(len(Yl) * 0.18)] - 8)]
    for i in range(int(len(X) * 0.18), len(X), 12): pts.append((X[i], Yl[i]))
    if attached:  # follows the slope down and leaves smoothly
        dy = (Yl[-1] - Yl[-40]) / (X[-1] - X[-40])
        for k in range(1, 9): pts.append((xr + k * tail / 8, Yl[-1] + dy * k * tail / 8 * (1 - k / 14)))
    else:  # separates at the sharp edge and keeps going straight
        for k in range(1, 9): pts.append((xr + k * tail / 8, Yl[-1] - 4 + k * 3))
    return path(pts)

def rel(t, s0): return round(t - s0, 3)

scenes = []
def scene(start, end, **kw):
    s = dict(dur=round(end - start, 3), **kw); scenes.append((start, s)); return s

AIR = '#7FD3F0'; YEL = '#FFCC40'

# ---------- placements
SR_PAIR = place('spark_rear.png', 430, 290, 1100)
CR_PAIR = place('cobalt_rear.png', 470, 800, 1118)
SR = place('spark_rear.png', 700, 540, 1090)
SS = place('spark_side.png', 800, 450, 1100)
SS_CUT = rear_col(SS, 0.0, 0.14)
CS = place('cobalt_side.png', 840, 440, 1130)
CS_CUT = rear_col(CS, 0.30, 0.42)
CR = place('cobalt_rear.png', 700, 540, 1100)

def rear_pts(P):  # glass area, wiper pivot in canvas px (measured on spark_rear.png: glass x188-797, y130-340 of 986x995)
    s = P['s']; X = lambda v: P['x0'] + v * s; Y = lambda v: P['y0'] + v * s
    return dict(gx=X(492), gy=Y(236), gw=550 * s, gh=190 * s, px=X(492), py=Y(338), len=285 * s, wheelL=(X(150), Y(975)), wheelR=(X(840), Y(975)))

t_s1 = 0.0; t_s2 = T('sababi'); t_s3 = T('hammasi'); t_s4 = T('sparkning'); t_s5 = T('havo')
t_s6 = T('mashina'); t_s7 = T('u'); t_s8 = T('endi'); t_s9 = T('oyna'); t_s10 = T('orqa', 3)
t_s11 = T('cobaltda', 2); t_s12 = T('havo', 3); t_s13 = T('girdob'); t_s14 = T('oyna', 3); t_end = END + 0.9

# 1 HOOK: Sparkda orqa dvornik bor, Cobaltda yo'q.
g = rear_pts(SR_PAIR)
scene(t_s1, t_s2, _beat='HOOK', handlePos='center',
      titles=[dict(text='Orqa dvornik', at=0.05, underline=True)],
      layers=[dict(src=SR_PAIR['src'], w=SR_PAIR['w'], x=SR_PAIR['cx'], y=SR_PAIR['cy'], anim='slideLeft', animDur=0.5),
              dict(src=CR_PAIR['src'], w=CR_PAIR['w'], x=CR_PAIR['cx'], y=CR_PAIR['cy'], at=rel(T('cobaltda'), 0) - 0.1, anim='slideRight', animDur=0.5)],
      wipers=[dict(at=rel(T('dvornik'), 0) + 0.1, dur=1.1, x=g['px'], y=g['py'], len=g['len'], from_=180, to=355)],
      tags=[dict(text='Spark', at=0.3, x=SR_PAIR['cx'], y=SR_PAIR['y0'] - 60, bg='#F2F1EC'),
            dict(text='Cobalt', at=rel(T('cobaltda'), 0), x=CR_PAIR['cx'], y=CR_PAIR['y0'] - 60, bg='#F2F1EC')],
      marks=[dict(type='check', at=rel(T('bor'), 0), x=SR_PAIR['cx'], y=SR_PAIR['y0'] + SR_PAIR['h'] + 110, size=80),
             dict(type='cross', at=rel(T("yo'q"), 0), x=CR_PAIR['cx'], y=CR_PAIR['y0'] + CR_PAIR['h'] + 90, size=70)])

# 2 Sababi, Spark o'z orqa oynasiga o'zi loy otadi.
g = rear_pts(SR)
scene(t_s2, t_s3, _beat='REASON', handlePos='left',
      titles=[dict(text="O'ziga loy otadi", at=rel(T('oynasiga'), t_s2), underline=True)],
      layers=[dict(src=SR['src'], w=SR['w'], x=SR['cx'], y=SR['cy'], anim='zoomOut', animDur=0.6)],
      wipers=[dict(at=99, dur=1, x=g['px'], y=g['py'], len=g['len'], from_=180, to=355)],
      mud=[dict(at=rel(T('loy'), t_s2) - 0.25, from_=dict(x=g['wheelL'][0] - 40, y=g['wheelL'][1]), ctrl=dict(x=SR['x0'] - 60, y=g['gy'] - 260), x=g['gx'] - g['gw'] * 0.22, y=g['gy'], w=g['gw'] * 0.5, h=g['gh'] * 0.9, count=14, stagger=0.035),
           dict(at=rel(T('loy'), t_s2) - 0.15, from_=dict(x=g['wheelR'][0] + 40, y=g['wheelR'][1]), ctrl=dict(x=SR['x0'] + SR['w'] + 60, y=g['gy'] - 260), x=g['gx'] + g['gw'] * 0.22, y=g['gy'], w=g['gw'] * 0.5, h=g['gh'] * 0.9, count=14, stagger=0.035)],
      shakeAt=[rel(T('otadi'), t_s2) + 0.1])

# 3 Hammasi tomning shaklida.
SSm = place('spark_side.png', 560, 540, 870); CSm = place('cobalt_side.png', 640, 540, 1350)
X1, Y1 = top_contour(SSm, rear_col(SSm, 0, 0.14)); X2, Y2 = top_contour(CSm, rear_col(CSm, 0.30, 0.42))
def contour_path(X, Y, frac0=0.12):
    i0 = int(len(X) * frac0); Ys = smooth(Y, 3)
    return path([(X[i], Ys[i] - 6) for i in range(i0, len(X), 6)] + [(X[-1], Ys[-1] - 6)])
def rear_drop(P, X, Y):  # the rear face: down from the roof end along the right edge
    a = solid_alpha(P) > 128
    rows = range(int(a.shape[0] * 0.02), int(a.shape[0] * 0.62), 6)
    pts = [(P['x0'] + (np.nonzero(a[r])[0].max()) * P['s'] + 6, P['y0'] + r * P['s']) for r in rows if a[r].any()]
    return pts
sp_roof = contour_path(X1, Y1, 0.30); co_roof = contour_path(X2, Y2, 0.30)
scene(t_s3, t_s4, _beat='ROOF SHAPE',
      titles=[dict(text='Tomning shakli', at=0.0, underline=True)],
      layers=[dict(src=SSm['src'], w=SSm['w'], x=SSm['cx'], y=SSm['cy'], anim='slideLeft'),
              dict(src=CSm['src'], w=CSm['w'], x=CSm['cx'], y=CSm['cy'], anim='slideRight', at=0.15)],
      flows=[dict(d=sp_roof, at=rel(T('shaklida'), t_s3), draw=0.6, color=YEL, dash=None, width=10),
             dict(d=co_roof, at=rel(T('shaklida'), t_s3) + 0.2, draw=0.6, color=YEL, dash=None, width=10)])

# 4 Sparkning tomi orqada tik kesiladi.
X, Y = top_contour(SS, SS_CUT); Ys = smooth(Y, 3)
i0 = int(len(X) * 0.35)
drop = rear_drop(SS, X, Y)
sp_profile = path([(X[i], Ys[i] - 6) for i in range(i0, len(X), 6)] + drop[1:])
rx = X[-1]; ry_top = Ys[-1]
scene(t_s4, t_s5, _beat='VERTICAL BACK',
      titles=[dict(text='Tik kesiladi', at=rel(T('tik'), t_s4) - 0.1, underline=True)],
      layers=[dict(src=SS['src'], w=SS['w'], x=SS['cx'], y=SS['cy'], anim='zoomOut', animDur=0.5)],
      flows=[dict(d=sp_profile, at=0.25, draw=0.9, color=YEL, dash=None, width=11)],
      boxes=[dict(at=rel(T('kesiladi'), t_s4), x=max(p[0] for p in drop) - 12, y=(drop[0][1] + drop[-1][1]) / 2, w=74, h=drop[-1][1] - drop[0][1] + 40, radius=30)])

# 5 Havo oqimi shu chetda uziladi.   6 bosim pasayib, girdob   7 loy -> oyna
lines = [streamline(SS, gp, 30, 260, attached=False, cut=SS_CUT) for gp in (28, 85, 150)]
vx, vy = rx + 115, ry_top + (drop[-1][1] - ry_top) * 0.55
scene(t_s5, t_s6, _beat='FLOW SEPARATES', handlePos='left',
      titles=[dict(text='Havo uziladi', at=0.0, underline=True)],
      layers=[dict(src=SS['src'], w=SS['w'], x=SS['cx'], y=SS['cy'], anim='none')],
      flows=[dict(d=d, at=0.05 + i * 0.12, draw=1.0) for i, d in enumerate(lines)],
      marks=[dict(type='spark', at=rel(T('uziladi'), t_s5), x=rx + 8, y=ry_top + 6, size=56, quiet=True)])
scene(t_s6, t_s7, _beat='LOW PRESSURE + VORTEX', handlePos='left', transition='cut',
      titles=[dict(text='Bosim pasayadi', at=0.1, out=rel(T('girdobga'), t_s6) - 0.25), dict(text='Girdob', at=rel(T('girdobga'), t_s6) - 0.1, underline=True)],
      layers=[dict(src=SS['src'], w=SS['w'], x=SS['cx'], y=SS['cy'], anim='none')],
      flows=[dict(d=d, at=0, draw=0.01) for d in lines],
      tags=[dict(text='Past bosim', at=rel(T('bosim'), t_s6), x=min(vx + 60, 900), y=ry_top - 70)],
      vortices=[dict(at=rel(T('girdobga'), t_s6), x=vx, y=vy, r=105, spin=300),
                dict(at=rel(T('girdobga'), t_s6) + 0.25, x=vx + 40, y=vy + 150, r=70, spin=340)])
a = np.array(SS['im'])[..., 3] > 128
wheel_x = SS['x0'] + a.shape[1] * 0.83 * SS['s']; ground_y = SS['y0'] + SS['h']
scene(t_s7, t_s8, _beat='MUD ONTO GLASS', handlePos='left', transition='cut',
      titles=[dict(text='Loyni oynaga otadi', at=rel(T('loyni'), t_s7) - 0.1, underline=True)],
      layers=[dict(src=SS['src'], w=SS['w'], x=SS['cx'], y=SS['cy'], anim='none', shakeAt=[rel(T('otadi', 2), t_s7)])],
      flows=[dict(d=d, at=0, draw=0.01) for d in lines],
      vortices=[dict(at=0, x=vx, y=vy, r=105, spin=300), dict(at=0, x=vx + 40, y=vy + 150, r=70, spin=340)],
      mud=[dict(at=rel(T("g'ildirak"), t_s7), from_=dict(x=wheel_x, y=ground_y - 10), ctrl=dict(x=vx + 230, y=vy + 40), x=drop[0][0] - 4, y=ry_top + (drop[-1][1] - ry_top) * 0.4, w=26, h=(drop[-1][1] - ry_top) * 0.55, count=22, stagger=0.07, fly=0.9, size=24)])

# 8 Endi eng yomoni: tunda, yomg'irda.   9 Oyna loyga to'lib ... ko'rinmaydi.   10 Orqa dvornik ... artadi.
g = rear_pts(SR)
night = 'brightness(0.62) saturate(0.85)'
mud_full = lambda at, wipe=None: [dict(at=at, x=g['gx'], y=g['gy'], w=g['gw'], h=g['gh'], count=110, stagger=0.013, size=34, film=0.8, **({'wipe': wipe} if wipe else {}))]
scene(t_s8, t_s9, _beat='NIGHT RAIN', handlePos='center',
      titles=[dict(text="Tunda, yomg'irda", at=rel(T('tunda'), t_s8) - 0.1, underline=True)],
      layers=[dict(src=SR['src'], w=SR['w'], x=SR['cx'], y=SR['cy'], anim='fade', filter=night)],
      rain=[dict(at=0.2, count=60)],
      mud=[dict(at=0.3, x=g['gx'], y=g['gy'], w=g['gw'], h=g['gh'], count=24, stagger=0.05, size=34)],
      wipers=[dict(at=99, dur=1, x=g['px'], y=g['py'], len=g['len'], from_=180, to=355)])
scene(t_s9, t_s10, _beat='CAN NOT SEE', handlePos='left', transition='cut',
      titles=[dict(text="Oyna loyga to'ladi", at=0.05, out=rel(T('hech'), t_s9) - 0.3), dict(text="Hech narsa\nko'rinmaydi", at=rel(T('hech'), t_s9) - 0.1, underline=True)],
      layers=[dict(src=SR['src'], w=SR['w'], x=SR['cx'], y=SR['cy'], anim='none', filter=night)],
      rain=[dict(at=0, count=60)],
      mud=mud_full(0.0),
      wipers=[dict(at=99, dur=1, x=g['px'], y=g['py'], len=g['len'], from_=180, to=355)],
      insets=[dict(src='img/inside_view.png', at=rel(T('hech'), t_s9), x=540, y=1500, r=150, target=dict(x=g['gx'], y=g['gy'] + 40))],
      marks=[dict(type='cross', at=rel(T("ko'rinmaydi"), t_s9) + 0.3, x=860, y=1420, size=70)])
wa = rel(T('artadi'), t_s10) - 0.45
scene(t_s10, t_s11, _beat='WIPER CLEARS', handlePos='left', transition='cut',
      titles=[dict(text='Orqa dvornik', at=0.0, underline=True)],
      layers=[dict(src=SR['src'], w=SR['w'], x=SR['cx'], y=SR['cy'], anim='none', filter=night)],
      rain=[dict(at=0, count=60)],
      mud=[dict(at=-1, x=g['gx'], y=g['gy'], w=g['gw'], h=g['gh'], count=110, stagger=0.0, size=34, film=0.8, wipe=dict(at=wa, dur=1.3, x=g['px'], y=g['py'], from_=180, to=360))],
      wipers=[dict(at=wa, dur=1.3, x=g['px'], y=g['py'], len=g['len'], from_=180, to=358)],
      marks=[dict(type='check', at=wa + 1.35, x=540, y=g['gy'] - g['gh'] / 2 - 90, size=90)])

# 11 Cobaltda esa orqa oyna qiya.   12 Havo unga yopishib, bagajgacha sirpanadi.   13 Girdob faqat bagaj ortida.
X, Y = top_contour(CS, CS_CUT); Ys = smooth(Y, 3)
n = len(X); peak = int(np.argmin(Ys[: int(n * 0.8)]))
i_tr = n - 1
# rear-glass segment: from the roof peak back to where the slope flattens onto the trunk
dYs = np.gradient(Ys)
seg_end = peak + int(np.argmax(dYs[peak:] > 0.9)) if (dYs[peak:] > 0.9).any() else peak
glass_end = seg_end + int(np.argmax(dYs[seg_end:] < 0.25))
co_glass = path([(X[i], Ys[i] - 6) for i in range(peak, glass_end, 4)])
scene(t_s11, t_s12, _beat='COBALT SLOPED GLASS',
      titles=[dict(text='Qiya oyna', at=rel(T('qiya'), t_s11) - 0.15, underline=True)],
      layers=[dict(src=CS['src'], w=CS['w'], x=CS['cx'], y=CS['cy'], anim='slideRight', animDur=0.5)],
      tags=[dict(text='Cobalt', at=0.1, x=CS['cx'], y=CS['y0'] - 90, bg='#F2F1EC')],
      flows=[dict(d=co_glass, at=rel(T('orqa', 4), t_s11), draw=0.7, color=YEL, dash=None, width=12)])
clines = [streamline(CS, gp, 30, 190, attached=True, cut=CS_CUT) for gp in (14, 55, 105)]
tx_end = X[-1]; ty_trunk = Ys[-1]
scene(t_s12, t_s13, _beat='ATTACHED FLOW', transition='cut',
      titles=[dict(text='Bagajgacha', at=rel(T('bagajgacha'), t_s12) - 0.1, underline=True)],
      layers=[dict(src=CS['src'], w=CS['w'], x=CS['cx'], y=CS['cy'], anim='none')],
      flows=[dict(d=d, at=0.05 + i * 0.12, draw=1.4) for i, d in enumerate(clines)])
aC = np.array(CS['im'])[..., 3] > 128
rearface = [(CS['x0'] + np.nonzero(aC[r])[0].max() * CS['s'], CS['y0'] + r * CS['s']) for r in range(int(aC.shape[0] * 0.45), int(aC.shape[0] * 0.8), 6) if aC[r].any()]
cvx = max(p[0] for p in rearface) + 85; cvy = (rearface[0][1] + rearface[-1][1]) / 2 + 10
scene(t_s13, t_s14, _beat='VORTEX ONLY BEHIND TRUNK', transition='cut',
      titles=[dict(text='Bagaj ortida', at=rel(T('bagaj'), t_s13) - 0.1, underline=True)],
      layers=[dict(src=CS['src'], w=CS['w'], x=CS['cx'], y=CS['cy'], anim='none')],
      flows=[dict(d=d, at=0, draw=0.01) for d in clines],
      vortices=[dict(at=rel(T('girdob'), t_s13) + 0.1, x=cvx, y=cvy, r=80, spin=320)],
      mud=[dict(at=rel(T('faqat'), t_s13), from_=dict(x=CS['x0'] + aC.shape[1] * 0.8 * CS['s'], y=CS['y0'] + CS['h'] - 10), ctrl=dict(x=cvx + 160, y=cvy + 20), x=rearface[-1][0] - 6, y=(rearface[0][1] + rearface[-1][1]) / 2 + 20, w=20, h=(rearface[-1][1] - rearface[0][1]) * 0.6, count=14, stagger=0.06, fly=0.8, size=22)])

# 14 Oyna deyarli toza qoladi.
scene(t_s14, t_end, _beat='CLEAN GLASS', handlePos='center',
      titles=[dict(text='Toza qoladi', at=rel(T('toza'), t_s14) - 0.15, underline=True)],
      layers=[dict(src=CR['src'], w=CR['w'], x=CR['cx'], y=CR['cy'], anim='zoomOut', animDur=0.6, glow=dict(at=rel(T('toza'), t_s14), r=420, dy=-150, color='rgba(127,211,240,0.35)'))],
      marks=[dict(type='check', at=rel(T('toza'), t_s14) + 0.25, x=540, y=CR['y0'] - 90, size=90)])

# -------- fix scene durations to the next scene start; rename from_
out = []
for i, (st, s) in enumerate(scenes):
    nxt = scenes[i + 1][0] if i + 1 < len(scenes) else t_end
    s['dur'] = round(nxt - st, 3)
    out.append(s)
txt = json.dumps(dict(handle='@autopodveska.uzb', voiceover='vo.wav', muteAll=True, scenes=out), ensure_ascii=False, indent=1)
txt = txt.replace('"from_"', '"from"')
open('public/props.json', 'w').write(txt)
print('scenes', len(out), 'total', round(sum(s['dur'] for s in out), 2))
for (st, s) in scenes: print(f"{st:6.2f} {s['dur']:5.2f} {s['_beat']}")
