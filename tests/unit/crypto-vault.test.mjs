import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import {
  encryptSecret,
  decryptSecret,
  verifyMetaWebhookSignature,
  hashApiKey,
  generateApiKey,
} from '../../src/lib/crypto-vault.ts';

test('Crypto Vault - AES-256-GCM & HMAC Verification', async (t) => {
  await t.test('Encrypts and decrypts Meta Access Token without data loss', () => {
    const rawToken = 'EAAG...meta_system_user_secret_token_example_12345';
    const encrypted = encryptSecret(rawToken);

    assert.notEqual(encrypted.ciphertext, rawToken);
    assert.equal(encrypted.keyVersion, 'v1');
    assert.ok(encrypted.iv);
    assert.ok(encrypted.tag);

    const decrypted = decryptSecret(encrypted);
    assert.equal(decrypted, rawToken);
  });

  await t.test('Validates authentic Meta Webhook HMAC-SHA256 signature', () => {
    const appSecret = 'secret_test_app_key_999';
    const rawPayload = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });

    const hmac = crypto.createHmac('sha256', appSecret).update(rawPayload).digest('hex');
    const signatureHeader = `sha256=${hmac}`;

    const isValid = verifyMetaWebhookSignature(rawPayload, signatureHeader, appSecret);
    assert.equal(isValid, true);
  });

  await t.test('Rejects tampered payload or mismatched signature', () => {
    const appSecret = 'secret_test_app_key_999';
    const rawPayload = JSON.stringify({ object: 'whatsapp_business_account' });
    const tamperedPayload = JSON.stringify({ object: 'tampered_data' });

    const hmac = crypto.createHmac('sha256', appSecret).update(rawPayload).digest('hex');
    const signatureHeader = `sha256=${hmac}`;

    const isValid = verifyMetaWebhookSignature(tamperedPayload, signatureHeader, appSecret);
    assert.equal(isValid, false);
  });

  await t.test('Generates cryptographically random API keys with SHA-256 hash', () => {
    const key = generateApiKey(false);
    assert.ok(key.rawKey.startsWith('rlep_live_'));
    assert.equal(key.keyHash.length, 64); // SHA-256 is 64 hex chars
    assert.equal(hashApiKey(key.rawKey), key.keyHash);
  });
});

