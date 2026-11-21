# props.json API (template/src/types.ts is the source of truth)

Canvas 1080x1920 @ 30 fps. **All times are seconds relative to the scene start; all positions are px, x/y =
the item's centre.** Scenes play back to back; each cross-fades over the previous one for `transitionFrames`
(default 10). Total length = sum of `scene.dur`; make it equal the VO length (+0.3 s).

```jsonc
{
  "handle": "@yourhandle",            // watermark + IG pill
  "voiceover": "vo.wav",              // public/ path
  "music": "sfx/music_bed.wav", "musicVolume": 0.09,
  "sfxVolume": 0.55, "autoSfx": true, "showPill": true, "transitionFrames": 10,
  "scenes": [
    {
      "dur": 4.5,
      "transition": "fade",           // or "cut"
      "handlePos": "center",          // left | center | right (move it every scene)
      "ground": {"y": 1290, "x0": 150, "x1": 930},
      "layers": [ {"src": "img/door.png", "w": 780, "x": 660, "y": 1060, "anim": "fade"},
                  {"src": "img/hand.png", "w": 560, "x": 340, "y": 1193, "at": 0.5, "anim": "slideLeft", "z": 2,
                   "glow": {"at": 1.0, "r": 380}, "shakeAt": [1.2],
                   "moves": [{"at": 2.0, "dur": 0.6, "x": 380}] } ],
      "titles":   [ {"text": "Sizni ham\ntok uradimi?", "at": 0.0, "underline": true},
                    {"text": "Chirs!", "at": 3.4, "color": "red"},
                    {"text": "Tok uradimi?", "kicker": "sizni boshqa narsa ham", "at": 0}, 
                    {"text": "...", "at": 1, "out": 2.5, "sub": "zarari yo'q", "subAt": 1.6, "size": 70} ],
      "counters": [ {"at": 1.6, "dur": 1.2, "from": 3, "to": 10000, "suffix": " VOLT", "sub": "zarari yo'q", "subAt": 4.0} ],
      "charges":  [ {"at": 1.8, "x": 300, "y": 1200, "w": 400, "h": 210, "count": 12, "sign": "-",
                     "flowTo": {"x": 540, "y": 600, "at": 3.0, "dur": 0.8}} ],
      "glows":    [ {"at": 0.5, "x": 540, "y": 1000, "r": 420} ],
      "insets":   [ {"src": "img/closeup.png", "at": 1.0, "x": 540, "y": 700, "r": 150, "zoom": 1.2,
                     "focusX": 0.5, "focusY": 0.5, "target": {"x": 420, "y": 1000}} ],
      "boxes":    [ {"at": 1.5, "x": 540, "y": 1230, "w": 600, "h": 70} ],
      "marks":    [ {"type": "check", "at": 2.0, "x": 540, "y": 800},      // check | cross | question | spark
                    {"type": "spark", "at": 3.4, "x": 622, "y": 1058, "size": 80} ],
      "rain":     [ {"at": 0, "out": 3.5} ],
      "shakeAt":  [3.4],
      "sfx":      [ {"src": "sfx/riser.wav", "at": 2.2, "volume": 0.6} ]
    }
  ]
}
```

## Layer animations
`fade` (default) · `pop` · `slideLeft` · `slideRight` · `slideUp` · `drop` · `walkIn` · `zoomOut` · `none`
(`animDur` sec, default 0.45). Use `none` when the same layer continues from the previous scene, so it doesn't
re-animate. Re-declare it at the same x/y/w and the cross-fade is invisible.

## Placement cheatsheet (matches the reference)
| Thing | x | y | w |
|---|---|---|---|
| object close-up (door, boot) | 540-660 | 1000-1060 | 620-800 |
| whole car side view | 540 | 1080 (ground 1290) | 880-920 |
| person seated in a car seat | 540 | 1080 | 650-720 |
| standing person | 540 | 950 (ground 1330) | 260-320 |
| hand reaching in | 300-360 | ≈ object y + 120 | 520-580 |
| magnifier | 540 | 650-720 | r 140-160 |
| title | (auto) | 335 | (auto) |

## Recipes
- **Camera pull-back** (door → car): end scene A with the door; scene B starts with the car `anim: zoomOut` and
  the door layer `out: 0.2`.
- **Number build-up then reassure**: `counters` with `sub` + `subAt` landing on the spoken word.
- **Discharge**: `charges[].flowTo` to the contact point + `marks: spark` + `shakeAt` + red title, all at the same t.
- **Countdown to safety**: a counter `from: 10000, to: 0` while charges `flowTo` the metal part.
- **Loop ending**: the last scene re-uses the hook question as `kicker` + `text`.

## Commands
```bash
npx remotion studio --props=public/props.json                       # live preview (local machine)
npx remotion still ExplainerReel out/f.png --frame=120 --props=public/props.json
npx remotion render ExplainerReel out/reel.mp4 --props=public/props.json --codec=h264 --crf=18
# sandbox: add --browser-executable=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64)/chrome-headless-shell
```
