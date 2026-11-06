// ============================================================================
// AI Reply Suggestion Endpoint
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateReplySuggestion, type KnowledgeChunk } from '@/lib/services/ai-copilot';

// Mock knowledge base for initial demo/testing
const mockKnowledgeBase: KnowledgeChunk[] = [
  {
    id: 'kb_001',
    tenant_id: 'tenant_demo_1',
    source_title: 'Store Hours & Locations',
    content: 'Our flagship Dubai store in Downtown is open daily from 10:00 AM to 10:00 PM.',
    keywords: ['hours', 'location', 'dubai', 'open', 'address'],
  },
  {
    id: 'kb_002',
    tenant_id: 'tenant_demo_1',
    source_title: 'Refund & Exchange Policy',
    content: 'Items can be exchanged or refunded within 14 days with original receipt.',
    keywords: ['refund', 'return', 'exchange', 'policy'],
  },
];

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const {
    tenantId = 'tenant_demo_1',
    customerName = 'Customer',
    lastMessage = '',
    lastInboundAt = null,
    messages = [],
  } = body;

  const result = generateReplySuggestion({
    tenantId,
    customerName,
    lastCustomerMessage: lastMessage,
    lastCustomerInboundAt: lastInboundAt,
    conversationHistory: messages,
    knowledgeBase: mockKnowledgeBase,
  });

  return NextResponse.json({
    success: true,
    ...result,
  });
}

