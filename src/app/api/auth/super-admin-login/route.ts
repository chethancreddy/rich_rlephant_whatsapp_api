// ============================================================================
// Super Admin Dedicated Login API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { loginSuperAdmin } from '@/lib/services/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Super Admin email and password are required.' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const result = await loginSuperAdmin({
      email,
      password,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      mfaRequired: true,
      mfaToken: result.mfaToken,
      mfaChallengeCode: result.mfaChallengeCode, // Returned for automated staging verification
      message: 'Password accepted. Please provide your 6-digit MFA challenge code to complete privileged login.',
    });
  } catch (err: any) {
    console.error('[Super Admin Login API Error]', err);
    return NextResponse.json({ error: 'Internal server error during admin login.' }, { status: 500 });
  }
}

