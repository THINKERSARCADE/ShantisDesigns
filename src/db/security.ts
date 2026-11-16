import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generates a salted scrypt hash in self-contained `salt:hash` format.
 */
export function hashWithRandomSalt(value: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(value, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies either self-contained `salt:hash` or legacy `(hash, legacySalt)` scrypt format.
 */
export function verifyScryptSecret(plain: string, storedHash: string, legacySalt?: string): boolean {
  if (!plain || !storedHash) return false;
  if (storedHash.includes(':')) {
    const [salt, expectedHex] = storedHash.split(':');
    if (!salt || !expectedHex) return false;
    const computedHex = crypto.scryptSync(plain, salt, 64).toString('hex');
    const a = Buffer.from(computedHex, 'hex');
    const b = Buffer.from(expectedHex, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  if (!legacySalt) return false;
  const computedHex = crypto.scryptSync(plain, legacySalt, 64).toString('hex');
  const a = Buffer.from(computedHex, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function maskSecretValue(val: string): string {
  const trimmed = (val || '').trim();
  if (!trimmed) return '';
  if (trimmed.length <= 6) return '••••••';
  return `${trimmed.slice(0, 3)}••••••••${trimmed.slice(-3)}`;
}

// Runtime AES-256-GCM cipher for Daraja API keys (allows live STK Push while keeping scrypt audit hashes)
function getVaultKey(): Buffer {
  const seed =
    process.env.MPESA_ENCRYPTION_KEY ||
    process.env.SESSION_SECRET ||
    process.env.WEBHOOK_SECRET ||
    'shantis-solar-daraja-vault-2026-key';
  return crypto.createHash('sha256').update(seed).digest();
}

export function encryptVaultSecret(plaintext: string): string {
  const clean = (plaintext || '').trim();
  if (!clean) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getVaultKey(), iv);
  const encrypted = Buffer.concat([cipher.update(clean, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptVaultSecret(payload: string): string {
  if (!payload || !payload.includes(':')) return '';
  try {
    const [ivHex, tagHex, dataHex] = payload.split(':');
    if (!ivHex || !tagHex || !dataHex) return '';
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      getVaultKey(),
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}

// ============================================================================
// RFC 6238 GOOGLE AUTHENTICATOR TOTP (BASE32 + HMAC-SHA1, 30s PERIOD)
// ============================================================================

export function generateBase32Secret(byteLength = 20): string {
  const randomBytes = crypto.randomBytes(byteLength);
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < randomBytes.length; i++) {
    value = (value << 8) | randomBytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function decodeBase32(base32: string): Buffer {
  const cleaned = (base32 || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpToken(base32Secret: string, stepOffset = 0, period = 30): string {
  const key = decodeBase32(base32Secret);
  if (key.length === 0) return '';
  const counter = Math.floor(Date.now() / 1000 / period) + stepOffset;
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 1000000).padStart(6, '0');
}

export function verifyGoogleTotp(base32Secret: string, submittedCode: string, window = 1): boolean {
  const clean = (submittedCode || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean) || !base32Secret) return false;
  for (let offset = -window; offset <= window; offset++) {
    const expected = generateTotpToken(base32Secret, offset);
    if (
      expected.length === clean.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clean))
    ) {
      return true;
    }
  }
  return false;
}

export function buildOtpAuthUri(
  email: string,
  base32Secret: string,
  issuer = 'Shantis Designs Solar'
): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(email)}`;
  return `otpauth://totp/${label}?secret=${encodeURIComponent(base32Secret)}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
