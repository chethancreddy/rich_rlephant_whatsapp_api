// ============================================================================
// Single Conversation Read/Unread Status API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNeonPool } from '@/lib/db/neon';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const isMarkRead = body.markRead !== undefined ? Boolean(body.markRead) : true;
    const targetUnread = isMarkRead ? 0 : 1;

    const pool = getNeonPool();

    const res = await pool.query(
      `
      UPDATE conversations 
      SET 
        unread_count = $1,
        updated_at = NOW() 
      WHERE id = $2
      RETURNING id, unread_count
      `,
      [targetUnread, id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      unread: targetUnread,
      isMarkRead,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[Single Read Error]', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to update read status' },
      { status: 500 }
    );
  }
}

