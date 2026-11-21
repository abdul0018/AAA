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

Related skills installed alongside: `sfx-kit` (320 pro CC0 sound effects with sync points, **the default SFX
source**), `elevenlabs-sound-effects` / `elevenlabs-music` / `elevenlabs-text-to-speech` / `elevenlabs-voice-isolator`
(the user's ElevenLabs key is a network secret for api.elevenlabs.io: send `xi-api-key: proxy-injected`),
`remotion-best-practices`, `remotion-markup`, `remotion-render`, `remotion-create`.

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

### 7. Sound design (pro): read `references/sound-design.md`
- Music: ElevenLabs Music (instrumental, reel + 3 s), key-shifted to C major/A minor with rubberband so it agrees
  with the kit's tuned sounds.
- Topic-specific SFX (e.g. a suspension clunk, oil squelch): ElevenLabs `/v1/sound-generation` (4 or fewer at a time) →
  `scripts/match_sfx.py` → custom `sfx` entries in props. Everything else comes automatically from `sfx-kit`.
- Set `"muteAll": true` in props. The audio is built after the render by `sfx_cues.py` + `pro_mix.py`.

### 8. Preview stills → fix → render
```bash
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64 2>/dev/null | head -1)/chrome-headless-shell
npx remotion still ExplainerReel out/f.png --frame=<N> --props=public/props.json ${B:+--browser-executable=$B}
```
Render one still per scene, combine them into a sheet with PIL, and Read it. Check overlaps with the title zone, the
size of the hero (650-880 px wide), charges sitting on the body, the inset pointing at the right detail, and text
not overflowing 1000 px. Then:
```bash
npx remotion render ExplainerReel out/silent.mp4 --props=public/props.json --codec=h264 --crf=17 --muted ${B:+--browser-executable=$B}
python3 -I $SK/scripts/sfx_cues.py public/props.json --kit ~/.claude/skills/sfx-kit --out cues.json   # read the cue list
python3 -I $SK/scripts/pro_mix.py --video out/silent.mp4 --vo public/vo.wav --cues cues.json --music public/music_C.wav --out out/final.mp4 --stems out/stems
```
(Quick draft without the pro chain: drop `muteAll`, render with audio, then loudnorm.)

### 9. QA and deliver
- `ffprobe` (1080x1920, 30 fps, duration ≈ VO), a 2 fps contact sheet (`fps=2,scale=270:-1,tile=6x4`) → Read it
- pro_mix prints the stems: voice ≈ -16 LUFS, music ≈ -31 LUFS, master -14.0 LUFS / -1.5 dBTP. Check the voice in
  15 s chunks with Whisper (a full-length transcription of a music-backed file can hallucinate)
- Send `out/final.mp4` with SendUserFile, plus a suggested caption (the hook question + 3-5 hashtags in the user's
  language) and the pinned-comment question.

## Remaking a reference video (use `style-match` too)
Verified 2026-11-21 on the original "tok uradi" reel, with an average ΔE of **0.9** against the original:
1. Crop each beat's object from the reference frames, without titles or handles. Upload the crops to Higgsfield and
   generate every cut-out with its crop as `image_references` ("exactly the same illustration style… WITHOUT yellow
   charge dots / glow / rain"; the kit draws those). gpt_image_2_6 allows about 3-4 concurrent jobs, so batch ≤ 4.
2. VO = the reference script via ElevenLabs `/with-timestamps`. Restore the reference's dramatic pauses (e.g. 0.9 s
   after "Chirs!") by splicing silence at word boundaries.
3. Warp `template/examples/storyboard-static-shock.json` onto the new VO with sentence anchors (reference segment start →
   new word time), then place the layers at positions measured from the reference frames
   (`template/examples/remake-tok-uradi-stylematched.json` is the result).
4. Measure with `style-match/scripts/compare.py`. Only colour-grade if ΔE > 6.

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
scripts/      sfx_cues.py (props → kit cue sheet) · pro_mix.py (voice chain, SFX bus, ducked music, master) · match_sfx.py (any SFX → kit loudness)
              make_sfx.py (procedural zap/rain/hum + fallback pack) · vo_timing.py (word timings, fuzzy find) · analyze_reference.sh
template/     Remotion project: src/{ExplainerReel,kit,theme,types,Root,index}.tsx, public/fonts, public/img (door + hand samples), examples/*.json
assets/       reference contact sheets + close-ups, demo render + frames, component test frames
```
For a NEW reference style, run `scripts/analyze_reference.sh <video> <out>` first, Read the sheets/spectrogram/
transcript, and write the differences down before building.
