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

back_img = Image.open('public/images/bucket/bucket-1_back.png').convert('RGBA')
back_resized = back_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

front_img = Image.open('public/images/bucket/bucket-1_front.png').convert('RGBA')
front_w = int(round(1359 * scale))
front_h = int(round(904 * scale))
front_resized = front_img.resize((front_w, front_h), Image.Resampling.LANCZOS)
front_x = bucket_x + int(round(401 * scale))
front_y = bucket_y + int(round(1050 * scale))

print(f"Canvas: {canvas_w}x{canvas_h}, bucket: ({bucket_x}, {bucket_y}, {target_w}, {target_h})")
print(f"Collar Y: {collar_y}, Front: ({front_x}, {front_y}, {front_w}, {front_h})")
