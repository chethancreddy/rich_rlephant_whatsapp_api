// ============================================================================
// API Route: /api/templates/[id]/duplicate
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextResponse } from 'next/server';
import { duplicateTemplate } from '@/lib/services/template-builder-service';
import { hasPermission } from '@/lib/services/permissions-service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { tenantId = 'tenant_default', userRole = 'workspace_admin' } = body;

    if (!hasPermission(userRole, 'templates:manage')) {
      return NextResponse.json(
        { error: 'FORBIDDEN: User does not have permission to duplicate message templates.' },
        { status: 403 }
      );
    }

    const result = duplicateTemplate(tenantId, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, template: result.template }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

