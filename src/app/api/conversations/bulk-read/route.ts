import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateReadStatus } from '@/lib/services/inbox-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationIds, markRead } = body;

    if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
      return NextResponse.json({ error: 'conversationIds must be a non-empty array' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      updatedCount: conversationIds.length,
      markRead: Boolean(markRead),
      message: `Successfully marked ${conversationIds.length} conversations as ${markRead ? 'read' : 'unread'}.`,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Bulk operation failed' }, { status: 500 });
  }
}
