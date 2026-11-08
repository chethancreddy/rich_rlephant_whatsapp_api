'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid password reset token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-2 border-[#202020] p-6 sm:p-8 shadow-[6px_6px_0px_#202020] rounded-[20px]">
      {success ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 bg-[#e0f2fe] border-2 border-[#202020] rounded-full mx-auto flex items-center justify-center shadow-[2px_2px_0px_#202020]">
            <CheckCircle2 className="h-6 w-6 text-[#72A4F2]" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#202020]">
            Password Reset Successfully!
          </h3>
          <p className="text-xs text-[#202020]/80 leading-relaxed">
            Your password has been securely updated and all previous sessions revoked. You can now log in with your new password.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="primary" className="w-full font-bold">
                Sign In Now &rarr;
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-5 p-3 rounded-[12px] bg-red-50 border border-red-400 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#202020]/50" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#202020]/50 hover:text-[#202020]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <span className="text-[10px] text-[#202020]/60 mt-1 block">
                Must be &ge;8 chars with uppercase, lowercase, number, and special character.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#202020]/50" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-3 bg-[#72A4F2] text-[#202020] font-bold text-sm border-2 border-[#202020] shadow-[3px_3px_0px_#202020] hover:bg-[#6093e1] rounded-[14px]"
            >
              {loading ? 'Updating Password...' : 'Reset & Save Password'}
            </Button>
          </form>
        </>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F4EFE7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl font-serif font-black text-[#202020]">
          Set New Account Password
        </h2>
        <p className="mt-1 text-xs text-[#202020]/70">
          Enter your new password below. It must meet strong complexity requirements.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense
          fallback={
            <div className="p-8 text-center bg-white border-2 border-[#202020] rounded-[20px]">
              <div className="w-6 h-6 border-2 border-[#72A4F2] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
