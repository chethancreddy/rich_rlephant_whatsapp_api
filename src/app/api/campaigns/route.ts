// ============================================================================
// Phase 4: Bulk Campaigns API (List & Wizard Creation)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns, createCampaign } from '@/lib/services/campaign-wizard-service';

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get('x-tenant-id') || 'tenant_default';
  const campaigns = getCampaigns(tenantId);
  return NextResponse.json({ success: true, total: campaigns.length, campaigns });
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || 'tenant_default';
    const body = await req.json();

    const result = createCampaign({
      tenantId,
      name: body.name,
      category: body.category || 'MARKETING',
      senderPhone: body.senderPhone || '+971 50 123 4567',
      templateId: body.templateId || 'tmpl_custom',
      templateName: body.templateName,
      language: body.language || 'en',
      variableMappings: body.variableMappings || [],
      audienceFilter: body.audienceFilter || {},
      pacingMessagesPerMinute: body.pacingMessagesPerMinute || 60,
      scheduledAt: body.scheduledAt,
      createdBy: body.createdBy || 'Chethan Reddy',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      campaign: result.campaign,
      message: 'Campaign verified by preflight gate and successfully scheduled.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Failed to process campaign' }, { status: 500 });
  }
}
