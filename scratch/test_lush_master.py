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

collar_y = bucket_y + int(1050 * scale)
front_x = bucket_x + int(401 * scale)
front_y = bucket_y + int(1050 * scale)
front_w = int(1359 * scale)
front_h = int(904 * scale)

# Create test canvas
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
# Crop bare stick: keep top 65% so we have bloom + leaves + short stem
rw, rh = rose.size
rose_trimmed = rose.crop((0, 0, rw, int(rh * 0.65)))

flowers_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

# 9 Roses Arranged like a Master Florist Dome:
# Tier 1 (Back / Top apex): 1 center rose
# Tier 2 (Mid-high): 3 roses
# Tier 3 (Mid-center): 2 roses
# Tier 4 (Front / Collar): 3 roses nestled directly into the ruffled collar
# Notice all X coordinates are within [260, 440]
# Collar is within [202, 577]!
slots = [
    # Top Apex
    {'x': center_x,       'y': collar_y - 230, 'sz': 270, 'rot': 0.0},
    # Mid-high tier (flanking apex)
    {'x': center_x - 70,  'y': collar_y - 190, 'sz': 260, 'rot': -0.12},
    {'x': center_x + 70,  'y': collar_y - 190, 'sz': 260, 'rot': 0.12},
    # Mid tier (full lush core)
    {'x': center_x - 110, 'y': collar_y - 130, 'sz': 265, 'rot': -0.18},
    {'x': center_x,       'y': collar_y - 140, 'sz': 275, 'rot': 0.0},
    {'x': center_x + 110, 'y': collar_y - 130, 'sz': 265, 'rot': 0.18},
    # Front tier (nestled directly against ruffled collar)
    {'x': center_x - 80,  'y': collar_y - 65,  'sz': 270, 'rot': -0.08},
    {'x': center_x,       'y': collar_y - 60,  'sz': 275, 'rot': 0.0},
    {'x': center_x + 80,  'y': collar_y - 65,  'sz': 270, 'rot': 0.08},
]

for s in slots:
    fw = s['sz']
    fh = int(fw * (rose_trimmed.height / rose_trimmed.width))
    cur = rose_trimmed.resize((fw, fh), Image.Resampling.LANCZOS)
    
    # Rotate slightly outward for natural dome bloom direction
    rot_deg = math.degrees(s['rot'])
    rotated = cur.rotate(-rot_deg, resample=Image.Resampling.BICUBIC, expand=True)
    
    # Bloom head is at top 20% of image
    # Center bloom at s['x'], s['y']
    rx = int(s['x'] - rotated.width / 2)
    ry = int(s['y'] - rotated.height * 0.18)
    
    flowers_layer.alpha_composite(rotated, (rx, ry))

# Now paste flowers onto canvas
canvas.paste(flowers_layer, (0, 0), flowers_layer)

# Front wrapper: collar + ribbon
# The collar naturally overlaps the bottom flowers & leaves, concealing all stem cuts!
canvas.paste(front_resized, (front_x, front_y), front_resized)

canvas.save('scratch/test_lush_master.png')
print('Saved scratch/test_lush_master.png')
