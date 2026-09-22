import os, math
from PIL import Image, ImageDraw, ImageFilter

def render_calibrated_bouquet(flower_list, bucket_id, output_path):
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
    back_path = f"public/images/bucket/{bucket_id}_back.png"
    back_img = Image.open(back_path).convert("RGBA")
    back_img = back_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(back_img, (bucket_x, bucket_y))

    # 2. Generous Cavity Mask matching outer origami wings
    mask_img = Image.new("L", (canvas_w, canvas_h), 0)
    draw_mask = ImageDraw.Draw(mask_img)
    cavity_poly = [
        (center_x, bucket_y + round(15 * scale)),
        (bucket_x + round(target_w * 0.95), bucket_y + round(target_h * 0.12)),
        (bucket_x + round(target_w * 0.92), bucket_y + round(target_h * 0.45)),
        (front_x + front_w, collar_y + round(80 * scale)),
        (center_x, collar_y + round(120 * scale)),
        (front_x, collar_y + round(80 * scale)),
        (bucket_x + round(target_w * 0.08), bucket_y + round(target_h * 0.45)),
        (bucket_x + round(target_w * 0.05), bucket_y + round(target_h * 0.12)),
    ]
    draw_mask.polygon(cavity_poly, fill=255)

    flower_canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))

    mains = [f for f in flower_list if f.get('category', 'main') == 'main']
    fillers = [f for f in flower_list if f.get('category') == 'filler']
    greens = [f for f in flower_list if f.get('category') == 'greenery']

    render_items = []

    # ─── GREENERY (Framing Foliage) ───
    green_anchors = [
        {'x': center_x - round(115 * sf), 'y': collar_y - round(145 * sf), 'rot': -20, 'sz': round(125 * sf), 'zIndex': 1},
        {'x': center_x + round(115 * sf), 'y': collar_y - round(145 * sf), 'rot': 20, 'sz': round(125 * sf), 'zIndex': 1},
        {'x': center_x - round(125 * sf), 'y': collar_y - round(85 * sf), 'rot': -28, 'sz': round(120 * sf), 'zIndex': 2},
        {'x': center_x + round(125 * sf), 'y': collar_y - round(85 * sf), 'rot': 28, 'sz': round(120 * sf), 'zIndex': 2},
    ]
    for idx, g in enumerate(greens):
        anc = green_anchors[idx % len(green_anchors)]
        render_items.append({
            'img_path': g['imageUrl'].lstrip('/'),
            'x': anc['x'], 'y': anc['y'],
            'sz': anc['sz'], 'rot': anc['rot'],
            'zIndex': anc['zIndex']
        })

    # ─── FILLERS (Background Clouds & Crevices) ───
    filler_anchors = [
        # Top crown arch
        {'x': center_x, 'y': collar_y - round(165 * sf), 'rot': 0, 'sz': round(135 * sf), 'zIndex': 2},
        {'x': center_x - round(65 * sf), 'y': collar_y - round(150 * sf), 'rot': -10, 'sz': round(130 * sf), 'zIndex': 2},
        {'x': center_x + round(65 * sf), 'y': collar_y - round(150 * sf), 'rot': 10, 'sz': round(130 * sf), 'zIndex': 2},
        # Upper-mid backing
        {'x': center_x - round(40 * sf), 'y': collar_y - round(115 * sf), 'rot': -5, 'sz': round(125 * sf), 'zIndex': 3},
        {'x': center_x + round(40 * sf), 'y': collar_y - round(115 * sf), 'rot': 5, 'sz': round(125 * sf), 'zIndex': 3},
        # Outer wings
        {'x': center_x - round(110 * sf), 'y': collar_y - round(105 * sf), 'rot': -18, 'sz': round(120 * sf), 'zIndex': 3},
        {'x': center_x + round(110 * sf), 'y': collar_y - round(105 * sf), 'rot': 18, 'sz': round(120 * sf), 'zIndex': 3},
        # Flanks
        {'x': center_x - round(95 * sf), 'y': collar_y - round(55 * sf), 'rot': -12, 'sz': round(115 * sf), 'zIndex': 4},
        {'x': center_x + round(95 * sf), 'y': collar_y - round(55 * sf), 'rot': 12, 'sz': round(115 * sf), 'zIndex': 4},
    ]
    for idx, fl in enumerate(fillers):
        anc = filler_anchors[idx % len(filler_anchors)]
        render_items.append({
            'img_path': fl['imageUrl'].lstrip('/'),
            'x': anc['x'], 'y': anc['y'],
            'sz': anc['sz'], 'rot': anc['rot'],
            'zIndex': anc['zIndex']
        })

    # ─── MAIN BLOOMS (Calibrated Florist Tiers, Anti-Clumping) ───
    n_main = len(mains)
    main_slots = []
    if n_main == 1:
        main_slots.append({'x': center_x, 'y': collar_y - round(75 * sf), 'sz': round(105 * sf), 'rot': 0, 'zIndex': 10})
    elif n_main == 2:
        main_slots.append({'x': center_x - round(36 * sf), 'y': collar_y - round(65 * sf), 'sz': round(100 * sf), 'rot': -4, 'zIndex': 10})
        main_slots.append({'x': center_x + round(36 * sf), 'y': collar_y - round(65 * sf), 'sz': round(100 * sf), 'rot': 4, 'zIndex': 10})
    elif n_main == 3:
        main_slots.append({'x': center_x, 'y': collar_y - round(105 * sf), 'sz': round(96 * sf), 'rot': 0, 'zIndex': 6})
        main_slots.append({'x': center_x - round(42 * sf), 'y': collar_y - round(55 * sf), 'sz': round(100 * sf), 'rot': -6, 'zIndex': 10})
        main_slots.append({'x': center_x + round(42 * sf), 'y': collar_y - round(55 * sf), 'sz': round(100 * sf), 'rot': 6, 'zIndex': 10})
    elif n_main == 4:
        main_slots.append({'x': center_x - round(32 * sf), 'y': collar_y - round(100 * sf), 'sz': round(92 * sf), 'rot': -5, 'zIndex': 6})
        main_slots.append({'x': center_x + round(32 * sf), 'y': collar_y - round(100 * sf), 'sz': round(92 * sf), 'rot': 5, 'zIndex': 6})
        main_slots.append({'x': center_x - round(44 * sf), 'y': collar_y - round(50 * sf), 'sz': round(96 * sf), 'rot': -6, 'zIndex': 10})
        main_slots.append({'x': center_x + round(44 * sf), 'y': collar_y - round(50 * sf), 'sz': round(96 * sf), 'rot': 6, 'zIndex': 10})
    elif n_main == 5:
        # Exact Korean reference layout: 3 top, 2 collar
        main_slots.append({'x': center_x - round(52 * sf), 'y': collar_y - round(88 * sf), 'sz': round(90 * sf), 'rot': -7, 'zIndex': 6})
        main_slots.append({'x': center_x, 'y': collar_y - round(95 * sf), 'sz': round(94 * sf), 'rot': 0, 'zIndex': 6})
        main_slots.append({'x': center_x + round(52 * sf), 'y': collar_y - round(88 * sf), 'sz': round(90 * sf), 'rot': 7, 'zIndex': 6})
        main_slots.append({'x': center_x - round(30 * sf), 'y': collar_y - round(45 * sf), 'sz': round(95 * sf), 'rot': -4, 'zIndex': 10})
        main_slots.append({'x': center_x + round(30 * sf), 'y': collar_y - round(45 * sf), 'sz': round(95 * sf), 'rot': 4, 'zIndex': 10})
    elif n_main == 6:
        # 1 apex, 2 mid, 3 collar
        main_slots.append({'x': center_x, 'y': collar_y - round(125 * sf), 'sz': round(88 * sf), 'rot': 0, 'zIndex': 5})
        main_slots.append({'x': center_x - round(42 * sf), 'y': collar_y - round(85 * sf), 'sz': round(88 * sf), 'rot': -5, 'zIndex': 7})
        main_slots.append({'x': center_x + round(42 * sf), 'y': collar_y - round(85 * sf), 'sz': round(88 * sf), 'rot': 5, 'zIndex': 7})
        main_slots.append({'x': center_x - round(52 * sf), 'y': collar_y - round(45 * sf), 'sz': round(90 * sf), 'rot': -7, 'zIndex': 10})
        main_slots.append({'x': center_x, 'y': collar_y - round(42 * sf), 'sz': round(92 * sf), 'rot': 0, 'zIndex': 10})
        main_slots.append({'x': center_x + round(52 * sf), 'y': collar_y - round(45 * sf), 'sz': round(90 * sf), 'rot': 7, 'zIndex': 10})
    elif n_main == 7:
        # 1 apex, 3 mid, 3 collar (Clean 3-tier dome)
        main_slots.append({'x': center_x, 'y': collar_y - round(135 * sf), 'sz': round(86 * sf), 'rot': 0, 'zIndex': 5})
        main_slots.append({'x': center_x - round(48 * sf), 'y': collar_y - round(90 * sf), 'sz': round(86 * sf), 'rot': -6, 'zIndex': 7})
        main_slots.append({'x': center_x, 'y': collar_y - round(92 * sf), 'sz': round(88 * sf), 'rot': 0, 'zIndex': 7})
        main_slots.append({'x': center_x + round(48 * sf), 'y': collar_y - round(90 * sf), 'sz': round(86 * sf), 'rot': 6, 'zIndex': 7})
        main_slots.append({'x': center_x - round(55 * sf), 'y': collar_y - round(45 * sf), 'sz': round(90 * sf), 'rot': -7, 'zIndex': 10})
        main_slots.append({'x': center_x, 'y': collar_y - round(42 * sf), 'sz': round(92 * sf), 'rot': 0, 'zIndex': 10})
        main_slots.append({'x': center_x + round(55 * sf), 'y': collar_y - round(45 * sf), 'sz': round(90 * sf), 'rot': 7, 'zIndex': 10})
    elif n_main == 8:
        # 2 top, 3 mid, 3 collar
        main_slots.append({'x': center_x - round(32 * sf), 'y': collar_y - round(135 * sf), 'sz': round(84 * sf), 'rot': -5, 'zIndex': 5})
        main_slots.append({'x': center_x + round(32 * sf), 'y': collar_y - round(135 * sf), 'sz': round(84 * sf), 'rot': 5, 'zIndex': 5})
        main_slots.append({'x': center_x - round(52 * sf), 'y': collar_y - round(90 * sf), 'sz': round(85 * sf), 'rot': -6, 'zIndex': 7})
        main_slots.append({'x': center_x, 'y': collar_y - round(90 * sf), 'sz': round(88 * sf), 'rot': 0, 'zIndex': 7})
        main_slots.append({'x': center_x + round(52 * sf), 'y': collar_y - round(90 * sf), 'sz': round(85 * sf), 'rot': 6, 'zIndex': 7})
        main_slots.append({'x': center_x - round(52 * sf), 'y': collar_y - round(45 * sf), 'sz': round(88 * sf), 'rot': -7, 'zIndex': 10})
        main_slots.append({'x': center_x, 'y': collar_y - round(42 * sf), 'sz': round(90 * sf), 'rot': 0, 'zIndex': 10})
        main_slots.append({'x': center_x + round(52 * sf), 'y': collar_y - round(45 * sf), 'sz': round(88 * sf), 'rot': 7, 'zIndex': 10})
    elif n_main == 9:
        # 1 - 2 - 3 - 3 Master Korean dome
        main_slots.append({'x': center_x, 'y': collar_y - round(150 * sf), 'sz': round(82 * sf), 'rot': 0, 'zIndex': 5})
        main_slots.append({'x': center_x - round(36 * sf), 'y': collar_y - round(115 * sf), 'sz': round(82 * sf), 'rot': -5, 'zIndex': 7})
        main_slots.append({'x': center_x + round(36 * sf), 'y': collar_y - round(115 * sf), 'sz': round(82 * sf), 'rot': 5, 'zIndex': 7})
        main_slots.append({'x': center_x - round(54 * sf), 'y': collar_y - round(80 * sf), 'sz': round(84 * sf), 'rot': -6, 'zIndex': 8})
        main_slots.append({'x': center_x, 'y': collar_y - round(80 * sf), 'sz': round(86 * sf), 'rot': 0, 'zIndex': 8})
        main_slots.append({'x': center_x + round(54 * sf), 'y': collar_y - round(80 * sf), 'sz': round(84 * sf), 'rot': 6, 'zIndex': 8})
        main_slots.append({'x': center_x - round(54 * sf), 'y': collar_y - round(42 * sf), 'sz': round(86 * sf), 'rot': -6, 'zIndex': 10})
        main_slots.append({'x': center_x, 'y': collar_y - round(40 * sf), 'sz': round(88 * sf), 'rot': 0, 'zIndex': 10})
        main_slots.append({'x': center_x + round(54 * sf), 'y': collar_y - round(42 * sf), 'sz': round(86 * sf), 'rot': 6, 'zIndex': 10})
    else:
        # Dynamic symmetric honeycomb multi-tier packing (max 3-4 flowers per row!)
        rows = 4 if n_main <= 13 else (5 if n_main <= 18 else 6)
        # Distribute items per row: apex has few, mid has most, collar has 3
        # e.g., for 10: [1, 3, 3, 3], for 11: [2, 3, 3, 3], for 12: [2, 3, 4, 3]
        base_counts = [max(1, round(n_main / rows)) for _ in range(rows)]
        # Adjust so top row is smaller and collar row is 3
        rem = n_main - sum(base_counts)
        r_target = 1
        while rem > 0:
            base_counts[r_target] += 1
            rem -= 1
            r_target = (r_target + 1) % (rows - 1)
        while rem < 0:
            base_counts[0] = max(1, base_counts[0] - 1)
            rem += 1

        top_y = collar_y - min(round(160 * sf), round((105 + n_main * 2.2) * sf))
        span_y = (collar_y - round(38 * sf)) - top_y
        row_hw_max = round(front_w * 0.22)

        for r_idx in range(rows):
            cnt = base_counts[r_idx]
            r_t = r_idx / (rows - 1) if rows > 1 else 0.5
            y_base = top_y + r_t * span_y
            row_hw = row_hw_max * (0.60 + 0.40 * r_t)

            for c in range(cnt):
                c_t = c / (cnt - 1) if cnt > 1 else 0.5
                x_pos = center_x + (c_t - 0.5) * 2.0 * row_hw
                dome_lift = math.sin(c_t * math.pi) * round(10 * sf)
                y_pos = y_base - dome_lift
                rot = (c_t - 0.5) * 0.15
                sz = round(max(58, min(84, 98 - n_main * 1.5)) * sf)
                main_slots.append({
                    'x': round(x_pos),
                    'y': round(y_pos),
                    'sz': sz,
                    'rot': rot,
                    'zIndex': 5 + r_idx * 2,
                })

    for idx, f in enumerate(mains):
        slot = main_slots[idx % len(main_slots)]
        render_items.append({
            'img_path': f['imageUrl'].lstrip('/'),
            'x': slot['x'], 'y': slot['y'],
            'sz': slot['sz'], 'rot': slot['rot'],
            'zIndex': slot['zIndex']
        })

    render_items.sort(key=lambda item: item['zIndex'])

    # Render each item
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
    front_path = f"public/images/bucket/{bucket_id}_front.png"
    front_img = Image.open(front_path).convert("RGBA")
    front_img = front_img.resize((front_w, front_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(front_img, (front_x, front_y))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path)
    print(f"Saved: {output_path}")

# Test the user's exact combination on bucket-2!
render_calibrated_bouquet([
    {'name': 'Mawar Pink', 'imageUrl': '/images/flowers/rose_pink.png', 'category': 'main'},
    {'name': 'Mawar Merah', 'imageUrl': '/images/flowers/rose_red.png', 'category': 'main'},
    {'name': 'Bunga Matahari', 'imageUrl': '/images/flowers/sunflower.png', 'category': 'main'},
    {'name': 'Gerbera Merah', 'imageUrl': '/images/flowers/gerbera_red.png', 'category': 'main'},
    {'name': 'Hydrangea Biru', 'imageUrl': '/images/flowers/hydrangea_blue.png', 'category': 'main'},
    {'name': 'Krisan Pink Pompon', 'imageUrl': '/images/flowers/chrysanthemum_pink.png', 'category': 'main'},
    {'name': 'Krisan Pink Pompon', 'imageUrl': '/images/flowers/chrysanthemum_pink.png', 'category': 'main'},
    {'name': 'Aster Ungu Peacock', 'imageUrl': '/images/flowers/aster_purple.png', 'category': 'filler'},
], 'bucket-2', 'scripts/preview_user_combo_calibrated.png')
