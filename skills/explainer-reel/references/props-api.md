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

## Aero / fluid overlays (v2: airflow, vortex, mud, wiper, tags)
Added for the Spark vs Cobalt rear-wiper reel (`template/examples/spark-cobalt-dvornik.json`, builder
`template/examples/build_spark_cobalt.py`). Use them for any "air / water / dirt flows here" explainer
(aerodynamics, ventilation, splash, drainage, smoke, cooling).
```jsonc
"flows":    [ {"d": "M30,700 L400,650 L900,660", "at": 0.1, "draw": 1.0,        // SVG path, draws in then dashes march
               "color": "#7FD3F0", "width": 9, "dash": [26, 18], "march": 120},   // dash:null = solid contour line
              {"d": "...", "at": 0.3, "color": "#FFCC40", "dash": null, "width": 11} ], // yellow profile highlight
"vortices": [ {"at": 1.8, "x": 880, "y": 900, "r": 105, "spin": 300, "turns": 2.2, "squash": 1} ],  // dashed spinning spiral
"mud":      [ {"at": 0.5, "from": {"x": 760, "y": 1300}, "ctrl": {"x": 1000, "y": 900},          // blobs fly on an arc...
               "x": 840, "y": 860, "w": 26, "h": 160, "count": 22, "stagger": 0.07, "fly": 0.9, "size": 24}, // ...and splat
              {"at": 0, "x": 540, "y": 930, "w": 470, "h": 160, "count": 110, "size": 34, "film": 0.8,   // pop in place + dirt film
               "wipe": {"at": 1.2, "dur": 1.3, "x": 540, "y": 1020, "from": 180, "to": 360}} ],   // cleared by a wiper sweep
"wipers":   [ {"at": 1.2, "dur": 1.3, "x": 540, "y": 1020, "len": 250, "from": 180, "to": 358} ], // 0=right 90=down 180=left 270=up
"tags":     [ {"text": "Past bosim", "at": 0.7, "x": 860, "y": 760, "bg": "#7FD3F0"} ],
"layers":   [ {"src": "img/car_rear.png", "w": 700, "filter": "brightness(0.62) saturate(0.85)"} ]  // night shot
```
- **Streamlines that hug a car**: don't hand-draw them. Trace the image's alpha top contour, offset it upward by
  20-150 px, smooth it, and cut it at the rear edge (`rear_col`: the right-most opaque column in the roof band).
  A sharp vertical back = lines leave straight (separation) + `vortices` behind; a sloped back = lines follow
  the slope down to the trunk (attached flow). See `build_spark_cobalt.py`.
- **Wiper on a generated rear view**: paint the baked-in wiper out of the PNG (interpolate the rows above and
  below it), then let `wipers` + `mud.wipe` (same pivot/angles) sweep and clear the dirt.
- Sounds: `sfx_cues.py` maps flows → `public/sfx/air.wav`, vortices → `vortex.wav`, flying mud → `mud.wav`,
  wipers → `wiper.wav`, tags → kit pop. Make those files with ElevenLabs `/v1/sound-generation`
  (prompts in `references/sound-design.md`). A `spark` mark with `"quiet": true` gets a soft pop instead of a zap.

## Commands
```bash
npx remotion studio --props=public/props.json                       # live preview (local machine)
npx remotion still ExplainerReel out/f.png --frame=120 --props=public/props.json
npx remotion render ExplainerReel out/reel.mp4 --props=public/props.json --codec=h264 --crf=18
# sandbox: add --browser-executable=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64)/chrome-headless-shell
```
