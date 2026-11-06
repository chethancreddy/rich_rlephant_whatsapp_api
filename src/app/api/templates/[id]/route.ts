// ============================================================================
// API Route: /api/templates/[id]
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextResponse } from 'next/server';
import { deleteTemplate } from '@/lib/services/template-builder-service';
import { hasPermission } from '@/lib/services/permissions-service';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'tenant_default';
    const userRole = searchParams.get('userRole') || 'workspace_admin';

    if (!hasPermission(userRole as any, 'templates:manage')) {
      return NextResponse.json(
        { error: 'FORBIDDEN: User does not have permission to delete message templates.' },
        { status: 403 }
      );
    }

    const result = deleteTemplate(tenantId, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

