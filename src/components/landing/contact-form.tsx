'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Mail, MessageSquare, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Enterprise WhatsApp Solutions Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <div id="contact" className="py-20 bg-[#F4EFE7] border-b-2 border-[#202020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="blue" size="md">Get in Touch</Badge>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#202020] tracking-tight">
              Ready to Upgrade Your WhatsApp Business Operations?
            </h2>
            <p className="text-xs text-[#202020]/80 font-sans leading-relaxed">
              Have questions about Meta Cloud API onboarding, custom rate limits, or migrating from existing WhatsApp providers? Our solutions engineering team is here to assist.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px] flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#ecfdf5] border-2 border-[#202020] flex items-center justify-center text-[#065f46] shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold block text-[#202020]">Enterprise Support Desk</span>
                  <a href="mailto:support@richrlephant.com" className="text-[#202020]/70 font-mono hover:underline">
                    support@richrlephant.com
                  </a>
                </div>
              </div>

              <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px] flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#ecfdf5] border-2 border-[#202020] flex items-center justify-center text-[#065f46] shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold block text-[#202020]">Official WhatsApp Helpline</span>
                  <span className="text-[#065f46] font-mono font-bold block">+971 50 444 5500</span>
                </div>
              </div>

              <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px] flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#ecfdf5] border-2 border-[#202020] flex items-center justify-center text-[#065f46] shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold block text-[#202020]">Headquarters</span>
                  <span className="text-[#202020]/70">DIFC Innovation Hub, Dubai, United Arab Emirates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-[32px] border-2 border-[#202020] shadow-[8px_8px_0px_#202020]">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border-2 border-[#202020] flex items-center justify-center mx-auto text-[#065f46]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-serif font-bold text-2xl text-[#202020]">Message Successfully Sent!</h4>
                <p className="text-xs text-[#202020]/80 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <strong>{formData.name}</strong>. A dedicated WhatsApp technical specialist has received your inquiry and will respond within 4 hours.
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        subject: 'Enterprise WhatsApp Solutions Inquiry',
                        message: '',
                      });
                    }}
                    className="font-bold"
                  >
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#202020]">
                <h3 className="font-serif font-bold text-xl text-[#202020]">Send Us a Direct Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chethan Reddy"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Business Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="chethan@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold">WhatsApp Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+971 50 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold">Subject / Interest</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none"
                    >
                      <option value="Enterprise WhatsApp Solutions Inquiry">Enterprise Solutions &amp; Pricing</option>
                      <option value="Meta WABA Onboarding Assistance">Meta WABA Onboarding &amp; Verification</option>
                      <option value="High Volume Bulk Campaigns">High Volume Message Broadcasts</option>
                      <option value="API & Webhook Custom Integration">Custom Developer API &amp; Webhooks</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">How can we help your team? *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your current setup, expected message volume, or specific features you need..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 bg-white border-2 border-[#202020] rounded-[14px] text-xs focus:ring-2 focus:ring-[#72A4F2] outline-none resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    className="w-full font-bold gap-1.5 shadow-[4px_4px_0px_#202020]"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Transmitting Message...' : 'Submit Message'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

