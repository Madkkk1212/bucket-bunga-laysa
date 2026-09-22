import os
import math
from PIL import Image, ImageDraw

canvas_w, canvas_h = 700, 750
target_h = int(min(canvas_h * 0.90, 540))
scale = target_h / 1954.0
target_w = int(round(1866 * scale))

bucket_x = int(round((canvas_w - target_w) / 2))
bucket_y = int(round(canvas_h - target_h - 12))
center_x = canvas_w // 2

# Landmarks
wrapper_top_y = bucket_y + int(80 * scale)
collar_y = bucket_y + int(1050 * scale)
front_x = bucket_x + int(401 * scale)
front_y = bucket_y + int(1050 * scale)
front_w = int(1359 * scale)
front_h = int(904 * scale)

print(f"bucket_y={bucket_y}, collar_y={collar_y}, wrapper_top_y={wrapper_top_y}")
print(f"front: x={front_x}, y={front_y}, w={front_w}, h={front_h}")

# Create test canvas
canvas = Image.new('RGBA', (canvas_w, canvas_h), (248, 246, 242, 255))

# 1. Back wrapper
back_img = Image.open('public/images/bucket/bucket-1_back.png').convert('RGBA')
back_resized = back_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
canvas.paste(back_resized, (bucket_x, bucket_y), back_resized)

# 2. Front wrapper
front_img = Image.open('public/images/bucket/bucket-1_front.png').convert('RGBA')
front_resized = front_img.resize((front_w, front_h), Image.Resampling.LANCZOS)

# Build cavity mask
# Left collar inside: front_x + 35
# Right collar inside: front_x + front_w - 35
# Left wing top: bucket_x + int(target_w * 0.16), bucket_y + int(target_h * 0.14)
# Right wing top: bucket_x + int(target_w * 0.84), bucket_y + int(target_h * 0.14)
mask = Image.new('L', (canvas_w, canvas_h), 0)
mask_draw = ImageDraw.Draw(mask)

c_lx = front_x + 25
c_rx = front_x + front_w - 25
w_lx = bucket_x + int(target_w * 0.16)
w_ly = bucket_y + int(target_h * 0.12)
w_rx = bucket_x + int(target_w * 0.84)
w_ry = bucket_y + int(target_h * 0.12)

poly = [
    (center_x, bucket_y - 15),
    (w_rx, w_ry),
    (front_x + front_w - 20, bucket_y + int(target_h * 0.38)),
    (c_rx, collar_y + 35),
    (center_x, collar_y + 55),
    (c_lx, collar_y + 35),
    (front_x + 20, bucket_y + int(target_h * 0.38)),
    (w_lx, w_ly),
]
mask_draw.polygon(poly, fill=255)

# Flower arrangement
rose = Image.open('public/images/flowers/rose_red.png').convert('RGBA')
# Crop bare stick: keep top 68%
rw, rh = rose.size
rose_stem_trimmed = rose.crop((0, 0, rw, int(rh * 0.68)))

flowers_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

# 9-flower layout:
# High lush dome filling the space
dome_span_x = (c_rx - c_lx) * 0.44  # spread within collar width
top_y = wrapper_top_y + 25
bot_y = collar_y - 25
span_y = bot_y - top_y

# Rows from top to bottom:
# Row 1 (back, top arch): 3 blooms
# Row 2 (mid-high): 2 blooms
# Row 3 (mid-low): 2 blooms
# Row 4 (front collar): 2 blooms
slots = [
    # Top arch (back)
    {'x': center_x - dome_span_x * 0.65, 'y': top_y + span_y * 0.05, 'scale': 1.15},
    {'x': center_x,                      'y': top_y - span_y * 0.04, 'scale': 1.25},
    {'x': center_x + dome_span_x * 0.65, 'y': top_y + span_y * 0.05, 'scale': 1.15},
    # Mid-high
    {'x': center_x - dome_span_x * 0.85, 'y': top_y + span_y * 0.36, 'scale': 1.18},
    {'x': center_x + dome_span_x * 0.85, 'y': top_y + span_y * 0.36, 'scale': 1.18},
    # Mid-low
    {'x': center_x - dome_span_x * 0.42, 'y': top_y + span_y * 0.62, 'scale': 1.22},
    {'x': center_x + dome_span_x * 0.42, 'y': top_y + span_y * 0.62, 'scale': 1.22},
    # Front nestled
    {'x': center_x - dome_span_x * 0.28, 'y': top_y + span_y * 0.90, 'scale': 1.25},
    {'x': center_x + dome_span_x * 0.28, 'y': top_y + span_y * 0.90, 'scale': 1.25},
]

tie_x = center_x
tie_y = collar_y + 40

for s in slots:
    px = s['x']
    py = s['y']
    
    # Inward stem convergence
    dx = tie_x - px
    dy = tie_y - py
    angle_rad = math.atan2(dx, dy)
    angle_deg = math.degrees(angle_rad) * 0.60
    
    # Flower size
    fw = int(220 * s['scale'])
    fh = int(220 * s['scale'] * (rose_stem_trimmed.height / rose_stem_trimmed.width))
    
    cur = rose_stem_trimmed.resize((fw, fh), Image.Resampling.LANCZOS)
    rotated = cur.rotate(-angle_deg, resample=Image.Resampling.BICUBIC, expand=True)
    
    # Place bloom head centered on (px, py)
    # The bloom is around y=0.20 of rose_stem_trimmed
    rx = int(px - rotated.width / 2)
    ry = int(py - rotated.height * 0.20)
    
    flowers_layer.alpha_composite(rotated, (rx, ry))

# Mask flowers layer
r, g, b, a = flowers_layer.split()
final_a = Image.composite(a, Image.new('L', a.size, 0), mask)
flowers_layer.putalpha(final_a)

canvas.paste(flowers_layer, (0, 0), flowers_layer)
canvas.paste(front_resized, (front_x, front_y), front_resized)

canvas.save('scratch/test_lush_fixed_v2.png')
print('Saved scratch/test_lush_fixed_v2.png')
