#!/usr/bin/env bash
# Vyrobi webove zvuky z MATERIALY/ (hudba + zvuky z freesound, CC0).
# Pouziti:  bash scripts/make-audio.sh <slozka MATERIALY> <vystup, napr. public/audio>
# Hlasitosti: hudba -16 LUFS, ambienty -24 LUFS (limiter -1.5 dB), efekty spicka -3 dBFS.
# Vystup: <nazev>.webm (Opus) + <nazev>.mp3 (zaloha pro Safari < 17).
set -euo pipefail
SRC="${1:-MATERIALY}"; OUT="${2:-public/audio}"
mkdir -p "$OUT/music" "$OUT/amb" "$OUT/sfx"
calc() { awk "BEGIN{printf \"%.4f\", $1}"; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

enc() { # $1 vstup wav, $2 cil bez pripony, $3 opus bitrate, $4 mp3 bitrate
  ffmpeg -v error -y -i "$1" -c:a libopus -b:a "$3" -vbr on "$2.webm"
  ffmpeg -v error -y -i "$1" -c:a libmp3lame -b:a "$4" "$2.mp3"
}
norm() { # $1 vstup, $2 vystup wav, $3 cilove LUFS
  ffmpeg -v error -y -i "$1" -af "loudnorm=I=$3:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.84:level=false" -ar 48000 "$2"
}

# --- Hudba: cele skladby, jen srovnani hlasitosti + kratky fade in/out -------------------
music() { # $1 soubor (glob), $2 nazev
  local f; f=$(ls "$SRC"/hudba/$1 | head -1)
  local d; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  ffmpeg -v error -y -i "$f" -af "afade=t=in:d=0.5,afade=t=out:st=$(calc "$d-2.5"):d=2.5" "$TMP/m.wav"
  norm "$TMP/m.wav" "$TMP/mn.wav" -16
  enc "$TMP/mn.wav" "$OUT/music/$2" 96k 128k
  echo "music/$2"
}
music "02.*Geralt*"        geralt-of-rivia
music "32.*Ard*Skellig*"   fields-of-ard-skellig
music "10.*Silver*"        silver-for-monsters
music "16.*Kaer*Morhen*"   kaer-morhen

# --- Ambienty: vybrany usek -> bezesva smycka (konec se prolne do zacatku, equal-power) ---
loop() { # $1 soubor (glob), $2 nazev, $3 start s, $4 delka smycky s, $5 prolnuti s, $6 extra filtr (volitelne)
  local f; f=$(ls "$SRC"/zvuky/$1 | head -1)
  local s=$3 L=$4 X=$5 pre="${6:-anull}"
  ffmpeg -v error -y -ss "$s" -t "$(calc "$L+$X+5")" -i "$f" -af "$pre,atrim=0:$(calc "$L+$X")" -ar 48000 -ac 2 "$TMP/seg.wav"
  ffmpeg -v error -y -i "$TMP/seg.wav" -filter_complex "
    [0:a]asplit=3[h][b][t];
    [h]atrim=0:$X,asetpts=PTS-STARTPTS,afade=t=in:d=$X:curve=qsin[h2];
    [b]atrim=$X:$L,asetpts=PTS-STARTPTS[b2];
    [t]atrim=$L:$(calc "$L+$X"),asetpts=PTS-STARTPTS,afade=t=out:d=$X:curve=qsin[t2];
    [t2][h2]amix=inputs=2:normalize=0[m];
    [m][b2]concat=n=2:v=0:a=1[o]" -map "[o]" "$TMP/loop.wav"
  norm "$TMP/loop.wav" "$TMP/loopn.wav" -24
  enc "$TMP/loopn.wav" "$OUT/amb/$2" 64k 96k
  echo "amb/$2"
}
loop "563572*wind*crows*"      velen-wind-crows   5    60 3
loop "318070*waves*gulls*"     skellige-sea       20   60 3
loop "509508*belltower*"       novigrad-bells     12   40 3
loop "363093*fire*"            choices-fire       2.5  26 2 "acompressor=threshold=-26dB:ratio=6:attack=1:release=60:makeup=4"
# srdce: zpomalene a hlubsi (asetrate 0.85), 12 uderu presne, aby smycka nezakopla
loop "254062*heartbeat*"       dark-heartbeat     9.1  11.765 0.05 "asetrate=44100*0.85,aresample=48000"

# --- Efekty: vybrany usek, orez ticha, fade out ----------------------------------------
sfx() { # $1 soubor (glob), $2 nazev, $3 start, $4 delka, $5 fade out s
  local f; f=$(ls "$SRC"/zvuky/$1 | head -1)
  ffmpeg -v error -y -ss "$3" -t "$4" -i "$f" -af "afade=t=in:d=0.01,afade=t=out:st=$(calc "$4-$5"):d=$5" -ar 48000 -ac 2 "$TMP/s.wav"
  # kratke zvuky: loudnorm na nich nemeri spolehlive -> srovnat spicku na -3 dBFS
  local mx; mx=$(ffmpeg -hide_banner -i "$TMP/s.wav" -af volumedetect -f null - 2>&1 | grep max_volume | awk '{print $5}')
  ffmpeg -v error -y -i "$TMP/s.wav" -af "volume=$(calc "-3-($mx)")dB" "$TMP/sn.wav"
  enc "$TMP/sn.wav" "$OUT/sfx/$2" 96k 128k
  echo "sfx/$2"
}
sfx "214082*door*"       gate-thud       6.80 0.9  0.4
sfx "214082*door*"       gate-creak      1.75 3.6  0.8
sfx "353125*paper*"      paper-rustle    0    1.13 0.2
sfx "194905*quill*"      quill-writing   1.5  4.0  0.6
sfx "759526*wax*"        wax-seal        0    1.31 0.3
sfx "574821*slash*"      sword-slash     0    1.05 0.2

ls -R "$OUT"
