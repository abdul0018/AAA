---
name: 3d-skill
description: Style #4 ("3D skill"). Make vertical 9:16 chaptered explainer reels in the 3D-infographic look of the reference reels the user supplied (ZHS-style). Dark grid board with "+" crosshairs and warm bokeh, a header with avatar + handle + mono subtitle + "bob 01/10" chapter counter + orange chapter name + 10-segment progress bar, huge Unbounded headlines (yellow glow + white), karaoke captions (spoken words white, upcoming dim, key word in a red Figma-style selection box), a photoreal x-ray 3D car (glass shell, seats, glowing amber battery cells, orange springs) with animated overlays (battery pulse, current flow, field rings, laser, measurement markers), glass info cards (gauge + orange stat + mono label), a phone chat mock, a 100-cell grid chart, comparison bars, a "not radiation" stamp, a thermal-camera (IR) panel, switch/timer tip cards and a handle outro. Uzbek (or any language) voiceover, SFX Kit + ElevenLabs foley, pro mix. Use for "3D skill", "3D style", "like the zhscyber / electromobile health video", chaptered myth-busting car/EV/health topics, or /3d-skill.
---

# 3D skill: chaptered 3D-infographic reels

Reference: the user's screenshots of a ZHS reel ("Электромобиль бьёт по мужскому здоровью?"); see `assets/*_ref.jpg`.
Verified 2026-11-24 on "Elektr avtomobillar erkaklar salomatligiga zararlimi?" (66 s, 10 chapters,
`template/examples/`). Contact sheet: `assets/example-contact-sheet.png`.

## User defaults (don't ask again)
- Instagram handle **@autopodveska.uz**, avatar monogram "AP" on a lime circle.
- Voice: ElevenLabs **Adizzbek** `v4cqTf6wc2CXwA2tR7TF`, `eleven_v4`, uz, stability 0.45 / similarity 0.8 / style 0.3 /
  speed 1.1, `/with-timestamps` (no Whisper needed). The key is a network secret: send `-H "xi-api-key: proxy-injected"`.
- **Real products first**: if the topic names a car or product, find real photos (Wikimedia Commons, upload host
  `upload.wikimedia.org/wikipedia/commons/thumb/<md5[0]>/<md5[0:2]>/<File>/1280px-<File>`; md5 of the file name with
  underscores) and use them as `image_references`. See `../explainer-reel/references/real-products.md`.
- Insert pauses only inside real silences (silencedetect), with 8 ms fades. Scenes change with hard cuts plus a whoosh.

## Pipeline
1. **Research + script** (Uzbek, about 60 s, 130-150 words, **10 chapters**). Formula: savol (hook question), the
   myth/situation (chat), the mechanism, the measurement (numbers), the comparison, debunk, the real cause, its
   evidence, practical advice, verdict + question. Facts must be true: check with WebSearch, cite in the reply, and
   soften claims the study did not measure ("ta'sir qilishi mumkin").
2. **VO**: Adizzbek `/with-timestamps` → `words.json` (`[{w,s,e}]`). Optionally splice 1-2 pauses (hook, final question).
3. **3D assets** (Higgsfield `gpt_image_2_6`, quality high, opaque 16:9 on a flat `#1D1E22` background):
   - the x-ray hero: `assets/xray_ref.jpg` + a real photo of the car as `image_references`.
     Prompt core: "x-ray view … transparent smoky glass shell with thin glowing white edge lines, shaped exactly like
     the real car … seats … flat floor battery pack of glowing amber cells … orange coil springs … background solid
     flat very dark charcoal #1D1E22, no grid, no text".
   - a SIDE view with a ghost driver mannequin + HV cable (for measurement markers: feet / head).
   - Run `python3 -I scripts/make_alpha.py in.png out_a.png` on each (alpha from the bg distance). Don't use CSS
     `mix-blend-mode` (transformed parents isolate it, so the rectangle shows).
   - Measure overlay points by drawing a 100 px grid over the render (pulse centre, cable path, feet, head).
   Everything else (phone, cards, grid, thermal figure, gauges, switch, timer) is code: no credits needed.
4. **Props**: write a small builder (`template/examples/build_ev_health.py`): `T('word', n)` = the n-th occurrence's
   start time; the chapters start at their first word; one scene per chapter with hard cuts. Watch for a word that
   also appears earlier (e.g. inside a quote): use `T(word, 2)`.
5. **Render** `Reel3D` `--muted` → `scripts/reel3d_cues.py` → `scripts/pro_mix.py` with the music bed (`music_C.wav`).
   QA: a contact sheet of about 20 frames, frames at every cut, and silencedetect on the mix (expect 0 gaps).

## Props API (`template/src/Reel3D.tsx`, all times ABSOLUTE seconds)
```jsonc
{"handle":"@autopodveska.uz","avatar":"AP","subtitle":"elektromobil va salomatlik","end":66.05,
 "words":[...], "highlight":["nurlantiradi","radiatsiya"],          // karaoke words shown in the red selection box
 "chapters":[{"name":"savol","at":0},{"name":"chat","at":3.41}, ...], // header counter + progress bar
 "scenes":[{"from":0,"to":3.41,"caption":false,"items":[ ... ]}]}
```
Item kinds:
- **headline** `{at,out?,y,size,lines:[{text,color?}]}`. Unbounded 900, a colour line glows, and each line auto-fits.
- **xray** `{src,iw,ih,x,y,w,at,cam:[{at,dur,s,dx,dy}],overlays:[...]}`. Overlays (image px):
  - `pulse{x,y,rx,ry,color?}`
  - `flow{pts:[[x,y]...]}` (current dashes)
  - `rings{x,y,rx,ry}` (field)
  - `laser{x1,y1,x2,y2}`
  - `marker{x,y,value,label,side}` (pulsing dot + mono value pill)
- **stat** `{at,y,value,label,gauge}`: glass card with a gauge, an orange Unbounded value and a mono label.
- **chat** `{at,y,title,members,msgs:[{at,me?,photo?,caption?,from?,text?}]}`: phone mock that tilts in 3D.
- **grid100** `{at,y,header,steps:[{at,n,big,sub,tag}]}`: 10x10 cells fill from the bottom-left, with a big glowing %.
- **compare** `{at,y,header,rows:[{at,label,value(% of limit),text,color?}]}`: bars with a dashed red ME'YOR line.
- **notrad** `{at,strikeAt,subAt,title,sub}`: a trefoil that gets struck through ("RADIATSIYA EMAS").
- **thermal** `{at,y,tempFrom,tempTo?,tempAt?,tempDur?,heatAt?,tag?,tagAt?}`: IR panel with a seated figure, a
  crosshair readout, and a scale bar that turns red at 36.5° or more.
- **switch** `{at,offAt,y,title,sub}` · **timer** `{at,y,title,sub}` · **pill** `{at,y,text,color}` ·
  **label** `{at,y,text,color,size}`.
- The outro (avatar + handle + "OBUNA BO'LING") fades in automatically in the last 2.2 s.

## Look (keep it)
- Background `#1D1E22`; a 200 px grid with "+" crosshairs at the intersections and a faint 50 px sub-grid;
  orange bokeh at the left and right; vignette.
- Fonts (bundled in `public/fonts`): **Unbounded** 800/900 (headlines, numbers, chapter name), **Manrope** 800
  (captions, handle), **JetBrains Mono** (labels, counters, readouts, letter-spacing 3-5).
- Colours: orange `#F5A524` (stats, chapter name, active progress), headline yellow `#F6C343` with glow, red `#F0473E`,
  label blue `#6FA8FF`, selection blue `#3D7BFF`, IR purple `#2A1450 → #3E1C70`.
- Layout: header y 70-205; karaoke caption centred at y 330 (66 px); content 450-1650; keep the bottom 270 px clear
  (Instagram UI).
- Every scene: hard cut + a 1.035 → 1 punch zoom; something always moves (car float, pulses, phone tilt, cards rise).

## Sound
`reel3d_cues.py` maps:
- cut → whoosh; headline lines → pop; x-ray → shimmer
- pulse → hum loop; flow → EV whine; rings → hum + reverse whoosh; marker/pill → pop
- chat message → ping; grid/compare → data count-up + number land; strike → stamp
- thermal → IR beep, heat swell, count-up + knock; switch → toggle-off click; timer → tick loop
- highlight words → marker tick; outro sting

Foley in `template/public/sfx/` was made with ElevenLabs `/v1/sound-generation` (prompts in this file's history:
"electric car accelerating, rising motor whine", "low electrical hum of a magnetic field", "messenger notification
ping", "thermal camera powering on beep", "electric heater warming up", "heavy rubber stamp hit"). Mix: voice -16 LUFS,
master -14 LUFS / -1.5 dBTP.

## Gotchas
- Fonts must be local (FontFace + delayRender in `theme.ts`). Remotion needs the Playwright headless-shell path in the sandbox.
- Higgsfield can run out of credits. Only the x-ray renders need it, so reuse `template/public/img/xray_*_a.png`
  (Li L9) for other EV topics, or ask the user to top up.
- Commons rate-limits the API (429): space queries 20 s apart, and fetch thumbnails from `upload.wikimedia.org`
  by md5 path. `media_import_url` fetches server-side.
- Quotes in the script ("…") break sentence chunking unless stripped (handled in `Karaoke`).
