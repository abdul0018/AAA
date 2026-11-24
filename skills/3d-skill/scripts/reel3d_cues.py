#!/usr/bin/env python3
"""3d-skill: Reel3D props.json -> cues.json for pro_mix.py (SFX Kit + optional foley files in public/sfx/).

Usage: python3 -I reel3d_cues.py public/props.json --kit ~/.claude/skills/sfx-kit --out cues.json
Foley files used when present in public/sfx/: hum.wav (field/battery), ev_whine.wav (current flow),
ping.wav (chat message), thermal.wav (IR panel), heat.wav (seat heater), stamp.wav (stamp/strike), tick.wav (timer).
"""
import argparse, importlib.util, json, os

ap = argparse.ArgumentParser()
ap.add_argument('props'); ap.add_argument('--kit', default='~/.claude/skills/sfx-kit'); ap.add_argument('--out', default='cues.json')
ap.add_argument('--sfx-cues', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx_cues.py'))
a = ap.parse_args()
spec = importlib.util.spec_from_file_location('sfx_cues', a.sfx_cues); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
kit = m.Kit(a.kit)
P = json.load(open(a.props)); pub = os.path.join(os.path.dirname(os.path.abspath(a.props)), 'sfx')
cues = []
def k(sid, t, why, g=0, fit=None, max_len=None): cues.append(kit.cue(sid, t, why, g, fit=fit, max_len=max_len))
def fx(name, t, why, g, max_len=None, loop=False, uvo=-3):
    f = os.path.join(pub, name)
    if os.path.exists(f): cues.append({"file": f, "start": round(max(0, t), 4), "rate": 1, "gain_db": g, "uvo_db": uvo, "trim": 0, "max_len": max_len, "loop": loop, "why": why}); return True
    return False

for i, sc in enumerate(P['scenes']):
    s0, s1 = sc['from'], sc['to']
    if i > 0: k('whoosh-fast-soft', s0, f'cut {i+1}', -8)
    for it in sc['items']:
        kd, at = it['kind'], it.get('at', s0)
        if kd == 'headline':
            for j, _ in enumerate(it['lines']): k('pop-small-in', at + j * 0.08, 'headline line', -5)
        elif kd == 'xray':
            k('shimmer-short-soft', at + 0.1, 'x-ray car', -9)
            for o in it.get('overlays', []):
                t = o['at']
                if o['type'] == 'pulse': fx('hum.wav', t, 'battery hum', -20, max_len=max(0.5, s1 - t), loop=True, uvo=-2)
                elif o['type'] == 'flow': fx('ev_whine.wav', t - 0.1, 'current flows', -8)
                elif o['type'] == 'rings': fx('hum.wav', t, 'magnetic field', -13, max_len=max(0.5, s1 - t), loop=True); k('reverse-whoosh-short-soft', t, 'field rings', -9)
                elif o['type'] == 'marker': k('pop-medium-in', t, f"marker {o.get('value')}", -4)
                elif o['type'] == 'laser': k('click-hover-soft', t, 'laser', -8)
        elif kd == 'stat': k('pop-medium-in', at, 'stat card', -5); k('data-countup-short', at + 0.1, 'gauge', -8)
        elif kd == 'chat':
            k('pop-small-in', at, 'phone in', -7)
            for msg in it['msgs']: fx('ping.wav', msg['at'], 'chat message', -6) or k('notification-success-soft', msg['at'], 'chat message', -6)
        elif kd == 'grid100':
            k('pop-small-in', at, 'grid card', -7)
            for st in it['steps']: k('data-countup-short', st['at'], f"cells {st['n']}", -7); k('data-number-land', st['at'] + 0.55, st['big'], -4)
        elif kd == 'compare':
            k('pop-small-in', at, 'compare card', -7)
            for r in it['rows']: k('data-countup-short', r['at'] + 0.05, r['label'], -8)
        elif kd == 'notrad':
            k('pop-small-in', at, 'stamp card', -7)
            fx('stamp.wav', it['strikeAt'] + 0.2, 'strike', -4) or k('impact-light-hard', it['strikeAt'] + 0.2, 'strike', -4)
        elif kd == 'thermal':
            fx('thermal.wav', at, 'IR camera', -7)
            if it.get('heatAt') is not None: fx('heat.wav', it['heatAt'], 'seat heater', -7)
            if it.get('tempTo') is not None: k('data-countup-medium', it['tempAt'], 'temperature climbs', -6, fit=it.get('tempDur', 1.5)); k('notification-failure-knock', it['tempAt'] + it.get('tempDur', 1.5), 'too hot', -5)
            if it.get('tag'): k('click-tap-soft', it.get('tagAt', at), 'tag', -6)
        elif kd == 'switch': k('pop-small-in', at, 'switch card', -6); k('click-toggle-off-firm', it['offAt'] + 0.1, 'switch off', -2)
        elif kd == 'timer': k('pop-small-in', at, 'timer card', -6); fx('tick.wav', at + 0.2, 'clock', -14, max_len=1.6, loop=True)
        elif kd == 'pill': k('pop-medium-in', at, 'pill', -5)
        elif kd == 'label': k('click-tap-soft', at, 'label', -8)
# highlighted caption words
hl = [h.lower() for h in P.get('highlight', [])]
for w in P['words']:
    if any(w['w'].lower().strip('"“”«».,!?:').startswith(h) for h in hl): k('writing-marker-tick', w['s'], f"highlight {w['w']}", -5)
k('sting-minimal-short', P['end'] - 2.1, 'outro', -6)
cues.sort(key=lambda c: c['start'])
json.dump({"fps": 30, "duration": P['end'], "cues": cues}, open(a.out, 'w'), indent=1)
print(len(cues), 'cues ->', a.out)
