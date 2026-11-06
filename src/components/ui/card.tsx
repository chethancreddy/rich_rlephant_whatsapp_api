import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  borderStyle?: 'solid' | 'soft' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  borderStyle = 'solid',
}) => {
  const borderClasses = {
    solid: 'border-2 border-[#202020]',
    soft: 'border-2 border-[#D8D0C4]',
    none: 'border-0',
  };

  return (
    <div
      className={`bg-white ${borderClasses[borderStyle]} rounded-[28px] overflow-hidden transition-all duration-150 ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-4.5 border-b-2 border-[#F4EFE7] flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-base font-bold font-serif text-[#202020] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#202020]/60 mt-0.5 font-sans">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
