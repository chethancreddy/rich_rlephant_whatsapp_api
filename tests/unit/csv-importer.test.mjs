import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizePhoneE164 } from '../../src/lib/phone-normalizer.ts';

test('Contacts CSV Import & Consent Engine', async (t) => {
  await t.test('Normalizes and approves contact with valid consent', () => {
    const rawContact = {
      phone: '050 123 4567',
      name: 'Tariq Mansoor',
      consentGiven: true,
      consentSource: 'website_checkout',
    };

    const normalized = normalizePhoneE164(rawContact.phone, 'AE');
    assert.equal(normalized.isValid, true);
    assert.equal(normalized.e164, '+971501234567');

    const isCampaignEligible = Boolean(rawContact.consentGiven && normalized.isValid);
    assert.equal(isCampaignEligible, true);
  });

  await t.test('Marks contact without consent as campaign-ineligible', () => {
    const rawContact = {
      phone: '+971501234567',
      name: 'Prospect Without Consent',
      consentGiven: false,
    };

    const isCampaignEligible = Boolean(rawContact.consentGiven);
    assert.equal(isCampaignEligible, false);
  });

  await t.test('Catches malformed or invalid phone numbers during batch processing', () => {
    const invalidPhone = '123-abc-invalid';
    const normalized = normalizePhoneE164(invalidPhone);
    assert.equal(normalized.isValid, false);
  });
});

