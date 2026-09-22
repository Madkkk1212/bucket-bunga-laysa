import os
import math
from PIL import Image

canvas_w, canvas_h = 700, 750
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

canvas = Image.new('RGBA', (canvas_w, canvas_h), (248, 246, 242, 255))

# 1. Back wrapper
back_img = Image.open('public/images/bucket/bucket-1_back.png').convert('RGBA')
back_resized = back_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
canvas.paste(back_resized, (bucket_x, bucket_y), back_resized)

# 2. Front wrapper
front_img = Image.open('public/images/bucket/bucket-1_front.png').convert('RGBA')
front_resized = front_img.resize((front_w, front_h), Image.Resampling.LANCZOS)

# Flower arrangement
rose = Image.open('public/images/flowers/rose_red.png').convert('RGBA')
# Top 52% of image: bloom + calyx + upper foliage
rw, rh = rose.size
rose_bloom = rose.crop((0, 0, rw, int(rh * 0.52)))

flowers_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

# Master Florist Korean Bouquet Dome layout:
# For 9 flowers:
# Back row (top arch): 3 blooms, slightly higher, peeking over
# Mid row: 3 blooms, prominent center
# Front row: 3 blooms, nestled directly into the ruffled collar
# Blooms are LARGE and OVERLAPPING, creating a rich dense dome!
# Notice: the bloom center is at x, y
slots = [
    # Back Row (Top Arch)
    {'x': center_x - 95, 'y': collar_y - 220, 'sz': 195, 'rot': -0.15},
    {'x': center_x,      'y': collar_y - 250, 'sz': 210, 'rot': 0.0},
    {'x': center_x + 95, 'y': collar_y - 220, 'sz': 195, 'rot': 0.15},
    
    # Mid-High Row
    {'x': center_x - 135, 'y': collar_y - 155, 'sz': 200, 'rot': -0.20},
    {'x': center_x,       'y': collar_y - 170, 'sz': 225, 'rot': 0.0},
    {'x': center_x + 135, 'y': collar_y - 155, 'sz': 200, 'rot': 0.20},
    
    # Front Row (Tucked into ruffled collar)
    {'x': center_x - 90,  'y': collar_y - 95,  'sz': 210, 'rot': -0.10},
    {'x': center_x,       'y': collar_y - 100, 'sz': 225, 'rot': 0.0},
    {'x': center_x + 90,  'y': collar_y - 95,  'sz': 210, 'rot': 0.10},
]

for s in slots:
    fw = s['sz']
    fh = int(fw * (rose_bloom.height / rose_bloom.width))
    cur = rose_bloom.resize((fw, fh), Image.Resampling.LANCZOS)
    
    rot_deg = math.degrees(s['rot'])
    rotated = cur.rotate(-rot_deg, resample=Image.Resampling.BICUBIC, expand=True)
    
    # Bloom head center is roughly at 50% width, 40% height of rose_bloom
    rx = int(s['x'] - rotated.width / 2)
    ry = int(s['y'] - rotated.height * 0.40)
    
    flowers_layer.alpha_composite(rotated, (rx, ry))

# Composite
canvas.paste(flowers_layer, (0, 0), flowers_layer)
canvas.paste(front_resized, (front_x, front_y), front_resized)

canvas.save('scratch/test_lush_dense_dome.png')
print('Saved scratch/test_lush_dense_dome.png')
