import os
import math
from PIL import Image, ImageDraw

canvas_w, canvas_h = 600, 600
target_h = int(min(canvas_h * 0.90, 540))
scale = target_h / 1954.0
target_w = int(round(1866 * scale))

bucket_x = int(round((canvas_w - target_w) / 2))
bucket_y = int(round(canvas_h - target_h - 12))
center_x = canvas_w // 2

collar_y = bucket_y + int(1050 * scale)
front_x = bucket_x + int(401 * scale)
front_y = bucket_y + int(1050 * scale)
front_w = int(1359 * scale)
front_h = int(904 * scale)

canvas = Image.new('RGBA', (canvas_w, canvas_h), (254, 250, 247, 255))

# 1. Back wrapper
back_img = Image.open('public/images/bucket/bucket-1_back.png').convert('RGBA')
back_resized = back_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
canvas.paste(back_resized, (bucket_x, bucket_y), back_resized)

# 2. Cavity mask
mask = Image.new('L', (canvas_w, canvas_h), 0)
mask_draw = ImageDraw.Draw(mask)
cavity_poly = [
    (center_x, bucket_y + int(10 * scale)),
    (bucket_x + int(target_w * 0.82), bucket_y + int(target_h * 0.14)),
    (bucket_x + int(target_w * 0.78), bucket_y + int(target_h * 0.38)),
    (front_x + front_w - int(30 * scale), collar_y + int(40 * scale)),
    (center_x, collar_y + int(80 * scale)),
    (front_x + int(30 * scale), collar_y + int(40 * scale)),
    (bucket_x + int(target_w * 0.22), bucket_y + int(target_h * 0.38)),
    (bucket_x + int(target_w * 0.18), bucket_y + int(target_h * 0.14)),
]
mask_draw.polygon(cavity_poly, fill=255)

# Flowers layer
flowers_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

rose = Image.open('public/images/flowers/rose_red.png').convert('RGBA')
w, h = rose.size
# Top 62%
rose_trimmed = rose.crop((0, 0, w, int(h * 0.62)))

scale_factor = scale / (540.0 / 1954.0)

# 9 Roses Layout
slots = [
    # Apex (1)
    {'x': center_x,                               'y': collar_y - int(195 * scale_factor), 'sz': int(275 * scale_factor), 'rot': 0.0},
    # Tier 2 (2)
    {'x': center_x - int(65 * scale_factor),      'y': collar_y - int(150 * scale_factor), 'sz': int(270 * scale_factor), 'rot': -0.10},
    {'x': center_x + int(65 * scale_factor),      'y': collar_y - int(150 * scale_factor), 'sz': int(270 * scale_factor), 'rot': 0.10},
    # Tier 3 (3)
    {'x': center_x - int(110 * scale_factor),     'y': collar_y - int(100 * scale_factor), 'sz': int(275 * scale_factor), 'rot': -0.16},
    {'x': center_x,                               'y': collar_y - int(100 * scale_factor), 'sz': int(280 * scale_factor), 'rot': 0.0},
    {'x': center_x + int(110 * scale_factor),     'y': collar_y - int(100 * scale_factor), 'sz': int(275 * scale_factor), 'rot': 0.16},
    # Tier 4 (3 - nestled deep into pleated collar)
    {'x': center_x - int(70 * scale_factor),      'y': collar_y - int(45 * scale_factor),  'sz': int(280 * scale_factor), 'rot': -0.08},
    {'x': center_x,                               'y': collar_y - int(42 * scale_factor),  'sz': int(285 * scale_factor), 'rot': 0.0},
    {'x': center_x + int(70 * scale_factor),      'y': collar_y - int(45 * scale_factor),  'sz': int(280 * scale_factor), 'rot': 0.08},
]

for s in slots:
    fw = s['sz']
    fh = int(fw * (rose_trimmed.height / rose_trimmed.width))
    cur = rose_trimmed.resize((fw, fh), Image.Resampling.LANCZOS)
    
    dx = center_x - s['x']
    dy = (collar_y + int(50 * scale_factor)) - s['y']
    inward_rad = math.atan2(dx, dy)
    final_rot = s['rot'] * 0.4 - inward_rad * 0.18
    rot_deg = math.degrees(final_rot)
    rotated = cur.rotate(-rot_deg, resample=Image.Resampling.BICUBIC, expand=True)
    
    rx = int(s['x'] - rotated.width / 2)
    ry = int(s['y'] - rotated.height * 0.22)
    flowers_layer.alpha_composite(rotated, (rx, ry))

r, g, b, a = flowers_layer.split()
final_a = Image.composite(a, Image.new('L', a.size, 0), mask)
flowers_layer.putalpha(final_a)
canvas.paste(flowers_layer, (0, 0), flowers_layer)

# 3. Front wrapper
front_img = Image.open('public/images/bucket/bucket-1_front.png').convert('RGBA')
front_resized = front_img.resize((front_w, front_h), Image.Resampling.LANCZOS)
canvas.paste(front_resized, (front_x, front_y), front_resized)

canvas.save('scratch/test_600x600_canvas.png')
print('Saved scratch/test_600x600_canvas.png')
