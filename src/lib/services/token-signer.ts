// ============================================================================
// Web-Crypto Compatible Cryptographic Token Signer (Runs in Edge & Node.js)
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

const SECRET_FALLBACK = 'rich-rlephant-super-secure-production-key-2026';

function getSecretBytes(): ArrayBuffer {
  const secret = process.env.APP_ENCRYPTION_KEY || SECRET_FALLBACK;
  const encoded = new TextEncoder().encode(secret);
  return encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let m = str.replace(/-/g, '+').replace(/_/g, '/');
  while (m.length % 4) {
    m += '=';
  }
  const binary = atob(m);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Signs a payload with HMAC-SHA256 using universal Web Crypto API
 */
export async function signSessionJwt(payload: Record<string, any>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerEncoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadEncoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;

  const key = await crypto.subtle.importKey(
    'raw',
    getSecretBytes() as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const dataBytes = new TextEncoder().encode(dataToSign);
  const signature = await crypto.subtle.sign('HMAC', key, dataBytes as unknown as BufferSource);
  const signatureEncoded = base64UrlEncode(new Uint8Array(signature));

  return `${dataToSign}.${signatureEncoded}`;
}

/**
 * Verifies and decodes a signed session JWT
 */
export async function verifySessionJwt<T = Record<string, any>>(token: string): Promise<T | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
  const dataToVerify = `${headerEncoded}.${payloadEncoded}`;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      getSecretBytes() as BufferSource,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlDecode(signatureEncoded);
    const dataBytes = new TextEncoder().encode(dataToVerify);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      dataBytes as unknown as BufferSource
    );

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadEncoded));
    const payload = JSON.parse(payloadJson);

    // Verify expiration timestamp (exp)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload as T;
  } catch (err) {
    return null;
  }
}
