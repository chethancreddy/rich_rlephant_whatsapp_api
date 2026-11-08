'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch password recovery');
      }

      setSubmitted(true);
      if (data.resetToken) {
        setDevToken(data.resetToken);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#202020] text-[#72A4F2] border-2 border-[#202020] flex items-center justify-center font-serif font-black text-xl shadow-[2px_2px_0px_#202020]">
            R
          </div>
          <span className="font-serif font-bold text-xl text-[#202020]">
            Rich Rlephant
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-serif font-black text-[#202020]">
          Recover your Account Password
        </h2>
        <p className="mt-1 text-xs text-[#202020]/70">
          We will send a single-use secure reset link to your registered email.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white border-2 border-[#202020] p-6 sm:p-8 shadow-[6px_6px_0px_#202020] rounded-[20px]">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-[#e0f2fe] border-2 border-[#202020] rounded-full mx-auto flex items-center justify-center shadow-[2px_2px_0px_#202020]">
                <CheckCircle2 className="h-6 w-6 text-[#72A4F2]" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#202020]">
                Reset Link Dispatched
              </h3>
              <p className="text-xs text-[#202020]/80 leading-relaxed">
                If an account exists for <strong>{email}</strong>, a secure password reset link has been dispatched. Valid for 60 minutes.
              </p>

              {devToken && (
                <div className="p-3 bg-[#F4EFE7] border-2 border-[#202020] rounded-[12px] text-left">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#202020]/70 block mb-1">
                    Staging Quick Reset Link:
                  </span>
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(devToken)}`}
                    className="inline-block px-3 py-1.5 bg-[#72A4F2] text-[#202020] font-bold text-xs border border-[#202020] rounded shadow-[2px_2px_0px_#202020]"
                  >
                    Open Password Reset Screen &rarr;
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link href="/login" className="text-xs font-bold text-[#72A4F2] hover:text-[#202020]">
                  &larr; Back to Login
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
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#202020]/50" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
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
                  {loading ? 'Dispatching Reset Link...' : 'Send Password Reset Link'}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#202020]/10 text-center">
                <Link href="/login" className="text-xs font-bold text-[#202020]/70 hover:text-[#202020]">
                  &larr; Back to Login
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

