-- ============================================================================
-- SHANTIS DESIGNS SOLAR SOLUTIONS — POSTGRESQL PRODUCTION SCHEMA
-- Compatible with cPanel PostgreSQL Wizard & AI App Hosting (PostgreSQL 13+)
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  slug TEXT NOT NULL,
  date TEXT,
  parent_id INTEGER,
  permalink TEXT,
  sku TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  regular_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(12, 2),
  stock INTEGER NOT NULL DEFAULT 10,
  manage_stock BOOLEAN DEFAULT TRUE,
  stock_status TEXT DEFAULT 'instock',
  product_type TEXT DEFAULT 'simple',
  product_visibility TEXT DEFAULT 'visible',
  short_description TEXT,
  description TEXT,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT FALSE,
  warranty TEXT,
  weight TEXT,
  dimensions TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  client TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  system_size TEXT NOT NULL,
  panels_count TEXT,
  inverter_specs TEXT,
  battery_specs TEXT,
  image_url TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  completion_date TEXT,
  kplc_savings TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  author TEXT,
  category TEXT,
  image_url TEXT,
  published_at TEXT,
  read_time TEXT,
  meta_description TEXT,
  tags JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS partners (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  category TEXT DEFAULT 'all',
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_photo TEXT,
  reviewer_badge TEXT,
  rating INTEGER DEFAULT 5,
  time_ago TEXT,
  location TEXT,
  text TEXT NOT NULL,
  likes_count INTEGER DEFAULT 1,
  owner_reply TEXT,
  owner_reply_time TEXT,
  project_type TEXT,
  verified BOOLEAN DEFAULT TRUE,
  google_review_url TEXT DEFAULT 'https://g.page/r/CVAYv1cTmiLaEAE/review',
  keywords JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS about_page (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  cart_summary TEXT,
  total_value NUMERIC(12, 2) DEFAULT 0,
  timestamp TEXT NOT NULL,
  source TEXT DEFAULT 'whatsapp_button',
  status TEXT DEFAULT 'new',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_location TEXT NOT NULL,
  items_json JSONB NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  vat NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  mpesa_receipt TEXT,
  checkout_request_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homepage_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  draft_json JSONB NOT NULL,
  published_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_library (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size TEXT,
  dimensions TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  ip_address TEXT,
  details TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  totp_secret TEXT NOT NULL,
  totp_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  two_factor_verified BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mpesa_api_credentials (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  shortcode TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  callback_url TEXT NOT NULL,
  consumer_key_masked TEXT NOT NULL,
  consumer_key_hash TEXT NOT NULL,
  consumer_secret_masked TEXT NOT NULL,
  consumer_secret_hash TEXT NOT NULL,
  passkey_masked TEXT NOT NULL,
  passkey_hash TEXT NOT NULL,
  initiator_password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- FULL SEED DATA FOR SHANTIS DESIGNS SOLAR SOLUTIONS
INSERT INTO categories (id, name, slug, description, image_url) VALUES (34, 'Solar Panels', 'solar-panels', 'Buy Tier-1 monocrystalline N-Type and bifacial solar panels (500W–720W) from Horay Solar, JA Solar, Jinko, and Longi with countrywide dispatch to Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/JA-Solar-565W-Bifacial-Solar-Panel-JAM72D40-565-MB.webp') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (35, 'Solar Inverters', 'solar-inverters', 'Pure sine wave hybrid and off-grid solar inverters (1.5kVA–50kW) from Deye, Must, Growatt, Eastman, and Lithium Valley with EPRA-certified installation across Nairobi, Mombasa, Kisumu, Meru & Nakuru.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/IMG-20251206-WA0002.jpg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (41, 'Solar Batteries', 'solar-batteries', 'Deep-cycle lithium LiFePO4, tubular, and maintenance-free Gel solar batteries from Lithium Valley, Eastman, Allgrand, Must, and Deye delivered across Nairobi, Mombasa, Kisumu, Meru & Nakuru.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/Eastman-200Ah-Gel-Battery-12v-Maintenance-Free.jpg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (54, 'Solar Power backup', 'solar-power-backup', 'Shop genuine EcoFlow portable power stations, Delta Pro home backup systems, and uninterrupted solar power backup kits in Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2026-01-06-at-20.46.50.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (55, 'Water Pumps', 'water-pumps', 'Doyin DC, AC, and Hybrid solar submersible borehole water pumps, surface booster pumps, and MPPT controllers for farms and homes in Meru, Machakos, Isiolo, Nakuru, Kisumu, Mombasa & Nairobi.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/4SD10-Submersible-Deep-Well-Borehole-Pump-50Hz-450x450.avif') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (56, 'GEL BATTERIES', 'gel-batteries', 'Maintenance-free deep-cycle 12V 100Ah, 150Ah & 200Ah Solar Gel Batteries from Allgrand and Eastman with fast delivery to Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/Eastman-200Ah-Gel-Battery-12v-Maintenance-Free.jpg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (60, 'DC Submersible Pump', 'dc-submersible-pump', 'High-head Doyin Brushless DC Solar Submersible Water Pumps for borehole irrigation and livestock water supply across Meru, Machakos, Isiolo, Nakuru, Kisumu & Nairobi, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-19-at-13.11.43.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (61, 'Hybrid Submersible Pump', 'hybrid-submersible-pump', 'Dual-input AC/DC Hybrid Solar Submersible Borehole Pumps with automatic solar-to-grid blending across Meru, Machakos, Isiolo, Nakuru, Kisumu, Mombasa & Nairobi, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/JA-Solar-565W-Bifacial-Solar-Panel-JAM72D40-565-MB.webp') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (62, 'Hybrid High Flow Submersible Pump', 'hybrid-high-flow-submersible-pump', 'High-flow Doyin AC/DC Hybrid Submersible Solar Water Pumps for high-volume agricultural irrigation and estates in Meru, Machakos, Nakuru, Isiolo, Kisumu, Mombasa & Nairobi.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-19-at-13.11.41.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (63, 'Heavy-Duty Hybrid Submersible Pump', 'heavy-duty-hybrid-submersible-pump', 'Heavy-Duty Doyin AC/DC Hybrid Submersible Borehole Pumps (3HP–10HP) for deep community boreholes and commercial irrigation in Meru, Isiolo, Machakos, Nakuru, Kisumu & Mombasa.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-19-at-13.11.46.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (64, 'DC Stainless Steel Submersible Pump', 'dc-stainless-steel-submersible-pump', '304 Stainless Steel Doyin DC Solar Submersible Borehole Pumps with MPPT controller for off-grid boreholes in Meru, Isiolo, Machakos, Nakuru, Kisumu, Mombasa & Nairobi, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-19-at-13.11.46-1.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (65, 'AC Well Pump', 'ac-well-pump', 'Reliable Doyin AC Well Pumps for shallow and medium-depth wells, estates, and farms across Nairobi, Meru, Machakos, Nakuru, Kisumu, Mombasa & Isiolo, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-19-at-13.11.44.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (66, 'AC Booster Pump', 'ac-booster-pump', 'Buy high-efficiency Doyin AC Booster Pumps for domestic and commercial water pressure boosting across Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-19-at-13.11.37.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (67, 'Automatic Pump Control Unit', 'automatic-pump-control-unit', 'Smart Automatic Pump Control Units with dry-run and pressure protection for borehole and booster water pumps in Nairobi, Meru, Machakos, Mombasa, Kisumu & Nakuru, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-19-at-13.11.43-1.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (68, 'AC Submersible Pump', 'ac-submersible-pump', 'Heavy-duty stainless steel Doyin AC Submersible Borehole Pumps for deep wells and irrigation in Meru, Machakos, Nakuru, Isiolo, Nairobi, Mombasa & Kisumu, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-19-at-13.11.42.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (69, 'Ecoflow Powerback up', 'ecoflow-powerback-up', 'Official Kenya stockist of EcoFlow RIVER 2, DELTA 2, DELTA 2 Max & DELTA Pro portable LiFePO4 solar power stations for apartments, offices & safaris in Nairobi, Mombasa, Kisumu & Nakuru.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/IMG-20251206-WA0032.jpg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (71, 'Must inverter', 'must-inverter', 'Genuine MUST hybrid and off-grid solar inverters (PV1800, PV1900, PV2900, PV3600, PH1100 Three-Phase) at the best prices in Nairobi, Mombasa, Kisumu, Meru, Nakuru & all Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/PV36PRO-4-6-01-1.jpg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (73, 'Solar LED Flood Light', 'solar-led-flood-light', 'High-brightness IP66 waterproof Solar LED Flood Lights (100W, 200W, 300W, 500W) with remote control and dusk-to-dawn sensors in Nairobi, Mombasa, Kisumu, Meru, Nakuru & Machakos.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/69.jpg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (81, 'SOLAR LIGHTS', 'solar-lights', 'High-lumen commercial and residential IP66 solar street lights, LED floodlights, and security lighting supplied across Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/22.jpg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (165, 'Deye Inverters', 'deye-inverters', 'Shop genuine single-phase and three-phase Deye Hybrid Solar Inverters (3.6kW–50kW Low & High Voltage) with 5-year warranty in Nairobi, Mombasa, Kisumu, Meru, Nakuru & all Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/image_2026-01-26_180321476-1-1-1-1.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (167, 'Deye Mounted Battery Systems', 'deye-mounted-battery-systems', 'Genuine Deye RW-M6.1 and SE-G5.1 Pro LiFePO4 wall-mounted and rack-mounted solar battery systems in Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/image_2026-01-26_181107828-7-1-1-1.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (168, 'Lithium Valley', 'lithium-valley', 'Authorized Kenya distributor of Lithium Valley LiFePO4 wall-mounted batteries, rack-mounted batteries, 12V/24V drop-in batteries, and C&I BESS in Nairobi, Mombasa, Kisumu, Meru & Nakuru.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-18-at-18.33.16.jpeg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (171, 'Eastman Inverter', 'eastman-inverter', 'High-efficiency Eastman Hybrid & Off-Grid Solar Inverters with built-in MPPT charge controllers supplied across Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/EM-3k-5kva-600x600-1-1-2-1-1-450x450.webp') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (172, 'EASTMAN BATTERIES', 'eastman-batteries', 'Buy genuine Eastman Tall Tubular, Gel VRLA, and Lithium Solar Batteries (150Ah, 200Ah, 220Ah) with manufacturer warranty in Nairobi, Mombasa, Kisumu, Meru, Nakuru & Machakos, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/Eastman-200Ah-Gel-Battery-12v-Maintenance-Free.jpg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (173, 'All Grand Batteries', 'all-grand-batteries', 'Genuine Allgrand maintenance-free VRLA Gel deep-cycle solar batteries (100Ah, 150Ah, 200Ah 12V) available in Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/12394-s2669-s26-s91-1793357353-6101fca5-1-450x450.jpg') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (176, 'Must Batteries', 'must-batteries', 'Genuine MUST LP1600 wall-mounted and rack-mounted LiFePO4 lithium solar batteries (5.12kWh–10.24kWh) at the best prices in Nairobi, Mombasa, Kisumu, Meru, Nakuru & Machakos.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2025-12-06-at-09.23.15-1-1-e1768565494726.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (196, 'Wall Mounted Lithium Batteries', 'wall-mounted-lithium-batteries', 'Sleek Wall-Mounted Lithium Valley, Deye & Must LiFePO4 Solar Batteries (5.12kWh, 10.24kWh, 15.36kWh, 16kWh) with 6,000+ cycle warranty in Nairobi, Mombasa, Kisumu, Meru & Nakuru.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-BAT-W5.12Da2.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (201, 'Solar Accessories', 'solar-accessories', 'EPRA-compliant DC circuit breakers, surge protection devices (SPD), MC4 connectors, PV solar cables, and mounting rails in Nairobi, Mombasa, Kisumu, Meru, Nakuru & Machakos.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Top-and-bottom-kit-Top-Cover.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (202, 'Battery Mounting & Hardware', 'battery-mounting-hardware', 'Industrial-grade Lithium Valley battery rack enclosures, stackable mounting brackets, and busbar kits in Nairobi, Mombasa, Kisumu, Meru & Nakuru, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Top-and-bottom-kit-Top-Cover.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (206, 'Rack Mounted Lithium Batteries', 'rack-mounted-lithium-batteries', 'Scalable 48V / 51.2V 100Ah 5.12kWh Rack-Mounted Lithium Valley & Deye LiFePO4 Solar Batteries for homes, telecoms & enterprises across Nairobi, Mombasa, Kisumu, Meru & Nakuru.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-BAT-R5.12Aa.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (208, '12V & 24V Drop-In LiFePO4 Batteries', '12v-24v-drop-in-lifepo4-batteries', 'Shop genuine 12V & 24V Drop-In LiFePO4 Lithium Solar Batteries with smart BMS and 6,000+ cycles in Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos at Shantis Designs Solar Solutions.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LFP200-12.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (215, 'Hybrid Inverters', 'hybrid-inverters', 'Smart single-phase and three-phase Hybrid Solar Inverters from Deye, Must, Lithium Valley, Growatt & Eastman in Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-6KHB-120.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (224, 'Energy Storage Systems (ESS)', 'energy-storage-systems-ess', 'Complete residential, institutional, and industrial Energy Storage Systems (ESS) with Lithium Valley & Deye LiFePO4 battery banks in Nairobi, Mombasa, Kisumu, Meru, Nakuru & Isiolo.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/SC215L125P-06W.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (225, 'Mobile & All-in-One ESS', 'mobile-all-in-one-ess', 'Plug-and-play Mobile & All-in-One Energy Storage Systems (Integrated Inverter + LiFePO4 Battery) for homes and offices in Nairobi, Mombasa, Kisumu, Meru, Nakuru & Machakos.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-MAST-T12K-A.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (227, 'Commercial & Industrial (C&I) BESS', 'commercial-industrial-ci-bess', 'High-voltage Commercial & Industrial (C&I) Battery Energy Storage Systems (100kWh–215kWh+) for factories, hospitals, schools, and malls in Nairobi, Mombasa, Kisumu, Nakuru & Meru, Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/SC215L125P-06W.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO categories (id, name, slug, description, image_url) VALUES (230, 'Off-Grid & Hybrid Inverters', 'off-grid-hybrid-inverters', 'Growatt SPF, Must PV, and Lithium Valley Off-Grid & Hybrid Solar Inverters engineered for zero-downtime backup in Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/SPF-6000-ES-Plus.png') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11435, 'Horay N-Type Solar Panel - 630W', 'Horay N-Type Solar Panel - 630W', 'horay-n-type-solar-panel-630w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-630w/', 'HORAY-630W', 34, 'Solar Panels', 12600, 12600, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 630W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 630W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-630W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"630W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11433, 'Horay N-Type Solar Panel - 590W', 'Horay N-Type Solar Panel - 590W', 'horay-n-type-solar-panel-590w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-590w/', 'HORAY-590W', 34, 'Solar Panels', 11800, 11800, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 590W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 590W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-590W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"590W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11431, 'Horay N-Type Solar Panel - 560W', 'Horay N-Type Solar Panel - 560W', 'horay-n-type-solar-panel-560w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-560w/', 'HORAY-560W', 34, 'Solar Panels', 11200, 11200, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 560W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 560W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-560W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"560W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11429, 'Horay N-Type Solar Panel - 520W', 'Horay N-Type Solar Panel - 520W', 'horay-n-type-solar-panel-520w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-520w/', 'HORAY-520W', 34, 'Solar Panels', 10400, 10400, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 520W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 520W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-520W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"520W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11427, 'Horay N-Type Solar Panel - 500W', 'Horay N-Type Solar Panel - 500W', 'horay-n-type-solar-panel-500w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-500w/', 'HORAY-500W', 34, 'Solar Panels', 10000, 10000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 500W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 500W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-500W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"500W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11425, 'Horay N-Type Solar Panel - 490W', 'Horay N-Type Solar Panel - 490W', 'horay-n-type-solar-panel-490w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-490w/', 'HORAY-490W', 34, 'Solar Panels', 9800, 9800, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 490W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 490W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-490W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"490W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11423, 'Horay N-Type Solar Panel - 460W', 'Horay N-Type Solar Panel - 460W', 'horay-n-type-solar-panel-460w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-460w/', 'HORAY-460W', 34, 'Solar Panels', 9200, 9200, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 460W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 460W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-460W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"460W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11421, 'Horay N-Type Solar Panel - 450W', 'Horay N-Type Solar Panel - 450W', 'horay-n-type-solar-panel-450w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-450w/', 'HORAY-450W', 34, 'Solar Panels', 9000, 9000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 450W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 450W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-450W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"450W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11419, 'Horay N-Type Solar Panel - 440W', 'Horay N-Type Solar Panel - 440W', 'horay-n-type-solar-panel-440w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-440w/', 'HORAY-440W', 34, 'Solar Panels', 8800, 8800, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 440W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 440W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-440W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"440W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11417, 'Horay N-Type Solar Panel - 420W', 'Horay N-Type Solar Panel - 420W', 'horay-n-type-solar-panel-420w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-420w/', 'HORAY-420W', 34, 'Solar Panels', 8400, 8400, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 420W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 420W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-420W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"420W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11415, 'Horay N-Type Solar Panel - 350W', 'Horay N-Type Solar Panel - 350W', 'horay-n-type-solar-panel-350w', '', NULL, 'https://shantisdesigns.co.ke/product/horay-n-type-solar-panel-350w/', 'HORAY-350W', 34, 'Solar Panels', 1050, 1050, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Horay N-Type monocrystalline solar panel, 350W, 15-year product warranty.', 'Horay N-Type high-efficiency monocrystalline solar panel built with N-Type cells. 15-year product warranty. Wattage: 350W.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"HORAY-350W","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"350W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, TRUE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11364, 'Growatt-SPE 12000 ES 12KVA Single Phase Inverter', 'Growatt-SPE 12000 ES 12KVA Single Phase Inverter', 'growatt-spe-12000-es-12kva-single-phase-inverter', '', NULL, 'https://shantisdesigns.co.ke/product/growatt-spe-12000-es-12kva-single-phase-inverter/', 'GROWATT-SPE-12000-ES', 230, 'Off-Grid & Hybrid Inverters', 175000, 175000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Growatt SPE 12000 ES 48V 12KVA high-output single-phase solar inverter backed by a 5-year warranty.', '48V, 12KVA Single Phase Inverter; Brand: GROWATT; Warranty: 5 years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/SPE-12000-ES.png', '[]'::jsonb, '{"Brand / Manufacturer":"Growatt","Model / SKU":"GROWATT-SPE-12000-ES","Product Category":"Off-Grid & Hybrid Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"12KVA","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, TRUE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11362, 'Growatt-SPF-6000 ES Plus 6KVA Single Phase Inverter', 'Growatt-SPF-6000 ES Plus 6KVA Single Phase Inverter', 'growatt-spf-6000-es-plus-6kva-single-phase-inverter', '', NULL, 'https://shantisdesigns.co.ke/product/growatt-spf-6000-es-plus-6kva-single-phase-inverter/', 'GROWATT-SPF-6000-ES', 230, 'Off-Grid & Hybrid Inverters', 87500, 87500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Growatt SPF-6000 ES Plus 48V 6KVA single-phase solar inverter with a 5-year warranty.', '48V, 6KVA Single Phase Inverter; Brand: GROWATT; Warranty: 5 years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/SPF-6000-ES-Plus.png', '[]'::jsonb, '{"Brand / Manufacturer":"Growatt","Model / SKU":"GROWATT-SPF-6000-ES","Product Category":"Off-Grid & Hybrid Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"6KVA","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, TRUE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11360, 'Growatt-SPF-3500 ES Lite 3.5KVA Single Phase Inverter', 'Growatt-SPF-3500 ES Lite 3.5KVA Single Phase Inverter', 'growatt-spf-3500-es-lite-3-5kva-single-phase-inverter', '', NULL, 'https://shantisdesigns.co.ke/product/growatt-spf-3500-es-lite-3-5kva-single-phase-inverter/', 'GROWATT-SPF-3500-ES', 230, 'Off-Grid & Hybrid Inverters', 59500, 59500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Growatt SPF-3500 ES Lite 48V 3.5KVA single-phase solar inverter with a 5-year warranty.', '48V, 3.5KVA Single Phase Inverter; Brand: GROWATT; Warranty: 5 years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/SPF-3500-ES-Lite.png', '[]'::jsonb, '{"Brand / Manufacturer":"Growatt","Model / SKU":"GROWATT-SPF-3500-ES","Product Category":"Off-Grid & Hybrid Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"3.5KVA","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, TRUE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11358, 'Lithium Valley-SC215L125P-06W 215kWh-125kW Liquid-Cooled C&I BESS', 'Lithium Valley-SC215L125P-06W 215kWh-125kW Liquid-Cooled C&I BESS', 'lithium-valley-sc215l125p-06w-215kwh-125kw-liquid-cooled-ci-bess', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-sc215l125p-06w-215kwh-125kw-liquid-cooled-ci-bess/', 'LV-SC215L125P-06W', 227, 'Commercial & Industrial (C&I) BESS', 5625000, 5625000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Commercial & Industrial Liquid-Cooled All-in-One BESS featuring a Solis 125kW inverter (S6-EH3P125K10-NV-YD-H) and 215.04kWh HV lithium storage.', 'Liquid Cooled Battery All-in-One C&I BESS; Solis S6-EH3P125K10-NV-YD-H 125KW inverter with 215.04Kwh HV Lithium battery; Brand: Lithium Valley; Cycle: &gt;8000times; inverter & electrical equipment 5years, battery 10years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/SC215L125P-06W.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-SC215L125P-06W","Product Category":"Commercial & Industrial (C&I) BESS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"06W","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, TRUE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11356, 'Lithium Valley-SC100A50P-06W 100kWh-50kW Smart Air-Cooled C&I BESS', 'Lithium Valley-SC100A50P-06W 100kWh-50kW Smart Air-Cooled C&I BESS', 'lithium-valley-sc100a50p-06w-100kwh-50kw-smart-air-cooled-ci-bess', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-sc100a50p-06w-100kwh-50kw-smart-air-cooled-ci-bess/', 'LV-SC100A50P-06W', 227, 'Commercial & Industrial (C&I) BESS', 2875000, 2875000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Commercial & Industrial Smart Air-Cooled All-in-One BESS combining a Solis 50kW three-phase inverter (S6-EH3P50K-H) with a 100.3kWh HV lithium battery.', 'Smart Air-Cooled Battery All-in-One C&I BESS; Solis S6-EH3P50K-H 50KW inverter with 100.3Kwh HV Lithium battery; Brand: Lithium Valley; Cycle: &gt;8000times; inverter & electrical equipment 5years, battery 10years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/SC100A50P-06W.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-SC100A50P-06W","Product Category":"Commercial & Industrial (C&I) BESS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"06W","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, TRUE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11354, 'Lithium Valley-LV-MAST-T12K-A 15kWh All-in-One Mobile ESS (12kW Deye Inverter)', 'Lithium Valley-LV-MAST-T12K-A 15kWh All-in-One Mobile ESS (12kW Deye Inverter)', 'lithium-valley-lv-mast-t12k-a-15kwh-all-in-one-mobile-ess-12kw-deye-inverter', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-lv-mast-t12k-a-15kwh-all-in-one-mobile-ess-12kw-deye-inverter/', 'LV-MAST-T12K-A', 225, 'Mobile & All-in-One ESS', 850000, 850000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '15kWh Mobile Energy Storage System integrating a 12kW Deye hybrid inverter and 15kWh Lithium Valley LiFePO4 battery (&gt;6000 cycles, 5-year warranty).', '15KWH Mobile Energy Storage System (All in one Deye 12KW inverter with 15 Kwh Lithium battery); Style#: LV-MAST-T12K-A; Brand: Lithium Valley; Cycle: &gt;6000times; Warranty: 5years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-MAST-T12K-A.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-MAST-T12K-A","Product Category":"Mobile & All-in-One ESS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"15kW","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, TRUE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11352, 'Lithium Valley-W16-E5 16.0768kWh (With LCD Display)', 'Lithium Valley-W16-E5 16.0768kWh (With LCD Display)', 'lithium-valley-w16-e5-16-0768kwh-with-lcd-display', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-w16-e5-16-0768kwh-with-lcd-display/', 'LV-W16-E5', 196, 'Wall Mounted Lithium Batteries', 295000, 295000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 314Ah (16.0768kWh) high-capacity wall-mounted LiFePO4 battery with LCD display, &gt;8000 cycles, and a 10-year warranty.', 'Capacity: 51.2V 314Ah (16.0768KWh) wall mounted LiFePO4 lithium battery; Style#: W16-E5 (With LCD display); 1 year warranty of LCD; Brand: Lithium Valley; Cycle: &gt;8000times; Warranty: 10years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/W16-E5-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-W16-E5","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"16.0768kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, TRUE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11350, 'Lithium Valley-W15-E5 14.336kWh', 'Lithium Valley-W15-E5 14.336kWh', 'lithium-valley-w15-e5-14-336kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-w15-e5-14-336kwh/', 'LV-W15-E5', 196, 'Wall Mounted Lithium Batteries', 285000, 285000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 280Ah (14.336kWh) wall-mounted LiFePO4 lithium battery (Style#: W15-E5) with &gt;8000 cycles and a 10-year warranty.', 'Capacity: 51.2V 280Ah (14.336KWh) wall mounted LiFePO4 lithium battery; Style#: W16-E5 (With LCD display); 1 year warranty of LCD; Brand: Lithium Valley; Cycle: &gt;8000times; Warranty: 10years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/W15-E5.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-W15-E5","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"14.336kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, TRUE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11348, 'Lithium Valley-W5-E5 5.12kWh', 'Lithium Valley-W5-E5 5.12kWh', 'lithium-valley-w5-e5-5-12kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-w5-e5-5-12kwh/', 'LV-W5-E5', 196, 'Wall Mounted Lithium Batteries', 105000, 105000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 100Ah (5.12kWh) wall-mounted LiFePO4 lithium battery (Style#: W5-E5 without display) with &gt;6000 cycles and a 10-year warranty.', 'Capacity: 51.2V 100Ah (5.12KWh) wall mounted LiFePO4 lithium battery; Style#: W5-E5 (Without display); Brand: Lithium Valley; Cycle: &gt;6000times; Warranty: 10 years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/W5-E5.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-W5-E5","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.12kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, TRUE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11346, 'Lithium Valley-BAT-W5.12Da2 5.12kWh', 'Lithium Valley-BAT-W5.12Da2 5.12kWh', 'lithium-valley-bat-w5-12da2-5-12kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-bat-w5-12da2-5-12kwh/', 'LV-BAT-W5.12DA2', 196, 'Wall Mounted Lithium Batteries', 110000, 110000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 100Ah (5.12kWh) wall-mounted LiFePO4 lithium battery (Style#: LV-BAT-W5.12Da2) with &gt;6000 cycles and a 5-year warranty.', 'Capacity: 51.2V 100Ah (5.12KWh) wall mounted LiFePO4 lithium battery; Style#: LV-BAT-W5.12Da2; Brand: Lithium Valley; Cycle: &gt;6000times; Warranty: 5 years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-BAT-W5.12Da2.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-BAT-W5.12DA2","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.12kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11344, 'Lithium Valley-W3-5D 2.56kWh (With LCD Display)', 'Lithium Valley-W3-5D 2.56kWh (With LCD Display)', 'lithium-valley-w3-5d-2-56kwh-with-lcd-display', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-w3-5d-2-56kwh-with-lcd-display/', 'LV-W3-5D', 196, 'Wall Mounted Lithium Batteries', 65000, 65000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '25.6V 100Ah (2.56kWh) wall-mounted LiFePO4 lithium battery with smart LCD display, &gt;6000 cycles, and a 5-year warranty.', 'Capacity: 25.6V 100Ah (2.56KWh) wall mounted LiFePO4 lithium battery; Style#: W3-5D (With LCD display); 1 year warranty of LCD; Brand: Lithium Valley; Cycle: &gt;6000times; Warranty: 5years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/W3-5D.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-W3-5D","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2.56kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11340, 'Lithium Valley-LV 6KHB-120 6kW Hybrid Inverter', 'Lithium Valley-LV 6KHB-120 6kW Hybrid Inverter', 'lithium-valley-lv-6khb-120-6kw-hybrid-inverter', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-lv-6khb-120-6kw-hybrid-inverter/', 'LV-6KHB-120', 215, 'Hybrid Inverters', 105000, 105000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '6kW Hybrid Solar Inverter by Lithium Valley (Model: LV 6KHB-120) backed by a 5-year warranty.', '6KW Hybrid Inverter; Brand: Lithium Valley; Warranty: 5 years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-6KHB-120.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-6KHB-120","Product Category":"Hybrid Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"6kW","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11338, 'Lekkerix / Lithium Valley-BAT-W15.36Da 15.36kWh', 'Lekkerix / Lithium Valley-BAT-W15.36Da 15.36kWh', 'lekkerix-lithium-valley-bat-w15-36da-15-36kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lekkerix-lithium-valley-bat-w15-36da-15-36kwh/', 'LKX-BAT-W15.36DA', 196, 'Wall Mounted Lithium Batteries', 245000, 245000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 300Ah (15.36kWh) wall-mounted LiFePO4 lithium battery (Brand: LEKKERIX) with &gt;6000 cycles and a 5-year warranty.', '51.2V 300Ah wall mounted LiFePO4 lithium battery; Style#: LV-BAT-W15.36Da; Brand: LEKKERIX; Cycle: &gt;6000times; Warranty: 5years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-BAT-W15.36Da.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LKX-BAT-W15.36DA","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"15.36kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11336, 'Lekkerix / Lithium Valley-BAT-W10.24Da 10.24kWh', 'Lekkerix / Lithium Valley-BAT-W10.24Da 10.24kWh', 'lekkerix-lithium-valley-bat-w10-24da-10-24kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lekkerix-lithium-valley-bat-w10-24da-10-24kwh/', 'LKX-BAT-W10.24DA', 196, 'Wall Mounted Lithium Batteries', 165000, 165000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 200Ah (10.24kWh) wall-mounted LiFePO4 lithium battery (Brand: LEKKERIX) with &gt;6000 cycles and a 5-year warranty.', '51.2V 200Ah wall mounted LiFePO4 lithium battery; Style#: LV-BAT-W10.24Da; Brand: LEKKERIX; Cycle: &gt;6000times; Warranty: 5years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-BAT-W10.24Da.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LKX-BAT-W10.24DA","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"10.24kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11334, 'Lithium Valley-BAT-W5.12Da 5.12kWh', 'Lithium Valley-BAT-W5.12Da 5.12kWh', 'lithium-valley-bat-w5-12da-5-12kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-bat-w5-12da-5-12kwh/', 'LKX-BAT-W5.12DA', 196, 'Wall Mounted Lithium Batteries', 83750, 83750, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 100Ah (5.12kWh) wall-mounted LiFePO4 lithium battery (Brand: LEKKERIX) with &gt;6000 cycles and a 5-year warranty.', '51.2V 100Ah wall mounted LiFePO4 lithium battery; Style#: LV-BAT-W5.12Da; Brand: LEKKERIX; Cycle: &gt;6000times; Warranty: 5years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-BAT-W5.12Da.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LKX-BAT-W5.12DA","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.12kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11332, 'Lithium Valley-25.6V 100Ah 2.56kWh', 'Lithium Valley-25.6V 100Ah 2.56kWh', 'lithium-valley-25-6v-100ah-2-56kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-25-6v-100ah-2-56kwh/', 'LV-25.6V-100AH', 208, '12V & 24V Drop-In LiFePO4 Batteries', 45000, 45000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '25.6V 100Ah (2.56kWh / 2560Wh) lead-acid replacement LiFePO4 lithium battery with &gt;3000 cycles and a 5-year warranty.', 'Capacity: 25.6V 100Ah (2560Wh); leadacid shape LiFePO4 lithium battery; Style: 25.6V100Ah; Brand: Lithium Valley; Cycle: &gt;3000times; Warranty: 5years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/25.6V-100Ah.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-25.6V-100AH","Product Category":"12V & 24V Drop-In LiFePO4 Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"100Ah","Rated Voltage":"25.6V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11330, 'Lithium Valley-LFP200-12 2.56kWh (12.8V 200Ah)', 'Lithium Valley-LFP200-12 2.56kWh (12.8V 200Ah)', 'lithium-valley-lfp200-12-2-56kwh-12-8v-200ah', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-lfp200-12-2-56kwh-12-8v-200ah/', 'LV-LFP200-12', 208, '12V & 24V Drop-In LiFePO4 Batteries', 45000, 45000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '12.8V 200Ah (2.56kWh) lead-acid replacement LiFePO4 lithium battery with &gt;3000 cycles and a 5-year warranty.', '12.8V 200Ah leadacid shape LiFePO4 lithium battery; Style#: LFP200-12; Brand: Lithium Valley; Cycle: &gt;3000times; Warranty: 5years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LFP200-12.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-LFP200-12","Product Category":"12V & 24V Drop-In LiFePO4 Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2.56kW","Rated Voltage":"12.8V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11328, 'Lithium Valley-LFP100-12 1.28kWh (12.8V 100Ah)', 'Lithium Valley-LFP100-12 1.28kWh (12.8V 100Ah)', 'lithium-valley-lfp100-12-1-28kwh-12-8v-100ah', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-lfp100-12-1-28kwh-12-8v-100ah/', 'LV-LFP100-12', 208, '12V & 24V Drop-In LiFePO4 Batteries', 22500, 22500, NULL, 25, TRUE, 'instock', 'simple', 'visible', '12.8V 100Ah (1.28kWh) lead-acid replacement LiFePO4 lithium battery with &gt;3000 cycles and a 5-year warranty.', '12.8V 100Ah leadacid shape LiFePO4 lithium battery; Style#: LFP100-12; Brand: Lithium Valley; Cycle: &gt;3000times; Warranty: 5years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LFP100-12.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-LFP100-12","Product Category":"12V & 24V Drop-In LiFePO4 Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1.28kW","Rated Voltage":"12.8V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11326, 'Lithium Valley-BAT-R5.12Aa 5.12kWh Rack Battery', 'Lithium Valley-BAT-R5.12Aa 5.12kWh Rack Battery', 'lithium-valley-bat-r5-12aa-5-12kwh-rack-battery', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-bat-r5-12aa-5-12kwh-rack-battery/', 'LV-BAT-R5.12AA', 206, 'Rack Mounted Lithium Batteries', 103750, 103750, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 100Ah (5.12kWh) stackable rack-mounted LiFePO4 lithium battery with &gt;6000 cycles and a 10-year warranty.', '51.2V 100Ah rack LiFePO4 lithium battery; Style#: LV-BAT-R5.12Aa; Brand: Lithium Valley; Cycle: &gt;6000times; Warranty: 10years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-BAT-R5.12Aa.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-BAT-R5.12AA","Product Category":"Rack Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.12kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11324, 'Lithium Valley-Top and Bottom Rack Kit (558.2x456x113mm)', 'Lithium Valley-Top and Bottom Rack Kit (558.2x456x113mm)', 'lithium-valley-top-and-bottom-rack-kit-558-2x456x113mm', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-top-and-bottom-rack-kit-558-2x456x113mm/', 'LV-RACK-KIT-TB', 202, 'Battery Mounting & Hardware', 10625, 10625, NULL, 25, TRUE, 'instock', 'simple', 'visible', '3mm galvanized sheet top and bottom stacking kit (558.2×456×113mm) supporting up to 6 layers of rack batteries (300kg load capacity).', 'Dimension(L*W*D):558.2*456*113mm; Usage: Stackable up to 6 layers of Rack batteries; Material: 3MM Galvanized sheet; Weight bearing: 300KG', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Top-and-bottom-kit-Top-Cover.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-RACK-KIT-TB","Product Category":"Battery Mounting & Hardware","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11322, 'Lithium Valley-W15-5A Leveling Foot Pad (14.336kWh)', 'Lithium Valley-W15-5A Leveling Foot Pad (14.336kWh)', 'lithium-valley-w15-5a-leveling-foot-pad-14-336kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-w15-5a-leveling-foot-pad-14-336kwh/', 'LV-W15-5A-FOOTPAD', 202, 'Battery Mounting & Hardware', 312.5, 312.5, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Leveling foot pad accessory for the Lithium Valley W15-5A (14.336kWh) lithium battery.', 'Foot pat (leveling foot pad) accessory for Lithium Valley W15-5A (14.336kWh) LiFePO4 battery.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Top-and-bottom-kit-Top-Cover.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-W15-5A-FOOTPAD","Product Category":"Battery Mounting & Hardware","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"14.336kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11320, 'Lithium Valley-W15-5A Heavy-Duty Wheels Kit (14.336kWh)', 'Lithium Valley-W15-5A Heavy-Duty Wheels Kit (14.336kWh)', 'lithium-valley-w15-5a-heavy-duty-wheels-kit-14-336kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-w15-5a-heavy-duty-wheels-kit-14-336kwh/', 'LV-W15-5A-WHEELS', 202, 'Battery Mounting & Hardware', 5000, 5000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Optional heavy-duty caster wheels kit for the Lithium Valley W15-5A (14.336kWh) lithium battery.', 'Wheels accessory kit for Lithium Valley W15-5A (14.336kWh) wall-mounted/floor-standing LiFePO4 lithium battery.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Top-and-bottom-kit-Top-Cover.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-W15-5A-WHEELS","Product Category":"Battery Mounting & Hardware","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"14.336kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11318, 'Lithium Valley-W15-5A 14.336kWh', 'Lithium Valley-W15-5A 14.336kWh', 'lithium-valley-w15-5a-14-336kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-w15-5a-14-336kwh/', 'LV-W15-5A', 196, 'Wall Mounted Lithium Batteries', 295000, 295000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 280Ah (14.336kWh) wall-mounted LiFePO4 lithium battery (Style#: W16-lite) with &gt;8000 cycles and a 10-year warranty.', '51.2V 280Ah wall mounted LiFePO4 lithium battery; Style#: W16-lite; Brand: Lithium Valley; Cycle: &gt;8000times; Warranty: 10years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/W16-E5.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-W15-5A","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"14.336kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11316, 'Lithium Valley-W10-5A 10.24kWh', 'Lithium Valley-W10-5A 10.24kWh', 'lithium-valley-w10-5a-10-24kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-w10-5a-10-24kwh/', 'LV-W10-5A', 196, 'Wall Mounted Lithium Batteries', 215000, 215000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 200Ah (10.24kWh) wall-mounted LiFePO4 lithium battery (Style#: W10-5A) with &gt;8000 cycles and a 10-year warranty.', '51.2V 200Ah wall mounted LiFePO4 lithium battery; Style#: W10-5A; Brand: Lithium Valley; Cycle: &gt;8000times; Warranty: 10years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/W10-5A.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-W10-5A","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"10.24kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11314, 'Lithium Valley-BAT-W10.24Ac 10.24kWh', 'Lithium Valley-BAT-W10.24Ac 10.24kWh', 'lithium-valley-bat-w10-24ac-10-24kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-bat-w10-24ac-10-24kwh/', 'LV-BAT-W10.24AC', 196, 'Wall Mounted Lithium Batteries', 225000, 225000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 200Ah (10.24kWh) wall-mounted LiFePO4 lithium battery by Lithium Valley. Features &gt;6000 cycle life and a 10-year warranty.', '51.2V 200Ah wall mounted LiFePO4 lithium battery; Style#: LV-BAT-W10.24Ac; Brand: Lithium Valley; Cycle: &gt;6000times; Warranty: 10years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-BAT-W10.24Ac.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-BAT-W10.24AC","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"10.24kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11312, 'Lithium Valley -BAT-W5.12Ac 5.12kWh', 'Lithium Valley -BAT-W5.12Ac 5.12kWh', 'lithium-valley-bat-w5-12ac-5-12kwh', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-valley-bat-w5-12ac-5-12kwh/', 'LV-BAT-W5.12AC', 196, 'Wall Mounted Lithium Batteries', 125000, 125000, NULL, 25, TRUE, 'instock', 'simple', 'visible', '51.2V 100Ah (5.12kWh) wall-mounted LiFePO4 lithium battery by Lithium Valley. Features &gt;6000 cycle life and a 10-year warranty.', '51.2V 100Ah wall mounted LiFePO4 lithium battery; Style#: LV-BAT-W5.12Ac; Brand: Lithium Valley; Cycle: &gt;6000times; Warranty: 10years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/LV-BAT-W5.12Ac.png', '[]'::jsonb, '{"Brand / Manufacturer":"Lithium Valley","Model / SKU":"LV-BAT-W5.12AC","Product Category":"Wall Mounted Lithium Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.12kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11296, 'JINKO BIFICIAL SOLAR 620 SOLAR PANEL', 'JINKO BIFICIAL SOLAR 620 SOLAR PANEL', 'jinko-bificial-solar-620-solar-panel', '', NULL, 'https://shantisdesigns.co.ke/product/jinko-bificial-solar-620-solar-panel/', 'SD-JINKOBIFI-11296', 34, 'Solar Panels', 12400, 12400, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'JINKO BIFICIAL SOLAR 620 SOLAR PANEL - Genuine equipment from Shantis Solar Solutions Kenya.', 'JINKO BIFICIAL SOLAR 620 SOLAR PANEL - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/images-20.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"SD-JINKOBIFI-11296","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, FALSE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11295, 'FLOODLIGHT CAMERA ALP 0222 Series - ALP 0222B200-01', 'FLOODLIGHT CAMERA ALP 0222 Series - ALP 0222B200-01', 'floodlight-camera-alp-0222-series-alp-0222b200-01', '', NULL, 'https://shantisdesigns.co.ke/product/floodlight-camera-alp-0222-series-alp-0222b200-01/', 'ALP-0222B200-01', 81, 'SOLAR LIGHTS', 13300, 13300, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'FLOODLIGHT CAMERA ALP 0222 Series - ALP 0222B200-01 - Genuine equipment from Shantis Solar Solutions Kenya.', 'FLOODLIGHT CAMERA ALP 0222 Series - ALP 0222B200-01 - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/alp-0222b200-01-1793437456-39cc0c0f.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ALP-0222B200-01","Product Category":"SOLAR LIGHTS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11293, 'FLOODLIGHT CAMERA ALP 0222 Series - ALP 0222D400-01', 'FLOODLIGHT CAMERA ALP 0222 Series - ALP 0222D400-01', 'floodlight-camera-alp-0222-series-alp-0222d400-01', '', NULL, 'https://shantisdesigns.co.ke/product/floodlight-camera-alp-0222-series-alp-0222d400-01/', 'ALP-0222D400-01', 81, 'SOLAR LIGHTS', 18300, 18300, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'FLOODLIGHT CAMERA ALP 0222 Series - ALP 0222D400-01 - Genuine equipment from Shantis Solar Solutions Kenya.', 'FLOODLIGHT CAMERA ALP 0222 Series - ALP 0222D400-01 - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/alp-0222d400-01-1793437433-29f3ef9c.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ALP-0222D400-01","Product Category":"SOLAR LIGHTS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11291, 'Must PV1800 VPM/VHM Series - PV1800 VPM Hybrid Inverter 3.2KVA 24V 60A 160VDC', 'Must PV1800 VPM/VHM Series - PV1800 VPM Hybrid Inverter 3.2KVA 24V 60A 160VDC', 'must-pv1800-vpm-vhm-series-pv1800-vpm-hybrid-inverter-3-2kva-24v-60a-160vdc', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv1800-vpm-vhm-series-pv1800-vpm-hybrid-inverter-3-2kva-24v-60a-160vdc/', 'PV1800-VPM-3.2K', 71, 'Must inverter', 34000, 34000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Must PV1800 VPM/VHM Series - PV1800 VPM Hybrid Inverter 3.2KVA 24V 60A 160VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'Must PV1800 VPM/VHM Series - PV1800 VPM Hybrid Inverter 3.2KVA 24V 60A 160VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv1800-vpm-3-2k-1793437354-91ff4037.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"PV1800-VPM-3.2K","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"3.2KVA","Rated Voltage":"1800 V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11288, 'Must PV1800 VPM/VHM Series - PV1800 VPM Hybrid Inverter 2.2KVA 24V 60A 160VDC', 'Must PV1800 VPM/VHM Series - PV1800 VPM Hybrid Inverter 2.2KVA 24V 60A 160VDC', 'must-pv1800-vpm-vhm-series-pv1800-vpm-hybrid-inverter-2-2kva-24v-60a-160vdc', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv1800-vpm-vhm-series-pv1800-vpm-hybrid-inverter-2-2kva-24v-60a-160vdc/', 'PV1800-VPM-2.2K', 71, 'Must inverter', 31500, 31500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Must PV1800 VPM/VHM Series - PV1800 VPM Hybrid Inverter 2.2KVA 24V 60A 160VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'Must PV1800 VPM/VHM Series - PV1800 VPM Hybrid Inverter 2.2KVA 24V 60A 160VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv1800-vpm-2-2k-1793437322-1b53c922.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"PV1800-VPM-2.2K","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2.2KVA","Rated Voltage":"1800 V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11286, 'Must PV1800 VPM/VHM Series - PV1800 VHM Hybrid Inverter 5.5KVA 48V 80A 250VDC', 'Must PV1800 VPM/VHM Series - PV1800 VHM Hybrid Inverter 5.5KVA 48V 80A 250VDC', 'must-pv1800-vpm-vhm-series-pv1800-vhm-hybrid-inverter-5-5kva-48v-80a-250vdc', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv1800-vpm-vhm-series-pv1800-vhm-hybrid-inverter-5-5kva-48v-80a-250vdc/', 'PV1800-VHM-5.5K', 71, 'Must inverter', 56500, 56500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Must PV1800 VPM/VHM Series - PV1800 VHM Hybrid Inverter 5.5KVA 48V 80A 250VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'Must PV1800 VPM/VHM Series - PV1800 VHM Hybrid Inverter 5.5KVA 48V 80A 250VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv1800-vhm-5-5k-1793437264-b83c6a10.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"PV1800-VHM-5.5K","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.5KVA","Rated Voltage":"1800 V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11283, 'Must PV1800 PREM Series - PV1800 PREM Hybrid Inverter 5.5KVA 48V 100A 450VDC', 'Must PV1800 PREM Series - PV1800 PREM Hybrid Inverter 5.5KVA 48V 100A 450VDC', 'must-pv1800-prem-series-pv1800-prem-hybrid-inverter-5-5kva-48v-100a-450vdc', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv1800-prem-series-pv1800-prem-hybrid-inverter-5-5kva-48v-100a-450vdc/', 'PV1800-PREM-5.5K', 71, 'Must inverter', 69000, 69000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Must PV1800 PREM Series - PV1800 PREM Hybrid Inverter 5.5KVA 48V 100A 450VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'Must PV1800 PREM Series - PV1800 PREM Hybrid Inverter 5.5KVA 48V 100A 450VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv1800-prem-5-5k-1793437237-d7e9f5db.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"PV1800-PREM-5.5K","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.5KVA","Rated Voltage":"48V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11281, 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 10KVA 48V 150A 500VDC', 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 10KVA 48V 150A 500VDC', 'must-pv1900-exp-series-6-2-12kw-pv1900-exp-hybrid-inverter-10kva-48v-150a-500vdc', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv1900-exp-series-6-2-12kw-pv1900-exp-hybrid-inverter-10kva-48v-150a-500vdc/', 'PV1900-EXP-10K', 71, 'Must inverter', 87500, 87500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 10KVA 48V 150A 500VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 10KVA 48V 150A 500VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv1900-exp-10k-1793437097-88f70234.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"PV1900-EXP-10K","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"10KVA","Rated Voltage":"48V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11279, 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 12KVA 48V 150A 500VDC', 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 12KVA 48V 150A 500VDC', 'must-pv1900-exp-series-6-2-12kw-pv1900-exp-hybrid-inverter-12kva-48v-150a-500vdc', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv1900-exp-series-6-2-12kw-pv1900-exp-hybrid-inverter-12kva-48v-150a-500vdc/', 'PV1900-EXP-12K', 71, 'Must inverter', 106000, 106000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 12KVA 48V 150A 500VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 12KVA 48V 150A 500VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv1900-exp-12k-1793437058-be07084e.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"PV1900-EXP-12K","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"12KVA","Rated Voltage":"48V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11277, 'Must PV3600 PRO Hybrid Inverter - PV3600 PRO Hybrid Inverter 12KVA 48V 200A 250VDC', 'Must PV3600 PRO Hybrid Inverter - PV3600 PRO Hybrid Inverter 12KVA 48V 200A 250VDC', 'must-pv3600-pro-hybrid-inverter-pv3600-pro-hybrid-inverter-12kva-48v-200a-250vdc', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv3600-pro-hybrid-inverter-pv3600-pro-hybrid-inverter-12kva-48v-200a-250vdc/', 'PV3600-PRO-12K', 71, 'Must inverter', 176500, 176500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Must PV3600 PRO Hybrid Inverter - PV3600 PRO Hybrid Inverter 12KVA 48V 200A 250VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'Must PV3600 PRO Hybrid Inverter - PV3600 PRO Hybrid Inverter 12KVA 48V 200A 250VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv3600-pro-12k-1793436927-35e26374.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"PV3600-PRO-12K","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"12KVA","Rated Voltage":"48V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11275, 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 5KVA 48V 80A 250VDC', 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 5KVA 48V 80A 250VDC', 'must-pv2900-hp-series-1-6kw-pv2900-hp-hybrid-inverter-5kva-48v-80a-250vdc', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv2900-hp-series-1-6kw-pv2900-hp-hybrid-inverter-5kva-48v-80a-250vdc/', 'PV2900-HP-5K', 71, 'Must inverter', 69000, 69000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 5KVA 48V 80A 250VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 5KVA 48V 80A 250VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv2900-hp-5k-1793436818-27fd24ec.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"PV2900-HP-5K","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2900 HP","Rated Voltage":"48V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11272, 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 6KVA 48V 80A 250VDC', 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 6KVA 48V 80A 250VDC', 'must-pv2900-hp-series-1-6kw-pv2900-hp-hybrid-inverter-6kva-48v-80a-250vdc', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv2900-hp-series-1-6kw-pv2900-hp-hybrid-inverter-6kva-48v-80a-250vdc/', 'PV2900-HP-6K', 71, 'Must inverter', 75000, 75000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 6KVA 48V 80A 250VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 6KVA 48V 80A 250VDC - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv2900-hp-6k-1793436758-cc884172.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"PV2900-HP-6K","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2900 HP","Rated Voltage":"48V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11259, 'Deye Rack-Mounted Battery Systems - SE-G10.2 LV 51.2V 200AH (DoD 80%)', 'Deye Rack-Mounted Battery Systems - SE-G10.2 LV 51.2V 200AH (DoD 80%)', 'deye-rack-mounted-battery-systems-se-g10-2-lv-51-2v-200ah-dod-80', '', NULL, 'https://shantisdesigns.co.ke/product/deye-rack-mounted-battery-systems-se-g10-2-lv-51-2v-200ah-dod-80/', 'DEYE-SE-G10.2-LV', 41, 'Solar Batteries', 125000, 125000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Deye Rack-Mounted Battery Systems - SE-G10.2 LV 51.2V 200AH (DoD 80%) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Deye Rack-Mounted Battery Systems - SE-G10.2 LV 51.2V 200AH (DoD 80%) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/image_2026-01-26_181107828-7-1-1-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"DEYE-SE-G10.2-LV","Product Category":"Solar Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"200AH","Rated Voltage":"51.2V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11141, 'Allgrand GEL Battery Series - Allgrand GEL Battery 12V 200AH', 'Allgrand GEL Battery Series - Allgrand GEL Battery 12V 200AH', 'allgrand-gel-battery-series-allgrand-gel-battery-12v-200ah', '', NULL, 'https://shantisdesigns.co.ke/product/allgrand-gel-battery-series-allgrand-gel-battery-12v-200ah/', 'ARC-10124', 41, 'Solar Batteries', 35000, 35000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Allgrand GEL Battery Series - Allgrand GEL Battery 12V 200AH - Genuine equipment from Shantis Solar Solutions Kenya.', 'Allgrand GEL Battery Series - Allgrand GEL Battery 12V 200AH - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10124-1793357354-935205af-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Allgrand","Model / SKU":"ARC-10124","Product Category":"Solar Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"200AH","Rated Voltage":"12V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11139, 'Solstar Solar Lighting System - SECURITY WALL LIGHT', 'Solstar Solar Lighting System - SECURITY WALL LIGHT', 'solstar-solar-lighting-system-security-wall-light', '', NULL, 'https://shantisdesigns.co.ke/product/solstar-solar-lighting-system-security-wall-light/', 'ARC-10133', 81, 'SOLAR LIGHTS', 150, 150, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'Solstar Solar Lighting System - SECURITY WALL LIGHT - Genuine equipment from Shantis Solar Solutions Kenya.', 'Solstar Solar Lighting System - SECURITY WALL LIGHT - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/images-12.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10133","Product Category":"SOLAR LIGHTS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11138, 'Solstar Solar Lighting System - HOME LIGHTING SYSTEM', 'Solstar Solar Lighting System - HOME LIGHTING SYSTEM', 'solstar-solar-lighting-system-home-lighting-system', '', NULL, 'https://shantisdesigns.co.ke/product/solstar-solar-lighting-system-home-lighting-system/', 'ARC-10130', 81, 'SOLAR LIGHTS', 3500, 3500, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'Solstar Solar Lighting System - HOME LIGHTING SYSTEM - Genuine equipment from Shantis Solar Solutions Kenya.', 'Solstar Solar Lighting System - HOME LIGHTING SYSTEM - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/04/SOLSTAR-SLT-500-GY-Solar-Lantern-Torch-Pro.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10130","Product Category":"SOLAR LIGHTS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11137, 'Solstar Solar Lighting System - SOLAR LANTERN WITH TORCH', 'Solstar Solar Lighting System - SOLAR LANTERN WITH TORCH', 'solstar-solar-lighting-system-solar-lantern-with-torch', '', NULL, 'https://shantisdesigns.co.ke/product/solstar-solar-lighting-system-solar-lantern-with-torch/', 'ARC-10131', 81, 'SOLAR LIGHTS', 3500, 3500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Solstar Solar Lighting System - SOLAR LANTERN WITH TORCH - Genuine equipment from Shantis Solar Solutions Kenya.', 'Solstar Solar Lighting System - SOLAR LANTERN WITH TORCH - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/SOLSTAR-SLT-500-GY-Solar-Lantern-Torch-Pro-7-2-2-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10131","Product Category":"SOLAR LIGHTS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11136, 'ATTA SOLAR FLOOD LIGHTS - 100W Solar Flood Light', 'ATTA SOLAR FLOOD LIGHTS - 100W Solar Flood Light', 'atta-solar-flood-lights-100w-solar-flood-light', '', NULL, 'https://shantisdesigns.co.ke/product/atta-solar-flood-lights-100w-solar-flood-light/', 'ARC-10127', 81, 'SOLAR LIGHTS', 3500, 3500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ATTA SOLAR FLOOD LIGHTS - 100W Solar Flood Light - Genuine equipment from Shantis Solar Solutions Kenya.', 'ATTA SOLAR FLOOD LIGHTS - 100W Solar Flood Light - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10127-1793357354-7eb7af80.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10127","Product Category":"SOLAR LIGHTS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"100W","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11135, 'ATTA SOLAR FLOOD LIGHTS - 200W Solar Flood Light', 'ATTA SOLAR FLOOD LIGHTS - 200W Solar Flood Light', 'atta-solar-flood-lights-200w-solar-flood-light', '', NULL, 'https://shantisdesigns.co.ke/product/atta-solar-flood-lights-200w-solar-flood-light/', 'ARC-10128', 81, 'SOLAR LIGHTS', 4500, 4500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ATTA SOLAR FLOOD LIGHTS - 200W Solar Flood Light - Genuine equipment from Shantis Solar Solutions Kenya.', 'ATTA SOLAR FLOOD LIGHTS - 200W Solar Flood Light - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10128-1793357354-c1602ee5.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10128","Product Category":"SOLAR LIGHTS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"200W","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11134, 'ATTA SOLAR FLOOD LIGHTS - 300W Solar Flood Light', 'ATTA SOLAR FLOOD LIGHTS - 300W Solar Flood Light', 'atta-solar-flood-lights-300w-solar-flood-light', '', NULL, 'https://shantisdesigns.co.ke/product/atta-solar-flood-lights-300w-solar-flood-light/', 'ARC-10129', 81, 'SOLAR LIGHTS', 5500, 5500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ATTA SOLAR FLOOD LIGHTS - 300W Solar Flood Light - Genuine equipment from Shantis Solar Solutions Kenya.', 'ATTA SOLAR FLOOD LIGHTS - 300W Solar Flood Light - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10129-1793357354-e112415d.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10129","Product Category":"SOLAR LIGHTS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"300W","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11130, 'Allgrand GEL Battery Series - Allgrand GEL Battery 12V 150AH', 'Allgrand GEL Battery Series - Allgrand GEL Battery 12V 150AH', 'allgrand-gel-battery-series-allgrand-gel-battery-12v-150ah', '', NULL, 'https://shantisdesigns.co.ke/product/allgrand-gel-battery-series-allgrand-gel-battery-12v-150ah/', 'ARC-10123', 41, 'Solar Batteries', 24000, 24000, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'Allgrand GEL Battery Series - Allgrand GEL Battery 12V 150AH - Genuine equipment from Shantis Solar Solutions Kenya.', 'Allgrand GEL Battery Series - Allgrand GEL Battery 12V 150AH - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10123-1793357354-4023753d.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Allgrand","Model / SKU":"ARC-10123","Product Category":"Solar Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"150AH","Rated Voltage":"12V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11125, 'Deye Rack-Mounted Battery Systems - BOS-WPDU-2 HV High voltage control box', 'Deye Rack-Mounted Battery Systems - BOS-WPDU-2 HV High voltage control box', 'deye-rack-mounted-battery-systems-bos-wpdu-2-hv-high-voltage-control-box', '', NULL, 'https://shantisdesigns.co.ke/product/deye-rack-mounted-battery-systems-bos-wpdu-2-hv-high-voltage-control-box/', 'ARC-10110', 41, 'Solar Batteries', 143750, 143750, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Deye Rack-Mounted Battery Systems - BOS-WPDU-2 HV High voltage control box - Genuine equipment from Shantis Solar Solutions Kenya.', 'Deye Rack-Mounted Battery Systems - BOS-WPDU-2 HV High voltage control box - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10110-1793357354-85f52a49.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10110","Product Category":"Solar Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11119, 'Deye Three-Phase Hybrid Inverters (High Voltage) - SUN-50K-SGO1HP3-EU-BM4 50000W Battery 160-800V; Max PV 100000W', 'Deye Three-Phase Hybrid Inverters (High Voltage) - SUN-50K-SGO1HP3-EU-BM4 50000W Battery 160-800V; Max PV 100000W', 'deye-three-phase-hybrid-inverters-high-voltage-sun-50k-sgo1hp3-eu-bm4-50000w-battery-160-800v-max-pv-100000w', '', NULL, 'https://shantisdesigns.co.ke/product/deye-three-phase-hybrid-inverters-high-voltage-sun-50k-sgo1hp3-eu-bm4-50000w-battery-160-800v-max-pv-100000w/', 'ARC-10105', 35, 'Solar Inverters', 800000, 800000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Deye Three-Phase Hybrid Inverters (High Voltage) - SUN-50K-SGO1HP3-EU-BM4 50000W Battery 160-800V; Max PV 100000W - Genuine equipment from Shantis Solar Solutions Kenya.', 'Deye Three-Phase Hybrid Inverters (High Voltage) - SUN-50K-SGO1HP3-EU-BM4 50000W Battery 160-800V; Max PV 100000W - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10105-1793357353-0394a3d1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10105","Product Category":"Solar Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1HP","Rated Voltage":"800V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11118, 'Deye Three-Phase Hybrid Inverters (High Voltage) - SUN-80K-SGO2HP3-EU-EM6 80000W; Battery 160-1000V Max PV 160000W', 'Deye Three-Phase Hybrid Inverters (High Voltage) - SUN-80K-SGO2HP3-EU-EM6 80000W; Battery 160-1000V Max PV 160000W', 'deye-three-phase-hybrid-inverters-high-voltage-sun-80k-sgo2hp3-eu-em6-80000w-battery-160-1000v-max-pv-160000w', '', NULL, 'https://shantisdesigns.co.ke/product/deye-three-phase-hybrid-inverters-high-voltage-sun-80k-sgo2hp3-eu-em6-80000w-battery-160-1000v-max-pv-160000w/', 'ARC-10106', 35, 'Solar Inverters', 1187500, 1187500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Deye Three-Phase Hybrid Inverters (High Voltage) - SUN-80K-SGO2HP3-EU-EM6 80000W; Battery 160-1000V Max PV 160000W - Genuine equipment from Shantis Solar Solutions Kenya.', 'Deye Three-Phase Hybrid Inverters (High Voltage) - SUN-80K-SGO2HP3-EU-EM6 80000W; Battery 160-1000V Max PV 160000W - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10106-1793357354-591b52db.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10106","Product Category":"Solar Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2HP","Rated Voltage":"1000V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11117, 'Deye Rack-Mounted Battery Systems - BOS-WPack5.1 HV 51.2V 100AH (DoD 90%)', 'Deye Rack-Mounted Battery Systems - BOS-WPack5.1 HV 51.2V 100AH (DoD 90%)', 'deye-rack-mounted-battery-systems-bos-wpack5-1-hv-51-2v-100ah-dod-90', '', NULL, 'https://shantisdesigns.co.ke/product/deye-rack-mounted-battery-systems-bos-wpack5-1-hv-51-2v-100ah-dod-90/', 'ARC-10109', 41, 'Solar Batteries', 237500, 237500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Deye Rack-Mounted Battery Systems - BOS-WPack5.1 HV 51.2V 100AH (DoD 90%) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Deye Rack-Mounted Battery Systems - BOS-WPack5.1 HV 51.2V 100AH (DoD 90%) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10109-1793357354-837e8c63.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10109","Product Category":"Solar Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"100AH","Rated Voltage":"51.2V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11113, 'Deye Three-Phase Hybrid Inverters (Low Voltage) - SUN-20K-SGO5LP3-EU-SM2 20000W Hybrid; Max PV 40000W; Max Charge 350A', 'Deye Three-Phase Hybrid Inverters (Low Voltage) - SUN-20K-SGO5LP3-EU-SM2 20000W Hybrid; Max PV 40000W; Max Charge 350A', 'deye-three-phase-hybrid-inverters-low-voltage-sun-20k-sgo5lp3-eu-sm2-20000w-hybrid-max-pv-40000w-max-charge-35', '', NULL, 'https://shantisdesigns.co.ke/product/deye-three-phase-hybrid-inverters-low-voltage-sun-20k-sgo5lp3-eu-sm2-20000w-hybrid-max-pv-40000w-max-charge-35/', 'ARC-10103', 35, 'Solar Inverters', 475000, 475000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Deye Three-Phase Hybrid Inverters (Low Voltage) - SUN-20K-SGO5LP3-EU-SM2 20000W Hybrid; Max PV 40000W; Max Charge 350A - Genuine equipment from Shantis Solar Solutions Kenya.', 'Deye Three-Phase Hybrid Inverters (Low Voltage) - SUN-20K-SGO5LP3-EU-SM2 20000W Hybrid; Max PV 40000W; Max Charge 350A - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10103-1793357353-ecc52beb.png', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10103","Product Category":"Solar Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"20000W","Rated Voltage":"380V-415V Three-Phase AC","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11112, 'Deye Three-Phase Hybrid Inverters (Low Voltage) - SUN-15K-SGO5LP3-EU-SM2 15000W Hybrid; Max PV 30000W; Max Charge 280A', 'Deye Three-Phase Hybrid Inverters (Low Voltage) - SUN-15K-SGO5LP3-EU-SM2 15000W Hybrid; Max PV 30000W; Max Charge 280A', 'deye-three-phase-hybrid-inverters-low-voltage-sun-15k-sgo5lp3-eu-sm2-15000w-hybrid-max-pv-30000w-max-charge-28', '', NULL, 'https://shantisdesigns.co.ke/product/deye-three-phase-hybrid-inverters-low-voltage-sun-15k-sgo5lp3-eu-sm2-15000w-hybrid-max-pv-30000w-max-charge-28/', 'ARC-10102', 35, 'Solar Inverters', 365000, 365000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Deye Three-Phase Hybrid Inverters (Low Voltage) - SUN-15K-SGO5LP3-EU-SM2 15000W Hybrid; Max PV 30000W; Max Charge 280A - Genuine equipment from Shantis Solar Solutions Kenya.', 'Deye Three-Phase Hybrid Inverters (Low Voltage) - SUN-15K-SGO5LP3-EU-SM2 15000W Hybrid; Max PV 30000W; Max Charge 280A - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10102-1793357353-940bc8e8.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10102","Product Category":"Solar Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"15000W","Rated Voltage":"380V-415V Three-Phase AC","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11111, 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-16K-SGO1LP1-EU 16000W Hybrid; Max PV 32000W; Max Charge 290A', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-16K-SGO1LP1-EU 16000W Hybrid; Max PV 32000W; Max Charge 290A', 'deye-single-phase-hybrid-inverters-low-voltage-sun-16k-sgo1lp1-eu-16000w-hybrid-max-pv-32000w-max-charge-290a', '', NULL, 'https://shantisdesigns.co.ke/product/deye-single-phase-hybrid-inverters-low-voltage-sun-16k-sgo1lp1-eu-16000w-hybrid-max-pv-32000w-max-charge-290a/', 'ARC-10100', 35, 'Solar Inverters', 387500, 387500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-16K-SGO1LP1-EU 16000W Hybrid; Max PV 32000W; Max Charge 290A - Genuine equipment from Shantis Solar Solutions Kenya.', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-16K-SGO1LP1-EU 16000W Hybrid; Max PV 32000W; Max Charge 290A - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10100-1793357353-f4ff2f42.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10100","Product Category":"Solar Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"16000W","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11102, 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-12K-SG02LP1-EU-AM3 12000W Hybrid; Max PV 24000W; Max Charge 250A', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-12K-SG02LP1-EU-AM3 12000W Hybrid; Max PV 24000W; Max Charge 250A', 'deye-single-phase-hybrid-inverters-low-voltage-sun-12k-sg02lp1-eu-am3-12000w-hybrid-max-pv-24000w-max-charge-2', '', NULL, 'https://shantisdesigns.co.ke/product/deye-single-phase-hybrid-inverters-low-voltage-sun-12k-sg02lp1-eu-am3-12000w-hybrid-max-pv-24000w-max-charge-2/', 'ARC-10099', 35, 'Solar Inverters', 275000, 275000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-12K-SG02LP1-EU-AM3 12000W Hybrid; Max PV 24000W; Max Charge 250A - Genuine equipment from Shantis Solar Solutions Kenya.', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-12K-SG02LP1-EU-AM3 12000W Hybrid; Max PV 24000W; Max Charge 250A - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10099-1793357353-69107fc1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10099","Product Category":"Solar Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"12000W","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11100, 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-10K-SG02LP1-EU-AM3 10000W Hybrid; Max PV 20000W; Max Charge 220A', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-10K-SG02LP1-EU-AM3 10000W Hybrid; Max PV 20000W; Max Charge 220A', 'deye-single-phase-hybrid-inverters-low-voltage-sun-10k-sg02lp1-eu-am3-10000w-hybrid-max-pv-20000w-max-charge-2', '', NULL, 'https://shantisdesigns.co.ke/product/deye-single-phase-hybrid-inverters-low-voltage-sun-10k-sg02lp1-eu-am3-10000w-hybrid-max-pv-20000w-max-charge-2/', 'ARC-10098', 35, 'Solar Inverters', 250000, 250000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-10K-SG02LP1-EU-AM3 10000W Hybrid; Max PV 20000W; Max Charge 220A - Genuine equipment from Shantis Solar Solutions Kenya.', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-10K-SG02LP1-EU-AM3 10000W Hybrid; Max PV 20000W; Max Charge 220A - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10098-1793357353-724172e6-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10098","Product Category":"Solar Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"10000W","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11098, 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-8K-SG05LP1-EU-SM2 8000W Hybrid; Max PV 16000W; Max Charge 190A', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-8K-SG05LP1-EU-SM2 8000W Hybrid; Max PV 16000W; Max Charge 190A', 'deye-single-phase-hybrid-inverters-low-voltage-sun-8k-sg05lp1-eu-sm2-8000w-hybrid-max-pv-16000w-max-charge-190', '', NULL, 'https://shantisdesigns.co.ke/product/deye-single-phase-hybrid-inverters-low-voltage-sun-8k-sg05lp1-eu-sm2-8000w-hybrid-max-pv-16000w-max-charge-190/', 'ARC-10097', 35, 'Solar Inverters', 175000, 175000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-8K-SG05LP1-EU-SM2 8000W Hybrid; Max PV 16000W; Max Charge 190A - Genuine equipment from Shantis Solar Solutions Kenya.', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) - SUN-8K-SG05LP1-EU-SM2 8000W Hybrid; Max PV 16000W; Max Charge 190A - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10097-1793357353-fdf5db6a-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"ARC-10097","Product Category":"Solar Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"8000W","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11096, 'JA Bifacial Solar Panel - JA 620W Bifacial solar panel', 'JA Bifacial Solar Panel - JA 620W Bifacial solar panel', 'ja-bifacial-solar-panel-ja-620w-bifacial-solar-panel', '', NULL, 'https://shantisdesigns.co.ke/product/ja-bifacial-solar-panel-ja-620w-bifacial-solar-panel/', 'ARC-10073', 34, 'Solar Panels', 11160, 11160, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'JA Bifacial Solar Panel - JA 620W Bifacial solar panel - Genuine equipment from Shantis Solar Solutions Kenya.', 'JA Bifacial Solar Panel - JA 620W Bifacial solar panel - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10073-1793357353-fd11b5e3-2.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10073","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"620W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, FALSE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11006, 'Doyin AC Booster Pump - AC Booster Pump CPM 158/1 (1HP)', 'Doyin AC Booster Pump - AC Booster Pump CPM 158/1 (1HP)', 'doyin-ac-booster-pump-ac-booster-pump-cpm-158-1-1hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-booster-pump-ac-booster-pump-cpm-158-1-1hp/', 'ARC-10058', 55, 'Water Pumps', 12000, 12000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Booster Pump - AC Booster Pump CPM 158/1 (1HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Booster Pump - AC Booster Pump CPM 158/1 (1HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10058-1793323585-8f076b1e-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10058","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11004, 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 300W', 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 300W', 'golden-solar-monocrystalline-golden-monocrystalline-solar-300w', '', NULL, 'https://shantisdesigns.co.ke/product/golden-solar-monocrystalline-golden-monocrystalline-solar-300w/', 'ARC-10070', 34, 'Solar Panels', 7500, 7500, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 300W - Genuine equipment from Shantis Solar Solutions Kenya.', 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 300W - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10070-1793323291-da74c06f-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10070","Product Category":"Solar Panels","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"300W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11002, 'Golden Solar Monocrystalline - Golden MonocrystallineSolar 585W', 'Golden Solar Monocrystalline - Golden MonocrystallineSolar 585W', 'golden-solar-monocrystalline-golden-monocrystallinesolar-585w', '', NULL, 'https://shantisdesigns.co.ke/product/golden-solar-monocrystalline-golden-monocrystallinesolar-585w/', 'ARC-10071', 34, 'Solar Panels', 10530, 10530, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'Golden Solar Monocrystalline - Golden MonocrystallineSolar 585W - Genuine equipment from Shantis Solar Solutions Kenya.', 'Golden Solar Monocrystalline - Golden MonocrystallineSolar 585W - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10071-1793323281-ee7273fc-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10071","Product Category":"Solar Panels","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"585W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (11000, 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 200W', 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 200W', 'golden-solar-monocrystalline-golden-monocrystalline-solar-200w', '', NULL, 'https://shantisdesigns.co.ke/product/golden-solar-monocrystalline-golden-monocrystalline-solar-200w/', 'ARC-10069', 34, 'Solar Panels', 5200, 5200, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 200W - Genuine equipment from Shantis Solar Solutions Kenya.', 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 200W - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10069-1793323256-167fff38-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10069","Product Category":"Solar Panels","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"200W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10998, 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 150W', 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 150W', 'golden-solar-monocrystalline-golden-monocrystalline-solar-150w', '', NULL, 'https://shantisdesigns.co.ke/product/golden-solar-monocrystalline-golden-monocrystalline-solar-150w/', 'ARC-10068', 34, 'Solar Panels', 4200, 4200, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 150W - Genuine equipment from Shantis Solar Solutions Kenya.', 'Golden Solar Monocrystalline - Golden Monocrystalline Solar 150W - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10068-1793323224-a493db49-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"ARC-10068","Product Category":"Solar Panels","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"150W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10996, 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 300AH (15.36kWh)', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 300AH (15.36kWh)', 'must-lithium-batteries-lithium-batteries-51-2v-300ah-15-36kwh', '', NULL, 'https://shantisdesigns.co.ke/product/must-lithium-batteries-lithium-batteries-51-2v-300ah-15-36kwh/', 'ARC-10063', 41, 'Solar Batteries', 247000, 247000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 300AH (15.36kWh) - Genuine equipment from Shantis Solar Solutions Kenya.', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 300AH (15.36kWh) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10063-1793323124-2dd99c3e-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"ARC-10063","Product Category":"Solar Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"300AH","Rated Voltage":"51.2V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10994, 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 12.8V 200AH (2.56KWH)', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 12.8V 200AH (2.56KWH)', 'must-lithium-batteries-lithium-batteries-12-8v-200ah-2-56kwh', '', NULL, 'https://shantisdesigns.co.ke/product/must-lithium-batteries-lithium-batteries-12-8v-200ah-2-56kwh/', 'ARC-10062', 41, 'Solar Batteries', 44000, 44000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 12.8V 200AH (2.56KWH) - Genuine equipment from Shantis Solar Solutions Kenya.', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 12.8V 200AH (2.56KWH) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10062-1793320586-2b6c8ac2-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"ARC-10062","Product Category":"Solar Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"200AH","Rated Voltage":"12.8V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10992, 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 200AH (10.24kWh)', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 200AH (10.24kWh)', 'must-lithium-batteries-lithium-batteries-51-2v-200ah-10-24kwh', '', NULL, 'https://shantisdesigns.co.ke/product/must-lithium-batteries-lithium-batteries-51-2v-200ah-10-24kwh/', 'ARC-10061', 41, 'Solar Batteries', 200000, 200000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 200AH (10.24kWh) - Genuine equipment from Shantis Solar Solutions Kenya.', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 200AH (10.24kWh) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10061-1793320522-8a057815-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"ARC-10061","Product Category":"Solar Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"200AH","Rated Voltage":"51.2V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10990, 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 100AH (5.12kWh)', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 100AH (5.12kWh)', 'must-lithium-batteries-lithium-batteries-51-2v-100ah-5-12kwh', '', NULL, 'https://shantisdesigns.co.ke/product/must-lithium-batteries-lithium-batteries-51-2v-100ah-5-12kwh/', 'ARC-10060', 41, 'Solar Batteries', 100000, 100000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 100AH (5.12kWh) - Genuine equipment from Shantis Solar Solutions Kenya.', 'MUST LITHIUM BATTERIES - LITHIUM BATTERIES 51.2V 100AH (5.12kWh) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10060-1793320428-433b374d-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"ARC-10060","Product Category":"Solar Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"100AH","Rated Voltage":"51.2V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10988, 'Doyin AC Well Pump - AC Well Pump SCM8 (2.0HP)', 'Doyin AC Well Pump - AC Well Pump SCM8 (2.0HP)', 'doyin-ac-well-pump-ac-well-pump-scm8-2-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-well-pump-ac-well-pump-scm8-2-0hp/', 'ARC-10055', 55, 'Water Pumps', 29500, 29500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Well Pump - AC Well Pump SCM8 (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Well Pump - AC Well Pump SCM8 (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10055-1793320383-94daf2a1-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10055","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2.0HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10986, 'Doyin AC Booster Pump - AC Booster Pump QBM60 (0.5HP)', 'Doyin AC Booster Pump - AC Booster Pump QBM60 (0.5HP)', 'doyin-ac-booster-pump-ac-booster-pump-qbm60-0-5hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-booster-pump-ac-booster-pump-qbm60-0-5hp/', 'ARC-10057', 55, 'Water Pumps', 5500, 5500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Booster Pump - AC Booster Pump QBM60 (0.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Booster Pump - AC Booster Pump QBM60 (0.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10057-1793320365-e3b45ebb-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10057","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"0.5HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10984, 'Doyin AC Well Pump - AC Well Pump SCM5 (1.25HP)', 'Doyin AC Well Pump - AC Well Pump SCM5 (1.25HP)', 'doyin-ac-well-pump-ac-well-pump-scm5-1-25hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-well-pump-ac-well-pump-scm5-1-25hp/', 'ARC-10054', 55, 'Water Pumps', 22000, 22000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Well Pump - AC Well Pump SCM5 (1.25HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Well Pump - AC Well Pump SCM5 (1.25HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10054-1793320313-4ebcbf48-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10054","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1.25HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10982, 'Doyin Hybrid High Flow Submersible Pump 4SDS7 - Hybrid High Flow Submersible Pump 4SDS7-2200W (3.0HP)', 'Doyin Hybrid High Flow Submersible Pump 4SDS7 - Hybrid High Flow Submersible Pump 4SDS7-2200W (3.0HP)', 'doyin-hybrid-high-flow-submersible-pump-4sds7-hybrid-high-flow-submersible-pump-4sds7-2200w-3-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-high-flow-submersible-pump-4sds7-hybrid-high-flow-submersible-pump-4sds7-2200w-3-0hp/', 'ARC-10052', 55, 'Water Pumps', 57000, 57000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Hybrid High Flow Submersible Pump 4SDS7 - Hybrid High Flow Submersible Pump 4SDS7-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Hybrid High Flow Submersible Pump 4SDS7 - Hybrid High Flow Submersible Pump 4SDS7-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10052-1793320249-9570e1cd-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10052","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2200W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10980, 'Doyin Hybrid High Flow Submersible Pump 4SDS7 - Hybrid High Flow Submersible Pump 4SDS7-1100W (1.5HP)', 'Doyin Hybrid High Flow Submersible Pump 4SDS7 - Hybrid High Flow Submersible Pump 4SDS7-1100W (1.5HP)', 'doyin-hybrid-high-flow-submersible-pump-4sds7-hybrid-high-flow-submersible-pump-4sds7-1100w-1-5hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-high-flow-submersible-pump-4sds7-hybrid-high-flow-submersible-pump-4sds7-1100w-1-5hp/', 'ARC-10051', 55, 'Water Pumps', 48000, 48000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Hybrid High Flow Submersible Pump 4SDS7 - Hybrid High Flow Submersible Pump 4SDS7-1100W (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Hybrid High Flow Submersible Pump 4SDS7 - Hybrid High Flow Submersible Pump 4SDS7-1100W (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10051-1793320217-4a115677-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10051","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1100W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10978, 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI - Heavy-Duty Hybrid Submersible Pump 4SFI-196-7500W (10HP)', 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI - Heavy-Duty Hybrid Submersible Pump 4SFI-196-7500W (10HP)', 'doyin-heavy-duty-hybrid-submersible-pump-4sfi-heavy-duty-hybrid-submersible-pump-4sfi-196-7500w-10hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-heavy-duty-hybrid-submersible-pump-4sfi-heavy-duty-hybrid-submersible-pump-4sfi-196-7500w-10hp/', 'ARC-10049', 55, 'Water Pumps', 160000, 160000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI - Heavy-Duty Hybrid Submersible Pump 4SFI-196-7500W (10HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI - Heavy-Duty Hybrid Submersible Pump 4SFI-196-7500W (10HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10049-1793320085-969d1449-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10049","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"7500W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10975, 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI - Heavy-Duty Hybrid Submersible Pump 4SFI-158-5500W (7.5HP)', 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI - Heavy-Duty Hybrid Submersible Pump 4SFI-158-5500W (7.5HP)', 'doyin-heavy-duty-hybrid-submersible-pump-4sfi-heavy-duty-hybrid-submersible-pump-4sfi-158-5500w-7-5hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-heavy-duty-hybrid-submersible-pump-4sfi-heavy-duty-hybrid-submersible-pump-4sfi-158-5500w-7-5hp/', 'ARC-10048', 55, 'Water Pumps', 140000, 140000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI - Heavy-Duty Hybrid Submersible Pump 4SFI-158-5500W (7.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI - Heavy-Duty Hybrid Submersible Pump 4SFI-158-5500W (7.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10048-1793320053-29073300-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10048","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5500W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10972, 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-3000W (4.0HP)', 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-3000W (4.0HP)', 'doyin-hybrid-submersible-pump-4sds5-hybrid-submersible-pump-4sds5-3000w-4-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-submersible-pump-4sds5-hybrid-submersible-pump-4sds5-3000w-4-0hp/', 'ARC-10046', 55, 'Water Pumps', 59500, 59500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-3000W (4.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-3000W (4.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10046-1793319917-ee8f35d1-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10046","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"3000W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10970, 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-2200W (3.0HP)', 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-2200W (3.0HP)', 'doyin-hybrid-submersible-pump-4sds5-hybrid-submersible-pump-4sds5-2200w-3-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-submersible-pump-4sds5-hybrid-submersible-pump-4sds5-2200w-3-0hp/', 'ARC-10045', 55, 'Water Pumps', 55000, 55000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10045-1793319899-321f6694-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10045","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2200W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10968, 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-1500W (2.0HP)', 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-1500W (2.0HP)', 'doyin-hybrid-submersible-pump-4sds5-hybrid-submersible-pump-4sds5-1500w-2-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-submersible-pump-4sds5-hybrid-submersible-pump-4sds5-1500w-2-0hp/', 'ARC-10044', 55, 'Water Pumps', 50000, 50000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-1500W (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Hybrid Submersible Pump 4SDS5 - Hybrid Submersible Pump 4SDS5-1500W (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10044-1793319879-8380220d-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10044","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1500W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10966, 'Doyin DC Stainless Steel Submersible Pump 4SPS4 - DC Stainless Steel Submersible Pump 4SPS4-5-2200W (3.0HP)', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 - DC Stainless Steel Submersible Pump 4SPS4-5-2200W (3.0HP)', 'doyin-dc-stainless-steel-submersible-pump-4sps4-dc-stainless-steel-submersible-pump-4sps4-5-2200w-3-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-stainless-steel-submersible-pump-4sps4-dc-stainless-steel-submersible-pump-4sps4-5-2200w-3-0hp/', 'ARC-10041', 55, 'Water Pumps', 63000, 63000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 - DC Stainless Steel Submersible Pump 4SPS4-5-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 - DC Stainless Steel Submersible Pump 4SPS4-5-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10041-1793319759-cb21303e-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10041","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2200W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10964, 'Doyin DC Submersible Pump 4SDS5 - DC Submersible Pump 4SDS5-3000W (4.0HP)', 'Doyin DC Submersible Pump 4SDS5 - DC Submersible Pump 4SDS5-3000W (4.0HP)', 'doyin-dc-submersible-pump-4sds5-dc-submersible-pump-4sds5-3000w-4-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-submersible-pump-4sds5-dc-submersible-pump-4sds5-3000w-4-0hp/', 'ARC-10036', 55, 'Water Pumps', 54000, 54000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Submersible Pump 4SDS5 - DC Submersible Pump 4SDS5-3000W (4.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin DC Submersible Pump 4SDS5 - DC Submersible Pump 4SDS5-3000W (4.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10036-1793319606-7123cd43-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10036","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"3000W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10962, 'Doyin Hybrid Submersible Pump 4SD10 - Hybrid Submersible Pump 4SD10-3000W (4.0HP)', 'Doyin Hybrid Submersible Pump 4SD10 - Hybrid Submersible Pump 4SD10-3000W (4.0HP)', 'doyin-hybrid-submersible-pump-4sd10-hybrid-submersible-pump-4sd10-3000w-4-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-submersible-pump-4sd10-hybrid-submersible-pump-4sd10-3000w-4-0hp/', 'ARC-10030', 55, 'Water Pumps', 60000, 60000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Hybrid Submersible Pump 4SD10 - Hybrid Submersible Pump 4SD10-3000W (4.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Hybrid Submersible Pump 4SD10 - Hybrid Submersible Pump 4SD10-3000W (4.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-2-4-2-1-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10030","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"3000W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10961, 'Doyin AC Submersible Pump 4SD3 - AC Submersible Pump 4SD3/40 (4.0HP, 3-Phase)', 'Doyin AC Submersible Pump 4SD3 - AC Submersible Pump 4SD3/40 (4.0HP, 3-Phase)', 'doyin-ac-submersible-pump-4sd3-ac-submersible-pump-4sd3-40-4-0hp-3-phase', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-submersible-pump-4sd3-ac-submersible-pump-4sd3-40-4-0hp-3-phase/', 'ARC-10027', 55, 'Water Pumps', 48500, 48500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Submersible Pump 4SD3 - AC Submersible Pump 4SD3/40 (4.0HP, 3-Phase) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Submersible Pump 4SD3 - AC Submersible Pump 4SD3/40 (4.0HP, 3-Phase) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10027-1793319361-cbe3a56f-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10027","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"4.0HP","Rated Voltage":"380V-415V Three-Phase AC","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10959, 'Doyin AC Submersible Pump 4SDM3 - AC Submersible Pump 4SDM3/13 (1.0HP)', 'Doyin AC Submersible Pump 4SDM3 - AC Submersible Pump 4SDM3/13 (1.0HP)', 'doyin-ac-submersible-pump-4sdm3-ac-submersible-pump-4sdm3-13-1-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-submersible-pump-4sdm3-ac-submersible-pump-4sdm3-13-1-0hp/', 'ARC-10025', 55, 'Water Pumps', 20000, 20000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Submersible Pump 4SDM3 - AC Submersible Pump 4SDM3/13 (1.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Submersible Pump 4SDM3 - AC Submersible Pump 4SDM3/13 (1.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/arc-10025-1793319182-75cb1307-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"ARC-10025","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1.0HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10900, 'Doyin Hybrid Submersible Pump 4SD10 — 4DS10: Hybrid Submersible Pump 4SD10-2200W (3.0HP)', 'Doyin Hybrid Submersible Pump 4SD10 — 4DS10: Hybrid Submersible Pump 4SD10-2200W (3.0HP)', 'doyin-hybrid-submersible-pump-4sd10-4ds10-hybrid-submersible-pump-4sd10-2200w-3-0hp-2', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-submersible-pump-4sd10-4ds10-hybrid-submersible-pump-4sd10-2200w-3-0hp-2/', '12394-S2669-S26-S91', 61, 'Hybrid Submersible Pump', 55500, 55500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Hybrid Submersible Pump 4SD10 — 4DS10: Hybrid Submersible Pump 4SD10-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Hybrid Submersible Pump 4SD10 — 4DS10: Hybrid Submersible Pump 4SD10-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/12394-s2669-s26-s91-1793357353-6101fca5-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12394-S2669-S26-S91","Product Category":"Hybrid Submersible Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2200W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10800, 'Doyin Hybrid Submersible Pump 4SDS5 — Hybrid 4SDS5: Hybrid Submersible Pump 4SDS5-1100W (1.5HP)', 'Doyin Hybrid Submersible Pump 4SDS5 — Hybrid 4SDS5: Hybrid Submersible Pump 4SDS5-1100W (1.5HP)', 'doyin-hybrid-submersible-pump-4sds5-hybrid-4sds5-hybrid-submersible-pump-4sds5-1100w-1-5hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-submersible-pump-4sds5-hybrid-4sds5-hybrid-submersible-pump-4sds5-1100w-1-5hp/', '12386-S2689', 55, 'Water Pumps', 39500, 39500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Hybrid Submersible Pump 4SDS5 — Hybrid 4SDS5: Hybrid Submersible Pump 4SDS5-1100W (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin Hybrid Submersible Pump 4SDS5 — Hybrid 4SDS5: Hybrid Submersible Pump 4SDS5-1100W (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-1-1-3-2-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12386-S2689","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1100W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10796, 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-1500W (2.0HP)', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-1500W (2.0HP)', 'doyin-dc-stainless-steel-submersible-pump-4sps4-4sps4-dc-stainless-steel-submersible-pump-4sps4-5-1500w-2-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-stainless-steel-submersible-pump-4sps4-4sps4-dc-stainless-steel-submersible-pump-4sps4-5-1500w-2-0hp/', '12382-S2684', 55, 'Water Pumps', 53000, 53000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-1500W (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-1500W (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-2-5-2-2-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12382-S2684","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1500W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10794, 'Doyin DC Stainless Steel Submersible Pump 4SPS4 - DC Stainless Steel Submersible Pump 4SPS4-5-1100W (1.5HP)', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 - DC Stainless Steel Submersible Pump 4SPS4-5-1100W (1.5HP)', 'doyin-dc-stainless-steel-submersible-pump-4sps4-4sps4-dc-stainless-steel-submersible-pump-4sps4-5-1100w-1-5hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-stainless-steel-submersible-pump-4sps4-4sps4-dc-stainless-steel-submersible-pump-4sps4-5-1100w-1-5hp/', '12382-S2683', 55, 'Water Pumps', 43000, 43000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 - DC Stainless Steel Submersible Pump 4SPS4-5-1100W (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 - DC Stainless Steel Submersible Pump 4SPS4-5-1100W (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-2-4-2-1-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12382-S2683","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1100W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10792, 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-800W (1.0HP)', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-800W (1.0HP)', 'doyin-dc-stainless-steel-submersible-pump-4sps4-4sps4-dc-stainless-steel-submersible-pump-4sps4-5-800w-1-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-stainless-steel-submersible-pump-4sps4-4sps4-dc-stainless-steel-submersible-pump-4sps4-5-800w-1-0hp/', '12382-S2682', 55, 'Water Pumps', 40000, 40000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-800W (1.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-800W (1.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-2-3-2-2-2-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12382-S2682","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"800W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10788, 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-2200W (3.0HP)', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-2200W (3.0HP)', 'doyin-dc-submersible-pump-4sds5-4sds5-dc-submersible-pump-4sds5-2200w-3-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-submersible-pump-4sds5-4sds5-dc-submersible-pump-4sds5-2200w-3-0hp/', '12375-S2677', 55, 'Water Pumps', 45900, 45900, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-2200W (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-3-6-2-1-2-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12375-S2677","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2200W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10786, 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-1500W (2.0HP)', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-1500W (2.0HP)', 'doyin-dc-submersible-pump-4sds5-4sds5-dc-submersible-pump-4sds5-1500w-2-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-submersible-pump-4sds5-4sds5-dc-submersible-pump-4sds5-1500w-2-0hp/', '12375-S2676', 55, 'Water Pumps', 39000, 39000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-1500W (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-1500W (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-3-5-2-2-2-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12375-S2676","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1500W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10784, 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-1100W (1.5HP)', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-1100W (1.5HP)', 'doyin-dc-submersible-pump-4sds5-4sds5-dc-submersible-pump-4sds5-1100w-1-5hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-submersible-pump-4sds5-4sds5-dc-submersible-pump-4sds5-1100w-1-5hp/', '12375-S2675', 55, 'Water Pumps', 33000, 33000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-1100W (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-1100W (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-3-4-2-2-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12375-S2675","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1100W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10782, 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-800W (1.0HP)', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-800W (1.0HP)', 'doyin-dc-submersible-pump-4sds5-4sds5-dc-submersible-pump-4sds5-800w-1-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-submersible-pump-4sds5-4sds5-dc-submersible-pump-4sds5-800w-1-0hp/', '12375-S2674', 55, 'Water Pumps', 30000, 30000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-800W (1.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-800W (1.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-3-3-2-2-3.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12375-S2674","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"800W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10774, 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/10 (0.75HP)', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/10 (0.75HP)', 'doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-10-0-75hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-10-0-75hp/', '12400-S2662', 55, 'Water Pumps', 17500, 17500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/10 (0.75HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/10 (0.75HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/202210311525457168-9-1-3.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12400-S2662","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"0.75HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10772, 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/7 (0.5HP)', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/7 (0.5HP)', 'doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-7-0-5hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-7-0-5hp/', '12400-S2661', 55, 'Water Pumps', 6000, 6000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/7 (0.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/7 (0.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/202210311525457168-8-1-3.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12400-S2661","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"0.5HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10770, 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/22 (2.0HP)', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/22 (2.0HP)', 'doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-22-2-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-22-2-0hp/', '12400-S2660', 55, 'Water Pumps', 28000, 28000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/22 (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/22 (2.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/202210311525457168-7-1-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12400-S2660","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2.0HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10768, 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/18 (1.5HP)', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/18 (1.5HP)', 'doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-18-1-5hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-18-1-5hp/', '12400-S2659', 55, 'Water Pumps', 24000, 24000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/18 (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/18 (1.5HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/202210311525457168-6-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12400-S2659","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1.5HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10766, 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/30 (3.0HP)', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/30 (3.0HP)', 'doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-30-3-0hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-submersible-pump-4sdm3-4sdm3-ac-submersible-pump-4sdm3-30-3-0hp/', '12400-S2658', 55, 'Water Pumps', 36000, 36000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/30 (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/30 (3.0HP) - Genuine equipment from Shantis Solar Solutions Kenya.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/202210311525457168-5-2-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12400-S2658","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"3.0HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10090, 'Solstar Solar Lighting System — solstar solar: LANTERN TORCH PRO', 'Solstar Solar Lighting System — solstar solar: LANTERN TORCH PRO', 'solstar-solar-lighting-system-solstar-solar-lantern-torch-pro', '', NULL, 'https://shantisdesigns.co.ke/product/solstar-solar-lighting-system-solstar-solar-lantern-torch-pro/', 'WC-10090-10095', 81, 'SOLAR LIGHTS', 3500, 3500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'The Solstar Solar Lighting System is a portable and energy-efficient solar solution ideal for homes, camping, and security use in Kenya. It comes with a solar panel, rechargeable battery, and bright LED lighting. Designed for off-grid use, it provides reliable lighting without electricity bills.
Available now at Shantis Designs Solar Solutions with delivery across Kenya.', 'Solstar Solar Lighting System in Kenya – Portable & Reliable Solar Power Solution
The Solstar Solar Lighting System is a compact, portable, and highly efficient solar solution designed for users who need reliable lighting without depending on electricity. Whether you are in an off-grid location, need backup lighting, or require a portable solution for outdoor use, this system delivers consistent performance.
At Shantis Designs Solar Solutions, we supply genuine Solstar solar lighting systems in Kenya, designed to meet the growing demand for affordable and dependable solar energy solutions in Nairobi and across the country.
Key Features of Solstar Solar Lighting System
Portable Design with Carry Handle
The system is lightweight and comes with a handle, making it easy to carry and move around.
Energy-Efficient Solar Power
Powered by solar energy, it eliminates electricity costs while providing reliable lighting.
Built-in Rechargeable Battery
Stores solar energy for use at night or during power outages.
Bright LED Lighting Output
Provides sufficient lighting for indoor and outdoor use.
Complete Solar Kit
Includes:
Solar panel
Battery unit
LED lights
Charging capability
Applications of Solstar Solar Lighting System in Kenya
This system is highly versatile and widely used across Kenya for:
Home Lighting
Ideal for rural and off-grid homes
Provides lighting for multiple rooms
Security & Outdoor Use
Night security patrol
Outdoor compound lighting
Camping & Outdoor Activities
Portable lighting for camping
Suitable for travel and temporary setups
Why Solstar Solar Lighting Systems Are Popular in Kenya
The demand for portable solar systems in Kenya continues to grow due to:
Increased off-grid living
Need for affordable lighting solutions
Rising electricity costs
Demand for emergency backup power
The Solstar system provides a practical solution for all these needs.
Why Buy from Shantis Designs Solar Solutions?
When you purchase from Shantis Designs Solar Solutions, you get:
Genuine Solstar solar products
Affordable pricing
Expert guidance on solar solutions
Reliable delivery across Kenya
Support for complete solar system setup
We serve customers in Nairobi, Kisumu, Mombasa, Nakuru, Eldoret, and all regions across Kenya.
Best Portable Solar Lighting System in Kenya
If you are searching for the best portable solar lighting system in Kenya, the Solstar solar kit is one of the most reliable and cost-effective options. It is ideal for households, outdoor users, and anyone looking for a simple solar solution without complex installation.
Benefits of Using Solstar Solar Lighting System
No electricity bills
Easy to use and install
Portable and flexible
Reliable lighting during outages
Environmentally friendly
Frequently Asked Questions (FAQ)
How long does the Solstar solar system last?
The system can last several years with proper use, while the battery typically lasts 2–4 years.
Can it charge phones?
Yes, most Solstar systems include phone charging capability.
Is it suitable for indoor use?
Yes, it is designed for both indoor and outdoor lighting.
Does it work during cloudy days?
Yes, but performance depends on how much solar charge is stored.
Conclusion – Simple, Portable Solar Power
The Solstar Solar Lighting System in Kenya is a reliable and affordable solution for anyone looking for portable solar lighting. Whether for home use, outdoor activities, or backup power, it offers convenience, efficiency, and long-term savings.
👉 Get yours today from Shantis Designs Solar Solutions with nationwide delivery.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/SOLSTAR-SLT-500-GY-Solar-Lantern-Torch-Pro-7-2-2-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"WC-10090-10095","Product Category":"SOLAR LIGHTS","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (10081, 'ATTA SOLAR FLOOD LIGHTS — Atta Solar Flood Lights: 60W Solar Flood Light', 'ATTA SOLAR FLOOD LIGHTS — Atta Solar Flood Lights: 60W Solar Flood Light', 'atta-solar-flood-lights-atta-solar-flood-lights-60w-solar-flood-light', '', NULL, 'https://shantisdesigns.co.ke/product/atta-solar-flood-lights-atta-solar-flood-lights-60w-solar-flood-light/', 'WC-10081-10082', 73, 'Solar LED Flood Light', 1750, 1750, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Powerful and energy-efficient ATTA Solar LED Flood Lights available in Kenya (60W–300W). Designed for outdoor security and lighting, these solar flood lights come with a solar panel, remote control, and IP65 waterproof protection. Ideal for homes, businesses, compounds, and farms.
Available now at Shantis Designs Solar Solutions with nationwide delivery.', 'ATTA Solar LED Flood Light in Kenya – Reliable Outdoor Solar Lighting
The ATTA Solar LED Flood Light is a high-performance outdoor lighting solution designed to provide bright, reliable, and cost-effective illumination without electricity bills. Whether you need security lighting for your home, business, or farm, this solar flood light delivers consistent performance powered entirely by solar energy.
At Shantis Designs Solar Solutions, we supply genuine ATTA Solar LED Flood Lights in Kenya, available in multiple wattage options including 60W, 100W, 200W, and 300W. These lights are ideal for both residential and commercial use across Nairobi and the rest of Kenya.
Available ATTA Solar Flood Light Options & Prices
Choose the right power level based on your lighting needs:
60W Solar Flood Light
100W Solar Flood Light
200W Solar Flood Light
300W Solar Flood Light
All models include a solar panel, battery system, and remote control for easy operation.
Key Features of ATTA Solar LED Flood Lights
High Brightness LED Output
Provides powerful illumination suitable for outdoor security, compounds, and large spaces.
IP65 Waterproof Protection
Designed to withstand rain, dust, and harsh outdoor conditions common in Kenya.
Solar Powered – No Electricity Bills
Runs entirely on solar energy, making it a cost-effective lighting solution.
Long Battery Life
Built-in rechargeable battery ensures long hours of lighting after full charge.
Remote Control Operation
Easily control brightness, timing, and power settings.
Solar Panel Included
Comes as a complete system ready for installation.
Applications of ATTA Solar Flood Lights in Kenya
The ATTA Solar LED Flood Light is ideal for:
Residential Use
Home compounds
Gardens and driveways
Security lighting
Commercial Use
Shops and business premises
Warehouses
Parking areas
Agricultural & Rural Use
Farms and livestock areas
Remote off-grid homes
Perimeter lighting
Why Choose ATTA Solar LED Flood Lights?
Compared to traditional lighting, ATTA Solar Flood Lights offer:
Zero electricity costs
Easy installation (no wiring required)
Low maintenance
Reliable performance in Kenyan weather
Environmentally friendly lighting solution
Why Buy from Shantis Designs Solar Solutions?
When you buy from Shantis Designs Solar Solutions, you get:
Genuine ATTA Solar Flood Lights
Affordable and competitive pricing
Expert guidance on product selection
Nationwide delivery across Kenya
Reliable customer support
We provide trusted solar solutions for homes and businesses in Nairobi, Kisumu, Mombasa, Nakuru, Eldoret, and beyond.
Best Solar Flood Lights in Kenya
If you are searching for the best solar flood lights in Kenya, ATTA Solar LED Flood Lights stand out due to their durability, brightness, and affordability. They are widely used for both residential and commercial applications and offer excellent value for money.
Frequently Asked Questions (FAQ)
How long do ATTA solar flood lights last?
LED lights can last over 50,000 hours, while batteries typically last 3–5 years depending on usage.
Are these lights waterproof?
Yes, they are IP65 rated, making them suitable for outdoor use in all weather conditions.
Do they work during cloudy days?
Yes, but performance depends on solar charging levels.
Can I install them myself?
Yes, they are easy to install and come as a complete kit.
Conclusion – Smart Outdoor Lighting Solution
The ATTA Solar LED Flood Light in Kenya is a reliable, affordable, and energy-efficient solution for outdoor lighting. With multiple wattage options, durable construction, and solar-powered convenience, it is an excellent choice for anyone looking to improve security and visibility.
👉 Contact Shantis Designs Solar Solutions today to order your solar flood light and enjoy nationwide delivery.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-06-06-at-17.06.13-1-10-2-2-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"WC-10081-10082","Product Category":"Solar LED Flood Light","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"60W","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9909, 'Allgrand Lithium Battery (12V 200AH)', 'Allgrand Lithium Battery (12V 200AH)', 'allgrand-lithium-battery-12v-200ah-9909', '', NULL, 'https://shantisdesigns.co.ke/product/allgrand-lithium-battery-12v-200ah-9909/', 'SD-9909', 173, 'All Grand Batteries', 45000, 45000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'This is the premium choice for those seeking high efficiency and longevity. Utilizing Lithium Iron Phosphate (LiFePO4) technology, it offers superior performance over traditional batteries.


Longer Cycle Life: Lasts significantly longer (up to 10x more cycles) than GEL batteries.


Lightweight & Compact: Much easier to install and handle compared to lead-acid alternatives.


Fast Charging: Higher charge efficiency allows the battery to reach full capacity much faster.


Constant Power: Provides steady voltage throughout the discharge cycle.


Best For: High-use solar systems, electric vehicles, and premium backup power where long-term value is a priority.', 'This is the premium choice for those seeking high efficiency and longevity. Utilizing Lithium Iron Phosphate (LiFePO4) technology, it offers superior performance over traditional batteries.


Longer Cycle Life: Lasts significantly longer (up to 10x more cycles) than GEL batteries.


Lightweight & Compact: Much easier to install and handle compared to lead-acid alternatives.


Fast Charging: Higher charge efficiency allows the battery to reach full capacity much faster.


Constant Power: Provides steady voltage throughout the discharge cycle.


Best For: High-use solar systems, electric vehicles, and premium backup power where long-term value is a priority.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/78662821_NjIwLTQ2NS1lMjVmZGVkN2Qz-2-2-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Allgrand","Model / SKU":"SD-9909","Product Category":"All Grand Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"200AH","Rated Voltage":"12V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9901, 'Allgrand GEL Battery Series — Allgrand: Allgrand GEL Battery 12V 100AH', 'Allgrand GEL Battery Series — Allgrand: Allgrand GEL Battery 12V 100AH', 'allgrand-gel-battery-series-allgrand-allgrand-gel-battery-12v-100ah', '', NULL, 'https://shantisdesigns.co.ke/product/allgrand-gel-battery-series-allgrand-allgrand-gel-battery-12v-100ah/', 'WC-9901-9902', 173, 'All Grand Batteries', 18650, 18650, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'These deep-cycle GEL batteries are engineered for reliable, maintenance-free power storage. They are ideal for solar energy systems and backup power solutions in Kenya''s climate.


Maintenance-Free: Sealed design eliminates the need for acid top-ups.


Deep Discharge Recovery: Excellent recovery from deep discharge, ensuring a longer lifespan compared to standard lead-acid batteries.


Robust Build: Highly resistant to vibration and temperature fluctuations, making them perfect for residential and commercial solar setups.


Best For: Home lighting, TV, fans, and small-to-medium solar installations.', 'These deep-cycle GEL batteries are engineered for reliable, maintenance-free power storage. They are ideal for solar energy systems and backup power solutions in Kenya''s climate.


Maintenance-Free: Sealed design eliminates the need for acid top-ups.


Deep Discharge Recovery: Excellent recovery from deep discharge, ensuring a longer lifespan compared to standard lead-acid batteries.


Robust Build: Highly resistant to vibration and temperature fluctuations, making them perfect for residential and commercial solar setups.


Best For: Home lighting, TV, fans, and small-to-medium solar installations.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/ALLGRAND-GEL-BATTERY-100AH-12V-1-2-2-2-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"Allgrand","Model / SKU":"WC-9901-9902","Product Category":"All Grand Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"100AH","Rated Voltage":"12V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9865, 'Eastman  Batteries 5.12kWh (Rack Mount)', 'Eastman  Batteries 5.12kWh (Rack Mount)', 'eastman-batteries-5-12kwh-rack-mount-9865', '', NULL, 'https://shantisdesigns.co.ke/product/eastman-batteries-5-12kwh-rack-mount-9865/', 'SD-9865', 172, 'EASTMAN BATTERIES', 113500, 113500, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'For Shantis Designs Solar, the Eastman 5.12kWh Rack Mount LiFePO4 Battery (ES51.2V-100LP) is the professional choice for scalable energy storage.
While the wall-mount version is great for individual homes, the Rack Mount series is preferred for high-capacity systems where you need to stack multiple batteries neatly in a server cabinet. This is the "Industry Standard" for commercial offices, large estates, and telecom setups.
Product Overview

Professional Grade. Modular. High-Density Storage.
The Eastman 5.12kWh Rack Mount Lithium Battery is engineered for precision and performance. Designed to fit into standard 19-inch server racks, this 48V (51.2V) 100Ah unit is the building block of a robust power system. It features a high-performance Smart BMS and advanced LiFePO4 chemistry, offering over 6,000 cycles and 10+ years of maintenance-free service. Its modular design allows you to start with one unit and expand seamlessly as your energy needs grow.', 'For Shantis Designs Solar, the Eastman 5.12kWh Rack Mount LiFePO4 Battery (ES51.2V-100LP) is the professional choice for scalable energy storage.
While the wall-mount version is great for individual homes, the Rack Mount series is preferred for high-capacity systems where you need to stack multiple batteries neatly in a server cabinet. This is the "Industry Standard" for commercial offices, large estates, and telecom setups.
Product Overview

Professional Grade. Modular. High-Density Storage.
The Eastman 5.12kWh Rack Mount Lithium Battery is engineered for precision and performance. Designed to fit into standard 19-inch server racks, this 48V (51.2V) 100Ah unit is the building block of a robust power system. It features a high-performance Smart BMS and advanced LiFePO4 chemistry, offering over 6,000 cycles and 10+ years of maintenance-free service. Its modular design allows you to start with one unit and expand seamlessly as your energy needs grow.
Key Performance Features



Modular "Stack & Grow" Design: Specifically designed for easy integration. These units slide into standard battery racks, allowing for a clean, organized installation that can be expanded up to 16 units in parallel (81.9kWh total).


Superior Thermal Management: Rack mounting allows for better airflow around the battery casing compared to wall-mounted units. This keeps the cells cooler during high-discharge periods (like running a borehole pump or AC), significantly extending the battery''s lifespan.


6,000+ Deep Cycles: Built for longevity, providing over a decade of daily use at 80% Depth of Discharge. This makes it a far more cost-effective investment than even the best tubular batteries.



Intelligent BMS Communication: Equipped with RS485 and CAN ports, the battery talks directly to your Eastman 5.5kW or 8kW inverter. This ensures the inverter knows the exact State of Charge (SoC) and temperature, preventing any risk of overcharging.


100A Continuous Discharge: Capable of delivering a steady 5.12kW of power on its own. If you have two in parallel, they can easily handle the massive startup surge of industrial motors or large domestic appliances.



Maintenance-Free & Eco-Friendly: No acid top-ups, no gas emissions, and no risk of leaks. It’s clean energy storage that is safe for indoor office or home environments.



Technical Specifications



Feature
Specification




Model
ES51.2V-100LP (Rack Type)


Nominal Energy
5.12 kWh


Nominal Voltage
51.2V DC


Nominal Capacity
100 Ah


Standard Charge Current
50A


Max. Discharge Current
100A (Continuous)


Cycle Life
≥6,000 Cycles @ 80% DoD


Dimensions
Approx. 440mm x 440mm x 133mm (3U Rack Height)


Weight
Approx. 45 kg


Warranty
5 Years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-31-at-16.52.40-4-2-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"Eastman","Model / SKU":"SD-9865","Product Category":"EASTMAN BATTERIES","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.12kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9862, 'Eastman  Batteries 5.12kWh (Wall Mount)', 'Eastman  Batteries 5.12kWh (Wall Mount)', 'eastman-batteries-5-12kwh-wall-mount-9862', '', NULL, 'https://shantisdesigns.co.ke/product/eastman-batteries-5-12kwh-wall-mount-9862/', 'SD-9862', 172, 'EASTMAN BATTERIES', 113500, 113500, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'For Shantis Designs Solar, the Eastman 5.12kWh LiFePO4 Wall Mount (ES51.2-100BS/LP) represents the premium tier of energy storage. Moving away from tubular batteries to this "Powerwall" style unit offers your clients a space-saving, high-tech solution with a lifespan of over 10 years.
Product Overview

Sleek. Modular. Indestructible. The Ultimate 48V Storage Solution.
The Eastman 5.12kWh Lithium (LiFePO4) Wall Mount Battery is a high-density energy storage unit designed for modern Kenyan homes. Built with Grade-A Lithium Iron Phosphate cells, this battery provides a consistent 51.2V output, making it perfectly compatible with the Eastman 5.5kW and 8kW inverters. Its wall-mounted design frees up floor space, while the integrated Smart BMS ensures the battery communicates directly with your inverter for optimized charging and safety.', 'Key Performance Features



6,000+ Deep Cycles: Unlike lead-acid batteries that last 2–3 years, the Eastman Lithium series is rated for over 6,000 cycles at 80% Depth of Discharge. In a typical home, this translates to 10–15 years of daily use.


Space-Saving Wall Mount: Designed to be mounted vertically, it eliminates the need for bulky battery racks. Its clean, white aesthetic fits perfectly in garages, utility rooms, or even hallways.


100% Usable Power (High DoD): You can safely discharge this battery up to 90%–95% without damaging the cells. A traditional 200Ah tubular battery only gives you about 50% usable power to stay healthy.


Integrated Smart BMS: The "Brain" of the battery protects against:


Over-charging / Over-discharging.


Short circuits and thermal runaway.


Cell imbalance (ensuring all internal cells age at the same rate).




Rapid Charging: Supports a 1C/1C charge and discharge rate, meaning it can be fully charged in just 2 hours if your solar array or grid supply is strong enough.


Parallel Scalability: Need more storage? You can parallel up to 16 units, expanding your total capacity to a massive 81.92kWh for large estates or commercial mini-grids.


Technical Specifications



Feature
Specification




Model
ES51.2-100BS / ES51.2-100LP


Nominal Energy
5.12 kWh


Nominal Voltage
51.2V DC (Standard 48V System)


Nominal Capacity
100 Ah


Chemistry
LiFePO4 (Lithium Iron Phosphate)


Standard Charge Current
50A


Max Discharge Current
100A (Continuous)


Communication
RS485 / CAN (for Inverter Sync)


Cycle Life
&gt;6,000 Cycles @ 80% DoD


Weight
Approx. 43kg – 45kg', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-31-at-16.52.40-5-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"Eastman","Model / SKU":"SD-9862","Product Category":"EASTMAN BATTERIES","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.12kW","Rated Voltage":"230V AC / 48V DC Nominal","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9856, 'Eastman Inverters 5.5kW', 'Eastman Inverters 5.5kW', 'eastman-inverters-5-5kw-9856', '', NULL, 'https://shantisdesigns.co.ke/product/eastman-inverters-5-5kw-9856/', 'SD-9856', 171, 'Eastman Inverter', 53500, 53500, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'Product Overview

High-Capacity Hybrid Power. 48V Efficiency. Total Energy Independence. The Eastman 5.5kW (5500W) Hybrid Solar Inverter is a heavy-duty energy management system designed for large residential homes and commercial offices. Operating on a high-efficiency 48V battery architecture, it features a massive 100A MPPT charge controller capable of handling large solar arrays. This unit is built to provide seamless, "UPS-grade" backup power, ensuring that even your most demanding appliances stay running during grid outages.', 'This 5.5kW model is the "Standard for Modern Homes" in Kenya. It is powerful enough to handle high-draw appliances like washing machines, large fridges, and borehole pumps, making it the perfect upgrade for clients who have outgrown 3kW systems.
Key Performance Features


Massive 100A MPPT Controller: This built-in controller is one of the largest in its class, allowing you to connect up to 5500W – 6000W of solar panels. It optimizes energy harvest even in low-light conditions.



48V Industrial System: By utilizing a 48V battery bank (typically 4x 12V batteries in series), the system operates at lower current levels. This means less heat, smaller cable requirements, and significantly higher efficiency for heavy loads.



Seamless UPS Functionality: With a transfer time of just 10ms, this inverter acts as a high-capacity UPS. Your computers, servers, and TVs won''t even flicker when the grid drops out.


High PV Input Voltage: Supports a wide PV input range (typically up to 450V – 500V DC), allowing you to string your panels together in a way that minimizes wiring costs and maximizes performance.



Pure Sine Wave Reliability: Essential for high-torque motors and sensitive electronics. It ensures your borehole pumps, microwave ovens, and laser printers run smoothly without humming or overheating.


Smart Monitoring & ECO Mode: Includes a WiFi Dongle option for 24/7 remote monitoring via a smartphone app. The "ECO Mode" intelligently prioritizes solar energy to minimize your KPLC bills.




Technical Specifications







Feature
Specification




Rated Power
5500W (5.5kW Continuous)


System Voltage
48V DC


Surge Power
11,000VA (for motor startups)


Solar Charger Type
100A MPPT


Max PV Input Voltage
450V DC – 500V DC


Battery Compatibility
Lithium (LiFePO4) & Tubular (Lead-Acid)


Transfer Time
10ms (Standard UPS mode)


Waveform
Pure Sine Wave', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/EM-3k-5kva-600x600-1-1-2-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Eastman","Model / SKU":"SD-9856","Product Category":"Eastman Inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"5.5kW","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9852, 'Eastman  Inverters 3.2kW', 'Eastman  Inverters 3.2kW', 'eastman-inverters-3-2kw-9852', '', NULL, 'https://shantisdesigns.co.ke/product/eastman-inverters-3-2kw-9852/', 'SD-9852', 171, 'Eastman Inverter', 36000, 36000, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'For your Shantis Designs Solar inventory, the Eastman 3.2kW Hybrid Inverter is a powerhouse for mid-sized residential and commercial off-grid setups. It is frequently paired with Eastman''s legendary tubular batteries to create a "zero-maintenance" energy hub.

Smart Power Management. Pure Sine Wave Stability. Hybrid Versatility.
The Eastman 3.2kW (3200VA) Hybrid Solar Inverter is a high-performance energy brain designed to bridge the gap between solar panels, batteries, and the grid. Operating on a 24V system, it features a built-in 80A MPPT charge controller that extracts maximum energy even on cloudy Kenyan days. Whether you are running a home office in Nairobi or a shop in a rural area, this inverter ensures your sensitive electronics receive clean, stable power while prioritizing free solar energy.', 'Key Performance Features



80A High-Speed MPPT: Unlike cheaper PWM controllers, this built-in MPPT can handle a wide PV input range (up to 450VDC or 500VDC depending on the specific sub-model), allowing you to string more panels in series for better efficiency.


24V Battery System: Optimized for a pair of 12V batteries (like the Eastman 220Ah Tubular). This 24V configuration reduces current loss compared to 12V systems, making it more efficient for running heavier loads.


Pure Sine Wave Output: Delivers "utility-grade" power, which is essential for protecting sensitive appliances like modern refrigerators, LED TVs, laptops, and borehole pumps from electrical humming or damage.


Smart Power Prioritization: You can program the inverter to follow your lifestyle:


Solar First: Uses the sun during the day and only switches to battery at night.


SBU (Solar-Battery-Utility): The ultimate off-grid mode that only uses the grid as a last resort if both sun and battery are depleted.




Integrated WiFi Monitoring (Optional): Many of the latest 3.2kW Eastman/Amizar models allow you to track your energy production and consumption in real-time via a smartphone app.


Cold Start Function: The inverter can "kickstart" the system directly from the batteries even if the grid is down and the sun isn''t out yet.


Technical Specifications



Feature
Specification




Rated Power
3200W (3.2kW Continuous)


System Voltage
24V DC


Surge Power
6400VA (for starting motors/fridges)


Solar Charger Type
80A MPPT


Max PV Array Power
3000W – 4000W (Model dependent)


Max PV Input Voltage
450V DC – 500V DC (High-voltage string support)


Efficiency
≥ 93%


Transfer Time
10ms (PC) / 20ms (Home Appliances)


Waveform
Pure Sine Wave', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/EM-3k-5kva-600x600-1-3-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Eastman","Model / SKU":"SD-9852","Product Category":"Eastman Inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"3.2kW","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9754, 'Deye Rack-Mounted Battery Systems — Deye: SE-G5.1 LV 51.2V 100AH (DoD 80%)', 'Deye Rack-Mounted Battery Systems — Deye: SE-G5.1 LV 51.2V 100AH (DoD 80%)', 'deye-rack-mounted-battery-systems', '', NULL, 'https://shantisdesigns.co.ke/product/deye-rack-mounted-battery-systems/', 'WC-9754-9755', 167, 'Deye Mounted Battery Systems', 125000, 125000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Available in both standard 51.2V (Low Voltage) and High Voltage configurations for different inverter pairings.', 'Available in both standard 51.2V (Low Voltage) and High Voltage configurations for different inverter pairings.



Model
Type
Capacity / Voltage





SE-G5.1
LV
51.2V 100AH (DoD 80%)



SE-G10.2
LV
51.2V 200AH (DoD 80%)



BOS-WPack5.1
HV
51.2V 100AH (DoD 90%)



BOS-WPDU-2
HV
High voltage control box', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/image_2026-01-26_181107828-7-1-1-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"WC-9754-9755","Product Category":"Deye Mounted Battery Systems","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"100AH","Rated Voltage":"51.2V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9745, 'Deye Three-Phase Hybrid Inverters (High Voltage) — Deye: SUN-30K-SGO1HP3-EU-BM 30000W Battery 160-800V; Max PV 60000W', 'Deye Three-Phase Hybrid Inverters (High Voltage) — Deye: SUN-30K-SGO1HP3-EU-BM 30000W Battery 160-800V; Max PV 60000W', 'deye-three-phase-hybrid-inverters-high-voltage', '', NULL, 'https://shantisdesigns.co.ke/product/deye-three-phase-hybrid-inverters-high-voltage/', 'WC-9745-9746', 165, 'Deye Inverters', 675000, 675000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Heavy-duty industrial units using high-voltage battery banks (up to 1000V) for maximum efficiency.







Model
Specification Highlights





SUN-30K-', 'Heavy-duty industrial units using high-voltage battery banks (up to 1000V) for maximum efficiency.







Model
Specification Highlights





SUN-30K-SGO1HP3-EU-BM
30000W; Battery 160-800V; Max PV 60000W



SUN-50K-SGO1HP3-EU-BM4
50000W; Battery 160-800V; Max PV 100000W



SUN-80K-SGO2HP3-EU-EM6
80000W; Battery 160-1000V; Max PV 160000W', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/image_2026-01-26_180321476-1-1-1-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"WC-9745-9746","Product Category":"Deye Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1HP","Rated Voltage":"800V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9736, 'Deye Three-Phase Hybrid Inverters (Low Voltage) — deye: SUN-12K-SG05LP3-EU-SM2 12000W Hybrid; Max PV 24000W; Max Charge 240A', 'Deye Three-Phase Hybrid Inverters (Low Voltage) — deye: SUN-12K-SG05LP3-EU-SM2 12000W Hybrid; Max PV 24000W; Max Charge 240A', 'deye-three-phase-hybrid-inverters-low-voltage', '', NULL, 'https://shantisdesigns.co.ke/product/deye-three-phase-hybrid-inverters-low-voltage/', 'WC-9736-9737', 165, 'Deye Inverters', 325000, 325000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Designed for larger homes or light commercial use, these 48V systems support up to 10 units in parallel.







Model
Specification Highlights





SU', 'Designed for larger homes or light commercial use, these 48V systems support up to 10 units in parallel.







Model
Specification Highlights





SUN-12K-SG05LP3-EU-SM2
12000W Hybrid; Max PV 24000W; Max Charge 240A



SUN-15K-SGO5LP3-EU-SM2
15000W Hybrid; Max PV 30000W; Max Charge 280A



SUN-20K-SGO5LP3-EU-SM2
20000W Hybrid; Max PV 40000W; Max Charge 350A', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/image_2026-01-26_175356173-1-1-1-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"WC-9736-9737","Product Category":"Deye Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"12000W","Rated Voltage":"380V-415V Three-Phase AC","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (9724, 'DEYE Single-Phase Hybrid Inverters (Low Voltage) — Deye: SUN-6K-OG01LP1-EU-AM2 6000W Off-Grid; Max PV 12000W; Max Charge 135A', 'DEYE Single-Phase Hybrid Inverters (Low Voltage) — Deye: SUN-6K-OG01LP1-EU-AM2 6000W Off-Grid; Max PV 12000W; Max Charge 135A', 'deye-single-phase-hybrid-inverters-low-voltage', '', NULL, 'https://shantisdesigns.co.ke/product/deye-single-phase-hybrid-inverters-low-voltage/', 'WC-9724-9725', 165, 'Deye Inverters', 100000, 100000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'These are ideal for residential setups, supporting 48V battery systems and up to 16 units in parallel.', 'LV single phase Off-Grid IP65 Max 16 pcs parallel
These are ideal for residential setups, supporting 48V battery systems and up to 16 units in parallel.







Model
Specification Highlights





SUN-6K-OG01LP1-EU-AM2
6000W Off-Grid; Max PV 12000W; Max Charge 135A



SUN-8K-SG05LP1-EU-SM2
8000W Hybrid; Max PV 16000W; Max Charge 190A



SUN-10K-SG02LP1-EU-AM3
10000W Hybrid; Max PV 20000W; Max Charge 220A



SUN-12K-SG02LP1-EU-AM3
12000W Hybrid; Max PV 24000W; Max Charge 250A



SUN-16K-SGO1LP1-EU
16000W Hybrid; Max PV 32000W; Max Charge 290A', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/D1-1-1-1-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Deye","Model / SKU":"WC-9724-9725","Product Category":"Deye Inverters","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"6000W","Rated Voltage":"230V AC / 48V DC Nominal","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (2221, 'ALLTOP 150W Slim Aluminum Floodlight (0358A)', 'ALLTOP 150W Slim Aluminum Floodlight (0358A)', 'alp-0358a150-01-6000', '', NULL, 'https://shantisdesigns.co.ke/product/alp-0358a150-01-6000/', 'SD-2221', 73, 'Solar LED Flood Light', 8850, 8850, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Ultra-Slim Profile. Premium Aluminum Cooling. High-Output Precision. The ALLTOP 150W Slim Aluminum Floodlight (0358A150-01) combines modern architectural design with professional-grade performance. Engineered with a compact die-cast aluminum housing for superior heat dissipation, this light features 144 high-efficacy 2835 LED chips delivering a sharp, bright glow. With its sleek 43mm thickness and IP65 weatherproof rating, it is the perfect solution for upscale residential security and garden illumination where aesthetics matter as much as brightness.', 'Elegance Meets Performance
At Shantis Designs Solar, we recommend the 0358 Slim Series for clients who find traditional floodlights too bulky for their walls or eaves. This unit packs 150W of power into a streamlined frame that is less than 5cm thick. By utilizing Die-cast Aluminum instead of plastic, the 0358A dissipates heat 90% more effectively, ensuring the LEDs maintain their peak brightness for over 50,000 hours of use.

Key Performance Features:


Sleek "Slimline" Design: Measuring only 272 x 260 x 43mm, this light provides a minimalist look that blends into modern building facades, making it ideal for showrooms, porch lighting, and luxury villas.



144 High-Efficiency LEDs: The array of 2835 SMD LED chips provides a wide, uniform beam. With an efficacy of 160 lm/w, it delivers a punchy 6000K daylight beam that effectively covers driveways and backyards.



Rapid-Charge Solar Engine: Paired with a 6V 18W Polycrystalline panel, the system is sized to reach a full charge in just 6–8 hours of sunlight, even in the partially shaded environments of urban gardens.



LiFePO4 Battery Safety: Powered by a 3.2V 14AH Lithium Iron Phosphate battery. This chemistry is known for its stability and high temperature resistance, ensuring the unit won''t swell or degrade in the Kenyan sun.



All-Weather Resilience: Rated IP65, the unit is fully sealed against dust and high-pressure water jets from rain or garden hoses. The tempered glass cover is impact-resistant and easy to clean.



Dual-Day Backup: The intelligent controller manages power distribution to ensure the light stays functional for up to 2 rainy days (30+ hours) on a single full charge.


Technical Specifications:


Model: ALP 0358A150-01



Rated Power: 150W



LED Chips: 144 PCS (2835 LED)


Solar Panel: 6V / 18W Polycrystalline



Battery: LiFePO4 3.2V 14AH



Material: Die-cast Aluminum + Tempered Glass



Luminous Efficiency: 160 lm/w


Charging Time: 6–8 Hours



Discharging Time: 2 Rainy Days (30–36 Hours)


Product Size: 272.5mm x 260mm x 43mm



Recommended Install Height: 3–5 Meters


Warranty: 3 Years', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/image_2025-12-31_032849725-1-1.png', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"SD-2221","Product Category":"Solar LED Flood Light","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"150W","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (2217, 'FLOODLIGHT CAMERA ALP 0222 Series — FLOOD - ALP 0222A100-01', 'FLOODLIGHT CAMERA ALP 0222 Series — FLOOD - ALP 0222A100-01', 'alp-0222a100-01', '', NULL, 'https://shantisdesigns.co.ke/product/alp-0222a100-01/', 'WC-2217-2779', 73, 'Solar LED Flood Light', 10000, 10000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Secure your property with the next generation of surveillance from Shanti’s Designs Solar. The ALP 0222 Series combines high-intensity LED floodlighting with a crystal-clear 2K HD smart camera—all powered by 100% clean solar energy.
Whether you need a compact light for a side alley or a high-wattage powerhouse for an industrial yard, this series offers the perfect balance of deterrence and documentation.', 'Secure your property with the next generation of surveillance from Shanti’s Designs Solar. The ALP 0222 Series combines high-intensity LED floodlighting with a crystal-clear 2K HD smart camera—all powered by 100% clean solar energy.
Whether you need a compact light for a side alley or a high-wattage powerhouse for an industrial yard, this series offers the perfect balance of deterrence and documentation.

Choose Your Power Level







Model Number
Floodlight Wattage
Coverage Area
Best For




ALP 0222A100-01
100W
Up to 80 sq. m
Residential porches, backyards, & small garages.


ALP 0222B200-01
200W
Up to 150 sq. m
Large driveways, warehouses, & storefronts.


ALP 0222D400-01
400W
Up to 300 sq. m
Perimeter security, farmsteads, & industrial sites.









Key Features & Benefits


2K Ultra-HD Surveillance: Capture crisp, detailed video and images day or night. The high-definition lens ensures you can identify faces and license plates with ease.


Dual-Action Security: Operates as a motion-activated floodlight and a 24/7 security camera. The bright LED array deters intruders before they reach your door.


Smart App Control: Fully compatible with Tuya Smart or EseeCloud (model-specific). View live feeds, receive instant motion alerts, and play back recorded footage directly from your smartphone.


Two-Way Audio: Speak to visitors or warn off trespassers in real-time using the built-in microphone and high-decibel speaker.


Weatherproof & Durable: Rated IP65/IP66, these units are built to withstand heavy rain, dust, and extreme heat, ensuring your security never takes a day off.


Cost-Free Operation: High-efficiency solar panels charge the internal high-capacity Lithium batteries during the day for reliable night-long performance—zero electricity bills.



Usage & Installation Guide


Placement: Mount the floodlight at a height of 3 to 6 meters for the best camera angle and light spread.


Solar Alignment: Ensure the solar panel is installed in a "Shadow-Free" zone. In the Northern Hemisphere, face the panel South at a 35-degree tilt to maximize sunlight absorption.


Connectivity:


Download the recommended App (Tuya or EseeCloud).


Ensure your phone is on a 2.4GHz Wi-Fi network (5GHz is not supported for pairing).


Scan the QR code on the camera lens to link the device to your account.




Customization: Use the app to adjust Motion Sensitivity (to avoid false alarms from pets) and set the Lighting Duration (how long the light stays on after motion is detected).


Storage: Insert a high-speed MicroSD card (up to 128GB) or subscribe to Cloud Storage within the app to save your footage.



Why Buy from Shanti’s Designs Solar?
We don''t just sell equipment; we provide peace of mind. Every ALP series camera is tested for durability and connectivity before it reaches you. Plus, our technical team is available to assist you with the app setup and solar panel positioning.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/10-3-1-1-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"WC-2217-2779","Product Category":"Solar LED Flood Light","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1520, 'MUST LITHIUM BATTERIES — lithium: LITHIUM BATTERIES 25.6V 200AH (5.12kWh)', 'MUST LITHIUM BATTERIES — lithium: LITHIUM BATTERIES 25.6V 200AH (5.12kWh)', 'lithium-batteries', '', NULL, 'https://shantisdesigns.co.ke/product/lithium-batteries/', '12444', 176, 'Must Batteries', 100000, 100000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'LITHIUM BATTERIES 51.2V 100AH (5.12kWh)', 'Premium Lithium LiFePO4 Battery Series: The Smart Choice for Solar
Why settle for yesterday’s technology? Shanti’s Designs Solar provides high-density Lithium Iron Phosphate (LiFePO4) batteries that are lighter, safer, and last up to 10 times longer than standard solar batteries. Whether you need a compact 12V 100Ah unit or a massive 48V 200Ah rack-mounted system, we have the power to keep you running.
Top Reasons to Switch to Lithium


Ultra-Long Life: Enjoy over 3,000 to 5,000+ cycles at 80% Depth of Discharge. This translates to 10–15 years of daily use.


Maximum Usable Energy: Unlike lead-acid (which you should only discharge to 50%), you can safely use up to 90–100% of a lithium battery''s capacity without damage.



Rapid Charging: Lithium batteries charge up to 4x faster, allowing your solar panels to fill them up completely even on short, winter days.



Space & Weight Saver: Lithium is roughly 60% lighter and much smaller than lead-acid batteries of the same capacity—perfect for wall-mounting or tight spaces.



Built-in Smart BMS: Every battery features an integrated Battery Management System (BMS) that automatically protects against over-charging, deep discharge, short circuits, and overheating.



Product Range & Applications







System Type
Best For&#8230;
Key Advantage




12V Lithium Series
RVs, Small Home Lighting, CCTV
Drop-in replacement for lead-acid.


24V Lithium Series
Medium Home Backups, Solar Pumps
High efficiency for mid-range inverters.


48V Powerwall/Rack
Whole-Home Solar, Industrial, Off-Grid
Stackable design for massive storage (5kWh+).









Usage & Smart Maintenance Guide
Lithium batteries are nearly maintenance-free, but these tips will ensure you get the absolute maximum ROI:



Inverter Compatibility: Ensure your inverter supports Lithium/LiFePO4 charging profiles. The BMS will handle the protection, but the right charging voltage (typically 14.4V for 12V systems) is key for speed.


The "Sweet Spot": While you can discharge to 100%, keeping your daily usage between 20% and 90% State of Charge (SoC) can extend the battery life even further.


Temperature Control: Lithium loves room temperature (20°C to 30°C). Avoid installing in direct sunlight or unventilated metal boxes in extreme heat to maintain peak performance.



No Water Needed: Never attempt to open or "top up" a lithium battery. They are dry-cell and hermetically sealed.


Firmware Updates: For our smart rack-mounted systems, ensure your monitoring app is up to date to access the latest energy-saving algorithms.



Upgrade Your Home with Shantis Designs Solar
Investing in Lithium is an investment in peace of mind. No fumes, no maintenance, and no more frequent battery replacements.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2025-12-06-at-09.23.15-1-1-1-1-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"12444","Product Category":"Must Batteries","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"200AH","Rated Voltage":"25.6V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1516, 'EASTMAN GEL BATTERIES 12V 200AH', 'EASTMAN GEL BATTERIES 12V 200AH', 'gel-batteries-12v-200ah-eastman', '', NULL, 'https://shantisdesigns.co.ke/product/gel-batteries-12v-200ah-eastman/', '12440', 56, 'GEL BATTERIES', 34500, 34500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'GEL BATTERIES 12V 200AH EASTMAN', 'GEL BATTERIES 12V 200AH EASTMAN Engineered for high-temperature African conditions, residential backup, commercial load shifting, and off-grid reliability. Available for immediate dispatch from our Nairobi showroom (Royal King Building, Luthuli Avenue) and Dev Towers HQ (Biashara Street).', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/IMG-20251206-WA0011-1-1-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Eastman","Model / SKU":"12440","Product Category":"GEL BATTERIES","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"200AH","Rated Voltage":"12V","Battery Chemistry":"LiFePO4 (Lithium Iron Phosphate) / Deep Cycle Gel","Cycle Life":"6,000+ Cycles @ 80% DoD (10+ Years Design Life)","Protection":"Integrated Smart BMS (Overcharge, Short-Circuit, Thermal)"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1507, 'Must PH1100 EU Hybrid Inverter 12KVA 48V THREE PHASE', 'Must PH1100 EU Hybrid Inverter 12KVA 48V THREE PHASE', 'ph1100-eu-hybrid-inverter-12kva-48v-three-phase', '', NULL, 'https://shantisdesigns.co.ke/product/ph1100-eu-hybrid-inverter-12kva-48v-three-phase/', '12431', 71, 'Must inverter', 212000, 212000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'PH1100 EU Hybrid Inverter 12KVA 48V THREE PHASE', 'Must PH1100 EU 12kW: The Future of Commercial Three-Phase Solar
For businesses and high-capacity estates in Kenya, the Must PH1100 EU 12kW offers the ultimate balance of safety, power, and flexibility. Unlike traditional high-voltage systems, the PH1100 EU utilizes a 48V low-voltage battery architecture, making it significantly safer to install and maintain while still delivering a robust 380V/400V three-phase output.
Why the PH1100 EU is a Game-Changer:


100% Unbalanced Output: Most 3-phase inverters require perfectly balanced loads across all phases. The PH1100 EU allows each phase to output up to 50% of its rated power independently, making it perfect for real-world Kenyan buildings where phase loads are rarely equal.


IP66 Rated Protection: This unit is completely dust-tight and protected against powerful water jets. It can be safely installed outdoors or in harsh industrial environments without the need for expensive enclosures.


Smart Time-of-Use (ToU) Function: Optimize your savings by programming up to 6 different time segments for charging and discharging. This allows you to store solar energy during the day and use it during peak tariff hours.


Massive Charging Capacity: With a maximum charging/discharging current of 240A, this inverter can fast-charge large battery banks, ensuring you are ready for long nighttime outages.


AC Coupling & Scalability: Easily retrofit this inverter into existing solar setups via AC coupling. For even larger power needs, you can connect up to 6 units in parallel for both on-grid and off-grid operations.


Diesel Generator Integration: Features a dedicated port to manage and store energy from a backup diesel generator, ensuring you never run out of power.





MODEL
PH11-5KL3-EU
PH11-6.5KL3-EU
PH11-8KL3-EU
PH11-10KL3-EU
PH11-12KL3-EU


Rated power
5000W
6500W
8000W
10000W
12000W


BATTERY INPUT DATA


Battery type
Lead-acid battery / Lithium battery


Battery voltage
48V


Battery voltage range
40~60V


Charging curve
3-stage adaptive with maintenance/Equalization


Charging Strategy for Li-lon Battery
Self-adaption to BMS


Over-current protection/ Over-temperature protection
Yes / Yes


Maximum charging/discharging power
5000W
6500W
8000W
10000W
12000W


Maximum charging/discharging current
120A
150A
190A
210A
240A


PV STRING INPUT DATA


Max. DC Input Power
6500W
8450W
10400W
13000W
15600W


Rated PV Input Voltage
550V


Maximum DC voltage
800V


Start-up Voltage
160V


Minimum voltage for grid connection
310V


Full Load DC Voltage Range
350-650V


Enter high voltage error recovery point
800V


MPPT voltage range
200~650V


Maximum input current
13A/13A
13A+26A


No.of MPP Trackers
2


No.of Strings per MPP Tracker
1+1
2+1


AC INPUT/OUTPUT DATA


Rated AC Input/ Output Power
5000W
6500W
8000W
10000W
12000W


Max AC Input/ Output Power
5500W
7150W
8800W
11000W
13200W


AC Input/ Output Rated Current
7.6/7.2A
9.8/9.42A
12.1/11.6A
15.2/14.5A
18.2/17.4A


Max AC Input/ Output Current
8.4/8A
10.8/10.4A
13.4/12.8A
16.7/15.9A
20/19.1A


Max. Three-phase Unbalanced Output Current
11.4/10.9A
14.7/14.1A
18.2/17.4A
22.7/21.7A
27.3/26.1A


Power Factor Adjustment Range
0.8 leading to 0.8 lagging


Rated Input/Output Voltage
220/380,230/400Vac


Rated Input/Output Grid Frequency/Range
50/60;45~55/55-65


Grid Type
Three Phase


Total Harmonics Current Distortion (THDi)
&lt;3% (of nominal power)


DC Current Injection
&lt;0.5% In


EFFICIENCY


Max. Efficiency
≥97.6%


Euro Efficiency
97.0%


PROTECTION


Integrated
Islanding protection, PV input polarity reverse protection, insulationresistance detection, surge protection,leakage current monitoringprotection,output current protection, output short circuit protectionoutput overvoltage protection


Surge Protection
DC Type III/AC Type III


Overvoltage Category
DC Type II/AC Type III


GENERAL DATA


Operating Temperature Range (°C)
-25°C to +60°C, &gt;45°C Derating


Cooling
Fan cooling


Noise (dB)
≤55dB


Communication with BMS
RS485/CAN


Machine Dimension (W*H*D)(mm)
446*692*260 (excluding connectors and racks)


Package Dimension (W*H*D)(mm)
567*816*404


N.W(kg)
38


G.W(kg)
42


Protection Degree
IP66


Installation Style
Wall-mounted


Warranty
5 Years
the Warranty Period Depends the Final Installation Site of Inverter, More Info Please Refer to Warranty Policy


CERTIFICATION & STANDARDS


CE-EMC+LVD (EN6100-6-3, EN6100-6-1+EN IEC 62109-1, EN IEC 62109-2); CE-LVD(EN 62477-1) ; IEC 60529; EN50549-1; Poland Type A, (NC RfG:2016, PSE:2018, PTPiREE:2021)C10/C11; UNE217001-2020; UNE217002-2020, NTS-631 (Type A); G98+G99', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/230V-PH1100-EUThree-Phase.new_.02-1-1-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"12431","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"12KVA","Rated Voltage":"48V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1505, 'Must PV3600 PRO Hybrid Inverter — must: PV3600 PRO Hybrid Inverter 10KVA 48V 100A 250VDC', 'Must PV3600 PRO Hybrid Inverter — must: PV3600 PRO Hybrid Inverter 10KVA 48V 100A 250VDC', 'must-pv3600-pro-hybrid-inverter', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv3600-pro-hybrid-inverter/', '12429', 71, 'Must inverter', 153000, 153000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Must PV3600 PRO: The Industrial Powerhouse for Inductive Loads
When power reliability meets heavy machinery, the Must PV3600 PRO Series is the answer.', 'Must PV3600 PRO: The Industrial Powerhouse for Inductive Loads
When power reliability meets heavy machinery, the Must PV3600 PRO Series is the answer. Built with a massive integrated pure copper transformer, this low-frequency hybrid inverter is specifically engineered to handle the intense startup "inrush" current of motors and pumps that would trip a standard high-frequency inverter.
Key Performance Advantages:


Unrivaled Surge Capacity: With a 300% surge rating, the 10kVA model can handle up to 30,000VA for 5 seconds. This allows it to effortlessly start 5HP to 6HP electric motors.



Pure Copper UI Transformer: The heavy-duty transformer provides superior isolation and durability, allowing the unit to handle "dirty" power from generators or unstable grids without damaging internal semiconductors.


Integrated High-Speed MPPT: Features a built-in 100A MPPT (with 200A options), supporting massive solar arrays up to 10,000W to keep your batteries charged and your machinery running.



Advanced Battery Care: Includes a built-in BMS function for Lithium batteries and a powerful 140A AC charging rate for rapid battery recovery when the grid is available.



Rugged & Reliable: Designed for a 10–15 year lifespan in demanding environments. It is compatible with both main grids and fuel-powered generators





MODEL
PV36-8048 TLV
PV36-10048 TLV
PV36-12048 TLV


Nominal Battery System Voltage
48VDC
48VDC
48VDC


INVERTER OUTPUT


Rated power
8.0KW
10.0KW
12.0KW


Surge rating
24000VA
30000VA
36000VA


Capable of starting electric motor
4HP
5HP
6HP


Waveform
Pure sine wave / same as input (bypass mode)


Nominal output voltage RMS
100V/110V/120V/200V/220V/240V


Output frequency
50Hz / 60Hz ± 0.3Hz


Inverter effciency(peak)
&gt;88%


Line mode efficiency
&gt;95%


Power factor
1.0


Typical transfer time
20ms(max)


AC INPUT


Voltage
220V/230V/240V


Selectable voltage range
90-280 VAC (APL)


Frequency range
50Hz / 60Hz


BATTERY


Low battery voltage cutoff
40-48VDC for 48VDC mode


Low battery voltage recover
42-50VDC for 48VDC mode


High battery voltage cutoff
60VDC for 48VDC mode


High battery voltage recover
57VDC for 48VDC mode


Power saving mode
&lt;600W


AC CHARGER


Output voltage
Depends on battery type


Charger AC input breaker rating
80A
80A
80A


Overcharge protection S.D.
62.8VDC for 48VDC mode


Maximum charge current
60A
70A
80A


BTS


Continuous output power
Yes Variances in charging voltage & S.D. voltage base on the battery temperature


BYPASS & PROTECTION


Input voltage waveform
Sine wave (grid or generator)


Nominal input frequency
50Hz or 60Hz


Overload protection (SMPS Load)
Circuit breaker


Output short circuit protection
Circuit breaker


Bypass breaker rating
63A
63A
63A


Max bypass current
80A


SOLAR CHARGER


Maximum PV charge current
100A/200A


DC voltage
48V


Maximim PV array power
5000W(10000W for 200A optional)


MPPT range @ operating voltage(VDC)
64~235VDC


Maximum PV array open circuit voltage
250VDC


Maximum effciency
&gt;98%


Standby power consumption
&lt;2W


MECHANICAL SPECIFICATIONS


Mounting
Wall mount


Machine Dimension (W*H*D)(mm)
402*674*222


Package Dimension (W*H*D)(mm)
818*415*577.5


N.W(kg)
/


G.W(kg)
/


OTHER


Operating Temperature Range
0°C to 50°C


Storage temperature
-15°C to 60°C


Audible noise
60dB MAX


Display
LED+LCD


Standard Warranty
2years


CERTIFICATION & STANDARDS


CE-LVD (IEC62109-1:2010, EN IEC62109-2:2011)', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/PV36PRO-4-6-01-1-1-1-1-1-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"12429","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"10KVA","Rated Voltage":"48V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1502, 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 8KVA 48V 120A 500VDC', 'MUST PV1900 EXP Series (6.2-12KW) - PV1900 EXP Hybrid Inverter 8KVA 48V 120A 500VDC', 'must-pv1900-exp-series-6-2-12kw', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv1900-exp-series-6-2-12kw/', '12426', 71, 'Must inverter', 87500, 87500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Must PV1900 EXP Series: Professional-Grade Hybrid Power (6.2kW – 12kW)
The Must PV1900 EXP Series is the ultimate power solution for high-demand envir', 'Must PV1900 EXP Series: Professional-Grade Hybrid Power (6.2kW – 12kW)
The Must PV1900 EXP Series is the ultimate power solution for high-demand environments. Engineered to handle large-scale residential and commercial loads, this series offers an impressive power range from 6.2kW up to 12kW on a single-phase 48V system. Available at Shantis Designs Solar, the EXP series is the preferred choice for those who need "grid-level" power with the freedom of solar.
Advanced Features for Large-Scale Energy


Dual MPPT Charge Controllers: Most models in this range come with Two Built-in MPPTs, allowing you to orient solar panels in two different directions (e.g., East and West) to maximize energy harvest throughout the entire day.


Massive PV Input (500VDC): The high-voltage string design supports up to 500V, reducing the need for thick, expensive copper wiring and simplifying your panel configuration.


Dual AC Output for Smart Loads: Easily prioritize your power. Keep your lights, internet, and security on the primary output, while scheduling heavy appliances like pumps or AC units on the secondary output.


Scalability (Parallel Ready): Need more than 12kW? These units support parallel operation (up to 3 units for the larger models), allowing you to build a massive power bank as your energy needs grow.


Battery-Independent Mode: High-frequency intelligence allows the inverter to power your loads directly from the sun during the day, even without a battery connected.


Seamless BMS Integration: Ready for the modern age, featuring a dedicated RS485/CAN port for direct communication with Lithium (LFP) batteries like the KSTAR 5.12kWh.





MODEL
PV19-6248 EXP
PV19-8048 EXP
PV19-10048 EXP
PV19-11048 EXP
PV19-12048 EXP


Default Battery System Voltage
48VDC


INVERTER OUTPUT


Rated Power
6200VA/6200W
8000VA/8000W
10000VA/10000W
11000VA/11000W
12000VA/12000W


Surge Power
12400W
16000W
20000W
22000W
24000W


Waveform
Pure sine wave


AC Voltage Regulation (Batt.Mode)
230VAC±5%(Setting)


Inverter Efficiency(Peak)
98%


Transfer Time
10ms(UPS / VDE4105) / 20ms(APL)


AC INPUT


Voltage
230VAC


Selectable Voltage Range
170~280VAC(UPS) / 90~280VAC(APL) / 184~253VAC(VDE)


Frequency Range
50Hz / 60Hz (Auto sensing)


BATTERY


Normal voltage
48VDC


Floating Charge Voltage
54.8VDC


Overcharge Protection
60VDC


SOLAR CHARGER & AC CHARGER


Maximum PV Array Open Circuit Voltage
500VDC (450V for parallel)


Charging Algorithm
3-Step (Flooded Battery, AGM / GEL / LEAD Battery), 4-Step (Li)


Maximum PV Array Power
4000W*2
4000W*2
5000W*2
6000W*2
6000W*2


Maximum PV Input Current
18A*2
18A*2
27A*2(40A max)
27A*2(40A max)
27A*2(40A max)


PV Array MPPT Voltage Range
90~450VDC (90~430VDC for parallel)


Maximum Solar Charge Current
120A
120A
150A
150A
150A


Maximum AC Charge Current
100A
120A
150A
150A
150A


Maximum Charge Current
120A
120A
150A
150A
150A


MECHANICAL SPECIFICATIONS


Machine Dimension (W*H*D)
425*473*145mm
425*527*145mm


Package Dimension (W*H*D)
/
/
/
/
/


N.W (kg)
/
/
/
/
/


G.W (kg)
/
/
/
/
/


OTHER


Humidity
5% to 95% Relativ Humidity (Non-condensing)


Operating Temperature Range
0°C~50°C


Storage Temperature Range
-15°C ~60°C


Warranty
2 year


CERTIFICATION & STANDARDS


CE-EMC+LVD (EN6100-6-3:2007, EN6100-6-1:2017+EN IEC62109-1:2010, EN IEC62109-2:2011) 
EN IEC62368-1:2020+A11:2020
CE-LVD (IEC62109-1:2010, EN IEC62109-2:2011)
EN IEC62368-1:2018, EN IEC62109-1:2010, EN IEC62109-2:2011', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv19.n-1-1-1-1-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"12426","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"8KVA","Rated Voltage":"48V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1500, 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 3KVA 24V 80A 245VDC', 'MUST PV2900 HP Series (1-6KW) - PV2900 HP Hybrid Inverter 3KVA 24V 80A 245VDC', 'must-pv2900-hp-series-1-6kw', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv2900-hp-series-1-6kw/', '12424', 71, 'Must inverter', 45000, 45000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'PV2900 HP Hybrid Inverter 5KVA 48V 80A 250VDC', 'Must PV2900 HP: The Compact Powerhouse with a Transformer Heart
At Shantis Designs Solar, we know that Kenyan power needs aren''t always "standard." The Must PV2900 HP Series bridges the gap between lightweight high-frequency inverters and heavy industrial units. By utilizing a pure copper transformer, this series offers the durability to handle motor-driven appliances (fridges, washing machines, small water pumps) while remaining affordable for residential use.
Why the PV2900 HP is the "Smart Choice" for Durability:


Industrial-Grade Surge (300%): While most inverters only double their power for a second, the PV2900 HP can triple it. The 3kW model can handle a 9,000VA surge, making it far superior for starting compressor-based appliances.


Dual AC Output: Manage your energy like a pro. Use the primary output for your critical "must-have" items and the second output for "smart loads" that can be shed when the battery gets low.


Integrated 80A MPPT: Comes with a high-speed 80A MPPT charge controller that supports a wide solar input range (up to 245VDC), allowing for flexible panel configurations.


Modern Battery Communication: Despite its "old-school" rugged transformer, the brain is modern. It features a dedicated BMS CAN port for direct communication with the latest Lithium battery technology.


Built to Last: Because it is a Low-Frequency unit, it generates less electronic heat and is more resistant to power spikes from the grid or lightning compared to high-frequency models.





MODEL
PV29-1KW-HP
PV29-1.5KW-HP
PV29-2KW-HP
PV29-3KW-HP
PV29-4KW-HP
PV29-5KW-HP
PV29-6KW-HP


Nominal Battery System Voltage
12VDC
24VDC
12VDC
24VDC
12VDC
24VDC
24VDC
48VDC
24VDC
48VDC
48VDC
48VDC


INVERTER OUTPUT


Rated Power
1 KW
1.5 KW
2 KW
3 KW
4 KW
5 KW
6 KW


Surge Rating
3000VA
4500VA
6000VA
9000VA
12000VA
15000VA
18000VA


Capable Of Starting Electric Motor
1P
1P
1.5P
2P
3P


Waveform
Pure sine wave / same as input (bypass mode)


Nominal Output Voltage RMS
220V / 230V / 240VAC (±10% RMS)


Output Frequency
50Hz / 60Hz ±0.3Hz


Inverter Efficiency (Peak)
&gt;88%


Line Mode Efficiency
&gt;95%


Power Factor
1.0


Typical Transfer Time
10ms(max)


Overload
100% &lt; Load &lt; 110% (alarm 5min then stop output and fault code 07) 110% &lt; Load &lt; 125% (alarm 60s then stop output and fault code 07) Load &gt; 125% (alarm 10s then stop output and fault code 07)


AC INPUT


Voltage
230VAC


Selectable Voltage Range
155~265VAC(For personal computers)


Frequency Range
50Hz / 60Hz(Auto sensing) 40~80Hz


BATTERY


Minimum Start Voltage
(10V / 10.5V / 11V / 11.5V/ 12V )+0.5V for 12VDC mode (*2 for 24VDC, *4 for 48VDC)


Low Battery Voltage Alarm
(10V / 10.5V / 11V / 11.5V/ 12V )+0.5V for 12VDC mode (*2 for 24VDC, *4 for 48VDC)


Low Battery Voltage Cut Off
10V / 10.5V / 11V / 11.5V/ 12V for 12VDC mode (*2 for 24VDC, *4 for 48VDC)


High Battery Voltage Alarm
(12-14.5V)+1V for 12VDC mode (*2 for 24VDC, *4 for 48VDC)


High Battery Voltage Recover
(12-14.5V)+0.5V for 12VDC mode (*2 for 24VDC, *4 for 48VDC)


Energy Saving Mode
Load ≤50±20W(120V)/100±20W(220V)


CHARGER


Output Voltage
Depends on battery type


Overcharge Protection S.D.
15.5VDC for 12VDC mode (*2 for 24VDC mode, *4 for 48VDC mode)


Maximum Charge Current
30A
20A
45A
25A
60A
30A
40A
20A
60A
30A
35A
40A


PAYPASS & PROTECTION


Input Voltage Waveform
Sine wave (grid or generator)


Nominal Input Frequency
50Hz or 60Hz


Overload Protection (SMPS Load)
Circuit breaker


Output Short Circuit Protection
Circuit breaker


AC Input Breaker
1-3K/30A
4-6K/50A


SOLAR CHARGER


Maximum PV Array Power
1250W
2500W
1250W
2500W
1250W
2500W
2500W
5000W
2500W
5000W
5000W
5000W


Maximum PV Charge Current
80A±4A


DC Voltage
12V/ 24V auto work
24V/ 48V auto work


MPPT Range @ Operating Voltage
15~95VDC @ 12V/ 30~230VDC @ 24V
30~230VDC @ 24V/ 60~230VDC @ 48V


Maximum PV Array Open Circuit Voltage
245VDC


Standby Power Consumption
&lt;2W


MECHANICAL SPECIFICATIONS


Mounting
Wall Mount


Dimensions (W*H*D)
274*484*174mm
274*568.5*174mm


Package Dimensions (W*H*D)
583.5*376*255mm
668.5*376*255mm


N.W (kg)
/
/


G.W (kg)
/
/


OTHER


Operating Temperature Range
0°C ~ 40°C


Storage Temperature
-15°C ~ 60°C


Audible Noise
60dB MAX


Display
LED+LCD


Standard Warranty
2 year


CERTIFICATION & STANDARDS


CE-EMC+LVD (EN6100-6-3:2007, EN6100-6-1:2017+EN IEC62109-1:2010, EN IEC62109-2:2011)', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv29hp-001-1-1-1-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"12424","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2900 HP","Rated Voltage":"24V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1497, 'Must PV1800 PREM Series — must: PV1800 PREM Hybrid Inverter 3.5KVA 24V 100A 450VDC', 'Must PV1800 PREM Series — must: PV1800 PREM Hybrid Inverter 3.5KVA 24V 100A 450VDC', 'must-pv1800-prem-series', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv1800-prem-series/', '12421', 71, 'Must inverter', 47500, 47500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Must PV1800 PREM Series: The Next Generation of Hybrid Power
The Must PV1800 PREM Series (available in 3.5KVA and 5.5KVA) is engineered for efficiency', 'Must PV1800 PREM Series: The Next Generation of Hybrid Power
The Must PV1800 PREM Series (available in 3.5KVA and 5.5KVA) is engineered for efficiency and versatility. Unlike standard inverters, the PREM series features a high PV input voltage (up to 450VDC), allowing you to connect more solar panels in series, which simplifies wiring and reduces installation costs.3
 
Why Choose the PREM Series?


Dual AC Output: This is a game-changer for smart load management.4 You can connect your "heavy" non-critical loads (like water heaters) to the second output, ensuring your "critical" loads (lights, Wi-Fi, fridge) stay powered longer during a blackout.5


Battery-Independent Operation: The PREM series can power your home directly from solar panels during the day, even if your batteries are disconnected or failed.6
 

Rapid 100A MPPT Charging: With a built-in 100A MPPT solar charge controller, you can harvest up to 6000W of solar energy to charge your batteries and power your home simultaneously.7



Lithium Battery Ready: Fully compatible with LiFePO4 battery banks, featuring a dedicated BMS communication port (CAN/RS485) for seamless integration with brands like KSTAR or Pylontech.8



Integrated Monitoring: Comes with built-in Wi-Fi and a mobile app, allowing you to track your energy savings from anywhere in Kenya.9



5. Technical Comparison for Shantis Designs Solar
 



MODEL
PV18-1612 PREM
PV18-2524 PREM
PV18-3024 PREM
PV18-3524 PREM
PV18-5548 PREM


Nominal Battery System Voltage
12VDC
24VDC
24VDC
24VDC
48VDC


INVERTER OUTPUT


Rated Power (Main+Second Load)
2000VA/1600W
2500VA/2500W
3000VA/3000W
3500VA/3500W
5500VA/5500W


Surge Power
3200W
5000W
6000W
7000W
11000W


Waveform
Pure sine wave


AC Voltage Regulation (Batt.Mode)
230VAC±5%(Setting)


Inverter Efficiency(Peak)
90~93%


Transfer Time
10ms (UPS / VDE4105) / 20ms (APL)


AC INPUT


Voltage
230VAC±5%


Selectable Voltage Range
170~280VAC(UPS) / 90~280VAC(APL) / 184~253VAC(VED4105)


Frequency Range
50Hz / 60Hz(Auto sensing)


BATTERY


Normal voltage
12VDC
24VDC
24VDC
24VDC
48VDC


Floating Charge Voltage
13.7VDC
27.4VDC
27.4VDC
27.4VDC
54.8VDC


Overcharge Protection
15VDC
30VDC
30VDC
30VDC
60VDC


SOLAR CHARGER &AC CHARGER


Maximum PV Array Open Circuit Voltage
400VDC
400VDC
400VDC
450VDC
450VDC


Maximum PV Input Current
16A
18A
18A
18A
28A


Charging Algorithm
3-Step (Flooded Battery, AGM / GEL / LEAD Battery), 4-Step (Li)


Maximum PV Array Power
2000W
4000W
4000W
4000W
6000W


PV Array MPPT Voltage Range(Typ.)
30~320VDC
60~360VDC


Maximum Solar Charge Current
80A
100A


Maximum AC Charge Current
80A
60A
60A
60A
100A


Maximum Charge Current
80A
100A


MECHANICAL SPECIFICATIONS


Machine Dimension (W*H*D)(mm)
290*367*111
290*367*111
290*367*111
318*367*122.5
318*454*122.5


Package Dimension (W*H*D)(mm)
446*394*187
446*394*187
446*394*187
459*410*200
544.5*410*200


N.W (kg)
6.4
6.6
6.6
7.2
9.0


G.W (kg)
7.4
7.6
7.6
8.2
10.5


OTHER


Humidity
5% to 95% Relative humidity (Non-condensing)


Operating Temperature
0°C~50°C


Storage Temperature
-15°C~60°C


Warranty
2years


CERTIFICATION & STANDARDS


CE-EMC+LVD (EN6100-6-3, EN6100-6-1+EN IEC62109-1, EN IEC62109-2)', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/pv18-prem-001-1-1-1-1-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"12421","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"3.5KVA","Rated Voltage":"24V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1493, 'Must PV1800 VPM/VHM Series — must: PV1800 VPM Hybrid Inverter 1.5KVA 12V 60A 145VDC', 'Must PV1800 VPM/VHM Series — must: PV1800 VPM Hybrid Inverter 1.5KVA 12V 60A 145VDC', 'must-pv1800-vpm-vhm-series', '', NULL, 'https://shantisdesigns.co.ke/product/must-pv1800-vpm-vhm-series/', '12417', 71, 'Must inverter', 24000, 24000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'PV1800 VPM Hybrid Inverter 1.5KVA 12V 60A 145VDC', 'Reliable Off-Grid Power: Must PV1800 VPM/VHM Series
The Must PV1800 VPM/VHM Series is a multi-functional hybrid inverter/charger, combining the capabilities of a high-efficiency inverter, MPPT solar charger, and a smart battery charger. Available at Shantis Designs Solar, this series is the perfect entry-to-mid-level solution for Kenyan homes and small businesses seeking energy independence.

Key Features for Better Ranking:


Pure Sine Wave Output: Ensures the safety of your sensitive electronics like laptops, LED TVs, and refrigerators.


High-Speed MPPT Controller: Built-in 60A/80A MPPT maximizes energy harvest from your solar panels even in cloudy weather.


Smart Battery Management: Supports both Lead-Acid and Lithium-Ion (LFP) batteries with optional BMS communication for enhanced battery life.


UPS Functionality: Offers a seamless transfer time of 10ms, ensuring your devices stay powered during sudden grid failures.


User-Friendly Interface: A clear LCD screen allows you to monitor charging currents and customize AC/Solar priority settings easily.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-5-1-1-1-2.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"MUST","Model / SKU":"12417","Product Category":"Must inverter","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1.5KVA","Rated Voltage":"1800 V","Output Waveform":"100% Pure Sine Wave","MPPT Solar Charger":"Built-in High-Efficiency Dual MPPT Tracker","BMS Communication":"RS485 / CAN-Bus Lithium Battery Sync"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1492, 'Doyin Stainless Steel Water Level Sensor', 'Doyin Stainless Steel Water Level Sensor', 'doyin-stainless-steel-water-level-sensor-1492', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-stainless-steel-water-level-sensor-1492/', '12416', 55, 'Water Pumps', 2200, 2200, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Stainless Steel Water Level Sensor', 'Doyin Stainless steel water level sensors are the industry standard for durability and hygiene. Because they resist corrosion and withstand high temperatures, they are ideal for everything from drinking water tanks to industrial chemical vats.
There are two main types of stainless steel sensors depending on how you need to monitor the water:
1. Float Switches (On/Off Control)
These are simple, reliable mechanical sensors. When the water reaches a certain level, a float moves a magnet that flips a switch. These are perfect for preventing overflows or protecting a pump from running dry.


Vertical Float Switches: Mounted at the top or bottom of a tank to detect specific "High" or "Low" points.


Horizontal Float Switches: Mounted through the side wall of the tank.


2. Continuous Level Probes
If you need to know exactly how much water is in the tank (e.g., 45% or 80%), you use a probe. These often use pressure or capacitance to send a constant signal to a digital display.

Top Stainless Steel Options
One of the most versatile options is the Stainless Steel Vertical Float Switch. This model is built with 304 stainless steel, making it safe for food and beverage use. It can handle temperatures up to 120°C and is easy to install in the top of a tank to trigger a "full" alarm.
For side-mounted applications, the Horizontal Liquid Level Sensor is a reliable choice. It features a right-angle design that is perfect for tight spaces. It is highly resistant to weak acids and bases, ensuring a long lifespan even in treated water.
If you need a more advanced "smart" solution, the Tuya WiFi Water Level Sensor allows you to monitor your tank levels directly from your smartphone. It uses a stainless steel probe to detect levels and sends real-time alerts if the water gets too low or high.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/shopping-1-1-2.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12416","Product Category":"Water Pumps","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1491, 'Doyin Automatic Pump Control Unit', 'Doyin Automatic Pump Control Unit', 'doyin-automatic-pump-control-unit-1491', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-automatic-pump-control-unit-1491/', '12415', 67, 'Automatic Pump Control Unit', 4500, 4500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin Automatic Pump Control Unit', 'An Doyin  Automatic Pump Control Unit is an electronic device designed to automate the operation of your water pump. It replaces traditional pressure tank systems by sensing both water pressure and flow rate, ensuring your pump only runs when you actually need it.
How It Works


Automation: When you open a tap, the controller detects the drop in pressure and starts the pump. When you close the tap, it detects the lack of flow and stops the pump.


Dry-Run Protection: This is the most critical safety feature. If the unit detects that there is no water entering the pump (e.g., your well or tank is dry), it will automatically shut the pump down to prevent the motor from burning out.


Constant Pressure: It helps maintain a steady pressure in your pipes, eliminating the "pulsing" effect common in older systems.



Popular Automatic Control Units
For standard domestic pumps, the Italtecnica Brio 2000 is a globally recognized professional choice. It is highly reliable for pumps up to 2HP and features an automatic restart function that tries to prime the pump again after a dry-run event.
If you are looking for a more budget-friendly or universal option, the EPC-1 Automatic Pump Control is a very common and effective unit. It is easy to install directly on the discharge of the pump and is rated for most standard 220V AC pumps.
For systems requiring more advanced settings, such as adjustable starting pressure, the LEO PS-04A offers a digital interface or adjustable screw. This allows you to fine-tune exactly when the pump kicks in, which is helpful for multi-story buildings.

Quick Selection Guide


Best for Reliability: Choose the Italtecnica Brio; it has a proven track record for longevity.


Best for Customization: Choose a model with an adjustable start pressure (like the LEO) if your house is very tall.


Best Value: The EPC series provides all the essential protections (including dry-run) at a lower price point.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/Doyin-Automatic-Pump-Control-1-1-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12415","Product Category":"Automatic Pump Control Unit","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1488, 'Doyin AC Well Pump — AC WELL PUMP: AC Well Pump SCM3 (0.75HP)', 'Doyin AC Well Pump — AC WELL PUMP: AC Well Pump SCM3 (0.75HP)', 'doyin-ac-well-pump', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-well-pump/', '12412', 65, 'AC Well Pump', 19000, 19000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Genuine Doyin AC Well Pump — AC WELL PUMP: AC Well Pump SCM3 (0.75HP) supplied and backed by Shantis Designs Solar Solutions Kenya. Includes official manufacturer warranty, EPRA compliance, and fast delivery across Nairobi and all 47 counties.', 'Selecting the right Doyin  AC well pump depends primarily on your well''s depth and the volume of water you need. For most residential and agricultural boreholes, a 4-inch submersible pump is the standard, offering a balance of high pressure and reliable flow.
Top-Rated Doyin AC Well Pumps
For a balance of flow and depth, the Goulds Water Technology 7GS05 is a premium professional choice. It is a 1/2 HP, 7 GPM (gallons per minute) pump known for its stainless steel construction and high-efficiency motor, making it ideal for deep residential wells where reliability is the top priority.
If you need a complete "all-in-one" solution that includes the control box, the Hallmark Industries MA0414X-7 is a popular high-performance option. It is a 1 HP pump capable of a 200-foot max head, featuring built-in thermal protection and a stainless steel body to prevent corrosion.
For those looking for a heavy-duty, budget-friendly alternative, the VEVOR Submersible Well Pump provides exceptional value. This 1.5 HP model can reach a max lift of 443 feet and features a built-in check valve to prevent backflow, making it suitable for both home and irrigation use.

Key Features to Consider


Head (Lift Height): Ensure the pump''s "Max Head" is at least 20-30% higher than your actual well depth to account for friction and pipe resistance.


Stages (Impellers): More stages allow the pump to push water from deeper levels. "Floating" impellers are best if your well has any sand or sediment.


Voltage: Most residential AC pumps run on 220V/240V single-phase, but always verify your power supply before purchasing.


Summary Recommendation


Best for Longevity: The Goulds 7GS05 is built with higher-grade materials for long-term use.


Best for Deep Wells: The VEVOR 1.5HP offers the highest lift capacity for the price.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-4-1-1-1-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12412","Product Category":"AC Well Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"0.75HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1487, 'Doyin AC Booster Pump — AC BOOSTER PUMP: AC Booster Pump CPM 190/1 (2HP)', 'Doyin AC Booster Pump — AC BOOSTER PUMP: AC Booster Pump CPM 190/1 (2HP)', 'doyin-ac-booster-pump', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-booster-pump/', '12411', 66, 'AC Booster Pump', 19500, 19500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin AC Booster Pump CPM 190/1 (2HP)', 'An Doyin  AC Booster Pump is a compact, powerful device used to increase water pressure in homes or small commercial buildings. Unlike deep-well pumps, these are typically installed inline with your existing plumbing to boost the flow to showers, taps, and appliances when the main water supply pressure is insufficient.
Top-Rated Doyin AC Booster Pumps for 2026
If you''re looking for the gold standard in residential pressure boosting, the Grundfos SCALA2 is an intelligent, variable-speed pump that maintains perfect pressure even when multiple taps are running. It is incredibly quiet and features a "plug-and-pump" design that includes a motor, tank, sensor, and non-return valve in one unit.
For a more traditional and highly powerful option, the Clarke CBT1400SS is a heavy-duty stainless steel booster pump designed for high output. With a 1650W motor and a 50-meter head, it is capable of pushing large volumes of water for substantial properties or small irrigation projects.
If you need a budget-friendly solution for a single bathroom or water heater, the Kolerflo 120W Automatic Booster is an excellent entry-level choice. It features an automatic flow switch that triggers the pump only when it senses water movement, making it energy-efficient and easy to install in tight spaces under a sink or near a heater.

Comparison of Popular AC Booster Pump Types







Pump Type
Best For
Key Advantage




In-Line Booster
Showers & Taps
Compact and easy to retrofit into existing pipes.


Variable Speed (VFD)
Full-House Pressure
Maintains constant pressure regardless of demand.


Multistage Centrifugal
Tall Buildings
Extremely high pressure for multi-story lift.


Self-Priming Booster
Rain Barrels/Tanks
Can pull water from a source lower than the pump.









Key Selection Factors


Total Head: Calculate the vertical distance from the pump to the highest tap.


Flow Rate (GPM/LPM): Ensure the pump can handle the simultaneous use of showers, toilets, and kitchen taps.


Automatic Control: Always opt for a model with a pressure switch or flow sensor so the pump doesn''t run continuously and waste electricity.


Final Recommendation:


For premium performance and silence, choose the Grundfos SCALA2.


For high-power irrigation or large homes, the Clarke CBT1400SS is the workhorse.


For simple shower boosting, the Kolerflo 120W provides the best value.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/2-1-1-1-1-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12411","Product Category":"AC Booster Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"2HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1483, 'Doyin AC Submersible Pump 4SD3 — 4SD3: AC Submersible Pump 4SD3/30 (3.0HP, 3-Phase)', 'Doyin AC Submersible Pump 4SD3 — 4SD3: AC Submersible Pump 4SD3/30 (3.0HP, 3-Phase)', 'doyin-ac-submersible-pump-4sd3', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-submersible-pump-4sd3/', '12407', 68, 'AC Submersible Pump', 37000, 37000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'AC Submersible Pump 4SD3/30 (3.0HP, 3-Phase)', 'The Doyin AC Submersible Pump 4SD3 is a high-efficiency deep-well borehole pump designed for reliable water extraction. The "4SD3" nomenclature signifies a 4-inch diameter pump with a rated flow of 3 m3/h (3,000 liters per hour).
It is a popular choice for residential water supply, agricultural irrigation, and industrial applications due to its robust multistage design.

Key Technical Specifications
While exact performance varies by the number of stages (impellers) and motor horsepower, the 4SD3 series generally includes:


Rated Flow: 3 m3/h (approx. 50 liters per minute).


Max Flow: Can reach up to 4.2 – 4.8 m3/h.


Power Source: Standard AC power (available in Single-phase 220-240V or Three-phase 380-415V).


Maximum Head (Lift): Depending on the model, it can lift water from 30 meters to over 250 meters vertically.



Professional Engineering Features


Anti-Sand Floating Impellers: Made from high-strength technopolymer (PPO), these impellers are designed to "float" to allow small sand particles (up to 150g/m3) to pass through without seizing the motor.


Stainless Steel Construction: The external casing, intake, and discharge are typically made of AISI 304 Stainless Steel to prevent corrosion and ensure a long lifespan in submerged environments.


Oil-Filled Motor: The motor is usually filled with food-grade lubricant to ensure superior cooling and lubrication of the bearings at high pressures.


Check Valve: Most models include a built-in non-return valve to prevent water from flowing back into the pump, which protects the impellers from "water hammer" damage.



Primary Applications


Domestic Use: Providing high-pressure water for multi-story buildings and homes.


Agriculture: Ideal for sprinkler and drip irrigation systems for small to medium-sized farms.


Industrial Supply: Reliable for factory water cycles or pressure boosting.



Comparison: AC (4SD3) vs. DC/Hybrid Models
If you are deciding between this AC model and a Solar (DC) model, here are the main differences:







Feature
AC 4SD3 (Grid Powered)
DC/Hybrid (Solar Powered)




Running Cost
High (Monthly electricity bills)
Zero (Free sun)


Reliability
Consistent (as long as grid is on)
Dependent on sunlight/batteries


Efficiency
Standard
High (Brushless DC)


Initial Cost
Lower
Higher (Requires panels & controller)', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/202210311525457168-2-1-1-2-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12407","Product Category":"AC Submersible Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"3.0HP","Rated Voltage":"380V-415V Three-Phase AC","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1476, 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/40 (4.0HP)', 'Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/40 (4.0HP)', 'doyin-ac-submersible-pump-4sdm3-7-0-5hp', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-ac-submersible-pump-4sdm3-7-0-5hp/', '12400', 68, 'AC Submersible Pump', 45500, 45500, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Genuine Doyin AC Submersible Pump 4SDM3 — 4SDM3: AC Submersible Pump 4SDM3/40 (4.0HP) supplied and backed by Shantis Designs Solar Solutions Kenya. Includes official manufacturer warranty, EPRA compliance, and fast delivery across Nairobi and all 47 counties.', 'The Doyin AC Submersible Pump 4SDM3 is a high-performance deep-well borehole pump designed for efficient water extraction. It is widely used in residential, agricultural, and industrial settings because of its robust multistage design and ability to handle small amounts of sand.
The "4SDM3" name typically refers to a 4-inch diameter, Submersible Deep-well, M (single-phase) pump with a rated flow of 3 m3/h.

Key Technical Specifications
While exact performance depends on the specific motor wattage (HP) and the number of stages (impellers), the 4SDM3 series generally features:


Rated Flow: 3 m3/h (3,000 Liters per hour).


Max Flow: Often reaches up to 4.8 m3/h.


Power Source: AC Single-phase (220V–240V / 50Hz) or Three-phase versions.


Maximum Head: Can range from 40 meters to 300+ meters vertical lift depending on the number of stages.


Professional Engineering Features


Anti-Sand "Floating" Impellers: The impellers are made of high-strength technopolymer (like PPO) and are designed to "float" to allow sand particles to pass through without seizing the motor.


Stainless Steel Construction: The external casing and motor shaft are made of AISI 304 Stainless Steel to prevent corrosion.


Oil-Filled Motor: Uses food-grade lubricant to ensure superior cooling and lubrication of the motor bearings at high depths.


Built-in Thermal Protection: Automatically shuts down if the motor overheats to prevent burnout.



Comparison: AC vs. DC Options
If you are considering whether to stick with an AC pump or switch to a DC/Solar version, here is a quick look at how they differ:







Feature
AC (4SDM3)
DC Solar (4SDS5/4SPS4)




Power Source
Grid / Generator
Solar Panels / Battery


Operating Cost
High (Electricity/Fuel)
Zero (Free Sun)


Installation
Simple
Requires MPPT Controller


Efficiency
Standard
High (Brushless DC)', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/202210311525457168-3-1-1-2-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12400","Product Category":"AC Submersible Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"4.0HP","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1473, 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI — 4SFI: Heavy-Duty Hybrid Submersible Pump 4SFI-120-4000W (5.5HP)', 'Doyin Heavy-Duty Hybrid Submersible Pump 4SFI — 4SFI: Heavy-Duty Hybrid Submersible Pump 4SFI-120-4000W (5.5HP)', 'doyin-heavy-duty-hybrid-submersible-pump-4sfi', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-heavy-duty-hybrid-submersible-pump-4sfi/', '12397-S91-S82', 63, 'Heavy-Duty Hybrid Submersible Pump', 115000, 115000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Heavy-Duty Hybrid Submersible Pump 4SFI-120-4000W (5.5HP)', 'The Doyin DC Stainless Steel Submersible Pump 4SPS4Heavy-Duty Hybrid Submersible Pump 4SFI is a premium industrial-grade water extraction system designed for maximum durability in deep-well applications. The "4SFI" designation typically signifies a 4-inch diameter, Submersible, Floating-impeller design with Intelligent hybrid control.
This pump is specifically engineered to handle the "Heavy-Duty" requirements of high-sand environments and continuous 24/7 operation by utilizing both solar and grid power.

1. Key "Heavy-Duty" Features
Unlike standard models, the 4SFI series prioritizes mechanical longevity through several high-spec components:


Sand-Resistant Floating Impellers: Features "floating" stage technology where the impellers are not fixed to the shaft. This allows sand and abrasives to pass through without grinding down the motor or seizing the pump.


AISI 304/316 Stainless Steel: The entire pump body, intake, and discharge head are made from thick-walled stainless steel to prevent corrosion even in aggressive or acidic groundwater.


Dual-Shielded Motor: The motor is often double-sealed and oil-filled (food-grade) to handle the extreme pressure of deep-well immersion while providing superior cooling.



2. Technical Performance
The 4SFI series is built for reliable high-head performance. While specific numbers vary by motor wattage (e.g., 1.5kW to 3.0kW), the general range includes:







Specification
Standard 4SFI Range




Max Flow Rate
4.0 – 6.0 m3/h (4,000–6,000 L/h)


Max Head (Lift)
Up to 250+ meters (depending on stage count)


DC Voltage Input
60V – 400V DC (Solar Optimized)


AC Voltage Input
90V – 240V AC (Grid/Generator Backup)









3. Intelligent Hybrid Functionality
The "Hybrid" aspect is managed by an integrated or external high-speed MPPT controller:


Automatic Source Switching: The pump can be programmed to prioritize Solar (DC) during the day and automatically switch to Mains (AC) at night if the water level in the tank is low.


Variable Speed Drive (VSD): The motor adjusts its RPM based on available solar energy. It doesn''t just turn on/off; it slows down when clouds pass, maintaining a steady (though lower) flow rather than stopping entirely.



4. Professional Applications


Mining & Construction: Reliable water supply for sites with high sediment or sand levels in the groundwater.


Commercial Agriculture: Ideal for large-scale pivots or drip systems that require constant pressure throughout the day and night.


Community Water Projects: Often used in government or NGO water kiosks because the stainless steel build requires less frequent maintenance than plastic models.



5. Installation Tip
Because this is a "Heavy-Duty" unit, it is significantly heavier than plastic-impeller pumps. It is mandatory to use a stainless steel safety cable (at least 4mm thickness) to support the weight of the pump in the borehole, as the rising main pipe alone may not be sufficient over time.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/4SD10-Submersible-Deep-Well-Borehole-Pump-50Hz.avif', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12397-S91-S82","Product Category":"Heavy-Duty Hybrid Submersible Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"4000W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1470, 'Doyin Hybrid Submersible Pump 4SD10 — 4DS10: Hybrid Submersible Pump 4SD10-1500W (2.0HP)', 'Doyin Hybrid Submersible Pump 4SD10 — 4DS10: Hybrid Submersible Pump 4SD10-1500W (2.0HP)', 'doyin-hybrid-submersible-pump-4sd10', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-submersible-pump-4sd10/', '12394-S20-S76-S52', 61, 'Hybrid Submersible Pump', 51000, 51000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Hybrid Submersible Pump 4SD10-1500W (2.0HP)', 'The Doyin Hybrid Submersible Pump 4SD10 is a high-capacity water extraction system designed to bridge the gap between solar efficiency and 24/7 reliability. The "4SD10" designation indicates it is a 4-inch diameter pump with a high rated flow of 10 m3/h (10,000 liters per hour), making it one of the most powerful units in the 4-inch category.

1. High-Performance Output
The 4SD10 series is engineered for applications requiring high volume rather than extreme depth. It is often used in large-scale farming or commercial water supply.


Rated Flow Rate: 10 m3/h (166 liters per minute).


Maximum Head: Typically ranges from 60 to 140 meters, depending on the motor wattage (1.5kW to 3.0kW).


Hybrid Power Input: Can take DC power from solar panels (60V–400V) and AC power from the grid or a generator (90V–240V).



2. Professional Design Features
This pump is built to handle the mechanical stress of moving large volumes of water continuously.


Multistage Centrifugal Design: Uses a series of high-efficiency impellers to maintain pressure at high flow rates.


Brushless DC (BLDC) Motor: Provides up to 25% higher efficiency than standard AC motors, meaning it requires fewer solar panels to achieve full output.


AISI 304 Stainless Steel: The exterior shell, intake, and discharge are all corrosion-resistant, ensuring the pump doesn''t rust even when submerged for years.


Smart MPPT Controller: Features an automatic switch-over that prioritizes solar power and only draws from the AC source when sunlight is insufficient.



3. Comparison with Other 4SD Series
The "10" in 4SD10 refers to the flow capacity. Here is how it compares to the models we discussed earlier:







Model
Max Flow Rate
Primary Use Case




4SDS5
5 m3/h
Domestic use / Small-scale farming


4SPS4
4 m3/h
Deep wells / Sand resistance (Stainless Impellers)


4SD10
10 m3/h
Large-scale irrigation / Community water kiosks









4. Application Checklist
Because the 4SD10 moves a lot of water, your plumbing and well must be prepared:


Well Yield: Ensure your borehole can actually provide 10,000 liters per hour. If the well yield is low, the pump will frequently trigger its dry-run protection.


Pipe Size: Use a larger rising main (at least 2-inch diameter) to prevent friction loss. Using a small pipe will significantly reduce the 10 m3/h flow rate.


Solar Array: For the 10 m3/h model, you typically need a larger solar array (2000W to 4000W) to maintain high-speed operation.', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/4SD10-Submersible-Deep-Well-Borehole-Pump-50Hz.avif', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12394-S20-S76-S52","Product Category":"Hybrid Submersible Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"1500W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1467, 'Doyin Hybrid High Flow Submersible Pump 4SDS7 — 4SDS7: Hybrid High Flow Submersible Pump 4SDS7-800W (1.0HP)', 'Doyin Hybrid High Flow Submersible Pump 4SDS7 — 4SDS7: Hybrid High Flow Submersible Pump 4SDS7-800W (1.0HP)', 'doyin-hybrid-high-flow-submersible-pump-4sds7', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-high-flow-submersible-pump-4sds7/', '12391', 62, 'Hybrid High Flow Submersible Pump', 45000, 45000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Hybrid High Flow Submersible Pump 4SDS7-800W (1.0HP)', 'The Doyin Hybrid Submersible Pump 4SDS7 is a professional-grade, high-flow water pumping system engineered for large-scale water requirements. It is a "High Flow" specialist, designed to bridge the gap between residential pumps and industrial-scale irrigation systems.
The "4SDS7" designation stands for: 4 (4-inch diameter), SD (Submersible Deep-well), S (Solar/Hybrid series), and 7 (Rated flow of 7 m3/h or 7,000 liters per hour).

1. The Hybrid Advantage
The defining feature of this pump is its Dual-Input Smart Technology. It is equipped with a high-end hybrid controller that allows the pump to use two power sources:


DC Power: Directly from solar panels during daylight hours for zero-cost pumping.


AC Power: From the national grid or a generator for nighttime or cloudy weather operation.


Automatic Switching: The system can automatically switch to AC power if solar radiation drops below a certain threshold, ensuring your water supply never stops.



2. Technical Specifications
Performance varies by the motor''s power rating (from 1.0 HP to 4.0 HP), but the flow rate remains high across the series.







Feature
Specification Range




Rated Flow Rate
7.0 m3/h (7,000 Liters/hour)


Power Rating
800W (1HP) to 3000W (4HP)


Maximum Head (Lift)
60 meters to 220 meters


Body Material
AISI 304 Stainless Steel


Motor Type
High-Efficiency Permanent Magnet Brushless DC


Voltage Range
60V – 400V DC / 90V – 240V AC









3. Engineering & Material Build
The 4SDS7 is built for heavy-duty environments like deep boreholes and agricultural fields.


Corrosion Resistance: The exterior casing, motor housing, and shaft are all made of Grade 304 Stainless Steel to prevent rust and mineral buildup.


Thermal Protection: Built-in sensors prevent the motor from overheating during continuous 24/7 cycles.


Dry-Run Protection: The controller includes an automatic shut-off feature that stops the pump if the well water level drops, protecting the internal components from friction damage.



4. Primary Applications


Large-Scale Agriculture: Ideal for drip or sprinkler irrigation systems that require high volume and consistent pressure.


Commercial Estates & Hotels: Provides bulk water supply for apartments, schools, and hospitals where a 5 m3/h pump is too small.


Livestock & Ranches: Fills massive storage tanks or troughs across large properties using free solar power.


Off-Grid Communities: Serves as a reliable village water kiosk with the flexibility to use a backup generator.



5. Installation Guidelines


Solar Array Sizing: For the 1500W (2HP) model, you generally need about 2.1kW to 2.5kW of solar panels to reach the full 7,000 L/h flow rate.


Pipe Diameter: To maintain the "High Flow" performance, it is highly recommended to use a 1.5-inch or 2-inch rising main pipe. A 1.25-inch pipe will create too much friction and reduce your actual water output.


Safety Cable: Always use a stainless steel safety cable to suspend the pump; do not rely on the electrical cable or the pipe alone.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-1-2-1-1-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12391","Product Category":"Hybrid High Flow Submersible Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"800W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1462, 'Doyin Hybrid Submersible Pump 4SDS5 — Hybrid 4SDS5: Hybrid Submersible Pump 4SDS5-800W (1.0HP)', 'Doyin Hybrid Submersible Pump 4SDS5 — Hybrid 4SDS5: Hybrid Submersible Pump 4SDS5-800W (1.0HP)', 'doyin-hybrid-submersible-pump-4sds5', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-hybrid-submersible-pump-4sds5/', '12386', 61, 'Hybrid Submersible Pump', 46000, 46000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Hybrid Submersible Pump 4SDS5-800W (1.0HP)', 'The Hybrid Submersible Pump 4SDS5 is an advanced version of the standard DC solar pump, specifically designed with AC/DC dual-input capability. This allows you to run the pump directly from solar panels (DC) during the day and seamlessly switch to grid power or a generator (AC) at night or during cloudy weather.
The "4SDS5" name stands for a 4-inch diameter pump with a rated flow of 5 m3/h (5,000 liters per hour).

1. Key Hybrid Advantage: Uninterrupted Supply
The primary feature of the hybrid model is its automatic power switching.


Daytime: Uses free solar energy via a built-in or external MPPT controller.


Night/Cloudy: Can be connected to a 220V–240V AC source to ensure your tanks stay full regardless of weather conditions.


No Inverter Needed: Most hybrid models handle both inputs directly, saving you the cost of a large external solar inverter.



2. Technical Performance Specs
Performance depends on the motor wattage (common models range from 800W to 1500W):







Model
Power (Watts)
Max Head (Lift)
Max Flow Rate




4SDS5-800W
800W (1.0 HP)
~80 meters
5,000 L/h


4SDS5-1100W
1100W (1.5 HP)
~120 meters
5,000 L/h


4SDS5-1500W
1500W (2.0 HP)
~168 meters
5,000 L/h









3. Professional Engineering Features


Brushless DC (BLDC) Motor: High-efficiency permanent magnet motor that runs cooler and lasts longer than traditional brushed motors.


Stainless Steel Construction: The body, shaft, and often the impellers are made of AISI 304 Stainless Steel to resist corrosion in deep boreholes.


Built-in Protection:


Dry-Run Protection: Sensors stop the motor if the well water level drops too low.


Soft Start: Prevents the "water hammer" effect and electrical surges, extending the life of your plumbing and motor.


Tank Full Sensor: Automatically stops pumping when your storage tank is full.





4. Ideal Applications


Hybrid Off-Grid Farms: Use solar for 90% of the work, but keep a generator backup for critical irrigation during long rainy seasons.


Remote Communities: Reliable village water kiosks that can switch to grid power if the community grows beyond solar capacity.


Domestic Use: Ensuring high-pressure water for large estates or apartments where grid power is unstable.



5. Installation Checklist


Cable: Use a high-quality 4-core waterproof cable to handle the dual power signals.


Voltage Range: Ensure your solar array output matches the controller''s DC range (typically 60V–380V DC or 90V–440V VOC).


Controller: If the controller is external, mount it in a shaded, ventilated area to prevent overheating during high-noon operation.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-1-1-1-1-1-4-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12386","Product Category":"Hybrid Submersible Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"800W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1458, 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-600W (0.75HP)', 'Doyin DC Stainless Steel Submersible Pump 4SPS4 — 4SPS4: DC Stainless Steel Submersible Pump 4SPS4-5-600W (0.75HP)', 'doyin-dc-stainless-steel-submersible-pump-4sps4', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-stainless-steel-submersible-pump-4sps4/', '12382', 64, 'DC Stainless Steel Submersible Pump', 34000, 34000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'DC Stainless Steel Submersible Pump 4SPS4-5-800W (1.0HP)', 'The Doyin DC Stainless Steel Submersible Pump 4SPS4 is a professional-grade, solar-optimized borehole pump. It is distinguished from other models by its Stainless Steel Impellers, which provide significantly higher durability and resistance to abrasive particles (like sand) compared to plastic impellers.
The nomenclature "4SPS4" typically breaks down as: 4 (4-inch diameter), S (Submersible), P (Professional/Premium series), S (Stainless steel impellers), and 4 (Rated flow of 4.0–4.5 m3/h).

1. Key Technical Specifications
While the specific "Head" (vertical lift) depends on the motor wattage, the 4SPS4 series generally follows these parameters:


Rated Flow Rate: 4.0 to 4.5 m3/h (4,000–4,500 Liters per hour).


Voltage Options: Available in 48V, 72V, 110V, or 216V DC configurations.


Power Range: Typically ranges from 750W (1.0HP) to 2200W (3.0HP).


Max Head Capacity:


750W Model: Up to 90–110 meters.


1500W Model: Up to 180–210 meters.


2200W Model: Up to 280 meters.





2. Premium Material Construction
The "SPS" designation marks this as an all-stainless steel unit, designed for longevity in deep wells.







Component
Material
Benefit




Impellers
AISI 304 Stainless Steel
Superior resistance to sand abrasion and high-pressure wear.


External Casing
AISI 304 Stainless Steel
Prevents rust and mineral buildup in the well.


Pump Shaft
AISI 316 / 304 Stainless Steel
Ensures high torque strength and zero corrosion.


Motor
Permanent Magnet Brushless DC
25% more efficient than standard AC motors; maintenance-free.









3. Professional Features


Sand Resistance: The precision-cast stainless steel impellers are much harder than plastic, allowing the pump to handle water with higher sand content (up to 150g/m3) without losing efficiency.


Built-in MPPT Controller: Usually paired with an external intelligent controller that maximizes the energy harvest from solar panels and provides:


Dry-run Protection: Sensors stop the pump if the water level drops too low.


Tank Full/Well Low Sensors: Automatically starts/stops the pump based on water levels.


Soft Start: Prevents mechanical shock and extends the life of the motor.




Encapsulated Motor: The motor is oil-filled or resin-filled (food-grade) to ensure perfect cooling and waterproof sealing at extreme depths.



4. Ideal Applications


Industrial Water Supply: Reliable delivery for factories or processing plants.


Professional Irrigation: Large-scale farms requiring consistent high-pressure flow.


High-Rise Buildings: Boosting water to very high-altitude storage tanks.


Deep Borehole Projects: Specifically for wells deeper than 150 meters where plastic impellers might fail under pressure.



5. Solar Sizing Guide
To run a 4SPS4 efficiently, your solar array should be roughly 1.3x to 1.5x the wattage of the motor:


For 750W (1HP) Pump: Use ~1100W–1200W of solar panels.


For 1500W (2HP) Pump: Use ~2000W–2200W of solar panels.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-2-1-1-4-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12382","Product Category":"DC Stainless Steel Submersible Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"600W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1451, 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-600W (0.75HP)', 'Doyin DC Submersible Pump 4SDS5 — 4SDS5: DC Submersible Pump 4SDS5-600W (0.75HP)', 'doyin-dc-submersible-pump-4sds5', '', NULL, 'https://shantisdesigns.co.ke/product/doyin-dc-submersible-pump-4sds5/', '12375', 60, 'DC Submersible Pump', 23000, 23000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Doyin DC Submersible Pump 4SDS5', 'The Doyin DC Submersible Pump 4SDS5 is a high-efficiency, solar-powered borehole pump designed for deep-well water extraction. Unlike the AC versions (4SDM), this "SDS" series utilizes a Brushless DC (BLDC) motor, allowing it to be powered directly by solar panels through an MPPT (Maximum Power Point Tracking) controller.
The nomenclature "4SDS5" typically indicates: 4 (4-inch diameter), SD (Submersible Deep-well), S (Solar/DC), and 5 (Rated flow of 5 m3/h).
1. Technical Performance
The 4SDS5 is a "high-flow" series. While the maximum "Head" (vertical lift) varies based on the wattage (600W to 2200W), the flow rate remains a core strength.


Rated Flow Rate: 5 m3/h (5,000 Liters per hour).


Power Options: Common models include 600W (0.75HP), 800W (1.0HP), 1100W (1.5HP), and 2200W (3.0HP).


Voltage Range: Typically operates on DC voltages ranging from 48V to 280V (depending on the specific motor wattage).


Max Head Capacity: * 600W Model: ~55 meters.


800W Model: ~80 meters.


1500W Model: ~168 meters.


2200W Model: ~235 meters.




2. Engineering & Material Build
These pumps are built for long-term submersion in harsh borehole environments.


Motor: Permanent Magnet Brushless DC Motor. It is more efficient than standard AC motors, runs cooler, and has a longer lifespan due to the lack of carbon brushes.


Pump Body: High-grade AISI 304 Stainless Steel for the external casing, shaft, and coupling to prevent rust and corrosion.


Impeller System: Usually features "Ordinary" or "Centrifugal" impellers made of high-strength technopolymer or stainless steel, designed to handle clean water with high efficiency.


Internal Protection: Most professional 4SDS5 kits include an external or internal controller with Dry-Run Protection (stops the pump if the well goes dry) and Over-voltage/Under-voltage protection.


3. Professional Advantages


Zero Operating Cost: Powered entirely by renewable energy; ideal for off-grid farms, remote villages, and livestock watering.


Soft Start Technology: The DC controller ensures a "soft start," preventing the high-current spikes common in AC pumps that can damage equipment over time.


MPPT Efficiency: The controller constantly adjusts the voltage and current to ensure the pump extracts the maximum possible power from the solar panels, even in cloudy conditions.


4. Installation & Solar Sizing
To achieve the rated 5,000 L/h flow, the solar array must be sized correctly.







Pump Power
Recommended Solar Array
Controller Type




600W (0.75HP)
900W - 1200W of Panels
48V/72V MPPT


800W (1.0HP)
1200W - 1500W of Panels
72V/110V MPPT


1500W (2.0HP)
2000W - 2500W of Panels
110V/150V MPPT








5. Primary Applications


Agriculture: Large-scale crop irrigation and greenhouse water supply.


Livestock: Automatic watering systems for ranches and poultry farms.


Domestic: Filling overhead storage tanks for homes and apartments in areas with no grid power.


Community Projects: Solar-powered water kiosks and village water distribution.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/1-3-1-1-2-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"Doyin","Model / SKU":"12375","Product Category":"DC Submersible Pump","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"600W","Rated Voltage":"230V AC / 48V DC Nominal","Motor Type":"Brushless DC / AC Hybrid Permanent Magnet Submersible","Impeller Material":"304 Stainless Steel Multi-Stage","Controller Included":"Smart MPPT Auto-Restart Dry-Run Protection"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1450, 'ECOFLOW DELTA PRO 3', 'ECOFLOW DELTA PRO 3', 'ecoflow-delta-pro-3-uk-efd521', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-delta-pro-3-uk-efd521/', '12374', 69, 'Ecoflow Powerback up', 461700, 461700, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW DELTA PRO 3 UK (EFD521)', 'ECOFLOW DELTA PRO 3 UK (EFD521)
Delta pro 3
AC output 4000W
Capacity 4096Wh
Expandable capacity upto 12kwh
Output ports 12
Recharge time 0-100 2.6hr
Price 461,700', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-21.10.38-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12374","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1449, 'ECOFLOW EFE2000 - UK', 'ECOFLOW EFE2000 - UK', 'ecoflow-efe2000-uk-1449', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-efe2000-uk-1449/', '12373', 69, 'Ecoflow Powerback up', 150000, 150000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Genuine ECOFLOW EFE2000 - UK supplied and backed by Shantis Designs Solar Solutions Kenya. Includes official manufacturer warranty, EPRA compliance, and fast delivery across Nairobi and all 47 counties.', 'Genuine ECOFLOW EFE2000 - UK supplied and backed by Shantis Designs Solar Solutions Kenya. Includes official manufacturer warranty, EPRA compliance, and fast delivery across Nairobi and all 47 counties. Engineered for high-temperature African conditions, residential backup, commercial load shifting, and off-grid reliability. Available for immediate dispatch from our Nairobi showroom (Royal King Building, Luthuli Avenue) and Dev Towers HQ (Biashara Street).', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/IMG-20251206-WA0023-1-1.jpg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12373","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1448, 'ECOFLOW DELTA 3 PLUS', 'ECOFLOW DELTA 3 PLUS', 'ecoflow-delta-3-plus-1448', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-delta-3-plus-1448/', '12372', 69, 'Ecoflow Powerback up', 109350, 109350, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW DELTA 3 PLUS UK (EFDELTA3P-UK)', 'ECOFLOW DELTA 3 PLUS UK (EFDELTA3P-UK)
Delta 3 plus
AC output 1800W
Capacity 1024Wh
Output ports 13
Recharge time 0-100 56min
Price 109,350', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.52.57-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12372","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1447, 'ECOFLOW DELTA 3', 'ECOFLOW DELTA 3', 'ecoflow-delta-3', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-delta-3/', '12371', 69, 'Ecoflow Powerback up', 97200, 97200, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW DELTA 3 UK (EFDELTA3-UK)', 'ECOFLOW DELTA 3 UK (EFDELTA3-UK)
Delta 3
AC output 1800W
Capacity 1024Wh
Output ports 13
Recharge time 0-100 56min
Price 97,200', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.50.11-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12371","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1446, 'ECOFLOW DELTA PRO', 'ECOFLOW DELTA PRO', 'ecoflow-delta-pro', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-delta-pro/', '12370', 69, 'Ecoflow Powerback up', 291400, 291400, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW DELTA PRO (DELTAPRO-UK-C20)', 'ECOFLOW DELTA PRO (DELTAPRO-UK-C20)
Delta pro
AC output 3600W
Capacity 3600Wh
Expendable battery capacity upto 25kwh
Output ports 14
Recharge time 0-100 1.9hr
Price 291,400', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.57.02-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12370","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1445, 'ECOFLOW DELTA 2 MAX', 'ECOFLOW DELTA 2 MAX', 'ecoflow-delta-2-max-1445', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-delta-2-max-1445/', '12369', 69, 'Ecoflow Powerback up', 158000, 158000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW DELTA 2 MAX (EFDELTA2Max-UK)', 'ECOFLOW DELTA 2 MAX (EFDELTA2Max-UK)
Delta 2 Max
AC output 2400W
Capacity 2048Wh
Output ports 13
Recharge time 80min
Price 158,000', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.46.50-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12369","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1444, 'ECOFLOW DELTA 2', 'ECOFLOW DELTA 2', 'ecoflow-delta-2-1444', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-delta-2-1444/', '12368', 69, 'Ecoflow Powerback up', 86000, 86000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Genuine ECOFLOW DELTA 2 supplied and backed by Shantis Designs Solar Solutions Kenya. Includes official manufacturer warranty, EPRA compliance, and fast delivery across Nairobi and all 47 counties.', 'ECOFLOW DELTA 2 (ZMR330-UK)
Delta 2
AC output 1800W
Capacity 1024Wh
Output ports 13
Recharge time 0-100 80min
Price 86,000', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.41.23-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12368","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1443, 'ECOFLOW EFE980', 'ECOFLOW EFE980', 'ecoflow-efe980-1443', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-efe980-1443/', '12367', 69, 'Ecoflow Powerback up', 64000, 64000, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW EFE980-UK (EF-RV-H08-1) INCLUDES FREE GIFT RECHARGEABLE 6 IN 1 FAN WITH LED LAMP', 'ECOFLOW EFE980-UK (EF-RV-H08-1) INCLUDES FREE GIFT RECHARGEABLE 6 IN 1 FAN WITH LED LAMP
E980
AC output 500W
Capacity 980Wh
Output ports 13
Recharge time 0-100 2hr
Price 64,000', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.44.24-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12367","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1442, 'ECOFLOW RIVER 3 PLUS', 'ECOFLOW RIVER 3 PLUS', 'ecoflow-river-3-plus-1442', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-river-3-plus-1442/', '12366', 69, 'Ecoflow Powerback up', 40600, 40600, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW RIVER 3 PLUS (EFRIVER3Plus-UK-CBOX)', 'ECOFLOW RIVER 3 PLUS (EFRIVER3Plus-UK-CBOX)
River 3 plus
AC output 600W
Capacity 286Wh
Output ports 7
Recharge time 0-100 60min
Price 40,600', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.35.46-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12366","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1441, 'ECOFLOW RIVER 3', 'ECOFLOW RIVER 3', 'ecoflow-river-3', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-river-3/', '12365', 69, 'Ecoflow Powerback up', 32100, 32100, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW RIVER 3 (EFRIVER3-UPS-EN-Cbox)', 'ECOFLOW RIVER 3 (EFRIVER3-UPS-EN-Cbox)
River 3
AC output 300W
Capacity 245Wh
Output ports 5
Recharge time 0-100 60min
Price 32,100', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.38.53-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12365","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1440, 'ECOFLOW RIVER 2 PRO', 'ECOFLOW RIVER 2 PRO', 'ecoflow-river-2-pro-1440', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-river-2-pro-1440/', '12364', 69, 'Ecoflow Powerback up', 59100, 59100, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW RIVER 2 PRO (ZMR620-B-UK)', 'ECOFLOW RIVER 2 PRO (ZMR620-B-UK)
River 2 pro
AC output 800W
Capacity 768Wh
Output ports 10
Recharge time 0-100 70min
Price 59,100', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.30.18-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12364","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1439, 'ECOFLOW RIVER 2 MAX', 'ECOFLOW RIVER 2 MAX', 'ecoflow-river-2-max-1439', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-river-2-max-1439/', '12363', 69, 'Ecoflow Powerback up', 41450, 41450, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'ECOFLOW RIVER 2 MAX (ZMR610-B-UK)', 'ECOFLOW RIVER 2 MAX (ZMR610-B-UK)
River 2 max
AC output 500W
Capacity 512Wh
Output ports 9
Recharge time 0-100=60min
Price 41,450', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.26.47-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12363","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1438, 'ECOFLOW RIVER 2', 'ECOFLOW RIVER 2', 'ecoflow-river-2-1438', '', NULL, 'https://shantisdesigns.co.ke/product/ecoflow-river-2-1438/', '12362', 69, 'Ecoflow Powerback up', 27300, 27300, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Genuine ECOFLOW RIVER 2 supplied and backed by Shantis Designs Solar Solutions Kenya. Includes official manufacturer warranty, EPRA compliance, and fast delivery across Nairobi and all 47 counties.', 'ECOFLOW RIVER 2 (ZMR600-B-UK)
AC output 300W
Capacity 256Wh
Output ports 5
Price 27,300
Recharge time 0-100 =60min', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/WhatsApp-Image-2026-01-06-at-20.15.36-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"EcoFlow","Model / SKU":"12362","Product Category":"Ecoflow Powerback up","Warranty":"5 Years Manufacturer Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Build Standard":"Heavy-Duty IP65 Weatherproof Outdoor/Indoor Rating"}'::jsonb, FALSE, '5 Years Manufacturer Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1436, 'JA Bifacial Solar Panel - JA 595W Bifacial Solar Panel', 'JA Bifacial Solar Panel - JA 595W Bifacial Solar Panel', 'ja-bifacial-solar-panel-solar-ja-595w-bifacial-solar-panel', '', NULL, 'https://shantisdesigns.co.ke/product/ja-bifacial-solar-panel-solar-ja-595w-bifacial-solar-panel/', '12360', 34, 'Solar Panels', 10710, 10710, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'JA Solar Bifacial Series: Double the Surface, Double the Power
The JA Solar Bifacial range (including the DeepBlue 3.0 and 4.0x series) is engineered ', 'JA Solar Bifacial Series: Double the Surface, Double the Power
The JA Solar Bifacial range (including the DeepBlue 3.0 and 4.0x series) is engineered for those who want the absolute lowest Levelized Cost of Energy (LCOE). By capturing reflected light from the ground or nearby surfaces, these panels turn "wasted" light into usable electricity.

Available Models & Performance







Model Series
Wattage Range
Best For




JAM72D30 Series
530W – 560W
Large residential & commercial rooftops.


JAM72D40 Series
580W – 610W
Solar farms, carports, & high-yield projects.


JAM66D46 Series
680W – 700W+
Industrial utility & large-scale off-grid arrays.



 

Why Choose JA Solar Bifacial?





Bifacial Gain: Depending on the surface underneath (like white gravel or a light-colored roof), you can gain an extra 10–25% in power generation from the rear side.


Dual-Glass Design: Instead of a plastic backsheet, these panels use glass on both sides. This makes them incredibly durable and resistant to the harsh UV rays and humidity often found in Kenya.


N-Type TOPCon Technology: The newer 4.0x models feature N-type cells which have lower degradation rates and perform better in high-temperature environments.


Superior Shading Tolerance: Built with half-cut cell architecture and multiple busbars (MBB), these panels continue to perform even if one half of the panel is temporarily shaded.


Unbeatable Warranty: JA Solar offers an industry-leading 12-year product warranty and a 30-year linear power output warranty, guaranteeing at least 87% efficiency after three decades.


How to Maximize Your Bifacial Yield
To get the most out of your purchase from Shantis Designs Solar, follow these pro installation tips:


Elevation is Key: To allow light to reach the back of the panel, mount them at least 0.5m to 1m above the mounting surface.


Surface Reflectivity (Albedo): The "whiter" the surface below, the better. Installing over white-painted roofs, light-colored tiles, or white gravel will significantly boost your rear-side production.


Pole Mounting/Carports: Bifacial panels perform exceptionally well on carports or ground-mounted racks where the back of the panel is completely open to reflected light.


Avoid Obstructions: Ensure that mounting rails do not run directly behind the cells, as this creates shadows on the rear side and reduces your "Bifacial Gain."


The Shantis Designs Solar Advantage
As a trusted provider of JA Solar products, we ensure every panel is flash-tested and verified.


Custom System Design: We don''t just sell panels; we calculate the optimal tilt and height for your specific location to ensure you get the maximum bifacial benefit.


Inverter Matching: We help you select high-input inverters that can handle the extra current generated by the back of the panels.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/download-18-1-1.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"12360","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"595W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, FALSE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1423, 'Golden Solar Monocrystalline — solar: Golden Solar Monocrystalline 100w', 'Golden Solar Monocrystalline — solar: Golden Solar Monocrystalline 100w', 'golden-solar-monocrystalline-solar-golden-solar-monocrystalline-100w', '', NULL, 'https://shantisdesigns.co.ke/product/golden-solar-monocrystalline-solar-golden-solar-monocrystalline-100w/', '12347', 34, 'Solar Panels', 3000, 3000, NULL, 0, TRUE, 'outofstock', 'simple', 'visible', 'Genuine Golden Solar Monocrystalline — solar: Golden Solar Monocrystalline 100w supplied and backed by Shantis Designs Solar Solutions Kenya. Includes official manufacturer warranty, EPRA compliance, and fast delivery across Nairobi and all 47 counties.', 'Golden Solar Monocrystalline Series: German Engineering, Superior Efficiency
Empower your home or business with the Golden Solar Monocrystalline range, available at Shantis Designs Solar. Known for its sleek black aesthetics and industry-leading performance, Golden Solar panels are designed to harvest more energy per square meter, even in low-light or high-heat environments.

Available Models at Shantis Designs Solar
We stock a variety of sizes to fit every project, from small portable backups to large-scale residential arrays:


150W / 200W: Perfect for small home lighting and RVs.


350W (Standard Series): Our best-seller for balanced home energy systems.


550W+ (Next-Gen Series): High-wattage panels for industrial and massive off-grid setups.


Why Golden Solar Stands Out


High-Efficiency HJT Technology: Utilizing N-type heterojunction cells, these panels achieve efficiencies of up to 22.8%, significantly higher than standard monocrystalline panels.


German-Engineered Durability: Built to "All-Weather" standards, these panels feature anti-reflective tempered glass and a reinforced aluminum frame that resists high wind and snow loads.



Exceptional Low-Light Performance: While other panels stop producing in the early evening or on cloudy days, Golden Solar’s advanced cell structure continues to harvest energy in sub-optimal conditions.



Low Temperature Coefficient: Designed to stay cool. These panels lose less efficiency in the heat, making them ideal for the Kenyan climate.



25-Year Performance Warranty: Backed by a linear power warranty, ensuring your investment remains productive for decades.


Technical Specifications (Typical 350W Model)







Feature
Details




Cell Type
Monocrystalline (HJT/Mono PERC)


Max Power (Pmax)
350W (Range up to 730W available)


Module Efficiency
Up to 22.5%


Max Power Voltage (Vmp)
36V - 42V (model dependent)


Frame
Anodized Aluminum Alloy (Black/Silver)


Operating Temp
-40°C to +85°C


Glass
3.2mm High-Transmission, AR Coated








Installation & Maintenance Guide


Orientation: For maximum yield in the Southern Hemisphere (Kenya), mount your panels facing True North at an angle of roughly 15° to 25°.


Series vs. Parallel: * Series: Increases voltage (best for MPPT controllers and long cable runs).


Parallel: Increases current (best for smaller PWM systems or mixed-shading environments).




Inverter Pairing: Ensure your inverter’s DC input voltage matches the total VOC (Open Circuit Voltage) of your panel string.


Cleaning: Monocrystalline panels are sensitive to "hot spots." Wipe away dust, bird droppings, or leaves monthly using water and a soft cloth to maintain peak output.



Shading: Even a small amount of shade on a single cell can reduce the output of the entire string. Ensure no trees or chimneys cast shadows during peak sun hours (10 AM – 4 PM).


The Shantis Designs Solar Difference
At Shanti’s Designs Solar, we verify the "German Tech" authenticity of every Golden Solar panel we sell. We provide:


On-Site Sizing: We help you calculate how many panels you need to run your specific appliances.


Quality Mounting: We provide the rails and clamps that prevent frame stress and micro-cracks.


Competitive Pricing: Get premium monocrystalline tech at the best rates in the region.', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/JA-Solar-565W-Bifacial-Solar-Panel-JAM72D40-565-MB-1-1-1.webp', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"12347","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"Commercial Grade Standard","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, FALSE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, title, slug, date, parent_id, permalink, sku, category_id, category_name, price, regular_price, sale_price, stock, manage_stock, stock_status, product_type, product_visibility, short_description, description, image_url, gallery, specs, featured, warranty, weight, dimensions) VALUES (1422, 'Cekoa Noncrystalline 55W', 'Cekoa Noncrystalline 55W', 'cekoa-noncrystalline-55w-1422', '', NULL, 'https://shantisdesigns.co.ke/product/cekoa-noncrystalline-55w-1422/', '12346', 34, 'Solar Panels', 1375, 1375, NULL, 25, TRUE, 'instock', 'simple', 'visible', 'Genuine Cekoa Noncrystalline 55W supplied and backed by Shantis Designs Solar Solutions Kenya. Includes official manufacturer warranty, EPRA compliance, and fast delivery across Nairobi and all 47 counties.', 'Genuine Cekoa Noncrystalline 55W supplied and backed by Shantis Designs Solar Solutions Kenya. Includes official manufacturer warranty, EPRA compliance, and fast delivery across Nairobi and all 47 counties. Engineered for high-temperature African conditions, residential backup, commercial load shifting, and off-grid reliability. Available for immediate dispatch from our Nairobi showroom (Royal King Building, Luthuli Avenue) and Dev Towers HQ (Biashara Street).', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/10/images-5-2.jpeg', '[]'::jsonb, '{"Brand / Manufacturer":"Shantis Certified Partner","Model / SKU":"12346","Product Category":"Solar Panels","Warranty":"25 Years Performance Warranty","Certification":"EPRA Class T3 & KEBS Approved","Power / Capacity":"55W","Rated Voltage":"230V AC / 48V DC Nominal","Cell Technology":"N-Type Monocrystalline Half-Cut PERC/TOPCon","Module Efficiency":"22.6% High Irradiance","Protection Rating":"IP68 Junction Box / Anodized Aluminum Frame"}'::jsonb, FALSE, '25 Years Performance Warranty', '', '') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (1, 'Tatu City Solar Installation', 'tatu-city-solar-installation', 'Modern Residence — Tatu City', 'Tatu City · Kiambu County', 'residential', 'Solar Installation', '10kW Hybrid PV + 15kWh Lithium Valley Storage', '18x 580W N-Type Monocrystalline Bifacial Panels', 'Deye 10kW Hybrid Inverter (Low Voltage)', '15.36kWh Wall-Mounted LiFePO4 Battery Bank', 'https://shantisprojects.lovable.app/__l5e/assets-v1/0f44c6c4-ebd7-4883-bae0-17c6dbe786a5/tatu-city.jpg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/0f44c6c4-ebd7-4883-bae0-17c6dbe786a5/tatu-city.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.34.18.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.34.20.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.34.18-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.34.17.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.34.17-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.47-1.jpeg"]'::jsonb, '2026', '85% Bill Reduction + 24/7 Blackout Immunity', 'A rooftop solar installation designed to deliver dependable clean energy and backup power for a modern Tatu City residence. Rooftop PV array with hybrid inverter and lithium backup.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (2, 'Secondary School Solar Installation', 'secondary-school-solar-installation-in-ruiru', 'Secondary School — Ruiru Sub-County', 'Ruiru Sub-County · Kiambu', 'commercial', 'Institutions · Solar Installation', '24kW Institutional Rooftop Solar Array', '42x 590W Horay N-Type Monocrystalline Panels', 'Three-Phase 25kW Hybrid Solar Inverter', '30kWh High-Voltage Rack Lithium Storage', 'https://shantisprojects.lovable.app/__l5e/assets-v1/42c480d8-3867-4b6a-861f-6806fe336bb4/ruiru-secondary-school.jpeg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/42c480d8-3867-4b6a-861f-6806fe336bb4/ruiru-secondary-school.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.49-2.jpeg"]'::jsonb, '2026', 'Uninterrupted Power for Laboratories, Admin & Dormitories', 'A school rooftop solar installation completed by our field team in Ruiru Sub-County to support reliable power for learning facilities, classrooms, and computer labs.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (3, 'Thika Road Residential Solar Installation', 'thika-road-residential-solar-installation', 'Private Homeowner — Thika Road', 'Thika Road · Nairobi', 'residential', 'Solar Installation', '6kW Hybrid Solar Backup System', '12x 550W Monocrystalline Half-Cut Solar Panels', 'Must PV1800 / 6kW Hybrid MPPT Inverter', '10.24kWh Lithium Valley Wall-Mounted Battery', 'https://shantisprojects.lovable.app/__l5e/assets-v1/4650b33c-0d40-47c5-96df-890cad0ba5c6/thika-road-residential.jpeg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/4650b33c-0d40-47c5-96df-890cad0ba5c6/thika-road-residential.jpeg"]'::jsonb, '2026', '80% Monthly KPLC Tariff Savings', 'A carefully fitted residential rooftop array along Thika Road providing dependable solar generation and automatic zero-transfer-time backup power for the home.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (4, 'Subukia Solar Installation', 'subukia-solar-installation', 'Residential & Farm Homestead — Subukia', 'Subukia · Nakuru County', 'residential', 'Solar Installation', '5kW Off-Grid Capable Rooftop Array', '10x 560W Horay N-Type Solar Panels', '5kVA Hybrid MPPT Solar Inverter', '5.12kWh LiFePO4 Deep-Cycle Storage', 'https://shantisprojects.lovable.app/__l5e/assets-v1/eab05f18-b3b3-4c8b-a86f-3f4883db5731/subukia-solar-installation.jpeg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/eab05f18-b3b3-4c8b-a86f-3f4883db5731/subukia-solar-installation.jpeg"]'::jsonb, '2026', '100% Daytime Energy Independence', 'Our installation team fitting a rooftop solar array for reliable clean power in Subukia, engineered for rural grid stability and agricultural household demands.', FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (5, 'Waiyaki Way Solar Installation', 'waiyaki-way-solar-installation', 'Commercial & Residential Property — Waiyaki Way', 'Waiyaki Way · Nairobi', 'residential', 'Solar Installation', '8kW Hybrid Rooftop PV System', '14x 580W Tier-1 Monocrystalline Panels', '8kVA MUST PV1900 EXP Hybrid Inverter', '10.24kWh Lithium Valley LiFePO4 Battery', 'https://shantisprojects.lovable.app/__l5e/assets-v1/ccac9a6d-b2ee-4a2e-9046-dbbbb1c6394e/waiyaki-way-solar-installation.jpeg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/ccac9a6d-b2ee-4a2e-9046-dbbbb1c6394e/waiyaki-way-solar-installation.jpeg"]'::jsonb, '2026', '75% Reduction in Monthly Utility Bills', 'Shantis Designs technicians preparing and mounting high-efficiency solar panels for a Waiyaki Way installation in Nairobi.', FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (6, 'Lower Kabete Solar Installation', 'lower-kabete-solar-installation', 'Executive Residence — Lower Kabete', 'Lower Kabete · Nairobi', 'residential', 'Solar Installation', '12kW Three-Phase Hybrid System', '20x 600W Bifacial Monocrystalline Panels', '12kW Deye Three-Phase Hybrid Inverter', '15.36kWh Lithium Valley Battery Bank', 'https://shantisprojects.lovable.app/__l5e/assets-v1/9b29c3d8-ccb2-4c94-881c-2d4e1b1e25d8/lower-kabete-solar-installation.jpeg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/9b29c3d8-ccb2-4c94-881c-2d4e1b1e25d8/lower-kabete-solar-installation.jpeg"]'::jsonb, '2026', '90% Grid Independence', 'A heavy-duty rooftop solar array installed and secured on pitched tiles by our EPRA-certified engineering team in Lower Kabete.', FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (7, 'Nakuru Resident Solar Installation', 'nakuru-resident-solar-installation', 'Private Residence — Nakuru', 'Nakuru County', 'residential', 'Solar Installation', '10kW Full Off-Grid Capable Home System', '16x 565W JA Solar Bifacial Panels', 'Dual Hybrid MPPT Inverter Cabinet', 'Dyness / Lithium Rack Storage Cabinet', 'https://shantisprojects.lovable.app/__l5e/assets-v1/0fc51fdd-122c-4f07-9ce4-b8bf353352bd/nakuru.jpg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/0fc51fdd-122c-4f07-9ce4-b8bf353352bd/nakuru.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.54-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.09.00.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.59.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.59-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.59-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.58.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.58-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.58-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.57.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.57-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.57-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.56.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.56-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.55.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.55-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.54.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.53.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.53-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.08.53-1.jpeg"]'::jsonb, '2026', 'Full Off-Grid Autonomy & Backup', 'Full off-grid capable home system in Nakuru County featuring high-efficiency solar panels, Dyness lithium storage, and custom inverter cabinet.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (8, 'PCEA Kahawa West Solar Installation', 'pcea-kahawa-west-solar-installation', 'PCEA Kahawa West Parish', 'Kahawa West · Nairobi County', 'commercial', 'Solar Installation', '15kW Institutional Solar & Backup System', '26x 590W Horay N-Type Solar Panels', '12kVA Three-Phase Hybrid Inverter', '16kWh Lithium Valley W16-E5 Storage', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.52.11-1.jpeg', '["https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.52.11-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.36.05-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.36.05-3.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.29-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.52.11.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.29-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.29-3.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.29.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.26-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.26-3.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.27-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.27-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.27.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.28-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.28-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.28-3.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.28.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.26-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.26.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.22-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-24-at-14.49.22.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.16.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.17-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.18.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.17-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.19.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.20-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.49.21.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.36.04-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.36.04-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.36.05-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.49-1.jpeg"]'::jsonb, '2026', 'Uninterrupted Sanctuary Sound, Lighting & Offices', 'Institutional solar power and battery backup system keeping church services, community halls, and parish offices running seamlessly through grid outages.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (9, 'Kirinyaga Solar Installation', 'kirinyaga-solar-installation', 'Rural Homestead — Kirinyaga', 'Kirinyaga County', 'residential', 'Solar Installation', '5kW Rural Residential Hybrid System', '8x 560W Monocrystalline Panels', '5kW Hybrid Solar Inverter', '5.12kWh Wall-Mounted Lithium Battery', 'https://shantisprojects.lovable.app/__l5e/assets-v1/0dae8028-c48f-4465-b2a9-24d0873f4b6e/kirinyaga.jpg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/0dae8028-c48f-4465-b2a9-24d0873f4b6e/kirinyaga.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.31.20-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.31.20-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-31-at-19.31.20.jpeg"]'::jsonb, '2026', '85% Electricity Cost Reduction', 'Rural residential solar system in Kirinyaga County engineered for long-term reliability, clean power, and low maintenance.', FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (10, 'Mwihoko Water Heater Installation', 'mwihoko-water-heater-installation', 'Residential Home — Mwihoko', 'Mwihoko · Kiambu County', 'water_heating', 'Solar Water Heating', '300L High-Pressure Evacuated Tube Solar Water Heater', '30x Borosilicate Vacuum Collector Tubes', 'Thermosyphon / Pressurized Roof Manifold', '72-Hour High-Density Polyurethane Thermal Retention', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.50.jpeg', '["https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.50.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.51.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.48-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.51-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.51-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.51-3.jpeg"]'::jsonb, '2026', 'Cuts Electric Water Heating Bills Year-Round', 'Evacuated tube solar water heating system installed in Mwihoko, Kiambu County, cutting electric water heating bills year-round.', FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (11, 'Lower Kabete Water Installation', 'lower-kabete-water-installation', 'Residential Estate — Lower Kabete', 'Lower Kabete · Nairobi County', 'agricultural', 'Water Installation', 'Doyin Hybrid Solar Submersible Pumping System', '8x 550W Solar Pumping Array', 'Doyin MPPT Automatic Pump Control Unit', 'Direct Solar Drive + Elevated Tank Float Sensor', 'https://shantisprojects.lovable.app/__l5e/assets-v1/fb447bc0-6cb0-4aa7-b06e-08cb9baad0c8/kabete-water.jpg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/fb447bc0-6cb0-4aa7-b06e-08cb9baad0c8/kabete-water.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.48.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-01-at-20.18.36.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-01-at-20.18.36-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-01-at-20.18.37-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-01-at-20.18.37.jpeg"]'::jsonb, '2026', '100% Solar-Powered Continuous Water Supply', 'Pumped water system integrated with solar generation in Lower Kabete, Nairobi County for continuous domestic and irrigation water supply.', FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (12, 'Warehouse Storage System', 'warehouse', 'Commercial Warehouse Facility — Nairobi', 'Nairobi County', 'commercial', 'Storage', '50kW / 100kWh Commercial BESS Storage Bank', 'Commercial Rooftop PV Integration', 'Deye High-Voltage Three-Phase Hybrid Inverter', 'High-Voltage Rack-Mounted Lithium Battery Bank', 'https://shantisprojects.lovable.app/__l5e/assets-v1/681c8ff1-213e-4cc8-9dea-1ff8cc025506/warehouse.jpg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/681c8ff1-213e-4cc8-9dea-1ff8cc025506/warehouse.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.44.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.47.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.54.43.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.54.42.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.54.41-1.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.54.42-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-24-at-14.54.40.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.54.43-2.jpeg","https://shantisdesigns.co.ke/wp-content/uploads/2026/07/WhatsApp-Image-2026-06-24-at-14.54.43-1.jpeg"]'::jsonb, '2026', 'Peak Tariff Load Shifting & Complete Outage Cover', 'Battery energy storage bank sized for commercial load shifting, three-phase machinery backup, and outage cover in Nairobi County.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (13, 'Gilgil Water Installation', 'gilgil-water-installation', 'Residential Property — Gilgil', 'Gilgil · Nakuru County', 'water_heating', 'Solar Water Heating', '250L Rooftop Solar Water Heating System', '25x High-Absorption Vacuum Collector Tubes', 'Integrated Pressure Relief & Controller', 'Insulated Stainless Steel Inner Tank', 'https://shantisprojects.lovable.app/__l5e/assets-v1/f4f32fd9-f869-48e6-87d1-2235d7abf26a/gilgil-water-installation.jpeg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/f4f32fd9-f869-48e6-87d1-2235d7abf26a/gilgil-water-installation.jpeg"]'::jsonb, '2026', 'Zero Electric Geyser Power Consumption', 'A rooftop solar water-heating system installed in Gilgil for reliable, energy-efficient hot water throughout the year.', FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, slug, client, location, category, category_name, system_size, panels_count, inverter_specs, battery_specs, image_url, gallery, completion_date, kplc_savings, description, featured) VALUES (14, 'Our Nairobi Showroom & Technical Center', 'our-showroom', 'Shantis Designs Solar Solutions Kenya', 'Royal King Building, Luthuli Street · Nairobi', 'commercial', 'Showroom', 'Full Display of Inverters, Batteries, Panels & Pumps', 'Horay N-Type & JA Solar Live Display', 'Must, Deye, Growatt & Eastman Live Demo Units', 'Lithium Valley, EcoFlow, Allgrand & Eastman Stock', 'https://shantisprojects.lovable.app/__l5e/assets-v1/78fdbbd6-07d9-40dc-87de-9b29f1867f72/showroom.jpg', '["https://shantisprojects.lovable.app/__l5e/assets-v1/78fdbbd6-07d9-40dc-87de-9b29f1867f72/showroom.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/03/img-20260227-wa00424154584533087725265.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/03/img-20260227-wa00484517615218318880645.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/03/img-20260227-wa00531534511933494924361.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/03/img-20260228-wa00412760617974444545944.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/03/img-20260228-wa00401999772275667774067.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/03/IMG-20260227-WA0052.jpg","https://shantisdesigns.co.ke/wp-content/uploads/2026/03/IMG-20260227-WA0053.jpg"]'::jsonb, 'Open Mon–Sat 8am–6pm', 'Walk-In Engineering Consultation & Same-Day Dispatch', 'Come see inverters, batteries, panels, water pumps, and solar water heaters in person at our Nairobi showroom before you buy.', FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO articles (id, title, slug, excerpt, content, author, category, image_url, published_at, read_time, meta_description, tags) VALUES (10009, 'Powering Up My Dreams: Why My Next Shopping Spree is at Shantis Designs Solar Solutions', 'powering-up-my-dreams-why-my-next-shopping-spree-is-at-shantis-designs-solar-solutions', 'Explore why investing in Tier-1 solar panels, Must & Deye hybrid inverters, EcoFlow lithium backups, and Doyin borehole water pumps at Shantis Designs Solar Solutions is the ultimate upgrade for Kenyan homes across Nairobi, Mombasa, Kisumu, Meru & Nakuru.', 'Where would you go on a shopping spree? When people think of a "shopping spree," they usually imagine racks of designer clothes or the latest high-end gadgets. However, if I were to choose where to go on an ultimate shopping spree right now, it wouldn’t be a luxury fashion boutique. Instead, I would head straight to Shantis Designs Solar Solutions. There is something uniquely satisfying about investing in technology that provides long-term independence, sustainability, and significant cost savings. At the heart of any modern home or business is the need for reliable energy, and Shantis Designs Solar Solutions has curated a collection that makes transitioning to renewable energy both exciting and accessible. Walking into their showroom, you aren''t just looking at equipment; you’re looking at the future of "Clean Energy For a Greener Africa". A Premium Selection of Solar Essentials The variety of products available is impressive, covering every link in the solar energy chain. On my spree, the first item on the list would be their high-efficiency solar panels. These sleek, monocrystalline panels are the engines of a solar setup, and seeing them lined up makes you realize how much untapped power is hitting your roof every day. To manage that power, I’d be eyeing their range of solar inverters. The shop features top-tier brands like MUST, Hinen, and Deye, which are renowned for their reliability and smart energy management features. Whether you need a small setup for a home office or a robust system for an entire building, these inverters are the brains that keep everything running smoothly. Of course, no solar system is complete without storage. I’d definitely be loading up on Gel-VRLA batteries from ALLGRAND or the high-performance lithium options from EcoFlow. These batteries ensure that the energy captured during the day stays available through the night or during a blackout. For those with agricultural needs, seeing the Doyin solar water pumps on display is a game-changer for irrigation and sustainable farming. Quality Meets Affordability What makes a spree at Shantis Designs Solar Solutions so appealing is the balance between quality and value. They offer only premium brands—names like JA Solar, Jinko, KSTAR, and Eastman—ensuring that every component is built to last. Despite this focus on high-end hardware, the solutions remain remarkably affordable. It’s an investment that pays for itself through eliminated electricity bills and increased property value. Choosing solar isn''t just a purchase; it''s a lifestyle upgrade. It means saying goodbye to power fluctuations and hello to a cleaner, more reliable way of living. If you are ready to take control of your energy future, I highly recommend visiting them. Contact Information Ready to start your own solar journey? Reach out to the experts today: * Phone: 0115 521 631 * Email: info@shantis.co.ke * Website: shantisdesigns.co.ke * Showroom: Luthuli Avenue, Royal King Building, 2nd Floor, Room 6; or Bishara Street, Dev Towers, 2nd Floor', 'Shantis Designs Engineering Team', 'Solar Guides & Insights', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/03/IMG-20260227-WA0052.jpg', '2026-03-09', '5 min read', 'Shop genuine Tier-1 solar panels, Must & Deye hybrid inverters, Lithium Valley batteries & Doyin borehole pumps at Shantis Designs in Nairobi, Mombasa & Kisumu.', '["Solar Panels Kenya","Shantis Designs","Solar Installation Nairobi Mombasa Kisumu"]'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO articles (id, title, slug, excerpt, content, author, category, image_url, published_at, read_time, meta_description, tags) VALUES (10003, 'Top Reasons to Choose JA Solar Panels in Kenya', 'top-reasons-to-choose-ja-solar-panels-in-kenya', 'Compare genuine Tier-1 JA Solar monocrystalline and bifacial panels (550W–620W) in Kenya. Ideal for high-temperature climates across Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos.', 'As solar energy adoption grows across Kenya, the demand for high-efficiency and long-lasting solar panels continues to rise. Among the top-performing brands globally is JA Solar , a Tier 1 manufacturer known for quality, durability, and advanced photovoltaic technology. At Shantis Designs Solar Solutions , we supply genuine JA Solar panels in Kenya for residential, commercial, and large-scale installations. Whether you''re building a home solar system in Nairobi or installing a commercial solar solution upcountry, JA Solar panels deliver consistent power output and long-term reliability. Why JA Solar Panels Are a Top Choice in Kenya 1. Tier 1 Global Manufacturer JA Solar is internationally recognized as a Tier 1 solar panel manufacturer. This means: Strong financial stability Proven product reliability Bankable solar technology High global installation volume For Kenyan buyers, this translates to peace of mind and long-term investment protection. 2. High Conversion Efficiency JA Solar panels are built using advanced monocrystalline and PERC cell technology, allowing higher sunlight-to-electricity conversion rates. In Kenya’s high-sun conditions, this means: More power generation per square meter Better performance in limited roof space Improved return on investment If you are searching for high-efficiency solar panels in Kenya , JA Solar is among the most reliable options available through Shantis Designs Solar Solutions. 3. Excellent Performance in High Temperatures Kenya’s climate can be hot, especially in regions like Nairobi, Mombasa, Kisumu, and Eastern Kenya. Poor-quality panels lose efficiency in heat. JA Solar panels are engineered with low temperature coefficients, meaning: Minimal efficiency drop in high heat Stable power output during peak sun hours Long-term consistent performance This makes JA Solar panels ideal for both urban and rural solar installations in Kenya. Applications of JA Solar Panels in Kenya JA Solar panels supplied by Shantis Designs Solar Solutions are suitable for: Residential Solar Systems 3kW – 10kW home solar setups Hybrid inverter systems Off-grid homes Commercial & Industrial Projects Office buildings Schools and institutions Hospitals Factories Large-Scale Solar Farms For developers looking for dependable panel performance with strong warranty backing. JA Solar Panel Specifications (Typical Models) Depending on the model, JA Solar panels offer: 550W – 620W capacity options Monocrystalline technology 25-year performance warranty Strong aluminum frame High wind and snow load resistance Shantis Designs Solar Solutions helps clients select the correct wattage based on system size and inverter compatibility. Why Buy JA Solar Panels from Shantis Designs Solar Solutions? There are many sellers in Kenya, but not all guarantee authenticity. When you buy from Shantis Designs Solar Solutions , you get: Genuine JA Solar panels Competitive solar panel prices in Kenya Professional system sizing guidance Technical support Installation consultation We don’t just sell solar panels — we provide complete solar energy solutions. JA Solar Panel Prices in Kenya Prices vary depending on: Wattage (595W,615W AND 620W models) Quantity required Market supply conditions Frequently Asked Questions About JA Solar Panels in Kenya Are JA Solar panels original in Kenya? Yes, Shantis Designs Solar Solutions provides genuine JA Solar panels with manufacturer-backed warranties. How long do JA Solar panels last? JA Solar panels typically come with a 25-year performance warranty and can last even longer with proper maintenance. Are JA Solar panels good for off-grid systems? Yes. They are compatible with off-grid, hybrid, and grid-tied solar inverter systems. Do JA Solar panels work during cloudy days? Yes, although output reduces slightly, they are designed to maintain efficiency in low-light conditions. Installation Support in Nairobi and Across Kenya Shantis Designs Solar Solutions supports customers in: Nairobi Kiambu Machakos Kisumu Mombasa And other regions across Kenya We guide you through proper mounting structure selection, inverter matching, and battery sizing. Conclusion: Invest in Quality Solar Power Choosing the right solar panel is critical for long-term savings and energy independence. JA Solar panels provide: High efficiency Proven reliability Strong warranty protection Excellent Kenyan climate performance For genuine JA Solar panels in Kenya, contact Shantis Designs Solar Solutions today for professional advice and competitive pricing.', 'Shantis Designs Engineering Team', 'Solar Guides & Insights', 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/JA-Solar-565W-Bifacial-Solar-Panel-JAM72D40-565-MB.webp', '2026-03-06', '5 min read', 'Buy genuine Tier-1 JA Solar panels (550W–620W) in Kenya. Compare prices, specs & 25-year warranty with delivery to Nairobi, Mombasa, Kisumu, Meru & Nakuru.', '["JA Solar Panels Kenya","Solar Panels Price Nairobi Mombasa Kisumu","Tier 1 Solar Panels"]'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order) VALUES (1, 'Horay Solar', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/logo.png', '', 'panels', TRUE, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order) VALUES (2, 'MUST Energy', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/download-6.png', '', 'inverters', TRUE, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order) VALUES (3, 'Deye Inverters & ESS', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/download-5.png', '', 'inverters', TRUE, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order) VALUES (4, 'Lithium Valley', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/download-4.png', '', 'batteries', TRUE, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order) VALUES (5, 'EcoFlow Power', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/images.png', '', 'batteries', TRUE, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order) VALUES (6, 'Doyin Water Pumps', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/download-3.png', '', 'all', TRUE, 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order) VALUES (7, 'Growatt Solar', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/download-2.png', '', 'inverters', TRUE, 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order) VALUES (8, 'Eastman Solar', 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/download-1.png', '', 'batteries', TRUE, 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, author_name, author_photo, reviewer_badge, rating, time_ago, location, text, likes_count, owner_reply, owner_reply_time, project_type, verified, google_review_url, keywords) VALUES (1, 'Teen Network Magazine Show', 'https://lh3.googleusercontent.com/a-/ALV-UjWIhGzRAXVcKAyDC5HMmLMp-R4vO9HZrXz_tD-o0QP7bDyMfuHx=s120-c-rp-mo-br100', '1 review', 5, 'a week ago', 'Timau, Meru / Laikipia', 'We had a ranch project in Timau and they delivered quality work with the best market batteries, inverters and panels. You are the best one may need, Looking forward to working with you on another project.', 1, 'Thank you for trusting in Shantis Designs Solar Solutions, Looking forward to do more installations for your projects', 'a week ago', 'Solar Installation', TRUE, 'https://g.page/r/CVAYv1cTmiLaEAE/review', '["batteries","inverter","panels"]'::jsonb) ON CONFLICT (id) DO UPDATE SET author_name = EXCLUDED.author_name, author_photo = EXCLUDED.author_photo, text = EXCLUDED.text, owner_reply = EXCLUDED.owner_reply;
INSERT INTO reviews (id, author_name, author_photo, reviewer_badge, rating, time_ago, location, text, likes_count, owner_reply, owner_reply_time, project_type, verified, google_review_url, keywords) VALUES (2, 'Tonny Brian', 'https://lh3.googleusercontent.com/a-/ALV-UjX_wLKUnqVlLCkFpKQM2cA9Uq7mSKAvOqUXBreKVA0MphEiSD0OvA=s120-c-rp-mo-br100', '1 review', 5, 'Edited a week ago', 'Munyu Lane, Nairobi CBD', 'I recently sourced solar equipment and backup components from Shantis Designs Solar Solutions along Munyu Lane, and I am thoroughly impressed. Their team is knowledgeable, professional, and took the time to help me pick the right inverter and battery setup for my specific power needs. The product quality is top-notch, and their pricing is very competitive for Nairobi CBD. If you are looking for reliable solar panels, batteries, or complete home/commercial backup systems, this is definitely the go-to shop. Highly recommended', 2, '', '', 'Solar Installation', TRUE, 'https://g.page/r/CVAYv1cTmiLaEAE/review', '["inverter","batteries","panels"]'::jsonb) ON CONFLICT (id) DO UPDATE SET author_name = EXCLUDED.author_name, author_photo = EXCLUDED.author_photo, text = EXCLUDED.text, keywords = EXCLUDED.keywords;
INSERT INTO reviews (id, author_name, author_photo, reviewer_badge, rating, time_ago, location, text, likes_count, owner_reply, owner_reply_time, project_type, verified, google_review_url, keywords) VALUES (3, 'Gerishon Ngugi', 'https://lh3.googleusercontent.com/a/ACg8ocKv5xgPa4JQUcJ7WaKowoG2Vh8Je6jcaWT5rqJlcVdMkczBmg=s120-c-rp-mo-br100', '3 reviews', 5, 'a month ago', 'Nairobi, Kenya', 'Great team of experts for your solar installations who you can trust 👍', 2, 'Thank you for Trusting in Shantis Designs Solar Solutions for your solar and equipment needs', 'a week ago', 'Solar Installation', TRUE, 'https://g.page/r/CVAYv1cTmiLaEAE/review', '["solar installations"]'::jsonb) ON CONFLICT (id) DO UPDATE SET author_name = EXCLUDED.author_name, author_photo = EXCLUDED.author_photo, text = EXCLUDED.text, owner_reply = EXCLUDED.owner_reply;
INSERT INTO reviews (id, author_name, author_photo, reviewer_badge, rating, time_ago, location, text, likes_count, owner_reply, owner_reply_time, project_type, verified, google_review_url, keywords) VALUES (4, 'Ramadhan Otieno', 'https://lh3.googleusercontent.com/a-/ALV-UjXmq2TdYzNt8Uw71QfNT_Jh6ZwDc4C-ZSoIuv1JCeM0r6FkZ5L1=s120-c-rp-mo-br100', '3 reviews', 5, '2 days ago', 'Kenya', 'A good service', 1, '', '', 'Solar Installation', TRUE, 'https://g.page/r/CVAYv1cTmiLaEAE/review', '[]'::jsonb) ON CONFLICT (id) DO UPDATE SET author_name = EXCLUDED.author_name, author_photo = EXCLUDED.author_photo, text = EXCLUDED.text;
INSERT INTO reviews (id, author_name, author_photo, reviewer_badge, rating, time_ago, location, text, likes_count, owner_reply, owner_reply_time, project_type, verified, google_review_url, keywords) VALUES (5, 'mugambi wanjau', 'https://lh3.googleusercontent.com/a-/ALV-UjXV5ORQGFKHNDNg-Hv_ooqcGFxbf9xJBelme-EwVMGjC3b5su3uFQ=s120-c-rp-mo-br100', '1 review', 5, 'a month ago', 'Kenya', '', 1, 'Thank you for Trusting in Shantis Designs Solar Solutions for your solar and equipment needs', 'a week ago', 'Solar Installation', TRUE, 'https://g.page/r/CVAYv1cTmiLaEAE/review', '[]'::jsonb) ON CONFLICT (id) DO UPDATE SET author_name = EXCLUDED.author_name, author_photo = EXCLUDED.author_photo, text = EXCLUDED.text, owner_reply = EXCLUDED.owner_reply;
INSERT INTO users (id, email, name, role, password_hash, password_salt, totp_secret, totp_code) VALUES ('USR-1', 'admin@shantisdesigns.co.ke', 'Shantis Designs Admin', 'super_admin', 'e7dde03dc7d4c131aed41218bf22cb80897ea700b5243c3a7333eb7cd77f1b70850f451ada2e8d0122492d3a21932262552e0f33c75f166b34ed0f8734b9f025', '6554645418f26aec47580a5f6c8bcb55', '39f719b682b0ebec15c6566e785dee0f72470d1acef0999d5e793cbf4a4d1202fb3948f190dae37004c312ce635fc686e2d9cb0ea0c9aaf230fddf4cc6d19183', '39f719b682b0ebec15c6566e785dee0f72470d1acef0999d5e793cbf4a4d1202fb3948f190dae37004c312ce635fc686e2d9cb0ea0c9aaf230fddf4cc6d19183') ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, name, role, password_hash, password_salt, totp_secret, totp_code) VALUES ('USR-2', 'engineer@shantisdesigns.co.ke', 'Shantis Solar Engineer', 'Inventory Manager', 'e69cd363ee375ae629d3693d6c5aa2744064300bb2b61b8a3ce907d2b791282a58b9754f70d03037b37d7fd4edb808cdd4c9dfa5ea3c4f4fd4a6b293ef0fc1fe', 'e1cd46bd025b44024fceed444f9d4b5d', '72ae48c06d049b48ba26aba99f6342d8d637c249397eef0aa35767c0f62640193f321a1415dcbcb8ff1cb2dec5208ea365d4590266ed05e32533c8c5bc897625', '72ae48c06d049b48ba26aba99f6342d8d637c249397eef0aa35767c0f62640193f321a1415dcbcb8ff1cb2dec5208ea365d4590266ed05e32533c8c5bc897625') ON CONFLICT (id) DO NOTHING;
