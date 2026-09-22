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
collar_y = int(round(bucket_y + target_h * 0.5373))

# Create canvas
canvas = Image.new('RGBA', (canvas_w, canvas_h), (248, 246, 242, 255))

# 1. Back wrapper
back_img = Image.open('public/images/bucket/bucket-1_back.png').convert('RGBA')
back_resized = back_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
canvas.paste(back_resized, (bucket_x, bucket_y), back_resized)

# 2. Front wrapper info
front_img = Image.open('public/images/bucket/bucket-1_front.png').convert('RGBA')
front_w = int(round(1359 * scale))
front_h = int(round(904 * scale))
front_resized = front_img.resize((front_w, front_h), Image.Resampling.LANCZOS)
front_x = bucket_x + int(round(401 * scale))
front_y = bucket_y + int(round(1050 * scale))

# Bouquet cavity mask
# The cavity is where flowers are allowed to be
# Left wing inner edge, Right wing inner edge, collar bottom
mask = Image.new('L', (canvas_w, canvas_h), 0)
mask_draw = ImageDraw.Draw(mask)

# Points defining cavity:
# Left wing top: bucket_x + target_w * 0.16, bucket_y + target_h * 0.12
# Top dome: center_x, bucket_y - 10
# Right wing top: bucket_x + target_w * 0.84, bucket_y + target_h * 0.12
# Right wing collar: bucket_x + target_w * 0.72, collar_y + 40
# Collar bottom: center_x, collar_y + 60
# Left wing collar: bucket_x + target_w * 0.28, collar_y + 40
poly = [
    (center_x, bucket_y - 20),
    (bucket_x + int(target_w * 0.86), bucket_y + int(target_h * 0.10)),
    (bucket_x + int(target_w * 0.80), bucket_y + int(target_h * 0.35)),
    (bucket_x + int(target_w * 0.72), collar_y + 35),
    (center_x, collar_y + 55),
    (bucket_x + int(target_w * 0.28), collar_y + 35),
    (bucket_x + int(target_w * 0.20), bucket_y + int(target_h * 0.35)),
    (bucket_x + int(target_w * 0.14), bucket_y + int(target_h * 0.10)),
]
mask_draw.polygon(poly, fill=255)

# Flowers layer
flowers_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

# 9 Roses test
rose = Image.open('public/images/flowers/rose_red.png').convert('RGBA')

# In our flower image, bloom is top 380px, stem is below
# Let's arrange 9 flowers:
# 4 back, 3 mid, 2 front
slots = [
    # Back row (higher up, slightly smaller, spread across wrapper opening)
    {'x_rel': -0.62, 'y_rel': -0.78, 'scale': 0.95, 'z': 0},
    {'x_rel': -0.22, 'y_rel': -0.92, 'scale': 1.00, 'z': 1},
    {'x_rel':  0.22, 'y_rel': -0.92, 'scale': 1.00, 'z': 2},
    {'x_rel':  0.62, 'y_rel': -0.78, 'scale': 0.95, 'z': 3},
    # Mid row (dense core)
    {'x_rel': -0.42, 'y_rel': -0.52, 'scale': 1.05, 'z': 4},
    {'x_rel':  0.00, 'y_rel': -0.62, 'scale': 1.10, 'z': 5},
    {'x_rel':  0.42, 'y_rel': -0.52, 'scale': 1.05, 'z': 6},
    # Front row (nestled into ruffled collar)
    {'x_rel': -0.22, 'y_rel': -0.26, 'scale': 1.08, 'z': 7},
    {'x_rel':  0.22, 'y_rel': -0.26, 'scale': 1.08, 'z': 8},
]

dome_w = target_w * 0.36
dome_h = 240

tie_x = center_x
tie_y = collar_y + 20

for s in slots:
    pos_x = center_x + s['x_rel'] * dome_w
    pos_y = collar_y + s['y_rel'] * dome_h
    
    # Calculate inward stem angle towards tie point
    dx = tie_x - pos_x
    dy = tie_y - pos_y
    angle_rad = math.atan2(dx, dy)
    angle_deg = math.degrees(angle_rad) * 0.70  # gentle inward convergence
    
    # Max stem length: should never extend past collar + 30
    dist_to_collar = (collar_y + 35) - pos_y
    
    # Flower size: we want bloom to be lush!
    # Original rose: 1024x1024. Bloom height is ~350px.
    # To have bloom height ~130px, rose total height should be ~320px
    base_fl_w = int(260 * s['scale'])
    base_fl_h = int(260 * s['scale'])
    
    # Crop flower stem so it doesn't poke out below collar
    # We take the rose image, and if dist_to_collar is shorter than base_fl_h, we can limit it
    cur_rose = rose.resize((base_fl_w, base_fl_h), Image.Resampling.LANCZOS)
    
    # Rotate with inward stem angle
    # In PIL rotate is counter-clockwise, angle_deg is inward
    # positive angle_deg means target is to the right of pos_x, so stem should tilt right (clockwise in screen coords, which is negative in PIL)
    rotated = cur_rose.rotate(-angle_deg, resample=Image.Resampling.BICUBIC, expand=True)
    
    # Place bloom head centered on (pos_x, pos_y)
    # The bloom is near the top center of cur_rose (x=0.5, y=0.25)
    rx = int(pos_x - rotated.width / 2)
    ry = int(pos_y - rotated.height * 0.15)
    
    # Paste to flowers layer
    flowers_layer.alpha_composite(rotated, (rx, ry))

# Apply cavity mask to flowers layer so NO pixels stick out of wrapper
r, g, b, a = flowers_layer.split()
final_a = Image.composite(a, Image.new('L', a.size, 0), mask)
flowers_layer.putalpha(final_a)

# Paste flowers layer onto canvas
canvas.paste(flowers_layer, (0, 0), flowers_layer)

# 3. Front wrapper (ruffled collar + striped ribbon)
canvas.paste(front_resized, (front_x, front_y), front_resized)

os.makedirs('scratch', exist_ok=True)
out_path = 'scratch/test_lush_fixed.png'
canvas.save(out_path)
print(f'Saved test output to {out_path}')
