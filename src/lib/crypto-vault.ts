// ============================================================================
// Cryptographic Vault & Security Utilities
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits auth tag

let cachedMasterKey: Buffer | null = null;

/**
 * Derives a 32-byte Buffer key from environment or fallback (cached for performance)
 */
function getMasterKey(): Buffer {
  if (cachedMasterKey) {
    return cachedMasterKey;
  }

  const envKey = process.env.APP_ENCRYPTION_KEY;
  if (envKey && envKey.length === 64) {
    cachedMasterKey = Buffer.from(envKey, 'hex');
    return cachedMasterKey;
  }
  // Fallback for development/testing only
  const fallbackSalt = 'rich-rlephant-master-secret-salt-2026';
  cachedMasterKey = crypto.scryptSync(envKey || 'rich-rlephant-dev-secret', fallbackSalt, 32);
  return cachedMasterKey;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  tag: string;
  keyVersion: string;
}

/**
 * Encrypts a sensitive string (e.g. Meta WABA System User Token) using AES-256-GCM
 */
export function encryptSecret(plaintext: string): EncryptedPayload {
  if (!plaintext) {
    throw new Error('Plaintext cannot be empty');
  }

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    keyVersion: 'v1',
  };
}

/**
 * Decrypts a previously encrypted secret
 */
export function decryptSecret(payload: EncryptedPayload): string {
  const key = getMasterKey();
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Validates Meta Webhook HMAC-SHA256 signature using constant-time comparison
 * @param rawBody Raw buffer or string of request body
 * @param signatureHeader Value of X-Hub-Signature-256 (e.g. "sha256=abcdef...")
 * @param appSecret Meta App Secret
 */
export function verifyMetaWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret || !rawBody) {
    return false;
  }

  const prefix = 'sha256=';
  if (!signatureHeader.startsWith(prefix)) {
    return false;
  }

  const expectedSignature = signatureHeader.slice(prefix.length);

  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(rawBody);
  const actualSignature = hmac.digest('hex');

  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const actualBuffer = Buffer.from(actualSignature, 'hex');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

/**
 * Generates a SHA-256 hash of an API key for secure database storage
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Generates a cryptographically strong new API key
 * Prefix: rlep_live_ or rlep_test_
 */
export function generateApiKey(isTest: boolean = false): { rawKey: string; keyHash: string; keyPrefix: string } {
  const prefix = isTest ? 'rlep_test_' : 'rlep_live_';
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `${prefix}${randomBytes}`;
  const keyHash = hashApiKey(rawKey);

  return {
    rawKey,
    keyHash,
    keyPrefix: prefix,
  };
}

/**
 * Signs an outbound webhook payload using HMAC-SHA256 with the customer's webhook secret
 */
export function signOutboundPayload(rawPayload: string, secret: string): string {
  if (!rawPayload || !secret) {
    throw new Error('Payload and secret are required to generate outbound webhook signature');
  }
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawPayload);
  return `sha256=${hmac.digest('hex')}`;
}


