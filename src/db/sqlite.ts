import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_PROJECTS,
  INITIAL_PARTNERS,
  INITIAL_REVIEWS,
  INITIAL_ARTICLES,
  INITIAL_LEADS,
  INITIAL_ORDERS,
  INITIAL_ABOUT_DATA,
  INITIAL_MEDIA,
} from '../data/initialData';
import {
  Product,
  Category,
  Project,
  Partner,
  GoogleReview,
  Article,
  WhatsAppLead,
  Order,
  MediaItem,
  AboutData,
  HomepageConfig,
} from '../types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'shantis_solar.sqlite');
export const db = new Database(DB_PATH);

// Enable WAL mode and foreign key integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

export interface EPCService {
  id: number;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  description: string;
  icon_name: string;
  image_url: string;
  features: string[];
  counties_served: string[];
}

export const INITIAL_SERVICES: EPCService[] = [
  {
    id: 1,
    title: 'Residential & Home Solar Backup Systems',
    slug: 'residential-solar-backup-installation-kenya',
    category: 'Residential EPC',
    short_description: 'Custom 3kW to 15kW hybrid solar PV & LiFePO4 battery backup systems for Kenyan homes with 0ms blackout switchover.',
    description: 'EPRA Class T3 licensed design and installation of residential hybrid solar systems using Horay N-Type & JA Solar panels, Must & Deye hybrid inverters, and Lithium Valley LiFePO4 wall-mounted batteries. Cut KPLC bills by up to 85% across Nairobi, Meru, Mombasa, Kisumu, Nakuru, Isiolo, and Machakos.',
    icon_name: 'Sun',
    image_url: 'https://shantisprojects.lovable.app/__l5e/assets-v1/0f44c6c4-ebd7-4883-bae0-17c6dbe786a5/tatu-city.jpg',
    features: [
      'Free site survey & load audit',
      'EPRA licensed installation & warranty',
      'Zero transfer time (UPS-grade) backup',
      'Smart Wi-Fi mobile monitoring',
    ],
    counties_served: ['Nairobi', 'Kiambu', 'Meru', 'Mombasa', 'Kisumu', 'Nakuru', 'Isiolo', 'Machakos'],
  },
  {
    id: 2,
    title: 'Commercial, School & Industrial Three-Phase Solar EPC',
    slug: 'commercial-industrial-solar-epc-kenya',
    category: 'Commercial & Institutional',
    short_description: 'High-voltage 12kW to 500kW three-phase solar PV and BESS storage plants for schools, churches, hospitals, and factories.',
    description: 'Turnkey Engineering, Procurement, and Construction (EPC) for commercial facilities, secondary schools, churches, and warehouses. Engineered for peak tariff load shifting, generator fuel reduction, and three-phase machinery stability.',
    icon_name: 'Building2',
    image_url: 'https://shantisprojects.lovable.app/__l5e/assets-v1/681c8ff1-213e-4cc8-9dea-1ff8cc025506/warehouse.jpg',
    features: [
      'Three-phase Deye & Must HV hybrid systems',
      'Rack-mounted high-voltage LiFePO4 BESS',
      'ROI & KPLC tariff harmonic analysis',
      'Full NCA & EPRA compliance documentation',
    ],
    counties_served: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Meru', 'Machakos', 'Uasin Gishu', 'Kiambu'],
  },
  {
    id: 3,
    title: 'Solar Borehole & Agricultural Water Pumping Solutions',
    slug: 'solar-borehole-water-pump-installation-kenya',
    category: 'Water & Irrigation',
    short_description: 'Doyin DC and AC/DC Hybrid stainless-steel submersible borehole pumps (0.75HP to 10HP) with MPPT solar controllers.',
    description: 'Complete borehole solarization and surface booster pump installations for farms, ranches, estates, and community water projects in Machakos, Isiolo, Meru, Nakuru, and Kajiado. Zero diesel or monthly electricity pumping costs.',
    icon_name: 'Droplets',
    image_url: 'https://shantisprojects.lovable.app/__l5e/assets-v1/fb447bc0-6cb0-4aa7-b06e-08cb9baad0c8/kabete-water.jpg',
    features: [
      'Doyin 304 stainless steel submersible pumps',
      'Dual AC/DC hybrid MPPT solar pump inverters',
      'Dry-run & tank float switch automation',
      'High-head deep well pumping up to 250m',
    ],
    counties_served: ['Machakos', 'Isiolo', 'Meru', 'Nakuru', 'Kajiado', 'Laikipia', 'Kirinyaga', 'Nairobi'],
  },
  {
    id: 4,
    title: 'Solar Water Heating Systems (150L – 300L Pressurized)',
    slug: 'solar-water-heater-installation-kenya',
    category: 'Thermal Energy',
    short_description: 'High-pressure evacuated vacuum tube and flat-plate solar water heaters for residential homes, hotels, and hospitals.',
    description: 'Eliminate electric geyser consumption with borosilicate vacuum tube and pressurized thermosyphon solar water heaters. Engineered with 72-hour high-density polyurethane heat retention and corrosion-resistant stainless steel tanks.',
    icon_name: 'Flame',
    image_url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.50.jpeg',
    features: [
      '150L, 200L, 250L & 300L pressurized tanks',
      'High-absorption borosilicate vacuum tubes',
      'Smart digital temperature & backup controller',
      'EPRA solar water heating regulations compliant',
    ],
    counties_served: ['Nairobi', 'Kiambu', 'Nakuru', 'Meru', 'Nyeri', 'Kisumu', 'Mombasa', 'Machakos'],
  },
];

const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  template_id: 'classic_epc',
  hero_kicker: 'EPRA Licensed Solar EPC Contractor · Nairobi & Nationwide Kenya',
  hero_headline: 'SHANTIS DESIGNS',
  hero_highlight: 'SOLAR SOLUTIONS',
  hero_subheadline:
    'Genuine Tier-1 Horay N-Type & JA Solar Panels, Must & Deye Hybrid Inverters, Lithium Valley LiFePO4 Batteries, EcoFlow Power Backups, and Doyin Submersible Water Pumps.',
  hero_image_url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.50.jpeg',
  primary_cta_label: 'Shop Solar Equipment',
  secondary_cta_label: 'Size Your Solar System',
  epc_banner_title: 'Need Turnkey Solar Installation in Kenya?',
  epc_banner_subtitle:
    'Nationwide Delivery & EPRA-Certified Solar Installation Across Nairobi, Meru, Mombasa, Kisumu, Nakuru, Isiolo & Machakos · Call 0115 521 631',
  show_trust_bar: true,
  show_deals_section: true,
  show_partners_marquee: true,
  show_epc_services: true,
  show_google_reviews: true,
  services: [],
  updated_at: new Date().toISOString(),
};

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function generateSeoKeywordsForProduct(p: Product): string[] {
  const cat = (p.category_name || '').toLowerCase();
  const base = [
    `${p.name} price in Kenya`,
    `Buy ${p.name} Nairobi`,
    `${p.category_name || 'Solar Hardware'} Kenya`,
    'Shantis Designs Solar Solutions',
  ];
  if (cat.includes('panel') || cat.includes('horay') || cat.includes('ja solar')) {
    base.push(
      'solar panels price in Kenya',
      'Tier 1 monocrystalline solar panels Nairobi',
      'N-Type bifacial solar panels Meru Mombasa Kisumu Nakuru'
    );
  } else if (cat.includes('battery') || cat.includes('lithium') || cat.includes('backup') || cat.includes('ecoflow')) {
    base.push(
      'lithium solar batteries Kenya',
      'LiFePO4 battery backup Nairobi',
      'home power backup systems Kenya',
      'solar battery price in Kenya'
    );
  } else if (cat.includes('inverter') || cat.includes('must') || cat.includes('deye')) {
    base.push(
      'hybrid solar inverter price Kenya',
      'Must inverter Kenya',
      'Deye hybrid inverter Nairobi',
      'MPPT solar inverter installation Kenya'
    );
  } else if (cat.includes('pump')) {
    base.push(
      'solar borehole water pump price Kenya',
      'Doyin submersible pump Machakos Isiolo Meru',
      'solar irrigation water pumps Kenya'
    );
  }
  return base;
}

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      name TEXT NOT NULL,
      totp_code TEXT NOT NULL DEFAULT '254880',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      two_factor_verified INTEGER NOT NULL DEFAULT 0,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      source_url TEXT UNIQUE NOT NULL,
      mime_type TEXT NOT NULL,
      size_label TEXT NOT NULL,
      dimensions TEXT NOT NULL,
      binary_data BLOB,
      sha256_hash TEXT,
      entity_type TEXT NOT NULL DEFAULT 'general',
      entity_id TEXT,
      uploaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      permalink TEXT NOT NULL,
      parent INTEGER,
      description TEXT,
      image_url TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      seo_keywords_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      permalink TEXT NOT NULL,
      url TEXT NOT NULL,
      sku TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT NOT NULL,
      price REAL NOT NULL,
      regular_price REAL,
      sale_price REAL,
      stock INTEGER NOT NULL DEFAULT 0,
      manage_stock INTEGER NOT NULL DEFAULT 1,
      stock_status TEXT NOT NULL DEFAULT 'instock',
      category_id INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      warranty TEXT,
      rating REAL,
      reviews_count INTEGER,
      tags_json TEXT NOT NULL DEFAULT '[]',
      specs_json TEXT NOT NULL DEFAULT '{}',
      seo_keywords_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      client TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      category_name TEXT,
      system_size TEXT NOT NULL,
      panels_count TEXT NOT NULL,
      inverter_specs TEXT NOT NULL,
      battery_specs TEXT NOT NULL,
      image_url TEXT NOT NULL,
      gallery_json TEXT NOT NULL DEFAULT '[]',
      completion_date TEXT NOT NULL,
      kplc_savings TEXT NOT NULL,
      description TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      features_json TEXT NOT NULL DEFAULT '[]',
      counties_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      category TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY,
      author_name TEXT NOT NULL,
      author_photo TEXT NOT NULL,
      rating INTEGER NOT NULL,
      time_ago TEXT NOT NULL,
      text TEXT NOT NULL,
      location TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      reviewer_badge TEXT DEFAULT '1 review',
      likes_count INTEGER DEFAULT 1,
      owner_reply TEXT DEFAULT '',
      owner_reply_time TEXT DEFAULT 'a week ago',
      keywords_json TEXT DEFAULT '[]',
      google_review_url TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      author TEXT NOT NULL,
      published_at TEXT NOT NULL,
      image_url TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      read_time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_location TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL,
      mpesa_receipt TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS whatsapp_leads (
      id INTEGER PRIMARY KEY,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      total_value REAL NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      source TEXT NOT NULL DEFAULT 'whatsapp_button'
    );

    CREATE TABLE IF NOT EXISTS webhooks_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      event_type TEXT NOT NULL,
      signature TEXT,
      payload_json TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      processed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cookie_consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consent_id TEXT NOT NULL,
      analytics INTEGER NOT NULL DEFAULT 1,
      marketing INTEGER NOT NULL DEFAULT 1,
      ip_hash TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Seed Users if empty
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, salt, role, name, totp_code, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const engSalt = crypto.randomBytes(16).toString('hex');
    const now = new Date().toISOString();

    insertUser.run(
      'admin@shantisdesigns.co.ke',
      hashPassword('Shantis#Solar2026!', adminSalt),
      adminSalt,
      'super_admin',
      'Chief Solar Operations Admin',
      '254880',
      now
    );
    insertUser.run(
      'engineer@shantisdesigns.co.ke',
      hashPassword('EPRA#Tech2026!', engSalt),
      engSalt,
      'Inventory Manager',
      'Senior EPC Lead Engineer',
      '254880',
      now
    );
  }

  // Helper to register any image URL in media_assets
  const upsertMedia = db.prepare(`
    INSERT OR IGNORE INTO media_assets (
      id, slug, name, source_url, mime_type, size_label, dimensions, entity_type, entity_id, uploaded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const registerImageAsset = (
    url: string,
    name: string,
    entityType: string,
    entityId: string | number,
    customId?: string
  ) => {
    if (!url || typeof url !== 'string') return;
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
    const id = customId || `media-${entityType}-${hash}`;
    const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || 'jpg';
    const mime =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
        ? 'image/webp'
        : ext === 'avif'
        ? 'image/avif'
        : 'image/jpeg';
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    upsertMedia.run(
      id,
      slug || hash,
      name,
      url,
      mime,
      '280 KB',
      '800 × 800 px',
      entityType,
      String(entityId),
      new Date().toISOString().split('T')[0]
    );
  };

  // Seed Categories & Ensure County-Optimized SEO Descriptions
  const catCount = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count;
  if (catCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, slug, permalink, parent, description, image_url, count, seo_keywords_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((cats: Category[]) => {
      for (const c of cats) {
        const keywords = [
          `${c.name} price in Kenya`,
          `Buy ${c.name} Nairobi Mombasa Kisumu`,
          `Best ${c.name} Meru Nakuru Isiolo Machakos`,
          `Shantis Designs Solar Solutions ${c.name}`,
        ];
        const catImg = c.image_url || c.imageUrl || '';
        insertCat.run(
          c.id,
          c.name,
          c.slug,
          c.permalink || `https://shantisdesigns.co.ke/product-category/${c.slug}/`,
          c.parent ?? 0,
          c.description || `Genuine ${c.name} supplied and installed across Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya by Shantis Designs Solar Solutions.`,
          catImg,
          c.count ?? 0,
          JSON.stringify(keywords)
        );
        registerImageAsset(catImg, `Category: ${c.name}`, 'category', c.id);
      }
    });
    tx(INITIAL_CATEGORIES);
  } else {
    const updateCatSeo = db.prepare(`
      UPDATE categories
      SET description = ?, permalink = ?, seo_keywords_json = ?
      WHERE id = ?
    `);
    const tx = db.transaction((cats: Category[]) => {
      for (const c of cats) {
        const keywords = [
          `${c.name} price in Kenya`,
          `Buy ${c.name} Nairobi Mombasa Kisumu`,
          `Best ${c.name} Meru Nakuru Isiolo Machakos`,
          `Shantis Designs Solar Solutions ${c.name}`,
        ];
        updateCatSeo.run(
          c.description,
          c.permalink || `https://shantisdesigns.co.ke/product-category/${c.slug}/`,
          JSON.stringify(keywords),
          c.id
        );
      }
    });
    tx(INITIAL_CATEGORIES);
  }

  // Seed Products
  const prodCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;
  if (prodCount === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (
        id, name, title, slug, permalink, url, sku, description, short_description,
        price, regular_price, sale_price, stock, manage_stock, stock_status,
        category_id, category_name, image_url, featured, warranty, rating, reviews_count,
        tags_json, specs_json, seo_keywords_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((prods: Product[]) => {
      for (const p of prods) {
        const seoKeywords = p.seo_keywords || generateSeoKeywordsForProduct(p);
        insertProd.run(
          p.id,
          p.name,
          p.title || p.name,
          p.slug,
          p.permalink || `https://shantisdesigns.co.ke/product/${p.slug}/`,
          p.url || `https://shantisdesigns.co.ke/product/${p.slug}/`,
          p.sku || `SH-${p.id}`,
          p.description,
          p.shortDescription || p.description,
          p.price,
          p.regular_price ?? p.price,
          p.sale_price ?? null,
          p.stock ?? 20,
          p.manage_stock === false ? 0 : 1,
          p.stock_status || 'instock',
          p.category_id,
          p.category_name,
          p.image_url,
          p.featured ? 1 : 0,
          p.warranty || '5 Years Manufacturer Warranty',
          p.rating ?? 4.9,
          p.reviews_count ?? 14,
          JSON.stringify(p.tags || [p.category_name]),
          JSON.stringify(p.specs || {}),
          JSON.stringify(seoKeywords)
        );
        registerImageAsset(p.image_url, p.name, 'product', p.id);
      }
    });
    tx(INITIAL_PRODUCTS);
  }

  // Seed Projects (and always sync gallery_json so all 80+ live photos are stored in SQLite)
  const projCount = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count;
  if (projCount === 0) {
    const insertProj = db.prepare(`
      INSERT INTO projects (
        id, title, slug, client, location, category, category_name,
        system_size, panels_count, inverter_specs, battery_specs,
        image_url, gallery_json, completion_date, kplc_savings, description, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((projs: Project[]) => {
      for (const proj of projs) {
        const gallery = proj.gallery && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
        insertProj.run(
          proj.id,
          proj.title,
          proj.slug,
          proj.client,
          proj.location,
          proj.category,
          proj.category_name || 'Solar Installation',
          proj.system_size,
          proj.panels_count,
          proj.inverter_specs,
          proj.battery_specs,
          proj.image_url,
          JSON.stringify(gallery),
          proj.completion_date,
          proj.kplc_savings,
          proj.description,
          proj.featured ? 1 : 0
        );
        registerImageAsset(proj.image_url, `${proj.title} - Cover`, 'project', proj.id);
        gallery.forEach((imgUrl, idx) => {
          registerImageAsset(imgUrl, `${proj.title} - Photo ${idx + 1}`, 'project_gallery', `${proj.id}-${idx + 1}`);
        });
      }
    });
    tx(INITIAL_PROJECTS);
  } else {
    // Ensure galleries are synced even if DB already existed
    const updateGallery = db.prepare('UPDATE projects SET gallery_json = ?, image_url = ?, slug = ? WHERE id = ?');
    const tx = db.transaction((projs: Project[]) => {
      for (const proj of projs) {
        const gallery = proj.gallery && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
        updateGallery.run(JSON.stringify(gallery), proj.image_url, proj.slug, proj.id);
        registerImageAsset(proj.image_url, `${proj.title} - Cover`, 'project', proj.id);
        gallery.forEach((imgUrl, idx) => {
          registerImageAsset(imgUrl, `${proj.title} - Photo ${idx + 1}`, 'project_gallery', `${proj.id}-${idx + 1}`);
        });
      }
    });
    tx(INITIAL_PROJECTS);
  }

  // Seed EPC Services
  const srvCount = (db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number }).count;
  if (srvCount === 0) {
    const insertSrv = db.prepare(`
      INSERT INTO services (
        id, title, slug, category, short_description, description,
        icon_name, image_url, features_json, counties_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((srvs: EPCService[]) => {
      for (const s of srvs) {
        insertSrv.run(
          s.id,
          s.title,
          s.slug,
          s.category,
          s.short_description,
          s.description,
          s.icon_name,
          s.image_url,
          JSON.stringify(s.features),
          JSON.stringify(s.counties_served)
        );
        registerImageAsset(s.image_url, `Service: ${s.title}`, 'service', s.id);
      }
    });
    tx(INITIAL_SERVICES);
  }

  // Seed Partners
  const partCount = (db.prepare('SELECT COUNT(*) as count FROM partners').get() as { count: number }).count;
  if (partCount === 0) {
    const insertPart = db.prepare(`
      INSERT INTO partners (id, name, logo_url, category, active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((parts: Partner[]) => {
      for (const p of parts) {
        insertPart.run(p.id, p.name, p.logo_url, p.category, p.active ? 1 : 0, p.sort_order);
        registerImageAsset(p.logo_url, `Partner: ${p.name}`, 'partner', p.id);
      }
    });
    tx(INITIAL_PARTNERS);
  }

  // Ensure new Google Business Profile columns exist on reviews table
  const reviewColumns = [
    "ALTER TABLE reviews ADD COLUMN reviewer_badge TEXT DEFAULT '1 review'",
    "ALTER TABLE reviews ADD COLUMN likes_count INTEGER DEFAULT 1",
    "ALTER TABLE reviews ADD COLUMN owner_reply TEXT DEFAULT ''",
    "ALTER TABLE reviews ADD COLUMN owner_reply_time TEXT DEFAULT 'a week ago'",
    "ALTER TABLE reviews ADD COLUMN keywords_json TEXT DEFAULT '[]'",
    "ALTER TABLE reviews ADD COLUMN google_review_url TEXT DEFAULT ''",
  ];
  for (const sql of reviewColumns) {
    try {
      db.prepare(sql).run();
    } catch {
      // Column already exists
    }
  }

  // Purge any synthetic/fake reviews so ONLY verified Google Business Profile reviews exist
  db.prepare(
    `DELETE FROM reviews WHERE author_name IN (
      'Peter Mwangi', 'Faith Wanjiru', 'Kelvin Mutua',
      'Eng. David Karanja', 'Dr. Grace Muli', 'Samuel Ochieng', 'Catherine Njoroge'
    )`
  ).run();

  // Seed or migrate Reviews to match live Google Business Profile (Teen Network Magazine Show, Gerishon Ngugi)
  const revCount = (db.prepare('SELECT COUNT(*) as count FROM reviews').get() as { count: number }).count;
  const hasTeenNetwork = db
    .prepare("SELECT COUNT(*) as count FROM reviews WHERE author_name = 'Teen Network Magazine Show'")
    .get() as { count: number };

  if (revCount === 0 || hasTeenNetwork.count === 0) {
    db.prepare('DELETE FROM reviews').run();
    const insertRev = db.prepare(`
      INSERT INTO reviews (
        id, author_name, author_photo, rating, time_ago, text, location, verified,
        reviewer_badge, likes_count, owner_reply, owner_reply_time, keywords_json, google_review_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((revs: GoogleReview[]) => {
      for (const r of revs) {
        insertRev.run(
          r.id,
          r.author_name,
          r.author_photo,
          r.rating,
          r.time_ago,
          r.text,
          r.location || 'Kenya',
          r.verified ? 1 : 0,
          r.reviewer_badge || '1 review',
          r.likes_count ?? 1,
          r.owner_reply || '',
          r.owner_reply_time || 'a week ago',
          JSON.stringify(r.keywords || []),
          r.google_review_url || ''
        );
        registerImageAsset(r.author_photo, `Review: ${r.author_name}`, 'review', r.id);
      }
    });
    tx(INITIAL_REVIEWS);
  }

  // Seed Articles & Repair Truncated Meta Descriptions
  const artCount = (db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number }).count;
  if (artCount === 0) {
    const insertArt = db.prepare(`
      INSERT INTO articles (
        id, title, slug, category, content, excerpt, meta_description,
        author, published_at, image_url, tags_json, read_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((arts: Article[]) => {
      for (const a of arts) {
        insertArt.run(
          a.id,
          a.title,
          a.slug,
          a.category,
          a.content,
          a.excerpt,
          a.meta_description,
          a.author,
          a.published_at,
          a.image_url,
          JSON.stringify(a.tags || []),
          a.read_time
        );
        registerImageAsset(a.image_url, `Article: ${a.title}`, 'article', a.id);
      }
    });
    tx(INITIAL_ARTICLES);
  } else {
    const updateArtSeo = db.prepare(`
      UPDATE articles
      SET excerpt = ?, meta_description = ?, tags_json = ?
      WHERE id = ?
    `);
    const tx = db.transaction((arts: Article[]) => {
      for (const a of arts) {
        updateArtSeo.run(a.excerpt, a.meta_description, JSON.stringify(a.tags || []), a.id);
      }
    });
    tx(INITIAL_ARTICLES);
  }

  // Seed Initial Media items explicitly
  for (const m of INITIAL_MEDIA) {
    registerImageAsset(m.url, m.name, 'media_library', m.id, m.id);
  }

  // Seed Orders
  const ordCount = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }).count;
  if (ordCount === 0) {
    const insertOrd = db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_phone, customer_email,
        customer_location, items_json, total, payment_method, status, mpesa_receipt, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((ords: Order[]) => {
      for (const o of ords) {
        insertOrd.run(
          o.id,
          o.order_number,
          o.customer_name,
          o.customer_phone,
          o.customer_email,
          o.customer_location,
          JSON.stringify(o.items),
          o.total,
          o.payment_method,
          o.status,
          o.mpesa_receipt || null,
          o.created_at
        );
      }
    });
    tx(INITIAL_ORDERS);
  }

  // Seed WhatsApp Leads
  const leadCount = (db.prepare('SELECT COUNT(*) as count FROM whatsapp_leads').get() as { count: number }).count;
  if (leadCount === 0) {
    const insertLead = db.prepare(`
      INSERT INTO whatsapp_leads (
        id, product_id, product_name, phone_number, total_value, timestamp, status, notes, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((leads: WhatsAppLead[]) => {
      for (const l of leads) {
        insertLead.run(
          l.id,
          l.product_id || null,
          l.product_name,
          l.phone_number,
          l.total_value,
          l.timestamp,
          l.status,
          l.notes || '',
          l.source || 'whatsapp_button'
        );
      }
    });
    tx(INITIAL_LEADS);
  }

  // Seed Site Settings (About Data & Homepage Config)
  const upsertSetting = db.prepare(`
    INSERT OR IGNORE INTO site_settings (key, value_json, updated_at)
    VALUES (?, ?, ?)
  `);
  const now = new Date().toISOString();
  upsertSetting.run('about_data', JSON.stringify(INITIAL_ABOUT_DATA), now);
  upsertSetting.run('homepage_config', JSON.stringify(DEFAULT_HOMEPAGE_CONFIG), now);
}

// Repository helper functions
export const SqlRepository = {
  getProducts(): Product[] {
    const rows = db.prepare('SELECT * FROM products ORDER BY featured DESC, id DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      title: r.title,
      slug: r.slug,
      permalink: r.permalink,
      url: r.url,
      sku: r.sku,
      description: r.description,
      shortDescription: r.short_description,
      price: r.price,
      regular_price: r.regular_price,
      sale_price: r.sale_price,
      stock: r.stock,
      manage_stock: Boolean(r.manage_stock),
      stock_status: r.stock_status,
      category_id: r.category_id,
      category_name: r.category_name,
      image_url: r.image_url,
      featured: Boolean(r.featured),
      warranty: r.warranty,
      rating: r.rating,
      reviews_count: r.reviews_count,
      tags: JSON.parse(r.tags_json || '[]'),
      specs: JSON.parse(r.specs_json || '{}'),
      seo_keywords: JSON.parse(r.seo_keywords_json || '[]'),
    }));
  },

  getCategories(): Category[] {
    const rows = db.prepare('SELECT * FROM categories ORDER BY count DESC, id ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      permalink: r.permalink,
      parent: r.parent,
      description: r.description,
      image_url: r.image_url,
      count: r.count,
      seo_keywords: JSON.parse(r.seo_keywords_json || '[]'),
    }));
  },

  getProjects(): Project[] {
    const rows = db.prepare('SELECT * FROM projects ORDER BY id ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      client: r.client,
      location: r.location,
      category: r.category,
      category_name: r.category_name,
      system_size: r.system_size,
      panels_count: r.panels_count,
      inverter_specs: r.inverter_specs,
      battery_specs: r.battery_specs,
      image_url: r.image_url,
      gallery: JSON.parse(r.gallery_json || '[]'),
      completion_date: r.completion_date,
      kplc_savings: r.kplc_savings,
      description: r.description,
      featured: Boolean(r.featured),
    }));
  },

  getServices(): EPCService[] {
    const rows = db.prepare('SELECT * FROM services ORDER BY id ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      short_description: r.short_description,
      description: r.description,
      icon_name: r.icon_name,
      image_url: r.image_url,
      features: JSON.parse(r.features_json || '[]'),
      counties_served: JSON.parse(r.counties_json || '[]'),
    }));
  },

  getPartners(): Partner[] {
    const rows = db.prepare('SELECT * FROM partners ORDER BY sort_order ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      logo_url: r.logo_url,
      category: r.category,
      active: Boolean(r.active),
      sort_order: r.sort_order,
    }));
  },

  getReviews(): GoogleReview[] {
    const rows = db.prepare('SELECT * FROM reviews ORDER BY id ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      author_name: r.author_name,
      author_photo: r.author_photo,
      rating: r.rating,
      time_ago: r.time_ago,
      text: r.text,
      location: r.location,
      verified: Boolean(r.verified),
      reviewer_badge: r.reviewer_badge || '1 review',
      likes_count: r.likes_count ?? 1,
      owner_reply: r.owner_reply || undefined,
      owner_reply_time: r.owner_reply_time || 'a week ago',
      keywords: JSON.parse(r.keywords_json || '[]'),
      google_review_url: r.google_review_url || undefined,
    }));
  },

  getArticles(): Article[] {
    const rows = db.prepare('SELECT * FROM articles ORDER BY published_at DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      content: r.content,
      excerpt: r.excerpt,
      meta_description: r.meta_description,
      author: r.author,
      published_at: r.published_at,
      image_url: r.image_url,
      tags: JSON.parse(r.tags_json || '[]'),
      read_time: r.read_time,
    }));
  },

  getOrders(): Order[] {
    const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      order_number: r.order_number,
      customer_name: r.customer_name,
      customer_phone: r.customer_phone,
      customer_email: r.customer_email,
      customer_location: r.customer_location,
      items: JSON.parse(r.items_json || '[]'),
      total: r.total,
      payment_method: r.payment_method,
      status: r.status,
      mpesa_receipt: r.mpesa_receipt || undefined,
      created_at: r.created_at,
    }));
  },

  getLeads(): WhatsAppLead[] {
    const rows = db.prepare('SELECT * FROM whatsapp_leads ORDER BY id DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      product_id: r.product_id || undefined,
      product_name: r.product_name,
      phone_number: r.phone_number,
      total_value: r.total_value,
      timestamp: r.timestamp,
      status: r.status,
      notes: r.notes || undefined,
      source: r.source,
    }));
  },

  getMediaList(): MediaItem[] {
    const rows = db
      .prepare(
        'SELECT id, name, source_url, mime_type, size_label, dimensions, uploaded_at, CASE WHEN binary_data IS NOT NULL THEN 1 ELSE 0 END as has_blob FROM media_assets ORDER BY uploaded_at DESC LIMIT 300'
      )
      .all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.source_url,
      mime_type: r.mime_type,
      size: r.size_label,
      dimensions: r.dimensions,
      uploaded_at: r.uploaded_at,
    }));
  },

  getAboutData(): AboutData {
    const row = db.prepare("SELECT value_json FROM site_settings WHERE key = 'about_data'").get() as
      | { value_json: string }
      | undefined;
    if (!row) return INITIAL_ABOUT_DATA;
    const parsed = JSON.parse(row.value_json);
    if (!parsed.gallery_images || parsed.gallery_images.length === 0) {
      parsed.gallery_images = INITIAL_ABOUT_DATA.gallery_images;
    }
    return parsed;
  },

  getHomepageConfig(): HomepageConfig {
    const row = db.prepare("SELECT value_json FROM site_settings WHERE key = 'homepage_config'").get() as
      | { value_json: string }
      | undefined;
    return row ? JSON.parse(row.value_json) : DEFAULT_HOMEPAGE_CONFIG;
  },

  verifyUserCredentials(email: string, passwordPlain: string) {
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim()) as any;
    if (!user) return null;
    const computed = hashPassword(passwordPlain, user.salt);
    if (computed !== user.password_hash) return null;
    return user;
  },
};
