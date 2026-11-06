// ============================================================================
// API Route: /api/templates
// Product: Rich Rlephant Marketing Whatsapp API
// Phase 3 Implementation: In-App Template Creation & Synchronization
// ============================================================================

import { NextResponse } from 'next/server';
import { getTemplates, createTemplate } from '@/lib/services/template-builder-service';
import { hasPermission } from '@/lib/services/permissions-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default';

  const templates = getTemplates(tenantId);
  return NextResponse.json({ templates, count: templates.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tenantId = 'tenant_default',
      wabaId,
      name,
      category,
      language,
      headerType,
      headerText,
      bodyText,
      footerText,
      buttons,
      sampleValues,
      userRole = 'workspace_admin',
    } = body;

    // RBAC: Check permission to manage templates
    if (!hasPermission(userRole, 'templates:manage')) {
      return NextResponse.json(
        { error: 'FORBIDDEN: User does not have permission to manage WhatsApp message templates.' },
        { status: 403 }
      );
    }

    const result = createTemplate({
      tenantId,
      wabaId,
      name,
      category,
      language,
      headerType,
      headerText,
      bodyText,
      footerText,
      buttons,
      sampleValues,
      createdByUser: 'usr_current',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, template: result.template }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

