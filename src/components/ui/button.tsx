import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-[24px] cursor-pointer active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[46px]',
    lg: 'text-base px-7 py-3.5 gap-2.5 min-h-[56px]',
  };

  const variantStyles = {
    // Soft sky blue with deep charcoal text (from design.md)
    primary: 'bg-[#72A4F2] hover:bg-[#9CBDF5] text-[#202020] border-2 border-[#202020] focus:ring-[#72A4F2]',
    // Transparent with crisp charcoal border (from design.md)
    secondary: 'bg-transparent hover:bg-[#202020]/5 text-[#202020] border-2 border-[#202020] focus:ring-[#202020]',
    // Clean white surface with warm neutral border
    outline: 'bg-white hover:bg-[#F9F6F1] text-[#202020] border-2 border-[#D8D0C4] hover:border-[#202020] focus:ring-[#D8D0C4]',
    // Warm reserved alert tone
    danger: 'bg-[#E35A4F] hover:bg-[#E35A4F]/90 text-white border-2 border-[#202020] focus:ring-[#E35A4F]',
    // Link / tertiary style
    ghost: 'hover:bg-[#F4EFE7] text-[#202020] border-2 border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-0.5 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
