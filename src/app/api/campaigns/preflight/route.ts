// ============================================================================
// Campaign Preflight Verification API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { calculateCampaignPreflight, CampaignDefinition } from '@/lib/services/campaign-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, templateName, templateCategory, templateStatus, recipients } = body;

    const campaignDef: CampaignDefinition = {
      id: campaignId || `cmp_${Date.now()}`,
      tenantId: 'tenant_current',
      name: body.name || 'Sample Campaign',
      phoneNumberId: body.phoneNumberId || 'phone_001',
      templateName: templateName || 'seasonal_sale_2026',
      templateCategory: templateCategory || 'MARKETING',
      templateStatus: templateStatus || 'APPROVED',
      recipients: recipients || [],
      pacingMessagesPerMinute: 60,
    };

    const preflight = calculateCampaignPreflight(campaignDef);

    return NextResponse.json({
      success: true,
      preflight,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to calculate preflight eligibility' },
      { status: 500 }
    );
  }
}

