import os
from PIL import Image
from rembg import remove, new_session
import numpy as np

session = new_session('u2netp')
artifact_dir = r'C:\Users\Lenovo\.gemini\antigravity-ide\brain\d71a05d9-8580-43a9-b368-91d16aa94943'

# Test extracting bloom head from rose_red_1789909887891.jpg
im = Image.open(os.path.join(artifact_dir, 'rose_red_1789909887891.jpg')).convert('RGB')
# The bloom head is in y: 80 to 400, x: 300 to 720
head = im.crop((300, 80, 720, 400))
out = remove(head, session=session)

# Clean alpha: remove any residual bottom stem
arr = np.array(out)
h, w, _ = arr.shape
# anything below row h - 25 that is narrow stem can be feathered
out_cleaned = Image.fromarray(arr)

out_cleaned.save('scratch/pure_rose_red_head.png')
print('Saved pure_rose_red_head.png:', out_cleaned.size)
