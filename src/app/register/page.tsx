'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    challengeAnswer: '',
  });

  const [challenge, setChallenge] = useState({ num1: 7, num2: 4, expected: 11 });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ email: string; token?: string } | null>(null);

  // Generate random anti-bot math challenge on mount
  useEffect(() => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    setChallenge({ num1: a, num2: b, expected: a + b });
  }, []);

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy.');
      return;
    }

    if (parseInt(formData.challengeAnswer, 10) !== challenge.expected) {
      setError('Anti-abuse challenge verification failed. Please check your math answer.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          challengeExpected: challenge.expected,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessData({ email: formData.email, token: data.verificationToken });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
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
          Create your Company Workspace
        </h2>
        <p className="mt-1 text-center text-xs text-[#202020]/70">
          Get started with your 14-day free trial. No credit card required.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <Card className="bg-white border-2 border-[#202020] p-6 sm:p-8 shadow-[6px_6px_0px_#202020] rounded-[20px]">
          {successData ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-[#e0f2fe] border-2 border-[#202020] rounded-full mx-auto flex items-center justify-center shadow-[3px_3px_0px_#202020]">
                <CheckCircle2 className="h-8 w-8 text-[#72A4F2]" />
              </div>
              <h3 className="font-serif font-black text-2xl text-[#202020]">
                Account Created Successfully!
              </h3>
              <p className="text-xs text-[#202020]/80 leading-relaxed max-w-md mx-auto">
                We have dispatched a verification link to <strong>{successData.email}</strong>.
                Please check your inbox to activate your workspace before logging in.
              </p>
              {successData.token && (
                <div className="p-3 bg-[#F4EFE7] border-2 border-[#202020] rounded-[14px] text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider block font-bold text-[#202020]/70 mb-1">
                    Instant Activation Token (Staging &amp; Testing):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={successData.token}
                      className="text-xs font-mono bg-white border border-[#202020] p-1.5 rounded w-full"
                    />
                    <Link
                      href={`/verify-email?token=${encodeURIComponent(successData.token)}`}
                      className="px-3 py-1.5 bg-[#72A4F2] text-[#202020] font-bold text-xs border border-[#202020] rounded shrink-0 shadow-[2px_2px_0px_#202020]"
                    >
                      Activate Now
                    </Link>
                  </div>
                </div>
              )}
              <div className="pt-4">
                <Link href="/login">
                  <Button variant="primary" className="w-full font-bold">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-[14px] bg-red-50 border-2 border-red-500/40 text-red-700 text-xs flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="Jane"
                      className="w-full px-3.5 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3.5 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-[#202020]/50" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="Acme Global Inc"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-1.5">
                      Business Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-[#202020]/50" />
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="jane@acme.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-1.5">
                      Phone Number (E.164)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-[#202020]/50" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-1.5">
                    Password (Min 8 chars, 1 Upper, 1 Lower, 1 Num, 1 Symbol)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#202020]/50" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#202020] uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#202020]/50" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] border-2 border-[#202020] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] shadow-[2px_2px_0px_#202020]"
                    />
                  </div>
                </div>

                {/* Anti-Abuse Bot Math Challenge */}
                <div className="p-3.5 bg-[#F4EFE7] rounded-[14px] border-2 border-[#202020]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Bot className="h-4 w-4 text-[#6366f1]" />
                    <span className="text-xs font-bold text-[#202020]">
                      Bot Protection Challenge: What is {challenge.num1} + {challenge.num2}?
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    value={formData.challengeAnswer}
                    onChange={(e) => handleChange('challengeAnswer', e.target.value)}
                    placeholder="Enter sum"
                    className="w-full px-3 py-2 rounded-[10px] border border-[#202020] bg-white text-sm font-bold focus:outline-none"
                  />
                </div>

                {/* Terms and Privacy Policy Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={formData.acceptTerms}
                    onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-2 border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2]"
                  />
                  <label htmlFor="terms" className="text-xs text-[#202020]/80 leading-normal">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="font-bold underline text-[#202020] hover:text-[#72A4F2]">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" target="_blank" className="font-bold underline text-[#202020] hover:text-[#72A4F2]">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="w-full py-3 bg-[#72A4F2] text-[#202020] font-bold text-sm border-2 border-[#202020] shadow-[3px_3px_0px_#202020] hover:bg-[#6093e1] rounded-[14px] mt-2"
                >
                  {loading ? (
                    'Provisioning Workspace...'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t-2 border-[#202020]/10 text-center">
                <p className="text-xs text-[#202020]/70 font-medium">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-[#202020] underline hover:text-[#72A4F2]">
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
