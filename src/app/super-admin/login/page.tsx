'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, AlertTriangle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SuperAdminLoginPage() {
  const router = useRouter();
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
      const res = await fetch('/api/auth/super-admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected');
      }

      if (data.mfaRequired && data.mfaToken) {
        // Store mfaToken in sessionStorage and route to MFA screen
        sessionStorage.setItem('rlep_mfa_token', data.mfaToken);
        if (data.mfaChallengeCode) {
          sessionStorage.setItem('rlep_mfa_dev_code', data.mfaChallengeCode);
        }
        router.push('/super-admin/mfa');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#202020] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-[16px] bg-[#72A4F2] text-[#202020] border-2 border-white/20 shadow-[4px_4px_0px_#72A4F2] mb-4">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-serif font-black text-white">
          Super Admin Privileged Gateway
        </h2>
        <p className="mt-1.5 text-xs text-white/60">
          Restricted zone. All access attempts are cryptographically audited and monitored.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-[#2a2a2a] border-2 border-white/20 p-6 sm:p-8 shadow-[6px_6px_0px_#72A4F2] rounded-[20px] text-white">
          {error && (
            <div className="mb-6 p-4 rounded-[14px] bg-red-950/60 border-2 border-red-500/60 text-red-200 text-xs flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-bold text-white/80 uppercase tracking-wider mb-2">
                Administrator Identity
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-white/40" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rich-rlephant.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] border-2 border-white/20 bg-[#1f1f1f] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#72A4F2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-white/80 uppercase tracking-wider mb-2">
                Privileged Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-white/40" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-[12px] border-2 border-white/20 bg-[#1f1f1f] text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#72A4F2]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#72A4F2] text-[#202020] font-bold text-sm border-2 border-white shadow-[3px_3px_0px_white] hover:bg-[#6093e1] rounded-[14px]"
            >
              {loading ? (
                'Authenticating Admin...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Authenticate &amp; Proceed to MFA <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link href="/login" className="text-xs text-white/50 hover:text-white transition-colors">
              &larr; Return to Customer Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

