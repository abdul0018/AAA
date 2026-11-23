#!/usr/bin/env bash
# Synthesise the reel's sound effects with ffmpeg only (no licensing issues) into <public>/sfx/.
#   whoosh.mp3: 0.45 s filtered-noise swoosh for cuts
#   hit.mp3:    a deep thump with a short noise transient, for stamps
#   tick.mp3:   a short UI tick for counters and the CTA button
# Usage: bash make_sfx.sh path/to/template/public
set -euo pipefail
D=${1:?public dir}/sfx; mkdir -p "$D"
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.45:c=pink:a=0.9" \
  -af "highpass=f=300,lowpass=f=5000,afade=t=in:d=0.28:curve=exp,afade=t=out:st=0.28:d=0.17,volume=1.4,aformat=channel_layouts=stereo" \
  -ar 44100 "$D/whoosh.mp3"
ffmpeg -v error -y -f lavfi -i "sine=f=62:d=0.35" -f lavfi -i "anoisesrc=d=0.05:c=white:a=0.6" \
  -filter_complex "[0]afade=t=out:st=0.03:d=0.32:curve=exp,volume=2.2[s];[1]lowpass=f=2500,afade=t=out:d=0.05[n];[s][n]amix=inputs=2:normalize=0,aformat=channel_layouts=stereo" \
  -ar 44100 "$D/hit.mp3"
ffmpeg -v error -y -f lavfi -i "sine=f=1800:d=0.04" -af "afade=t=out:d=0.04,volume=0.8,aformat=channel_layouts=stereo" -ar 44100 "$D/tick.mp3"
echo "sfx -> $D"; ls "$D"
