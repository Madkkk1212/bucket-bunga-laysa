import os
import math
from PIL import Image, ImageDraw

def generate_staggered_slots(total, collar_y, center_x, max_hw):
    slots = []
    
    if total == 1:
        slots.append({'x': center_x, 'y': collar_y - 140, 'sz': 290, 'rot': 0.0})
    elif total == 2:
        slots.append({'x': center_x - 55, 'y': collar_y - 130, 'sz': 270, 'rot': -0.08})
        slots.append({'x': center_x + 55, 'y': collar_y - 130, 'sz': 270, 'rot': 0.08})
    elif total == 3:
        slots.append({'x': center_x,      'y': collar_y - 180, 'sz': 270, 'rot': 0.0})
        slots.append({'x': center_x - 65, 'y': collar_y - 95,  'sz': 275, 'rot': -0.10})
        slots.append({'x': center_x + 65, 'y': collar_y - 95,  'sz': 275, 'rot': 0.10})
    elif total == 4:
        slots.append({'x': center_x - 55, 'y': collar_y - 175, 'sz': 260, 'rot': -0.08})
        slots.append({'x': center_x + 55, 'y': collar_y - 175, 'sz': 260, 'rot': 0.08})
        slots.append({'x': center_x - 75, 'y': collar_y - 95,  'sz': 265, 'rot': -0.12})
        slots.append({'x': center_x + 75, 'y': collar_y - 95,  'sz': 265, 'rot': 0.12})
    elif total == 5:
        # 1 apex, 2 mid, 2 front (classic Korean fan dome)
        slots.append({'x': center_x,      'y': collar_y - 205, 'sz': 260, 'rot': 0.0})
        slots.append({'x': center_x - 75, 'y': collar_y - 145, 'sz': 255, 'rot': -0.12})
        slots.append({'x': center_x + 75, 'y': collar_y - 145, 'sz': 255, 'rot': 0.12})
        slots.append({'x': center_x - 55, 'y': collar_y - 75,  'sz': 265, 'rot': -0.08})
        slots.append({'x': center_x + 55, 'y': collar_y - 75,  'sz': 265, 'rot': 0.08})
    elif total == 9:
        # Master 9-rose layout:
        # 1 apex, 2 mid-high, 3 mid-low, 3 collar
        slots = [
            # Apex (1)
            {'x': center_x,       'y': collar_y - 235, 'sz': 255, 'rot': 0.0},
            # Tier 2 (2)
            {'x': center_x - 65,  'y': collar_y - 180, 'sz': 260, 'rot': -0.10},
            {'x': center_x + 65,  'y': collar_y - 180, 'sz': 260, 'rot': 0.10},
            # Tier 3 (3)
            {'x': center_x - 115, 'y': collar_y - 120, 'sz': 265, 'rot': -0.18},
            {'x': center_x,       'y': collar_y - 115, 'sz': 270, 'rot': 0.0},
            {'x': center_x + 115, 'y': collar_y - 120, 'sz': 265, 'rot': 0.18},
            # Tier 4 (3 - nestled deep into pleated collar so collar covers stems naturally)
            {'x': center_x - 75,  'y': collar_y - 50,  'sz': 275, 'rot': -0.08},
            {'x': center_x,       'y': collar_y - 45,  'sz': 280, 'rot': 0.0},
            {'x': center_x + 75,  'y': collar_y - 50,  'sz': 275, 'rot': 0.08},
        ]
    else:
        # General staggered close-packing
        n_rows = 3 if total <= 8 else (4 if total <= 14 else 5)
        rows_counts = []
        for r in range(n_rows):
            weight = (r + 1.2) / (n_rows * 0.5 + 0.6 * n_rows)
            count = max(1, int(round(total * weight / n_rows)))
            rows_counts.append(count)
        diff = total - sum(rows_counts)
        rows_counts[-1] += diff
        for r in range(len(rows_counts)):
            if rows_counts[r] <= 0:
                rows_counts[r] = 1

        top_y = collar_y - min(260, 160 + total * 4)
        span_y = (collar_y - 45) - top_y
        
        for r_num, cnt in enumerate(rows_counts):
            r_t = r_num / (n_rows - 1) if n_rows > 1 else 0.5
            y_row = top_y + r_t * span_y
            row_hw = max_hw * (0.50 + 0.50 * r_t)
            
            for c in range(cnt):
                c_t = c / (cnt - 1) if cnt > 1 else 0.5
                x_col = center_x + (c_t - 0.5) * 2.0 * row_hw
                dome_lift = math.sin(c_t * math.pi) * 22
                y_pos = y_row - dome_lift
                rot = (c_t - 0.5) * 0.28
                sz = max(195, min(275, int(275 - total * 3)))
                slots.append({'x': x_col, 'y': y_pos, 'sz': sz, 'rot': rot})
    
    return slots

# Feather bottom of flower image so stem fades out smoothly (no harsh cut lines)
def prepare_feathered_flower(im):
    w, h = im.size
    # Keep up to 68% height
    keep_h = int(h * 0.68)
    cropped = im.crop((0, 0, w, keep_h))
    
    # Feather alpha in the bottom 18% of cropped
    arr = cropped.load()
    fade_start = int(keep_h * 0.82)
    fade_len = keep_h - fade_start
    for y in range(fade_start, keep_h):
        factor = 1.0 - ((y - fade_start) / float(fade_len))
        for x in range(w):
            r, g, b, a = arr[x, y]
            if a > 0:
                arr[x, y] = (r, g, b, int(a * factor))
    return cropped

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
    (center_x, bucket_y + 10),
    (bucket_x + int(target_w * 0.82), bucket_y + int(target_h * 0.14)),
    (bucket_x + int(target_w * 0.78), bucket_y + int(target_h * 0.38)),
    (front_x + front_w - 30, collar_y + 40),
    (center_x, collar_y + 80),
    (front_x + 30, collar_y + 40),
    (bucket_x + int(target_w * 0.22), bucket_y + int(target_h * 0.38)),
    (bucket_x + int(target_w * 0.18), bucket_y + int(target_h * 0.14)),
]
mask_draw.polygon(cavity_poly, fill=255)

# Flowers layer
flowers_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

rose = Image.open('public/images/flowers/rose_red.png').convert('RGBA')
rose_feathered = prepare_feathered_flower(rose)

slots = generate_staggered_slots(9, collar_y, center_x, max_hw=135)

for s in slots:
    fw = s['sz']
    fh = int(fw * (rose_feathered.height / rose_feathered.width))
    cur = rose_feathered.resize((fw, fh), Image.Resampling.LANCZOS)
    
    dx = center_x - s['x']
    dy = (collar_y + 50) - s['y']
    inward_rad = math.atan2(dx, dy)
    final_rot = s['rot'] * 0.4 - inward_rad * 0.20
    
    rot_deg = math.degrees(final_rot)
    rotated = cur.rotate(-rot_deg, resample=Image.Resampling.BICUBIC, expand=True)
    
    rx = int(s['x'] - rotated.width / 2)
    ry = int(s['y'] - rotated.height * 0.22)
    
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

canvas.save('scratch/test_9_roses_gorgeous.png')
print('Saved scratch/test_9_roses_gorgeous.png')
