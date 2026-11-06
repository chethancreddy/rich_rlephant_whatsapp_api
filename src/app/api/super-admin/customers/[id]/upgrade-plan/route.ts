// ============================================================================
// Super Admin Customer Plan Upgrade API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { upgradeCustomerPlan } from '@/lib/services/subscription-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { targetPlanCode, effectiveImmediately = true, notes = '' } = body;

    if (!targetPlanCode) {
      return NextResponse.json(
        { error: "Field 'targetPlanCode' is required (free, starter, growth, enterprise)" },
        { status: 400 }
      );
    }

    const result = upgradeCustomerPlan({
      tenantId: id,
      targetPlanCode,
      effectiveImmediately,
      notes,
      performedBy: 'usr_super_admin',
      performerEmail: 'admin@rich-rlephant.com',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      message: `Customer workspace successfully upgraded to ${result.newPlan?.name}`,
      previousPlan: result.previousPlan,
      newPlan: result.newPlan,
      subscription: result.subscription,
      historyEntry: result.historyEntry,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to upgrade plan' },
      { status: 500 }
    );
  }
}

