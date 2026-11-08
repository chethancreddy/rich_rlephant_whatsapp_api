// ============================================================================
// Real-Time Workspace Overview & Onboarding Status API
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNeonPool } from '@/lib/db/neon';

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id');
    const userEmail = req.headers.get('x-user-email');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED: Workspace session required' },
        { status: 401 }
      );
    }

    const pool = getNeonPool();

    // 1. Fetch tenant workspace profile
    const tenantRes = await pool.query(
      `SELECT id, name, slug, status, country, timezone, created_at FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (tenantRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Tenant workspace not found' },
        { status: 404 }
      );
    }

    const tenant = tenantRes.rows[0];

    // 2. Query real connected phone numbers
    const phoneRes = await pool.query(
      `
      SELECT id, display_phone_number as "displayPhoneNumber", verified_name as "verifiedName",
             quality_rating as "qualityRating", connection_status as "connectionStatus",
             messaging_limit_tier as "messagingLimitTier", is_default as "isDefault"
      FROM phone_numbers
      WHERE tenant_id = $1
      ORDER BY is_default DESC, created_at ASC
      `,
      [tenantId]
    );

    // 3. Query real contact metrics
    const contactsCountRes = await pool.query(
      `SELECT COUNT(*)::int as count FROM contacts WHERE tenant_id = $1 AND archived_at IS NULL`,
      [tenantId]
    );
    const contactsCount = contactsCountRes.rows[0]?.count || 0;

    // 4. Query real campaign metrics
    const campaignsCountRes = await pool.query(
      `SELECT COUNT(*)::int as count FROM campaigns WHERE tenant_id = $1`,
      [tenantId]
    );
    const campaignsCount = campaignsCountRes.rows[0]?.count || 0;

    // 5. Query real message metrics
    const messagesCountRes = await pool.query(
      `
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN direction = 'outbound' THEN 1 END)::int as sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END)::int as delivered,
        COUNT(CASE WHEN status = 'read' THEN 1 END)::int as read
      FROM messages 
      WHERE tenant_id = $1
      `,
      [tenantId]
    );
    const messageStats = messagesCountRes.rows[0] || { total: 0, sent: 0, delivered: 0, read: 0 };

    // 6. Query real Meta connection
    const metaRes = await pool.query(
      `SELECT id, waba_id as "wabaId", status FROM meta_connections WHERE tenant_id = $1`,
      [tenantId]
    );
    const isMetaConnected = metaRes.rows.length > 0 && metaRes.rows[0].status === 'active';

    // 7. Calculate Onboarding completion state
    const hasPhoneConnected = phoneRes.rows.length > 0;
    const hasContacts = contactsCount > 0;
    const hasCampaigns = campaignsCount > 0;

    const onboarding = {
      isFullyOnboarded: isMetaConnected && hasPhoneConnected && hasContacts && hasCampaigns,
      step1_connectBusiness: isMetaConnected,
      step2_syncProfile: hasPhoneConnected,
      step3_addContacts: hasContacts,
      step4_goLive: hasCampaigns,
    };

    return NextResponse.json({
      success: true,
      workspace: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
      },
      user: {
        email: userEmail || '',
      },
      stats: {
        totalContacts: contactsCount,
        activeCampaigns: campaignsCount,
        messagesSent: messageStats.sent,
        messagesDelivered: messageStats.delivered,
        messagesRead: messageStats.read,
        deliveryRate: messageStats.sent > 0 ? ((messageStats.delivered / messageStats.sent) * 100).toFixed(1) : null,
      },
      phoneNumbers: phoneRes.rows,
      metaConnection: metaRes.rows[0] || null,
      onboarding,
    });
  } catch (err: any) {
    console.error('[Workspace Overview API Error]', err.message);
    return NextResponse.json(
      { error: 'Failed to query workspace overview', details: err.message },
      { status: 500 }
    );
  }
}
