// ============================================================================
// Forgot Password API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/services/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const result = await requestPasswordReset(email, ipAddress);

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email address, a password reset link has been dispatched.',
      resetToken: result.resetToken, // Returned for staging automation test verification
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error processing password reset.' }, { status: 500 });
  }
}

