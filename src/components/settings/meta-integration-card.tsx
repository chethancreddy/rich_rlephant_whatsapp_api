'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Radio,
  Zap,
  Globe,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MetaIntegrationCardProps {
  className?: string;
}

export const MetaIntegrationCard: React.FC<MetaIntegrationCardProps> = ({ className = '' }) => {
  const [appUrl, setAppUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    // Dynamic determination of deployed app URL (honoring env var or browser origin)
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (envUrl && !envUrl.includes('placeholder')) {
      setAppUrl(envUrl.replace(/\/+$/, ''));
    } else if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    } else {
      setAppUrl('https://api.richrlephant.com');
    }
  }, []);

  const oauthRedirectUrl = `${appUrl || 'https://api.richrlephant.com'}/api/meta/embedded-signup/exchange`;
  const webhookCallbackUrl = `${appUrl || 'https://api.richrlephant.com'}/api/webhooks/meta`;
  const verifyToken = 'rich_rlephant_verify_2026';

  const handleCopy = (text: string, fieldKey: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleTestWebhook = async () => {
    setTestStatus('testing');
    setTestResult(null);
    try {
      // Test the local/deployed verification endpoint challenge
      const res = await fetch(`/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test_ping_${Date.now()}`);
      if (res.ok) {
        const text = await res.text();
        setTestStatus('success');
        setTestResult(`Webhook verification challenge PASSED (HTTP 200). Received challenge response: ${text.slice(0, 30)}`);
      } else {
        setTestStatus('error');
        setTestResult(`Verification challenge failed with HTTP status ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestResult(`Network test failed: ${err.message || 'Unable to reach webhook endpoint'}`);
    }
  };

  return (
    <Card
      title="Meta WhatsApp Cloud API & Webhook Configuration"
      subtitle="Official endpoints and credentials required for Meta Developer Dashboard and Embedded Signup integration"
      className={`border-2 border-[#202020] ${className}`}
    >
      <div className="space-y-6 text-xs text-[#202020]">
        {/* Connection Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#ecfdf5] border-2 border-[#202020] rounded-[20px] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-white border-2 border-[#202020] flex items-center justify-center text-[#065f46]">
              <Radio className="h-5 w-5 animate-pulse text-[#065f46]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[#202020]">Meta Webhook Ingestion Engine</span>
                <Badge variant="green" size="sm">Active & Listening</Badge>
              </div>
              <p className="text-[11px] text-[#202020]/70 mt-0.5 font-sans">
                Real-time listener for incoming customer messages, delivery receipts, and audio notes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestWebhook}
              disabled={testStatus === 'testing'}
              className="font-bold gap-1.5 bg-white text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              {testStatus === 'testing' ? 'Testing...' : 'Test Webhook Challenge'}
            </Button>
          </div>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <div
            className={`p-3.5 rounded-[16px] border-2 border-[#202020] text-xs font-mono flex items-start gap-2.5 ${
              testStatus === 'success' ? 'bg-[#ecfdf5] text-[#065f46]' : 'bg-[#fef2f2] text-[#991b1b]'
            }`}
          >
            {testStatus === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold block mb-0.5">
                {testStatus === 'success' ? 'Endpoint Ready' : 'Verification Issue'}
              </span>
              <span>{testResult}</span>
            </div>
          </div>
        )}

        {/* Grid: 2 Required URLs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* SECTION A: OAuth Redirect / Callback URL */}
          <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#72A4F2]" />
                <span className="font-serif font-bold text-xs uppercase tracking-wide">
                  A. OAuth Redirect / Callback URL
                </span>
              </div>
              <Badge variant="blue" size="sm">Embedded Signup</Badge>
            </div>

            <p className="text-[11px] text-[#202020]/70 font-sans">
              Required for Meta Embedded Signup &amp; Facebook Login for Business to exchange system user authorization tokens.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#202020]/60">
                Valid OAuth Redirect URI
              </label>
              <div className="flex items-center gap-2 bg-white border-2 border-[#202020] rounded-[14px] p-2">
                <code className="text-[11px] font-mono text-[#202020] truncate flex-1 select-all">
                  {oauthRedirectUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(oauthRedirectUrl, 'oauth')}
                  className="h-7 px-2.5 text-[11px] font-bold gap-1 shrink-0"
                >
                  {copiedField === 'oauth' ? (
                    <>
                      <Check className="h-3 w-3 text-[#065f46]" />
                      <span className="text-[#065f46]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-[#202020]/30 rounded-[12px] text-[10px] text-[#202020]/80">
              <strong className="text-[#202020]">Configure in Meta:</strong>
              <div className="mt-0.5 font-mono text-[#202020]/90">
                Meta Developer Dashboard &rarr; Facebook Login for Business &rarr; Settings &rarr; Valid OAuth Redirect URIs
              </div>
            </div>
          </div>

          {/* SECTION B: WhatsApp Webhook Callback URL */}
          <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#065f46]" />
                <span className="font-serif font-bold text-xs uppercase tracking-wide">
                  B. WhatsApp Webhook Callback URL
                </span>
              </div>
              <Badge variant="green" size="sm">Realtime Ingestion</Badge>
            </div>

            <p className="text-[11px] text-[#202020]/70 font-sans">
              Receives live customer inbound messages, read receipts, delivery reports, and audio notes.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#202020]/60">
                Webhook Callback URL
              </label>
              <div className="flex items-center gap-2 bg-white border-2 border-[#202020] rounded-[14px] p-2">
                <code className="text-[11px] font-mono text-[#202020] truncate flex-1 select-all">
                  {webhookCallbackUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(webhookCallbackUrl, 'webhook')}
                  className="h-7 px-2.5 text-[11px] font-bold gap-1 shrink-0"
                >
                  {copiedField === 'webhook' ? (
                    <>
                      <Check className="h-3 w-3 text-[#065f46]" />
                      <span className="text-[#065f46]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#202020]/60">
                Verify Token
              </label>
              <div className="flex items-center gap-2 bg-white border-2 border-[#202020] rounded-[14px] p-2">
                <code className="text-[11px] font-mono text-[#202020] truncate flex-1 select-all font-bold">
                  {verifyToken}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(verifyToken, 'token')}
                  className="h-7 px-2.5 text-[11px] font-bold gap-1 shrink-0"
                >
                  {copiedField === 'token' ? (
                    <>
                      <Check className="h-3 w-3 text-[#065f46]" />
                      <span className="text-[#065f46]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-[#202020]/30 rounded-[12px] text-[10px] text-[#202020]/80">
              <strong className="text-[#202020]">Configure in Meta:</strong>
              <div className="mt-0.5 font-mono text-[#202020]/90">
                Meta Developer Dashboard &rarr; WhatsApp &rarr; Configuration &rarr; Webhook
              </div>
              <div className="mt-1 text-[9px] text-[#202020]/70">
                Subscribe to field: <strong className="text-[#202020]">messages</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-white border-2 border-[#202020] rounded-[16px] flex items-center gap-2.5 text-[11px] text-[#202020]/80 font-sans">
          <ShieldCheck className="h-4 w-4 text-[#72A4F2] shrink-0" />
          <span>
            <strong>Cryptographic Protection:</strong> Inbound webhook payloads are verified using HMAC-SHA256 signatures via <code className="font-mono bg-[#F4EFE7] px-1 py-0.5 rounded">X-Hub-Signature-256</code>. Raw App Secrets and permanent System Tokens are never exposed in client bundles.
          </span>
        </div>
      </div>
    </Card>
  );
};
