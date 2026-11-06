// ============================================================================
// Unit & Integration Tests: Super Admin Plan Upgrade & Password Security
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  upgradeCustomerPlan,
  getCustomerSubscriptionOverview,
  activeSubscriptionsStore,
  subscriptionHistoryStore,
  DETAILED_PLANS,
} from '../../src/lib/services/subscription-service.ts';
import {
  initiateCustomerPasswordReset,
  validatePasswordResetToken,
} from '../../src/lib/services/password-reset-service.ts';

test('Super Admin - Customer Plan Upgrade & Entitlements', (t) => {
  const tenantId = 'tenant_test_upgrade_01';

  // 1. Initial plan is starter ($49/mo)
  const overviewBefore = getCustomerSubscriptionOverview(tenantId);
  assert.equal(overviewBefore.subscription.planCode, 'starter');
  assert.equal(overviewBefore.subscription.priceUsd, 49);

  // 2. Super Admin executes plan upgrade to Growth ($149/mo)
  const upgradeResult = upgradeCustomerPlan({
    tenantId,
    targetPlanCode: 'growth',
    performedBy: 'usr_super_admin_chief',
    performerEmail: 'chief-admin@rich-rlephant.com',
    effectiveImmediately: true,
    notes: 'Approved enterprise expansion',
  });

  assert.equal(upgradeResult.success, true);
  assert.equal(upgradeResult.previousPlan.id, 'starter');
  assert.equal(upgradeResult.newPlan.id, 'growth');
  assert.equal(upgradeResult.newPlan.monthlyFee, 149);
  assert.equal(upgradeResult.subscription.planCode, 'growth');
  assert.equal(upgradeResult.subscription.priceUsd, 149);

  // 3. Verify immediate entitlement provisioning
  assert.equal(upgradeResult.newPlan.entitlements.maxContacts, 25000);
  assert.equal(upgradeResult.newPlan.entitlements.aiCopilotEnabled, true);

  // 4. Verify immutable subscription history entry
  assert.ok(upgradeResult.historyEntry);
  assert.equal(upgradeResult.historyEntry.oldPlanCode, 'starter');
  assert.equal(upgradeResult.historyEntry.newPlanCode, 'growth');
  assert.equal(upgradeResult.historyEntry.oldPriceUsd, 49);
  assert.equal(upgradeResult.historyEntry.newPriceUsd, 149);
  assert.equal(upgradeResult.historyEntry.performerEmail, 'chief-admin@rich-rlephant.com');
  assert.equal(upgradeResult.historyEntry.changeType, 'upgrade');

  // 5. Rejects invalid plan code
  const invalidResult = upgradeCustomerPlan({
    tenantId,
    targetPlanCode: 'platinum_ultra_invalid',
  });
  assert.equal(invalidResult.success, false);
  assert.match(invalidResult.error, /Invalid plan code/);
});

test('Super Admin - Customer Administrative Password Reset Security', (t) => {
  const tenantId = 'tenant_security_02';
  const targetEmail = 'ceo@clientcompany.ae';

  // 1. Super Admin dispatches password reset request
  const resetResult = initiateCustomerPasswordReset({
    tenantId,
    userId: 'usr_client_ceo',
    targetEmail,
    performedBy: 'usr_super_admin',
    performerEmail: 'admin@rich-rlephant.com',
    revokeExistingSessions: true,
  });

  assert.equal(resetResult.success, true);
  assert.equal(resetResult.status, 'dispatched');
  assert.equal(resetResult.targetEmail, targetEmail);
  assert.equal(resetResult.sessionsRevoked, true);
  assert.equal(resetResult.deliveryMethod, 'email_secure_link');
  assert.ok(resetResult.expiresAt);

  // Expiration check: Must expire in 60 minutes
  const expiryTime = new Date(resetResult.expiresAt).getTime();
  const createdTime = Date.now();
  const diffMinutes = Math.round((expiryTime - createdTime) / 60000);
  assert.equal(diffMinutes, 60);

  // 2. Security Check: Never outputs raw token or plaintext password in administrative return
  assert.equal(resetResult.token, undefined);
  assert.equal(resetResult.password, undefined);

  // 3. Rate limiting check: Max 3 requests per hour
  const res2 = initiateCustomerPasswordReset({ tenantId, userId: 'usr_client_ceo', targetEmail });
  const res3 = initiateCustomerPasswordReset({ tenantId, userId: 'usr_client_ceo', targetEmail });
  const res4_rate_limited = initiateCustomerPasswordReset({ tenantId, userId: 'usr_client_ceo', targetEmail });

  assert.equal(res2.success, true);
  assert.equal(res3.success, true);
  assert.equal(res4_rate_limited.success, false);
  assert.equal(res4_rate_limited.status, 'rate_limited');
  assert.match(res4_rate_limited.error, /RATE_LIMIT_EXCEEDED/);
});

