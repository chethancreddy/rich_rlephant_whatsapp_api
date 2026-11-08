// ============================================================================
// Next.js Global Security Middleware & Route Protection Gate
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionJwt } from '@/lib/services/token-signer';

export const SESSION_COOKIE_NAME = 'rlep_session';

// Publicly accessible paths without authentication
const PUBLIC_PATHS = [
  '/',
  '/privacy-policy',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/super-admin/login',
  '/super-admin/mfa',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip static assets, Next.js internal bundles, and image optimizations
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Allow public webhook receiver (Meta Cloud API validates via HMAC / Hub challenge)
  if (pathname.startsWith('/api/webhooks/meta')) {
    return applySecurityHeaders(NextResponse.next());
  }

  // 3. Allow public authentication endpoints
  if (pathname.startsWith('/api/auth/')) {
    return applySecurityHeaders(NextResponse.next());
  }

  // 4. Read session cookie
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session = sessionCookie ? await verifySessionJwt(sessionCookie) : null;

  // Check Bearer token in Authorization header for API callers
  if (!session && req.headers.get('authorization')?.startsWith('Bearer ')) {
    const rawBearer = req.headers.get('authorization')!.substring(7);
    session = await verifySessionJwt(rawBearer);
  }

  // 5. Handle Super Admin privileged zone
  const isSuperAdminZone = pathname.startsWith('/super-admin');
  const isSuperAdminAuthPage = pathname === '/super-admin/login' || pathname === '/super-admin/mfa';

  if (isSuperAdminZone && !isSuperAdminAuthPage) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/super-admin/login';
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }

    if (!session.isSuperAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'super_admin_privilege_required');
      return NextResponse.redirect(url);
    }

    if (!session.isMfaVerified) {
      const url = req.nextUrl.clone();
      url.pathname = '/super-admin/mfa';
      return NextResponse.redirect(url);
    }
  }

  // 6. Handle Public Routes
  const isPublicPage = PUBLIC_PATHS.includes(pathname);
  if (isPublicPage) {
    // If authenticated customer visits /login or /register, redirect to /dashboard
    if (session && (pathname === '/login' || pathname === '/register')) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // 7. Handle Protected APIs
  if (pathname.startsWith('/api/')) {
    if (!session) {
      return new NextResponse(
        JSON.stringify({
          error: 'UNAUTHORIZED: Authentication session is required to access this API endpoint',
          status: 401,
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (pathname.startsWith('/api/super-admin') && !session.isSuperAdmin) {
      return new NextResponse(
        JSON.stringify({
          error: 'FORBIDDEN: Super Admin privileges are strictly required for this endpoint',
          status: 403,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Forward authenticated tenant & user identity to API route
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', session.userId || '');
    requestHeaders.set('x-user-email', session.email || '');
    requestHeaders.set('x-user-role', session.role || 'agent');
    requestHeaders.set('x-tenant-id', session.tenantId || '');
    requestHeaders.set('x-is-super-admin', String(session.isSuperAdmin));

    return applySecurityHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    );
  }

  // 8. Handle Protected Customer Dashboard Pages
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // User is authenticated - propagate identity headers to Server Components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', session.userId || '');
  requestHeaders.set('x-user-email', session.email || '');
  requestHeaders.set('x-user-role', session.role || 'agent');
  requestHeaders.set('x-tenant-id', session.tenantId || '');
  requestHeaders.set('x-is-super-admin', String(session.isSuperAdmin));

  return applySecurityHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  );
}

// Injects enterprise defense-in-depth HTTP security headers (OWASP ASVS / Top 10)
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(self), geolocation=(), payment=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.facebook.net https://*.facebook.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-ancestors 'none';"
  );
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
