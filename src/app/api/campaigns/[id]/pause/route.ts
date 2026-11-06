import { NextRequest, NextResponse } from 'next/server';
import { pauseCampaign } from '@/lib/services/campaign-wizard-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenantId = req.headers.get('x-tenant-id') || 'tenant_default';

  const result = pauseCampaign(tenantId, id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    campaign: result.campaign,
    message: `Campaign ${id} delivery paused.`,
  });
}

