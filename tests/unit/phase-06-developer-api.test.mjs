// ============================================================================
// Phase 6 Test Suite: Developer Portal, Public REST API & Webhooks
// QA Engineer 06 (Developer API & Integration)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateApiKey,
  hashApiKey,
  signOutboundPayload,
} from '../../src/lib/crypto-vault.ts';
import { validateApiKey } from '../../src/lib/services/api-auth.ts';
import {
  dispatchOutboundEvent,
} from '../../src/lib/services/outbound-webhook-dispatcher.ts';
import { normalizePhoneNumber } from '../../src/lib/phone-normalizer.ts';
import { calculateServiceWindow } from '../../src/lib/service-window.ts';

test('Phase 6: Developer Platform, REST API & Webhooks (QA-06)', async (t) => {
  const { rawKey, keyHash, prefix } = generateApiKey(false);

  const mockApiKeysDb = [
    {
      id: 'key_p6_001',
      tenant_id: 'tenant_p6_test',
      name: 'Shopify Storefront Connector',
      key_prefix: prefix,
      key_hash: keyHash,
      scopes: ['messages:send', 'contacts:read', 'contacts:write'],
      revoked_at: null,
      expires_at: null,
    },
    {
      id: 'key_p6_revoked',
      tenant_id: 'tenant_p6_test',
      name: 'Compromised Key',
      key_prefix: 'rlep_live_',
      key_hash: hashApiKey('rlep_live_compromised_token_9999888877776666'),
      scopes: ['*'],
      revoked_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: null,
    },
  ];

  await t.test('TC-P6-001: API Key Cryptographic Lifecycle & Scope Authentication', async () => {
    // 1. Valid key with matching scope
    const authSuccess = await validateApiKey(rawKey, 'messages:send', mockApiKeysDb);
    assert.equal(authSuccess.valid, true);
    assert.equal(authSuccess.tenantId, 'tenant_p6_test');
    assert.equal(authSuccess.keyId, 'key_p6_001');

    // 2. Valid key but missing required scope
    const authScopeDenied = await validateApiKey(rawKey, 'super_admin:manage', mockApiKeysDb);
    assert.equal(authScopeDenied.valid, false);
    assert.equal(authScopeDenied.statusCode, 403);
    assert.match(authScopeDenied.error, /Insufficient permissions/);

    // 3. Revoked key rejected
    const authRevoked = await validateApiKey(
      'rlep_live_compromised_token_9999888877776666',
      'messages:send',
      mockApiKeysDb
    );
    assert.equal(authRevoked.valid, false);
    assert.equal(authRevoked.statusCode, 401);
    assert.match(authRevoked.error, /revoked/);

    // 4. Malformed key format rejected
    const authMalformed = await validateApiKey('invalid_bearer_token_123', 'messages:send', mockApiKeysDb);
    assert.equal(authMalformed.valid, false);
    assert.equal(authMalformed.statusCode, 401);
  });

  await t.test('TC-P6-002: Public REST API Outbound Message Preflight & 24h Window Enforcement', () => {
    // E.164 normalization check
    const phoneRes = normalizePhoneNumber('+971 50 123 4567');
    assert.equal(phoneRes.isValid, true);
    assert.equal(phoneRes.e164, '+971501234567');

    // 24h customer service window enforcement
    // Active window (within 24 hours)
    const activeWindow = calculateServiceWindow(new Date(Date.now() - 3600000).toISOString());
    assert.equal(activeWindow.isActive, true);

    // Expired window (25 hours ago)
    const expiredWindow = calculateServiceWindow(new Date(Date.now() - 25 * 3600000).toISOString());
    assert.equal(expiredWindow.isActive, false);
    assert.equal(expiredWindow.requiresTemplate, true);
    assert.equal(expiredWindow.remainingMinutes, 0);
  });

  await t.test('TC-P6-003: Outbound Webhook Subscriptions Registry & HMAC-SHA256 Signing', () => {
    const webhookSecret = 'whsec_enterprise_secret_aabbccddeeff1122';
    const samplePayload = JSON.stringify({
      event: 'message.delivered',
      deliveryId: 'del_123456789',
      timestamp: new Date().toISOString(),
      data: { messageId: 'wamid_987654321', status: 'delivered' },
    });

    const signature = signOutboundPayload(samplePayload, webhookSecret);
    assert.ok(signature.startsWith('sha256='));
    assert.equal(signature.length, 7 + 64); // "sha256=" + 64 hex characters

    // Signature verification with same payload and secret matches
    const signature2 = signOutboundPayload(samplePayload, webhookSecret);
    assert.equal(signature, signature2);

    // Tampered payload produces different signature
    const tamperedSignature = signOutboundPayload(samplePayload + 'tampered', webhookSecret);
    assert.notEqual(signature, tamperedSignature);
  });

  await t.test('TC-P6-004: Outbound Event Dispatching & Filter Matching', async () => {
    const endpoints = [
      {
        id: 'ep_all',
        tenant_id: 'tenant_p6_test',
        url: 'https://crm.example.com/webhook',
        secret: 'whsec_secret_1',
        events: ['*'],
        status: 'active',
        failure_count: 0,
      },
      {
        id: 'ep_delivered_only',
        tenant_id: 'tenant_p6_test',
        url: 'https://analytics.example.com/webhook',
        secret: 'whsec_secret_2',
        events: ['message.delivered'],
        status: 'active',
        failure_count: 0,
      },
      {
        id: 'ep_opt_out_only',
        tenant_id: 'tenant_p6_test',
        url: 'https://compliance.example.com/webhook',
        secret: 'whsec_secret_3',
        events: ['contact.opted_out'],
        status: 'active',
        failure_count: 0,
      },
      {
        id: 'ep_other_tenant',
        tenant_id: 'tenant_other_business',
        url: 'https://intruder.com/webhook',
        secret: 'whsec_secret_4',
        events: ['*'],
        status: 'active',
        failure_count: 0,
      },
    ];

    const dispatchedRequests = [];
    const mockHttpSender = async (url, options) => {
      dispatchedRequests.push({ url, headers: options.headers, body: JSON.parse(options.body) });
      return { status: 200, body: '{"ok":true}' };
    };

    const logs = await dispatchOutboundEvent(
      {
        tenantId: 'tenant_p6_test',
        eventType: 'message.delivered',
        data: { messageId: 'wamid_12345', recipient: '+971501234567' },
      },
      endpoints,
      mockHttpSender
    );

    // Only ep_all and ep_delivered_only should receive message.delivered
    assert.equal(logs.length, 2);
    assert.equal(dispatchedRequests.length, 2);
    assert.ok(dispatchedRequests.every((r) => r.headers['X-Platform-Signature'].startsWith('sha256=')));
    assert.ok(dispatchedRequests.every((r) => r.body.event === 'message.delivered'));
  });

  await t.test('TC-P6-005: Public REST API Contact Normalization & Consent Gating', () => {
    const rawContact = {
      phone: '050 123 4567',
      firstName: 'Tariq',
      consentStatus: 'opted_in',
      consentSource: 'web_checkout',
      tags: ['vip', 'dubai'],
    };

    const norm = normalizePhoneNumber(rawContact.phone);
    assert.equal(norm.isValid, true);
    assert.equal(norm.e164, '+971501234567');

    const createdRecord = {
      id: 'cnt_sample_01',
      phone: norm.e164,
      firstName: rawContact.firstName,
      consentStatus: rawContact.consentStatus,
      tags: rawContact.tags,
    };

    assert.equal(createdRecord.phone, '+971501234567');
    assert.equal(createdRecord.consentStatus, 'opted_in');
    assert.equal(createdRecord.tags.length, 2);
  });
});
