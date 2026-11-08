// ============================================================================
// Super Admin MFA Verification API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdminMfa, SESSION_COOKIE_NAME, SESSION_DURATION_HOURS } from '@/lib/services/auth-service';
import { signSessionJwt } from '@/lib/services/token-signer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mfaToken, code } = body;

    if (!mfaToken || !code) {
      return NextResponse.json(
        { error: 'MFA session token and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const result = await verifySuperAdminMfa({
      mfaToken,
      code,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Sign privileged super admin session
    const exp = Math.floor(Date.now() / 1000) + 12 * 3600; // 12-hour session for Super Admin
    const sessionJwt = await signSessionJwt({
      sessionId: result.rawToken,
      userId: 'usr_super_admin',
      email: 'admin@rich-rlephant.com',
      displayName: 'Super Admin',
      tenantId: null,
      role: 'super_admin',
      isSuperAdmin: true,
      isMfaVerified: true,
      exp,
    });

    const response = NextResponse.json({
      success: true,
      message: 'MFA verified. Privileged administrative session active.',
      token: sessionJwt,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionJwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 3600,
    });

    return response;
  } catch (err: any) {
    console.error('[MFA Verification API Error]', err);
    return NextResponse.json({ error: 'Internal server error during MFA verification.' }, { status: 500 });
  }
}
