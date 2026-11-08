'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, HelpCircle, UserCheck, LogOut, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

interface UserState {
  displayName: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard Overview',
  subtitle = 'Enterprise WhatsApp Business Cloud Platform',
}) => {
  const router = useRouter();
  const [user, setUser] = useState<UserState>({
    displayName: 'Chethan Reddy',
    email: 'demo@rich-rlephant.com',
    role: 'workspace_admin',
    isSuperAdmin: false,
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser({
            displayName: data.user.displayName || 'User',
            email: data.user.email,
            role: data.user.role || 'agent',
            isSuperAdmin: Boolean(data.user.isSuperAdmin),
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-20 bg-white border-b-2 border-[#202020] px-6 sm:px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-bold font-serif text-[#202020] leading-tight">{title}</h1>
        <p className="text-xs text-[#202020]/60 font-sans mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Compliance Notice Badge */}
        <div className="hidden lg:flex items-center gap-2">
          <Badge variant="blue" size="md" className="gap-2">
            <span className="w-2 h-2 rounded-full bg-[#202020]"></span>
            Official Meta Cloud API v21.0
          </Badge>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 bg-[#F9F6F1] border-2 border-[#202020] px-3 py-1.5 rounded-[22px]">
          <div className="w-8 h-8 rounded-full bg-[#72A4F2] border-1.5 border-[#202020] flex items-center justify-center text-[#202020] text-xs font-bold font-serif">
            {getInitials(user.displayName)}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-[#202020] leading-none">
              {user.displayName}
            </span>
            <span className="text-[10px] text-[#202020]/60 font-semibold flex items-center gap-1 mt-0.5 uppercase tracking-wider">
              {user.isSuperAdmin ? (
                <>
                  <Shield className="h-2.5 w-2.5 text-amber-600" />
                  Super Admin
                </>
              ) : (
                <>
                  <UserCheck className="h-2.5 w-2.5 text-[#72A4F2]" />
                  {user.role.replace('_', ' ')}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Secure Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2.5 text-[#202020] bg-[#F4EFE7] hover:bg-red-50 hover:text-red-700 hover:border-red-600 border-2 border-[#202020] rounded-[18px] transition-colors shadow-[2px_2px_0px_#202020]"
          title="Sign Out / Invalidate Session"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
