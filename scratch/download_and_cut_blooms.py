import os
import json
import urllib.request
import io
from PIL import Image, ImageEnhance
from rembg import remove, new_session

with open('scratch/found_urls.json', 'r') as f:
    urls = json.load(f)

session = new_session('u2netp')
out_dir = 'public/images/flowers'
os.makedirs(out_dir, exist_ok=True)

headers = {'User-Agent': 'FlowerApp/1.0 (contact: student@edu.com)'}

for name, url in urls.items():
    print(f"Downloading and processing {name}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            im = Image.open(io.BytesIO(data)).convert('RGB')
            
            # Resize large images to max 1200 for fast high-quality rembg
            im.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            
            # Remove background to get transparent flower bloom
            cutout = remove(im, session=session)
            
            # Find non-empty bounding box
            alpha = cutout.split()[-1]
            bbox = alpha.getbbox()
            if bbox:
                # Add 2% padding
                w, h = cutout.size
                pad = 10
                bx0 = max(0, bbox[0] - pad)
                by0 = max(0, bbox[1] - pad)
                bx1 = min(w, bbox[2] + pad)
                by1 = min(h, bbox[3] + pad)
                tight = cutout.crop((bx0, by0, bx1, by1))
            else:
                tight = cutout
                
            # Place centered on square transparent canvas (512 x 512)
            tw, th = tight.size
            dim = max(tw, th)
            sq = Image.new('RGBA', (dim, dim), (0, 0, 0, 0))
            sq.paste(tight, ((dim - tw) // 2, (dim - th) // 2))
            
            # Resize to standardized 512x512
            final_img = sq.resize((512, 512), Image.Resampling.LANCZOS)
            
            # Polish vibrance and clarity
            enh_col = ImageEnhance.Color(final_img)
            final_img = enh_col.enhance(1.08)
            enh_con = ImageEnhance.Contrast(final_img)
            final_img = enh_con.enhance(1.05)
            
            target_path = os.path.join(out_dir, f"{name}.png")
            final_img.save(target_path)
            print(f"  --> Saved {target_path} (512x512 PNG)")
    except Exception as e:
        print(f"  Error processing {name}: {e}")

print("Batch processing complete!")
