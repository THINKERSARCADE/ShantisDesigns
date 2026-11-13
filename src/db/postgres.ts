import { Pool } from 'pg';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PROJECTS,
  INITIAL_ARTICLES,
  INITIAL_PARTNERS,
  INITIAL_REVIEWS,
  INITIAL_ABOUT_DATA,
} from '../data/initialData.ts';

dotenv.config();

declare global {
  var _postgresPool: Pool | undefined;
}

function hashWithSalt(value: string, salt: string): string {
  return crypto.scryptSync(value, salt, 64).toString('hex');
}

function maskSecretValue(val: string): string {
  const trimmed = (val || '').trim();
  if (!trimmed) return 'Not configured';
  if (trimmed.length <= 6) return '••••••';
  return `${trimmed.slice(0, 3)}••••••••••••${trimmed.slice(-3)}`;
}

// Read PostgreSQL connection configuration strictly from environment variables (never hardcoded)
export const isPostgresConfigured = (): boolean => {
  return Boolean(
    (process.env.SQL_HOST || process.env.PGHOST) &&
      (process.env.SQL_USER || process.env.PGUSER) &&
      (process.env.SQL_DB_NAME || process.env.PGDATABASE)
  );
};

export const createPool = (): Pool => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST || process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      user: process.env.SQL_USER || process.env.PGUSER,
      password: process.env.SQL_PASSWORD || process.env.PGPASSWORD,
      database: process.env.SQL_DB_NAME || process.env.PGDATABASE,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL pool client:', err.message);
    });
  }
  return global._postgresPool;
};

let schemaInitialized = false;
let pgAvailable = false;

export const isPostgresReady = (): boolean => pgAvailable;

export async function ensurePostgresInitialized(): Promise<boolean> {
  if (schemaInitialized || !isPostgresConfigured()) return pgAvailable;
  const pool = createPool();
  let client;
  try {
    client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
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
        category_id INTEGER NOT NULL,
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
        user_id TEXT NOT NULL,
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
    `);

    const catCount = await client.query('SELECT COUNT(*)::int AS c FROM categories');
    if (catCount.rows[0].c === 0) {
      for (const c of INITIAL_CATEGORIES) {
        await client.query(
          'INSERT INTO categories (id, name, slug, description, image_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
          [c.id, c.name, c.slug, c.description || '', c.image_url || c.imageUrl || '']
        );
      }
    }

    const prodCount = await client.query('SELECT COUNT(*)::int AS c FROM products');
    if (prodCount.rows[0].c === 0) {
      for (const p of INITIAL_PRODUCTS) {
        await client.query(
          `INSERT INTO products (
            id, name, title, slug, date, parent_id, permalink, sku,
            category_id, category_name, price, regular_price, sale_price,
            stock, manage_stock, stock_status, product_type, product_visibility,
            short_description, description, image_url, gallery, specs,
            featured, warranty, weight, dimensions
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27
          ) ON CONFLICT (id) DO NOTHING`,
          [
            p.id,
            p.name,
            p.title || p.name,
            p.slug,
            p.date || '',
            typeof p.parent_id === 'number' ? p.parent_id : null,
            p.permalink || p.url || '',
            p.sku,
            p.category_id,
            p.category_name || '',
            p.price,
            p.regular_price || p.price,
            p.sale_price ?? null,
            p.stock ?? 10,
            Boolean(p.manage_stock ?? true),
            p.stock_status || 'instock',
            p.product_type || 'simple',
            p.product_visibility || 'visible',
            p.shortDescription || p.short_description || '',
            p.description || '',
            p.image_url || p.image || '',
            JSON.stringify(p.gallery || []),
            JSON.stringify(p.specs || {}),
            Boolean(p.featured),
            p.warranty || '',
            p.weight || '',
            p.dimensions || '',
          ]
        );
      }
    }

    const projCount = await client.query('SELECT COUNT(*)::int AS c FROM projects');
    if (projCount.rows[0].c === 0) {
      for (const pr of INITIAL_PROJECTS) {
        await client.query(
          `INSERT INTO projects (
            id, title, slug, client, location, category, category_name,
            system_size, panels_count, inverter_specs, battery_specs,
            image_url, gallery, completion_date, kplc_savings, description, featured
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
          ON CONFLICT (id) DO NOTHING`,
          [
            pr.id,
            pr.title,
            pr.slug,
            pr.client,
            pr.location,
            pr.category,
            pr.category_name,
            pr.system_size,
            pr.panels_count || '',
            pr.inverter_specs || '',
            pr.battery_specs || '',
            pr.image_url,
            JSON.stringify(pr.gallery && pr.gallery.length > 0 ? pr.gallery : [pr.image_url]),
            pr.completion_date || '',
            pr.kplc_savings || '',
            pr.description || '',
            Boolean(pr.featured),
          ]
        );
      }
    }

    const artCount = await client.query('SELECT COUNT(*)::int AS c FROM articles');
    if (artCount.rows[0].c === 0) {
      for (const a of INITIAL_ARTICLES) {
        await client.query(
          `INSERT INTO articles (
            id, title, slug, excerpt, content, author, category,
            image_url, published_at, read_time, meta_description, tags
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
          ON CONFLICT (id) DO NOTHING`,
          [
            a.id,
            a.title,
            a.slug,
            a.excerpt,
            a.content,
            a.author,
            a.category,
            a.image_url,
            a.published_at,
            a.read_time,
            a.meta_description,
            JSON.stringify(a.tags || []),
          ]
        );
      }
    }

    const partCount = await client.query('SELECT COUNT(*)::int AS c FROM partners');
    if (partCount.rows[0].c === 0) {
      for (const pt of INITIAL_PARTNERS) {
        await client.query(
          `INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
          [pt.id, pt.name, pt.logo_url, pt.website_url || '', pt.category, Boolean(pt.active), pt.sort_order ?? 1]
        );
      }
    }

    const revCount = await client.query('SELECT COUNT(*)::int AS c FROM reviews');
    if (revCount.rows[0].c === 0) {
      for (const r of INITIAL_REVIEWS) {
        await client.query(
          `INSERT INTO reviews (
            id, author_name, author_photo, reviewer_badge, rating, time_ago,
            location, text, likes_count, owner_reply, owner_reply_time,
            project_type, verified, google_review_url, keywords
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
          ON CONFLICT (id) DO NOTHING`,
          [
            r.id,
            r.author_name,
            r.author_photo || '',
            r.reviewer_badge || '1 review',
            r.rating,
            r.time_ago,
            r.location,
            r.text,
            r.likes_count ?? 1,
            r.owner_reply || '',
            r.owner_reply_time || '',
            'Solar Installation',
            Boolean(r.verified),
            r.google_review_url || 'https://g.page/r/CVAYv1cTmiLaEAE/review',
            JSON.stringify(r.keywords || []),
          ]
        );
      }
    }

    const aboutCount = await client.query('SELECT COUNT(*)::int AS c FROM about_page');
    if (aboutCount.rows[0].c === 0) {
      await client.query('INSERT INTO about_page (id, data_json) VALUES (1, $1)', [
        JSON.stringify(INITIAL_ABOUT_DATA),
      ]);
    }

    const usrCount = await client.query('SELECT COUNT(*)::int AS c FROM users');
    if (usrCount.rows[0].c === 0) {
      const saltAdmin = crypto.randomBytes(16).toString('hex');
      const saltEng = crypto.randomBytes(16).toString('hex');
      const defaultAdminPwd = process.env.ADMIN_INITIAL_PASSWORD || crypto.randomBytes(12).toString('hex');
      const defaultEngPwd = process.env.ENGINEER_INITIAL_PASSWORD || crypto.randomBytes(12).toString('hex');
      const defaultTotp = process.env.ADMIN_INITIAL_TOTP || '254880';
      await client.query(
        `INSERT INTO users (id, email, name, role, password_hash, password_salt, totp_secret, totp_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [
          'USR-EPRA-01',
          'admin@shantisdesigns.co.ke',
          'Shantis Designs Admin',
          'admin',
          hashWithSalt(defaultAdminPwd, saltAdmin),
          saltAdmin,
          hashWithSalt('JBSWY3DPEHPK3PXP', saltAdmin),
          hashWithSalt(defaultTotp, saltAdmin),
        ]
      );
      await client.query(
        `INSERT INTO users (id, email, name, role, password_hash, password_salt, totp_secret, totp_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [
          'USR-EPRA-02',
          'engineer@shantisdesigns.co.ke',
          'Shantis Solar Engineer',
          'engineer',
          hashWithSalt(defaultEngPwd, saltEng),
          saltEng,
          hashWithSalt('JBSWY3DPEHPK3PXQ', saltEng),
          hashWithSalt(defaultTotp, saltEng),
        ]
      );
    }

    const mpCount = await client.query('SELECT COUNT(*)::int AS c FROM mpesa_api_credentials');
    if (mpCount.rows[0].c === 0) {
      const mpSalt = crypto.randomBytes(16).toString('hex');
      const envKey = process.env.MPESA_CONSUMER_KEY || '';
      const envSecret = process.env.MPESA_CONSUMER_SECRET || '';
      const envPasskey = process.env.MPESA_PASSKEY || '';
      await client.query(
        `INSERT INTO mpesa_api_credentials (
          id, shortcode, environment, callback_url,
          consumer_key_masked, consumer_key_hash,
          consumer_secret_masked, consumer_secret_hash,
          passkey_masked, passkey_hash,
          initiator_password_hash, salt
        ) VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          process.env.MPESA_SHORTCODE || '4089912',
          process.env.MPESA_ENV || 'production',
          process.env.MPESA_CALLBACK_URL || 'https://shantisdesigns.co.ke/api/payments/mpesa/callback',
          maskSecretValue(envKey),
          envKey ? hashWithSalt(envKey, mpSalt) : hashWithSalt('UNSET_KEY', mpSalt),
          maskSecretValue(envSecret),
          envSecret ? hashWithSalt(envSecret, mpSalt) : hashWithSalt('UNSET_SECRET', mpSalt),
          maskSecretValue(envPasskey),
          envPasskey ? hashWithSalt(envPasskey, mpSalt) : hashWithSalt('UNSET_PASSKEY', mpSalt),
          hashWithSalt(process.env.MPESA_INITIATOR_PASSWORD || 'UNSET_INITIATOR', mpSalt),
          mpSalt,
        ]
      );
    }

    schemaInitialized = true;
    pgAvailable = true;
    return true;
  } catch {
    pgAvailable = false;
    return false;
  } finally {
    if (client) client.release();
  }
}
