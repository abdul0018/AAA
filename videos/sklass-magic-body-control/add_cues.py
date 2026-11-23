"""Auto cues from sfx_cues.py + topic foley (ElevenLabs) -> cues.json."""
import json, os
W = json.load(open('words.json')); A = json.load(open('cues_auto.json'))
def T(w, n=1):
    k = 0
    for x in W:
        if x['w'].lower().strip('.,:!?') == w.lower().strip('.,:!?'):
            k += 1
            if k == n: return x['s']
    raise KeyError(w)
pub = os.path.abspath('public/sfx')
cues = [c for c in A['cues'] if c['why'] != 'airflow lines']  # the dashed lines here are camera beams, not air
def fx(name, t, why, g, max_len=None, uvo=-3):
    cues.append({"file": os.path.join(pub, name), "start": round(max(0, t), 4), "rate": 1, "gain_db": g, "uvo_db": uvo, "trim": 0, "max_len": max_len, "loop": False, "why": why})
fx('glide.wav', 0.0, 'S-Class rolls in', -12)
fx('scan.wav', T('chuqurni') + 0.05, 'camera scan (hook)', -6)
fx('pothole.wav', T('tushadi') - 0.05, 'ordinary car hits the pothole', -3)
fx('scan.wav', T('u') - 0.05, 'camera scan 15 m', -6)
fx('hydraulic.wav', T('buyruq'), 'command to wheels', -8)
fx('hydraulic.wav', T('tushiradi') - 0.1, 'strut lowers', -4)
fx('hydraulic.wav', T("ko'taradi") - 0.1, 'strut raises', -4)
fx('glide.wav', T('natijada') - 0.2, 'S-Class glides over the pothole', -8)
fx('whoosh_lean.wav', T('egiladi') - 0.5, 'leans into the curve', -7)
fx('scan.wav', T('sizningcha') + 0.1, 'scan (loop end)', -9)
cues.sort(key=lambda c: c['start'])
A['cues'] = cues
json.dump(A, open('cues.json', 'w'), indent=1)
print(len(cues), 'cues')
