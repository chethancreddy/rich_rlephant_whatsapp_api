// ============================================================================
// Meta Message Templates Synchronizer API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { MockMessagingProvider } from '@/lib/meta-adapter/mock-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const wabaId = body.wabaId || '104829104820194';

    // In local sandbox / testing, use MockMessagingProvider
    const provider = new MockMessagingProvider();
    const templates = await provider.listTemplates(wabaId, 'system_user_token');

    return NextResponse.json({
      success: true,
      synced_at: new Date().toISOString(),
      waba_id: wabaId,
      template_count: templates.length,
      templates,
      message: 'Templates successfully synchronized from Meta WhatsApp Business Platform.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to synchronize templates' },
      { status: 500 }
    );
  }
}

