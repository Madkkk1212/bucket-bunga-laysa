import urllib.request
import json
import time
import urllib.parse

categories = [
    ('rose_pink', 'Category:Close-up photographs of pink roses'),
    ('rose_white', 'Category:Close-up photographs of white roses'),
    ('sunflower', 'Category:Close-up photographs of Helianthus annuus'),
    ('hydrangea_blue', 'Category:Close-up photographs of blue Hydrangea'),
    ('tulip_red', 'Category:Close-up photographs of red Tulipa'),
    ('babysbreath_white', 'Category:Gypsophila paniculata'),
    ('chrysanthemum_pink', 'Category:Pink Chrysanthemum cultivars'),
    ('eucalyptus', 'Category:Eucalyptus leaves'),
]

for name, cat in categories:
    url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=categorymembers&gcmtitle={urllib.parse.quote(cat)}&gcmnamespace=6&gcmlimit=5&prop=imageinfo&iiprop=url|mime"
    req = urllib.request.Request(url, headers={'User-Agent': 'FlowerApp/1.0 (contact: student@edu.com)'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                if 'imageinfo' in p and p['imageinfo'][0]['mime'].startswith('image/'):
                    print(f"{name}: {p['title']} -> {p['imageinfo'][0]['url']}")
                    break
    except Exception as e:
        print(f"Error for {cat}: {e}")
    time.sleep(1.2)
