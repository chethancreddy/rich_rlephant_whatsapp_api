import test from 'node:test';
import assert from 'node:assert/strict';

// Import phone normalizer logic
import { normalizePhoneE164 } from '../../src/lib/phone-normalizer.ts';

test('Phone Normalizer - E.164 Standards', async (t) => {
  await t.test('Normalizes UAE mobile numbers with local 05 prefix', () => {
    const res = normalizePhoneE164('050 123 4567', 'AE');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+971501234567');
    assert.equal(res.countryCode, 'AE');
  });

  await t.test('Normalizes UAE numbers without leading zero', () => {
    const res = normalizePhoneE164('559821102', 'AE');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+971559821102');
    assert.equal(res.countryCode, 'AE');
  });

  await t.test('Normalizes International E.164 numbers', () => {
    const res = normalizePhoneE164('+91 98765-43210');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
    assert.equal(res.countryCode, 'IN');
  });

  await t.test('Normalizes US numbers with 10 digits', () => {
    const res = normalizePhoneE164('(415) 555-2671', 'US');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+14155552671');
    assert.equal(res.countryCode, 'US');
  });

  await t.test('Rejects invalid phone numbers containing non-numeric characters', () => {
    const res = normalizePhoneE164('not_a_phone_number');
    assert.equal(res.isValid, false);
    assert.equal(res.e164, '');
  });

  await t.test('Rejects numbers outside 7-15 digits range', () => {
    const res = normalizePhoneE164('+12345'); // only 5 digits
    assert.equal(res.isValid, false);
  });
});

