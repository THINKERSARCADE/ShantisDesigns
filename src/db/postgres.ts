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
import { EPCService, INITIAL_SERVICES, DEFAULT_HOMEPAGE_CONFIG } from './defaults';
import {
  hashWithRandomSalt,
  verifyScryptSecret,
  maskSecretValue,
  encryptVaultSecret,
  decryptVaultSecret,
  verifyGoogleTotp,
} from './security';

dotenv.config();

declare global {
  var _postgresPool: Pool | undefined;
}

function hashWithSalt(value: string, salt: string): string {
  return crypto.scryptSync(value, salt, 64).toString('hex');
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
      connectionTimeoutMillis: 10000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]', err.message);
    });
  }
  return global._postgresPool;
};

let schemaInitialized = false;
let pgAvailable = false;

export const isPostgresReady = (): boolean => pgAvailable;

function parseJsonField<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return val as T;
}

export async function ensurePostgresInitialized(): Promise<boolean> {
  if (schemaInitialized) return pgAvailable;
  if (!isPostgresConfigured()) {
    pgAvailable = false;
    return false;
  }

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
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS permalink TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent INTEGER DEFAULT 0;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS count INTEGER DEFAULT 0;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_keywords JSONB DEFAULT '[]'::jsonb;

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
      ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(4, 2) DEFAULT 4.9;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 14;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords JSONB DEFAULT '[]'::jsonb;

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
        video_url TEXT DEFAULT '',
        videos JSONB DEFAULT '[]'::jsonb,
        seo_keywords JSONB DEFAULT '[]'::jsonb,
        completion_date TEXT,
        kplc_savings TEXT,
        description TEXT,
        featured BOOLEAN DEFAULT FALSE
      );
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_keywords JSONB DEFAULT '[]'::jsonb;

      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        category TEXT NOT NULL,
        short_description TEXT NOT NULL,
        description TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        features JSONB DEFAULT '[]'::jsonb,
        counties_served JSONB DEFAULT '[]'::jsonb
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
        id BIGSERIAL PRIMARY KEY,
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
        id BIGSERIAL PRIMARY KEY,
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
        google_totp_secret TEXT DEFAULT '',
        google_totp_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_totp_secret TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_totp_enabled BOOLEAN DEFAULT FALSE;

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
        consumer_key_enc TEXT DEFAULT '',
        consumer_secret_enc TEXT DEFAULT '',
        passkey_enc TEXT DEFAULT '',
        initiator_password_enc TEXT DEFAULT '',
        salt TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE mpesa_api_credentials ADD COLUMN IF NOT EXISTS consumer_key_enc TEXT DEFAULT '';
      ALTER TABLE mpesa_api_credentials ADD COLUMN IF NOT EXISTS consumer_secret_enc TEXT DEFAULT '';
      ALTER TABLE mpesa_api_credentials ADD COLUMN IF NOT EXISTS passkey_enc TEXT DEFAULT '';
      ALTER TABLE mpesa_api_credentials ADD COLUMN IF NOT EXISTS initiator_password_enc TEXT DEFAULT '';

      CREATE TABLE IF NOT EXISTS mpesa_transactions (
        checkout_request_id TEXT PRIMARY KEY,
        merchant_request_id TEXT DEFAULT '',
        order_number TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        amount NUMERIC(12, 2) DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        result_code TEXT DEFAULT '',
        result_desc TEXT DEFAULT '',
        mpesa_receipt TEXT DEFAULT '',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS webhooks_log (
        id BIGSERIAL PRIMARY KEY,
        provider TEXT NOT NULL,
        event_type TEXT NOT NULL,
        signature TEXT,
        payload_json JSONB NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        processed_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cookie_consents (
        id BIGSERIAL PRIMARY KEY,
        consent_id TEXT NOT NULL,
        analytics BOOLEAN DEFAULT TRUE,
        marketing BOOLEAN DEFAULT TRUE,
        ip_hash TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value_json JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const catCount = await client.query('SELECT COUNT(*)::int AS c FROM categories');
    if (catCount.rows[0].c === 0) {
      for (const c of INITIAL_CATEGORIES) {
        await client.query(
          `INSERT INTO categories (id, name, slug, permalink, parent, description, image_url, count, seo_keywords)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
           ON CONFLICT (id) DO NOTHING`,
          [
            c.id,
            c.name,
            c.slug,
            c.permalink || `https://shantisdesigns.co.ke/product-category/${c.slug}/`,
            c.parent ?? 0,
            c.description || '',
            c.image_url || c.imageUrl || '',
            c.count ?? 0,
            JSON.stringify(c.seo_keywords || []),
          ]
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
            featured, warranty, weight, dimensions, rating, reviews_count, tags, seo_keywords
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22::jsonb,$23::jsonb,$24,$25,$26,$27,$28,$29,$30::jsonb,$31::jsonb
          ) ON CONFLICT (id) DO NOTHING`,
          [
            p.id,
            p.name,
            p.title || p.name,
            p.slug,
            p.date || '',
            typeof p.parent_id === 'number' ? p.parent_id : null,
            p.permalink || p.url || '',
            p.sku || `SH-${p.id}`,
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
            p.rating ?? 4.9,
            p.reviews_count ?? 14,
            JSON.stringify(p.tags || [p.category_name || 'Solar Hardware']),
            JSON.stringify(p.seo_keywords || []),
          ]
        );
      }
    }

    // Always ensure missing seed projects (Embakasi Baraka Estate, Ruiru Carport) are inserted and video/SEO synced
    for (const pr of INITIAL_PROJECTS) {
      const gallery = pr.gallery && pr.gallery.length > 0 ? pr.gallery : [pr.image_url];
      const videos = pr.videos && pr.videos.length > 0 ? pr.videos : pr.video_url ? [pr.video_url] : [];
      const seoKeywords = pr.seo_keywords || [];
      await client.query(
        `INSERT INTO projects (
          id, title, slug, client, location, category, category_name,
          system_size, panels_count, inverter_specs, battery_specs,
          image_url, gallery, video_url, videos, seo_keywords,
          completion_date, kplc_savings, description, featured
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15::jsonb,$16::jsonb,$17,$18,$19,$20)
        ON CONFLICT (id) DO UPDATE SET
          image_url = CASE WHEN projects.id = 16 AND (projects.image_url LIKE '%ruiru-secondary-school.jpeg%' OR projects.image_url LIKE '%WhatsApp-Image-2026-08-18%') THEN EXCLUDED.image_url ELSE projects.image_url END,
          gallery = CASE WHEN projects.id = 16 AND (projects.gallery::text LIKE '%ruiru-secondary-school.jpeg%' OR projects.gallery::text LIKE '%WhatsApp-Image-2026-08-18%') THEN EXCLUDED.gallery ELSE projects.gallery END,
          video_url = COALESCE(NULLIF(projects.video_url, ''), EXCLUDED.video_url),
          videos = CASE WHEN projects.videos IS NULL OR projects.videos = '[]'::jsonb THEN EXCLUDED.videos ELSE projects.videos END,
          seo_keywords = CASE WHEN projects.seo_keywords IS NULL OR projects.seo_keywords = '[]'::jsonb THEN EXCLUDED.seo_keywords ELSE projects.seo_keywords END`,
        [
          pr.id,
          pr.title,
          pr.slug,
          pr.client,
          pr.location,
          pr.category,
          pr.category_name || 'Solar Installation',
          pr.system_size,
          pr.panels_count || '',
          pr.inverter_specs || '',
          pr.battery_specs || '',
          pr.image_url,
          JSON.stringify(gallery),
          pr.video_url || '',
          JSON.stringify(videos),
          JSON.stringify(seoKeywords),
          pr.completion_date || '',
          pr.kplc_savings || '',
          pr.description || '',
          Boolean(pr.featured),
        ]
      );
    }

    const srvCount = await client.query('SELECT COUNT(*)::int AS c FROM services');
    if (srvCount.rows[0].c === 0) {
      for (const s of INITIAL_SERVICES) {
        await client.query(
          `INSERT INTO services (
            id, title, slug, category, short_description, description,
            icon_name, image_url, features, counties_served
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb)
          ON CONFLICT (id) DO NOTHING`,
          [
            s.id,
            s.title,
            s.slug,
            s.category,
            s.short_description,
            s.description,
            s.icon_name,
            s.image_url,
            JSON.stringify(s.features),
            JSON.stringify(s.counties_served),
          ]
        );
      }
    } else {
      await client.query(
        `UPDATE services SET description = $1, features = $2::jsonb WHERE id = 1 AND description LIKE '%Class T3%'`,
        [INITIAL_SERVICES[0].description, JSON.stringify(INITIAL_SERVICES[0].features)]
      );
    }

    // Always ensure newly added seed SEO articles (Ruiru, Embakasi, EPRA CV/V1) exist
    for (const a of INITIAL_ARTICLES) {
      await client.query(
        `INSERT INTO articles (
          id, title, slug, excerpt, content, author, category,
          image_url, published_at, read_time, meta_description, tags
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          image_url = CASE WHEN articles.id = 10010 AND (articles.image_url LIKE '%ruiru-secondary-school.jpeg%' OR articles.image_url LIKE '%WhatsApp-Image-2026-08-18%') THEN EXCLUDED.image_url ELSE articles.image_url END`,
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

    // Purge any legacy synthetic reviews & ensure all 5 live Google Business Profile reviews exist
    await client.query(
      `DELETE FROM reviews WHERE author_name IN (
        'Peter Mwangi', 'Faith Wanjiru', 'Kelvin Mutua',
        'Eng. David Karanja', 'Dr. Grace Muli', 'Samuel Ochieng', 'Catherine Njoroge'
      )`
    );
    const revCheck = await client.query(
      `SELECT COUNT(*)::int AS c,
              SUM(CASE WHEN author_name = 'Tonny Brian' THEN 1 ELSE 0 END)::int AS has_tonny
       FROM reviews`
    );
    if ((revCheck.rows[0].c || 0) < 5 || (revCheck.rows[0].has_tonny || 0) === 0) {
      await client.query('DELETE FROM reviews');
      for (const r of INITIAL_REVIEWS) {
        await client.query(
          `INSERT INTO reviews (
            id, author_name, author_photo, reviewer_badge, rating, time_ago,
            location, text, likes_count, owner_reply, owner_reply_time,
            project_type, verified, google_review_url, keywords
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb)
          ON CONFLICT (id) DO NOTHING`,
          [
            r.id,
            r.author_name,
            r.author_photo || '',
            r.reviewer_badge || '1 review',
            r.rating,
            r.time_ago,
            r.location || 'Kenya',
            r.text || '',
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
      await client.query('INSERT INTO about_page (id, data_json) VALUES (1, $1::jsonb)', [
        JSON.stringify(INITIAL_ABOUT_DATA),
      ]);
    } else {
      const existingAbout = await client.query('SELECT data_json FROM about_page WHERE id = 1');
      const aboutData = existingAbout.rows[0]?.data_json;
      const serialized = JSON.stringify(aboutData || {});
      if (serialized.includes('Solar PV Contractor/Vendor') || serialized.includes('Class T3')) {
        const updatedAbout = {
          ...(aboutData || {}),
          subheading: INITIAL_ABOUT_DATA.subheading,
          partner_intro_1: INITIAL_ABOUT_DATA.partner_intro_1,
          certifications: INITIAL_ABOUT_DATA.certifications,
        };
        await client.query('UPDATE about_page SET data_json = $1::jsonb, updated_at = NOW() WHERE id = 1', [
          JSON.stringify(updatedAbout),
        ]);
      }
    }

    const hpCount = await client.query('SELECT COUNT(*)::int AS c FROM homepage_config');
    if (hpCount.rows[0].c === 0) {
      const cfgJson = JSON.stringify(DEFAULT_HOMEPAGE_CONFIG);
      await client.query(
        'INSERT INTO homepage_config (id, draft_json, published_json) VALUES (1, $1::jsonb, $2::jsonb)',
        [cfgJson, cfgJson]
      );
    } else {
      const existingHp = await client.query('SELECT draft_json, published_json FROM homepage_config WHERE id = 1');
      const pub = existingHp.rows[0]?.published_json;
      const draft = existingHp.rows[0]?.draft_json;
      if (JSON.stringify(pub || {}).includes('EPRA Licensed Solar EPC Contractor')) {
        const nextPub = {
          ...(pub || {}),
          hero_kicker: DEFAULT_HOMEPAGE_CONFIG.hero_kicker,
          epc_banner_subtitle: DEFAULT_HOMEPAGE_CONFIG.epc_banner_subtitle,
        };
        const nextDraft = {
          ...(draft || {}),
          hero_kicker: DEFAULT_HOMEPAGE_CONFIG.hero_kicker,
          epc_banner_subtitle: DEFAULT_HOMEPAGE_CONFIG.epc_banner_subtitle,
        };
        await client.query(
          'UPDATE homepage_config SET draft_json = $1::jsonb, published_json = $2::jsonb, updated_at = NOW() WHERE id = 1',
          [JSON.stringify(nextDraft), JSON.stringify(nextPub)]
        );
      }
    }

    for (const m of INITIAL_MEDIA) {
      await client.query(
        `INSERT INTO media_library (id, name, url, mime_type, size, dimensions)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [m.id, m.name, m.url, m.mime_type || 'image/jpeg', m.size || '280 KB', m.dimensions || '800 × 800 px']
      );
    }

    const usrCount = await client.query('SELECT COUNT(*)::int AS c FROM users');
    if (usrCount.rows[0].c === 0) {
      const saltAdmin = crypto.randomBytes(16).toString('hex');
      const saltEng = crypto.randomBytes(16).toString('hex');
      const defaultAdminPwd = process.env.ADMIN_INITIAL_PASSWORD || 'Shantis#Solar2026!';
      const defaultEngPwd = process.env.ENGINEER_INITIAL_PASSWORD || 'EPRA#Tech2026!';
      const defaultTotp = process.env.ADMIN_INITIAL_TOTP || '254880';
      await client.query(
        `INSERT INTO users (id, email, name, role, password_hash, password_salt, totp_secret, totp_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [
          'USR-1',
          'admin@shantisdesigns.co.ke',
          'Shantis Designs Admin',
          'super_admin',
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
          'USR-2',
          'engineer@shantisdesigns.co.ke',
          'Shantis Solar Engineer',
          'Inventory Manager',
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
          process.env.MPESA_SHORTCODE || '4108955',
          process.env.MPESA_ENV || 'production',
          process.env.MPESA_CALLBACK_URL || 'https://shantisdesigns.co.ke/api/payments/mpesa/callback',
          maskSecretValue(envKey),
          envKey ? hashWithSalt(envKey, mpSalt) : '',
          maskSecretValue(envSecret),
          envSecret ? hashWithSalt(envSecret, mpSalt) : '',
          maskSecretValue(envPasskey),
          envPasskey ? hashWithSalt(envPasskey, mpSalt) : '',
          '',
          mpSalt,
        ]
      );
    }

    schemaInitialized = true;
    pgAvailable = true;
    console.log('[PostgreSQL] Connected and synchronized with live database:', process.env.PGDATABASE || process.env.SQL_DB_NAME);
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] Unavailable, using SQLite fallback:', err?.message);
    pgAvailable = false;
    return false;
  } finally {
    if (client) client.release();
  }
}

export const PgRepository = {
  async getCounts() {
    const pool = createPool();
    const [p, c, pr, m, o, l] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM products'),
      pool.query('SELECT COUNT(*)::int AS c FROM categories'),
      pool.query('SELECT COUNT(*)::int AS c FROM projects'),
      pool.query('SELECT COUNT(*)::int AS c FROM media_library'),
      pool.query('SELECT COUNT(*)::int AS c FROM orders'),
      pool.query('SELECT COUNT(*)::int AS c FROM leads'),
    ]);
    return {
      products: p.rows[0].c,
      categories: c.rows[0].c,
      projects: pr.rows[0].c,
      media_assets: m.rows[0].c,
      cached_blobs: m.rows[0].c,
      orders: o.rows[0].c,
      leads: l.rows[0].c,
    };
  },

  async getProducts(): Promise<Product[]> {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM products ORDER BY featured DESC, id DESC');
    return res.rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      title: r.title || r.name,
      slug: r.slug,
      permalink: r.permalink || `https://shantisdesigns.co.ke/product/${r.slug}/`,
      url: r.permalink || `https://shantisdesigns.co.ke/product/${r.slug}/`,
      sku: r.sku,
      description: r.description || '',
      shortDescription: r.short_description || '',
      price: Number(r.price) || 0,
      regular_price: Number(r.regular_price ?? r.price) || 0,
      sale_price: r.sale_price !== null && r.sale_price !== undefined ? Number(r.sale_price) : null,
      stock: Number(r.stock) || 0,
      manage_stock: Boolean(r.manage_stock),
      stock_status: r.stock_status || 'instock',
      category_id: Number(r.category_id),
      category_name: r.category_name || '',
      image_url: r.image_url || '',
      gallery: parseJsonField<string[]>(r.gallery, []),
      featured: Boolean(r.featured),
      warranty: r.warranty || '',
      rating: r.rating !== null && r.rating !== undefined ? Number(r.rating) : 4.9,
      reviews_count: r.reviews_count !== null && r.reviews_count !== undefined ? Number(r.reviews_count) : 14,
      tags: parseJsonField<string[]>(r.tags, []),
      specs: parseJsonField<Record<string, string>>(r.specs, {}),
      seo_keywords: parseJsonField<string[]>(r.seo_keywords, []),
    }));
  },

  async upsertProduct(p: any) {
    const pool = createPool();
    const id = Number(p.id || Date.now());
    const slug =
      p.slug ||
      String(p.name || 'solar-product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
    const permalink = p.permalink || `https://shantisdesigns.co.ke/product/${slug}/`;
    const stock = Number(p.stock ?? 20);
    await pool.query(
      `INSERT INTO products (
        id, name, title, slug, permalink, sku, description, short_description,
        price, regular_price, sale_price, stock, manage_stock, stock_status,
        category_id, category_name, image_url, featured, warranty, rating, reviews_count,
        tags, specs, seo_keywords
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22::jsonb,$23::jsonb,$24::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        permalink = EXCLUDED.permalink,
        sku = EXCLUDED.sku,
        description = EXCLUDED.description,
        short_description = EXCLUDED.short_description,
        price = EXCLUDED.price,
        regular_price = EXCLUDED.regular_price,
        sale_price = EXCLUDED.sale_price,
        stock = EXCLUDED.stock,
        stock_status = EXCLUDED.stock_status,
        category_id = EXCLUDED.category_id,
        category_name = EXCLUDED.category_name,
        image_url = EXCLUDED.image_url,
        featured = EXCLUDED.featured,
        warranty = EXCLUDED.warranty,
        specs = EXCLUDED.specs,
        updated_at = NOW()`,
      [
        id,
        p.name,
        p.title || p.name,
        slug,
        permalink,
        p.sku || `SH-${id}`,
        p.description || p.name,
        p.shortDescription || p.description || p.name,
        Number(p.price) || 0,
        Number(p.regular_price ?? p.price) || 0,
        p.sale_price ? Number(p.sale_price) : null,
        stock,
        p.manage_stock !== false,
        stock > 0 ? 'instock' : 'outofstock',
        Number(p.category_id || 20),
        p.category_name || 'Solar Panels',
        p.image_url || 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png',
        Boolean(p.featured),
        p.warranty || '5 Years Manufacturer Warranty',
        Number(p.rating ?? 5.0),
        Number(p.reviews_count ?? 12),
        JSON.stringify(p.tags || [p.category_name || 'Solar Panels']),
        JSON.stringify(p.specs || {}),
        JSON.stringify(p.seo_keywords || []),
      ]
    );
    return this.getProducts();
  },

  async updateProduct(id: number, p: any) {
    const pool = createPool();
    const stock = Number(p.stock ?? 0);
    await pool.query(
      `UPDATE products SET
        name = $1, title = $2, slug = $3, sku = $4, description = $5, short_description = $6,
        price = $7, regular_price = $8, sale_price = $9, stock = $10, stock_status = $11,
        category_id = $12, category_name = $13, image_url = $14, featured = $15, warranty = $16,
        specs = $17::jsonb, updated_at = NOW()
       WHERE id = $18`,
      [
        p.name,
        p.title || p.name,
        p.slug,
        p.sku,
        p.description,
        p.shortDescription || p.description,
        Number(p.price),
        Number(p.regular_price ?? p.price),
        p.sale_price ? Number(p.sale_price) : null,
        stock,
        stock > 0 ? 'instock' : 'outofstock',
        Number(p.category_id),
        p.category_name,
        p.image_url,
        Boolean(p.featured),
        p.warranty || '5 Years Manufacturer Warranty',
        JSON.stringify(p.specs || {}),
        id,
      ]
    );
    return this.getProducts();
  },

  async deleteProduct(id: number) {
    const pool = createPool();
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return this.getProducts();
  },

  async getCategories(): Promise<Category[]> {
    const pool = createPool();
    const res = await pool.query(`
      SELECT c.*, COALESCE(pc.prod_cnt, c.count, 0)::int AS computed_count
      FROM categories c
      LEFT JOIN (
        SELECT category_id, COUNT(*)::int AS prod_cnt
        FROM products
        GROUP BY category_id
      ) pc ON pc.category_id = c.id
      ORDER BY computed_count DESC, c.id ASC
    `);
    return res.rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      slug: r.slug,
      permalink: r.permalink || `https://shantisdesigns.co.ke/product-category/${r.slug}/`,
      parent: Number(r.parent || 0),
      description: r.description || '',
      image_url: r.image_url || '',
      count: Number(r.computed_count ?? r.count ?? 0),
      seo_keywords: parseJsonField<string[]>(r.seo_keywords, []),
    }));
  },

  async upsertCategory(c: any) {
    const pool = createPool();
    const id = Number(c.id || Date.now());
    const slug =
      c.slug ||
      String(c.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
    await pool.query(
      `INSERT INTO categories (id, name, slug, permalink, parent, description, image_url, count, seo_keywords)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         permalink = EXCLUDED.permalink,
         description = EXCLUDED.description,
         image_url = EXCLUDED.image_url`,
      [
        id,
        c.name,
        slug,
        c.permalink || `https://shantisdesigns.co.ke/product-category/${slug}/`,
        c.parent || 0,
        c.description || '',
        c.image_url || '',
        c.count || 0,
        JSON.stringify(c.seo_keywords || []),
      ]
    );
    return this.getCategories();
  },

  async updateCategory(id: number, c: any) {
    const pool = createPool();
    await pool.query(
      'UPDATE categories SET name = $1, slug = $2, description = $3, image_url = $4 WHERE id = $5',
      [c.name, c.slug, c.description || '', c.image_url, id]
    );
    return this.getCategories();
  },

  async deleteCategory(id: number) {
    const pool = createPool();
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return this.getCategories();
  },

  async getProjects(): Promise<Project[]> {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    return res.rows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      slug: r.slug,
      client: r.client,
      location: r.location,
      category: r.category,
      category_name: r.category_name,
      system_size: r.system_size,
      panels_count: r.panels_count || '',
      inverter_specs: r.inverter_specs || '',
      battery_specs: r.battery_specs || '',
      image_url: r.image_url,
      gallery: parseJsonField<string[]>(r.gallery, []),
      video_url: r.video_url || '',
      videos: parseJsonField<string[]>(r.videos, []),
      seo_keywords: parseJsonField<string[]>(r.seo_keywords, []),
      completion_date: r.completion_date || '',
      kplc_savings: r.kplc_savings || '',
      description: r.description || '',
      featured: Boolean(r.featured),
    }));
  },

  async upsertProject(proj: any) {
    const pool = createPool();
    let id = Number(proj.id || 0);
    if (!id || id > 2147483647) {
      const maxRes = await pool.query('SELECT COALESCE(MAX(id), 0)::int AS max_id FROM projects');
      id = Number(maxRes.rows[0]?.max_id || 0) + 1;
    }
    const gallery =
      Array.isArray(proj.gallery) && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
    const videos = Array.isArray(proj.videos)
      ? proj.videos.filter(Boolean)
      : proj.video_url
      ? [proj.video_url]
      : [];
    const videoUrl = String(proj.video_url || videos[0] || '');
    const seoKeywords = Array.isArray(proj.seo_keywords) ? proj.seo_keywords : [];
    const slug = proj.slug || String(proj.title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await pool.query(
      `INSERT INTO projects (
        id, title, slug, client, location, category, category_name,
        system_size, panels_count, inverter_specs, battery_specs,
        image_url, gallery, video_url, videos, seo_keywords,
        completion_date, kplc_savings, description, featured
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15::jsonb,$16::jsonb,$17,$18,$19,$20)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, slug = EXCLUDED.slug, client = EXCLUDED.client,
        location = EXCLUDED.location, category = EXCLUDED.category,
        system_size = EXCLUDED.system_size, panels_count = EXCLUDED.panels_count,
        inverter_specs = EXCLUDED.inverter_specs, battery_specs = EXCLUDED.battery_specs,
        image_url = EXCLUDED.image_url, gallery = EXCLUDED.gallery,
        video_url = EXCLUDED.video_url, videos = EXCLUDED.videos,
        seo_keywords = EXCLUDED.seo_keywords,
        completion_date = EXCLUDED.completion_date, kplc_savings = EXCLUDED.kplc_savings,
        description = EXCLUDED.description, featured = EXCLUDED.featured`,
      [
        id,
        proj.title,
        slug,
        proj.client,
        proj.location,
        proj.category || 'residential',
        proj.category_name || 'Solar Installation',
        proj.system_size,
        proj.panels_count || '',
        proj.inverter_specs || '',
        proj.battery_specs || '',
        proj.image_url,
        JSON.stringify(gallery),
        videoUrl,
        JSON.stringify(videos),
        JSON.stringify(seoKeywords),
        proj.completion_date || '2026',
        proj.kplc_savings || '',
        proj.description || '',
        Boolean(proj.featured),
      ]
    );
    return this.getProjects();
  },

  async updateProject(id: number, proj: any) {
    const pool = createPool();
    const gallery =
      Array.isArray(proj.gallery) && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
    const videos = Array.isArray(proj.videos)
      ? proj.videos.filter(Boolean)
      : proj.video_url
      ? [proj.video_url]
      : [];
    const videoUrl = String(proj.video_url || videos[0] || '');
    const seoKeywords = Array.isArray(proj.seo_keywords) ? proj.seo_keywords : [];
    await pool.query(
      `UPDATE projects SET
        title = $1, slug = $2, client = $3, location = $4, category = $5,
        system_size = $6, panels_count = $7, inverter_specs = $8, battery_specs = $9,
        image_url = $10, gallery = $11::jsonb, video_url = $12, videos = $13::jsonb,
        seo_keywords = $14::jsonb, completion_date = $15, kplc_savings = $16,
        description = $17, featured = $18
       WHERE id = $19`,
      [
        proj.title,
        proj.slug,
        proj.client,
        proj.location,
        proj.category,
        proj.system_size,
        proj.panels_count || '',
        proj.inverter_specs || '',
        proj.battery_specs || '',
        proj.image_url,
        JSON.stringify(gallery),
        videoUrl,
        JSON.stringify(videos),
        JSON.stringify(seoKeywords),
        proj.completion_date || '',
        proj.kplc_savings || '',
        proj.description || '',
        Boolean(proj.featured),
        id,
      ]
    );
    return this.getProjects();
  },

  async deleteProject(id: number) {
    const pool = createPool();
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return this.getProjects();
  },

  async getServices(): Promise<EPCService[]> {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM services ORDER BY id ASC');
    return res.rows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      slug: r.slug,
      category: r.category,
      short_description: r.short_description,
      description: r.description,
      icon_name: r.icon_name,
      image_url: r.image_url,
      features: parseJsonField<string[]>(r.features, []),
      counties_served: parseJsonField<string[]>(r.counties_served, []),
    }));
  },

  async getPartners(): Promise<Partner[]> {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM partners ORDER BY display_order ASC, id ASC');
    return res.rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      logo_url: r.logo_url,
      website_url: r.website_url || '',
      category: r.category || 'all',
      active: Boolean(r.active),
      sort_order: Number(r.display_order ?? 1),
    }));
  },

  async upsertPartner(p: any) {
    const pool = createPool();
    const id = Number(p.id || Date.now());
    await pool.query(
      `INSERT INTO partners (id, name, logo_url, website_url, category, active, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, logo_url = EXCLUDED.logo_url,
         category = EXCLUDED.category, active = EXCLUDED.active,
         display_order = EXCLUDED.display_order`,
      [id, p.name, p.logo_url, p.website_url || '', p.category || 'all', Boolean(p.active), p.sort_order || 1]
    );
    return this.getPartners();
  },

  async updatePartner(id: number, p: any) {
    const pool = createPool();
    await pool.query(
      'UPDATE partners SET name = $1, logo_url = $2, category = $3, active = $4, display_order = $5 WHERE id = $6',
      [p.name, p.logo_url, p.category || 'all', Boolean(p.active), p.sort_order ?? 1, id]
    );
    return this.getPartners();
  },

  async reorderPartners(items: any[]) {
    const pool = createPool();
    for (let idx = 0; idx < items.length; idx++) {
      const p = items[idx];
      await pool.query('UPDATE partners SET display_order = $1 WHERE id = $2', [
        p.sort_order ?? idx + 1,
        Number(p.id),
      ]);
    }
    return this.getPartners();
  },

  async deletePartner(id: number) {
    const pool = createPool();
    await pool.query('DELETE FROM partners WHERE id = $1', [id]);
    return this.getPartners();
  },

  async getReviews(): Promise<GoogleReview[]> {
    const pool = createPool();
    await pool.query(
      `DELETE FROM reviews WHERE author_name IN (
        'Peter Mwangi', 'Faith Wanjiru', 'Kelvin Mutua',
        'Eng. David Karanja', 'Dr. Grace Muli', 'Samuel Ochieng', 'Catherine Njoroge'
      )`
    );
    const res = await pool.query('SELECT * FROM reviews ORDER BY id ASC');
    return res.rows.map((r) => ({
      id: Number(r.id),
      author_name: r.author_name,
      author_photo: r.author_photo || '',
      rating: Number(r.rating || 5),
      time_ago: r.time_ago || 'Recently',
      text: r.text || '',
      location: r.location || 'Kenya',
      verified: Boolean(r.verified),
      reviewer_badge: r.reviewer_badge || '1 review',
      likes_count: Number(r.likes_count ?? 1),
      owner_reply: r.owner_reply || undefined,
      owner_reply_time: r.owner_reply_time || 'a week ago',
      keywords: parseJsonField<string[]>(r.keywords, []),
      google_review_url: r.google_review_url || undefined,
    }));
  },

  async upsertReview(r: any) {
    const pool = createPool();
    const id = Number(r.id || Date.now());
    await pool.query(
      `INSERT INTO reviews (
        id, author_name, author_photo, reviewer_badge, rating, time_ago,
        location, text, likes_count, owner_reply, owner_reply_time,
        project_type, verified, google_review_url, keywords
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        author_name = EXCLUDED.author_name, author_photo = EXCLUDED.author_photo,
        reviewer_badge = EXCLUDED.reviewer_badge, rating = EXCLUDED.rating,
        time_ago = EXCLUDED.time_ago, location = EXCLUDED.location, text = EXCLUDED.text,
        likes_count = EXCLUDED.likes_count, owner_reply = EXCLUDED.owner_reply,
        owner_reply_time = EXCLUDED.owner_reply_time, verified = EXCLUDED.verified,
        google_review_url = EXCLUDED.google_review_url, keywords = EXCLUDED.keywords`,
      [
        id,
        String(r.author_name || 'Verified Google Customer'),
        String(r.author_photo || ''),
        String(r.reviewer_badge || '1 review'),
        Number(r.rating || 5),
        String(r.time_ago || 'Just now'),
        String(r.location || 'Kenya'),
        String(r.text || ''),
        Number(r.likes_count ?? 1),
        String(r.owner_reply || ''),
        String(r.owner_reply_time || 'a week ago'),
        'Solar Installation',
        r.verified !== false,
        String(r.google_review_url || 'https://g.page/r/CVAYv1cTmiLaEAE/review'),
        JSON.stringify(Array.isArray(r.keywords) ? r.keywords : []),
      ]
    );
    return this.getReviews();
  },

  async updateReview(id: number, r: any) {
    const pool = createPool();
    await pool.query(
      `UPDATE reviews SET
        author_name = $1, author_photo = $2, rating = $3, time_ago = $4, text = $5,
        location = $6, verified = $7, reviewer_badge = $8, likes_count = $9,
        owner_reply = $10, owner_reply_time = $11, keywords = $12::jsonb, google_review_url = $13
       WHERE id = $14`,
      [
        String(r.author_name || 'Verified Google Customer'),
        String(r.author_photo || ''),
        Number(r.rating || 5),
        String(r.time_ago || 'a week ago'),
        String(r.text || ''),
        String(r.location || 'Kenya'),
        r.verified !== false,
        String(r.reviewer_badge || '1 review'),
        Number(r.likes_count ?? 1),
        String(r.owner_reply || ''),
        String(r.owner_reply_time || 'a week ago'),
        JSON.stringify(Array.isArray(r.keywords) ? r.keywords : []),
        String(r.google_review_url || 'https://g.page/r/CVAYv1cTmiLaEAE/review'),
        id,
      ]
    );
    return this.getReviews();
  },

  async deleteReview(id: number) {
    const pool = createPool();
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    return this.getReviews();
  },

  async syncGoogleReviews(revs: any[]) {
    const pool = createPool();
    const existing = await this.getReviews();
    for (let idx = 0; idx < revs.length; idx++) {
      const rev = revs[idx];
      const found = existing.find(
        (e) => e.author_name.toLowerCase() === String(rev.author_name || '').toLowerCase()
      );
      const id = found ? found.id : idx + 1;
      await this.upsertReview({ ...rev, id });
    }
    return this.getReviews();
  },

  async getArticles(): Promise<Article[]> {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM articles ORDER BY published_at DESC, id DESC');
    return res.rows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      slug: r.slug,
      category: r.category || 'Solar Guides & Insights',
      content: r.content || '',
      excerpt: r.excerpt || '',
      meta_description: r.meta_description || '',
      author: r.author || 'Shantis Designs Engineering Team',
      published_at: r.published_at || '',
      image_url: r.image_url || '',
      tags: parseJsonField<string[]>(r.tags, []),
      read_time: r.read_time || '5 min read',
    }));
  },

  async upsertArticle(a: any) {
    const pool = createPool();
    const id = Number(a.id || Date.now());
    const slug = a.slug || String(a.title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await pool.query(
      `INSERT INTO articles (
        id, title, slug, excerpt, content, author, category,
        image_url, published_at, read_time, meta_description, tags
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, slug = EXCLUDED.slug, excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content, author = EXCLUDED.author, category = EXCLUDED.category,
        image_url = EXCLUDED.image_url, read_time = EXCLUDED.read_time,
        meta_description = EXCLUDED.meta_description, tags = EXCLUDED.tags`,
      [
        id,
        a.title,
        slug,
        a.excerpt || '',
        a.content || '',
        a.author || 'Shantis Designs Engineering Team',
        a.category || 'Solar Guides & Insights',
        a.image_url || '',
        a.published_at || new Date().toISOString().split('T')[0],
        a.read_time || '5 min read',
        a.meta_description || a.excerpt || '',
        JSON.stringify(a.tags || []),
      ]
    );
    return this.getArticles();
  },

  async updateArticle(id: number, a: any) {
    const pool = createPool();
    await pool.query(
      `UPDATE articles SET
        title = $1, slug = $2, category = $3, content = $4, excerpt = $5,
        meta_description = $6, author = $7, image_url = $8, tags = $9::jsonb, read_time = $10
       WHERE id = $11`,
      [
        a.title,
        a.slug,
        a.category,
        a.content,
        a.excerpt,
        a.meta_description,
        a.author,
        a.image_url,
        JSON.stringify(a.tags || []),
        a.read_time,
        id,
      ]
    );
    return this.getArticles();
  },

  async deleteArticle(id: number) {
    const pool = createPool();
    await pool.query('DELETE FROM articles WHERE id = $1', [id]);
    return this.getArticles();
  },

  async getOrders(): Promise<Order[]> {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    return res.rows.map((r) => ({
      id: Number(r.id),
      order_number: r.order_number,
      customer_name: r.customer_name,
      customer_phone: r.customer_phone,
      customer_email: r.customer_email || '',
      customer_location: r.customer_location,
      items: parseJsonField<any[]>(r.items_json, []),
      total: Number(r.total) || 0,
      payment_method: r.payment_method,
      status: r.status,
      mpesa_receipt: r.mpesa_receipt || undefined,
      created_at:
        r.created_at instanceof Date
          ? r.created_at.toISOString().replace('T', ' ').slice(0, 16)
          : String(r.created_at || ''),
    }));
  },

  async createOrder(order: any) {
    const pool = createPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const nowSuffix = String(Date.now()).slice(-4);
      const orderNumber =
        order.order_number || `SH-${new Date().getFullYear()}-${nowSuffix}`;
      const items = Array.isArray(order.items) ? order.items : [];
      const total = Number(order.total) || 0;
      const vat = Math.round((total * 16) / 116);
      const subtotal = Math.max(0, total - vat);

      const ins = await client.query(
        `INSERT INTO orders (
          order_number, customer_name, customer_phone, customer_email,
          customer_location, items_json, subtotal, vat, total,
          payment_method, mpesa_receipt, checkout_request_id, status
        ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,$13)
        RETURNING id, order_number, created_at`,
        [
          orderNumber,
          String(order.customer_name || 'Customer').slice(0, 120),
          String(order.customer_phone || '').slice(0, 40),
          String(order.customer_email || '').slice(0, 120),
          String(order.customer_location || 'Nairobi, Kenya').slice(0, 250),
          JSON.stringify(items),
          subtotal,
          vat,
          total,
          String(order.payment_method || 'mpesa_daraja'),
          order.mpesa_receipt || null,
          order.checkout_request_id || null,
          String(order.status || 'pending'),
        ]
      );

      for (const item of items) {
        if (item.product_id && item.quantity) {
          const qty = Number(item.quantity);
          await client.query(
            `UPDATE products
             SET stock = GREATEST(0, stock - $1),
                 stock_status = CASE WHEN (stock - $1) <= 0 THEN 'outofstock' ELSE 'instock' END
             WHERE id = $2`,
            [qty, Number(item.product_id)]
          );
        }
      }

      await client.query('COMMIT');
      const row = ins.rows[0];
      return {
        id: Number(row.id),
        order_number: row.order_number,
        created_at:
          row.created_at instanceof Date
            ? row.created_at.toISOString().replace('T', ' ').slice(0, 16)
            : String(row.created_at || ''),
        orders: await this.getOrders(),
        products: await this.getProducts(),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateOrderStatus(id: number, status: string, mpesaReceipt?: string) {
    const pool = createPool();
    if (mpesaReceipt) {
      await pool.query('UPDATE orders SET status = $1, mpesa_receipt = $2 WHERE id = $3', [
        status,
        mpesaReceipt,
        id,
      ]);
    } else {
      await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    }
    return this.getOrders();
  },

  async updateOrderByNumber(orderNumber: string, status: string, mpesaReceipt?: string | null) {
    const pool = createPool();
    await pool.query(
      'UPDATE orders SET status = $1, mpesa_receipt = COALESCE($2, mpesa_receipt) WHERE order_number = $3',
      [status, mpesaReceipt || null, orderNumber]
    );
  },

  async updateOrderByCheckoutId(checkoutRequestId: string, status: string, mpesaReceipt?: string | null) {
    const pool = createPool();
    await pool.query(
      'UPDATE orders SET status = $1, mpesa_receipt = COALESCE($2, mpesa_receipt) WHERE checkout_request_id = $3',
      [status, mpesaReceipt || null, checkoutRequestId]
    );
  },

  async getLeads(): Promise<WhatsAppLead[]> {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM leads ORDER BY id DESC');
    return res.rows.map((r) => ({
      id: Number(r.id),
      product_id: r.product_id ? Number(r.product_id) : undefined,
      product_name: r.product_name,
      phone_number: r.phone_number,
      total_value: Number(r.total_value) || 0,
      timestamp: r.timestamp,
      status: r.status || 'new',
      notes: r.notes || undefined,
      source: r.source || 'whatsapp_button',
    }));
  },

  async createLead(lead: any) {
    const pool = createPool();
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const ins = await pool.query(
      `INSERT INTO leads (
        product_id, product_name, phone_number, total_value, timestamp, status, notes, source
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [
        lead.product_id ? Number(lead.product_id) : null,
        String(lead.product_name || 'General Solar Inquiry').slice(0, 300),
        String(lead.phone_number || '+254').slice(0, 40),
        Number(lead.total_value) || 0,
        timestamp,
        lead.status || 'new',
        String(lead.notes || '').slice(0, 500),
        lead.source || 'whatsapp_button',
      ]
    );
    return {
      id: Number(ins.rows[0].id),
      timestamp,
      leads: await this.getLeads(),
    };
  },

  async updateLeadStatus(id: number, status: string) {
    const pool = createPool();
    await pool.query('UPDATE leads SET status = $1 WHERE id = $2', [status, id]);
    return this.getLeads();
  },

  async getMediaList(): Promise<MediaItem[]> {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM media_library ORDER BY uploaded_at DESC LIMIT 300');
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      mime_type: r.mime_type || 'image/jpeg',
      size: r.size || '240 KB',
      dimensions: r.dimensions || '800 × 800 px',
      uploaded_at:
        r.uploaded_at instanceof Date
          ? r.uploaded_at.toISOString().split('T')[0]
          : String(r.uploaded_at || ''),
    }));
  },

  async upsertMedia(m: any) {
    const pool = createPool();
    const id = m.id || `media-${Date.now()}`;
    await pool.query(
      `INSERT INTO media_library (id, name, url, mime_type, size, dimensions)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, url = EXCLUDED.url, mime_type = EXCLUDED.mime_type`,
      [id, m.name, m.url, m.mime_type || 'image/jpeg', m.size || '240 KB', m.dimensions || '800 × 800 px']
    );
    return this.getMediaList();
  },

  async deleteMedia(id: string) {
    const pool = createPool();
    await pool.query('DELETE FROM media_library WHERE id = $1', [id]);
    return this.getMediaList();
  },

  async getAboutData(): Promise<AboutData> {
    const pool = createPool();
    const res = await pool.query('SELECT data_json FROM about_page WHERE id = 1');
    if (!res.rows[0]) return INITIAL_ABOUT_DATA;
    const parsed = parseJsonField<AboutData>(res.rows[0].data_json, INITIAL_ABOUT_DATA);
    if (!parsed.gallery_images || parsed.gallery_images.length === 0) {
      parsed.gallery_images = INITIAL_ABOUT_DATA.gallery_images;
    }
    return parsed;
  },

  async getHomepageConfig(): Promise<HomepageConfig> {
    const pool = createPool();
    const res = await pool.query('SELECT published_json, draft_json FROM homepage_config WHERE id = 1');
    if (!res.rows[0]) return DEFAULT_HOMEPAGE_CONFIG;
    return parseJsonField<HomepageConfig>(
      res.rows[0].published_json || res.rows[0].draft_json,
      DEFAULT_HOMEPAGE_CONFIG
    );
  },

  async getSetting(key: string): Promise<any | null> {
    const pool = createPool();
    const res = await pool.query('SELECT value_json FROM site_settings WHERE key = $1', [key]);
    if (!res.rows[0]) return null;
    return parseJsonField(res.rows[0].value_json, null);
  },

  async saveSetting(key: string, payload: any) {
    const pool = createPool();
    if (key === 'about_data') {
      await pool.query(
        `INSERT INTO about_page (id, data_json, updated_at) VALUES (1, $1::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET data_json = EXCLUDED.data_json, updated_at = NOW()`,
        [JSON.stringify(payload)]
      );
    } else if (key === 'homepage_config') {
      const jsonStr = JSON.stringify(payload);
      await pool.query(
        `INSERT INTO homepage_config (id, draft_json, published_json, updated_at)
         VALUES (1, $1::jsonb, $1::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           draft_json = EXCLUDED.draft_json, published_json = EXCLUDED.published_json, updated_at = NOW()`,
        [jsonStr]
      );
    } else {
      await pool.query(
        `INSERT INTO site_settings (key, value_json, updated_at) VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW()`,
        [key, JSON.stringify(payload)]
      );
    }
  },

  async verifyUserCredentials(email: string, passwordPlain: string) {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    const user = res.rows[0];
    if (!user) return null;
    if (!verifyScryptSecret(passwordPlain, user.password_hash, user.password_salt)) return null;
    return user;
  },

  async getUserById(userId: string) {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [String(userId)]);
    return res.rows[0] || null;
  },

  async verifyUserTotp(userId: string, totpPlain: string): Promise<boolean> {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [String(userId)]);
    const user = res.rows[0];
    if (!user) return false;
    const clean = totpPlain.trim();
    if (user.google_totp_enabled && user.google_totp_secret) {
      if (verifyGoogleTotp(user.google_totp_secret, clean)) return true;
    }
    return verifyScryptSecret(clean, user.totp_code, user.password_salt);
  },

  async createUser(params: {
    email: string;
    name: string;
    role: string;
    password: string;
    totpCode?: string;
  }) {
    const pool = createPool();
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [
      params.email.trim(),
    ]);
    if (existing.rows.length > 0) {
      throw new Error('A user with this email address already exists.');
    }
    const id = `USR-${Date.now()}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const pwHash = hashWithRandomSalt(params.password.trim());
    const totpHash = hashWithRandomSalt((params.totpCode || '254880').trim());
    await pool.query(
      `INSERT INTO users (
        id, email, name, role, password_hash, password_salt, totp_secret, totp_code,
        google_totp_secret, google_totp_enabled
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'',FALSE)`,
      [id, params.email.trim().toLowerCase(), params.name.trim(), params.role.trim(), pwHash, salt, '', totpHash]
    );
    return this.getUsersSummary();
  },

  async updateUser(
    id: string,
    params: {
      email?: string;
      name?: string;
      role?: string;
      password?: string;
      totpCode?: string;
      google_totp_enabled?: boolean;
      google_totp_secret?: string;
    }
  ) {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [String(id)]);
    const user = res.rows[0];
    if (!user) return null;

    const nextEmail = params.email ? params.email.trim().toLowerCase() : user.email;
    const nextName = params.name ? params.name.trim() : user.name;
    const nextRole = params.role ? params.role.trim() : user.role;
    const nextPwHash =
      params.password && params.password.trim().length >= 6
        ? hashWithRandomSalt(params.password.trim())
        : user.password_hash;
    const nextTotpCode =
      params.totpCode && params.totpCode.trim().length >= 4
        ? hashWithRandomSalt(params.totpCode.trim())
        : user.totp_code;
    const nextGoogleEnabled =
      typeof params.google_totp_enabled === 'boolean'
        ? params.google_totp_enabled
        : Boolean(user.google_totp_enabled);
    const nextGoogleSecret =
      params.google_totp_secret !== undefined ? params.google_totp_secret : user.google_totp_secret || '';

    await pool.query(
      `UPDATE users
       SET email = $1, name = $2, role = $3, password_hash = $4, totp_code = $5,
           google_totp_enabled = $6, google_totp_secret = $7
       WHERE id = $8`,
      [nextEmail, nextName, nextRole, nextPwHash, nextTotpCode, nextGoogleEnabled, nextGoogleSecret, user.id]
    );

    // Keep active sessions aligned if user metadata changed
    await pool.query('UPDATE sessions SET user_email = $1, user_name = $2, user_role = $3 WHERE user_id = $4', [
      nextEmail,
      nextName,
      nextRole,
      String(user.id),
    ]);

    return {
      email: nextEmail,
      name: nextName,
      role: nextRole,
      users: await this.getUsersSummary(),
    };
  },

  async deleteUser(id: string) {
    const pool = createPool();
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [String(id)]);
    await pool.query('DELETE FROM users WHERE id = $1', [String(id)]);
    return this.getUsersSummary();
  },

  async updateUserPassword(email: string, newPasswordPlain: string, newTotpPlain?: string) {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    const user = res.rows[0];
    if (!user) return null;
    const newPwHash = hashWithRandomSalt(newPasswordPlain);
    const newTotpHash = newTotpPlain ? hashWithRandomSalt(newTotpPlain.trim()) : user.totp_code;
    await pool.query(
      'UPDATE users SET password_hash = $1, totp_code = $2 WHERE id = $3',
      [newPwHash, newTotpHash, user.id]
    );
    return {
      email: user.email,
      role: user.role,
      name: user.name,
      passwordHashPreview: `${newPwHash.slice(0, 16)}...${newPwHash.slice(-12)}`,
      algorithm: 'scrypt-64byte-hex',
    };
  },

  async getUsersSummary() {
    const pool = createPool();
    const res = await pool.query(
      `SELECT id, email, role, name, password_hash, totp_code, password_salt,
              google_totp_enabled, google_totp_secret, created_at
       FROM users ORDER BY id ASC`
    );
    return res.rows.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
      password_hash: u.password_hash,
      totp_code_hash: u.totp_code,
      google_totp_enabled: Boolean(u.google_totp_enabled && u.google_totp_secret),
      salt: u.password_salt,
      created_at:
        u.created_at instanceof Date ? u.created_at.toISOString() : String(u.created_at || ''),
    }));
  },

  async createSession(params: {
    token: string;
    userId: string;
    email: string;
    role: string;
    name: string;
    expiresAt: number;
    ipAddress?: string;
  }) {
    const pool = createPool();
    await pool.query(
      `INSERT INTO sessions (token, user_id, user_email, user_name, user_role, two_factor_verified, ip_address, expires_at)
       VALUES ($1,$2,$3,$4,$5,FALSE,$6,$7)`,
      [
        params.token,
        String(params.userId),
        params.email,
        params.name,
        params.role,
        params.ipAddress || '127.0.0.1',
        params.expiresAt,
      ]
    );
  },

  async getSession(token: string, require2FA = false) {
    const pool = createPool();
    const query = require2FA
      ? 'SELECT * FROM sessions WHERE token = $1 AND two_factor_verified = TRUE'
      : 'SELECT * FROM sessions WHERE token = $1';
    const res = await pool.query(query, [token]);
    const s = res.rows[0];
    if (!s) return null;
    return {
      token: s.token,
      user_id: s.user_id,
      email: s.user_email,
      name: s.user_name,
      role: s.user_role,
      two_factor_verified: Boolean(s.two_factor_verified),
      expires_at: Number(s.expires_at),
    };
  },

  async verifySession2FA(token: string) {
    const pool = createPool();
    await pool.query('UPDATE sessions SET two_factor_verified = TRUE WHERE token = $1', [token]);
  },

  async deleteSession(token: string) {
    const pool = createPool();
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  },

  async getMpesaCredentials(includeRuntimeSecrets = false) {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM mpesa_api_credentials WHERE id = 1');
    const row = res.rows[0];
    const envKey = (process.env.MPESA_CONSUMER_KEY || '').trim();
    const envSecret = (process.env.MPESA_CONSUMER_SECRET || '').trim();
    const envPasskey = (process.env.MPESA_PASSKEY || '').trim();

    const decKey = row?.consumer_key_enc ? decryptVaultSecret(row.consumer_key_enc) : envKey;
    const decSecret = row?.consumer_secret_enc ? decryptVaultSecret(row.consumer_secret_enc) : envSecret;
    const decPasskey = row?.passkey_enc ? decryptVaultSecret(row.passkey_enc) : envPasskey;
    const hasKeys = Boolean(decKey && decSecret && decPasskey);

    if (!row) {
      return {
        shortcode: process.env.MPESA_SHORTCODE || '4108955',
        environment: process.env.MPESA_ENV || 'production',
        callback_url: process.env.MPESA_CALLBACK_URL || 'https://shantisdesigns.co.ke/api/payments/mpesa/callback',
        consumer_key_masked: maskSecretValue(envKey),
        consumer_key_hash: '',
        consumer_secret_masked: maskSecretValue(envSecret),
        consumer_secret_hash: '',
        passkey_masked: maskSecretValue(envPasskey),
        passkey_hash: '',
        initiator_password_hash: '',
        has_keys: hasKeys,
        updated_at: new Date().toISOString(),
        ...(includeRuntimeSecrets
          ? {
              runtime_consumer_key: decKey,
              runtime_consumer_secret: decSecret,
              runtime_passkey: decPasskey,
            }
          : {}),
      };
    }
    return {
      shortcode: row.shortcode,
      environment: row.environment,
      callback_url: row.callback_url,
      consumer_key_masked: row.consumer_key_masked,
      consumer_key_hash: row.consumer_key_hash,
      consumer_secret_masked: row.consumer_secret_masked,
      consumer_secret_hash: row.consumer_secret_hash,
      passkey_masked: row.passkey_masked,
      passkey_hash: row.passkey_hash,
      initiator_password_hash: row.initiator_password_hash,
      has_keys: hasKeys,
      updated_at:
        row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at || ''),
      ...(includeRuntimeSecrets
        ? {
            runtime_consumer_key: decKey,
            runtime_consumer_secret: decSecret,
            runtime_passkey: decPasskey,
          }
        : {}),
    };
  },

  async saveMpesaCredentials(params: {
    shortcode?: string;
    environment?: string;
    callbackUrl?: string;
    consumerKey?: string;
    consumerSecret?: string;
    passkey?: string;
    initiatorPassword?: string;
  }) {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM mpesa_api_credentials WHERE id = 1');
    const current = res.rows[0];
    const salt = current?.salt || crypto.randomBytes(16).toString('hex');
    const shortcode = (params.shortcode || current?.shortcode || '4108955').trim();
    const environment = (params.environment || current?.environment || 'production').trim();
    const callbackUrl = (
      params.callbackUrl ||
      current?.callback_url ||
      'https://shantisdesigns.co.ke/api/payments/mpesa/callback'
    ).trim();

    const cleanKey = params.consumerKey?.trim();
    const consumerKeyMasked = cleanKey ? maskSecretValue(cleanKey) : current?.consumer_key_masked || '';
    const consumerKeyHash = cleanKey ? hashWithSalt(cleanKey, salt) : current?.consumer_key_hash || '';
    const consumerKeyEnc = cleanKey ? encryptVaultSecret(cleanKey) : current?.consumer_key_enc || '';

    const cleanSecret = params.consumerSecret?.trim();
    const consumerSecretMasked = cleanSecret
      ? maskSecretValue(cleanSecret)
      : current?.consumer_secret_masked || '';
    const consumerSecretHash = cleanSecret
      ? hashWithSalt(cleanSecret, salt)
      : current?.consumer_secret_hash || '';
    const consumerSecretEnc = cleanSecret
      ? encryptVaultSecret(cleanSecret)
      : current?.consumer_secret_enc || '';

    const cleanPasskey = params.passkey?.trim();
    const passkeyMasked = cleanPasskey ? maskSecretValue(cleanPasskey) : current?.passkey_masked || '';
    const passkeyHash = cleanPasskey ? hashWithSalt(cleanPasskey, salt) : current?.passkey_hash || '';
    const passkeyEnc = cleanPasskey ? encryptVaultSecret(cleanPasskey) : current?.passkey_enc || '';

    const cleanInit = params.initiatorPassword?.trim();
    const initiatorPasswordHash = cleanInit
      ? hashWithSalt(cleanInit, salt)
      : current?.initiator_password_hash || '';
    const initiatorPasswordEnc = cleanInit
      ? encryptVaultSecret(cleanInit)
      : current?.initiator_password_enc || '';

    await pool.query(
      `INSERT INTO mpesa_api_credentials (
        id, shortcode, environment, callback_url,
        consumer_key_masked, consumer_key_hash,
        consumer_secret_masked, consumer_secret_hash,
        passkey_masked, passkey_hash, initiator_password_hash,
        consumer_key_enc, consumer_secret_enc, passkey_enc, initiator_password_enc,
        salt, updated_at
      ) VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
      ON CONFLICT (id) DO UPDATE SET
        shortcode = EXCLUDED.shortcode,
        environment = EXCLUDED.environment,
        callback_url = EXCLUDED.callback_url,
        consumer_key_masked = EXCLUDED.consumer_key_masked,
        consumer_key_hash = EXCLUDED.consumer_key_hash,
        consumer_secret_masked = EXCLUDED.consumer_secret_masked,
        consumer_secret_hash = EXCLUDED.consumer_secret_hash,
        passkey_masked = EXCLUDED.passkey_masked,
        passkey_hash = EXCLUDED.passkey_hash,
        initiator_password_hash = EXCLUDED.initiator_password_hash,
        consumer_key_enc = EXCLUDED.consumer_key_enc,
        consumer_secret_enc = EXCLUDED.consumer_secret_enc,
        passkey_enc = EXCLUDED.passkey_enc,
        initiator_password_enc = EXCLUDED.initiator_password_enc,
        salt = EXCLUDED.salt,
        updated_at = NOW()`,
      [
        shortcode,
        environment,
        callbackUrl,
        consumerKeyMasked,
        consumerKeyHash,
        consumerSecretMasked,
        consumerSecretHash,
        passkeyMasked,
        passkeyHash,
        initiatorPasswordHash,
        consumerKeyEnc,
        consumerSecretEnc,
        passkeyEnc,
        initiatorPasswordEnc,
        salt,
      ]
    );

    return this.getMpesaCredentials(false);
  },

  async upsertMpesaTransaction(tx: {
    checkoutRequestId: string;
    merchantRequestId?: string;
    orderNumber?: string;
    phone?: string;
    amount?: number;
    status: string;
    resultCode?: string;
    resultDesc?: string;
    mpesaReceipt?: string;
  }) {
    const pool = createPool();
    await pool.query(
      `INSERT INTO mpesa_transactions (
        checkout_request_id, merchant_request_id, order_number, phone, amount,
        status, result_code, result_desc, mpesa_receipt, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      ON CONFLICT (checkout_request_id) DO UPDATE SET
        status = EXCLUDED.status,
        result_code = COALESCE(NULLIF(EXCLUDED.result_code, ''), mpesa_transactions.result_code),
        result_desc = COALESCE(NULLIF(EXCLUDED.result_desc, ''), mpesa_transactions.result_desc),
        mpesa_receipt = COALESCE(NULLIF(EXCLUDED.mpesa_receipt, ''), mpesa_transactions.mpesa_receipt),
        updated_at = NOW()`,
      [
        tx.checkoutRequestId,
        tx.merchantRequestId || '',
        tx.orderNumber || '',
        tx.phone || '',
        Number(tx.amount || 0),
        tx.status,
        tx.resultCode || '',
        tx.resultDesc || '',
        tx.mpesaReceipt || '',
      ]
    );
  },

  async getMpesaTransaction(checkoutRequestId: string) {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM mpesa_transactions WHERE checkout_request_id = $1', [
      checkoutRequestId,
    ]);
    return res.rows[0] || null;
  },

  async logAudit(actor: string, action: string, details: string, ipAddress: string) {
    const pool = createPool();
    const id = `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await pool.query(
      `INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, ip_address, details)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, actor, actor, 'system', action, 'api', ipAddress, details]
    );
  },

  async getAuditLogs() {
    const pool = createPool();
    const res = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
    return res.rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      user_name: r.user_name,
      user_role: r.user_role,
      action: r.action,
      resource_type: r.resource_type,
      details: r.details,
      ip_address: r.ip_address || '127.0.0.1',
      timestamp:
        r.timestamp instanceof Date
          ? r.timestamp.toISOString().replace('T', ' ').slice(0, 19)
          : String(r.timestamp || ''),
    }));
  },

  async logWebhook(provider: string, eventType: string, signature: string, payloadJson: string, verified: boolean) {
    const pool = createPool();
    await pool.query(
      `INSERT INTO webhooks_log (provider, event_type, signature, payload_json, verified)
       VALUES ($1,$2,$3,$4::jsonb,$5)`,
      [provider, eventType, signature, payloadJson, verified]
    );
  },

  async saveConsent(consentId: string, analytics: boolean, marketing: boolean, ipHash: string, userAgent: string) {
    const pool = createPool();
    await pool.query(
      `INSERT INTO cookie_consents (consent_id, analytics, marketing, ip_hash, user_agent)
       VALUES ($1,$2,$3,$4,$5)`,
      [consentId, analytics, marketing, ipHash, userAgent]
    );
  },
};
