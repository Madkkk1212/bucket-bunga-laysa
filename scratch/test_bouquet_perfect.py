import os
import math
from PIL import Image, ImageDraw

def render_bouquet(flower_ids, total_count=9):
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

    # 2. Cavity mask for flowers
    # Inner boundaries of wrapper:
    # Top arch: reaches near top of back wrapper (bucket_y + 40)
    # Left wing inner fold: x ~ bucket_x + target_w * 0.18, y ~ bucket_y + target_h * 0.18
    # Left collar seat: front_x + 30, collar_y + 30
    # Right collar seat: front_x + front_w - 30, collar_y + 30
    # Right wing inner fold: x ~ bucket_x + target_w * 0.82, y ~ bucket_y + target_h * 0.18
    mask = Image.new('L', (canvas_w, canvas_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    
    cavity_poly = [
        (center_x, bucket_y + 20),
        (bucket_x + int(target_w * 0.78), bucket_y + int(target_h * 0.16)),
        (bucket_x + int(target_w * 0.75), bucket_y + int(target_h * 0.38)),
        (front_x + front_w - 40, collar_y + 40),
        (center_x, collar_y + 60),
        (front_x + 40, collar_y + 40),
        (bucket_x + int(target_w * 0.25), bucket_y + int(target_h * 0.38)),
        (bucket_x + int(target_w * 0.22), bucket_y + int(target_h * 0.16)),
    ]
    mask_draw.polygon(cavity_poly, fill=255)

    flowers_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

    # Load flower images
    flower_imgs = {}
    for fid in set(flower_ids):
        p = f'public/images/flowers/{fid}.png'
        if os.path.exists(p):
            im = Image.open(p).convert('RGBA')
            # Crop to top 60%: keeps bloom + calyx + upper leafy foliage, removes bare bottom stick
            w, h = im.size
            flower_imgs[fid] = im.crop((0, 0, w, int(h * 0.60)))

    # Compute slots based on total count
    total = len(flower_ids)
    slots = []

    # Dome aperture parameters
    # collar_y = 488
    # wrapper top = 220
    # available vertical height for flowers = 488 - 220 = 268px
    # max half width inside collar = (front_w * 0.5) * 0.75 = 140px
    max_hw = 135
    
    if total <= 5:
        # Small bouquets
        if total == 1:
            slots.append({'x': center_x, 'y': collar_y - 130, 'sz': 260, 'rot': 0.0})
        elif total == 2:
            slots.append({'x': center_x - 45, 'y': collar_y - 130, 'sz': 240, 'rot': -0.10})
            slots.append({'x': center_x + 45, 'y': collar_y - 130, 'sz': 240, 'rot': 0.10})
        elif total == 3:
            slots.append({'x': center_x,       'y': collar_y - 170, 'sz': 240, 'rot': 0.0})
            slots.append({'x': center_x - 55,  'y': collar_y - 100, 'sz': 245, 'rot': -0.12})
            slots.append({'x': center_x + 55,  'y': collar_y - 100, 'sz': 245, 'rot': 0.12})
        elif total == 4:
            slots.append({'x': center_x - 45,  'y': collar_y - 170, 'sz': 235, 'rot': -0.08})
            slots.append({'x': center_x + 45,  'y': collar_y - 170, 'sz': 235, 'rot': 0.08})
            slots.append({'x': center_x - 65,  'y': collar_y - 95,  'sz': 240, 'rot': -0.15})
            slots.append({'x': center_x + 65,  'y': collar_y - 95,  'sz': 240, 'rot': 0.15})
        elif total == 5:
            # Exact reference bouquet layout (3 top, 2 front nestled)
            slots.append({'x': center_x - 70,  'y': collar_y - 165, 'sz': 230, 'rot': -0.15})
            slots.append({'x': center_x,       'y': collar_y - 190, 'sz': 240, 'rot': 0.0})
            slots.append({'x': center_x + 70,  'y': collar_y - 165, 'sz': 230, 'rot': 0.15})
            slots.append({'x': center_x - 45,  'y': collar_y - 95,  'sz': 235, 'rot': -0.08})
            slots.append({'x': center_x + 45,  'y': collar_y - 95,  'sz': 235, 'rot': 0.08})
    else:
        # 6 to 25 flowers: 3 overlapping tiers (Back, Mid, Front)
        n_back = max(2, int(round(total * 0.38)))
        n_mid = max(2, int(round(total * 0.34)))
        n_front = total - n_back - n_mid

        # Back tier: high arch, peeking out
        for i in range(n_back):
            t = i / (n_back - 1) if n_back > 1 else 0.5
            x = center_x + (t - 0.5) * max_hw * 1.85
            # arch curve
            arch = math.sin(t * math.pi) * 35
            y = (collar_y - 215) - arch
            rot = (t - 0.5) * 0.28
            slots.append({'x': x, 'y': y, 'sz': 210, 'rot': rot})

        # Mid tier: rich dense core
        for i in range(n_mid):
            t = i / (n_mid - 1) if n_mid > 1 else 0.5
            x = center_x + (t - 0.5) * max_hw * 1.55
            arch = math.sin(t * math.pi) * 25
            y = (collar_y - 140) - arch
            rot = (t - 0.5) * 0.20
            slots.append({'x': x, 'y': y, 'sz': 225, 'rot': rot})

        # Front tier: nestled into collar
        for i in range(n_front):
            t = i / (n_front - 1) if n_front > 1 else 0.5
            x = center_x + (t - 0.5) * max_hw * 1.20
            arch = math.sin(t * math.pi) * 15
            y = (collar_y - 75) - arch
            rot = (t - 0.5) * 0.12
            slots.append({'x': x, 'y': y, 'sz': 230, 'rot': rot})

    # Render flowers
    for idx, fid in enumerate(flower_ids):
        s = slots[idx % len(slots)]
        fl = flower_imgs.get(fid)
        if not fl:
            continue
        
        fw = s['sz']
        fh = int(fw * (fl.height / fl.width))
        cur = fl.resize((fw, fh), Image.Resampling.LANCZOS)
        
        # Inward tilt towards center tie point (centerX, collar_y + 40)
        dx = center_x - s['x']
        dy = (collar_y + 40) - s['y']
        stem_inward_rad = math.atan2(dx, dy)
        combined_rot = s['rot'] * 0.5 - stem_inward_rad * 0.25
        
        rot_deg = math.degrees(combined_rot)
        rotated = cur.rotate(-rot_deg, resample=Image.Resampling.BICUBIC, expand=True)
        
        # Center bloom on (s['x'], s['y'])
        # Bloom is around top 30% of cur
        rx = int(s['x'] - rotated.width / 2)
        ry = int(s['y'] - rotated.height * 0.25)
        
        flowers_layer.alpha_composite(rotated, (rx, ry))

    # Apply cavity mask: ZERO pixels outside wrapper cavity
    r, g, b, a = flowers_layer.split()
    final_a = Image.composite(a, Image.new('L', a.size, 0), mask)
    flowers_layer.putalpha(final_a)

    canvas.paste(flowers_layer, (0, 0), flowers_layer)

    # 3. Front wrapper (pleated collar + striped ribbon)
    front_img = Image.open('public/images/bucket/bucket-1_front.png').convert('RGBA')
    front_resized = front_img.resize((front_w, front_h), Image.Resampling.LANCZOS)
    canvas.paste(front_resized, (front_x, front_y), front_resized)

    return canvas

# Test 9 Red Roses
c9 = render_bouquet(['rose_red'] * 9)
c9.save('scratch/test_9_roses_perfect.png')
print('Saved scratch/test_9_roses_perfect.png')

# Test mixed flowers: 5 pink chrysanthemums + purple asters (like reference!)
c_ref = render_bouquet(['chrysanthemum_pink'] * 5 + ['aster_purple'] * 4)
c_ref.save('scratch/test_ref_style_perfect.png')
print('Saved scratch/test_ref_style_perfect.png')
