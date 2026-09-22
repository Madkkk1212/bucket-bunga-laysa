import os
from PIL import Image, ImageEnhance
from rembg import remove, new_session
import numpy as np

session = new_session('u2netp')
artifact_dir = r'C:\Users\Lenovo\.gemini\antigravity-ide\brain\d71a05d9-8580-43a9-b368-91d16aa94943'
out_dir = 'public/images/flowers'
os.makedirs(out_dir, exist_ok=True)

# Helper to crop, remove bg, center on 512x512, and enhance
def process_bloom_head(src_path, crop_box, out_name, enhance_color=1.12, enhance_contrast=1.08):
    im = Image.open(src_path).convert('RGB')
    cropped = im.crop(crop_box)
    
    # Remove background with rembg
    cutout = remove(cropped, session=session)
    
    # Get bounding box of alpha
    bbox = cutout.split()[-1].getbbox()
    if bbox:
        pad = 6
        bx0 = max(0, bbox[0] - pad)
        by0 = max(0, bbox[1] - pad)
        bx1 = min(cutout.width, bbox[2] + pad)
        by1 = min(cutout.height, bbox[3] + pad)
        tight = cutout.crop((bx0, by0, bx1, by1))
    else:
        tight = cutout
        
    tw, th = tight.size
    dim = max(tw, th) + 12
    sq = Image.new('RGBA', (dim, dim), (0, 0, 0, 0))
    sq.paste(tight, ((dim - tw) // 2, (dim - th) // 2))
    
    final_img = sq.resize((512, 512), Image.Resampling.LANCZOS)
    
    # Photorealistic color grading
    enh_col = ImageEnhance.Color(final_img)
    final_img = enh_col.enhance(enhance_color)
    enh_con = ImageEnhance.Contrast(final_img)
    final_img = enh_con.enhance(enhance_contrast)
    
    out_path = os.path.join(out_dir, out_name)
    final_img.save(out_path)
    print(f"Saved {out_name} -> {out_path}")
    return final_img

# 1. Red Rose Bloom Head: Use the real macro photo from wiki_rose_transparent.png!
real_rose = Image.open('scratch/wiki_rose_transparent.png').convert('RGBA')
tw, th = real_rose.size
dim = max(tw, th) + 10
sq = Image.new('RGBA', (dim, dim), (0, 0, 0, 0))
sq.paste(real_rose, ((dim - tw) // 2, (dim - th) // 2))
rose_red_512 = sq.resize((512, 512), Image.Resampling.LANCZOS)
rose_red_512.save(os.path.join(out_dir, 'rose_red.png'))
print("Saved real rose_red.png")

# 2. Pink Rose Bloom Head
real_pink_rose = Image.open('scratch/wiki_pink_transparent.png') if os.path.exists('scratch/wiki_pink_transparent.png') else None
process_bloom_head(
    os.path.join(artifact_dir, 'rose_pink_1789909926791.jpg'),
    (320, 80, 710, 420),
    'rose_pink.png',
    enhance_color=1.15
)

# 3. White Rose Bloom Head
process_bloom_head(
    os.path.join(artifact_dir, 'rose_white_1789909938810.jpg'),
    (310, 80, 720, 420),
    'rose_white.png',
    enhance_color=1.05,
    enhance_contrast=1.10
)

# 4. Peach Rose Bloom Head
process_bloom_head(
    os.path.join(artifact_dir, 'rose_peach_1789910015733.jpg'),
    (320, 80, 710, 420),
    'rose_peach.png',
    enhance_color=1.18
)

# 5. Yellow Rose Bloom Head
process_bloom_head(
    os.path.join(artifact_dir, 'rose_yellow_1789910027186.jpg'),
    (310, 80, 720, 420),
    'rose_yellow.png',
    enhance_color=1.15
)

# 6. Sunflower Bloom Head (Pristine Golden Circle)
process_bloom_head(
    os.path.join(artifact_dir, 'sunflower_1789909967302.jpg'),
    (240, 40, 780, 480),
    'sunflower.png',
    enhance_color=1.12
)

# 7. Blue Hydrangea Head (Lush Mophead Cluster)
process_bloom_head(
    os.path.join(artifact_dir, 'hydrangea_blue_1789910214637.jpg'),
    (240, 60, 780, 520),
    'hydrangea_blue.png',
    enhance_color=1.15
)

# 8. White Lily Bloom Head
process_bloom_head(
    os.path.join(artifact_dir, 'lily_white_1789910202217.jpg'),
    (260, 80, 760, 540),
    'lily_white.png',
    enhance_color=1.10
)

# 9. Red Tulip Bloom Head
process_bloom_head(
    os.path.join(artifact_dir, 'tulip_red_1789909953044.jpg'),
    (320, 50, 700, 360),
    'tulip_red.png',
    enhance_color=1.15
)

# 10. Purple Tulip Bloom Head
process_bloom_head(
    os.path.join(artifact_dir, 'tulip_purple_1789910063029.jpg'),
    (320, 50, 700, 360),
    'tulip_purple.png',
    enhance_color=1.15
)

# 11. Pink Tulip Bloom Head
process_bloom_head(
    os.path.join(artifact_dir, 'tulip_pink_1789910052155.jpg'),
    (320, 50, 700, 360),
    'tulip_pink.png',
    enhance_color=1.15
)

# 12. Pink Pompon Chrysanthemum (from reference photo color & form)
grid_im = Image.open(os.path.join(artifact_dir, 'flowers_grid_reference_1789909866770.jpg')).convert('RGB')
gw, gh = grid_im.size
cw = gw / 10.0
rh = gh / 3.0

# In grid: Row 2, Col 9 is white chrysanthemum, Col 10 is yellow chrysanthemum
# Let's crop Col 9 (x: 8.0 * cw to 9.0 * cw, y: 1.0 * rh to 1.65 * rh)
chrys_crop = grid_im.crop((int(8.05 * cw), int(1.02 * rh), int(8.95 * cw), int(1.58 * rh)))
chrys_cutout = remove(chrys_crop, session=session)
# Make Pink Chrysanthemum Pompon
chrys_arr = np.array(chrys_cutout)
# Tint to match vibrant pink pompon
r = chrys_arr[:, :, 0].astype(float)
g = chrys_arr[:, :, 1].astype(float)
b = chrys_arr[:, :, 2].astype(float)
a = chrys_arr[:, :, 3]
mask_fl = a > 20

pink_r = np.clip(r * 1.15 + 30, 0, 255)
pink_g = np.clip(g * 0.75 - 10, 0, 255)
pink_b = np.clip(b * 0.95 + 20, 0, 255)

chrys_pink_arr = np.stack([
    np.where(mask_fl, pink_r, r).astype(np.uint8),
    np.where(mask_fl, pink_g, g).astype(np.uint8),
    np.where(mask_fl, pink_b, b).astype(np.uint8),
    a
], axis=-1)

chrys_pink = Image.fromarray(chrys_pink_arr)
chrys_pink_512 = chrys_pink.resize((512, 512), Image.Resampling.LANCZOS)
chrys_pink_512.save(os.path.join(out_dir, 'chrysanthemum_pink.png'))
print("Saved chrysanthemum_pink.png (Pompon)")

# White Chrysanthemum Pompon
chrys_white_512 = chrys_cutout.resize((512, 512), Image.Resampling.LANCZOS)
chrys_white_512.save(os.path.join(out_dir, 'chrysanthemum_white.png'))
print("Saved chrysanthemum_white.png")

# 13. Baby's Breath Spray (Grid Row 3, Col 7)
bb_crop = grid_im.crop((int(6.5 * cw), int(2.05 * rh), int(7.5 * cw), int(2.70 * rh)))
bb_cut = remove(bb_crop, session=session)
bb_512 = bb_cut.resize((512, 512), Image.Resampling.LANCZOS)
bb_512.save(os.path.join(out_dir, 'babysbreath_white.png'))
print("Saved babysbreath_white.png")

# 14. Aster Peacock Purple Spray (Grid Row 3, Col 1 & 2 - Lavender / Aster spray)
# Let's crop Aster / Peacock spray
aster_crop = grid_im.crop((int(0.1 * cw), int(2.02 * rh), int(1.0 * cw), int(2.70 * rh)))
aster_cut = remove(aster_crop, session=session)
aster_512 = aster_cut.resize((512, 512), Image.Resampling.LANCZOS)
aster_512.save(os.path.join(out_dir, 'aster_purple.png'))
print("Saved aster_purple.png")

# 15. Eucalyptus Foliage
# Create lush Silver Dollar Eucalyptus branch
euc_arr = np.zeros((512, 512, 4), dtype=np.uint8)
# We can use the foliage leaves from the grid (Row 3, Col 9/10 green leaves)
leaf_crop = grid_im.crop((int(9.0 * cw), int(2.35 * rh), int(9.8 * cw), int(2.95 * rh)))
leaf_cut = remove(leaf_crop, session=session)
euc_512 = leaf_cut.resize((512, 512), Image.Resampling.LANCZOS)
# Tint to blue-green silver dollar eucalyptus
la = np.array(euc_512)
lr = la[:,:,0].astype(float) * 0.75
lg = la[:,:,1].astype(float) * 0.95
lb = la[:,:,2].astype(float) * 0.90
la[:,:,0] = np.clip(lr, 0, 255).astype(np.uint8)
la[:,:,1] = np.clip(lg, 0, 255).astype(np.uint8)
la[:,:,2] = np.clip(lb, 0, 255).astype(np.uint8)
euc_final = Image.fromarray(la)
euc_final.save(os.path.join(out_dir, 'eucalyptus.png'))
print("Saved eucalyptus.png")

# 16. Ruscus Greenery
ruscus_512 = leaf_cut.resize((512, 512), Image.Resampling.LANCZOS)
ruscus_512.save(os.path.join(out_dir, 'ruscus.png'))
print("Saved ruscus.png")

print("All bloom heads processed and saved to public/images/flowers!")
