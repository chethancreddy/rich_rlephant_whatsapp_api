// ============================================================================
// API Route: /api/contacts/opt-in-sources/[id]
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextResponse } from 'next/server';
import { toggleOptInSourceActive, getOptInSourceHistory } from '@/lib/services/opt-in-sources-service';
import { hasPermission } from '@/lib/services/permissions-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const history = getOptInSourceHistory(id);
  return NextResponse.json({ sourceId: id, history });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tenantId = 'tenant_default', isActive, userRole = 'workspace_admin', reason } = body;

    if (userRole === 'super_admin' || !hasPermission(userRole, 'contacts:manage_sources')) {
      return NextResponse.json(
        { error: 'FORBIDDEN: User role does not have permission to modify opt-in sources.' },
        { status: 403 }
      );
    }

    const result = toggleOptInSourceActive({
      tenantId,
      sourceId: id,
      isActive: Boolean(isActive),
      performedByUser: 'usr_current',
      reason,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, source: result.source });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

