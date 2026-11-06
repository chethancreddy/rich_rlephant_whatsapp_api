import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'charcoal' | 'green' | 'yellow' | 'red' | 'cream';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'charcoal',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  const variantStyles = {
    // Soft sky blue (accent from design.md)
    blue: 'bg-[#BED0F7]/50 text-[#202020] border-1.5 border-[#72A4F2]',
    // Core ink charcoal
    charcoal: 'bg-[#F4EFE7] text-[#202020] border-1.5 border-[#202020]',
    // Friendly green status
    green: 'bg-[#ecfdf5] text-[#065f46] border-1.5 border-[#6ee7b7]',
    // Warm warning yellow
    yellow: 'bg-[#fef9c3] text-[#854d0e] border-1.5 border-[#fde047]',
    // Reserved error red (from design.md #E35A4F)
    red: 'bg-[#fee2e2] text-[#991b1b] border-1.5 border-[#E35A4F]',
    // Neutral cream
    cream: 'bg-[#F9F6F1] text-[#202020] border-1.5 border-[#D8D0C4]',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
