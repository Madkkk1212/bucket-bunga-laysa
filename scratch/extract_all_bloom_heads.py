import os
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

# Folder paths
flowers_dir = 'public/images/flowers'
os.makedirs('scratch/blooms', exist_ok=True)

# For each flower, let's find the bloom head and crop it tightly
def extract_bloom(img_path, bloom_ratio=0.45):
    im = Image.open(img_path).convert('RGBA')
    w, h = im.size
    
    # Analyze alpha channel
    arr = np.array(im)
    alpha = arr[:, :, 3]
    
    # We want the top portion that contains the bloom head
    cutoff_y = int(h * bloom_ratio)
    alpha_head = alpha[:cutoff_y, :]
    
    rows = np.where(alpha_head > 30)[0]
    cols = np.where(alpha_head > 30)[1]
    
    if len(rows) == 0 or len(cols) == 0:
        return im
        
    y_min, y_max = rows.min(), rows.max()
    x_min, x_max = cols.min(), cols.max()
    
    # Add a slight padding
    pad = 10
    x0 = max(0, x_min - pad)
    y0 = max(0, y_min - pad)
    x1 = min(w, x_max + pad)
    y1 = min(h, y_max + pad)
    
    cropped = im.crop((x0, y0, x1, y1))
    
    # Make it a square canvas with bloom centered
    cw, ch = cropped.size
    size = max(cw, ch) + 20
    sq = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sq.paste(cropped, ((size - cw) // 2, (size - ch) // 2))
    
    # Enhance realistic depth: slight contrast & saturation boost
    enh_col = ImageEnhance.Color(sq)
    sq = enh_col.enhance(1.10)
    enh_con = ImageEnhance.Contrast(sq)
    sq = enh_con.enhance(1.08)
    
    return sq.resize((512, 512), Image.Resampling.LANCZOS)

# Test on key flowers
test_list = ['rose_red.png', 'rose_pink.png', 'rose_white.png', 'rose_peach.png', 'sunflower.png', 'tulip_red.png', 'hydrangea_blue.png']
for f in test_list:
    p = os.path.join(flowers_dir, f)
    if os.path.exists(p):
        out = extract_bloom(p, bloom_ratio=0.42)
        out_p = f'scratch/blooms/{f}'
        out.save(out_p)
        print(f"Extracted clean bloom: {f} -> {out.size}")
