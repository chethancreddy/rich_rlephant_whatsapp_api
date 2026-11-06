// ============================================================================
// Agency Multi-Tenant Management & Delegation Endpoint
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  authorizeAgencyDelegation,
  listAgencyWorkspaces,
  type ManagedTenant,
} from '@/lib/services/agency-service';

// Mock multi-tenant database for agency portfolio
const mockManagedTenants: ManagedTenant[] = [
  {
    id: 'tenant_client_alpha',
    agencyId: 'agency_dubai_growth',
    companyName: 'Alpha Real Estate Dubai',
    createdAt: '2026-08-15T00:00:00Z',
    status: 'active',
    whatsappPhoneNumber: '+971501112233',
    contactCount: 14200,
  },
  {
    id: 'tenant_client_beta',
    agencyId: 'agency_dubai_growth',
    companyName: 'Beta Luxury Auto Spa',
    createdAt: '2026-09-01T00:00:00Z',
    status: 'active',
    whatsappPhoneNumber: '+971504445566',
    contactCount: 6800,
  },
  {
    id: 'tenant_client_gamma',
    agencyId: 'agency_dubai_growth',
    companyName: 'Gamma Hospitality',
    createdAt: '2026-10-10T00:00:00Z',
    status: 'suspended',
    whatsappPhoneNumber: '+971507778899',
    contactCount: 2200,
  },
  {
    id: 'tenant_other_agency',
    agencyId: 'agency_other_holding',
    companyName: 'Foreign Brand',
    createdAt: '2026-10-01T00:00:00Z',
    status: 'active',
    contactCount: 500,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId') || 'agency_dubai_growth';

  const workspaces = listAgencyWorkspaces(agencyId, mockManagedTenants);

  return NextResponse.json({
    success: true,
    agencyId,
    total: workspaces.length,
    workspaces,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { agencyId = 'agency_dubai_growth', targetTenantId } = body;

  const authResult = authorizeAgencyDelegation(agencyId, targetTenantId, mockManagedTenants);

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error, code: 'DELEGATION_DENIED' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    delegation: authResult.delegationContext,
    message: `Delegated session successfully established for workspace ${targetTenantId}`,
  });
}

