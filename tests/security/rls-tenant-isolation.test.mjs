// ============================================================================
// Security Audit & Cross-Tenant RLS Boundary Penetration Suite
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

// Simulated Supabase RLS Policy Evaluator replicating 009_rls_security_policies.sql
function evaluateRLSAccess(context, targetRecord, action) {
  const { userId, role, tenantId, isSuperAdmin, accessibleTenants = [] } = context;

  // 1. Super Admin bypass (matches auth.is_super_admin() policy in 009_rls_security_policies.sql)
  if (isSuperAdmin) {
    return { allowed: true, reason: 'SUPER_ADMIN_GLOBAL_ACCESS' };
  }

  // 2. Cross-Tenant Barrier (tenant_id mismatch)
  if (targetRecord.tenant_id) {
    // Check if user belongs to this tenant or is agency delegated
    const isDirectMember = tenantId === targetRecord.tenant_id;
    const hasAgencyAccess = accessibleTenants.includes(targetRecord.tenant_id);

    if (!isDirectMember && !hasAgencyAccess) {
      return {
        allowed: false,
        reason: 'RLS_SECURITY_VIOLATION: Cross-tenant access strictly denied by tenant_isolation_policy',
      };
    }
  }

  // 3. Sensitive Table Scopes (API keys & Webhook secrets require 'tenant_admin' or 'agency_admin')
  if (targetRecord.table === 'api_keys' || targetRecord.table === 'webhook_endpoints') {
    const adminRoles = ['tenant_admin', 'agency_admin', 'super_admin'];
    if (!adminRoles.includes(role)) {
      return {
        allowed: false,
        reason: `ROLE_SECURITY_VIOLATION: ${targetRecord.table} requires admin privileges. Current role: ${role}`,
      };
    }
  }

  // 4. Suppression List Immutable Protection (Delete not permitted by standard agents)
  if (targetRecord.table === 'suppression_entries' && action === 'DELETE') {
    if (role !== 'super_admin' && role !== 'tenant_admin') {
      return {
        allowed: false,
        reason: 'COMPLIANCE_LOCK: Suppression records cannot be deleted by standard agents',
      };
    }
  }

  return { allowed: true, reason: 'ACCESS_GRANTED' };
}

test('Security Audit - Strict Tenant Isolation (RLS)', (t) => {
  const tenantAContext = {
    userId: 'usr_alpha_agent',
    role: 'agent',
    tenantId: 'tenant_alpha',
    isSuperAdmin: false,
    accessibleTenants: ['tenant_alpha'],
  };

  const tenantBContact = {
    table: 'contacts',
    id: 'cnt_secret_beta',
    tenant_id: 'tenant_beta',
    name: 'Confidential Client B',
    phone: '+971509998877',
  };

  const tenantAContact = {
    table: 'contacts',
    id: 'cnt_alpha_normal',
    tenant_id: 'tenant_alpha',
    name: 'Normal Client A',
    phone: '+971501112233',
  };

  // Attack Vector 1: Tenant A attempts to read Tenant B contact
  const breachAttempt = evaluateRLSAccess(tenantAContext, tenantBContact, 'SELECT');
  assert.equal(breachAttempt.allowed, false);
  assert.match(breachAttempt.reason, /Cross-tenant access strictly denied/);

  // Normal Vector: Tenant A reads Tenant A contact
  const authorizedRead = evaluateRLSAccess(tenantAContext, tenantAContact, 'SELECT');
  assert.equal(authorizedRead.allowed, true);
  assert.equal(authorizedRead.reason, 'ACCESS_GRANTED');
});

test('Security Audit - Sensitive Credential & API Key Protection', (t) => {
  const agentContext = {
    userId: 'usr_agent_01',
    role: 'agent',
    tenantId: 'tenant_alpha',
    isSuperAdmin: false,
    accessibleTenants: ['tenant_alpha'],
  };

  const adminContext = {
    userId: 'usr_admin_01',
    role: 'tenant_admin',
    tenantId: 'tenant_alpha',
    isSuperAdmin: false,
    accessibleTenants: ['tenant_alpha'],
  };

  const apiKeyRecord = {
    table: 'api_keys',
    id: 'key_live_001',
    tenant_id: 'tenant_alpha',
    key_prefix: 'rlep_live_',
  };

  // Agent cannot access API credentials
  const agentAttempt = evaluateRLSAccess(agentContext, apiKeyRecord, 'SELECT');
  assert.equal(agentAttempt.allowed, false);
  assert.match(agentAttempt.reason, /requires admin privileges/);

  // Tenant admin can access API credentials
  const adminAttempt = evaluateRLSAccess(adminContext, apiKeyRecord, 'SELECT');
  assert.equal(adminAttempt.allowed, true);
});

test('Security Audit - Super Admin Operational Auditing & Delegation', (t) => {
  const superAdminContext = {
    userId: 'usr_super_root',
    role: 'super_admin',
    tenantId: 'system_root',
    isSuperAdmin: true,
  };

  const anyTenantJob = {
    table: 'outbox_jobs',
    id: 'job_queue_999',
    tenant_id: 'tenant_random_xyz',
  };

  const superAdminAccess = evaluateRLSAccess(superAdminContext, anyTenantJob, 'SELECT');
  assert.equal(superAdminAccess.allowed, true);
  assert.equal(superAdminAccess.reason, 'SUPER_ADMIN_GLOBAL_ACCESS');
});

test('Security Audit - Agency Cross-Tenant Boundary Check', (t) => {
  const agencyContext = {
    userId: 'usr_agency_manager',
    role: 'agency_admin',
    tenantId: 'agency_workspace',
    isSuperAdmin: false,
    accessibleTenants: ['tenant_client_1', 'tenant_client_2'],
  };

  const authorizedClientRecord = {
    table: 'campaigns',
    id: 'cmp_client_1',
    tenant_id: 'tenant_client_1',
  };

  const foreignClientRecord = {
    table: 'campaigns',
    id: 'cmp_foreign_client',
    tenant_id: 'tenant_client_3', // Not in accessibleTenants
  };

  assert.equal(evaluateRLSAccess(agencyContext, authorizedClientRecord, 'SELECT').allowed, true);
  assert.equal(evaluateRLSAccess(agencyContext, foreignClientRecord, 'SELECT').allowed, false);
});

