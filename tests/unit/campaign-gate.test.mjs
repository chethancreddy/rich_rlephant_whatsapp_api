import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateRecipientEligibility } from '../../src/lib/campaign-gate.ts';

test('Campaign Eligibility & Preflight Gate', async (t) => {
  await t.test('Approves recipient with valid phone, consent, and approved template', () => {
    const result = evaluateRecipientEligibility(
      {
        contactId: 'c1',
        phoneRaw: '+971 50 123 4567',
        hasGrantedConsent: true,
        isSuppressed: false,
      },
      'MARKETING',
      'APPROVED'
    );

    assert.equal(result.isEligible, true);
    assert.equal(result.phoneE164, '+971501234567');
  });

  await t.test('QA-001: Blocks recipient without recorded consent', () => {
    const result = evaluateRecipientEligibility(
      {
        contactId: 'c2',
        phoneRaw: '+971 50 123 4567',
        hasGrantedConsent: false,
        isSuppressed: false,
      },
      'MARKETING',
      'APPROVED'
    );

    assert.equal(result.isEligible, false);
    assert.equal(result.exclusionReason, 'NO_VALID_CONSENT');
  });

  await t.test('QA-003: Blocks recipient present in suppression registry (STOP keyword)', () => {
    const result = evaluateRecipientEligibility(
      {
        contactId: 'c3',
        phoneRaw: '+971 50 123 4567',
        hasGrantedConsent: true,
        isSuppressed: true,
        suppressionReason: 'Keyword STOP received',
      },
      'MARKETING',
      'APPROVED'
    );

    assert.equal(result.isEligible, false);
    assert.equal(result.exclusionReason, 'SUPPRESSED_OPT_OUT');
  });

  await t.test('QA-002: Blocks send when template is not in APPROVED status', () => {
    const result = evaluateRecipientEligibility(
      {
        contactId: 'c4',
        phoneRaw: '+971 50 123 4567',
        hasGrantedConsent: true,
        isSuppressed: false,
      },
      'MARKETING',
      'PENDING' // Not approved
    );

    assert.equal(result.isEligible, false);
    assert.equal(result.exclusionReason, 'TEMPLATE_NOT_APPROVED');
  });
});

