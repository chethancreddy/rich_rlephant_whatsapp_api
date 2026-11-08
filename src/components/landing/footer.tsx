'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Smartphone, Globe, Lock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#202020] text-white border-t-2 border-[#202020] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#72A4F2] text-[#202020] font-serif font-black text-xl flex items-center justify-center border-2 border-white">
                R
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-white tracking-tight">
                  Rich Rlephant
                </span>
                <span className="font-mono text-[10px] text-[#72A4F2] font-semibold tracking-widest uppercase">
                  Marketing WhatsApp API
                </span>
              </div>
            </Link>

            <p className="text-white/70 text-xs font-sans leading-relaxed max-w-sm">
              Enterprise WhatsApp Business Cloud API SaaS platform. Delivering broadcast campaigns, multi-agent shared inbox, no-code visual chatbot automation, and developer APIs with 99.8% inbox delivery.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="blue" size="sm">Meta Cloud API v21.0</Badge>
              <Badge variant="green" size="sm">100% RLS Security</Badge>
              <Badge variant="charcoal" size="sm">Neon PostgreSQL</Badge>
            </div>
          </div>

          {/* Column 1: Platform Capabilities */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#72A4F2] uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-white/75 font-sans">
              <li>
                <a href="#campaigns" className="hover:text-white transition-colors">
                  Bulk WhatsApp Campaigns
                </a>
              </li>
              <li>
                <a href="#inbox" className="hover:text-white transition-colors">
                  Shared Multi-Agent Inbox
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-white transition-colors">
                  In-Dashboard Template Studio
                </a>
              </li>
              <li>
                <a href="#automation" className="hover:text-white transition-colors">
                  No-Code Chatbot Workflows
                </a>
              </li>
              <li>
                <a href="#crm" className="hover:text-white transition-colors">
                  Contact CRM &amp; Opt-In Audit
                </a>
              </li>
              <li>
                <a href="#developers" className="hover:text-white transition-colors">
                  REST API &amp; Webhooks
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#72A4F2] uppercase tracking-wider">
              Solutions
            </h4>
            <ul className="space-y-2 text-white/75 font-sans">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  E-Commerce &amp; Retail
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Customer Support Teams
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Marketing &amp; Growth Agencies
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Financial &amp; Professional Services
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Healthcare &amp; Appointments
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance & Security */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#72A4F2] uppercase tracking-wider">
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2 text-white/75 font-sans">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Workspace Login
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Security Architecture (RLS)
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Acceptable Use Policy
                </span>
              </li>
              <li>
                <a href="/api/docs/openapi.json" target="_blank" className="hover:text-white transition-colors flex items-center gap-1 font-mono">
                  <span>OpenAPI 3.0 Spec</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            &copy; 2026 Rich Rlephant Marketing Whatsapp API. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-white/70">
              <ShieldCheck className="h-4 w-4 text-[#72A4F2]" />
              Official Meta Cloud API Integrations
            </span>
            <span className="flex items-center gap-1.5 text-white/70">
              <Lock className="h-4 w-4 text-[#065f46]" />
              AES-256-GCM Cryptographic Vault
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

