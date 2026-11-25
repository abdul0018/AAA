import json, os, importlib.util
spec = importlib.util.spec_from_file_location('s', '../skill/explainer-reel/scripts/sfx_cues.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
kit = m.Kit('~/.claude/skills/sfx-kit'); W = json.load(open('words.json')); P = json.load(open('public/props.json'))
def T(w, n=1):
    k = 0
    for x in W:
        if x['w'].lower().rstrip('.,:!?') == w:
            k += 1
            if k == n: return x['s']
pub = os.path.abspath('public/sfx'); cues = []
def fx(n, t, why, g, ml=None, loop=False): cues.append({"file": f"{pub}/{n}", "start": round(max(0, t), 3), "rate": 1, "gain_db": g, "uvo_db": -3, "trim": 0, "max_len": ml, "loop": loop, "why": why})
def k(sid, t, why, g=0): cues.append(kit.cue(sid, t, why, g))
c = [0, T('tormozni'), T('tormoz'), T('old'), T("do'nglikka"), T("to'g'risi"), T("g'ildirak"), T('mashina', 2), T('endi'), T('silkinish'), T('siz'), P['end']]
for i in range(1, 11): k('whoosh-fast-soft', c[i], f'cut {i}', -7)
for i in range(11): k('pop-small-in', c[i] + 0.1, 'caption', -6)
fx('idle.wav', 0, 'engine', -20, c[1], True); fx('drive.wav', 0.2, 'car drives', -14)
fx('pedal.wav', c[1] + 0.3, 'pedal pressed', -4); fx('brake.wav', c[2] + 0.1, 'brakes', -8)
fx('spring.wav', c[2] + 0.3, 'nose dives', -6); fx('spring.wav', c[3] + 0.2, 'spring squeezed', -8)
fx('pothole.wav', T('urilganda') + 0.15, 'hard hit', -3); k('impact-heavy-firm', T('urilganda') + 0.2, 'hit', -6)
k('notification-failure-knock', c[1] + 0.2, 'XATO', -6); k('notification-success-soft', c[5] + 0.2, "TO'G'RI", -5)
fx('brake.wav', c[5] + 0.4, 'slowing', -10); k('data-countup-short', c[5] + 0.3, 'speedo', -9)
fx('pedal.wav', T("qo'yib") - 0.1, 'pedal released', -5); fx('spring.wav', T('burni'), 'nose rises', -7)
k('shimmer-short-soft', T('ochiladi'), 'spring extended', -7)
fx('glide.wav', c[9], 'smooth ride', -10); fx('thunk.wav', c[9] + 0.6, 'soft bump', -5)
k('sting-minimal-short', P['end'] - 1.4, 'outro', -7)
cues.sort(key=lambda x: x['start']); json.dump({"fps": 30, "duration": P['end'], "cues": cues}, open('cues.json', 'w'), indent=1); print(len(cues))
