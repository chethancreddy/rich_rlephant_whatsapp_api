import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateCampaignPreflight,
  buildOutboxJobsForCampaign,
} from '../../src/lib/services/campaign-service.ts';

test('Campaign Lifecycle & Outbox Enqueue', async (t) => {
  const mockCampaign = {
    id: 'cmp_test_101',
    tenantId: 'tenant_ae',
    name: 'Weekend Special',
    phoneNumberId: 'phone_ae_01',
    templateName: 'weekend_promo',
    templateCategory: 'MARKETING',
    templateStatus: 'APPROVED',
    recipients: [
      {
        contactId: 'c1',
        phoneRaw: '+971501112222',
        hasGrantedConsent: true,
        isSuppressed: false,
      },
      {
        contactId: 'c2',
        phoneRaw: '+971503334444',
        hasGrantedConsent: false, // NO CONSENT
        isSuppressed: false,
      },
      {
        contactId: 'c3',
        phoneRaw: '+971505556666',
        hasGrantedConsent: true,
        isSuppressed: true, // SUPPRESSED
      },
      {
        contactId: 'c4',
        phoneRaw: 'bad_phone', // INVALID
        hasGrantedConsent: true,
        isSuppressed: false,
      },
    ],
    pacingMessagesPerMinute: 60,
  };

  await t.test('Preflight accurately filters audience by consent and suppression', () => {
    const preflight = calculateCampaignPreflight(mockCampaign);

    assert.equal(preflight.total_selected, 4);
    assert.equal(preflight.eligible, 1);
    assert.equal(preflight.excluded.no_valid_consent, 1);
    assert.equal(preflight.excluded.opted_out_suppressed, 1);
    assert.equal(preflight.excluded.invalid_phone_format, 1);
    assert.equal(preflight.estimated_cost.amount, 0.04);
  });

  await t.test('Builds outbox queue jobs only for eligible recipients with idempotency keys', () => {
    const jobs = buildOutboxJobsForCampaign(mockCampaign, 'launch_token_999');

    assert.equal(jobs.length, 1);
    assert.equal(jobs[0].payload_json.messageInput.to, '+971501112222');
    assert.equal(jobs[0].idempotency_key, 'launch_token_999_c1');
    assert.equal(jobs[0].job_type, 'send_message');
  });
});

