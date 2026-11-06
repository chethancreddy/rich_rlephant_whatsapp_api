// ============================================================================
// Conversation Messages & Reply API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { InboxService } from '@/lib/services/inbox-service';

const inboxService = new InboxService();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { messageBody, agentId, templateName, contactPhone, phoneNumberId, lastCustomerMessageAt, messageType, mediaUrl } = body;

    if (!messageBody && !templateName && messageType !== 'audio') {
      return NextResponse.json(
        { error: 'messageBody, templateName, or audio voice message is required' },
        { status: 400 }
      );
    }

    const conversation = {
      id,
      tenantId: 'tenant_current',
      contactId: 'contact_001',
      contactName: body.contactName || 'Customer',
      contactPhone: contactPhone || '+971501234567',
      phoneNumberId: phoneNumberId || 'phone_001',
      status: 'open' as const,
      priority: 'normal' as const,
      lastCustomerMessageAt: lastCustomerMessageAt || new Date().toISOString(),
    };

    const result = await inboxService.sendReply(
      conversation,
      messageBody || 'Voice message',
      agentId || 'agent_01',
      templateName,
      messageType || 'text',
      mediaUrl
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          requires_template: result.requiresTemplate,
        },
        { status: result.requiresTemplate ? 403 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation_id: id,
      provider_message_id: result.providerMessageId,
      status: 'submitted',
      sent_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch message' },
      { status: 500 }
    );
  }
}

