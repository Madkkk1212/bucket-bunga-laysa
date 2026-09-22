import urllib.request
import urllib.parse
import json

candidate_files = [
    ('rose_red', 'Red_Rose_in_Bloom.jpg'),
    ('rose_pink', 'Pink_rose.jpg'),
    ('rose_white', 'White_rose.jpg'),
    ('rose_peach', 'Yellow_rose.jpg'),
    ('sunflower', 'Tournesol.jpg'),
    ('hydrangea_blue', 'Blue_Hydrangea.jpg'),
    ('tulip_red', 'Red_Tulip.jpg'),
    ('tulip_purple', 'Purple_tulip.jpg'),
    ('chrysanthemum_pink', 'Pink_Chrysanthemum.jpg'),
    ('chrysanthemum_white', 'White_Chrysanthemum.jpg'),
    ('babysbreath_white', 'Gypsophila_paniculata.jpg'),
    ('aster_purple', 'Aster_amellus.jpg'),
    ('eucalyptus', 'Eucalyptus_cinerea.jpg'),
    ('ruscus', 'Ruscus_aculeatus.jpg'),
]

def check_file(title):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&titles=File:{urllib.parse.quote(title)}&prop=imageinfo&iiprop=url|mime|size&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'FlowerApp/1.0 (contact: student@edu.com)'})
    try:
        with urllib.request.urlopen(req) as resp:
            d = json.loads(resp.read().decode())
            pages = d.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                if int(pid) > 0 and 'imageinfo' in p:
                    info = p['imageinfo'][0]
                    return info.get('url')
    except Exception as e:
        pass
    return None

results = {}
for key, title in candidate_files:
    u = check_file(title)
    if u:
        print(f"FOUND {key}: {u}")
        results[key] = u
    else:
        print(f"NOT FOUND: {title}")

with open('scratch/found_urls.json', 'w') as f:
    json.dump(results, f, indent=2)
print("Saved URLs to scratch/found_urls.json")
