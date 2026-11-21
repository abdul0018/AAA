#!/usr/bin/env bash
# Break down any reference reel so its style can be studied / matched.
# Usage: analyze_reference.sh <video.mp4> <out_dir> [lang=uz]
# Produces: contact sheets (2 fps, 6x4 tiles), full-res stills every 2 s, mono audio,
# spectrogram, loudness profile, scene cuts and (if faster-whisper is installed) a transcript.
set -euo pipefail
V="$1"; OUT="$2"; LANG_="${3:-uz}"
mkdir -p "$OUT/frames" "$OUT/stills"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,sample_rate -of compact "$V" | tee "$OUT/probe.txt"
ffmpeg -v error -y -i "$V" -vf fps=2,scale=360:-1 "$OUT/frames/f_%03d.jpg"
N=$(ls "$OUT/frames" | wc -l); i=0
while [ $((i*24)) -lt "$N" ]; do
  ffmpeg -v error -y -start_number $((i*24+1)) -i "$OUT/frames/f_%03d.jpg" -frames:v 1 -vf "tile=6x4:padding=4" "$OUT/sheet_$i.jpg"
  i=$((i+1))
done
ffmpeg -v error -y -i "$V" -vf fps=0.5 "$OUT/stills/s_%02d.png"
ffmpeg -v error -y -i "$V" -vn -ac 1 -ar 44100 "$OUT/audio.wav"
ffmpeg -v error -y -i "$OUT/audio.wav" -lavfi "showspectrumpic=s=1800x500:legend=1:scale=log:fscale=log:stop=12000" "$OUT/spectrogram.png"
ffmpeg -i "$V" -vf "select='gt(scene,0.2)',showinfo" -vsync vfr -f null - 2>&1 | grep -o "pts_time:[0-9.]*" | sed 's/pts_time://' > "$OUT/cuts.txt" || true
ffmpeg -i "$OUT/audio.wav" -af "silencedetect=noise=-35dB:d=0.25" -f null - 2>&1 | grep -E "silence_(start|end)" > "$OUT/silences.txt" || true
ffmpeg -i "$OUT/audio.wav" -af ebur128 -f null - 2>&1 | grep -A6 "Summary" > "$OUT/loudness.txt" || true
if python3 -c "import faster_whisper" 2>/dev/null; then
  python3 -I "$(dirname "$0")/vo_timing.py" "$OUT/audio.wav" --lang "$LANG_" --out "$OUT/timing.json" > "$OUT/transcript.txt"
fi
echo "done -> $OUT  (look at sheet_*.jpg first, then stills/, spectrogram.png, transcript.txt)"
