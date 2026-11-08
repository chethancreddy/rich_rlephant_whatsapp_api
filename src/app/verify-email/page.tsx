'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('No email verification token was provided.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to verify email address.');
        }

        setSuccess(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="bg-white border-2 border-[#202020] p-6 sm:p-8 shadow-[6px_6px_0px_#202020] rounded-[20px] text-center">
      {loading ? (
        <div className="py-8 space-y-3">
          <div className="w-10 h-10 border-4 border-[#72A4F2] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#202020]">
            Cryptographically validating activation token...
          </p>
        </div>
      ) : success ? (
        <div className="py-4 space-y-4">
          <div className="w-16 h-16 bg-[#e0f2fe] border-2 border-[#202020] rounded-full mx-auto flex items-center justify-center shadow-[3px_3px_0px_#202020]">
            <CheckCircle2 className="h-8 w-8 text-[#72A4F2]" />
          </div>
          <h3 className="font-serif font-black text-2xl text-[#202020]">
            Account Activated!
          </h3>
          <p className="text-xs text-[#202020]/80 leading-relaxed">
            Your email address has been verified successfully. Your company workspace is now ready for use.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="primary" className="w-full font-bold">
                Sign In to Workspace &rarr;
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-4 space-y-4">
          <div className="w-16 h-16 bg-red-100 border-2 border-[#202020] rounded-full mx-auto flex items-center justify-center shadow-[3px_3px_0px_#202020]">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="font-serif font-black text-2xl text-[#202020]">
            Verification Failed
          </h3>
          <p className="text-xs text-red-600 font-medium leading-relaxed">
            {error}
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full font-bold">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#F4EFE7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl font-serif font-black text-[#202020]">
          Email Account Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense
          fallback={
            <div className="p-8 text-center bg-white border-2 border-[#202020] rounded-[20px]">
              <div className="w-6 h-6 border-2 border-[#72A4F2] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
