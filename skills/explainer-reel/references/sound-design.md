# Sound design

## What is in the reference mix (from the spectrogram + loudness analysis)
- **Voice** dominates: about -14 dBFS RMS while talking, dry, compressed.
- **Music bed**: a soft, calm, minor-key (D minor) ambient/lo-fi pad + light pluck, about **-28 dBFS** (14 dB under
  the voice). You hear it alone only in the last second (tones at 293/440/588 Hz = D-A-D). It is never dramatic and
  never has a beat drop.
- **Low soft hits** (73 Hz) under scene changes and title reveals (12 s, 36.5 s): a felt "thump/whoosh".
- **Electric zap**: a broadband crackle burst (3-10 kHz) exactly on "Chirs!" (35.7-35.9 s), followed by a short
  A-minor sting (220/262/523/660 Hz).
- **UI pops/ticks** on headline reveals and while numbers count.
The SFX are subtle: each sits 6-12 dB under the voice. The voice must stay 100 % intelligible on phone speakers.

## The bundled pack (procedural, no downloads, no keys)
`python3 scripts/make_sfx.py template/public/sfx --music <seconds>` writes:
| File | Use | Auto-trigger in the kit |
|---|---|---|
| `pop.wav` | headline / object appears | every title (vol 0.55), `anim: pop` |
| `pop_hi.wav` | underline, inset circle, highlight box | underline +0.15 s, insets, boxes |
| `tick.wav` | number counter | every 2 frames while a counter runs |
| `hum.wav` (loop) | "charged" state | under counters |
| `whoosh.wav` | scene cross-fade, slide-ins | scene start (i>0), `slideLeft/Right` |
| `whoosh_rev.wav` | suck-in before a reveal | manual |
| `thud.wav` | low impact | with red impact titles |
| `zap.wav` | electric discharge / "CHIRS!" | red titles, `marks: spark` |
| `ding.wav` | check mark | `marks: check` |
| `error.wav` | red X | `marks: cross` |
| `sparkle.wav` | charges appearing | `charges[]` |
| `riser.wav` | build-up before the payoff | manual (`sfx: [{src:'sfx/riser.wav', at: payoff-1.2}]`) |
| `rain.wav` (loop) | rain / humidity | `rain[]` |
| `music_bed.wav` | calm D-minor pad, 4 chords × 4 s, 120 bpm pluck | `music` prop |
Auto-SFX is on by default (`autoSfx`). Add one-offs per scene with `sfx: [{src, at, volume, loopUntil}]`.
Master SFX gain: `sfxVolume` (default 0.55). Music: `musicVolume` 0.08-0.12.

## Upgrades (better than procedural)
- **Music**: Higgsfield `elevenlabs_music_v2_5` with `force_instrumental: true` and `duration: <reel length + 2>`.
  Prompt: *"calm minimal ambient lo-fi bed for an educational explainer, soft electric piano and warm pad, D minor,
  90 bpm, no drums drop, no vocals, unobtrusive, loopable"*. Check the price with `estimate_audio_cost` first.
- **Real SFX files**: `https://remotion.media/<name>.wav` (whoosh, whip, switch, mouse-click, ding, shutter-modern,
  page-turn) are served free for Remotion projects; more at github.com/kapishdima/soundcn/tree/main/assets.
  Download them into `public/sfx/` rather than hot-linking.
- Never use copyrighted chart music. Trending Instagram audio can be added in the app after upload.

## Final loudness pass (always)
```bash
ffmpeg -y -i out/reel.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 192k out/final.mp4
```
Check: `ffmpeg -i out/final.mp4 -af ebur128 -f null - 2>&1 | grep -A2 Integrated` → about -14 LUFS.
