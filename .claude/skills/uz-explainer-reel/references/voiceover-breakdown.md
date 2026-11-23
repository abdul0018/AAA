# Uzbek voiceover guide

**The reference video is used for its VISUALS only.** Do not copy, translate or imitate its narration, its narrator's voice, pitch or pace. Every video gets its own script written in Uzbek for the user's topic, read by a natural-sounding Uzbek voice from the user's own ElevenLabs account.

## Model: `eleven_v3` (important, measured)

- No ElevenLabs model officially accepts `language_code: "uz"`. v3, multilingual v2, flash v2.5 and turbo v2.5 all reject it (2026-11). Leave `language_code` unset and just send Uzbek text.
- **`eleven_v3` pronounces Uzbek far more clearly than `eleven_multilingual_v2`.** This was checked with Meta's MMS Uzbek speech recognizer (`facebook/mms-1b-all`, adapter `uzb-script_latin`) on the same line, across 6 voices:
  - v3, Latin script: about 0.95 character match and up to 0.84 of words intact.
  - v2, Latin script: about 0.92 character match but only 0.25-0.39 of words intact. **v2 slurs Uzbek words together and sounds odd and unclear to native listeners.** The user confirmed this. Do not use v2 for Uzbek.
  - Writing the text in Uzbek Cyrillic made no difference on v3 (0.953 vs 0.953) and was worse on v2. Keep Latin.
- Whisper-small is too weak in Uzbek to judge TTS and once gave the opposite (wrong) ranking. Always judge with MMS, and in the end by the user's ear.
- v3 settings: `stability 0.5` ("Natural"; v3 accepts only 0.0 / 0.5 / 1.0) and `similarity_boost 0.8`. No style or speed tricks. v3 rejects `previous_text`/`next_text`, and one request should stay under about 2800 chars. `build_props.py` handles both and splits long scripts per chapter.

## Voices: the user's own account

The connected ElevenLabs key is the user's account. Run `scripts/audition_voices.py --out voices/ --text "<first 2 sentences of YOUR script>"`. It lists every Uzbek voice in the account (new ones are picked up automatically), renders the line on v3 and ranks the voices by MMS clarity. **Send the top 3-4 mp3s and let the user pick by ear**, then put the chosen `voice_id` in `plan.json`.

Measured on v3 (2026-11). The number is the MMS word match averaged over 2 takes; v3 varies about ±0.04 per take. The user has not chosen a favourite yet:

| voice_id | Name | v3 words intact | secs (default line) | Notes |
|---|---|---|---|---|
| `tQBN3grEhnGrrqn0n2Rw` | Samariddin Siroj (pro clone) | 0.82 | 12.2 | clear and the best pace, **default** |
| `fytsqG6MLzC2aCSw7MLa` | Asilbek (pro clone) | 0.81 | 13-15 | clear, slower |
| `v4cqTf6wc2CXwA2tR7TF` | Adizzbek – hikoya va instagram video (pro clone) | 0.80 | 15.0 | clear, slower |
| `UjuEL3hLLUaDED9iW4Yb` | Sardor – Cheerful, Playful, Bright (designed) | 0.78 | 10.5 | brightest energy, fastest |
| `rwtcHtZgYU6HN2zLNBlf` | SARHAD-SIZ Narrator (pro clone) | 0.60 | 12 | less clear |
| `agoC45V78njTIxYzwmSb` | Davronbek – Journalist (pro clone) | 0.45 | 11.5 | unclear, avoid |
| `0UvJYbC3erQa6COupDAo` | uz (designed) | 0.38 | 15.4 | unclear, avoid |
| `xDwfBjUEPdIoQekNOXAX` | Jahongir – Calm, Proud, Deep (designed) | 0.12 | 15.8 | unusable on v3 |

When the user names a favourite, update the default here and in `template/plan.example.json`.

## Writing the Uzbek script (original, per topic)

- Write it **directly in natural spoken Uzbek** for the topic. It is never a translation of the reference video's narration.
- Use Uzbek Latin with `oʻ gʻ` (U+02BB ʻ is the official letter; ‘ also works) and `’` for tutuq belgisi.
- **Spell numbers out in words** ("qirq bir foiz", "ming toʻqqiz yuzinchi yil"). Show the digits on screen with `bigNumber`, `donut` or `statCard` instead.
- Use short, clear sentences. A full stop gives a natural pause. Avoid long chains of commas, which make v3 rush.
- Prefer common words over rare loanwords. Unusual Latin letter clusters (e.g. "layfxak") can be misread. If a word sounds wrong in the audition, rephrase it ("foydali maslahat").
- A structure that suits this visual format, chapter by chapter: hook question → a short everyday scene → how it works (2-3 simple steps) → the surprising key fact → one number with a source → a myth or practical tip → a question to the viewer plus a subscribe/share line. Fill it with the user's topic and facts, and verify every fact.
- Aim for 10 chapters, about 160-210 words, 70-90 s. Check the duration and wpm that `build_props.py` prints. If the video runs long, cut words; don't speed the voice up.

## Mix

- VO at full level, with an optional music bed (`musicVolume` 0.10-0.14, a calm or tense instrumental with no vocals).
- Optional SFX: a soft whoosh on cuts, a "thock" on stamps, a tick on counters, all at −18 dB or lower.
- Finish at −14 LUFS: `ffmpeg -i out/reel.mp4 -af loudnorm=I=-14:TP=-1:LRA=9 -c:v copy out/reel-final.mp4`.
