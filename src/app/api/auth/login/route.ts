// ============================================================================
// Customer Login API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { loginCustomer, SESSION_COOKIE_NAME, SESSION_DURATION_HOURS } from '@/lib/services/auth-service';
import { signSessionJwt } from '@/lib/services/token-signer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const result = await loginCustomer({
      email,
      password,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      const status = result.needsEmailVerification ? 403 : 401;
      return NextResponse.json(
        { error: result.error, needsEmailVerification: result.needsEmailVerification },
        { status }
      );
    }

    // Sign session token into tamper-proof JWT
    const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_HOURS * 3600;
    const sessionJwt = await signSessionJwt({
      sessionId: result.rawToken,
      userId: result.user.id,
      email: result.user.email,
      displayName: result.user.displayName,
      tenantId: result.tenantId,
      role: result.user.role || 'agent',
      isSuperAdmin: false,
      isMfaVerified: false,
      exp,
    });

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: sessionJwt,
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionJwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_HOURS * 3600,
    });

    return response;
  } catch (err: any) {
    console.error('[Login API Error]', err);
    return NextResponse.json({ error: 'Internal server error during login.' }, { status: 500 });
  }
}
