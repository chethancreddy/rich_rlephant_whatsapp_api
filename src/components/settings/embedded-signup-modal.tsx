'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Smartphone, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EmbeddedSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmbeddedSignupModal: React.FC<EmbeddedSignupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'intro' | 'connecting' | 'success'>('intro');

  if (!isOpen) return null;

  const handleSimulateEmbeddedSignup = async () => {
    setIsProcessing(true);
    setStep('connecting');

    try {
      // Simulate Meta OAuth popup & exchange with our backend API
      const res = await fetch('/api/meta/embedded-signup/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'meta_oauth_code_mock_sample',
          wabaId: '104829104820194',
          businessId: 'biz_dubai_retail_001',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep('success');
      } else {
        alert(data.error || 'Connection failed');
        setStep('intro');
      }
    } catch (err) {
      alert('Network error connecting to Meta Embedded Signup');
      setStep('intro');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden border-2 border-[#202020]">
        <div className="px-8 py-5 border-b-2 border-[#202020] flex items-center justify-between bg-[#F9F6F1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[12px] bg-[#72A4F2] border-1.5 border-[#202020] flex items-center justify-center text-[#202020]">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-[#202020]">Meta Embedded Signup</h3>
              <p className="text-[11px] text-[#202020]/60">Official WhatsApp Business Onboarding</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#202020] hover:text-black font-black text-xl">
            ✕
          </button>
        </div>

        <div className="p-8 text-xs text-[#202020]">
          {step === 'intro' && (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#202020]/80 font-medium">
                Connect your business's WhatsApp Business Account (WABA) and phone numbers directly using Meta's official onboarding.
              </p>

              <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[20px] space-y-2">
                <span className="font-bold block text-[#202020] font-serif">Permissions Requested by App:</span>
                <ul className="space-y-1.5 text-[11px] text-[#202020]/70 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#202020]"></span>
                    <code>whatsapp_business_messaging</code> (Send & Receive messages)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#202020]"></span>
                    <code>whatsapp_business_management</code> (Sync & Manage templates)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#202020]"></span>
                    <code>business_management</code> (WABA asset sharing)
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-[#ecfdf5] border-2 border-[#202020] rounded-[18px] flex items-center gap-2.5 text-[#065f46]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#065f46]" />
                <span className="font-semibold text-[11px]">
                  Tokens are encrypted with AES-256-GCM and never exposed in frontend code.
                </span>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full gap-2 text-sm"
                  onClick={handleSimulateEmbeddedSignup}
                >
                  Continue with Facebook Login for Business
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="h-8 w-8 text-[#72A4F2] animate-spin mx-auto" />
              <h4 className="font-bold font-serif text-sm">Authorizing with Meta Platforms...</h4>
              <p className="text-xs text-[#202020]/60 max-w-xs mx-auto">
                Exchanging temporary OAuth grant for permanent encrypted System User Access Token.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#ecfdf5] border-2 border-[#202020] flex items-center justify-center mx-auto text-[#065f46]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold font-serif text-base text-[#202020]">WABA Connected Successfully!</h4>
                <p className="text-xs text-[#202020]/70 mt-1">
                  WABA ID: 104829104820194 • Senders registered and ready for campaigns.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

