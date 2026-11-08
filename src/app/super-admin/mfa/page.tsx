'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, KeyRound, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SuperAdminMfaPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('rlep_mfa_token');
    const stagingCode = sessionStorage.getItem('rlep_mfa_dev_code');
    if (!token) {
      router.push('/super-admin/login');
      return;
    }
    setMfaToken(token);
    if (stagingCode) {
      setDevCode(stagingCode);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'MFA Verification failed');
      }

      // Cleanup MFA session tokens
      sessionStorage.removeItem('rlep_mfa_token');
      sessionStorage.removeItem('rlep_mfa_dev_code');

      // Redirect into privileged Super Admin console
      router.push('/super-admin');
      router.refresh();
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
          <KeyRound className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-serif font-black text-white">
          Mandatory MFA Challenge
        </h2>
        <p className="mt-1.5 text-xs text-white/60">
          Enter the 6-digit security code dispatched for this administrative session.
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

          {devCode && (
            <div className="mb-5 p-3 rounded-[12px] bg-[#72A4F2]/10 border border-[#72A4F2]/40 text-[#72A4F2] text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
                  Staging MFA Code:
                </span>
                <button
                  type="button"
                  onClick={() => setCode(devCode)}
                  className="px-2 py-0.5 bg-[#72A4F2] text-[#202020] font-mono font-bold text-[10px] rounded hover:bg-white"
                >
                  Auto-fill ({devCode})
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-bold text-white/80 uppercase tracking-wider mb-2">
                6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 rounded-[12px] border-2 border-white/20 bg-[#1f1f1f] text-white focus:outline-none focus:border-[#72A4F2]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 bg-[#72A4F2] text-[#202020] font-bold text-sm border-2 border-white shadow-[3px_3px_0px_white] hover:bg-[#6093e1] rounded-[14px] disabled:opacity-50"
            >
              {loading ? (
                'Verifying MFA Code...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Verify &amp; Enter Super Admin <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link href="/super-admin/login" className="text-xs text-white/50 hover:text-white transition-colors">
              &larr; Cancel and restart login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

