import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, disabled = false, icon: Icon, iconPosition = 'left', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizes = {
    sm: 'h-8 px-4 text-xs rounded-lg',
    md: 'h-10 px-5 text-[13px] rounded-xl',
    lg: 'h-12 px-7 text-[15px] rounded-xl',
    xl: 'h-14 px-8 text-base rounded-2xl',
  };

  const variants = {
    primary: 'bg-[#FF6B35] text-white hover:bg-[#E85C25]',
    outline: 'bg-white border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#1EB855]',
    dark: 'bg-[#1A1F36] text-white hover:bg-slate-800',
    ghost: 'bg-transparent text-[#1A1F36]/60 hover:text-[#1A1F36] hover:bg-[#1A1F36]/[0.06]',
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  );
};

export default Button;
