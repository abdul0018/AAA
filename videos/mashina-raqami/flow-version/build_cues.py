import json, os, re, importlib.util
spec = importlib.util.spec_from_file_location('s', '../skill/explainer-reel/scripts/sfx_cues.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
kit = m.Kit('~/.claude/skills/sfx-kit'); W = json.load(open('words.json')); P = json.load(open('public/props.json'))
norm = lambda w: re.sub(r'[.,:!?]+$', '', w.lower())
def T(w, n=1):
    k = 0
    for x in W:
        if norm(x['w']) == w:
            k += 1
            if k == n: return x['s']
pub = os.path.abspath('public/sfx'); cues = []
def fx(n, t, why, g, ml=None, loop=False): cues.append({"file": f"{pub}/{n}", "start": round(max(0, t), 3), "rate": 1, "gain_db": g, "uvo_db": -3, "trim": 0, "max_len": ml, "loop": loop, "why": why})
def k(sid, t, why, g=0): cues.append(kit.cue(sid, t, why, g))
shots = [T('raqam'), T('chapdagi'), T('oxirida'), T('oxirida', 2), T('paa'), T('ppp'), T('hudud', 2), T('yashil', 2), T('auksionda'), T('lekin', 2)]
fx('road.wav', 0, 'road ambience', -20, P['end'], True)
for s in shots: fx('whoosh.wav', s - 0.1, 'lane change', -8)
for w, n in [('yashil', 1), ('sty', 1), ('dav', 1)]: k('pop-small-in', T(w, n), f'ring {w}', -4)
fx('charge.wav', T('zaryadlanadi') - 0.1, 'EV charging', -8)
fx('siren.wav', T('oxirida') + 0.3, 'siren', -12, 4.5)
for n in (1, 2, 3): fx('horn.wav', T('signal', n) + 0.1, 'polite horn', -10)
k('notification-failure-knock', T('ikki') + 0.1, 'think twice', -8); k('notification-failure-knock', T('uch') + 0.1, 'think three times', -6)
fx('cash.wav', T('narxi') + 0.2, 'price', -4); k('data-countup-short', T("to'qqizta"), 'nine cars', -7)
k('impact-light-hard', T('raqamsiz'), 'punchline', -6)
fx('click.wav', T('raqam', 3) - 0.1, 'plate comes off', -5); k('reverse-whoosh-short-soft', T('ariza') + 0.6, 'plate spins away', -6)
k('pop-medium-in', T('mashinangiz') + 0.05, 'plate back', -5); k('sting-minimal-short', P['end'] - 1.2, 'outro', -7)
cues.sort(key=lambda x: x['start']); json.dump({"fps": 30, "duration": P['end'], "cues": cues}, open('cues.json', 'w'), indent=1); print(len(cues))
