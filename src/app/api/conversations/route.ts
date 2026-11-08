// ============================================================================
// Real-Time Conversations API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNeonPool } from '@/lib/db/neon';

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ success: true, count: 0, conversations: [] });
    }

    const pool = getNeonPool();
    const result = await pool.query(
      `
      SELECT 
        c.id,
        co.name,
        co.phone_e164 as phone,
        COALESCE(c.last_message_preview, 'No messages yet') as "lastMessage",
        c.last_message_at as "lastMessageAt",
        c.unread_count as unread,
        c.status,
        c.priority,
        COALESCE(u.display_name, 'Unassigned') as "assignedTo",
        COALESCE(t.name, 'Customer Support') as team,
        c.service_window_expires_at as "serviceWindowExpiresAt"
      FROM conversations c
      JOIN contacts co ON co.id = c.contact_id
      LEFT JOIN users u ON u.id = c.assigned_user_id
      LEFT JOIN teams t ON t.id = c.team_id
      WHERE c.tenant_id = $1
      ORDER BY c.last_message_at DESC
      LIMIT 100
      `,
      [tenantId]
    );

    const conversations = result.rows.map((row) => ({
      id: row.id,
      name: row.name || 'Anonymous',
      phone: row.phone,
      lastMessage: row.lastMessage,
      lastMessageAt: row.lastMessageAt ? new Date(row.lastMessageAt).toISOString() : new Date().toISOString(),
      unread: row.unread || 0,
      assignedTo: row.assignedTo,
      team: row.team,
      status: row.status || 'open',
      isCustomerLastInbound: true,
      tags: ['Live DB'],
    }));

    return NextResponse.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (err: any) {
    console.error('[API Conversations GET Error]', err.message);
    return NextResponse.json({ success: true, count: 0, conversations: [] });
  }
}

