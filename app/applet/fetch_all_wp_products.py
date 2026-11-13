import urllib.request
import json
import re

def fetch_json(url):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

# Fetch Categories mapping
print("Fetching product categories...")
cats_raw = fetch_json('https://shantisdesigns.co.ke/wp-json/wp/v2/product_cat?per_page=100') or []
cat_map = {c['id']: c['name'] for c in cats_raw}
print(f"Loaded {len(cat_map)} categories: {cat_map}")

# Fetch Tags mapping
print("Fetching product tags...")
tags_raw = fetch_json('https://shantisdesigns.co.ke/wp-json/wp/v2/product_tag?per_page=100') or []
tag_map = {t['id']: t['name'] for t in tags_raw}
print(f"Loaded {len(tag_map)} tags")

# Fetch all products across all pages
all_raw_products = []
page = 1
while True:
    url = f"https://shantisdesigns.co.ke/wp-json/wp/v2/product?per_page=100&page={page}"
    print(f"Fetching page {page}...")
    batch = fetch_json(url)
    if not batch or len(batch) == 0 or not isinstance(batch, list):
        print(f"No items on page {page}. Stopping.")
        break
    print(f"Page {page} returned {len(batch)} items.")
    all_raw_products.extend(batch)
    if len(batch) < 100:
        break
    page += 1

print(f"Total raw products fetched from WP REST API: {len(all_raw_products)}")

processed_products = []
for idx, item in enumerate(all_raw_products):
    p_id = item.get('id')
    title_dict = item.get('title', {})
    title = title_dict.get('rendered', '') if isinstance(title_dict, dict) else str(title_dict)
    # Unescape HTML entities in title
    title = re.sub(r'&#8211;', '-', title)
    title = re.sub(r'&#038;', '&', title)
    title = re.sub(r'&amp;', '&', title)
    title = re.sub(r'&#8217;', "'", title)
    
    slug = item.get('slug', '')
    link = item.get('link', f"https://shantisdesigns.co.ke/shop/{slug}/")
    
    # Categories & Tags
    cat_ids = item.get('product_cat', [])
    cat_names = [cat_map.get(cid, '') for cid in cat_ids if cid in cat_map]
    primary_cat_name = cat_names[0] if cat_names else 'Solar Products'
    
    tag_ids = item.get('product_tag', [])
    item_tags = [tag_map.get(tid, '') for tid in tag_ids if tid in tag_map]
    
    # Excerpt & Content for description
    excerpt_raw = item.get('excerpt', {}).get('rendered', '') if isinstance(item.get('excerpt'), dict) else ''
    content_raw = item.get('content', {}).get('rendered', '') if isinstance(item.get('content'), dict) else ''
    
    # Strip HTML tags for short description
    short_desc = re.sub(r'<[^>]+>', '', excerpt_raw).strip()
    if not short_desc:
        short_desc = re.sub(r'<[^>]+>', '', content_raw).strip()[:160]
    if not short_desc:
        short_desc = f"{title} - Genuine solar equipment available at Shantis Solar Solutions Kenya."

    desc = re.sub(r'<[^>]+>', '', content_raw).strip()
    if not desc:
        desc = short_desc

    # Yoast or OG image extraction
    yoast = item.get('yoast_head_json', {})
    og_images = yoast.get('og_image', [])
    image_url = ""
    if og_images and len(og_images) > 0 and 'url' in og_images[0]:
        image_url = og_images[0]['url']
    
    # Price parsing from content or yoast schema if present
    price = None
    # Look for price in content or title or schema
    schema = yoast.get('schema', {}).get('@graph', [])
    for graph_item in schema:
        if graph_item.get('@type') == 'Product' or 'offers' in graph_item:
            offers = graph_item.get('offers', {})
            if isinstance(offers, list) and len(offers) > 0:
                offers = offers[0]
            if isinstance(offers, dict) and 'price' in offers:
                try:
                    price = float(offers['price'])
                except:
                    pass
    
    processed_products.append({
        'id': p_id,
        'name': title,
        'title': title,
        'slug': slug,
        'permalink': link,
        'url': link,
        'sku': f"SD-{slug[:15].upper()}-{p_id}",
        'description': desc,
        'shortDescription': short_desc,
        'price': price,
        'category_name': primary_cat_name,
        'categories': cat_names,
        'tags': item_tags,
        'image_url': image_url,
        'raw_item': item
    })

print(f"Processed {len(processed_products)} clean product records.")
with open('processed_products.json', 'w') as f:
    json.dump(processed_products, f, indent=2)
