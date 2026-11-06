// ============================================================================
// Super Admin Customer Details & Subscription Overview API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSubscriptionOverview } from '@/lib/services/subscription-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = getCustomerSubscriptionOverview(id);

    return NextResponse.json({
      success: true,
      tenantId: id,
      ...data,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer details' },
      { status: 500 }
    );
  }
}

