// ============================================================================
// Phase 3 Test Suite: Meta Template Builder & Approval Lifecycle
// QA Engineer 03 (Meta Cloud API Specialist)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { 
  validateTemplateDraft, 
  createTemplate, 
  duplicateTemplate, 
  deleteTemplate, 
  getTemplates 
} from '../../src/lib/services/template-builder-service.ts';

test('Phase 3: Meta Template Builder & Validation Lifecycle (QA-03)', async (t) => {

  await t.test('TC-P3-001: Template Name Validation Rules', () => {
    // Valid name: lowercase, numbers, underscores
    const valid = validateTemplateDraft({
      tenantId: 't1',
      name: 'order_status_update_v2',
      category: 'UTILITY',
      language: 'en',
      bodyText: 'Hello {{1}}, order #{{2}} is on its way.',
      sampleValues: ['Tariq', 'ORD-991'],
      createdByUser: 'u1',
    });
    assert.equal(valid.valid, true);
    assert.equal(valid.errors.length, 0);

    // Invalid name with spaces and uppercase
    const invalid = validateTemplateDraft({
      tenantId: 't1',
      name: 'Order Status Update!',
      category: 'UTILITY',
      language: 'en',
      bodyText: 'Hello world',
      createdByUser: 'u1',
    });
    assert.equal(invalid.valid, false);
    assert.match(invalid.errors[0], /lowercase alphanumeric/);
  });

  await t.test('TC-P3-002: Sequential Variable & Sample Values Enforcement', () => {
    // Non-sequential variables: {{2}} used without {{1}}
    const nonSequential = validateTemplateDraft({
      tenantId: 't1',
      name: 'broken_var_tmpl',
      category: 'MARKETING',
      language: 'en',
      bodyText: 'Hi, your coupon is {{2}}.',
      sampleValues: ['COUPON20'],
      createdByUser: 'u1',
    });
    assert.equal(nonSequential.valid, false);
    assert.match(nonSequential.errors[0], /Missing variable \{\{1\}\}/);

    // Missing sample values for variables
    const missingSamples = validateTemplateDraft({
      tenantId: 't1',
      name: 'missing_samples_tmpl',
      category: 'MARKETING',
      language: 'en',
      bodyText: 'Hello {{1}}, code is {{2}}.',
      sampleValues: ['OnlyOneSample'], // needs 2
      createdByUser: 'u1',
    });
    assert.equal(missingSamples.valid, false);
    assert.match(missingSamples.errors[0], /sample values for all 2 variables/);
  });

  await t.test('TC-P3-003: In-Dashboard Template Creation & PENDING State', () => {
    const tenantId = 'tenant_p3_test';
    const res = createTemplate({
      tenantId,
      name: 'ramadan_vip_promotion_v1',
      category: 'MARKETING',
      language: 'en',
      headerType: 'TEXT',
      headerText: 'Exclusive VIP Offer',
      bodyText: 'Greetings {{1}}! Use code {{2}} for 30% off your purchase.',
      footerText: 'Reply STOP to opt out',
      buttons: [
        { type: 'QUICK_REPLY', text: 'Claim Offer' },
        { type: 'URL', text: 'Visit Website', url: 'https://richrlephant.com' }
      ],
      sampleValues: ['Sarah', 'RAMADAN30'],
      createdByUser: 'usr_admin',
    });

    assert.equal(res.success, true);
    assert.ok(res.template?.id);
    assert.equal(res.template?.status, 'PENDING'); // Meta approval requirement
    assert.equal(res.template?.variableCount, 2);
    assert.equal(res.template?.buttons.length, 2);
  });

  await t.test('TC-P3-004: Template Duplication & Deletion', () => {
    const tenantId = 'tenant_p3_test';
    const templates = getTemplates(tenantId);
    const target = templates[0];
    assert.ok(target);

    // Duplicate
    const dupRes = duplicateTemplate(tenantId, target.id);
    assert.equal(dupRes.success, true);
    assert.ok(dupRes.template?.name.includes('copy'));
    assert.equal(dupRes.template?.status, 'PENDING');

    // Delete duplicated copy
    const delRes = deleteTemplate(tenantId, dupRes.template.id);
    assert.equal(delRes.success, true);
  });

  await t.test('TC-P3-005: Meta Rejection Reason Display', () => {
    const defaultTemplates = getTemplates('tenant_default');
    const rejectedTmpl = defaultTemplates.find(t => t.status === 'REJECTED');
    assert.ok(rejectedTmpl);
    assert.ok(rejectedTmpl.rejectionReason);
    assert.match(rejectedTmpl.rejectionReason, /INCORRECT_CATEGORY/);
  });
});

