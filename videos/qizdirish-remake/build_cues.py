"""Sound design cue sheet for the warm-up reel (timed from words.json) -> cues.json for pro_mix.py."""
import json, os, sys, importlib.util
spec = importlib.util.spec_from_file_location('sfx_cues', os.path.join(os.path.dirname(__file__), '..', 'skill', 'explainer-reel', 'scripts', 'sfx_cues.py'))
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
kit = m.Kit('~/.claude/skills/sfx-kit')
W = json.load(open('words.json')); P = json.load(open('public/props.json'))
def T(w, n=1):
    k = 0
    for x in W:
        if x['w'].lower().rstrip('.,:!?') == w.lower().rstrip('.,:!?'):
            k += 1
            if k == n: return x['s']
    raise KeyError(w)
pub = os.path.abspath('public')
cues = []
def kc(sid, t, why, g=0, fit=None, max_len=None): cues.append(kit.cue(sid, t, why, g, fit=fit, max_len=max_len))
def fx(name, t, why, g, max_len=None, loop=False, uvo=-3):
    cues.append({"file": os.path.join(pub, 'sfx', name), "start": round(max(0, t), 4), "rate": 1, "gain_db": g, "uvo_db": uvo, "trim": 0, "max_len": max_len, "loop": loop, "why": why})

tAsl, tQar, tMot, tYana, tSov, tOrt, tAsr, tTur, tShu, tFaq, tEndi, tGaz, tOtam, tSiz = [T(w, n) for w, n in [('aslida',1),('qarang',1),('motorni',2),('yana',1),('sovuq',1),('ortiqchasi',1),('asrayman',1),('turgan',1),('shuning',1),('faqat',1),('endi',1),('gazda',1),('otam',1),('siz-chi?',1)]]
tOn, tUp, tTop, tBir, tBor = T('yoqdingiz'), T('yuqoriga'), T('chiqadi') + 0.1, T('bir'), T('boradi')
end = P['end']
heads = [0.05, tAsl, T('sovuqda') - 0.1, tMot, T("yigirma-o'ttiz"), tBir, tYana, tSov, tOrt, tAsr, tTur, tShu, tFaq, tEndi, tGaz, T('reduktor'), T("bo'lmasa"), tOtam]
for h in heads:
    kc('pop-small-in', h, 'headline', -6)
for s in [tQar, tMot, tYana, tSov, tTur, tShu, tFaq, tEndi, tGaz, tOtam]:
    kc('whoosh-slow-soft', s, 'scene change', -6)
# engine: idling car, start, idle under the engine model, fuel spray
fx('idle.wav', 0, 'idle (car)', -17, max_len=tQar + 0.3, loop=True, uvo=-2)
fx('start.wav', tOn - 0.35, 'engine start', -7)
fx('idle.wav', tOn + 1.2, 'idle (engine model)', -19, max_len=tYana - tOn - 1.0, loop=True, uvo=-2)
fx('idle.wav', tYana, 'idle (car)', -17, max_len=tSov - tYana + 0.3, loop=True, uvo=-2)
fx('idle.wav', tSov, 'idle (cold engine)', -19, max_len=tTur - tSov + 0.2, loop=True, uvo=-2)
fx('spray.wav', T('benzinni') - 0.2, 'fuel spray', -11, max_len=tTur - T('benzinni') + 0.2, loop=True)
fx('idle.wav', tOtam, 'idle (car)', -17, max_len=tSiz + 1.2 - tOtam, loop=True, uvo=-2)
# timers
fx('tick.wav', 0.25, 'timer runs', -12, max_len=tAsl - 0.3, loop=True)
fx('tick.wav', tOn, 'timer 0-1 min', -14, max_len=tBor - tOn, loop=True)
fx('tick.wav', tYana + 0.1, 'timer to 10 min', -12, max_len=tSov - tYana - 0.4, loop=True)
fx('tick.wav', tShu + 0.2, 'timer 1 min', -14, max_len=T("ma'qul") - tShu - 0.2, loop=True)
kc('impact-light-hard', tAsl, 'red 10:00', -4); kc('notification-failure-knock', tAsl + 0.2, 'fuel gauge', -6)
kc('notification-success-soft', tBor, 'oil everywhere, 1:00', -4)
kc('data-number-land', tOtam + 0.15, 'yellow 10:00', -5)
# oil
fx('gloop.wav', T('moy') - 0.2, 'honey-thick oil', -5)
kc('riser-2s-soft', tUp, 'oil climbs the pipe', -8, fit=tTop - tUp)
kc('shimmer-short-soft', tTop, 'camshaft oiled', -6)
kc('shimmer-short-soft', tBir + 0.4, 'oil film on cylinder', -8)
# pills
for w in ['asrayapman', 'quyuq', 'suyultiradi', 'havoga']:
    kc('pop-medium-in', T(w), f'pill {w}', -5)
kc('notification-failure-knock', T('suyultiradi') + 0.15, 'oil thinned', -6)
kc('impact-light-soft', tAsr, 'harm', -5)
# road
fx('drive.wav', T('yurayotgan') - 0.3, 'car drives', -9)
kc('data-number-land', T('yigirma'), '20 daqiqa', -5); kc('notification-success-soft', T('besh'), '5 daqiqa', -5)
fx('drive.wav', T("yo'lga") - 0.4, 'car pulls away', -9)
kc('data-countup-medium', T('uch') - 0.2, '3 km bar', -9, fit=T('tezlik') - 0.4 - T('uch') + 0.2)
kc('data-countup-short', T('tezlik'), 'speed gauge', -8); kc('data-countup-short', T('oborot'), 'rpm gauge', -8)
# numbers
kc('data-number-land', T('oyiga'), '4,5 soat', -3); kc('data-number-land', T('olti'), '6 litr', -3)
kc('reverse-whoosh-short-soft', T('havoga') + 0.2, 'fuel evaporates', -6)
# gas reducer
fx('gas.wav', T('reduktor'), 'gas hiss', -15, max_len=tOtam - T('reduktor'), loop=True)
fx('freeze.wav', T('muzlab') - 0.3, 'freezing', -4)
# ending
kc('impact-deep-hard', tSiz, 'SIZ-CHI?', -6); kc('bass-sub-drop-short', tSiz, 'tail', -9)
kc('sting-minimal-short', tSiz + 1.2, 'outro', -6)
cues.sort(key=lambda c: c['start'])
json.dump({"fps": 30, "duration": end, "cues": cues}, open('cues.json', 'w'), indent=1)
print(len(cues), 'cues')
