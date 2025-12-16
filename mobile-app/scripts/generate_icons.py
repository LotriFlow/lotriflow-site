#!/usr/bin/env python3
"""Generate PNG icons for PWA"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os

    # Icon sizes needed for PWA
    sizes = [192, 512]

    for size in sizes:
        # Create image with dark background
        img = Image.new('RGBA', (size, size), (10, 10, 15, 255))
        draw = ImageDraw.Draw(img)

        # Draw rounded rectangle background
        # (PIL doesn't have native rounded rectangles, so we'll just use solid)

        # Add emoji text (note: this requires emoji font support)
        # Since we can't rely on emoji fonts, let's create a simple colored circle
        margin = size // 8
        draw.ellipse([margin, margin, size-margin, size-margin],
                     fill=(0, 255, 136, 255), outline=(0, 200, 100, 255), width=size//50)

        # Add inner circle
        margin2 = size // 4
        draw.ellipse([margin2, margin2, size-margin2, size-margin2],
                     fill=(10, 10, 15, 200))

        # Save
        filename = f'icon-{size}x{size}.png'
        img.save(filename, 'PNG')
        print(f'Created {filename}')

    print('Icons generated successfully!')

except ImportError:
    print('PIL/Pillow not installed. Creating simple base64 approach instead...')
    print('Run: pip install Pillow')

