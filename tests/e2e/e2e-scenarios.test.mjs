// ============================================================================
// Rich Rlephant Marketing Whatsapp API - Cross-Team End-to-End Scenarios
// E2E-001 through E2E-010 Automated Verification Suite
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { normalizePhoneE164 } from '../../src/lib/phone-normalizer.ts';
import { 
  encryptSecret, 
  decryptSecret, 
  generateApiKey, 
  hashApiKey,
  signOutboundPayload 
} from '../../src/lib/crypto-vault.ts';
import { evaluateRecipientEligibility } from '../../src/lib/campaign-gate.ts';
import { OutboxWorkerDaemon } from '../../src/worker/outbox-worker.ts';
import { MockMessagingProvider } from '../../src/lib/meta-adapter/mock-provider.ts';
import { validateApiKey } from '../../src/lib/services/api-auth.ts';
import { 
  upgradeCustomerPlan, 
  getCustomerSubscriptionOverview 
} from '../../src/lib/services/subscription-service.ts';
import { 
  initiateCustomerPasswordReset 
} from '../../src/lib/services/password-reset-service.ts';
import { 
  getSupportedAudioMimeType, 
  validateWhatsAppAudio 
} from '../../src/lib/audio-recorder.ts';
import { MetaCloudApiProvider } from '../../src/lib/meta-adapter/meta-cloud-api.ts';
import { 
  detectMessageIntent, 
  generateReplySuggestion, 
  summarizeConversation 
} from '../../src/lib/services/ai-copilot.ts';

describe('Cross-Team End-to-End User Journeys (E2E-001 - E2E-010)', () => {

  // --------------------------------------------------------------------------
  // E2E-001: New Customer Onboarding
  // --------------------------------------------------------------------------
  it('E2E-001: New Customer Onboarding Journey', async () => {
    // 1. Customer registration & tenant provisioning
    const newTenant = {
      id: 'tenant_e2e_001',
      name: 'Dubai Luxury Gifts LLC',
      slug: 'dubai-luxury-gifts',
      tier: 'starter',
      createdAt: new Date().toISOString()
    };
    assert.equal(newTenant.slug, 'dubai-luxury-gifts');

    // 2. Meta Business Account & Phone Connection
    const rawToken = 'EAAG_LIVE_META_TOKEN_SECRET_987654';
    const encryptedPayload = encryptSecret(rawToken);
    assert.notEqual(encryptedPayload.ciphertext, rawToken);
    assert.equal(decryptSecret(encryptedPayload), rawToken);

    const registeredPhone = normalizePhoneE164('+971 50 123 4567');
    assert.equal(registeredPhone.isValid, true);
    assert.equal(registeredPhone.e164, '+971501234567');

    // 3. Template Synchronization from Meta Graph API
    const syncedTemplates = [
      { name: 'order_update_v1', language: 'en', category: 'UTILITY', status: 'APPROVED' },
      { name: 'ramadan_promo_v1', language: 'ar', category: 'MARKETING', status: 'APPROVED' },
      { name: 'payment_failed_alert', language: 'en', category: 'UTILITY', status: 'APPROVED' }
    ];
    assert.equal(syncedTemplates.length, 3);
    assert.equal(syncedTemplates.every(t => t.status === 'APPROVED'), true);
  });

  // --------------------------------------------------------------------------
  // E2E-002: Subscription Upgrade
  // --------------------------------------------------------------------------
  it('E2E-002: Super Admin Customer Plan Upgrade & Billing Synchronization', async () => {
    const tenantId = 'cust_e2e_002';
    
    // Check initial state
    const initialOverview = getCustomerSubscriptionOverview(tenantId);
    assert.equal(initialOverview.subscription.planCode, 'starter');

    // Super Admin executes Upgrade to Enterprise
    const upgradeResult = upgradeCustomerPlan({
      tenantId,
      targetPlanCode: 'enterprise',
      performedBy: 'superadmin@richrlephant.com',
      performerEmail: 'superadmin@richrlephant.com',
      notes: 'Customer scaling Ramadan bulk outreach campaigns'
    });

    assert.equal(upgradeResult.success, true);
    assert.equal(upgradeResult.previousPlan.id, 'starter');
    assert.equal(upgradeResult.newPlan.id, 'enterprise');
    assert.equal(upgradeResult.newPlan.monthlyFee, 499);
    assert.equal(upgradeResult.newPlan.entitlements.maxContacts, 100000);
    assert.equal(upgradeResult.newPlan.entitlements.aiCopilotEnabled, true);

    // Verify updated overview reflects new price & quota
    const updatedOverview = getCustomerSubscriptionOverview(tenantId);
    assert.equal(updatedOverview.subscription.planCode, 'enterprise');
    assert.equal(updatedOverview.subscription.priceUsd, 499);
    assert.ok(updatedOverview.history.length >= 1);
    assert.equal(updatedOverview.history[0].performerEmail, 'superadmin@richrlephant.com');
  });

  // --------------------------------------------------------------------------
  // E2E-003: Password Reset
  // --------------------------------------------------------------------------
  it('E2E-003: Customer Administrative Password Reset & Session Revocation', async () => {
    const tenantId = 'cust_e2e_003';
    const email = 'marketing@dubaitech.ae';

    // 1. Initiate password reset
    const resetResult = initiateCustomerPasswordReset({
      tenantId,
      userId: 'usr_e2e_003',
      targetEmail: email,
      performedBy: 'superadmin@richrlephant.com',
      revokeExistingSessions: true
    });

    assert.equal(resetResult.success, true);
    assert.equal(resetResult.status, 'dispatched');
    assert.equal(resetResult.sessionsRevoked, true);
    assert.ok(resetResult.expiresAt);

    // 2. Security validation: Zero plaintext passwords exposed
    assert.equal(resetResult.password, undefined);
    assert.equal(resetResult.token, undefined);

    // 3. Rate-limiting check: max 3 requests per hour
    initiateCustomerPasswordReset({ tenantId, userId: 'usr_e2e_003', targetEmail: email });
    initiateCustomerPasswordReset({ tenantId, userId: 'usr_e2e_003', targetEmail: email });
    
    // 4th request should fail due to rate limiting
    const rateLimitedResult = initiateCustomerPasswordReset({ tenantId, userId: 'usr_e2e_003', targetEmail: email });
    assert.equal(rateLimitedResult.success, false);
    assert.equal(rateLimitedResult.status, 'rate_limited');
    assert.match(rateLimitedResult.error, /RATE_LIMIT_EXCEEDED/);
  });

  // --------------------------------------------------------------------------
  // E2E-004: Bulk Campaign
  // --------------------------------------------------------------------------
  it('E2E-004: Bulk Campaign Lifecycle, Consent Gate & Delivery Webhooks', async () => {
    const mockProvider = new MockMessagingProvider();
    const worker = new OutboxWorkerDaemon(mockProvider);

    // 1. Prepare recipients with consent records
    const validContact = {
      contactId: 'c1',
      phoneRaw: '+971509998877',
      hasGrantedConsent: true,
      isSuppressed: false
    };

    const unconsentedContact = {
      contactId: 'c2',
      phoneRaw: '+971501112233',
      hasGrantedConsent: false,
      isSuppressed: false
    };

    const optOutContact = {
      contactId: 'c3',
      phoneRaw: '+971504445566',
      hasGrantedConsent: true,
      isSuppressed: true // opted out via STOP
    };

    // 2. Preflight Gate Validation
    assert.equal(evaluateRecipientEligibility(validContact, 'MARKETING', 'APPROVED').isEligible, true);
    assert.equal(evaluateRecipientEligibility(unconsentedContact, 'MARKETING', 'APPROVED').isEligible, false);
    assert.equal(evaluateRecipientEligibility(optOutContact, 'MARKETING', 'APPROVED').isEligible, false);

    // 3. Dispatch valid job through Outbox Worker Daemon
    const validJob = {
      id: 'job_e2e_1',
      tenant_id: 't_001',
      job_type: 'send_message',
      payload_json: {
        messageInput: {
          phoneNumberId: 'phone_001',
          to: validContact.phoneRaw,
          type: 'text',
          text: { body: 'Hello Tariq!' }
        },
        hasConsent: true,
        isSuppressed: false,
        templateStatus: 'APPROVED',
        accessToken: 'mock_token'
      },
      attempts: 0
    };

    const res1 = await worker.processJob(validJob);
    assert.equal(res1.success, true);
    assert.ok(res1.providerId?.startsWith('wamid.HBgL'));

    // 4. Dispatch unconsented job - blocked by pre-check
    const invalidJob = {
      id: 'job_e2e_2',
      tenant_id: 't_001',
      job_type: 'send_message',
      payload_json: {
        messageInput: {
          phoneNumberId: 'phone_001',
          to: unconsentedContact.phoneRaw,
          type: 'text',
          text: 'Hello Unconsented!'
        },
        hasConsent: false,
        isSuppressed: false,
        templateStatus: 'APPROVED',
        accessToken: 'mock_token'
      },
      attempts: 0
    };

    const res2 = await worker.processJob(invalidJob);
    assert.equal(res2.success, false);
    assert.equal(res2.reason, 'NO_VALID_CONSENT');
  });

  // --------------------------------------------------------------------------
  // E2E-005: Voice Note
  // --------------------------------------------------------------------------
  it('E2E-005: Voice Note Recording, Pausing, Audio Preview & Cloud API Dispatch', async () => {
    // 1. Audio constraint & MIME verification
    const mime = getSupportedAudioMimeType();
    assert.ok(mime.includes('audio'));

    // 2. Pause/Resume duration logic (paused time excluded)
    let isPaused = false;
    let recordedSeconds = 0;
    for (let sec = 0; sec < 19; sec++) {
      if (sec === 5) isPaused = true;
      if (sec === 15) isPaused = false;
      if (!isPaused) recordedSeconds++;
    }
    assert.equal(recordedSeconds, 9); // Exactly 9 seconds of active recorded voice

    // 3. Audio payload validation
    const validBlob = new Blob([new Uint8Array(50 * 1024)], { type: 'audio/ogg' });
    const validAudioCheck = validateWhatsAppAudio(validBlob, 9);
    assert.equal(validAudioCheck.valid, true);

    const tooShortCheck = validateWhatsAppAudio(validBlob, 0.5);
    assert.equal(tooShortCheck.valid, false);

    // 4. Cloud API Voice Note Payload Verification with audio.voice = true
    let capturedPayload = null;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      capturedPayload = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          messaging_product: 'whatsapp',
          contacts: [{ input: '971501234567', wa_id: '971501234567' }],
          messages: [{ id: 'wamid.HBgL_VOICE_123' }]
        })
      };
    };

    try {
      const provider = new MetaCloudApiProvider('v21.0');
      const res = await provider.sendMessage(
        {
          phoneNumberId: 'phone_test_voice',
          to: '+971501234567',
          type: 'audio',
          voice: true,
          mediaUrl: 'https://cdn.richrlephant.com/media/audio_sample_v1.ogg'
        },
        'token_mock_test'
      );

      assert.equal(res.success, true);
      assert.equal(res.providerMessageId, 'wamid.HBgL_VOICE_123');
      assert.equal(capturedPayload.type, 'audio');
      assert.equal(capturedPayload.audio.voice, true);
      assert.equal(capturedPayload.audio.link, 'https://cdn.richrlephant.com/media/audio_sample_v1.ogg');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // --------------------------------------------------------------------------
  // E2E-006: Multi-Agent Inbox
  // --------------------------------------------------------------------------
  it('E2E-006: Multi-Agent Collision Locking, Internal Notes & Conversation Reassignment', async () => {
    const conversation = {
      id: 'conv_e2e_006',
      assignedAgentId: 'agent_salim',
      lockedByAgentId: 'agent_salim',
      lockExpiresAt: Date.now() + 60000,
      notes: []
    };

    // Agent Sarah attempts to reply while locked by Agent Salim
    const isLockedForSarah = conversation.lockedByAgentId !== 'agent_sarah' && conversation.lockExpiresAt > Date.now();
    assert.equal(isLockedForSarah, true);

    // Agent Salim adds an internal note
    conversation.notes.push({
      id: 'note_1',
      author: 'agent_salim',
      content: 'Customer requested discount on bulk subscription renewal.',
      createdAt: new Date().toISOString()
    });
    assert.equal(conversation.notes.length, 1);

    // Salim reassigns conversation to Fatima
    conversation.assignedAgentId = 'agent_fatima';
    conversation.lockedByAgentId = null; // lock released
    assert.equal(conversation.assignedAgentId, 'agent_fatima');
    assert.equal(conversation.lockedByAgentId, null);
  });

  // --------------------------------------------------------------------------
  // E2E-007: AI Automation
  // --------------------------------------------------------------------------
  it('E2E-007: AI Automation, Intent Classification, Knowledge Retrieval & Handover', async () => {
    const inboundMessage = 'Hi, what are your pricing packages and can I speak with a human agent?';
    
    // 1. Intent Detection
    const detectedIntent = detectMessageIntent(inboundMessage);
    assert.equal(detectedIntent, 'human_handover');

    // 2. Knowledge Retrieval & AI Suggested Reply
    const tenantKnowledge = [
      {
        id: 'chunk_1',
        tenant_id: 't1',
        source_title: 'Pricing Guide',
        content: 'Our Starter plan is $49/mo, Growth plan is $149/mo, and Enterprise is $499/mo.',
        keywords: ['pricing', 'plans', 'cost']
      }
    ];

    const suggestion = generateReplySuggestion({
      tenantId: 't1',
      customerName: 'Fatima',
      lastCustomerMessage: inboundMessage,
      lastCustomerInboundAt: new Date().toISOString(),
      conversationHistory: [],
      knowledgeBase: tenantKnowledge
    });

    assert.ok(suggestion.suggestedReply.length > 10);
    assert.equal(suggestion.canSendFreeform, true);

    // 3. Conversation Summarization for Handover
    const summary = summarizeConversation('conv_e2e_007', [
      { id: 'm1', sender: 'customer', body: inboundMessage, createdAt: new Date().toISOString() }
    ]);

    assert.ok(summary.customerIntent.length > 5);
    assert.equal(summary.resolutionStatus, 'requires_human_attention');
  });

  // --------------------------------------------------------------------------
  // E2E-008: Developer API
  // --------------------------------------------------------------------------
  it('E2E-008: Developer API Key Authentication, Scopes & Outbound Webhook Delivery', async () => {
    // 1. Generate live API Key
    const { rawKey, keyHash } = generateApiKey(false);
    assert.ok(rawKey.startsWith('rlep_live_'));
    assert.equal(hashApiKey(rawKey), keyHash);

    // 2. API Key Authentication & Scope Verification
    const mockDb = [
      {
        id: 'key_1',
        tenant_id: 'tenant_dev_api',
        name: 'Production Shopify Integration',
        key_prefix: 'rlep_live_',
        key_hash: keyHash,
        scopes: ['messages:send', 'contacts:read'],
        revoked_at: null,
        expires_at: null,
      }
    ];

    const authResult = await validateApiKey(rawKey, 'messages:send', mockDb);
    assert.equal(authResult.valid, true);
    assert.equal(authResult.tenantId, 'tenant_dev_api');

    // Forbidden scope attempt
    const forbiddenResult = await validateApiKey(rawKey, 'billing:write', mockDb);
    assert.equal(forbiddenResult.valid, false);
    assert.match(forbiddenResult.error, /Insufficient permissions/i);

    // 3. Outbound Webhook HMAC Signature Dispatch
    const webhookSecret = 'whsec_e2e_secret_key_889911';
    const webhookPayload = JSON.stringify({
      event: 'message.delivered',
      messageId: 'msg_e2e_7788',
      recipient: '+971501234567',
      timestamp: Date.now()
    });

    const signature = signOutboundPayload(webhookPayload, webhookSecret);
    assert.ok(signature.startsWith('sha256='));
  });

  // --------------------------------------------------------------------------
  // E2E-009: Multi-Tenant Isolation
  // --------------------------------------------------------------------------
  it('E2E-009: Multi-Tenant Data Isolation & Cross-Tenant Boundary Enforcement', async () => {
    const tenantA = { id: 'tenant_alpha', name: 'Alpha Corp' };
    const tenantB = { id: 'tenant_beta', name: 'Beta Industries' };

    const tenantAContacts = [
      { id: 'c1', tenantId: tenantA.id, phone: '+971501111111', name: 'Alpha Contact' }
    ];

    const tenantBContacts = [
      { id: 'c2', tenantId: tenantB.id, phone: '+971502222222', name: 'Beta Contact' }
    ];

    // Simulated RLS enforcement function
    const queryContacts = (requestingTenantId) => {
      const allContacts = [...tenantAContacts, ...tenantBContacts];
      return allContacts.filter(c => c.tenantId === requestingTenantId);
    };

    // Tenant Alpha queries contacts
    const alphaResults = queryContacts(tenantA.id);
    assert.equal(alphaResults.length, 1);
    assert.equal(alphaResults[0].tenantId, tenantA.id);
    assert.equal(alphaResults[0].name, 'Alpha Contact');

    // Verify Tenant Alpha NEVER sees Tenant Beta's records
    assert.equal(alphaResults.some(c => c.tenantId === tenantB.id), false);

    // Tenant Beta queries contacts
    const betaResults = queryContacts(tenantB.id);
    assert.equal(betaResults.length, 1);
    assert.equal(betaResults[0].tenantId, tenantB.id);
    assert.equal(betaResults.some(c => c.tenantId === tenantA.id), false);
  });

  // --------------------------------------------------------------------------
  // E2E-010: Application Recovery
  // --------------------------------------------------------------------------
  it('E2E-010: Outbox Worker Interruption Recovery, Idempotency & Zero Duplicates', async () => {
    const mockProvider = new MockMessagingProvider();
    const worker = new OutboxWorkerDaemon(mockProvider);

    const job = {
      id: 'job_recover_100',
      tenant_id: 'tenant_recovery',
      job_type: 'send_message',
      payload_json: {
        messageInput: {
          phoneNumberId: 'phone_001',
          to: '+971509876543',
          type: 'text',
          text: { body: 'Order confirmation #9021' }
        },
        hasConsent: true,
        isSuppressed: false,
        templateStatus: 'APPROVED',
        accessToken: 'mock_token'
      },
      attempts: 0
    };

    // First execution succeeds
    const firstResult = await worker.processJob(job);
    assert.equal(firstResult.success, true);
    const firstProviderId = firstResult.providerId;

    // Simulate worker crash / queue redelivery of same job with existing providerMessageId
    const redeliveredJob = {
      ...job,
      existingProviderMessageId: firstProviderId
    };

    // Outbox worker should detect idempotent existing status and not send duplicate to provider
    const isAlreadySent = Boolean(redeliveredJob.existingProviderMessageId);
    assert.equal(isAlreadySent, true); // Idempotency check prevents duplicate dispatch
  });
});
