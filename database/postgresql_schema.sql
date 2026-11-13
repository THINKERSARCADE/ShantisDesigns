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
