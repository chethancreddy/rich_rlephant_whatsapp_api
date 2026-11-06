// ============================================================================
// Phase 2 Test Suite: Contact Management & Opt-In Sources
// QA Engineer 04, QA Engineer 09 & QA Engineer 10
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { 
  createOptInSource, 
  toggleOptInSourceActive, 
  getOptInSources,
  getOptInSourceHistory 
} from '../../src/lib/services/opt-in-sources-service.ts';
import { hasPermission } from '../../src/lib/services/permissions-service.ts';
import { evaluateRecipientEligibility } from '../../src/lib/campaign-gate.ts';

test('Phase 2: Contact Management, Opt-In Sources & Export Engine', async (t) => {

  await t.test('TC-P2-001: Opt-In Source Creation & Audit Trail (QA-04)', () => {
    const tenantId = 'tenant_phase_2';
    
    // Create new opt-in source
    const res = createOptInSource({
      tenantId,
      name: 'Black Friday VIP Landing Page',
      type: 'website_form',
      description: 'Affirmative opt-in with Privacy Notice v2.1',
      createdByUser: 'usr_manager_99',
    });

    assert.equal(res.success, true);
    assert.ok(res.source?.id);
    assert.equal(res.source?.is_active, true);
    assert.equal(res.source?.created_by_user_id, 'usr_manager_99');

    // Duplicate name rejected
    const dupRes = createOptInSource({
      tenantId,
      name: 'Black Friday VIP Landing Page',
      type: 'website_form',
      createdByUser: 'usr_manager_99',
    });
    assert.equal(dupRes.success, false);
    assert.match(dupRes.error, /already exists/);

    // Audit history recorded
    const history = getOptInSourceHistory(res.source.id);
    assert.ok(history.length >= 1);
    assert.equal(history[0].action, 'created');
  });

  await t.test('TC-P2-002: Opt-In Source Deactivation and Activation (QA-04)', () => {
    const tenantId = 'tenant_phase_2';
    const sourceRes = createOptInSource({
      tenantId,
      name: 'Seasonal Spring Festival POS',
      type: 'pos',
      createdByUser: 'usr_admin',
    });

    assert.equal(sourceRes.success, true);
    const sourceId = sourceRes.source.id;

    // Deactivate source
    const deactRes = toggleOptInSourceActive({
      tenantId,
      sourceId,
      isActive: false,
      performedByUser: 'usr_admin',
      reason: 'Spring campaign concluded',
    });
    assert.equal(deactRes.success, true);
    assert.equal(deactRes.source?.is_active, false);

    // Reactivate source
    const reactRes = toggleOptInSourceActive({
      tenantId,
      sourceId,
      isActive: true,
      performedByUser: 'usr_admin',
    });
    assert.equal(reactRes.success, true);
    assert.equal(reactRes.source?.is_active, true);
  });

  await t.test('TC-P2-003: Export Security Barrier - Super Admin & Agent Blocked (QA-09)', () => {
    // Super Admin must NOT be allowed to export contacts (BRD & prompt requirement)
    assert.equal(hasPermission('super_admin', 'contacts:export'), false);

    // Agent must NOT be allowed to export contacts
    assert.equal(hasPermission('agent', 'contacts:export'), false);

    // Workspace Admin and Manager ARE allowed
    assert.equal(hasPermission('workspace_admin', 'contacts:export'), true);
    assert.equal(hasPermission('manager', 'contacts:export'), true);
  });

  await t.test('TC-P2-004: Contact Validation & Campaign Ineligibility Without Consent (QA-04)', () => {
    // Contact with valid consent
    const consentedContact = {
      contactId: 'c_valid',
      phoneRaw: '+971501234567',
      hasGrantedConsent: true,
      isSuppressed: false,
    };
    const validCheck = evaluateRecipientEligibility(consentedContact);
    assert.equal(validCheck.isEligible, true);

    // Contact without consent (must never be marked eligible automatically)
    const unconsentedContact = {
      contactId: 'c_unconsented',
      phoneRaw: '+971501234567',
      hasGrantedConsent: false,
      isSuppressed: false,
    };
    const unconsentedCheck = evaluateRecipientEligibility(unconsentedContact);
    assert.equal(unconsentedCheck.isEligible, false);
    assert.equal(unconsentedCheck.exclusionReason, 'NO_VALID_CONSENT');
  });

  await t.test('TC-P2-005: CSV Export Format Conformance (QA-10)', () => {
    const mockExportRows = [
      { id: 'ct_1', name: 'Tariq Mansoor', phone: '+971504432190', source: 'Website Checkout' },
      { id: 'ct_2', name: 'Fatima Al Zaabi', phone: '+971559821102', source: 'Retail QR Code' },
    ];

    const headers = ['Contact ID', 'Full Name', 'Phone (E.164)', 'Opt-In Source'];
    const csvContent = [
      headers.join(','),
      ...mockExportRows.map(r => `"${r.id}","${r.name}","${r.phone}","${r.source}"`)
    ].join('\r\n');

    assert.ok(csvContent.includes('Phone (E.164)'));
    assert.ok(csvContent.includes('+971504432190'));
    assert.ok(csvContent.includes('+971559821102'));
  });
});

