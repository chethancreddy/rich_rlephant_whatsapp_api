// ============================================================================
// Role-Based Access Control (RBAC) & Ownership Permission Service
// Product: Rich Rlephant Marketing Whatsapp API
// Phase 1 Foundation
// ============================================================================

import type { MembershipRole } from '../../types/domain.ts';

export type AppPermission =
  | 'super_admin:manage_all'
  | 'workspace:manage_settings'
  | 'workspace:manage_billing'
  | 'team:manage_members'
  | 'contacts:import'
  | 'contacts:export'
  | 'contacts:manage_sources'
  | 'templates:manage'
  | 'campaigns:create'
  | 'campaigns:execute'
  | 'inbox:view_all'
  | 'inbox:reply'
  | 'inbox:assign'
  | 'api_keys:manage';

export const ROLE_PERMISSIONS: Record<MembershipRole, AppPermission[]> = {
  super_admin: [
    'super_admin:manage_all',
    'workspace:manage_settings',
    'workspace:manage_billing',
    'team:manage_members',
    'inbox:view_all',
  ],
  workspace_admin: [
    'workspace:manage_settings',
    'workspace:manage_billing',
    'team:manage_members',
    'contacts:import',
    'contacts:export',
    'contacts:manage_sources',
    'templates:manage',
    'campaigns:create',
    'campaigns:execute',
    'inbox:view_all',
    'inbox:reply',
    'inbox:assign',
    'api_keys:manage',
  ],
  manager: [
    'team:manage_members',
    'contacts:import',
    'contacts:export',
    'contacts:manage_sources',
    'templates:manage',
    'campaigns:create',
    'campaigns:execute',
    'inbox:view_all',
    'inbox:reply',
    'inbox:assign',
  ],
  campaign_manager: [
    'contacts:import',
    'contacts:export',
    'contacts:manage_sources',
    'templates:manage',
    'campaigns:create',
    'campaigns:execute',
  ],
  agent: [
    'inbox:reply',
    'inbox:assign',
  ],
  agency_owner: [
    'workspace:manage_settings',
    'workspace:manage_billing',
    'team:manage_members',
    'contacts:import',
    'contacts:export',
    'campaigns:create',
    'campaigns:execute',
    'inbox:view_all',
    'inbox:reply',
  ],
  workspace_owner: [
    'workspace:manage_settings',
    'workspace:manage_billing',
    'team:manage_members',
    'contacts:import',
    'contacts:export',
    'contacts:manage_sources',
    'templates:manage',
    'campaigns:create',
    'campaigns:execute',
    'inbox:view_all',
    'inbox:reply',
    'inbox:assign',
    'api_keys:manage',
  ],
  team_lead: [
    'inbox:view_all',
    'inbox:reply',
    'inbox:assign',
    'contacts:manage_sources',
  ],
  automation_builder: [
    'templates:manage',
    'campaigns:create',
  ],
  developer: [
    'api_keys:manage',
    'templates:manage',
  ],
  billing_viewer: [
    'workspace:manage_billing',
  ],
  compliance_auditor: [
    'contacts:manage_sources',
    'inbox:view_all',
  ],
};

/**
 * Checks if a given role has a required permission
 */
export function hasPermission(role: MembershipRole, permission: AppPermission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Validates entity ownership and modification permissions
 */
export function canModifyEntity(params: {
  userRole: MembershipRole;
  userTenantId: string;
  entityTenantId: string;
  entityOwnerUserId?: string;
  currentUserId: string;
}): { allowed: boolean; reason?: string } {
  const { userRole, userTenantId, entityTenantId, entityOwnerUserId, currentUserId } = params;

  // 1. Strict tenant boundary barrier
  if (userRole !== 'super_admin' && userTenantId !== entityTenantId) {
    return {
      allowed: false,
      reason: 'CROSS_TENANT_VIOLATION: User belongs to a different tenant workspace.',
    };
  }

  // 2. Super Admin can manage all platform entities
  if (userRole === 'super_admin') {
    return { allowed: true };
  }

  // 3. Workspace Admin can manage any entity within their tenant
  if (userRole === 'workspace_admin' || userRole === 'workspace_owner') {
    return { allowed: true };
  }

  // 4. Manager can manage entities within their tenant
  if (userRole === 'manager') {
    return { allowed: true };
  }

  // 5. Agent can only modify their own created entities or assigned records
  if (entityOwnerUserId && entityOwnerUserId === currentUserId) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'INSUFFICIENT_PERMISSIONS: Agents cannot modify records created by other users.',
  };
}

