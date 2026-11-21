---
name: explainer-reel
description: "Make vertical 9:16 animated 'why does this happen?' explainer reels in the dark-board style (charcoal grid board, flat semi-realistic vector illustrations, one ALL-CAPS Manrope headline with a yellow underline, counters like '10 000 VOLT', yellow charge particles and glow, magnifier insets, red 'CHIRS!' impact word, @handle watermark and IG pill), with an Uzbek (or any language) AI voiceover, procedural SFX and a music bed, rendered in Remotion. Use when the user asks for a video 'like the tok uradi / mashinadan tushganda video', an explainer reel, a science/fact reel, 'nega ... ?' video, a dark-board infographic animation, or says /explainer-reel."
---

# Explainer reel: dark-board science explainer

Recreates the style of a 60 s Uzbek reel ("Mashinadan tushganda nega tok uradi?"), end to end:
**script → illustrations → voiceover → timing → Remotion animation → SFX/music → render → QA**.
Everything was verified working in a cloud sandbox on 2026-11-21 (see `assets/demo-render.mp4`, `assets/demo-frames.png`).

Read these before building (they hold the details this page only summarises):
- `references/style-bible.md`: the look, palette, layout, motion vocabulary and the reference's beat-by-beat timeline. **Read first.**
- `references/script-formula.md`: the 10-beat script structure, Uzbek writing rules, the reference script, topic ideas
- `references/illustrations.md`: image prompts, character consistency, trimming, budget
- `references/voiceover.md`: Higgsfield → ElevenLabs v4 (Uzbek verified), voice ids, pace/mastering chain, alternatives
- `references/sound-design.md`: what's in the reference mix, the SFX pack, auto-SFX rules, loudness
- `references/props-api.md`: the props.json schema, animation names, placement cheatsheet, recipes, commands
- `template/examples/storyboard-static-shock.json`: the full 59.6 s reference rebuilt as props (the blueprint to copy)

Related skills installed alongside (use them for Remotion API questions): `remotion-best-practices`,
`remotion-markup` (animations, audio, sfx, fonts, transitions), `remotion-render`, `remotion-create`.

## What you need from the user (ask only for what's missing)
1. **Topic** (or let them pick from the ideas in script-formula.md) and language (default Uzbek Latin).
2. **@handle** for the watermark/pill.
3. **Voice**: a preset AI voice (default), their own cloned voice (they provide a 30-60 s recording), or they record
   it themselves.
4. Budget OK on **Higgsfield** (≈15-25 credits per reel: 8-12 images at about 1 cr, VO at about 0.3 cr per 100 chars). The
   Higgsfield MCP is connected on this account. If it's unavailable, ask for an **ElevenLabs API key** (VO) and use
   their own images or simple SVGs. No other keys or subscriptions are needed: Remotion, the SFX and the font are bundled and free
   (a Remotion company licence is only required for companies with more than 3 people).

## Workflow
### 1. Script (show it to the user before spending credits)
Follow `references/script-formula.md`: hook question → shock number → reassure + promise one action → myth-bust →
mechanism (3-5 drawable steps) → contrast → payoff ("Chirs!") → solution → bonus tip → loop question.
130-160 words for 60 s. Deliver a beat table (VO / picture / headline / overlays) and an asset list.
Fact-check the claim.

### 2. Project
```bash
SK=<this skill dir>; P=<work dir>/reel && cp -r $SK/template $P && cd $P
npm install            # remotion 4.0.540 pinned, all @remotion/* the same version
python3 $SK/scripts/make_sfx.py public/sfx --music <reel seconds + 2>
```

### 3. Illustrations (Higgsfield `gpt_image_2_6`, transparent PNG)
Character/object sheet first, then every pose with it as `image_references` (see illustrations.md). Use the batch
generate, `jobs_wait`, then curl into `public/img/` and **trim the alpha margin**. Look at every image (Read) before
using it, and regenerate the off-style ones. Never bake text or overlays into images.

### 4. Voiceover
Higgsfield `elevenlabs_v4_turbo` (or `elevenlabs_v4`) with numbers spelled as words. Download, then master:
`atempo≈1.15 + compressor + loudnorm -14 LUFS` → `public/vo.wav` (exact command in voiceover.md).
Target 2.6-2.8 words/s.

### 5. Timing
`python3 -I $SK/scripts/vo_timing.py public/vo.wav --lang uz --find "<headline phrase>" ...` (needs
`pip install faster-whisper`). Scene boundaries = where the picture changes. Headline `at` = spoken word time −
scene start − 0.1 s. The sum of `dur` must equal the VO length + 0.3 s.

### 6. Build props.json
Start from `template/examples/storyboard-static-shock.json` (same beat structure) and swap in the new assets, text
and timings. Style rules that must hold:
- one headline at a time, 1-4 words, ALL CAPS, on the key word. Underline only the core concept of the beat
- the illustration changes every 3-5 s with cross-fades only (no cuts or flashy transitions)
- yellow means energy/charge/attention, red means danger/impact/wrong, white check means correct, blue means water
- the counter for the key number. The payoff gets the red title + spark + shake together
- the last scene asks the hook question again (loop)
- move `handlePos` between scenes. The IG pill is automatic

### 7. Preview stills → fix → render
```bash
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64 2>/dev/null | head -1)/chrome-headless-shell
npx remotion still ExplainerReel out/f.png --frame=<N> --props=public/props.json ${B:+--browser-executable=$B}
```
Render one still per scene, combine them into a sheet with PIL, and Read it. Check overlaps with the title zone, the
size of the hero (650-880 px wide), charges sitting on the body, the inset pointing at the right detail, and text
not overflowing 1000 px. Then:
```bash
npx remotion render ExplainerReel out/reel.mp4 --props=public/props.json --codec=h264 --crf=18 ${B:+--browser-executable=$B}
ffmpeg -y -i out/reel.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 192k out/final.mp4
```

### 8. QA and deliver
- `ffprobe` (1080x1920, 30 fps, duration ≈ VO), a 2 fps contact sheet (`fps=2,scale=270:-1,tile=6x4`) → Read it
- Integrated loudness ≈ -14 LUFS. The voice is clearly above the music/SFX
- Send `out/final.mp4` with SendUserFile, plus a suggested caption (the hook question + 3-5 hashtags in the user's
  language) and the pinned-comment question.

## Gotchas (learned the hard way)
- **Fonts**: the sandbox's headless Chrome can't reach fonts.gstatic.com (proxy CA), so Manrope is bundled in
  `public/fonts` and loaded with `FontFace` + `delayRender` (`src/theme.ts`). Don't switch back to
  `@remotion/google-fonts`.
- **Browser**: Remotion can't download its own Chrome in the sandbox. Pass the Playwright headless shell (the
  command above). On the user's PC, omit the flag.
- **Edge TTS** (free Uzbek voices) fails in the cloud sandbox (WebSocket through the proxy). It's fine on a local PC.
- `--props` is required for studio/still/render (the default props are only a placeholder).
- Input props are merged shallowly: always pass a complete props.json.
- Whisper writes Uzbek loosely ("tak uradimi", "10,000"). Use `--find` fuzzy matching or read the word list.
- Keep the people facing right and consistent. Re-use the same layer (same x/y/w, `anim:"none"`) across scenes so the
  cross-fade is seamless.

## Files
```
SKILL.md
references/   style-bible · script-formula · illustrations · voiceover · sound-design · props-api
scripts/      make_sfx.py (SFX pack + music bed) · vo_timing.py (word timings, fuzzy find) · analyze_reference.sh (break down any new reference reel)
template/     Remotion project: src/{ExplainerReel,kit,theme,types,Root,index}.tsx, public/fonts, public/img (door + hand samples), examples/*.json
assets/       reference contact sheets + close-ups, demo render + frames, component test frames
```
For a NEW reference style, run `scripts/analyze_reference.sh <video> <out>` first, Read the sheets/spectrogram/
transcript, and write the differences down before building.
