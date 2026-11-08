// ============================================================================
// Customer Registration API Endpoint
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { registerCustomer, verifyAntiAbuseChallenge } from '@/lib/services/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      companyName,
      email,
      phone,
      password,
      confirmPassword,
      acceptTerms,
      challengeAnswer,
      challengeExpected,
    } = body;

    // 1. Mandatory acceptance of terms & privacy policy
    if (!acceptTerms) {
      return NextResponse.json(
        { error: 'You must accept the Terms of Service and Privacy Policy to create an account.' },
        { status: 400 }
      );
    }

    // 2. Validate password match
    if (!password || password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match. Please verify and try again.' },
        { status: 400 }
      );
    }

    // 3. Bot challenge anti-abuse verification
    if (!verifyAntiAbuseChallenge(challengeAnswer, challengeExpected)) {
      return NextResponse.json(
        { error: 'Bot protection challenge verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // 4. Basic presence validation
    if (!firstName || !lastName || !companyName || !email || !phone) {
      return NextResponse.json(
        { error: 'All fields (First Name, Last Name, Company Name, Email, Phone Number) are required.' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // 5. Register customer in Neon DB
    const result = await registerCustomer({
      firstName,
      lastName,
      companyName,
      email,
      phone,
      password,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! An activation link has been sent to your email address.',
      verificationToken: result.verificationToken, // Provided for testing activation in staging
    });
  } catch (err: any) {
    console.error('[Registration API Error]', err);
    return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
  }
}

