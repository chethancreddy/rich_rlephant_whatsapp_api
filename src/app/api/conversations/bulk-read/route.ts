// ============================================================================
// Bulk Read/Unread Status API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNeonPool } from '@/lib/db/neon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationIds, markRead } = body;

    if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
      return NextResponse.json(
        { error: 'conversationIds must be a non-empty array' },
        { status: 400 }
      );
    }

    const pool = getNeonPool();
    const isMarkRead = Boolean(markRead);
    const targetUnreadCount = isMarkRead ? 0 : 1;

    // Update real unread_count in Neon PostgreSQL
    const updateRes = await pool.query(
      `
      UPDATE conversations 
      SET 
        unread_count = $1,
        updated_at = NOW() 
      WHERE id = ANY($2::uuid[])
      RETURNING id, unread_count
      `,
      [targetUnreadCount, conversationIds]
    );

    return NextResponse.json({
      success: true,
      updatedCount: updateRes.rowCount || conversationIds.length,
      markRead: isMarkRead,
      message: `Successfully marked ${updateRes.rowCount || conversationIds.length} conversation(s) as ${
        isMarkRead ? 'read' : 'unread'
      }.`,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[Bulk Read Error]', error.message);
    return NextResponse.json(
      { error: error.message || 'Bulk operation failed' },
      { status: 500 }
    );
  }
}
