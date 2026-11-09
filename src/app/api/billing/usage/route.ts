// ============================================================================
// Billing & Usage Summary Endpoint (Real Database Aggregation)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { calculateTenantInvoice } from '@/lib/services/billing-service';
import { getNeonPool } from '@/lib/db/neon';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || req.headers.get('x-tenant-id') || '9acfe96e-b425-44a1-b40d-9f85c586679d';
  const plan = (searchParams.get('plan') as any) || 'growth';

  try {
    const pool = getNeonPool();
    const contactRes = await pool.query(
      `SELECT count(*)::int as count FROM contacts WHERE tenant_id = $1 AND archived_at IS NULL`,
      [tenantId]
    );
    const activeContactsCount = contactRes.rows[0]?.count || 0;

    const messageRes = await pool.query(
      `SELECT count(*)::int as count FROM conversation_messages WHERE tenant_id = $1`,
      [tenantId]
    );
    const totalMessages = messageRes.rows[0]?.count || 0;

    const actualUsage = {
      tenantId,
      planTier: plan,
      activeContactsCount,
      messageUsage: [
        { countryCode: 'IN', category: 'service' as const, count: totalMessages },
      ],
    };

    const invoice = calculateTenantInvoice(actualUsage);

    return NextResponse.json({
      success: true,
      invoice,
      cyclePeriod: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[Billing Usage Error]', err.message);
    return NextResponse.json({ error: 'Failed to aggregate billing usage' }, { status: 500 });
  }
}
