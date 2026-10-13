#!/usr/bin/env bash
# Vyrobi webove boomerang smycky (dopredu + pozpatku) z vybranych zaberu.
# Pouziti:  bash scripts/make-loops.sh <slozka-se-zdroji> <vystupni-slozka>
#   napr.   bash scripts/make-loops.sh raw public/video
# Potrebuje ffmpeg + ffprobe.
set -euo pipefail

SRC="${1:-raw}"
OUT="${2:-public/video}"
mkdir -p "$OUT"

# nazev | zdroj | start (s) | konec (s) | zpomaleni (1 = puvodni rychlost)
CLIPS=(
  "hero-velen|Velen.mp4|24.7|28.4|1"
  "hero-velen-mill|Velen.mp4|112.3|120.0|1"
  "fog-geralt|Skellige.mp4|309.2|312.5|2"
  "skellige-valley|Skellige.mp4|17.7|21.9|2"
  "skellige-lake|Skellige.mp4|320.3|323.6|2"
  "outro-lake-dusk|Skellige.mp4|228.0|231.3|2"
)

for row in "${CLIPS[@]}"; do
  IFS='|' read -r name file ss to slow <<< "$row"
  # ONLY="a b" bash scripts/make-loops.sh ...  -> zpracuje jen vybrane klipy
  if [[ -n "${ONLY:-}" && " $ONLY " != *" $name "* ]]; then continue; fi
  in="$SRC/$file"
  echo "==> $name ($file $ss-$to, zpomaleni ${slow}x)"

  # 1) vystrihnout + zpomalit na 30 fps (60fps zdroj zpomaleny 2x zustane plynuly)
  tmp="$(mktemp -d)"
  ffmpeg -v error -y -ss "$ss" -to "$to" -i "$in" -an \
    -vf "setpts=${slow}*PTS,fps=30,scale=1920:-2" \
    -c:v libx264 -crf 12 -preset veryfast "$tmp/fwd.mp4"

  # 2) boomerang: dopredu + pozpatku, bez zdvojenych krajnich snimku -> bezesva smycka
  n=$(ffprobe -v error -count_frames -select_streams v:0 \
      -show_entries stream=nb_read_frames -of csv=p=0 "$tmp/fwd.mp4")
  ffmpeg -v error -y -i "$tmp/fwd.mp4" -filter_complex \
    "[0:v]split[a][b];[b]trim=start_frame=1:end_frame=$((n-1)),setpts=PTS-STARTPTS,reverse[r];[a][r]concat=n=2:v=1[v]" \
    -map "[v]" -c:v libx264 -crf 12 -preset veryfast "$tmp/loop.mp4"

  # 3) webove verze
  ffmpeg -v error -y -i "$tmp/loop.mp4" -an -c:v libx264 -crf 26 -preset slow \
    -pix_fmt yuv420p -movflags +faststart "$OUT/$name.mp4"
  ffmpeg -v error -y -i "$tmp/loop.mp4" -an -c:v libvpx-vp9 -crf 36 -b:v 0 \
    -row-mt 1 -deadline good -cpu-used 2 "$OUT/$name.webm"
  ffmpeg -v error -y -i "$tmp/loop.mp4" -an -vf "scale=1280:-2" -c:v libx264 -crf 28 \
    -preset slow -pix_fmt yuv420p -movflags +faststart "$OUT/$name-720.mp4"
  ffmpeg -v error -y -i "$tmp/loop.mp4" -frames:v 1 -c:v libwebp -quality 80 "$OUT/$name-poster.webp"

  rm -rf "$tmp"
done

ls -lh "$OUT"
