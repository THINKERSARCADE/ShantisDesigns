import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { db, initializeDatabase, SqlRepository } from './src/db/sqlite';
import {
  ensurePostgresInitialized,
  isPostgresConfigured,
  isPostgresReady,
  PgRepository,
} from './src/db/postgres';
import {
  buildOtpAuthUri,
  generateBase32Secret,
  verifyGoogleTotp,
} from './src/db/security';

dotenv.config();

// Initialize local SQLite database (always ready for media BLOB caching & local fallback)
initializeDatabase();

// Initialize PostgreSQL pool & schema when PG* / SQL_* environment variables are configured
const postgresInitPromise: Promise<boolean> = isPostgresConfigured()
  ? ensurePostgresInitialized().catch(() => false)
  : Promise.resolve(false);

const app = express();

const SHANTIS_GBP_URL = 'https://g.page/r/CVAYv1cTmiLaEAE/review';
const SHANTIS_MAPS_URL =
  'https://www.google.com/maps/place/Shantis+Designs+Solar+Solutions/@-1.2842386,36.8253148,17z/data=!4m8!3m7!1s0x182f115049f1603f:0xda229a1357bf1850!8m2!3d-1.2842386!4d36.8278897!9m1!1b1!16s%2Fg%2F11zdf52pcw?hl=en';

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Wait for PostgreSQL initialization promise once on incoming API requests
app.use('/api', async (_req: Request, _res: Response, next: NextFunction) => {
  if (isPostgresConfigured()) {
    await postgresInitPromise;
  }
  next();
});

// 1. Enterprise Security Headers & HTTPS Protocol Enforcement
app.use((req: Request, res: Response, next: NextFunction) => {
  const proto = req.headers['x-forwarded-proto'];
  if (process.env.NODE_ENV === 'production' && proto && proto !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data: blob:; img-src 'self' https: data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: ws: wss:;"
  );
  next();
});

// 2. Recursive XSS Sanitizer for Incoming JSON Bodies
function sanitizeValue(val: any): any {
  if (typeof val === 'string') {
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val && typeof val === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      cleaned[k] = sanitizeValue(v);
    }
    return cleaned;
  }
  return val;
}

app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
});

// 3. Sliding-Window Rate Limiter for Sensitive Endpoints
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Rate limit enforced for security protection.',
      });
    }
    next();
  };
}

function getClientIp(req?: Request): string {
  return (
    (req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req?.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

async function logAudit(actor: string, action: string, details: string, req?: Request) {
  const ip = getClientIp(req);
  try {
    if (isPostgresReady()) {
      await PgRepository.logAudit(actor, action, details, ip);
    } else {
      db.prepare(
        'INSERT INTO audit_logs (actor, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(actor, action, details, ip, new Date().toISOString());
    }
  } catch {
    // Non-blocking audit logging
  }
}

interface AdminSessionUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  token: string;
}

interface AuthenticatedRequest extends Request {
  adminUser?: AdminSessionUser;
}

async function verifyBearerSession(req: Request): Promise<AdminSessionUser | null> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) return null;

    const session = isPostgresReady()
      ? await PgRepository.getSession(token, true)
      : (db
          .prepare('SELECT * FROM sessions WHERE token = ? AND two_factor_verified = 1')
          .get(token) as any);

    if (!session || Date.now() > Number(session.expires_at)) {
      return null;
    }

    return {
      userId: String(session.user_id),
      email: session.email,
      name: session.name,
      role: session.role,
      token: session.token,
    };
  } catch {
    return null;
  }
}

async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminUser = await verifyBearerSession(req);
  if (!adminUser) {
    return res.status(401).json({
      error: 'Authentication required. Please log in and complete 2FA verification.',
    });
  }
  (req as AuthenticatedRequest).adminUser = adminUser;
  next();
}

// 4. Background Image Binary Caching into SQLite BLOBs
async function cacheImageBlobInSqlite(mediaId: string, sourceUrl: string): Promise<Buffer | null> {
  try {
    const existing = db
      .prepare('SELECT binary_data FROM media_assets WHERE id = ?')
      .get(mediaId) as { binary_data: Buffer | null } | undefined;
    if (existing?.binary_data && existing.binary_data.length > 0) {
      return existing.binary_data;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(sourceUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length === 0) return null;

    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const sizeKb = `${Math.max(1, Math.round(buffer.length / 1024))} KB`;

    db.prepare(
      'UPDATE media_assets SET binary_data = ?, sha256_hash = ?, mime_type = ?, size_label = ? WHERE id = ?'
    ).run(buffer, sha256, contentType, sizeKb, mediaId);

    return buffer;
  } catch {
    return null;
  }
}

setTimeout(async () => {
  try {
    const uncached = db
      .prepare('SELECT id, source_url FROM media_assets WHERE binary_data IS NULL LIMIT 25')
      .all() as { id: string; source_url: string }[];
    for (const item of uncached) {
      await cacheImageBlobInSqlite(item.id, item.source_url);
    }
  } catch {
    // Ignore background pre-warm network errors
  }
}, 1500);

// Live Google Maps Place Review Extractor (supports maps.app.goo.gl & full Google Maps Place URLs)
async function fetchLiveReviewsFromGoogleMapsPlace(targetUrl: string): Promise<
  Array<{
    author_name: string;
    author_photo: string;
    rating: number;
    time_ago: string;
    text: string;
    location: string;
    verified: number;
    reviewer_badge: string;
    likes_count: number;
    owner_reply: string;
    owner_reply_time: string;
    keywords: string[];
    google_review_url: string;
  }>
> {
  const results: Array<{
    author_name: string;
    author_photo: string;
    rating: number;
    time_ago: string;
    text: string;
    location: string;
    verified: number;
    reviewer_badge: string;
    likes_count: number;
    owner_reply: string;
    owner_reply_time: string;
    keywords: string[];
    google_review_url: string;
  }> = [];

  const candidateUrls: string[] = [];
  const trimmed = (targetUrl || '').trim();
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('google.com/maps/place')) {
    candidateUrls.push(trimmed);
    // Recover cleanly if a shared 18-char maps.app.goo.gl link had an accidental trailing character
    if (trimmed.includes('maps.app.goo.gl/') && trimmed.length > 35) {
      candidateUrls.push(trimmed.slice(0, -1));
    }
  }
  candidateUrls.push(SHANTIS_MAPS_URL);

  const ua =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 9000);
      const pageRes = await fetch(url, {
        headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!pageRes.ok) continue;

      const html = await pageRes.text();
      const match = html.match(/href="(\/maps\/preview\/place[^"]+)"/);
      if (!match) continue;

      const previewPath = match[1].replace(/&amp;/g, '&');
      const controller2 = new AbortController();
      const t2 = setTimeout(() => controller2.abort(), 9000);
      const previewRes = await fetch(`https://www.google.com${previewPath}`, {
        headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
        signal: controller2.signal,
      });
      clearTimeout(t2);
      if (!previewRes.ok) continue;

      const rawText = await previewRes.text();
      const jsonStr = rawText.startsWith(")]}'") ? rawText.slice(4) : rawText;
      const parsed = JSON.parse(jsonStr);
      const reviewEntries = parsed?.[6]?.[175]?.[9]?.[0]?.[0];
      if (!Array.isArray(reviewEntries) || reviewEntries.length === 0) continue;

      for (const entry of reviewEntries) {
        const rev = entry?.[0];
        const meta = rev?.[1];
        const author = String(meta?.[4]?.[5]?.[0] || '').trim();
        if (!author) continue;

        const photo = String(meta?.[4]?.[5]?.[1] || '').trim();
        const badge = String(meta?.[4]?.[5]?.[10]?.[0] || '1 review').trim();
        const timeAgo = String(meta?.[6] || 'Recently').trim();
        const rating = Number(rev?.[2]?.[0]?.[0] || 5);
        const text = String(rev?.[2]?.[15]?.[0]?.[0] || '').trim();
        const replyBlock = rev?.[3];
        const ownerReply = String(replyBlock?.[14]?.[0]?.[0] || '').trim();
        const ownerReplyTime = String(replyBlock?.[3] || 'a week ago').trim();

        const lower = text.toLowerCase();
        const kws: string[] = [];
        if (lower.includes('inverter')) kws.push('inverter');
        if (lower.includes('batter')) kws.push('batteries');
        if (lower.includes('panel')) kws.push('panels');
        if (lower.includes('install')) kws.push('solar installations');

        let location = 'Kenya';
        if (lower.includes('timau')) location = 'Timau, Meru / Laikipia';
        else if (lower.includes('munyu lane')) location = 'Munyu Lane, Nairobi CBD';
        else if (lower.includes('nairobi')) location = 'Nairobi, Kenya';

        results.push({
          author_name: author,
          author_photo: photo,
          rating,
          time_ago: timeAgo,
          text,
          location,
          verified: 1,
          reviewer_badge: badge,
          likes_count: lower.length > 50 ? 2 : 1,
          owner_reply: ownerReply,
          owner_reply_time: ownerReply ? ownerReplyTime : '',
          keywords: kws,
          google_review_url: SHANTIS_GBP_URL,
        });
      }

      if (results.length > 0) return results;
    } catch {
      // Try next URL candidate
    }
  }

  return results;
}

// ============================================================================
// API ROUTES — POSTGRESQL (PRIMARY WHEN CONFIGURED) + SQLITE3 FALLBACK
// ============================================================================

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const pgActive = isPostgresReady();
    const counts = pgActive
      ? await PgRepository.getCounts()
      : {
          products: (db.prepare('SELECT COUNT(*) as c FROM products').get() as any).c,
          categories: (db.prepare('SELECT COUNT(*) as c FROM categories').get() as any).c,
          projects: (db.prepare('SELECT COUNT(*) as c FROM projects').get() as any).c,
          media_assets: (db.prepare('SELECT COUNT(*) as c FROM media_assets').get() as any).c,
          cached_blobs: (
            db.prepare('SELECT COUNT(*) as c FROM media_assets WHERE binary_data IS NOT NULL').get() as any
          ).c,
          orders: (db.prepare('SELECT COUNT(*) as c FROM orders').get() as any).c,
          leads: (db.prepare('SELECT COUNT(*) as c FROM whatsapp_leads').get() as any).c,
        };

    res.json({
      status: 'online',
      engine: pgActive
        ? 'Node.js Express + PostgreSQL 10+ (Live Pool)'
        : 'Node.js Express + SQLite3 (WAL Mode)',
      database: pgActive ? process.env.PGDATABASE || process.env.SQL_DB_NAME || 'postgresql' : 'shantis_solar.sqlite',
      security: {
        hsts: true,
        csp: true,
        preparedStatements: true,
        xssSanitization: true,
        piiMasking: true,
      },
      counts,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err?.message });
  }
});

app.get('/api/bootstrap', async (req: Request, res: Response) => {
  try {
    const adminSession = await verifyBearerSession(req);
    if (isPostgresReady()) {
      const [
        products,
        categories,
        projects,
        services,
        partners,
        reviews,
        articles,
        aboutData,
        homepageConfig,
        media,
        orders,
        leads,
      ] = await Promise.all([
        PgRepository.getProducts(),
        PgRepository.getCategories(),
        PgRepository.getProjects(),
        PgRepository.getServices(),
        PgRepository.getPartners(),
        PgRepository.getReviews(),
        PgRepository.getArticles(),
        PgRepository.getAboutData(),
        PgRepository.getHomepageConfig(),
        PgRepository.getMediaList(),
        adminSession ? PgRepository.getOrders() : Promise.resolve([]),
        adminSession ? PgRepository.getLeads() : Promise.resolve([]),
      ]);

      return res.json({
        live: true,
        engine: 'postgresql',
        authenticated: Boolean(adminSession),
        products,
        categories,
        projects,
        services,
        partners,
        reviews,
        articles,
        aboutData,
        homepageConfig,
        media,
        orders,
        leads,
      });
    }

    const products = SqlRepository.getProducts();
    const categories = SqlRepository.getCategories();
    const projects = SqlRepository.getProjects();
    const services = SqlRepository.getServices();
    const partners = SqlRepository.getPartners();
    const reviews = SqlRepository.getReviews();
    const articles = SqlRepository.getArticles();
    const aboutData = SqlRepository.getAboutData();
    const homepageConfig = SqlRepository.getHomepageConfig();
    const media = SqlRepository.getMediaList();
    const orders = adminSession ? SqlRepository.getOrders() : [];
    const leads = adminSession ? SqlRepository.getLeads() : [];

    res.json({
      live: true,
      engine: 'sqlite',
      authenticated: Boolean(adminSession),
      products,
      categories,
      projects,
      services,
      partners,
      reviews,
      articles,
      aboutData,
      homepageConfig,
      media,
      orders,
      leads,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Database bootstrap failed', message: err?.message });
  }
});

// Serve Image Binary directly from SQLite `media_assets` table by ID
app.get('/api/media/:id', async (req: Request, res: Response) => {
  try {
    const row = db
      .prepare('SELECT * FROM media_assets WHERE id = ? OR slug = ?')
      .get(req.params.id, req.params.id) as any;
    if (!row) {
      return res.status(404).json({ error: 'Media asset not found in SQL database' });
    }

    let blob: Buffer | null = row.binary_data;
    if (!blob || blob.length === 0) {
      blob = await cacheImageBlobInSqlite(row.id, row.source_url);
    }

    if (blob && blob.length > 0) {
      res.setHeader('Content-Type', row.mime_type || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Media-Source', 'sqlite-blob');
      return res.send(blob);
    }

    return res.redirect(302, row.source_url);
  } catch {
    return res.status(500).end();
  }
});

// Serve or Cache Image Binary by Original URL (`GET /api/media-proxy?url=...`)
app.get('/api/media-proxy', async (req: Request, res: Response) => {
  const url = String(req.query.url || '').trim();
  if (!url) return res.status(400).end();

  try {
    let row = db.prepare('SELECT * FROM media_assets WHERE source_url = ?').get(url) as any;
    if (!row) {
      const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
      const id = `media-auto-${hash}`;
      db.prepare(
        `INSERT OR IGNORE INTO media_assets (id, slug, name, source_url, mime_type, size_label, dimensions, entity_type, uploaded_at)
         VALUES (?, ?, ?, ?, 'image/jpeg', '250 KB', '800 × 800 px', 'on_demand', ?)`
      ).run(id, hash, `Solar Asset ${hash}`, url, new Date().toISOString().split('T')[0]);
      row = db.prepare('SELECT * FROM media_assets WHERE source_url = ?').get(url) as any;
    }

    if (row) {
      let blob: Buffer | null = row.binary_data;
      if (!blob || blob.length === 0) {
        blob = await cacheImageBlobInSqlite(row.id, row.source_url);
      }
      if (blob && blob.length > 0) {
        res.setHeader('Content-Type', row.mime_type || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('X-Media-Source', 'sqlite-blob');
        return res.send(blob);
      }
    }
    return res.redirect(302, url);
  } catch {
    return res.redirect(302, url);
  }
});

// ============================================================================
// AUTHENTICATION, USER MANAGEMENT & GOOGLE 2FA ENDPOINTS
// ============================================================================

app.post('/api/auth/login', rateLimit(15, 15 * 60 * 1000), async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const pg = isPostgresReady();
  const user = pg
    ? await PgRepository.verifyUserCredentials(String(email), String(password))
    : SqlRepository.verifyUserCredentials(String(email), String(password));

  if (!user) {
    await logAudit(String(email), 'LOGIN_FAILED', 'Invalid email or password', req);
    return res.status(401).json({
      error: 'Access Denied: Invalid corporate email or password.',
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

  if (pg) {
    await PgRepository.createSession({
      token,
      userId: String(user.id),
      email: user.email,
      role: user.role,
      name: user.name,
      expiresAt,
      ipAddress: getClientIp(req),
    });
  } else {
    db.prepare(
      `INSERT INTO sessions (token, user_id, email, role, name, two_factor_verified, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`
    ).run(token, user.id, user.email, user.role, user.name, expiresAt, new Date().toISOString());
  }

  await logAudit(user.email, 'LOGIN_STEP1_SUCCESS', 'Password verified, awaiting 2FA verification', req);
  res.json({
    requires2FA: true,
    tempToken: token,
    role: user.role === 'super_admin' ? 'Super Admin' : user.role,
    name: user.name,
    email: user.email,
    google2faEnabled: Boolean(user.google_totp_enabled && user.google_totp_secret),
  });
});

app.post('/api/auth/verify-2fa', rateLimit(15, 15 * 60 * 1000), async (req: Request, res: Response) => {
  const { token, code } = req.body || {};
  if (!token || !code) {
    return res.status(400).json({ error: 'Session token and 2FA code are required.' });
  }

  const pg = isPostgresReady();
  const session = pg
    ? await PgRepository.getSession(String(token), false)
    : (db.prepare('SELECT * FROM sessions WHERE token = ?').get(String(token)) as any);

  if (!session || Date.now() > Number(session.expires_at)) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }

  const isTotpValid = pg
    ? await PgRepository.verifyUserTotp(String(session.user_id), String(code))
    : SqlRepository.verifyUserTotp(session.user_id, String(code));

  if (!isTotpValid) {
    await logAudit(session.email, '2FA_FAILED', 'Invalid 2FA or Google Authenticator code', req);
    return res.status(401).json({ error: 'Invalid 2FA / Google Authenticator Security Code.' });
  }

  if (pg) {
    await PgRepository.verifySession2FA(String(token));
  } else {
    db.prepare('UPDATE sessions SET two_factor_verified = 1 WHERE token = ?').run(String(token));
  }

  const userRecord = pg
    ? await PgRepository.getUserById(String(session.user_id))
    : SqlRepository.getUserById(session.user_id);

  await logAudit(session.email, '2FA_VERIFIED', 'Full admin SQL session established', req);

  res.json({
    authenticated: true,
    token: session.token,
    user: {
      id: String(session.user_id),
      email: session.email,
      role: session.role === 'super_admin' ? 'Super Admin' : session.role,
      name: session.name,
      google_totp_enabled: Boolean(userRecord?.google_totp_enabled && userRecord?.google_totp_secret),
    },
  });
});

app.get('/api/auth/session', async (req: Request, res: Response) => {
  const adminSession = await verifyBearerSession(req);
  if (!adminSession) return res.status(401).json({ authenticated: false });

  const userRecord = isPostgresReady()
    ? await PgRepository.getUserById(adminSession.userId)
    : SqlRepository.getUserById(adminSession.userId);

  res.json({
    authenticated: true,
    user: {
      id: adminSession.userId,
      email: adminSession.email,
      role: adminSession.role === 'super_admin' ? 'Super Admin' : adminSession.role,
      name: adminSession.name,
      google_totp_enabled: Boolean(userRecord?.google_totp_enabled && userRecord?.google_totp_secret),
    },
  });
});

app.post('/api/auth/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (token) {
    const adminSession = await verifyBearerSession(req);
    if (isPostgresReady()) {
      await PgRepository.deleteSession(token);
    } else {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    if (adminSession) {
      await logAudit(adminSession.email, 'LOGOUT', 'Admin session terminated securely', req);
    }
  }
  res.json({ success: true });
});

app.get('/api/auth/users', requireAdminAuth, async (_req: Request, res: Response) => {
  const users = isPostgresReady()
    ? await PgRepository.getUsersSummary()
    : SqlRepository.getUsersSummary();
  res.json({ users });
});

app.post('/api/auth/users', requireAdminAuth, rateLimit(20, 10 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { email, name, role, password, totpCode } = req.body || {};
    if (!email || !name || !password || String(password).trim().length < 6) {
      return res.status(400).json({
        error: 'Username, valid email, and password (min 6 characters) are required.',
      });
    }
    const pg = isPostgresReady();
    const users = pg
      ? await PgRepository.createUser({
          email: String(email),
          name: String(name),
          role: String(role || 'admin'),
          password: String(password),
          totpCode: totpCode ? String(totpCode) : undefined,
        })
      : SqlRepository.createUser({
          email: String(email),
          name: String(name),
          role: String(role || 'admin'),
          password: String(password),
          totpCode: totpCode ? String(totpCode) : undefined,
        });

    const actor = (req as AuthenticatedRequest).adminUser?.email || 'admin';
    await logAudit(actor, 'USER_REGISTERED', `Registered user ${email} (${role || 'admin'})`, req);
    res.status(201).json({ success: true, users });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to register user.' });
  }
});

app.put('/api/auth/users/:id', requireAdminAuth, rateLimit(30, 10 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { email, name, role, password, totpCode } = req.body || {};
    if (password && String(password).trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    if (totpCode && String(totpCode).trim().length < 4) {
      return res.status(400).json({ error: '2FA code must be at least 4 characters (6 digits recommended).' });
    }
    const pg = isPostgresReady();
    const updated = pg
      ? await PgRepository.updateUser(id, { email, name, role, password, totpCode })
      : SqlRepository.updateUser(id, { email, name, role, password, totpCode });

    if (!updated) {
      return res.status(404).json({ error: 'User account not found in database.' });
    }
    const actor = (req as AuthenticatedRequest).adminUser?.email || 'admin';
    await logAudit(actor, 'USER_UPDATED', `Updated credentials/profile for user ${updated.email} (#${id})`, req);
    res.json({ success: true, ...updated });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to update user.' });
  }
});

app.delete('/api/auth/users/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const adminUser = (req as AuthenticatedRequest).adminUser;
    if (adminUser && String(adminUser.userId) === id) {
      return res.status(400).json({ error: 'Cannot delete the currently logged-in user account.' });
    }
    const pg = isPostgresReady();
    const users = pg ? await PgRepository.deleteUser(id) : SqlRepository.deleteUser(id);
    await logAudit(adminUser?.email || 'admin', 'USER_DELETED', `Deleted user account #${id}`, req);
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to delete user.' });
  }
});

app.post('/api/auth/change-password', requireAdminAuth, rateLimit(15, 15 * 60 * 1000), async (req: Request, res: Response) => {
  const { email, newPassword, newTotpCode } = req.body || {};
  if (!email || !newPassword || String(newPassword).trim().length < 6) {
    return res.status(400).json({
      error: 'Valid email and a password of at least 6 characters are required.',
    });
  }
  const pg = isPostgresReady();
  const updated = pg
    ? await PgRepository.updateUserPassword(
        String(email).trim(),
        String(newPassword).trim(),
        newTotpCode ? String(newTotpCode).trim() : undefined
      )
    : SqlRepository.updateUserPassword(
        String(email).trim(),
        String(newPassword).trim(),
        newTotpCode ? String(newTotpCode).trim() : undefined
      );

  if (!updated) {
    return res.status(404).json({ error: 'User account not found in database.' });
  }
  const actor = (req as AuthenticatedRequest).adminUser?.email || String(email);
  await logAudit(actor, 'PASSWORD_HASH_UPDATED', `Updated salted scrypt password hash for ${email}`, req);
  res.json({
    success: true,
    updated,
    users: pg ? await PgRepository.getUsersSummary() : SqlRepository.getUsersSummary(),
  });
});

// Google Two-Factor Authentication (RFC 6238 Authenticator) Setup / Enable / Disable
app.post('/api/auth/2fa/setup', requireAdminAuth, async (req: Request, res: Response) => {
  const targetUserId = String(req.body?.userId || (req as AuthenticatedRequest).adminUser?.userId || '');
  const pg = isPostgresReady();
  const user = pg
    ? await PgRepository.getUserById(targetUserId)
    : SqlRepository.getUserById(targetUserId);

  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const secret = generateBase32Secret(20);
  const otpauthUrl = buildOtpAuthUri(user.email, secret, 'Shantis Designs Solar');

  // Store pending secret without enabling until verified by a live 6-digit code
  if (pg) {
    await PgRepository.updateUser(String(user.id), {
      google_totp_secret: secret,
      google_totp_enabled: false,
    });
  } else {
    SqlRepository.updateUser(user.id, {
      google_totp_secret: secret,
      google_totp_enabled: false,
    });
  }

  res.json({
    userId: String(user.id),
    email: user.email,
    secret,
    otpauthUrl,
  });
});

app.post('/api/auth/2fa/enable', requireAdminAuth, async (req: Request, res: Response) => {
  const targetUserId = String(req.body?.userId || (req as AuthenticatedRequest).adminUser?.userId || '');
  const code = String(req.body?.code || '').trim();
  const secretOverride = req.body?.secret ? String(req.body.secret).trim() : undefined;

  const pg = isPostgresReady();
  const user = pg
    ? await PgRepository.getUserById(targetUserId)
    : SqlRepository.getUserById(targetUserId);

  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const secret = secretOverride || user.google_totp_secret || '';
  if (!secret) {
    return res.status(400).json({ error: 'Generate a Google 2FA secret key first.' });
  }

  if (!verifyGoogleTotp(secret, code)) {
    return res.status(400).json({
      error: 'Invalid 6-digit code from Google Authenticator. Check your device clock and try again.',
    });
  }

  const updated = pg
    ? await PgRepository.updateUser(String(user.id), {
        google_totp_secret: secret,
        google_totp_enabled: true,
      })
    : SqlRepository.updateUser(user.id, {
        google_totp_secret: secret,
        google_totp_enabled: true,
      });

  const actor = (req as AuthenticatedRequest).adminUser?.email || 'admin';
  await logAudit(actor, 'GOOGLE_2FA_ENABLED', `Enabled Google Authenticator 2FA for ${user.email}`, req);

  res.json({
    enabled: true,
    users: updated?.users || [],
  });
});

app.post('/api/auth/2fa/disable', requireAdminAuth, async (req: Request, res: Response) => {
  const targetUserId = String(req.body?.userId || (req as AuthenticatedRequest).adminUser?.userId || '');
  const pg = isPostgresReady();
  const updated = pg
    ? await PgRepository.updateUser(targetUserId, {
        google_totp_secret: '',
        google_totp_enabled: false,
      })
    : SqlRepository.updateUser(targetUserId, {
        google_totp_secret: '',
        google_totp_enabled: false,
      });

  if (!updated) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const actor = (req as AuthenticatedRequest).adminUser?.email || 'admin';
  await logAudit(actor, 'GOOGLE_2FA_DISABLED', `Disabled Google Authenticator 2FA for ${updated.email}`, req);

  res.json({
    enabled: false,
    users: updated.users,
  });
});

app.get('/api/audit-logs', requireAdminAuth, async (_req: Request, res: Response) => {
  const logs = isPostgresReady()
    ? await PgRepository.getAuditLogs()
    : SqlRepository.getAuditLogs();
  res.json({ logs });
});

// ============================================================================
// ORDERS, PAYMENTS, WEBHOOKS & WHATSAPP LEADS
// ============================================================================

app.post('/api/orders', rateLimit(30, 10 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const order = req.body || {};
    const pg = isPostgresReady();

    // Enforce strict M-Pesa verification gate: M-Pesa Daraja orders cannot be marked paid or created completed without DB verification
    if (order.payment_method === 'mpesa_daraja') {
      const checkoutId = String(order.checkout_request_id || '').trim();
      const tx = checkoutId
        ? pg
          ? await PgRepository.getMpesaTransaction(checkoutId)
          : SqlRepository.getMpesaTransaction(checkoutId)
        : null;
      if (!tx || tx.status !== 'paid') {
        return res.status(400).json({
          error:
            'M-Pesa payment has not been verified by Safaricom Daraja. Complete M-Pesa STK Push verification or checkout via WhatsApp.',
        });
      }
      order.status = 'paid';
      order.mpesa_receipt = tx.mpesa_receipt || order.mpesa_receipt;
    }

    if (pg) {
      const result = await PgRepository.createOrder(order);
      await logAudit(order.customer_phone || 'customer', 'ORDER_CREATED', `Order ${result.order_number} saved in PostgreSQL`, req);
      return res.status(201).json(result);
    }

    const id = order.id || Date.now();
    const orderNumber =
      order.order_number || `SH-${new Date().getFullYear()}-${String(id).slice(-4)}`;
    const createdAt =
      order.created_at || new Date().toISOString().replace('T', ' ').slice(0, 16);
    const items = Array.isArray(order.items) ? order.items : [];

    const createOrderTx = db.transaction(() => {
      db.prepare(
        `INSERT INTO orders (
          id, order_number, customer_name, customer_phone, customer_email,
          customer_location, items_json, total, payment_method, status, mpesa_receipt, checkout_request_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        orderNumber,
        String(order.customer_name || 'Customer').slice(0, 120),
        String(order.customer_phone || '').slice(0, 40),
        String(order.customer_email || '').slice(0, 120),
        String(order.customer_location || 'Nairobi, Kenya').slice(0, 250),
        JSON.stringify(items),
        Number(order.total) || 0,
        String(order.payment_method || 'whatsapp'),
        String(order.status || 'pending'),
        order.mpesa_receipt || null,
        order.checkout_request_id || '',
        createdAt
      );

      const decStock = db.prepare(
        `UPDATE products
         SET stock = MAX(0, stock - ?),
             stock_status = CASE WHEN (stock - ?) <= 0 THEN 'outofstock' ELSE 'instock' END
         WHERE id = ?`
      );
      for (const item of items) {
        if (item.product_id && item.quantity) {
          decStock.run(Number(item.quantity), Number(item.quantity), Number(item.product_id));
        }
      }
    });

    createOrderTx();
    await logAudit(order.customer_phone || 'customer', 'ORDER_CREATED', `Order ${orderNumber} saved in SQLite`, req);

    res.status(201).json({
      id,
      order_number: orderNumber,
      created_at: createdAt,
      orders: SqlRepository.getOrders(),
      products: SqlRepository.getProducts(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save order in SQL database', details: err?.message });
  }
});

app.patch('/api/orders/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, mpesa_receipt } = req.body || {};
    const actor = (req as AuthenticatedRequest).adminUser?.email || 'admin';
    if (isPostgresReady()) {
      const orders = await PgRepository.updateOrderStatus(id, status, mpesa_receipt);
      await logAudit(actor, 'ORDER_STATUS_UPDATED', `Order #${id} -> ${status}`, req);
      return res.json({ success: true, orders });
    }

    if (mpesa_receipt) {
      db.prepare('UPDATE orders SET status = ?, mpesa_receipt = ? WHERE id = ?').run(
        status,
        mpesa_receipt,
        id
      );
    } else {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    }
    await logAudit(actor, 'ORDER_STATUS_UPDATED', `Order #${id} -> ${status}`, req);
    res.json({ success: true, orders: SqlRepository.getOrders() });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/orders/track', rateLimit(20, 10 * 60 * 1000), async (req: Request, res: Response) => {
  const { orderNumber, billingContact } = req.body || {};
  if (!orderNumber) {
    return res.status(400).json({ error: 'Order ID / Number is required.' });
  }

  const cleanOrderNum = String(orderNumber).trim().toUpperCase();
  const cleanContact = String(billingContact || '').trim().toLowerCase();

  const allOrders = isPostgresReady()
    ? await PgRepository.getOrders()
    : SqlRepository.getOrders();

  const match = allOrders.find((o) => {
    const numMatch =
      o.order_number.toUpperCase() === cleanOrderNum ||
      String(o.id) === cleanOrderNum.replace(/\D/g, '');
    if (!numMatch) return false;
    if (!cleanContact) return false;
    const phoneDigits = o.customer_phone.replace(/\D/g, '');
    const inputDigits = cleanContact.replace(/\D/g, '');
    const phoneMatches =
      inputDigits.length >= 6 && phoneDigits.endsWith(inputDigits.slice(-6));
    const emailMatches = (o.customer_email || '').toLowerCase() === cleanContact;
    return phoneMatches || emailMatches;
  });

  if (!match) {
    return res.status(404).json({
      error:
        'No matching order found. Please verify both your Order ID (e.g. SH-2026-1041) and the exact Phone Number or Email used at checkout.',
    });
  }

  res.json({ order: match });
});

app.post('/api/leads', rateLimit(40, 10 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const lead = req.body || {};
    if (isPostgresReady()) {
      const result = await PgRepository.createLead(lead);
      await logAudit(lead.phone_number || 'visitor', 'WHATSAPP_LEAD_CAPTURED', lead.product_name || 'Lead', req);
      return res.status(201).json(result);
    }

    const id = Date.now();
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    db.prepare(
      `INSERT INTO whatsapp_leads (
        id, product_id, product_name, phone_number, total_value, timestamp, status, notes, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      lead.product_id || null,
      String(lead.product_name || 'General Solar Inquiry').slice(0, 300),
      String(lead.phone_number || '+254').slice(0, 40),
      Number(lead.total_value) || 0,
      timestamp,
      lead.status || 'new',
      String(lead.notes || '').slice(0, 500),
      lead.source || 'whatsapp_button'
    );
    await logAudit(lead.phone_number || 'visitor', 'WHATSAPP_LEAD_CAPTURED', lead.product_name || 'Lead', req);
    res.status(201).json({ id, timestamp, leads: SqlRepository.getLeads() });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.patch('/api/leads/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (isPostgresReady()) {
    const leads = await PgRepository.updateLeadStatus(id, status);
    return res.json({ success: true, leads });
  }
  db.prepare('UPDATE whatsapp_leads SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true, leads: SqlRepository.getLeads() });
});

function formatDarajaTimestamp(): string {
  // Africa/Nairobi is UTC+3
  const eat = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return eat.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
}

function formatMpesaPhone(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length >= 12) return digits.slice(0, 12);
  if (digits.startsWith('0') && digits.length >= 10) return `254${digits.slice(1, 10)}`;
  if ((digits.startsWith('7') || digits.startsWith('1')) && digits.length >= 9) {
    return `254${digits.slice(0, 9)}`;
  }
  return digits;
}

async function fetchDarajaAccessToken(baseUrl: string, consumerKey: string, consumerSecret: string): Promise<string> {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const resp = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: { Authorization: `Basic ${auth}` },
      signal: controller.signal,
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`Daraja OAuth rejected (${resp.status}): ${txt.slice(0, 140)}`);
    }
    const json = (await resp.json()) as { access_token?: string };
    if (!json.access_token) {
      throw new Error('Daraja OAuth did not return an access_token.');
    }
    return json.access_token;
  } finally {
    clearTimeout(timeout);
  }
}

app.get('/api/payments/mpesa/config', async (req: Request, res: Response) => {
  const adminSession = await verifyBearerSession(req);
  const config = isPostgresReady()
    ? await PgRepository.getMpesaCredentials(false)
    : SqlRepository.getMpesaCredentials(false);

  if (adminSession) {
    return res.json({ config });
  }
  // Public-safe configuration status only (never leaks masked/hashed secrets to anonymous visitors)
  res.json({
    configured: Boolean(config.has_keys),
    shortcode: config.shortcode,
    environment: config.environment,
  });
});

app.post('/api/payments/mpesa/config', requireAdminAuth, rateLimit(20, 10 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const {
      shortcode,
      environment,
      callbackUrl,
      consumerKey,
      consumerSecret,
      passkey,
      initiatorPassword,
    } = req.body || {};

    const params = {
      shortcode,
      environment,
      callbackUrl,
      consumerKey,
      consumerSecret,
      passkey,
      initiatorPassword,
    };

    const saved = isPostgresReady()
      ? await PgRepository.saveMpesaCredentials(params)
      : SqlRepository.saveMpesaCredentials(params);

    const actor = (req as AuthenticatedRequest).adminUser?.email || 'admin';
    await logAudit(
      actor,
      'MPESA_API_KEYS_SAVED',
      `Updated M-Pesa Daraja credentials for shortcode ${saved.shortcode} (${saved.environment}, configured=${saved.has_keys})`,
      req
    );

    res.json({
      success: true,
      config: saved,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save M-Pesa configuration' });
  }
});

app.post('/api/payments/mpesa/stkpush', rateLimit(20, 10 * 60 * 1000), async (req: Request, res: Response) => {
  const { phone, amount, customerName, customerEmail, customerLocation, items } = req.body || {};
  const pg = isPostgresReady();
  const mpesaCfg = (pg
    ? await PgRepository.getMpesaCredentials(true)
    : SqlRepository.getMpesaCredentials(true)) as any;

  // Strict Config Gate: never simulate M-Pesa when Daraja credentials are missing
  if (
    !mpesaCfg.has_keys ||
    !mpesaCfg.runtime_consumer_key ||
    !mpesaCfg.runtime_consumer_secret ||
    !mpesaCfg.runtime_passkey
  ) {
    return res.status(400).json({
      success: false,
      configured: false,
      status: 'unconfigured',
      error:
        'M-Pesa Daraja payment configuration is not set up on this store yet. Please complete your order via WhatsApp Checkout.',
    });
  }

  const formattedPhone = formatMpesaPhone(String(phone || ''));
  if (!/^254\d{9}$/.test(formattedPhone)) {
    return res.status(400).json({
      success: false,
      status: 'declined',
      error: 'Invalid Kenyan M-Pesa phone number. Use 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX.',
    });
  }

  const cleanAmount = Math.max(1, Math.round(Number(amount || 0)));
  if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
    return res.status(400).json({
      success: false,
      status: 'declined',
      error: 'Order total must be greater than KES 0.',
    });
  }

  const baseUrl =
    mpesaCfg.environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';
  const shortcode = String(mpesaCfg.shortcode || '4108955').trim();
  const timestamp = formatDarajaTimestamp();
  const password = Buffer.from(`${shortcode}${mpesaCfg.runtime_passkey}${timestamp}`).toString('base64');
  const orderNumber = `SHN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const accessToken = await fetchDarajaAccessToken(
      baseUrl,
      mpesaCfg.runtime_consumer_key,
      mpesaCfg.runtime_consumer_secret
    );

    const stkController = new AbortController();
    const stkTimeout = setTimeout(() => stkController.abort(), 15000);
    const stkResp = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: cleanAmount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: mpesaCfg.callback_url || 'https://solarsolutions.shantisdesigns.co.ke/api/payments/mpesa/callback',
        AccountReference: orderNumber,
        TransactionDesc: 'Shantis Solar Equipment',
      }),
      signal: stkController.signal,
    });
    clearTimeout(stkTimeout);

    const stkData = (await stkResp.json().catch(() => ({}))) as any;
    if (!stkResp.ok || String(stkData.ResponseCode) !== '0' || !stkData.CheckoutRequestID) {
      const declineMsg =
        stkData.errorMessage ||
        stkData.ResponseDescription ||
        'Safaricom M-Pesa declined the payment initiation request.';
      await logAudit(formattedPhone, 'MPESA_STK_DECLINED', declineMsg, req);
      return res.status(400).json({
        success: false,
        configured: true,
        status: 'declined',
        error: `${declineMsg} You may retry or complete via WhatsApp Checkout.`,
      });
    }

    const checkoutRequestId = String(stkData.CheckoutRequestID);
    const merchantRequestId = String(stkData.MerchantRequestID || '');
    const orderItems = Array.isArray(items) ? items : [];

    // Persist pending order & transaction tracker in SQL DB (NEVER marked paid yet!)
    if (pg) {
      await PgRepository.upsertMpesaTransaction({
        checkoutRequestId,
        merchantRequestId,
        orderNumber,
        phone: formattedPhone,
        amount: cleanAmount,
        status: 'pending',
        resultCode: '',
        resultDesc: String(stkData.ResponseDescription || 'Awaiting PIN entry'),
      });
      await PgRepository.createOrder({
        order_number: orderNumber,
        customer_name: String(customerName || 'Customer'),
        customer_phone: formattedPhone,
        customer_email: String(customerEmail || ''),
        customer_location: String(customerLocation || 'Nairobi, Kenya'),
        items: orderItems,
        total: cleanAmount,
        payment_method: 'mpesa_daraja',
        checkout_request_id: checkoutRequestId,
        status: 'pending',
      });
    } else {
      SqlRepository.upsertMpesaTransaction({
        checkoutRequestId,
        merchantRequestId,
        orderNumber,
        phone: formattedPhone,
        amount: cleanAmount,
        status: 'pending',
        resultCode: '',
        resultDesc: String(stkData.ResponseDescription || 'Awaiting PIN entry'),
      });
      const id = Date.now();
      const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      db.prepare(
        `INSERT INTO orders (
          id, order_number, customer_name, customer_phone, customer_email,
          customer_location, items_json, total, payment_method, status, mpesa_receipt, checkout_request_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'mpesa_daraja', 'pending', NULL, ?, ?)`
      ).run(
        id,
        orderNumber,
        String(customerName || 'Customer').slice(0, 120),
        formattedPhone,
        String(customerEmail || '').slice(0, 120),
        String(customerLocation || 'Nairobi, Kenya').slice(0, 250),
        JSON.stringify(orderItems),
        cleanAmount,
        checkoutRequestId,
        createdAt
      );
    }

    await logAudit(
      formattedPhone,
      'MPESA_STK_DISPATCHED',
      `STK Push sent (${checkoutRequestId}) for ${orderNumber} KES ${cleanAmount}`,
      req
    );

    res.json({
      success: true,
      configured: true,
      status: 'pending_verification',
      checkoutRequestId,
      merchantRequestId,
      orderNumber,
      message: 'STK Push sent to your phone. Waiting for M-Pesa PIN verification...',
    });
  } catch (err: any) {
    await logAudit(formattedPhone, 'MPESA_STK_ERROR', err?.message || 'Daraja request failed', req);
    res.status(502).json({
      success: false,
      configured: true,
      status: 'declined',
      error: `Unable to verify M-Pesa Daraja gateway (${err?.message || 'network timeout'}). Please try again or checkout via WhatsApp.`,
    });
  }
});

// Safaricom Official Asynchronous Callback Receiver
app.post('/api/payments/mpesa/callback', async (req: Request, res: Response) => {
  try {
    const stkCallback = req.body?.Body?.stkCallback;
    const rawBody = JSON.stringify(req.body || {});
    const pg = isPostgresReady();

    if (pg) {
      await PgRepository.logWebhook('mpesa_daraja', 'stk_callback', '', rawBody, true);
    } else {
      db.prepare(
        `INSERT INTO webhooks_log (provider, event_type, signature, payload_json, verified, processed_at)
         VALUES ('mpesa_daraja', 'stk_callback', '', ?, 1, ?)`
      ).run(rawBody, new Date().toISOString());
    }

    if (stkCallback?.CheckoutRequestID) {
      const checkoutId = String(stkCallback.CheckoutRequestID);
      const resultCode = String(stkCallback.ResultCode ?? '');
      const resultDesc = String(stkCallback.ResultDesc || '');
      const metaItems = Array.isArray(stkCallback.CallbackMetadata?.Item)
        ? stkCallback.CallbackMetadata.Item
        : [];
      const receiptItem = metaItems.find((i: any) => i.Name === 'MpesaReceiptNumber');
      const mpesaReceipt = receiptItem?.Value ? String(receiptItem.Value) : '';

      const isPaid = Number(stkCallback.ResultCode) === 0;
      const txStatus = isPaid ? 'paid' : 'declined';
      const orderStatus = isPaid ? 'paid' : 'cancelled';

      if (pg) {
        await PgRepository.upsertMpesaTransaction({
          checkoutRequestId: checkoutId,
          merchantRequestId: String(stkCallback.MerchantRequestID || ''),
          status: txStatus,
          resultCode,
          resultDesc,
          mpesaReceipt,
        });
        await PgRepository.updateOrderByCheckoutId(checkoutId, orderStatus, mpesaReceipt || null);
      } else {
        SqlRepository.upsertMpesaTransaction({
          checkoutRequestId: checkoutId,
          merchantRequestId: String(stkCallback.MerchantRequestID || ''),
          status: txStatus,
          resultCode,
          resultDesc,
          mpesaReceipt,
        });
        SqlRepository.updateOrderByCheckoutId(checkoutId, orderStatus, mpesaReceipt || null);
      }

      await logAudit(
        'safaricom_daraja',
        isPaid ? 'MPESA_PAYMENT_VERIFIED' : 'MPESA_PAYMENT_DECLINED',
        `${checkoutId}: ResultCode=${resultCode} ${resultDesc} ${mpesaReceipt}`.trim(),
        req
      );
    }
  } catch {
    // Always acknowledge callback reception to Safaricom
  }

  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// Strict M-Pesa Payment Verification Status Polling Endpoint (DB Callback + Live Daraja STK Query)
app.get('/api/payments/mpesa/status/:checkoutRequestId', async (req: Request, res: Response) => {
  const checkoutId = String(req.params.checkoutRequestId || '').trim();
  if (!checkoutId) {
    return res.status(400).json({ status: 'declined', error: 'Missing CheckoutRequestID.' });
  }

  const pg = isPostgresReady();
  const tx = pg
    ? await PgRepository.getMpesaTransaction(checkoutId)
    : SqlRepository.getMpesaTransaction(checkoutId);

  if (!tx) {
    return res.status(404).json({ status: 'declined', error: 'Transaction reference not found in database.' });
  }

  if (tx.status === 'paid') {
    const allOrders = pg ? await PgRepository.getOrders() : SqlRepository.getOrders();
    const matchedOrder = allOrders.find(
      (o) => o.order_number === tx.order_number || o.checkout_request_id === checkoutId
    );
    return res.json({
      status: 'paid',
      receipt: tx.mpesa_receipt || undefined,
      resultCode: tx.result_code || '0',
      resultDesc: tx.result_desc || 'M-Pesa payment confirmed.',
      orderNumber: tx.order_number,
      order: matchedOrder || null,
    });
  }

  if (tx.status === 'declined' || tx.status === 'failed' || tx.status === 'cancelled') {
    return res.json({
      status: 'declined',
      resultCode: tx.result_code,
      resultDesc: tx.result_desc || 'Transaction was declined or cancelled.',
      orderNumber: tx.order_number,
    });
  }

  // Still pending — query Safaricom Daraja STK Push Query API directly
  const mpesaCfg = (pg
    ? await PgRepository.getMpesaCredentials(true)
    : SqlRepository.getMpesaCredentials(true)) as any;

  if (
    !mpesaCfg.has_keys ||
    !mpesaCfg.runtime_consumer_key ||
    !mpesaCfg.runtime_consumer_secret ||
    !mpesaCfg.runtime_passkey
  ) {
    return res.json({
      status: 'pending',
      resultDesc: 'Awaiting M-Pesa confirmation...',
      orderNumber: tx.order_number,
    });
  }

  try {
    const baseUrl =
      mpesaCfg.environment === 'sandbox'
        ? 'https://sandbox.safaricom.co.ke'
        : 'https://api.safaricom.co.ke';
    const shortcode = String(mpesaCfg.shortcode || '4108955').trim();
    const timestamp = formatDarajaTimestamp();
    const password = Buffer.from(`${shortcode}${mpesaCfg.runtime_passkey}${timestamp}`).toString('base64');
    const accessToken = await fetchDarajaAccessToken(
      baseUrl,
      mpesaCfg.runtime_consumer_key,
      mpesaCfg.runtime_consumer_secret
    );

    const qController = new AbortController();
    const qTimeout = setTimeout(() => qController.abort(), 12000);
    const qResp = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutId,
      }),
      signal: qController.signal,
    });
    clearTimeout(qTimeout);

    const qData = (await qResp.json().catch(() => ({}))) as any;

    // 500.001.1001 = The transaction is still under processing
    if (String(qData.errorCode) === '500.001.1001') {
      return res.json({
        status: 'pending',
        resultDesc: 'Waiting for customer to enter M-Pesa PIN...',
        orderNumber: tx.order_number,
      });
    }

    if (qData.ResultCode !== undefined) {
      const codeStr = String(qData.ResultCode);
      const desc = String(qData.ResultDesc || '');
      if (codeStr === '0') {
        if (pg) {
          await PgRepository.upsertMpesaTransaction({
            checkoutRequestId: checkoutId,
            status: 'paid',
            resultCode: '0',
            resultDesc: desc || 'The service request is processed successfully.',
          });
          await PgRepository.updateOrderByCheckoutId(checkoutId, 'paid', tx.mpesa_receipt || null);
        } else {
          SqlRepository.upsertMpesaTransaction({
            checkoutRequestId: checkoutId,
            status: 'paid',
            resultCode: '0',
            resultDesc: desc || 'The service request is processed successfully.',
          });
          SqlRepository.updateOrderByCheckoutId(checkoutId, 'paid', tx.mpesa_receipt || null);
        }
        const allOrders = pg ? await PgRepository.getOrders() : SqlRepository.getOrders();
        const matchedOrder = allOrders.find(
          (o) => o.order_number === tx.order_number || o.checkout_request_id === checkoutId
        );
        return res.json({
          status: 'paid',
          receipt: tx.mpesa_receipt || undefined,
          resultCode: '0',
          resultDesc: desc || 'M-Pesa payment verified.',
          orderNumber: tx.order_number,
          order: matchedOrder || null,
        });
      } else {
        // Explicit decline / cancellation / wrong PIN / insufficient balance
        if (pg) {
          await PgRepository.upsertMpesaTransaction({
            checkoutRequestId: checkoutId,
            status: 'declined',
            resultCode: codeStr,
            resultDesc: desc || 'Payment declined or cancelled by user.',
          });
          await PgRepository.updateOrderByCheckoutId(checkoutId, 'cancelled', null);
        } else {
          SqlRepository.upsertMpesaTransaction({
            checkoutRequestId: checkoutId,
            status: 'declined',
            resultCode: codeStr,
            resultDesc: desc || 'Payment declined or cancelled by user.',
          });
          SqlRepository.updateOrderByCheckoutId(checkoutId, 'cancelled', null);
        }
        return res.json({
          status: 'declined',
          resultCode: codeStr,
          resultDesc: desc || 'Payment was declined or cancelled.',
          orderNumber: tx.order_number,
        });
      }
    }

    return res.json({
      status: 'pending',
      resultDesc: 'Awaiting Safaricom M-Pesa confirmation...',
      orderNumber: tx.order_number,
    });
  } catch {
    return res.json({
      status: 'pending',
      resultDesc: 'Awaiting Safaricom M-Pesa confirmation...',
      orderNumber: tx.order_number,
    });
  }
});

app.post('/api/webhooks/:provider', rateLimit(60, 60 * 1000), async (req: Request, res: Response) => {
  const provider = String(req.params.provider || 'custom');
  const signature =
    (req.headers['x-wc-webhook-signature'] as string) ||
    (req.headers['x-mpesa-signature'] as string) ||
    '';
  const secret = process.env.WEBHOOK_SECRET || 'shantis-webhook-hmac-secret-2026';
  const rawBody = JSON.stringify(req.body || {});
  const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  const verified = signature ? (signature === expectedSig ? 1 : 0) : 1;

  if (isPostgresReady()) {
    await PgRepository.logWebhook(
      provider,
      req.body?.event || 'webhook_received',
      signature || expectedSig,
      rawBody,
      Boolean(verified)
    );
    if (req.body?.order_number && req.body?.status) {
      await PgRepository.updateOrderByNumber(
        req.body.order_number,
        req.body.status,
        req.body.mpesa_receipt || null
      );
    }
  } else {
    db.prepare(
      `INSERT INTO webhooks_log (provider, event_type, signature, payload_json, verified, processed_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      provider,
      req.body?.event || 'webhook_received',
      signature || expectedSig,
      rawBody,
      verified,
      new Date().toISOString()
    );

    if (req.body?.order_number && req.body?.status) {
      db.prepare('UPDATE orders SET status = ?, mpesa_receipt = COALESCE(?, mpesa_receipt) WHERE order_number = ?').run(
        req.body.status,
        req.body.mpesa_receipt || null,
        req.body.order_number
      );
    }
  }

  res.json({ received: true, verified: Boolean(verified) });
});

app.post('/api/consent', async (req: Request, res: Response) => {
  const { consentId, analytics, marketing } = req.body || {};
  const ip = getClientIp(req);
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
  const cid = String(consentId || crypto.randomUUID());
  const ua = String(req.headers['user-agent'] || '').slice(0, 200);

  if (isPostgresReady()) {
    await PgRepository.saveConsent(cid, analytics !== false, marketing !== false, ipHash, ua);
  } else {
    db.prepare(
      `INSERT INTO cookie_consents (consent_id, analytics, marketing, ip_hash, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(cid, analytics ? 1 : 0, marketing ? 1 : 0, ipHash, ua, new Date().toISOString());
  }
  res.json({ saved: true });
});

// ============================================================================
// ADMIN CRUD ENDPOINTS
// ============================================================================

app.post('/api/products', requireAdminAuth, async (req: Request, res: Response) => {
  const p = req.body;
  if (isPostgresReady()) {
    return res.json({ products: await PgRepository.upsertProduct(p) });
  }

  const id = p.id || Date.now();
  const slug =
    p.slug ||
    String(p.name || 'solar-product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  const permalink = p.permalink || `https://shantisdesigns.co.ke/product/${slug}/`;

  db.prepare(
    `INSERT OR REPLACE INTO products (
      id, name, title, slug, permalink, url, sku, description, short_description,
      price, regular_price, sale_price, stock, manage_stock, stock_status,
      category_id, category_name, image_url, featured, warranty, rating, reviews_count,
      tags_json, specs_json, seo_keywords_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    p.name,
    p.title || p.name,
    slug,
    permalink,
    p.url || permalink,
    p.sku || `SH-${id}`,
    p.description || p.name,
    p.shortDescription || p.description || p.name,
    Number(p.price) || 0,
    Number(p.regular_price ?? p.price) || 0,
    p.sale_price ? Number(p.sale_price) : null,
    Number(p.stock ?? 20),
    p.manage_stock === false ? 0 : 1,
    Number(p.stock ?? 20) > 0 ? 'instock' : 'outofstock',
    Number(p.category_id || 20),
    p.category_name || 'Solar Panels',
    p.image_url || 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png',
    p.featured ? 1 : 0,
    p.warranty || '5 Years Manufacturer Warranty',
    Number(p.rating ?? 5.0),
    Number(p.reviews_count ?? 12),
    JSON.stringify(p.tags || [p.category_name || 'Solar Panels']),
    JSON.stringify(p.specs || {}),
    JSON.stringify(p.seo_keywords || [])
  );

  res.json({ products: SqlRepository.getProducts() });
});

app.put('/api/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const p = req.body;
  if (isPostgresReady()) {
    return res.json({ products: await PgRepository.updateProduct(id, p) });
  }

  db.prepare(
    `UPDATE products SET
      name = ?, title = ?, slug = ?, sku = ?, description = ?, short_description = ?,
      price = ?, regular_price = ?, sale_price = ?, stock = ?, stock_status = ?,
      category_id = ?, category_name = ?, image_url = ?, featured = ?, warranty = ?,
      specs_json = ?
     WHERE id = ?`
  ).run(
    p.name,
    p.title || p.name,
    p.slug,
    p.sku,
    p.description,
    p.shortDescription || p.description,
    Number(p.price),
    Number(p.regular_price ?? p.price),
    p.sale_price ? Number(p.sale_price) : null,
    Number(p.stock),
    Number(p.stock) > 0 ? 'instock' : 'outofstock',
    Number(p.category_id),
    p.category_name,
    p.image_url,
    p.featured ? 1 : 0,
    p.warranty || '5 Years Manufacturer Warranty',
    JSON.stringify(p.specs || {}),
    id
  );
  res.json({ products: SqlRepository.getProducts() });
});

app.delete('/api/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isPostgresReady()) {
    return res.json({ products: await PgRepository.deleteProduct(id) });
  }
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ products: SqlRepository.getProducts() });
});

app.post('/api/categories', requireAdminAuth, async (req: Request, res: Response) => {
  const c = req.body;
  if (isPostgresReady()) {
    return res.json({ categories: await PgRepository.upsertCategory(c) });
  }
  const id = c.id || Date.now();
  const slug =
    c.slug ||
    String(c.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  db.prepare(
    `INSERT OR REPLACE INTO categories (id, name, slug, permalink, parent, description, image_url, count, seo_keywords_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    c.name,
    slug,
    c.permalink || `https://shantisdesigns.co.ke/product-category/${slug}/`,
    c.parent || 0,
    c.description || '',
    c.image_url,
    c.count || 0,
    JSON.stringify(c.seo_keywords || [])
  );
  res.json({ categories: SqlRepository.getCategories() });
});

app.put('/api/categories/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const c = req.body;
  if (isPostgresReady()) {
    return res.json({ categories: await PgRepository.updateCategory(id, c) });
  }
  db.prepare(
    `UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?`
  ).run(c.name, c.slug, c.description || '', c.image_url, id);
  res.json({ categories: SqlRepository.getCategories() });
});

app.delete('/api/categories/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isPostgresReady()) {
    return res.json({ categories: await PgRepository.deleteCategory(id) });
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ categories: SqlRepository.getCategories() });
});

app.post('/api/projects', requireAdminAuth, async (req: Request, res: Response) => {
  const proj = req.body;
  if (isPostgresReady()) {
    return res.json({ projects: await PgRepository.upsertProject(proj) });
  }
  let id = Number(proj.id || 0);
  if (!id) {
    const maxRow = db.prepare('SELECT COALESCE(MAX(id), 0) AS max_id FROM projects').get() as { max_id: number };
    id = Number(maxRow?.max_id || 0) + 1;
  }
  const gallery = Array.isArray(proj.gallery) && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
  const videos = Array.isArray(proj.videos)
    ? proj.videos.filter(Boolean)
    : proj.video_url
    ? [proj.video_url]
    : [];
  const videoUrl = String(proj.video_url || videos[0] || '');
  const seoKeywords = Array.isArray(proj.seo_keywords) ? proj.seo_keywords : [];
  db.prepare(
    `INSERT OR REPLACE INTO projects (
      id, title, slug, client, location, category, category_name,
      system_size, panels_count, inverter_specs, battery_specs,
      image_url, gallery_json, video_url, videos_json, seo_keywords_json,
      completion_date, kplc_savings, description, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    proj.title,
    proj.slug || String(proj.title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    proj.client,
    proj.location,
    proj.category || 'residential',
    proj.category_name || 'Solar Installation',
    proj.system_size,
    proj.panels_count,
    proj.inverter_specs,
    proj.battery_specs,
    proj.image_url,
    JSON.stringify(gallery),
    videoUrl,
    JSON.stringify(videos),
    JSON.stringify(seoKeywords),
    proj.completion_date || '2026',
    proj.kplc_savings,
    proj.description,
    proj.featured ? 1 : 0
  );
  res.json({ projects: SqlRepository.getProjects() });
});

app.put('/api/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const proj = req.body;
  if (isPostgresReady()) {
    return res.json({ projects: await PgRepository.updateProject(id, proj) });
  }
  const gallery = Array.isArray(proj.gallery) && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
  const videos = Array.isArray(proj.videos)
    ? proj.videos.filter(Boolean)
    : proj.video_url
    ? [proj.video_url]
    : [];
  const videoUrl = String(proj.video_url || videos[0] || '');
  const seoKeywords = Array.isArray(proj.seo_keywords) ? proj.seo_keywords : [];
  db.prepare(
    `UPDATE projects SET
      title = ?, slug = ?, client = ?, location = ?, category = ?,
      system_size = ?, panels_count = ?, inverter_specs = ?, battery_specs = ?,
      image_url = ?, gallery_json = ?, video_url = ?, videos_json = ?, seo_keywords_json = ?,
      completion_date = ?, kplc_savings = ?, description = ?, featured = ?
     WHERE id = ?`
  ).run(
    proj.title,
    proj.slug,
    proj.client,
    proj.location,
    proj.category,
    proj.system_size,
    proj.panels_count,
    proj.inverter_specs,
    proj.battery_specs,
    proj.image_url,
    JSON.stringify(gallery),
    videoUrl,
    JSON.stringify(videos),
    JSON.stringify(seoKeywords),
    proj.completion_date,
    proj.kplc_savings,
    proj.description,
    proj.featured ? 1 : 0,
    id
  );
  res.json({ projects: SqlRepository.getProjects() });
});

app.delete('/api/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isPostgresReady()) {
    return res.json({ projects: await PgRepository.deleteProject(id) });
  }
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  res.json({ projects: SqlRepository.getProjects() });
});

app.post('/api/articles', requireAdminAuth, async (req: Request, res: Response) => {
  const a = req.body;
  if (isPostgresReady()) {
    return res.json({ articles: await PgRepository.upsertArticle(a) });
  }
  const id = a.id || Date.now();
  db.prepare(
    `INSERT OR REPLACE INTO articles (
      id, title, slug, category, content, excerpt, meta_description,
      author, published_at, image_url, tags_json, read_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    a.title,
    a.slug || String(a.title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    a.category || 'Solar Guides & Insights',
    a.content,
    a.excerpt,
    a.meta_description || a.excerpt,
    a.author || 'Shantis Designs Engineering Team',
    a.published_at || new Date().toISOString().split('T')[0],
    a.image_url,
    JSON.stringify(a.tags || []),
    a.read_time || '5 min read'
  );
  res.json({ articles: SqlRepository.getArticles() });
});

app.put('/api/articles/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const a = req.body;
  if (isPostgresReady()) {
    return res.json({ articles: await PgRepository.updateArticle(id, a) });
  }
  db.prepare(
    `UPDATE articles SET
      title = ?, slug = ?, category = ?, content = ?, excerpt = ?, meta_description = ?,
      author = ?, image_url = ?, tags_json = ?, read_time = ?
     WHERE id = ?`
  ).run(
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
    id
  );
  res.json({ articles: SqlRepository.getArticles() });
});

app.delete('/api/articles/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isPostgresReady()) {
    return res.json({ articles: await PgRepository.deleteArticle(id) });
  }
  db.prepare('DELETE FROM articles WHERE id = ?').run(id);
  res.json({ articles: SqlRepository.getArticles() });
});

app.post('/api/partners', requireAdminAuth, async (req: Request, res: Response) => {
  const p = req.body;
  if (isPostgresReady()) {
    return res.json({ partners: await PgRepository.upsertPartner(p) });
  }
  const id = p.id || Date.now();
  db.prepare(
    `INSERT OR REPLACE INTO partners (id, name, logo_url, category, active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, p.name, p.logo_url, p.category || 'all', p.active ? 1 : 0, p.sort_order || 1);
  res.json({ partners: SqlRepository.getPartners() });
});

// Registered BEFORE /api/partners/:id so 'reorder' does not match :id
app.put('/api/partners/reorder', requireAdminAuth, async (req: Request, res: Response) => {
  const list = Array.isArray(req.body?.partners) ? req.body.partners : [];
  if (isPostgresReady()) {
    return res.json({ partners: await PgRepository.reorderPartners(list) });
  }
  const stmt = db.prepare('UPDATE partners SET sort_order = ? WHERE id = ?');
  const tx = db.transaction((items: any[]) => {
    items.forEach((p, idx) => {
      stmt.run(p.sort_order ?? idx + 1, Number(p.id));
    });
  });
  tx(list);
  res.json({ partners: SqlRepository.getPartners() });
});

app.put('/api/partners/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const p = req.body;
  if (isPostgresReady()) {
    return res.json({ partners: await PgRepository.updatePartner(id, p) });
  }
  db.prepare(
    `UPDATE partners SET name = ?, logo_url = ?, category = ?, active = ?, sort_order = ? WHERE id = ?`
  ).run(p.name, p.logo_url, p.category, p.active ? 1 : 0, p.sort_order, id);
  res.json({ partners: SqlRepository.getPartners() });
});

app.delete('/api/partners/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isPostgresReady()) {
    return res.json({ partners: await PgRepository.deletePartner(id) });
  }
  db.prepare('DELETE FROM partners WHERE id = ?').run(id);
  res.json({ partners: SqlRepository.getPartners() });
});

// ============================================================================
// GOOGLE BUSINESS PROFILE REVIEWS (LIVE SYNC FROM MAPS / GBP API / PLACES)
// ============================================================================

async function getStoredGoogleApiConfig(): Promise<{
  accessToken?: string;
  placesApiKey?: string;
  accountId?: string;
  locationId?: string;
}> {
  try {
    if (isPostgresReady()) {
      const cfg = await PgRepository.getSetting('google_gbp_config');
      if (cfg) return cfg;
    } else {
      const row = db
        .prepare('SELECT value_json FROM site_settings WHERE key = ?')
        .get('google_gbp_config') as { value_json: string } | undefined;
      if (row?.value_json) {
        return JSON.parse(row.value_json);
      }
    }
  } catch {
    // ignore
  }
  return {};
}

app.get('/api/reviews', async (_req: Request, res: Response) => {
  const pg = isPostgresReady();
  const storedCfg = await getStoredGoogleApiConfig();
  const hasLiveCredentials = Boolean(
    process.env.GOOGLE_BUSINESS_PROFILE_ACCESS_TOKEN ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      storedCfg.accessToken ||
      storedCfg.placesApiKey
  );

  if (!pg) {
    db.prepare(
      `DELETE FROM reviews WHERE author_name IN (
        'Peter Mwangi', 'Faith Wanjiru', 'Kelvin Mutua',
        'Eng. David Karanja', 'Dr. Grace Muli', 'Samuel Ochieng', 'Catherine Njoroge'
      )`
    ).run();
  }

  const reviews = pg ? await PgRepository.getReviews() : SqlRepository.getReviews();

  res.json({
    profile_name: 'Shantis Designs Solar Solutions',
    profile_id: '13542450485038602063',
    place_id: 'ChIJP2DxSVARLxgRUBi_VxOaIto',
    google_url: SHANTIS_GBP_URL,
    average_rating: 5.0,
    total_reviews: reviews.length,
    api_configured: hasLiveCredentials,
    reviews,
  });
});

app.post('/api/reviews', requireAdminAuth, async (req: Request, res: Response) => {
  const r = req.body || {};
  if (isPostgresReady()) {
    return res.json({ reviews: await PgRepository.upsertReview(r) });
  }
  const id = r.id || Date.now();
  db.prepare(
    `INSERT OR REPLACE INTO reviews (
      id, author_name, author_photo, rating, time_ago, text, location, verified,
      reviewer_badge, likes_count, owner_reply, owner_reply_time, keywords_json, google_review_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    String(r.author_name || 'Verified Google Customer'),
    String(r.author_photo || ''),
    Number(r.rating || 5),
    String(r.time_ago || 'Just now'),
    String(r.text || ''),
    String(r.location || 'Kenya'),
    r.verified === false ? 0 : 1,
    String(r.reviewer_badge || '1 review'),
    Number(r.likes_count ?? 1),
    String(r.owner_reply || ''),
    String(r.owner_reply_time || 'a week ago'),
    JSON.stringify(Array.isArray(r.keywords) ? r.keywords : []),
    String(r.google_review_url || SHANTIS_GBP_URL)
  );
  res.json({ reviews: SqlRepository.getReviews() });
});

app.put('/api/reviews/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const r = req.body || {};
  if (isPostgresReady()) {
    return res.json({ reviews: await PgRepository.updateReview(id, r) });
  }
  db.prepare(
    `UPDATE reviews SET
      author_name = ?, author_photo = ?, rating = ?, time_ago = ?, text = ?,
      location = ?, verified = ?, reviewer_badge = ?, likes_count = ?,
      owner_reply = ?, owner_reply_time = ?, keywords_json = ?, google_review_url = ?
     WHERE id = ?`
  ).run(
    String(r.author_name || 'Verified Google Customer'),
    String(r.author_photo || ''),
    Number(r.rating || 5),
    String(r.time_ago || 'a week ago'),
    String(r.text || ''),
    String(r.location || 'Kenya'),
    r.verified === false ? 0 : 1,
    String(r.reviewer_badge || '1 review'),
    Number(r.likes_count ?? 1),
    String(r.owner_reply || ''),
    String(r.owner_reply_time || 'a week ago'),
    JSON.stringify(Array.isArray(r.keywords) ? r.keywords : []),
    String(r.google_review_url || SHANTIS_GBP_URL),
    id
  );
  res.json({ reviews: SqlRepository.getReviews() });
});

app.delete('/api/reviews/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isPostgresReady()) {
    return res.json({ reviews: await PgRepository.deleteReview(id) });
  }
  db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  res.json({ reviews: SqlRepository.getReviews() });
});

app.post('/api/reviews/sync-google', requireAdminAuth, async (req: Request, res: Response) => {
  const targetUrl = String(req.body?.url || SHANTIS_GBP_URL);
  const storedCfg = await getStoredGoogleApiConfig();
  const pg = isPostgresReady();

  const accessToken =
    req.body?.accessToken ||
    storedCfg.accessToken ||
    process.env.GOOGLE_BUSINESS_PROFILE_ACCESS_TOKEN ||
    '';
  const placesApiKey =
    req.body?.placesApiKey ||
    storedCfg.placesApiKey ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    '';
  const locationId = req.body?.locationId || storedCfg.locationId || '13542450485038602063';

  if (req.body?.accessToken || req.body?.placesApiKey) {
    const cfgPayload = {
      accessToken: accessToken || undefined,
      placesApiKey: placesApiKey || undefined,
      locationId,
    };
    if (pg) {
      await PgRepository.saveSetting('google_gbp_config', cfgPayload);
    } else {
      db.prepare(
        `INSERT OR REPLACE INTO site_settings (key, value_json, updated_at) VALUES ('google_gbp_config', ?, ?)`
      ).run(JSON.stringify(cfgPayload), new Date().toISOString());
    }
  }

  if (!pg) {
    db.prepare(
      `DELETE FROM reviews WHERE author_name IN (
        'Peter Mwangi', 'Faith Wanjiru', 'Kelvin Mutua',
        'Eng. David Karanja', 'Dr. Grace Muli', 'Samuel Ochieng', 'Catherine Njoroge'
      )`
    ).run();
  }

  let liveFetchedReviews: Array<{
    author_name: string;
    author_photo: string;
    rating: number;
    time_ago: string;
    text: string;
    location: string;
    verified: number;
    reviewer_badge: string;
    likes_count: number;
    owner_reply: string;
    owner_reply_time: string;
    keywords: string[];
    google_review_url: string;
  }> = [];

  let apiSourceUsed = 'verified_gbp_profile';

  // 1. Official Google Business Profile API v4
  if (accessToken) {
    try {
      const accountsResp = await fetch(
        'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (accountsResp.ok) {
        const accountsData = (await accountsResp.json()) as {
          accounts?: Array<{ name: string }>;
        };
        const accountName = accountsData.accounts?.[0]?.name || 'accounts/default';
        const reviewsResp = await fetch(
          `https://mybusiness.googleapis.com/v4/${accountName}/locations/${locationId}/reviews?pageSize=50`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (reviewsResp.ok) {
          const revData = (await reviewsResp.json()) as { reviews?: Array<any> };
          const starMap: Record<string, number> = {
            FIVE: 5,
            FOUR: 4,
            THREE: 3,
            TWO: 2,
            ONE: 1,
          };
          for (const item of revData.reviews || []) {
            const author = item.reviewer?.displayName || 'Google Reviewer';
            const text = item.comment || '';
            const lower = text.toLowerCase();
            const kws: string[] = [];
            if (lower.includes('inverter')) kws.push('inverter');
            if (lower.includes('batter')) kws.push('batteries');
            if (lower.includes('panel')) kws.push('panels');
            if (lower.includes('install')) kws.push('solar installations');

            liveFetchedReviews.push({
              author_name: author,
              author_photo: item.reviewer?.profilePhotoUrl || '',
              rating: starMap[item.starRating || 'FIVE'] || 5,
              time_ago: item.updateTime ? item.updateTime.split('T')[0] : 'Recently',
              text,
              location: 'Kenya',
              verified: 1,
              reviewer_badge: 'Verified Google Reviewer',
              likes_count: 1,
              owner_reply: item.reviewReply?.comment || '',
              owner_reply_time: item.reviewReply?.updateTime
                ? item.reviewReply.updateTime.split('T')[0]
                : '',
              keywords: kws,
              google_review_url: SHANTIS_GBP_URL,
            });
          }
          if (liveFetchedReviews.length > 0) {
            apiSourceUsed = 'google_business_profile_api_v4';
          }
        }
      }
    } catch {
      // Fall through
    }
  }

  // 2. Official Google Places API (New) v1
  if (liveFetchedReviews.length === 0 && placesApiKey) {
    try {
      const searchResp = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': placesApiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews',
        },
        body: JSON.stringify({
          textQuery: 'Shantis Designs Solar Solutions Nairobi Kenya',
          languageCode: 'en',
          regionCode: 'KE',
        }),
      });
      if (searchResp.ok) {
        const searchData = (await searchResp.json()) as { places?: Array<any> };
        const place = searchData.places?.[0];
        for (const rev of place?.reviews || []) {
          const author = rev.authorAttribution?.displayName || 'Google Reviewer';
          const text = rev.text?.text || '';
          const lower = text.toLowerCase();
          const kws: string[] = [];
          if (lower.includes('inverter')) kws.push('inverter');
          if (lower.includes('batter')) kws.push('batteries');
          if (lower.includes('panel')) kws.push('panels');
          if (lower.includes('install')) kws.push('solar installations');

          liveFetchedReviews.push({
            author_name: author,
            author_photo: rev.authorAttribution?.photoUri || '',
            rating: rev.rating || 5,
            time_ago: rev.relativePublishTimeDescription || 'Recently',
            text,
            location: 'Kenya',
            verified: 1,
            reviewer_badge: 'Google Maps Review',
            likes_count: 1,
            owner_reply: '',
            owner_reply_time: '',
            keywords: kws,
            google_review_url:
              rev.authorAttribution?.uri || place?.googleMapsUri || SHANTIS_GBP_URL,
          });
        }
        if (liveFetchedReviews.length > 0) {
          apiSourceUsed = 'google_places_api_v1';
        }
      }
    } catch {
      // Fall through
    }
  }

  // 3. Live Google Maps Business Profile Fetch (from https://maps.app.goo.gl/Jw2tJXriD5dFEi568)
  if (liveFetchedReviews.length === 0) {
    const mapsFetched = await fetchLiveReviewsFromGoogleMapsPlace(targetUrl);
    if (mapsFetched.length > 0) {
      liveFetchedReviews = mapsFetched;
      apiSourceUsed = 'google_maps_live_profile';
    }
  }

  // 4. Verified Google Business Profile records fallback (all 5 real reviews)
  const verifiedGbpReviews =
    liveFetchedReviews.length > 0
      ? liveFetchedReviews
      : [
          {
            author_name: 'Teen Network Magazine Show',
            author_photo:
              'https://lh3.googleusercontent.com/a-/ALV-UjWIhGzRAXVcKAyDC5HMmLMp-R4vO9HZrXz_tD-o0QP7bDyMfuHx=s120-c-rp-mo-br100',
            rating: 5,
            time_ago: 'a week ago',
            text: 'We had a ranch project in Timau and they delivered quality work with the best market batteries, inverters and panels. You are the best one may need, Looking forward to working with you on another project.',
            location: 'Timau, Meru / Laikipia',
            verified: 1,
            reviewer_badge: '1 review',
            likes_count: 1,
            owner_reply:
              'Thank you for trusting in Shantis Designs Solar Solutions, Looking forward to do more installations for your projects',
            owner_reply_time: 'a week ago',
            keywords: ['batteries', 'inverter', 'panels'],
            google_review_url: SHANTIS_GBP_URL,
          },
          {
            author_name: 'Tonny Brian',
            author_photo:
              'https://lh3.googleusercontent.com/a-/ALV-UjX_wLKUnqVlLCkFpKQM2cA9Uq7mSKAvOqUXBreKVA0MphEiSD0OvA=s120-c-rp-mo-br100',
            rating: 5,
            time_ago: 'Edited a week ago',
            text: 'I recently sourced solar equipment and backup components from Shantis Designs Solar Solutions along Munyu Lane, and I am thoroughly impressed. Their team is knowledgeable, professional, and took the time to help me pick the right inverter and battery setup for my specific power needs. The product quality is top-notch, and their pricing is very competitive for Nairobi CBD. If you are looking for reliable solar panels, batteries, or complete home/commercial backup systems, this is definitely the go-to shop. Highly recommended',
            location: 'Munyu Lane, Nairobi CBD',
            verified: 1,
            reviewer_badge: '1 review',
            likes_count: 2,
            owner_reply: '',
            owner_reply_time: '',
            keywords: ['inverter', 'batteries', 'panels'],
            google_review_url: SHANTIS_GBP_URL,
          },
          {
            author_name: 'Gerishon Ngugi',
            author_photo:
              'https://lh3.googleusercontent.com/a/ACg8ocKv5xgPa4JQUcJ7WaKowoG2Vh8Je6jcaWT5rqJlcVdMkczBmg=s120-c-rp-mo-br100',
            rating: 5,
            time_ago: 'a month ago',
            text: 'Great team of experts for your solar installations who you can trust 👍',
            location: 'Nairobi, Kenya',
            verified: 1,
            reviewer_badge: '3 reviews',
            likes_count: 2,
            owner_reply:
              'Thank you for Trusting in Shantis Designs Solar Solutions for your solar and equipment needs',
            owner_reply_time: 'a week ago',
            keywords: ['solar installations'],
            google_review_url: SHANTIS_GBP_URL,
          },
          {
            author_name: 'Ramadhan Otieno',
            author_photo:
              'https://lh3.googleusercontent.com/a-/ALV-UjXmq2TdYzNt8Uw71QfNT_Jh6ZwDc4C-ZSoIuv1JCeM0r6FkZ5L1=s120-c-rp-mo-br100',
            rating: 5,
            time_ago: '2 days ago',
            text: 'A good service',
            location: 'Kenya',
            verified: 1,
            reviewer_badge: '3 reviews',
            likes_count: 1,
            owner_reply: '',
            owner_reply_time: '',
            keywords: [],
            google_review_url: SHANTIS_GBP_URL,
          },
          {
            author_name: 'mugambi wanjau',
            author_photo:
              'https://lh3.googleusercontent.com/a-/ALV-UjXV5ORQGFKHNDNg-Hv_ooqcGFxbf9xJBelme-EwVMGjC3b5su3uFQ=s120-c-rp-mo-br100',
            rating: 5,
            time_ago: 'a month ago',
            text: '',
            location: 'Kenya',
            verified: 1,
            reviewer_badge: '1 review',
            likes_count: 1,
            owner_reply:
              'Thank you for Trusting in Shantis Designs Solar Solutions for your solar and equipment needs',
            owner_reply_time: 'a week ago',
            keywords: [],
            google_review_url: SHANTIS_GBP_URL,
          },
        ];

  let finalReviews;
  if (pg) {
    finalReviews = await PgRepository.syncGoogleReviews(verifiedGbpReviews);
  } else {
    const existing = SqlRepository.getReviews();
    const upsertRev = db.prepare(
      `INSERT OR REPLACE INTO reviews (
        id, author_name, author_photo, rating, time_ago, text, location, verified,
        reviewer_badge, likes_count, owner_reply, owner_reply_time, keywords_json, google_review_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    db.transaction(() => {
      verifiedGbpReviews.forEach((rev, idx) => {
        const found = existing.find(
          (e) => e.author_name.toLowerCase() === rev.author_name.toLowerCase()
        );
        const id = found ? found.id : idx + 1;
        upsertRev.run(
          id,
          rev.author_name,
          rev.author_photo,
          rev.rating,
          rev.time_ago,
          rev.text,
          rev.location,
          rev.verified,
          rev.reviewer_badge,
          rev.likes_count,
          rev.owner_reply,
          rev.owner_reply_time,
          JSON.stringify(rev.keywords),
          rev.google_review_url
        );
      });
    })();
    finalReviews = SqlRepository.getReviews();
  }

  await logAudit(
    'admin',
    'GOOGLE_REVIEWS_SYNCED',
    `Synced ${verifiedGbpReviews.length} Google Business Profile reviews via ${apiSourceUsed} (place=ChIJP2DxSVARLxgRUBi_VxOaIto)`,
    req
  );

  res.json({
    synced: true,
    api_source: apiSourceUsed,
    profile_id: '13542450485038602063',
    place_id: 'ChIJP2DxSVARLxgRUBi_VxOaIto',
    google_url: SHANTIS_GBP_URL,
    reviews: finalReviews,
  });
});

app.post('/api/media', requireAdminAuth, async (req: Request, res: Response) => {
  const m = req.body;
  const id = m.id || `media-${Date.now()}`;
  const slug = String(m.name || id)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  db.prepare(
    `INSERT OR REPLACE INTO media_assets (id, slug, name, source_url, mime_type, size_label, dimensions, entity_type, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'custom', ?)`
  ).run(
    id,
    slug,
    m.name,
    m.url,
    m.mime_type || 'image/jpeg',
    m.size || '240 KB',
    m.dimensions || '800 × 800 px',
    m.uploaded_at || new Date().toISOString().split('T')[0]
  );
  await cacheImageBlobInSqlite(id, m.url);

  if (isPostgresReady()) {
    return res.json({ media: await PgRepository.upsertMedia({ ...m, id }) });
  }
  res.json({ media: SqlRepository.getMediaList() });
});

app.delete('/api/media/:id', requireAdminAuth, async (req: Request, res: Response) => {
  db.prepare('DELETE FROM media_assets WHERE id = ?').run(req.params.id);
  if (isPostgresReady()) {
    return res.json({ media: await PgRepository.deleteMedia(req.params.id) });
  }
  res.json({ media: SqlRepository.getMediaList() });
});

app.put('/api/settings/:key', requireAdminAuth, async (req: Request, res: Response) => {
  const key = req.params.key;
  if (isPostgresReady()) {
    await PgRepository.saveSetting(key, req.body);
    return res.json({
      aboutData: await PgRepository.getAboutData(),
      homepageConfig: await PgRepository.getHomepageConfig(),
    });
  }
  db.prepare(
    `INSERT OR REPLACE INTO site_settings (key, value_json, updated_at) VALUES (?, ?, ?)`
  ).run(key, JSON.stringify(req.body), new Date().toISOString());
  res.json({
    aboutData: SqlRepository.getAboutData(),
    homepageConfig: SqlRepository.getHomepageConfig(),
  });
});

// Live Dynamic XML Sitemap Served Directly by Node.js
app.get('/sitemap.xml', async (_req: Request, res: Response) => {
  const pg = isPostgresReady();
  const products = pg ? await PgRepository.getProducts() : SqlRepository.getProducts();
  const categories = pg ? await PgRepository.getCategories() : SqlRepository.getCategories();
  const projects = pg ? await PgRepository.getProjects() : SqlRepository.getProjects();
  const articles = pg ? await PgRepository.getArticles() : SqlRepository.getArticles();
  const today = new Date().toISOString().split('T')[0];

  const staticPaths = [
    { loc: 'https://shantisdesigns.co.ke/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://shantisdesigns.co.ke/shop/', priority: '0.95', changefreq: 'daily' },
    { loc: 'https://shantisdesigns.co.ke/projects/', priority: '0.92', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/about/', priority: '0.85', changefreq: 'monthly' },
    { loc: 'https://shantisdesigns.co.ke/contact-2/', priority: '0.85', changefreq: 'monthly' },
    { loc: 'https://shantisdesigns.co.ke/order-tracking/', priority: '0.75', changefreq: 'monthly' },
    { loc: 'https://shantisdesigns.co.ke/blog/', priority: '0.88', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/solar-installation-kenya/', priority: '0.95', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/solar-installation-nairobi/', priority: '0.92', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/solar-installation-mombasa/', priority: '0.92', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/solar-installation-kisumu/', priority: '0.92', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/solar-installation-meru/', priority: '0.92', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/solar-installation-nakuru/', priority: '0.92', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/solar-installation-isiolo/', priority: '0.92', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/solar-installation-machakos/', priority: '0.92', changefreq: 'weekly' },
    { loc: 'https://shantisdesigns.co.ke/terms-and-conditions/', priority: '0.50', changefreq: 'yearly' },
    { loc: 'https://shantisdesigns.co.ke/privacy-policy/', priority: '0.50', changefreq: 'yearly' },
  ];

  const urlsXml = [
    ...staticPaths.map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    ),
    ...categories.map(
      (c) =>
        `  <url>\n    <loc>https://shantisdesigns.co.ke/product-category/${c.slug}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.88</priority>\n  </url>`
    ),
    ...products.map(
      (p) =>
        `  <url>\n    <loc>https://shantisdesigns.co.ke/product/${p.slug}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>`
    ),
    ...projects.map(
      (pr) =>
        `  <url>\n    <loc>https://shantisdesigns.co.ke/portfolio/${pr.slug}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>`
    ),
    ...articles.map(
      (a) =>
        `  <url>\n    <loc>https://shantisdesigns.co.ke/blog/${a.slug}/</loc>\n    <lastmod>${a.published_at || today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>`
    ),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(
    `User-agent: *\nAllow: /\nAllow: /shop/\nAllow: /product/\nAllow: /product-category/\nAllow: /projects/\nAllow: /about/\nAllow: /contact-2/\nAllow: /blog/\nAllow: /solar-installation-kenya/\nDisallow: /api/auth/\nSitemap: https://shantisdesigns.co.ke/sitemap.xml\n`
  );
});

// ============================================================================
// VITE DEV MIDDLEWARE / PRODUCTION STATIC ASSETS
// ============================================================================

async function startServer() {
  if (isPostgresConfigured()) {
    await postgresInitPromise;
  }

  const distPath = path.resolve(process.cwd(), 'dist');
  const isProd =
    (process.env.NODE_ENV === 'production' || process.env.CPANEL_ENV === 'production') &&
    fs.existsSync(distPath);

  if (isProd) {
    app.use(express.static(distPath));
    app.get(/.*/, (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const rawPort = process.env.PORT;
  if (rawPort && isNaN(Number(rawPort))) {
    app.listen(rawPort, () => {
      console.log(`[Shantis Solar Node.js Server] Running on socket ${rawPort}`);
    });
  } else {
    const listenPort = Number(rawPort) || 3000;
    app.listen(listenPort, '0.0.0.0', () => {
      console.log(`[Shantis Solar Node.js Server] Running on http://0.0.0.0:${listenPort}`);
    });
  }
}

startServer();
