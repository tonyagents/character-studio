#!/bin/sh
# Assemble the "lost kid + AI agent" film:
#   Seedance shot 1 (kid lost in city) -> Seedance shot 2 (phone glow, hope)
#   -> 3D Character Studio segment (agent + piggy bank + celebration)
#
# Requires FAL_KEY. Run from ~/character-studio:  sh tools/assemble-lost-kid.sh
set -e
cd "$(dirname "$0")/.."

[ -n "$FAL_KEY" ] || { echo "FAL_KEY not set — get one at https://fal.ai/dashboard/keys"; exit 1; }
[ -f out/lost-kid-agent-3d.mp4 ] || { echo "render the 3D segment first (scenarios/lost-kid-agent.json)"; exit 1; }

if [ ! -f out/lost-kid-shot1.mp4 ]; then
  node tools/seedance.mjs \
    "Ultra realistic documentary footage, shot on 35mm film: a young boy around ten with a small worn backpack stands completely still on a busy American city sidewalk at dusk while crowds of real pedestrians rush past him in both directions, motion-blurred. He slowly turns his head, wide-eyed and overwhelmed by glowing neon storefront signs and unfamiliar street names. Photorealistic natural skin texture, true-to-life lighting from warm streetlights and cool dusk sky, handheld camera with subtle shake, shallow depth of field, authentic city ambience with distant traffic and voices. No cartoon or CGI look — indistinguishable from real footage." \
    --resolution 1080p --aspect 9:16 --duration 6 --bitrate high --out out/lost-kid-shot1.mp4
fi

if [ ! -f out/lost-kid-shot2.mp4 ]; then
  node tools/seedance.mjs \
    "Ultra realistic documentary footage, shot on 35mm film at night: close-up of the same young boy looking down at a smartphone held in both hands. A soft purple glow from the screen illuminates his face with true-to-life subsurface skin detail, and his worried expression slowly melts into a relieved, hopeful smile. Real out-of-focus city lights bokeh behind him, handheld camera. No cartoon or CGI look — indistinguishable from real footage. Audio: quiet instrumental ambient music and distant city sounds only, strictly no voices, no dialogue, no singing." \
    --resolution 1080p --aspect 9:16 --duration 5 --bitrate high --out out/lost-kid-shot2.mp4
fi

norm () { # unify codecs/size/fps; add a silent track to clips without audio so concat is happy
  if ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$1" | grep -q audio; then
    ffmpeg -y -i "$1" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30" \
      -c:v libx264 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$2" -loglevel error
  else
    ffmpeg -y -i "$1" -f lavfi -i anullsrc=r=48000:cl=stereo -shortest \
      -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30" \
      -c:v libx264 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$2" -loglevel error
  fi
}
norm out/lost-kid-shot1.mp4 out/_seg1.mp4
norm out/lost-kid-shot2.mp4 out/_seg2.mp4
norm out/lost-kid-agent-3d.mp4 out/_seg3.mp4

ffmpeg -y -i out/_seg1.mp4 -i out/_seg2.mp4 -i out/_seg3.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -pix_fmt yuv420p -c:a aac out/lost-kid-agent-final.mp4 -loglevel error

rm -f out/_seg1.mp4 out/_seg2.mp4 out/_seg3.mp4 out/lost-kid-agent-3d-silent.mp4
echo "done: out/lost-kid-agent-final.mp4"
