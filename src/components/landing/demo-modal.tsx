'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, Send, ShieldCheck, Smartphone, Building, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    companyName: '',
    teamSize: '5-20',
    primaryGoal: 'bulk_campaigns',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate enquiry submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFormData({
      fullName: '',
      email: '',
      whatsappNumber: '',
      companyName: '',
      teamSize: '5-20',
      primaryGoal: 'bulk_campaigns',
      notes: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#202020]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] max-w-xl w-full border-2 border-[#202020] shadow-[8px_8px_0px_#202020] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-6 bg-[#202020] text-white flex items-center justify-between border-b-2 border-[#202020]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#72A4F2] text-[#202020] flex items-center justify-center font-serif font-black text-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-white">Book a Live Platform Demo</h3>
                <Badge variant="blue" size="sm">Guided Walkthrough</Badge>
              </div>
              <p className="text-xs text-white/70 font-sans mt-0.5">
                Rich Rlephant Marketing Whatsapp API Enterprise Solution
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 bg-[#F9F6F1]">
            <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border-2 border-[#202020] flex items-center justify-center mx-auto text-[#065f46]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-serif font-bold text-2xl text-[#202020]">Demo Request Received!</h4>
            <p className="text-xs text-[#202020]/80 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{formData.fullName || 'there'}</strong>. Our WhatsApp API solutions engineer will reach out to <strong>{formData.email}</strong> and on WhatsApp at <strong>{formData.whatsappNumber}</strong> within 2 business hours to schedule your walkthrough.
            </p>
            <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px] max-w-sm mx-auto text-left text-xs space-y-1.5 font-mono">
              <div><strong>Company:</strong> {formData.companyName || 'Registered Org'}</div>
              <div><strong>Team Size:</strong> {formData.teamSize} seats</div>
              <div><strong>Primary Focus:</strong> {formData.primaryGoal.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="md" onClick={handleReset} className="font-bold">
                Close &amp; Return to Landing Page
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-[#202020]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#72A4F2]" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mansoor"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#72A4F2]" />
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="tariq@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-[#065f46]" />
                  WhatsApp Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+971 50 123 4567"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-[#202020]" />
                  Company / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Retail LLC"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Team Size (Seats)</label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
                >
                  <option value="1-4">1 - 4 Agents</option>
                  <option value="5-20">5 - 20 Agents</option>
                  <option value="21-50">21 - 50 Agents</option>
                  <option value="50+">50+ Enterprise Team</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Primary Use Case</label>
                <select
                  value={formData.primaryGoal}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
                >
                  <option value="bulk_campaigns">Bulk WhatsApp Marketing Broadcasts</option>
                  <option value="shared_inbox">Shared Support Inbox &amp; Agent Routing</option>
                  <option value="chatbot_automation">No-Code Chatbots &amp; AI Automation</option>
                  <option value="developer_api">Custom Developer APIs &amp; Webhooks</option>
                  <option value="full_platform">All-in-One Enterprise WhatsApp Platform</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Additional Notes / Requirements (Optional)</label>
              <textarea
                rows={2}
                placeholder="Tell us about your message volume or specific integration needs (e.g. Shopify, HubSpot)..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none resize-none"
              />
            </div>

            <div className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] flex items-center gap-2 text-[11px] text-[#202020]/70">
              <ShieldCheck className="h-4 w-4 text-[#065f46] shrink-0" />
              <span>We respect your privacy. No spam. Official Meta Cloud API compliance guaranteed.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-[#202020]">
              <Button type="button" variant="outline" size="sm" onClick={handleReset} className="font-bold">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="font-bold gap-1.5">
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? 'Scheduling Demo...' : 'Confirm Demo Booking'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
