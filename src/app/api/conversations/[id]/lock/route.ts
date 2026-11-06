// ============================================================================
// Agent Collision Control & Lock API
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
    const { agentId, agentName } = body;

    if (!agentId || !agentName) {
      return NextResponse.json(
        { error: 'agentId and agentName are required' },
        { status: 400 }
      );
    }

    const lockResult = inboxService.acquireLock(id, agentId, agentName);

    return NextResponse.json({
      success: lockResult.acquired,
      conversation_id: id,
      locked_by: lockResult.lockedBy || agentName,
      expires_in_seconds: lockResult.expiresInSeconds,
      has_collision: !lockResult.acquired,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to acquire conversation lock' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId parameter is required' },
        { status: 400 }
      );
    }

    const released = inboxService.releaseLock(id, agentId);

    return NextResponse.json({
      success: released,
      conversation_id: id,
      released,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to release conversation lock' },
      { status: 500 }
    );
  }
}

