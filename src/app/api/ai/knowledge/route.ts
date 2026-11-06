// ============================================================================
// AI Knowledge Base Management Endpoint
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

interface StoredKnowledgeChunk {
  id: string;
  tenantId: string;
  sourceTitle: string;
  content: string;
  keywords: string[];
  createdAt: string;
}

const tenantKnowledgeStore: StoredKnowledgeChunk[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_demo_1';

  // Strict tenant filtering
  const chunks = tenantKnowledgeStore.filter(c => c.tenantId === tenantId);

  return NextResponse.json({
    success: true,
    total: chunks.length,
    chunks,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { tenantId, sourceTitle, content, keywords } = body;

  if (!tenantId || !sourceTitle || !content) {
    return NextResponse.json(
      { error: "Fields 'tenantId', 'sourceTitle', and 'content' are required" },
      { status: 422 }
    );
  }

  const newChunk: StoredKnowledgeChunk = {
    id: `kb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tenantId,
    sourceTitle,
    content,
    keywords: Array.isArray(keywords) ? keywords : [],
    createdAt: new Date().toISOString(),
  };

  tenantKnowledgeStore.push(newChunk);

  return NextResponse.json(
    {
      success: true,
      chunk: newChunk,
    },
    { status: 201 }
  );
}

