'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Building, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    workEmail: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate instant workspace provisioning
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      router.push('/dashboard');
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-[#202020]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] max-w-md w-full border-2 border-[#202020] shadow-[8px_8px_0px_#202020] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-[#202020] text-white flex items-center justify-between border-b-2 border-[#202020]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#72A4F2] text-[#202020] flex items-center justify-center font-serif font-black text-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-white">Start Your 14-Day Free Trial</h3>
                <Badge variant="green" size="sm">No CC Required</Badge>
              </div>
              <p className="text-[11px] text-white/70 font-sans mt-0.5">
                Instant access to Rich Rlephant Marketing Whatsapp API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-[#202020]">
          <div className="p-3 bg-[#ecfdf5] border-2 border-[#202020] rounded-[16px] flex items-center gap-2 text-[11px] text-[#065f46]">
            <Sparkles className="h-4 w-4 shrink-0 text-[#065f46]" />
            <span>Includes 1,000 complimentary test conversations, full Shared Inbox, and Template Builder.</span>
          </div>

          <div className="space-y-1">
            <label className="font-bold flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-[#72A4F2]" />
              Company / Workspace Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Dubai Retail"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#72A4F2]" />
              Work Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="chethan@company.com"
              value={formData.workEmail}
              onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#72A4F2]" />
              Create Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
            />
          </div>

          <div className="space-y-2 pt-1 text-[11px] text-[#202020]/70 font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#065f46]" />
              <span>Full Meta Cloud API v21.0 compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#065f46]" />
              <span>Strict Row-Level Security tenant isolation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#065f46]" />
              <span>Cancel or upgrade anytime with zero lock-in</span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t-2 border-[#202020]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="font-bold">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="font-bold gap-1.5">
              <span>{isSubmitting ? 'Creating Workspace...' : 'Launch Free Workspace'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

