// ============================================================================
// Phase 4 Test Suite: Bulk Campaign Engine, Wizard & Operational Controls
// QA Engineer 04 (Campaign Workflow) & QA Engineer 10 (Queue & Pacing)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createCampaign,
  getCampaigns,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  calculateCampaignCostUSD,
} from '../../src/lib/services/campaign-wizard-service.ts';
import { calculateCampaignPreflight } from '../../src/lib/services/campaign-service.ts';

test('Phase 4: Bulk Campaign Engine & Operations (QA-04 & QA-10)', async (t) => {
  const tenantId = 'tenant_p4_test';

  await t.test('TC-P4-001: Campaign Creation via Multi-Step Wizard', () => {
    const res = createCampaign({
      tenantId,
      name: 'Black Friday Super VIP Offer',
      category: 'MARKETING',
      senderPhone: '+971 50 123 4567',
      templateId: 'tmpl_001',
      templateName: 'seasonal_sale_2026',
      language: 'en',
      variableMappings: [
        { variableNumber: 1, sourceField: 'name', fallbackValue: 'Valued Customer' },
        { variableNumber: 2, sourceField: 'static_value', staticValue: 'BLACKFRIDAY', fallbackValue: 'VIP20' },
      ],
      audienceFilter: { tag: 'VIP' },
      pacingMessagesPerMinute: 60,
      createdBy: 'Chethan Reddy',
    });

    assert.equal(res.success, true);
    assert.ok(res.campaign?.id);
    assert.equal(res.campaign?.name, 'Black Friday Super VIP Offer');
    assert.equal(res.campaign?.status, 'SENDING');
    assert.equal(res.campaign?.pacingMessagesPerMinute, 60);
    assert.ok(res.campaign?.estimatedCostUSD > 0);
  });

  await t.test('TC-P4-002: Preflight Consent & Suppression Gate Barrier', () => {
    const campaignDef = {
      id: 'cmp_preflight_test',
      tenantId,
      name: 'Preflight Gate Test',
      phoneNumberId: 'phone_001',
      templateName: 'seasonal_sale_2026',
      templateCategory: 'MARKETING',
      templateStatus: 'APPROVED',
      recipients: [
        { contactId: 'c1', phoneRaw: '+971501112233', hasGrantedConsent: true, isSuppressed: false },
        { contactId: 'c2', phoneRaw: '+971504445566', hasGrantedConsent: true, isSuppressed: false },
        { contactId: 'c3', phoneRaw: '+971507778899', hasGrantedConsent: false, isSuppressed: false }, // NO CONSENT
        { contactId: 'c4', phoneRaw: '+971527104433', hasGrantedConsent: true, isSuppressed: true, suppressionReason: 'STOP keyword' }, // SUPPRESSED (STOP)
      ],
      pacingMessagesPerMinute: 60,
    };

    const preflight = calculateCampaignPreflight(campaignDef);
    assert.equal(preflight.total_selected, 4);
    assert.equal(preflight.eligible, 2);
    assert.equal(preflight.excluded.no_valid_consent, 1);
    assert.equal(preflight.excluded.opted_out_suppressed, 1);
  });

  await t.test('TC-P4-003: Operational State Lifecycle (Pause -> Resume -> Cancel)', () => {
    // Create new campaign
    const res = createCampaign({
      tenantId,
      name: 'Lifecycle Operations Campaign',
      category: 'MARKETING',
      senderPhone: '+971 50 123 4567',
      templateId: 'tmpl_002',
      templateName: 'uae_national_day_promo',
      language: 'en',
      variableMappings: [],
      audienceFilter: {},
      pacingMessagesPerMinute: 80,
      createdBy: 'Chethan Reddy',
    });
    const campaignId = res.campaign.id;
    assert.equal(res.campaign.status, 'SENDING');

    // 1. Pause
    const pauseRes = pauseCampaign(tenantId, campaignId);
    assert.equal(pauseRes.success, true);
    assert.equal(pauseRes.campaign?.status, 'PAUSED');

    // 2. Resume
    const resumeRes = resumeCampaign(tenantId, campaignId);
    assert.equal(resumeRes.success, true);
    assert.equal(resumeRes.campaign?.status, 'SENDING');

    // 3. Cancel
    const cancelRes = cancelCampaign(tenantId, campaignId);
    assert.equal(cancelRes.success, true);
    assert.equal(cancelRes.campaign?.status, 'CANCELLED');
  });

  await t.test('TC-P4-004: Meta Conversation Cost Calculation Engine', () => {
    // Marketing rate ($0.038 / msg for 1,000 msgs = $38.00)
    const marketingCost = calculateCampaignCostUSD(1000, 'MARKETING', 'AE');
    assert.equal(marketingCost, 38.00);

    // Utility rate ($0.015 / msg for 1,000 msgs = $15.00)
    const utilityCost = calculateCampaignCostUSD(1000, 'UTILITY', 'AE');
    assert.equal(utilityCost, 15.00);
  });

  await t.test('TC-P4-005: Pacing and Rate Limiting Configuration', () => {
    const conservative = createCampaign({
      tenantId,
      name: 'Conservative Paced Campaign',
      category: 'UTILITY',
      senderPhone: '+971 50 123 4567',
      templateId: 'tmpl_003',
      templateName: 'order_status_update',
      language: 'en',
      variableMappings: [],
      audienceFilter: {},
      pacingMessagesPerMinute: 30,
      createdBy: 'System Worker',
    });
    assert.equal(conservative.campaign?.pacingMessagesPerMinute, 30);

    const highThroughput = createCampaign({
      tenantId,
      name: 'High Throughput Campaign',
      category: 'MARKETING',
      senderPhone: '+971 50 123 4567',
      templateId: 'tmpl_001',
      templateName: 'seasonal_sale_2026',
      language: 'en',
      variableMappings: [],
      audienceFilter: {},
      pacingMessagesPerMinute: 120,
      createdBy: 'System Worker',
    });
    assert.equal(highThroughput.campaign?.pacingMessagesPerMinute, 120);
  });
});
