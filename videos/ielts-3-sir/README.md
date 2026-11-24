# IELTS: 3 ta sir (goprep.gg), explainer-reel dark-board style

A remake of a goprep.gg IELTS ad (Reading / Listening / Speaking "secrets") with the reference's script, the Adizzbek
voice and @autopodveska.uz. 47.8 s, 13 beats, hard cuts.

- **VO**: `eleven_v4` Adizzbek, regular settings, `/with-timestamps`.
  - The English IELTS words are spelled phonetically in the script ("ayelts", "riding", "tru, fols, not given",
    "olveys, ounli, never", "o, sorri", "veyt, ekchuali", "spiking", "mok test", "ey-ay", "goprep jiji"), so the
    Uzbek voice reads them naturally.
  - Speed is atempo 1.15 (53 s → 46.4 s). `words.json` holds the times after that factor.
- **Art**: Higgsfield credits were 0, so every IELTS prop is a flat house-palette SVG drawn by `gen_svgs.py`:
  score cards, bar chart, folders, reading passage, headphones, answer form, variant cards, microphone, laptop,
  mock tests, AI chip, band descriptors, star and essay. The person is the house character (`man_stand`/`man_point`).
- **Sound**: auto cues (`sfx_cues.py`) plus a whoosh on every cut, mixed by `pro_mix.py`: voice -16, master -14 LUFS.

Note: the reference's tips are rules of thumb, not official IELTS rules ("95 %" and "always the second option").

## v2: the original voiceover kept (only the visuals changed)
At the user's request the audio is the reference video's **own track, untouched** (their voice + music); only the
picture was remade. The ElevenLabs key lacks the audio-isolation and speech-to-text permissions, and Whisper can't read
this voice under the music, so the storyboard was re-timed instead:
- `words_tts.json` (the Adizzbek take used only as a timing skeleton) was piecewise-linearly warped onto the original
  voice with 27 anchors: sentence starts taken from the voice-band pauses in the reference audio, plus the moments the
  reference's own captions change → `words.json`.
- Render `--muted`, then mux the reference audio: `ffmpeg -i picture.mp4 -i ref.mp4 -map 0:v -map 1:a -c:v copy -c:a aac`.
- `sync_vs_reference.png`: the reference (left) and the remake (right) at the same timestamps.
