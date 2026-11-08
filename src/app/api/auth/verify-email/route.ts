// ============================================================================
// Email Verification API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/services/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
    }

    const result = await verifyEmailToken(token);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email address verified successfully. You may now log in to your dashboard.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error during email verification.' }, { status: 500 });
  }
}

