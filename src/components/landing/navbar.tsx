'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Send,
  FileCode2,
  Bot,
  Layers,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  onOpenDemo: () => void;
  onOpenTrial: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemo, onOpenTrial }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F4EFE7]/90 backdrop-blur-md border-b-2 border-[#202020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-[14px] bg-[#202020] text-[#72A4F2] border-2 border-[#202020] flex items-center justify-center font-serif font-black text-xl shadow-[2px_2px_0px_#202020] group-hover:bg-[#72A4F2] group-hover:text-[#202020] transition-colors">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-[#202020] tracking-tight leading-none">
                Rich Rlephant
              </span>
              <span className="font-mono text-[10px] text-[#202020]/70 font-semibold tracking-widest uppercase mt-0.5">
                Marketing WhatsApp API
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-[#202020]">
            {/* Features Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className="flex items-center gap-1.5 hover:text-[#72A4F2] transition-colors py-2"
              >
                <span>Features</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <div className="absolute top-full left-0 w-80 bg-white border-2 border-[#202020] rounded-[22px] shadow-[6px_6px_0px_#202020] p-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 space-y-2 mt-1">
                <a
                  href="#campaigns"
                  className="flex items-start gap-3 p-2.5 rounded-[14px] hover:bg-[#F9F6F1] transition-colors"
                >
                  <Send className="h-4 w-4 text-[#72A4F2] mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Bulk WhatsApp Campaigns</span>
                    <span className="text-[10px] text-[#202020]/60 font-normal">High-volume broadcasts with verified templates</span>
                  </div>
                </a>
                <a
                  href="#inbox"
                  className="flex items-start gap-3 p-2.5 rounded-[14px] hover:bg-[#F9F6F1] transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-[#065f46] mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Shared Multi-Agent Inbox</span>
                    <span className="text-[10px] text-[#202020]/60 font-normal">Collision locking &amp; 24h customer window</span>
                  </div>
                </a>
                <a
                  href="#templates"
                  className="flex items-start gap-3 p-2.5 rounded-[14px] hover:bg-[#F9F6F1] transition-colors"
                >
                  <FileCode2 className="h-4 w-4 text-[#b45309] mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Meta Template Builder</span>
                    <span className="text-[10px] text-[#202020]/60 font-normal">In-dashboard builder with live phone preview</span>
                  </div>
                </a>
                <a
                  href="#automation"
                  className="flex items-start gap-3 p-2.5 rounded-[14px] hover:bg-[#F9F6F1] transition-colors"
                >
                  <Bot className="h-4 w-4 text-[#6366f1] mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Chatbot &amp; AI Automation</span>
                    <span className="text-[10px] text-[#202020]/60 font-normal">No-code visual workflows &amp; smart routing</span>
                  </div>
                </a>
              </div>
            </div>

            <a href="#integrations" className="hover:text-[#72A4F2] transition-colors">
              Integrations
            </a>
            <a href="#developers" className="hover:text-[#72A4F2] transition-colors">
              Developer APIs
            </a>
            <a href="#pricing" className="hover:text-[#72A4F2] transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#72A4F2] transition-colors">
              FAQ
            </a>
            <a href="#contact" className="hover:text-[#72A4F2] transition-colors">
              Contact
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="font-bold text-xs bg-white">
                Log In
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenDemo}
              className="font-bold text-xs bg-white hidden md:inline-flex"
            >
              Book a Demo
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onOpenTrial}
              className="font-bold text-xs gap-1.5 shadow-[3px_3px_0px_#202020]"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Button variant="primary" size="sm" onClick={onOpenTrial} className="text-xs px-2.5">
              Trial
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 border-2 border-[#202020] rounded-[12px] bg-white text-[#202020]"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-[#202020] bg-white p-6 space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-3 pb-3 border-b-2 border-[#202020]">
            <a
              href="#campaigns"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] text-xs font-bold"
            >
              Bulk Campaigns
            </a>
            <a
              href="#inbox"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] text-xs font-bold"
            >
              Shared Inbox
            </a>
            <a
              href="#templates"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] text-xs font-bold"
            >
              Templates
            </a>
            <a
              href="#automation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] text-xs font-bold"
            >
              Chatbots
            </a>
            <a
              href="#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] text-xs font-bold"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] text-xs font-bold"
            >
              FAQ
            </a>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" size="md" className="w-full font-bold">
                Log In to Workspace
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full font-bold"
            >
              Book a Live Demo
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTrial();
              }}
              className="w-full font-bold"
            >
              Start Free Trial (14 Days)
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
