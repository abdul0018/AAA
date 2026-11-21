#!/usr/bin/env python3
"""Cue sheet for a ToonReel props.json -> pro_mix.py (explainer-reel/scripts/pro_mix.py).

Usage: python3 -I toon_cues.py public/props.json --kit ~/.claude/skills/sfx-kit --out cues.json

Sources of cues:
  * shots[i].sfx      [{src: "kit:<id>" | "<file under public/>", at, gain_db, fit, max_len, loopUntil, why}]
  * automatic         a soft slow whoosh peaking mid-way through every cross-fade (xfade) transition
  * props.beds        [{src, from, to, gain_db}] looping ambience beds in ABSOLUTE seconds (street, workshop...)
"""
import argparse, json, math, os, sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/explainer-reel/scripts"))
from sfx_cues import Kit  # noqa: E402  (same placement rules: start = moment - sync.at)

FPS = 30


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("props")
    ap.add_argument("--kit", default="~/.claude/skills/sfx-kit")
    ap.add_argument("--out", default="cues.json")
    ap.add_argument("--no-auto", action="store_true")
    a = ap.parse_args()
    kit = Kit(a.kit)
    P = json.load(open(a.props))
    pub = os.path.dirname(os.path.abspath(a.props))
    cues, start_f = [], 0
    for i, s in enumerate(P["shots"]):
        T = start_f / FPS
        tf = s.get("tf", 12)
        if not a.no_auto and i > 0 and s.get("transition", "xfade") != "cut":
            cues.append(kit.cue("whoosh-slow-soft", T + tf / FPS / 2, f"transition into {s.get('name', i + 1)}", -7))
        for x in s.get("sfx", []):
            m = T + x["at"]
            g = x.get("gain_db", 0)
            if x["src"].startswith("kit:"):
                cues.append(kit.cue(x["src"][4:], m, x.get("why", "kit"), g, fit=x.get("fit"), max_len=x.get("max_len")))
            else:
                loop = "loopUntil" in x
                cues.append({"file": os.path.join(pub, x["src"]), "start": round(m, 4), "rate": 1, "gain_db": g, "uvo_db": x.get("uvo_db", -3),
                             "trim": 0, "max_len": (x["loopUntil"] - x["at"]) if loop else x.get("max_len"), "loop": loop, "why": x.get("why", x["src"])})
        start_f += round(s["dur"] * FPS)
    for b in P.get("beds", []):
        cues.append({"file": os.path.join(pub, b["src"]), "start": b["from"], "rate": 1, "gain_db": b.get("gain_db", -14), "uvo_db": b.get("uvo_db", -4),
                     "trim": 0, "max_len": b["to"] - b["from"], "loop": True, "why": b.get("why", "ambience bed")})
    cues.sort(key=lambda c: c["start"])
    json.dump({"fps": FPS, "duration": start_f / FPS, "cues": cues}, open(a.out, "w"), indent=1)
    for c in cues:
        print(f"{c['start']:7.3f}s {os.path.basename(c['file']):30} {c['gain_db']:+5.1f} dB  {c['why']}")
    print(f"wrote {a.out}: {len(cues)} cues, {start_f / FPS:.2f}s")


if __name__ == "__main__":
    main()
