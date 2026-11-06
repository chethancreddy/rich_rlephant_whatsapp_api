// ============================================================================
// Unit Tests: Developer API Authentication & Outbound Webhook Delivery
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { generateApiKey, hashApiKey, signOutboundPayload } from '../../src/lib/crypto-vault.ts';
import { validateApiKey } from '../../src/lib/services/api-auth.ts';
import { dispatchOutboundEvent } from '../../src/lib/services/outbound-webhook-dispatcher.ts';

test('Developer API Authentication & Scopes', async (t) => {
  const { rawKey, keyHash } = generateApiKey(false);

  const mockDb = [
    {
      id: 'key_valid_1',
      tenant_id: 'tenant_enterprise_01',
      name: 'Production Server Key',
      key_prefix: 'rlep_live_',
      key_hash: keyHash,
      scopes: ['messages:send', 'contacts:read'],
      revoked_at: null,
      expires_at: null,
    },
    {
      id: 'key_revoked_2',
      tenant_id: 'tenant_enterprise_01',
      name: 'Stolen Key',
      key_prefix: 'rlep_live_',
      key_hash: hashApiKey('rlep_live_revoked_key_1234567890abcdef'),
      scopes: ['*'],
      revoked_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: null,
    },
    {
      id: 'key_expired_3',
      tenant_id: 'tenant_enterprise_01',
      name: 'Expired Test Key',
      key_prefix: 'rlep_test_',
      key_hash: hashApiKey('rlep_test_expired_key_1234567890abcdef'),
      scopes: ['*'],
      revoked_at: null,
      expires_at: new Date(Date.now() - 60000).toISOString(),
    },
  ];

  await t.test('Successfully validates authentic live API key with required scope', async () => {
    const res = await validateApiKey(rawKey, 'messages:send', mockDb);
    assert.equal(res.valid, true);
    assert.equal(res.tenantId, 'tenant_enterprise_01');
    assert.equal(res.keyId, 'key_valid_1');
  });

  await t.test('Rejects authentic key when requested scope is not granted', async () => {
    const res = await validateApiKey(rawKey, 'templates:delete', mockDb);
    assert.equal(res.valid, false);
    assert.equal(res.statusCode, 403);
    assert.match(res.error || '', /Insufficient permissions/);
  });

  await t.test('Rejects revoked API key', async () => {
    const res = await validateApiKey('rlep_live_revoked_key_1234567890abcdef', 'messages:send', mockDb);
    assert.equal(res.valid, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.error || '', /revoked/);
  });

  await t.test('Rejects expired API key', async () => {
    const res = await validateApiKey('rlep_test_expired_key_1234567890abcdef', 'messages:send', mockDb);
    assert.equal(res.valid, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.error || '', /expired/);
  });

  await t.test('Rejects unknown or tampered API key', async () => {
    const res = await validateApiKey('rlep_live_non_existent_key_999999999', 'messages:send', mockDb);
    assert.equal(res.valid, false);
    assert.equal(res.statusCode, 401);
  });
});

test('Outbound Webhook Delivery & HMAC Signatures', async (t) => {
  const secret = 'whsec_enterprise_client_secret_998877';
  const samplePayload = JSON.stringify({ event: 'message.delivered', id: 'msg_123' });
  const signature = signOutboundPayload(samplePayload, secret);

  await t.test('Generates valid HMAC-SHA256 signature prefix', () => {
    assert.ok(signature.startsWith('sha256='));
    assert.equal(signature.length, 7 + 64);
  });

  await t.test('Dispatches event to active subscribed webhook endpoints', async () => {
    const endpoints = [
      {
        id: 'ep_001',
        tenant_id: 'tenant_123',
        url: 'https://client-crm.com/webhook',
        secret: secret,
        events: ['message.delivered', 'contact.opted_out'],
        status: 'active',
        failure_count: 0,
      },
      {
        id: 'ep_disabled',
        tenant_id: 'tenant_123',
        url: 'https://disabled-crm.com/webhook',
        secret: secret,
        events: ['*'],
        status: 'disabled',
        failure_count: 5,
      },
      {
        id: 'ep_other_tenant',
        tenant_id: 'tenant_other',
        url: 'https://other-crm.com/webhook',
        secret: secret,
        events: ['*'],
        status: 'active',
        failure_count: 0,
      },
    ];

    let capturedUrl = '';
    let capturedHeaders = {};
    let capturedBody = '';

    const mockSender = async (url, opts) => {
      capturedUrl = url;
      capturedHeaders = opts.headers;
      capturedBody = opts.body;
      return { status: 200, body: 'OK' };
    };

    const logs = await dispatchOutboundEvent(
      {
        tenantId: 'tenant_123',
        eventType: 'message.delivered',
        data: { messageId: 'wamid_999', status: 'delivered' },
      },
      endpoints,
      mockSender
    );

    assert.equal(logs.length, 1);
    assert.equal(logs[0].status, 'delivered');
    assert.equal(capturedUrl, 'https://client-crm.com/webhook');
    assert.ok(capturedHeaders['X-Platform-Signature'].startsWith('sha256='));
    assert.equal(capturedHeaders['X-Platform-Event'], 'message.delivered');
  });
});
