// ============================================================================
// Phase 1 Test Suite: Database, Tenant Ownership & Permissions
// QA Engineer 09 & QA Engineer 01
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { 
  hasPermission, 
  canModifyEntity, 
  ROLE_PERMISSIONS 
} from '../../src/lib/services/permissions-service.ts';

test('Phase 1: Database, Tenant Ownership & Permissions Matrix', async (t) => {

  await t.test('TC-P1-001: Strict Tenant Boundary Enforcement (QA-09)', () => {
    // Attempt modification across different tenants
    const result = canModifyEntity({
      userRole: 'workspace_admin',
      userTenantId: 'tenant_alpha',
      entityTenantId: 'tenant_beta',
      entityOwnerUserId: 'usr_beta_owner',
      currentUserId: 'usr_alpha_admin',
    });

    assert.equal(result.allowed, false);
    assert.match(result.reason, /CROSS_TENANT_VIOLATION/);
  });

  await t.test('TC-P1-002: Role Permission Entitlements - Super Admin vs Workspace Admin (QA-01)', () => {
    // Super Admin has global management
    assert.equal(hasPermission('super_admin', 'super_admin:manage_all'), true);
    assert.equal(hasPermission('super_admin', 'workspace:manage_billing'), true);

    // Super Admin does NOT have tenant file import/export (Strict Super Admin requirement)
    assert.equal(hasPermission('super_admin', 'contacts:import'), false);
    assert.equal(hasPermission('super_admin', 'contacts:export'), false);

    // Workspace Admin has tenant operations
    assert.equal(hasPermission('workspace_admin', 'contacts:import'), true);
    assert.equal(hasPermission('workspace_admin', 'contacts:export'), true);
    assert.equal(hasPermission('workspace_admin', 'contacts:manage_sources'), true);
    assert.equal(hasPermission('workspace_admin', 'api_keys:manage'), true);
  });

  await t.test('TC-P1-003: Manager Role Capabilities & Guardrails (QA-09)', () => {
    // Manager CAN manage campaigns, contacts, and opt-in sources
    assert.equal(hasPermission('manager', 'contacts:import'), true);
    assert.equal(hasPermission('manager', 'contacts:export'), true);
    assert.equal(hasPermission('manager', 'contacts:manage_sources'), true);
    assert.equal(hasPermission('manager', 'campaigns:create'), true);

    // Manager CANNOT modify billing or API keys
    assert.equal(hasPermission('manager', 'workspace:manage_billing'), false);
    assert.equal(hasPermission('manager', 'api_keys:manage'), false);
  });

  await t.test('TC-P1-004: Agent Role Restrictions (QA-09)', () => {
    // Agent can reply to inbox messages
    assert.equal(hasPermission('agent', 'inbox:reply'), true);
    assert.equal(hasPermission('agent', 'inbox:assign'), true);

    // Agent CANNOT export contacts, manage opt-in sources, or create campaigns
    assert.equal(hasPermission('agent', 'contacts:export'), false);
    assert.equal(hasPermission('agent', 'contacts:manage_sources'), false);
    assert.equal(hasPermission('agent', 'campaigns:create'), false);
  });

  await t.test('TC-P1-005: User Ownership Modification Barrier (created_by_user_id)', () => {
    // Agent modifying their own created record -> Allowed
    const selfModification = canModifyEntity({
      userRole: 'agent',
      userTenantId: 'tenant_dubai',
      entityTenantId: 'tenant_dubai',
      entityOwnerUserId: 'agent_123',
      currentUserId: 'agent_123',
    });
    assert.equal(selfModification.allowed, true);

    // Agent modifying another user's record -> Blocked
    const otherModification = canModifyEntity({
      userRole: 'agent',
      userTenantId: 'tenant_dubai',
      entityTenantId: 'tenant_dubai',
      entityOwnerUserId: 'agent_999',
      currentUserId: 'agent_123',
    });
    assert.equal(otherModification.allowed, false);
    assert.match(otherModification.reason, /INSUFFICIENT_PERMISSIONS/);
  });
});

