import os
import math
from PIL import Image, ImageDraw

def generate_staggered_slots(total, collar_y, center_x, max_hw):
    slots = []
    
    if total == 1:
        slots.append({'x': center_x, 'y': collar_y - 120, 'sz': 270, 'rot': 0.0})
    elif total == 2:
        slots.append({'x': center_x - 45, 'y': collar_y - 110, 'sz': 250, 'rot': -0.08})
        slots.append({'x': center_x + 45, 'y': collar_y - 110, 'sz': 250, 'rot': 0.08})
    elif total == 3:
        slots.append({'x': center_x,      'y': collar_y - 150, 'sz': 250, 'rot': 0.0})
        slots.append({'x': center_x - 55, 'y': collar_y - 85,  'sz': 255, 'rot': -0.10})
        slots.append({'x': center_x + 55, 'y': collar_y - 85,  'sz': 255, 'rot': 0.10})
    elif total == 4:
        slots.append({'x': center_x - 45, 'y': collar_y - 150, 'sz': 240, 'rot': -0.08})
        slots.append({'x': center_x + 45, 'y': collar_y - 150, 'sz': 240, 'rot': 0.08})
        slots.append({'x': center_x - 65, 'y': collar_y - 85,  'sz': 250, 'rot': -0.12})
        slots.append({'x': center_x + 65, 'y': collar_y - 85,  'sz': 250, 'rot': 0.12})
    elif total == 5:
        # 1 top, 2 mid, 2 collar
        slots.append({'x': center_x,      'y': collar_y - 175, 'sz': 245, 'rot': 0.0})
        slots.append({'x': center_x - 65, 'y': collar_y - 125, 'sz': 240, 'rot': -0.12})
        slots.append({'x': center_x + 65, 'y': collar_y - 125, 'sz': 240, 'rot': 0.12})
        slots.append({'x': center_x - 45, 'y': collar_y - 70,  'sz': 250, 'rot': -0.08})
        slots.append({'x': center_x + 45, 'y': collar_y - 70,  'sz': 250, 'rot': 0.08})
    elif total == 9:
        # Master 9-rose layout: 1 apex, 2 mid-high, 3 mid-low, 3 collar
        slots = [
            # Apex (1)
            {'x': center_x,       'y': collar_y - 215, 'sz': 235, 'rot': 0.0},
            # Tier 2 (2)
            {'x': center_x - 55,  'y': collar_y - 165, 'sz': 240, 'rot': -0.10},
            {'x': center_x + 55,  'y': collar_y - 165, 'sz': 240, 'rot': 0.10},
            # Tier 3 (3)
            {'x': center_x - 100, 'y': collar_y - 115, 'sz': 245, 'rot': -0.18},
            {'x': center_x,       'y': collar_y - 110, 'sz': 250, 'rot': 0.0},
            {'x': center_x + 100, 'y': collar_y - 115, 'sz': 245, 'rot': 0.18},
            # Tier 4 (3 - nestled in collar)
            {'x': center_x - 65,  'y': collar_y - 60,  'sz': 250, 'rot': -0.08},
            {'x': center_x,       'y': collar_y - 55,  'sz': 255, 'rot': 0.0},
            {'x': center_x + 65,  'y': collar_y - 60,  'sz': 255, 'rot': 0.08},
        ]
    else:
        # General staggered close-packing for arbitrary N
        # Divide into rows of increasing size from top to bottom
        # e.g. for N=12: 2, 3, 3, 4
        rows_counts = []
        rem = total
        # Determine number of rows (usually 3 to 5 rows)
        n_rows = 3 if total <= 8 else (4 if total <= 14 else 5)
        
        # Distribute counts so lower rows have more flowers
        # e.g., for 4 rows and 12 flowers: 2, 3, 3, 4
        base_per_row = total / n_rows
        allocated = 0
        for r in range(n_rows):
            weight = (r + 1.2) / (n_rows * 0.5 + 0.6 * n_rows)
            count = max(1, int(round(total * weight / n_rows)))
            rows_counts.append(count)
            allocated += count
        
        # Adjust allocation to match total
        diff = total - sum(rows_counts)
        rows_counts[-1] += diff
        # make sure no row has <= 0
        for r in range(len(rows_counts)):
            if rows_counts[r] <= 0:
                rows_counts[r] = 1

        top_y = collar_y - min(240, 150 + total * 4)
        span_y = (collar_y - 55) - top_y
        
        row_idx = 0
        for r_num, cnt in enumerate(rows_counts):
            r_t = r_num / (n_rows - 1) if n_rows > 1 else 0.5
            y_row = top_y + r_t * span_y
            row_hw = max_hw * (0.45 + 0.55 * r_t)
            
            for c in range(cnt):
                c_t = c / (cnt - 1) if cnt > 1 else 0.5
                x_col = center_x + (c_t - 0.5) * 2.0 * row_hw
                # Subtle dome arch: center of row is slightly higher
                dome_lift = math.sin(c_t * math.pi) * 18
                y_pos = y_row - dome_lift
                rot = (c_t - 0.5) * 0.30
                sz = max(185, min(260, int(260 - total * 3)))
                slots.append({'x': x_col, 'y': y_pos, 'sz': sz, 'rot': rot})
    
    return slots

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

# 2. Cavity mask
mask = Image.new('L', (canvas_w, canvas_h), 0)
mask_draw = ImageDraw.Draw(mask)
cavity_poly = [
    (center_x, bucket_y + 15),
    (bucket_x + int(target_w * 0.80), bucket_y + int(target_h * 0.15)),
    (bucket_x + int(target_w * 0.77), bucket_y + int(target_h * 0.38)),
    (front_x + front_w - 35, collar_y + 40),
    (center_x, collar_y + 65),
    (front_x + 35, collar_y + 40),
    (bucket_x + int(target_w * 0.23), bucket_y + int(target_h * 0.38)),
    (bucket_x + int(target_w * 0.20), bucket_y + int(target_h * 0.15)),
]
mask_draw.polygon(cavity_poly, fill=255)

# Flowers layer
flowers_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

rose = Image.open('public/images/flowers/rose_red.png').convert('RGBA')
rw, rh = rose.size
# Crop bare stick: keep top 58% so we have bloom + leaves + short stem
rose_trimmed = rose.crop((0, 0, rw, int(rh * 0.58)))

slots = generate_staggered_slots(9, collar_y, center_x, max_hw=120)

for s in slots:
    fw = s['sz']
    fh = int(fw * (rose_trimmed.height / rose_trimmed.width))
    cur = rose_trimmed.resize((fw, fh), Image.Resampling.LANCZOS)
    
    # Inward stem tilt towards tie point
    dx = center_x - s['x']
    dy = (collar_y + 40) - s['y']
    inward_rad = math.atan2(dx, dy)
    final_rot = s['rot'] * 0.4 - inward_rad * 0.20
    
    rot_deg = math.degrees(final_rot)
    rotated = cur.rotate(-rot_deg, resample=Image.Resampling.BICUBIC, expand=True)
    
    # Bloom head anchor: centered on x, top 25% on y
    rx = int(s['x'] - rotated.width / 2)
    ry = int(s['y'] - rotated.height * 0.25)
    
    flowers_layer.alpha_composite(rotated, (rx, ry))

# Mask flowers
r, g, b, a = flowers_layer.split()
final_a = Image.composite(a, Image.new('L', a.size, 0), mask)
flowers_layer.putalpha(final_a)

canvas.paste(flowers_layer, (0, 0), flowers_layer)

# 3. Front wrapper
front_img = Image.open('public/images/bucket/bucket-1_front.png').convert('RGBA')
front_resized = front_img.resize((front_w, front_h), Image.Resampling.LANCZOS)
canvas.paste(front_resized, (front_x, front_y), front_resized)

canvas.save('scratch/test_9_roses_staggered.png')
print('Saved scratch/test_9_roses_staggered.png')
