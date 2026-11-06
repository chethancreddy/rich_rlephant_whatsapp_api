// ============================================================================
// AI Conversation Summarizer Endpoint
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { summarizeConversation } from '@/lib/services/ai-copilot';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { conversationId = 'conv_default', messages = [] } = body;

  const summary = summarizeConversation(conversationId, messages);

  return NextResponse.json({
    success: true,
    summary,
  });
}

