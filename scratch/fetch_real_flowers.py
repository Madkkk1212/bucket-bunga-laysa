import os
import io
import json
import urllib.request
import urllib.parse
from PIL import Image
from rembg import remove, new_session

session = new_session('u2netp')

def search_image(query):
    url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch={urllib.parse.quote(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime|width|height'
    req = urllib.request.Request(url, headers={'User-Agent': 'FlowerApp/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            pages = data.get('query', {}).get('pages', {})
            images = []
            for pid, p in pages.items():
                if 'imageinfo' in p and len(p['imageinfo']) > 0:
                    info = p['imageinfo'][0]
                    mime = info.get('mime', '')
                    if mime.startswith('image/') and not mime.endswith('svg') and not mime.endswith('pdf'):
                        images.append((p.get('title'), info.get('url'), info.get('width', 0), info.get('height', 0)))
            return images
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return []

flower_queries = {
    'rose_red': 'Red Rose in Bloom jpg',
    'rose_pink': 'Pink Rose in Bloom macro flower jpg',
    'rose_white': 'White Rose Bloom macro flower jpg',
    'rose_peach': 'Peach Rose in Bloom macro flower jpg',
    'sunflower': 'Sunflower Bloom macro flower front jpg',
    'tulip_red': 'Red Tulip flower bloom isolated or macro jpg',
    'tulip_purple': 'Purple Tulip flower bloom macro jpg',
    'hydrangea_blue': 'Blue Hydrangea flower head bloom jpg',
    'chrysanthemum_pink': 'Pink Chrysanthemum bloom macro flower jpg',
    'chrysanthemum_white': 'White Chrysanthemum bloom macro flower jpg',
    'babysbreath_white': 'Gypsophila paniculata flower cluster jpg',
    'aster_purple': 'Purple Aster Peacock flower cluster bloom jpg',
    'eucalyptus': 'Eucalyptus foliage leaves silver dollar branch jpg',
}

for name, q in flower_queries.items():
    print(f"Searching {name} with query: {q}...")
    imgs = search_image(q)
    print(f"Found {len(imgs)} results for {name}")
    if imgs:
        print(f"  Top result: {imgs[0][0]} -> {imgs[0][1]}")
