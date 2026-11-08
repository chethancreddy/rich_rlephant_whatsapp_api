// ============================================================================
// Logout & Session Invalidation API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { revokeSession, SESSION_COOKIE_NAME } from '@/lib/services/auth-service';
import { verifySessionJwt } from '@/lib/services/token-signer';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) {
      const decoded = await verifySessionJwt(sessionCookie);
      if (decoded?.sessionId) {
        await revokeSession(decoded.sessionId);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully. Active session destroyed.',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process logout.' }, { status: 500 });
  }
}

