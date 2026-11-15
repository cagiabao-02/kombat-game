from PIL import Image, ImageDraw

def create_kb_pixel_icon(size: int) -> Image.Image:
    # 16x16 canvas
    base = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(base)

    # Hard Drop Shadow (Bottom-Right)
    draw.rectangle([2, 2, 15, 15], fill=(24, 24, 27, 255)) # #18181B

    # Outer Pixel Border
    draw.rectangle([0, 0, 13, 13], fill=(24, 24, 27, 255)) # #18181B

    # Main Indigo Arcade Button Face
    draw.rectangle([1, 1, 12, 12], fill=(79, 70, 229, 255)) # #4F46E5

    # Top & Left 16-bit Highlight Bevel
    draw.rectangle([1, 1, 12, 1], fill=(129, 140, 248, 255)) # #818CF8
    draw.rectangle([1, 1, 1, 12], fill=(129, 140, 248, 255)) # #818CF8

    # Bottom & Right 16-bit Shade Bevel
    draw.rectangle([1, 12, 12, 12], fill=(49, 46, 129, 255)) # #312E81
    draw.rectangle([12, 1, 12, 12], fill=(49, 46, 129, 255)) # #312E81

    # Shadow for K
    k_shadow_pixels = [
        (3,5),(3,6),(3,7),(3,8),(3,9),
        (4,7),(5,6),(6,5),(5,8),(6,9)
    ]
    for x, y in k_shadow_pixels:
        base.putpixel((x, y), (30, 27, 75, 255)) # #1E1B4B

    # Shadow for B
    b_shadow_pixels = [
        (8,5),(9,5),(10,5),
        (8,6),(8,7),(8,8),(8,9),
        (9,7),(10,7),
        (9,9),(10,9),
        (11,6),(11,8)
    ]
    for x, y in b_shadow_pixels:
        base.putpixel((x, y), (30, 27, 75, 255)) # #1E1B4B

    # Golden K
    k_gold_pixels = [
        (2,4),(2,5),(2,6),(2,7),(2,8),
        (3,6),(4,5),(5,4),(4,7),(5,8)
    ]
    for x, y in k_gold_pixels:
        base.putpixel((x, y), (252, 211, 77, 255)) # #FCD34D

    # Golden B
    b_gold_pixels = [
        (7,4),(8,4),(9,4),
        (7,5),(7,6),(7,7),(7,8),
        (8,6),(9,6),
        (8,8),(9,8),
        (10,5),(10,7)
    ]
    for x, y in b_gold_pixels:
        base.putpixel((x, y), (252, 211, 77, 255)) # #FCD34D

    # Scale to target size using NEAREST neighbor to preserve sharp pixel grid
    return base.resize((size, size), Image.Resampling.NEAREST)

if __name__ == '__main__':
    img_192 = create_kb_pixel_icon(192)
    img_192.save('public/icon-192.png', 'PNG')
    
    img_512 = create_kb_pixel_icon(512)
    img_512.save('public/icon-512.png', 'PNG')
    print('Generated icon-192.png and icon-512.png successfully!')
