import json, os, re, importlib.util
spec = importlib.util.spec_from_file_location('s', '../skill/explainer-reel/scripts/sfx_cues.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
kit = m.Kit('~/.claude/skills/sfx-kit'); W = json.load(open('words.json')); P = json.load(open('public/props.json'))
norm = lambda w: re.sub(r'[.,:!?]+$', '', w.lower().replace('"', ''))
def T(w, n=1):
    k = 0
    for x in W:
        if norm(x['w']) == w:
            k += 1
            if k == n: return x['s']
pub = os.path.abspath('public/sfx'); cues = []
def fx(n, t, why, g, ml=None, loop=False): cues.append({"file": f"{pub}/{n}", "start": round(max(0, t), 3), "rate": 1, "gain_db": g, "uvo_db": -3, "trim": 0, "max_len": ml, "loop": loop, "why": why})
def k(sid, t, why, g=0): cues.append(kit.cue(sid, t, why, g))
c = [0, T('ovozini'), T('eshiting'), T("g'ildirak"), T('havodagi'), T('sinovda'), T('abs'), T('burilishda'), T('siz', 2), T('amortizator', 3), T('bugunoq'), P['end']]
for i in range(1, 11): k('whoosh-fast-hard', c[i], f'cut {i}', -6); fx('boom.wav', c[i], 'hit on cut', -10)
# every shouted word (ends with !) gets a hard boom
for x in W:
    if x['w'].rstrip('"').endswith('!') or x['w'].endswith('?!'): fx('boom.wav', x['s'], f"shout {x['w']}", -7)
fx('radio.wav', 0, 'loud stereo', -12, c[1]); fx('knock.wav', 0.9, 'knock', -4); fx('knock.wav', 2.4, 'knock', -5)
fx('record.wav', c[1] - 0.15, 'record scratch', -4)
k('data-countup-short', c[1] + 0.2, 'volume up', -6); k('impact-heavy-firm', T('qoladimi'), 'stamp', -4)
k('impact-heavy-firm', T('eskirgan') - 0.05, 'stamp', -5)
fx('knock.wav', c[3] + 0.5, 'wheel bouncing', -5); fx('pothole.wav', c[3] + 0.6, 'bounce', -6)
fx('skid.wav', c[4], 'no grip braking', -6); k('impact-heavy-firm', T('bermaydi'), 'stamp', -4)
fx('skid.wav', c[5] + 0.6, 'emergency stop', -6); k('data-number-land', T('uzaygan') + 0.3, '+6 m', -2)
fx('alarm.wav', c[6], 'warning chime', -6); fx('alarm.wav', T('esp'), 'warning chime', -7)
fx('rain.wav', c[7], 'rain', -12, c[8] - c[7]); fx('spring.wav', c[7] + 0.3, 'body roll', -7)
k('impact-heavy-firm', T('deysiz'), 'strike', -3); k('notification-success-soft', T('xavfsizlik'), 'shield', -4)
k('sting-bold-short', P['end'] - 1.5, 'outro', -6)
cues.sort(key=lambda x: x['start']); json.dump({"fps": 30, "duration": P['end'], "cues": cues}, open('cues.json', 'w'), indent=1); print(len(cues))
