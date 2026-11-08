'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      router.push(returnUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-2 border-[#202020] p-6 sm:p-8 shadow-[6px_6px_0px_#202020] rounded-[20px]">
      {error && (
        <div className="mb-6 p-4 rounded-[14px] bg-red-50 border-2 border-red-500/40 text-red-700 text-xs flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-2">
            Business Email
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
              className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium placeholder-[#202020]/40 focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-[#72A4F2] hover:text-[#202020] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[#202020]/50" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium placeholder-[#202020]/40 focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#202020]/50 hover:text-[#202020]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          className="w-full py-3 bg-[#72A4F2] text-[#202020] font-bold text-sm border-2 border-[#202020] shadow-[3px_3px_0px_#202020] hover:bg-[#6093e1] rounded-[14px]"
        >
          {loading ? (
            'Verifying Credentials...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In to Platform <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t-2 border-[#202020]/10 text-center">
        <p className="text-xs text-[#202020]/70 font-medium">
          Don&apos;t have a workspace yet?{' '}
          <Link href="/register" className="font-bold text-[#202020] underline hover:text-[#72A4F2]">
            Start 14-Day Free Trial
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/super-admin/login"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#202020]/50 hover:text-[#202020]"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Super Admin Portal
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F4EFE7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <Link href="/" className="flex items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-[14px] bg-[#202020] text-[#72A4F2] border-2 border-[#202020] flex items-center justify-center font-serif font-black text-2xl shadow-[3px_3px_0px_#202020] group-hover:bg-[#72A4F2] group-hover:text-[#202020] transition-colors">
            R
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif font-bold text-2xl text-[#202020] tracking-tight leading-none">
              Rich Rlephant
            </span>
            <span className="font-mono text-xs text-[#202020]/70 font-semibold tracking-widest uppercase mt-0.5">
              Marketing WhatsApp API
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-serif font-black text-[#202020]">
          Sign in to your Workspace
        </h2>
        <p className="mt-2 text-center text-xs text-[#202020]/70">
          Enter your registered business email and secure password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="p-8 text-center bg-white border-2 border-[#202020] rounded-[20px]">
              <div className="w-6 h-6 border-2 border-[#72A4F2] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
