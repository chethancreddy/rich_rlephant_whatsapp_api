// ============================================================================
// Unit Tests: Subscription Billing, Agency Hierarchy & White-Labeling
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTenantInvoice } from '../../src/lib/services/billing-service.ts';
import {
  authorizeAgencyDelegation,
  listAgencyWorkspaces,
} from '../../src/lib/services/agency-service.ts';
import {
  isValidHexColor,
  verifyCustomDomainCNAME,
} from '../../src/lib/services/branding-service.ts';

test('Billing Engine - SaaS Subscription & Meta Pass-Through Costs', (t) => {
  // Test Case: Growth Plan ($149/mo, 25,000 included contacts)
  // Active contacts: 30,000 (5,000 overage at $0.005/contact = $25.00)
  // Usage:
  // - UAE Marketing: 10,000 messages * $0.0385 = $385.00
  // - India Utility: 20,000 messages * $0.0042 = $84.00
  // Expected Total Meta: $469.00
  // Expected Total Due: $149 + $25 + $469 = $643.00

  const invoice = calculateTenantInvoice({
    tenantId: 'tenant_growth_01',
    planTier: 'growth',
    activeContactsCount: 30000,
    messageUsage: [
      { countryCode: 'AE', category: 'marketing', count: 10000 },
      { countryCode: 'IN', category: 'utility', count: 20000 },
    ],
  });

  assert.equal(invoice.planName, 'Growth Business');
  assert.equal(invoice.subscriptionFee, 149);
  assert.equal(invoice.billableOverageContacts, 5000);
  assert.equal(invoice.contactOverageCost, 25.0);
  assert.equal(invoice.metaPassThroughCost, 469.0);
  assert.equal(invoice.totalDue, 643.0);
  assert.equal(invoice.currency, 'USD');
  assert.equal(invoice.itemizedMetaCharges.length, 2);
});

test('Billing Engine - Zero Overages Within Plan Limit', (t) => {
  const invoice = calculateTenantInvoice({
    tenantId: 'tenant_starter_01',
    planTier: 'starter',
    activeContactsCount: 4200, // Within 5,000 limit
    messageUsage: [],
  });

  assert.equal(invoice.subscriptionFee, 49);
  assert.equal(invoice.billableOverageContacts, 0);
  assert.equal(invoice.contactOverageCost, 0);
  assert.equal(invoice.metaPassThroughCost, 0);
  assert.equal(invoice.totalDue, 49);
});

test('Agency Multi-Tenant Delegation & Strict Isolation', (t) => {
  const managedTenants = [
    {
      id: 'tenant_alpha',
      agencyId: 'agency_dubai',
      companyName: 'Alpha Retail',
      createdAt: '2026-01-01',
      status: 'active',
      contactCount: 5000,
    },
    {
      id: 'tenant_beta_suspended',
      agencyId: 'agency_dubai',
      companyName: 'Beta Suspended',
      createdAt: '2026-01-01',
      status: 'suspended',
      contactCount: 1000,
    },
    {
      id: 'tenant_gamma_foreign',
      agencyId: 'agency_other',
      companyName: 'Gamma Other',
      createdAt: '2026-01-01',
      status: 'active',
      contactCount: 2000,
    },
  ];

  // 1. Authorizes valid managed client workspace
  const resValid = authorizeAgencyDelegation('agency_dubai', 'tenant_alpha', managedTenants);
  assert.equal(resValid.authorized, true);
  assert.ok(resValid.delegationContext);
  assert.equal(resValid.delegationContext.targetTenantId, 'tenant_alpha');
  assert.equal(resValid.delegationContext.delegatedRole, 'tenant_admin');

  // 2. Denies delegation into client belonging to ANOTHER agency (cross-tenant security)
  const resForeign = authorizeAgencyDelegation('agency_dubai', 'tenant_gamma_foreign', managedTenants);
  assert.equal(resForeign.authorized, false);
  assert.match(resForeign.error, /Unauthorized delegation attempt/);

  // 3. Denies delegation into suspended client workspace
  const resSuspended = authorizeAgencyDelegation('agency_dubai', 'tenant_beta_suspended', managedTenants);
  assert.equal(resSuspended.authorized, false);
  assert.match(resSuspended.error, /suspended/);

  // 4. Filters list strictly by agency
  const agencyList = listAgencyWorkspaces('agency_dubai', managedTenants);
  assert.equal(agencyList.length, 2);
  assert.ok(!agencyList.some(t => t.id === 'tenant_gamma_foreign'));
});

test('White-Label Branding & Custom Domain CNAME Check', (t) => {
  // Color validation
  assert.equal(isValidHexColor('#72A4F2'), true);
  assert.equal(isValidHexColor('#202020'), true);
  assert.equal(isValidHexColor('#FFF'), true);
  assert.equal(isValidHexColor('rgb(0,0,0)'), false);
  assert.equal(isValidHexColor('not-a-color'), false);

  // CNAME check with matching DNS
  const dnsRecords = {
    'whatsapp.acme-agency.com': 'cname.rich-rlephant.com',
    'wrong-cname.example.com': 'unrelated.server.com',
  };

  const verified = verifyCustomDomainCNAME('whatsapp.acme-agency.com', 'cname.rich-rlephant.com', dnsRecords);
  assert.equal(verified.verified, true);

  const failed = verifyCustomDomainCNAME('wrong-cname.example.com', 'cname.rich-rlephant.com', dnsRecords);
  assert.equal(failed.verified, false);
  assert.match(failed.message, /CNAME check failed/);
});

