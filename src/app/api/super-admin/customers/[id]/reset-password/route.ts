// ============================================================================
// Super Admin Customer Password Reset API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { initiateCustomerPasswordReset } from '@/lib/services/password-reset-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { targetEmail, userId = 'usr_customer_admin', revokeExistingSessions = true } = body;

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Field 'targetEmail' is required" },
        { status: 400 }
      );
    }

    const result = initiateCustomerPasswordReset({
      tenantId: id,
      userId,
      targetEmail,
      performedBy: 'usr_super_admin',
      performerEmail: 'admin@rich-rlephant.com',
      revokeExistingSessions,
    });

    if (!result.success) {
      const status = result.status === 'rate_limited' ? 429 : 422;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset link dispatched securely to ${result.targetEmail}. Valid for 60 minutes.`,
      status: result.status,
      targetEmail: result.targetEmail,
      expiresAt: result.expiresAt,
      sessionsRevoked: result.sessionsRevoked,
      deliveryMethod: result.deliveryMethod,
      auditLogId: result.auditLogId,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch password reset' },
      { status: 500 }
    );
  }
}

