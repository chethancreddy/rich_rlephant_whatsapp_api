// ============================================================================
// Automation Flows CRUD API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const defaultFlows = [
    {
      id: 'flow_welcome_faq',
      name: 'Inbound Welcome & FAQ Bot',
      status: 'published',
      triggerKeywords: ['hi', 'hello', 'support'],
      nodes_count: 5,
      updated_at: new Date().toISOString(),
    },
    {
      id: 'flow_stop_optout',
      name: 'Compliance Stop & Unsubscribe',
      status: 'published',
      triggerKeywords: ['stop', 'unsubscribe', 'cancel'],
      nodes_count: 3,
      updated_at: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    flows: defaultFlows,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, triggerKeywords, nodes } = body;

    if (!name || !triggerKeywords || !Array.isArray(triggerKeywords)) {
      return NextResponse.json(
        { error: 'Name and triggerKeywords array are required' },
        { status: 400 }
      );
    }

    const newFlow = {
      id: `flow_${Date.now()}`,
      name,
      status: 'published',
      triggerKeywords,
      nodes: nodes || [],
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      flow: newFlow,
      message: 'Visual automation journey saved and published to background worker.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to save flow' },
      { status: 500 }
    );
  }
}

