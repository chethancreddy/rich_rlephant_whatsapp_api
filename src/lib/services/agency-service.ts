// ============================================================================
// Agency Multi-Tenant Hierarchy & Workspace Delegation Service
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

export interface Agency {
  id: string;
  name: string;
  tier: 'silver' | 'gold' | 'platinum';
  maxClientWorkspaces: number;
  contactEmail: string;
}

export interface ManagedTenant {
  id: string;
  agencyId: string;
  companyName: string;
  createdAt: string;
  status: 'active' | 'suspended';
  whatsappPhoneNumber?: string;
  contactCount: number;
}

export interface AgencyDelegationContext {
  agencyId: string;
  targetTenantId: string;
  delegatedRole: 'tenant_admin';
  authorizedAt: string;
  expiresAt: string;
}

/**
 * Validates whether an agency user is authorized to delegate into a client tenant workspace
 */
export function authorizeAgencyDelegation(
  agencyId: string,
  targetTenantId: string,
  managedWorkspaces: ManagedTenant[]
): { authorized: boolean; error?: string; delegationContext?: AgencyDelegationContext } {
  if (!agencyId || !targetTenantId) {
    return { authorized: false, error: 'Agency ID and Target Tenant ID are required' };
  }

  // Look up if target tenant belongs to this agency
  const tenant = managedWorkspaces.find(
    w => w.id === targetTenantId && w.agencyId === agencyId
  );

  if (!tenant) {
    return {
      authorized: false,
      error: 'SECURITY_ALERT: Unauthorized delegation attempt. Target tenant is not managed by your agency.',
    };
  }

  if (tenant.status === 'suspended') {
    return {
      authorized: false,
      error: 'Target tenant workspace is currently suspended.',
    };
  }

  const now = Date.now();
  const expiresAt = new Date(now + 4 * 60 * 60 * 1000).toISOString(); // 4-hour delegation token

  return {
    authorized: true,
    delegationContext: {
      agencyId,
      targetTenantId,
      delegatedRole: 'tenant_admin',
      authorizedAt: new Date(now).toISOString(),
      expiresAt,
    },
  };
}

/**
 * Filters managed tenants by agency ID to guarantee tenant isolation between agencies
 */
export function listAgencyWorkspaces(
  agencyId: string,
  allTenants: ManagedTenant[]
): ManagedTenant[] {
  return allTenants.filter(t => t.agencyId === agencyId);
}

