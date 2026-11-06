// ============================================================================
// API Route: /api/contacts/opt-in-sources
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextResponse } from 'next/server';
import { getOptInSources, createOptInSource } from '@/lib/services/opt-in-sources-service';
import { hasPermission } from '@/lib/services/permissions-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default';

  const sources = getOptInSources(tenantId);
  return NextResponse.json({ sources, count: sources.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId = 'tenant_default', name, type, description, userRole = 'workspace_admin' } = body;

    // RBAC Guard: Super Admin cannot manage tenant opt-in sources; Workspace Admin and Manager can
    if (userRole === 'super_admin' || !hasPermission(userRole, 'contacts:manage_sources')) {
      return NextResponse.json(
        { error: 'FORBIDDEN: User role does not have permission to manage opt-in sources.' },
        { status: 403 }
      );
    }

    const result = createOptInSource({
      tenantId,
      name,
      type,
      description,
      createdByUser: 'usr_current',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, source: result.source }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

