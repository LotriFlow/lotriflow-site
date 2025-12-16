#!/bin/zsh
# Resize Gemini image to all required iOS icon sizes and update AppIcon.appiconset
ICON_SRC="assets/Gemini_Generated_Image_13mkx13mkx13mkx1.png"
ICONSET="ios/Runner/Assets.xcassets/AppIcon.appiconset"

sizes=(
  "20 1x" "20 2x" "20 3x"
  "29 1x" "29 2x" "29 3x"
  "40 1x" "40 2x" "40 3x"
  "50 1x" "50 2x"
  "57 1x" "57 2x"
  "60 2x" "60 3x"
  "72 1x" "72 2x"
  "76 1x" "76 2x"
  "83.5 2x"
  "1024 1x"
)


# Improved pixel calculation to avoid parse errors
for entry in "$sizes[@]"; do
  size=$(echo $entry | awk '{print $1}')
  scale=$(echo $entry | awk '{print $2}')
  # Remove 'x' from scale (e.g., 2x -> 2)
  scale_num=${scale%x}
  if [[ "$size" == "83.5" ]]; then
    px=167
    name="Icon-App-83.5x83.5@2x.png"
  elif [[ "$size" == "1024" ]]; then
    px=1024
    name="Icon-App-1024x1024@1x.png"
  else
    px=$(printf '%.0f' $(echo "$size * $scale_num" | bc))
    name="Icon-App-${size}x${size}@${scale}.png"
  fi
  magick "$ICON_SRC" -resize ${px}x${px} "$ICONSET/$name"
  echo "Generated $name ($px x $px)"
done

echo "All iOS app icon sizes updated!"
