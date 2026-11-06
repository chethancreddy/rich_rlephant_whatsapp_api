'use client';

import React from 'react';
import { Bell, HelpCircle, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BRAND_CONFIG } from '@/lib/design-tokens';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard Overview',
  subtitle = 'Enterprise WhatsApp Business Cloud Platform',
}) => {
  return (
    <header className="h-20 bg-white border-b-2 border-[#202020] px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-bold font-serif text-[#202020] leading-tight">{title}</h1>
        <p className="text-xs text-[#202020]/60 font-sans mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Compliance Notice Badge */}
        <div className="hidden lg:flex items-center gap-2">
          <Badge variant="blue" size="md" className="gap-2">
            <span className="w-2 h-2 rounded-full bg-[#202020]"></span>
            Official Meta Cloud API v21.0
          </Badge>
        </div>

        {/* Notifications */}
        <button
          className="p-2.5 text-[#202020] bg-[#F4EFE7] hover:bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] transition-colors relative"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#72A4F2] border border-[#202020]"></span>
        </button>

        {/* Help */}
        <button
          className="p-2.5 text-[#202020] bg-[#F4EFE7] hover:bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] transition-colors"
          title="Help & Documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="h-6 w-0.5 bg-[#D8D0C4]"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 bg-[#F9F6F1] border-2 border-[#202020] px-3 py-1.5 rounded-[22px]">
          <div className="w-8 h-8 rounded-full bg-[#72A4F2] border-1.5 border-[#202020] flex items-center justify-center text-[#202020] text-xs font-bold font-serif">
            CR
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-[#202020] leading-none">Chethan Reddy</span>
            <span className="text-[10px] text-[#202020]/60 font-semibold flex items-center gap-1 mt-0.5">
              <UserCheck className="h-2.5 w-2.5 text-[#72A4F2]" />
              Workspace Owner
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
