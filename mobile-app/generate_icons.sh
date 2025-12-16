#!/bin/bash

# Source high-res PNG
SOURCE="/tmp/smokefree-icon.svg.png"

# iOS app icon sizes needed
SIZES=(20 29 40 58 60 76 80 87 100 102 108 120 152 167 172 180 196 216 234 258 1024)

# Create output directory
OUTPUT_DIR="ios_icons"
mkdir -p "$OUTPUT_DIR"

echo "Generating iOS app icons from $SOURCE..."

for size in "${SIZES[@]}"; do
  output_file="${OUTPUT_DIR}/icon-${size}.png"
  echo "Creating ${size}x${size}px icon..."
  sips -z "$size" "$size" "$SOURCE" --out "$output_file" > /dev/null 2>&1
done

echo "Done! Generated ${#SIZES[@]} icon sizes in $OUTPUT_DIR/"
