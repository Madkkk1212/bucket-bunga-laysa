import os, math
from PIL import Image, ImageDraw, ImageFilter

def render_test_bouquet(flower_list, output_path):
    canvas_w, canvas_h = 600, 600
    target_h = 540
    scale = target_h / 1954.0
    target_w = round(1866 * scale)
    bucket_x = round((canvas_w - target_w) / 2)
    bucket_y = round(canvas_h - target_h - 12)
    collar_y = round(bucket_y + 1050 * scale)
    center_x = canvas_w // 2
    front_w = round(1359 * scale)
    front_h = round(904 * scale)
    front_x = bucket_x + round(401 * scale)
    front_y = bucket_y + round(1050 * scale)
    sf = scale / (540.0 / 1954.0) # 1.0

    canvas = Image.new("RGBA", (canvas_w, canvas_h), (250, 248, 245, 255))

    # 1. Back wrapper
    back_img = Image.open("public/images/bucket/bucket-1_back.png").convert("RGBA")
    back_img = back_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(back_img, (bucket_x, bucket_y))

    # 2. Cavity Mask - generous envelope matching back wrapper wings so no straight cuts
    mask_img = Image.new("L", (canvas_w, canvas_h), 0)
    draw_mask = ImageDraw.Draw(mask_img)
    cavity_poly = [
        (center_x, bucket_y + round(30 * scale)),
        (bucket_x + round(target_w * 0.90), bucket_y + round(target_h * 0.10)),
        (bucket_x + round(target_w * 0.88), bucket_y + round(target_h * 0.42)),
        (front_x + front_w - round(10 * scale), collar_y + round(60 * scale)),
        (center_x, collar_y + round(100 * scale)),
        (front_x + round(10 * scale), collar_y + round(60 * scale)),
        (bucket_x + round(target_w * 0.12), bucket_y + round(target_h * 0.42)),
        (bucket_x + round(target_w * 0.10), bucket_y + round(target_h * 0.10)),
    ]
    draw_mask.polygon(cavity_poly, fill=255)

    flower_canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))

    mains = [f for f in flower_list if f.get('category', 'main') == 'main']
    fillers = [f for f in flower_list if f.get('category') == 'filler']
    greens = [f for f in flower_list if f.get('category') == 'greenery']

    render_items = []

    # ─── GREENERY (Outer framing foliage) ───
    green_anchors = [
        {'x': center_x - round(140 * sf), 'y': collar_y - round(165 * sf), 'rot': -22, 'sz': round(180 * sf), 'zIndex': 0},
        {'x': center_x + round(140 * sf), 'y': collar_y - round(165 * sf), 'rot': 22, 'sz': round(180 * sf), 'zIndex': 0},
        {'x': center_x - round(155 * sf), 'y': collar_y - round(95 * sf), 'rot': -32, 'sz': round(180 * sf), 'zIndex': 1},
        {'x': center_x + round(155 * sf), 'y': collar_y - round(95 * sf), 'rot': 32, 'sz': round(180 * sf), 'zIndex': 1},
        {'x': center_x - round(120 * sf), 'y': collar_y - round(25 * sf), 'rot': -14, 'sz': round(170 * sf), 'zIndex': 12},
        {'x': center_x + round(120 * sf), 'y': collar_y - round(25 * sf), 'rot': 14, 'sz': round(170 * sf), 'zIndex': 12},
    ]
    for idx, g in enumerate(greens):
        anc = green_anchors[idx % len(green_anchors)]
        render_items.append({
            'img_path': g['imageUrl'].lstrip('/'),
            'x': anc['x'], 'y': anc['y'],
            'sz': anc['sz'], 'rot': anc['rot'],
            'zIndex': anc['zIndex']
        })

    # ─── FILLERS (Lush background clouds & side wings like reference) ───
    n_fill = len(fillers)
    filler_anchors = [
        # Top crown arch
        {'x': center_x, 'y': collar_y - round(185 * sf), 'rot': 0, 'sz': round(165 * sf), 'zIndex': 1},
        {'x': center_x - round(75 * sf), 'y': collar_y - round(170 * sf), 'rot': -10, 'sz': round(160 * sf), 'zIndex': 1},
        {'x': center_x + round(75 * sf), 'y': collar_y - round(170 * sf), 'rot': 10, 'sz': round(160 * sf), 'zIndex': 1},
        # Upper-mid backing (fills space directly above main blooms)
        {'x': center_x - round(45 * sf), 'y': collar_y - round(135 * sf), 'rot': -6, 'sz': round(155 * sf), 'zIndex': 2},
        {'x': center_x + round(45 * sf), 'y': collar_y - round(135 * sf), 'rot': 6, 'sz': round(155 * sf), 'zIndex': 2},
        {'x': center_x, 'y': collar_y - round(130 * sf), 'rot': 0, 'sz': round(150 * sf), 'zIndex': 2},
        # Outer wings
        {'x': center_x - round(135 * sf), 'y': collar_y - round(120 * sf), 'rot': -20, 'sz': round(150 * sf), 'zIndex': 2},
        {'x': center_x + round(135 * sf), 'y': collar_y - round(120 * sf), 'rot': 20, 'sz': round(150 * sf), 'zIndex': 2},
        # Flanks
        {'x': center_x - round(120 * sf), 'y': collar_y - round(65 * sf), 'rot': -15, 'sz': round(145 * sf), 'zIndex': 3},
        {'x': center_x + round(120 * sf), 'y': collar_y - round(65 * sf), 'rot': 15, 'sz': round(145 * sf), 'zIndex': 3},
        # Crevices between main blooms
        {'x': center_x - round(60 * sf), 'y': collar_y - round(45 * sf), 'rot': -6, 'sz': round(135 * sf), 'zIndex': 8},
        {'x': center_x + round(60 * sf), 'y': collar_y - round(45 * sf), 'rot': 6, 'sz': round(135 * sf), 'zIndex': 8},
    ]
    for idx, fl in enumerate(fillers):
        anc = filler_anchors[idx % len(filler_anchors)]
        render_items.append({
            'img_path': fl['imageUrl'].lstrip('/'),
            'x': anc['x'], 'y': anc['y'],
            'sz': anc['sz'], 'rot': anc['rot'],
            'zIndex': anc['zIndex']
        })

    # ─── MAIN BLOOMS (Proportioned Korean dome packing) ───
    n_main = len(mains)
    main_slots = []
    if n_main == 1:
        main_slots.append({'x': center_x, 'y': collar_y - round(65 * sf), 'sz': round(165 * sf), 'rot': 0, 'zIndex': 10})
    elif n_main == 2:
        main_slots.append({'x': center_x - round(45 * sf), 'y': collar_y - round(55 * sf), 'sz': round(150 * sf), 'rot': -4, 'zIndex': 10})
        main_slots.append({'x': center_x + round(45 * sf), 'y': collar_y - round(55 * sf), 'sz': round(150 * sf), 'rot': 4, 'zIndex': 10})
    elif n_main == 3:
        main_slots.append({'x': center_x, 'y': collar_y - round(95 * sf), 'sz': round(145 * sf), 'rot': 0, 'zIndex': 6})
        main_slots.append({'x': center_x - round(52 * sf), 'y': collar_y - round(45 * sf), 'sz': round(145 * sf), 'rot': -6, 'zIndex': 10})
        main_slots.append({'x': center_x + round(52 * sf), 'y': collar_y - round(45 * sf), 'sz': round(145 * sf), 'rot': 6, 'zIndex': 10})
    elif n_main == 4:
        main_slots.append({'x': center_x - round(46 * sf), 'y': collar_y - round(95 * sf), 'sz': round(140 * sf), 'rot': -5, 'zIndex': 6})
        main_slots.append({'x': center_x + round(46 * sf), 'y': collar_y - round(95 * sf), 'sz': round(140 * sf), 'rot': 5, 'zIndex': 6})
        main_slots.append({'x': center_x - round(54 * sf), 'y': collar_y - round(40 * sf), 'sz': round(145 * sf), 'rot': -6, 'zIndex': 10})
        main_slots.append({'x': center_x + round(54 * sf), 'y': collar_y - round(40 * sf), 'sz': round(145 * sf), 'rot': 6, 'zIndex': 10})
    elif n_main == 5:
        # EXACT Korean layout matching reference_bouquet_transparent.png!
        # Top row (3)
        main_slots.append({'x': center_x - round(68 * sf), 'y': collar_y - round(85 * sf), 'sz': round(140 * sf), 'rot': -7, 'zIndex': 6})
        main_slots.append({'x': center_x, 'y': collar_y - round(95 * sf), 'sz': round(145 * sf), 'rot': 0, 'zIndex': 6})
        main_slots.append({'x': center_x + round(68 * sf), 'y': collar_y - round(85 * sf), 'sz': round(140 * sf), 'rot': 7, 'zIndex': 6})
        # Bottom row (2 nestled between them)
        main_slots.append({'x': center_x - round(38 * sf), 'y': collar_y - round(35 * sf), 'sz': round(145 * sf), 'rot': -4, 'zIndex': 10})
        main_slots.append({'x': center_x + round(38 * sf), 'y': collar_y - round(35 * sf), 'sz': round(145 * sf), 'rot': 4, 'zIndex': 10})
    elif n_main == 7:
        # 1 apex, 3 mid, 3 collar
        main_slots.append({'x': center_x, 'y': collar_y - round(135 * sf), 'sz': round(135 * sf), 'rot': 0, 'zIndex': 4})
        main_slots.append({'x': center_x - round(65 * sf), 'y': collar_y - round(90 * sf), 'sz': round(135 * sf), 'rot': -6, 'zIndex': 6})
        main_slots.append({'x': center_x, 'y': collar_y - round(90 * sf), 'sz': round(140 * sf), 'rot': 0, 'zIndex': 6})
        main_slots.append({'x': center_x + round(65 * sf), 'y': collar_y - round(90 * sf), 'sz': round(135 * sf), 'rot': 6, 'zIndex': 6})
        main_slots.append({'x': center_x - round(72 * sf), 'y': collar_y - round(35 * sf), 'sz': round(140 * sf), 'rot': -8, 'zIndex': 10})
        main_slots.append({'x': center_x, 'y': collar_y - round(35 * sf), 'sz': round(145 * sf), 'rot': 0, 'zIndex': 10})
        main_slots.append({'x': center_x + round(72 * sf), 'y': collar_y - round(35 * sf), 'sz': round(140 * sf), 'rot': 8, 'zIndex': 10})
    elif n_main == 9:
        # Signature 1-2-3-3 Korean dome
        # Apex (1)
        main_slots.append({'x': center_x, 'y': collar_y - round(155 * sf), 'sz': round(130 * sf), 'rot': 0, 'zIndex': 4})
        # Tier 2 (2)
        main_slots.append({'x': center_x - round(48 * sf), 'y': collar_y - round(115 * sf), 'sz': round(130 * sf), 'rot': -5, 'zIndex': 6})
        main_slots.append({'x': center_x + round(48 * sf), 'y': collar_y - round(115 * sf), 'sz': round(130 * sf), 'rot': 5, 'zIndex': 6})
        # Tier 3 (3)
        main_slots.append({'x': center_x - round(85 * sf), 'y': collar_y - round(75 * sf), 'sz': round(135 * sf), 'rot': -8, 'zIndex': 8})
        main_slots.append({'x': center_x, 'y': collar_y - round(75 * sf), 'sz': round(140 * sf), 'rot': 0, 'zIndex': 8})
        main_slots.append({'x': center_x + round(85 * sf), 'y': collar_y - round(75 * sf), 'sz': round(135 * sf), 'rot': 8, 'zIndex': 8})
        # Tier 4 (3 collar)
        main_slots.append({'x': center_x - round(65 * sf), 'y': collar_y - round(30 * sf), 'sz': round(140 * sf), 'rot': -6, 'zIndex': 11})
        main_slots.append({'x': center_x, 'y': collar_y - round(28 * sf), 'sz': round(145 * sf), 'rot': 0, 'zIndex': 11})
        main_slots.append({'x': center_x + round(65 * sf), 'y': collar_y - round(30 * sf), 'sz': round(140 * sf), 'rot': 6, 'zIndex': 11})
    else:
        # Dynamic multi-tier staggered close-packing
        rows = 4 if n_main <= 14 else (5 if n_main <= 22 else 6)
        row_counts = []
        for r in range(rows):
            w = (r + 1.2) / (rows * 0.5 + 0.6 * rows)
            cnt = max(1, round((n_main * w) / rows))
            row_counts.append(cnt)
        diff = n_main - sum(row_counts)
        row_counts[-1] += diff
        top_y = collar_y - min(round(170 * sf), round((110 + n_main * 2.5) * sf))
        span_y = (collar_y - round(30 * sf)) - top_y
        for r_idx in range(rows):
            cnt = max(1, row_counts[r_idx])
            r_t = r_idx / (rows - 1) if rows > 1 else 0.5
            y_base = top_y + r_t * span_y
            row_hw = round(front_w * 0.28) * (0.60 + 0.40 * r_t)
            for c in range(cnt):
                c_t = c / (cnt - 1) if cnt > 1 else 0.5
                x_pos = center_x + (c_t - 0.5) * 2.0 * row_hw
                dome_lift = math.sin(c_t * math.pi) * round(14 * sf)
                y_pos = y_base - dome_lift
                rot = (c_t - 0.5) * 10
                sz = round(max(95, min(145, 160 - n_main * 2)) * sf)
                main_slots.append({'x': round(x_pos), 'y': round(y_pos), 'sz': sz, 'rot': rot, 'zIndex': 4 + r_idx * 2})

    for idx, f in enumerate(mains):
        slot = main_slots[idx % len(main_slots)]
        render_items.append({
            'img_path': f['imageUrl'].lstrip('/'),
            'x': slot['x'], 'y': slot['y'],
            'sz': slot['sz'], 'rot': slot['rot'],
            'zIndex': slot['zIndex']
        })

    # Sort all items by zIndex ascending so background items render first
    render_items.sort(key=lambda item: item['zIndex'])

    # Render flowers with natural drop shadows
    for item in render_items:
        full_path = os.path.join("public", item['img_path'])
        if not os.path.exists(full_path):
            print('Missing:', full_path)
            continue
        fl_img = Image.open(full_path).convert("RGBA")
        sz = item['sz']
        fl_img = fl_img.resize((sz, sz), Image.Resampling.LANCZOS)
        if item['rot'] != 0:
            fl_img = fl_img.rotate(-item['rot'], resample=Image.Resampling.BICUBIC, expand=True)

        # Soft natural shadow
        shadow = Image.new("RGBA", fl_img.size, (0, 0, 0, 0))
        alpha = fl_img.split()[3]
        s_color = Image.new("RGBA", fl_img.size, (15, 10, 5, 45))
        shadow.paste(s_color, (0, 0), mask=alpha)
        shadow = shadow.filter(ImageFilter.GaussianBlur(3))

        iw, ih = fl_img.size
        pos = (item['x'] - iw // 2, item['y'] - ih // 2)
        flower_canvas.alpha_composite(shadow, (pos[0], pos[1] + 3))
        flower_canvas.alpha_composite(fl_img, pos)

    # Cavity clip
    masked_flower = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    masked_flower.paste(flower_canvas, (0, 0), mask=mask_img)
    canvas.alpha_composite(masked_flower, (0, 0))

    # 4. Front wrapper
    front_img = Image.open("public/images/bucket/bucket-1_front.png").convert("RGBA")
    front_img = front_img.resize((front_w, front_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(front_img, (front_x, front_y))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path)
    print(f"Saved: {output_path}")

# Test 1: EXACT MATCH TO USER'S REFERENCE (5 Pink Chrysanthemums + 6 Purple Asters)
render_test_bouquet([
    {'name': 'Krisan Pink Pompon', 'imageUrl': '/images/flowers/chrysanthemum_pink.png', 'category': 'main'},
    {'name': 'Krisan Pink Pompon', 'imageUrl': '/images/flowers/chrysanthemum_pink.png', 'category': 'main'},
    {'name': 'Krisan Pink Pompon', 'imageUrl': '/images/flowers/chrysanthemum_pink.png', 'category': 'main'},
    {'name': 'Krisan Pink Pompon', 'imageUrl': '/images/flowers/chrysanthemum_pink.png', 'category': 'main'},
    {'name': 'Krisan Pink Pompon', 'imageUrl': '/images/flowers/chrysanthemum_pink.png', 'category': 'main'},
    {'name': 'Aster Ungu Peacock', 'imageUrl': '/images/flowers/aster_purple.png', 'category': 'filler'},
    {'name': 'Aster Ungu Peacock', 'imageUrl': '/images/flowers/aster_purple.png', 'category': 'filler'},
    {'name': 'Aster Ungu Peacock', 'imageUrl': '/images/flowers/aster_purple.png', 'category': 'filler'},
    {'name': 'Aster Ungu Peacock', 'imageUrl': '/images/flowers/aster_purple.png', 'category': 'filler'},
    {'name': 'Aster Ungu Peacock', 'imageUrl': '/images/flowers/aster_purple.png', 'category': 'filler'},
    {'name': 'Aster Ungu Peacock', 'imageUrl': '/images/flowers/aster_purple.png', 'category': 'filler'},
], "scripts/preview_krisan_aster_reference.png")

# Test 2: 9 Red Roses (The User's core test case)
render_test_bouquet([
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
], "scripts/preview_9_roses_neat.png")

# Test 3: Mixed Luxury Bouquet (7 Roses + 4 Baby's Breath + 2 Eucalyptus)
render_test_bouquet([
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': "Baby's Breath", 'imageUrl': '/images/flowers/babysbreath_white.png', 'category': 'filler'},
    {'name': "Baby's Breath", 'imageUrl': '/images/flowers/babysbreath_white.png', 'category': 'filler'},
    {'name': "Baby's Breath", 'imageUrl': '/images/flowers/babysbreath_white.png', 'category': 'filler'},
    {'name': "Baby's Breath", 'imageUrl': '/images/flowers/babysbreath_white.png', 'category': 'filler'},
    {'name': 'Eucalyptus', 'imageUrl': '/images/flowers/eucalyptus.png', 'category': 'greenery'},
    {'name': 'Eucalyptus', 'imageUrl': '/images/flowers/eucalyptus.png', 'category': 'greenery'},
], "scripts/preview_luxury_mix.png")
