import urllib.request
import re
import json
from bs4 import BeautifulSoup

def get_page(url):
    req = urllib.request.Request(
        url, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

# Try WP sitemaps first
sitemap_index = get_page('https://shantisdesigns.co.ke/wp-sitemap.xml')
if not sitemap_index:
    sitemap_index = get_page('https://shantisdesigns.co.ke/sitemap_index.xml')

print("Sitemap index preview:", sitemap_index[:500] if sitemap_index else "None")

# Crawl shop pages
all_products = []
page_num = 1
while True:
    url = f"https://shantisdesigns.co.ke/shop/page/{page_num}/" if page_num > 1 else "https://shantisdesigns.co.ke/shop/"
    print(f"Fetching shop page {page_num}: {url}")
    html = get_page(url)
    if not html or "404" in html and "Page not found" in html:
        print(f"Page {page_num} not found or empty. Stopping shop pagination.")
        break
    
    soup = BeautifulSoup(html, 'html.parser')
    items = soup.find_all('li', class_=re.compile(r'product'))
    if not items:
        # Try alternate product containers
        items = soup.find_all('div', class_=re.compile(r'product'))
    
    print(f"Page {page_num} found {len(items)} product elements")
    if len(items) == 0:
        break
        
    for item in items:
        # Title & Link
        title_tag = item.find('h2') or item.find('h3') or item.find('a', class_=re.compile(r'title|name'))
        a_tag = item.find('a', href=re.compile(r'/shop/|/product/'))
        
        title = title_tag.get_text(strip=True) if title_tag else (a_tag.get_text(strip=True) if a_tag else "")
        link = a_tag['href'] if a_tag and 'href' in a_tag.attrs else ""
        
        # Image
        img_tag = item.find('img')
        img_url = ""
        if img_tag:
            img_url = img_tag.get('data-src') or img_tag.get('src') or img_tag.get('srcset', '').split(' ')[0]
            
        # Price
        price_tag = item.find('span', class_=re.compile(r'price|amount'))
        price_text = price_tag.get_text(strip=True) if price_tag else ""
        
        if title and link:
            all_products.append({
                'title': title,
                'link': link,
                'img_url': img_url,
                'price_raw': price_text,
                'page': page_num
            })
            
    page_num += 1
    if page_num > 25: # safety cap
        break

print(f"Total extracted products: {len(all_products)}")
with open('scraped_products_raw.json', 'w') as f:
    json.dump(all_products, f, indent=2)
