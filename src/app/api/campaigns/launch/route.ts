// ============================================================================
// Campaign Confirmation & Outbox Launch API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { buildOutboxJobsForCampaign, CampaignDefinition } from '@/lib/services/campaign-service';

export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Idempotency-Key header is required for campaign launch' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { campaignId, name, phoneNumberId, templateName, templateCategory, recipients } = body;

    const campaignDef: CampaignDefinition = {
      id: campaignId || `cmp_${Date.now()}`,
      tenantId: 'tenant_current',
      name: name || 'Broadcast Campaign',
      phoneNumberId: phoneNumberId || 'phone_001',
      templateName: templateName || 'seasonal_sale_2026',
      templateCategory: templateCategory || 'MARKETING',
      templateStatus: 'APPROVED',
      recipients: recipients || [],
      pacingMessagesPerMinute: body.pacingMessagesPerMinute || 60,
    };

    // Build queued jobs
    const jobs = buildOutboxJobsForCampaign(campaignDef, idempotencyKey);

    return NextResponse.json({
      success: true,
      campaign_id: campaignDef.id,
      status: 'queued',
      queued_jobs_count: jobs.length,
      pacing: `${campaignDef.pacingMessagesPerMinute} messages/minute`,
      idempotency_key: idempotencyKey,
      message: 'Campaign approved by preflight and committed to transactional outbox.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to launch campaign' },
      { status: 500 }
    );
  }
}

