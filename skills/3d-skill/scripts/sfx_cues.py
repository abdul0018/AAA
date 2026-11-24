#!/usr/bin/env python3
"""Turn an explainer-reel props.json into a frame-accurate SFX cue sheet using the professional SFX Kit.

Usage:
  python3 -I sfx_cues.py public/props.json --kit ~/.claude/skills/sfx-kit --out cues.json [--intensity soft|medium]

Every on-screen event in the props (scene cross-fades, headlines, underlines, counters, charges, insets, boxes,
marks, layer entrances, shakes, rain, custom `sfx`) is mapped to a kit sound and placed with
start = moment - sync.at (after rate fitting). Custom scene sfx may reference kit sounds as {"src": "kit:<id>"}
or plain files under public/ (e.g. "sfx/zap.wav" from make_sfx.py, used for electricity/rain which the kit lacks).

Output: {"fps":30,"duration":s,"cues":[{"file","start","rate","gain_db","uvo_db","trim","max_len","why"}...]}
Mix it with pro_mix.py.
"""
import argparse, json, os, sys

FPS = 30


def sec(s):
    return round(s * FPS)


class Kit:
    def __init__(self, root):
        self.root = os.path.expanduser(root)
        data = json.load(open(os.path.join(self.root, "sounds.json")))
        self.s = {x["id"]: x for x in data["sounds"]}

    def cue(self, sid, moment, why, gain_db=0.0, fit=None, max_len=None):
        """Place kit sound `sid` so its sync point meets `moment` (seconds). `fit` = length of the moment to fit."""
        x = self.s[sid]
        rate = 1.0
        lo, hi = x.get("adapt", {}).get("rate", [1, 1])
        if fit and x.get("span_seconds"):
            rate = min(max(x["span_seconds"] / fit, lo), hi)
        sync = x["sync"]["at"] / rate
        start = moment - sync
        trim = 0.0
        if start < 0:  # e.g. a riser into the first second: start at 0, trim the head
            trim, start = -start * rate, 0.0
        return {
            "file": os.path.join(self.root, x["file"]), "id": sid, "start": round(start, 4), "rate": round(rate, 4),
            "gain_db": gain_db, "uvo_db": x.get("under_voiceover_db", -3), "trim": round(trim, 4),
            "max_len": max_len, "why": why,
        }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("props")
    ap.add_argument("--kit", default="~/.claude/skills/sfx-kit")
    ap.add_argument("--public", default=None, help="public/ dir for non-kit files (default: next to props)")
    ap.add_argument("--out", default="cues.json")
    ap.add_argument("--intensity", default="soft", choices=["soft", "medium"])
    a = ap.parse_args()
    kit = Kit(a.kit)
    P = json.load(open(a.props))
    pub = a.public or os.path.dirname(os.path.abspath(a.props))
    tf = P.get("transitionFrames", 10)
    soft = a.intensity == "soft"
    W = lambda speed: f"whoosh-{speed}-{'soft' if soft else 'medium'}"
    cues = []
    add = lambda c: cues.append(c)
    start_f = 0
    for i, s in enumerate(P["scenes"]):
        T = start_f / FPS  # scene start on the timeline
        auto = s.get("autoSfx", P.get("autoSfx", True))
        if auto:
            # scene cross-fade: a gentle slow whoosh peaking mid-fade
            if i > 0 and s.get("transition") != "cut":
                add(kit.cue(W("slow"), T + tf / FPS / 2, f"scene {i+1} transition", -5))
            for t in s.get("titles", []):
                m = T + t["at"]
                if t.get("color") == "red":  # payoff: suck-in -> hit -> sub tail
                    add(kit.cue("reverse-whoosh-short-strong", m, "impact build", -3))
                    add(kit.cue("impact-deep-hard", m, "impact word", -1))
                    add(kit.cue("bass-sub-drop-short", m, "impact tail", -6))
                else:
                    add(kit.cue("pop-small-in", m, f"title '{t['text'][:18]}'", -2))
                    if t.get("underline"):
                        add(kit.cue("writing-highlighter", m + 4 / FPS, "underline draws", -4, fit=10 / FPS))
                if t.get("sub"):
                    add(kit.cue("pop-small-in", T + t.get("subAt", t["at"] + 0.4), "sub line", -6))
            for c in s.get("counters", []):
                m, d = T + c["at"], c["dur"]
                if d >= 0.45 and c["to"] != c["from"]:
                    up = c["to"] > c["from"]
                    base = "data-countup" if up else "data-decrease"
                    size = "short" if d < 0.8 else "medium" if d < 1.7 else "long"
                    add(kit.cue(f"{base}-{size}", m, "counter runs", -2, fit=d, max_len=d + 0.25))
                add(kit.cue("data-number-land", m + d, "number lands", -1))
            for c in s.get("charges", []):
                add(kit.cue("shimmer-short-soft", T + c["at"], "charges appear", -5))
                if c.get("flowTo"):
                    f = c["flowTo"]
                    add(kit.cue(W("medium"), T + f["at"] + f["dur"] * 0.6, "charges stream", -4))
            for c in s.get("insets", []):
                add(kit.cue("move-zoom-in", T + c["at"] + 0.18, "magnifier opens", -3))
            for b in s.get("boxes", []):
                add(kit.cue("writing-marker-draw", T + b["at"], "highlight box draws", -4, max_len=0.5))
            for mk in s.get("marks", []):
                m = T + mk["at"]
                if mk["type"] == "check":
                    add(kit.cue("notification-success-soft", m, "check", -3))
                elif mk["type"] == "cross":
                    add(kit.cue("notification-failure-knock", m, "cross", -2))
                elif mk["type"] == "question":
                    add(kit.cue("pop-medium-bubble", m, "question mark", -5))
                elif mk["type"] == "spark" and mk.get("quiet"):  # a visual burst that is not electric
                    add(kit.cue("pop-small-out", m, "burst", -6))
                elif mk["type"] == "spark":
                    zap = os.path.join(pub, "sfx", "zap.wav")
                    if os.path.exists(zap):
                        add({"file": zap, "start": round(m, 4), "rate": 1, "gain_db": -6, "uvo_db": -3, "trim": 0, "max_len": None, "why": "electric spark"})
                    add(kit.cue("impact-light-hard", m, "spark contact", -4))
            for l in s.get("layers", []):
                m, ad, an = T + l.get("at", 0), l.get("animDur", 0.45), l.get("anim", "fade")
                if an in ("slideLeft", "slideRight", "slideUp"):
                    sp = "fast" if ad <= 0.44 else "medium" if ad <= 0.8 else "slow"
                    add(kit.cue(W(sp), m + ad * 0.25, f"{an} {os.path.basename(l['src'])}", -3))
                elif an == "walkIn":
                    add(kit.cue(W("slow"), m + ad * 0.5, "walk in", -6))
                elif an == "zoomOut":
                    add(kit.cue("move-zoom-out", m, "camera pull-back", -4, fit=ad))
                elif an == "pop":
                    add(kit.cue("pop-medium-in", m, "object pops in", -3))
                elif an == "drop":
                    add(kit.cue("impact-light-soft", m + ad, "object lands", -3))
            # ---- aero / fluid overlays (v2): flows, vortices, mud, wipers, tags
            def pubfile(name, m, why, g, max_len=None, uvo=-3, loop=False):
                fp = os.path.join(pub, "sfx", name)
                if os.path.exists(fp):
                    add({"file": fp, "start": round(m, 4), "rate": 1, "gain_db": g, "uvo_db": uvo, "trim": 0, "max_len": max_len, "loop": loop, "why": why})
                    return True
                return False
            drawn = [f for f in s.get("flows", []) if f.get("draw", 0.7) >= 0.3 and f.get("dash", [1]) is not None]
            if drawn:
                m = T + min(f["at"] for f in drawn)
                if not pubfile("air.wav", m, "airflow lines", -9, max_len=s["dur"] - (m - T) + 0.3):
                    add(kit.cue(W("slow"), m + 0.3, "airflow lines", -6))
            for f in s.get("flows", []):
                if f.get("dash", [1]) is None and f.get("draw", 0.7) >= 0.3:
                    add(kit.cue("writing-marker-draw", T + f["at"], "contour line draws", -5, max_len=0.6))
            for v in s.get("vortices", []):
                if v["at"] > 0.05 and not pubfile("vortex.wav", T + v["at"], "vortex spins up", -7, max_len=1.6):
                    add(kit.cue("reverse-whoosh-short-soft", T + v["at"], "vortex", -5))
            for md in s.get("mud", []):
                if md["at"] < 0:
                    continue
                if md.get("from"):
                    pubfile("mud.wav", T + md["at"] + md.get("fly", 0.55) * 0.9, "mud splats", -5, max_len=1.4)
                else:
                    add(kit.cue("pop-small-bubble", T + md["at"], "mud builds up", -9))
                    if md.get("count", 18) > 40:
                        pubfile("mud.wav", T + md["at"] + 0.2, "glass fills with mud", -9, max_len=1.4)
            for wp in s.get("wipers", []):
                if wp["at"] < s["dur"]:
                    pubfile("wiper.wav", T + wp["at"], "wiper sweep", -3, max_len=wp["dur"] + 0.3)
            for tg in s.get("tags", []):
                add(kit.cue("pop-small-in", T + tg["at"], f"tag {tg['text']}", -5))
            reds = {round(t["at"], 2) for t in s.get("titles", []) if t.get("color") == "red"}
            for sh in s.get("shakeAt", []):
                if round(sh, 2) not in reds:
                    add(kit.cue("impact-heavy-firm", T + sh, "shake", -4))
            for r in s.get("rain", []):
                rain = os.path.join(pub, "sfx", "rain.wav")
                if os.path.exists(rain):
                    end = r.get("out", s["dur"])
                    add({"file": rain, "start": round(T + r["at"], 4), "rate": 1, "gain_db": -8, "uvo_db": -2, "trim": 0, "max_len": end - r["at"], "loop": True, "why": "rain"})
        for x in s.get("sfx", []):
            src, m = x["src"], T + x["at"]
            g = x.get("gain_db", 0 if "volume" not in x else round(20 * __import__("math").log10(max(x["volume"], 1e-3)), 1))
            if src.startswith("kit:"):
                add(kit.cue(src[4:], m, x.get("why", "custom"), g, fit=x.get("fit"), max_len=x.get("max_len")))
            else:
                add({"file": os.path.join(pub, src), "start": round(m, 4), "rate": 1, "gain_db": g, "uvo_db": -3, "trim": 0,
                     "max_len": (x["loopUntil"] - x["at"]) if "loopUntil" in x else x.get("max_len"), "loop": "loopUntil" in x, "why": x.get("why", "custom file")})
        start_f += sec(s["dur"])
    cues.sort(key=lambda c: c["start"])
    out = {"fps": FPS, "duration": start_f / FPS, "cues": cues}
    json.dump(out, open(a.out, "w"), indent=1)
    for c in cues:
        print(f"{c['start']:7.3f}s  {os.path.basename(c['file']):34} rate {c['rate']:.2f}  {c['gain_db']:+5.1f} dB  {c['why']}")
    print(f"wrote {a.out}: {len(cues)} cues, {out['duration']:.2f}s")


if __name__ == "__main__":
    main()
