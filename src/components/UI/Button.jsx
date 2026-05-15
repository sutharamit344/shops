import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, disabled = false, icon: Icon, iconPosition = 'left', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap';

  const sizes = {
    sm: 'h-8 px-3 text-[12px] rounded-md',
    md: 'h-9 px-4 text-[13px] rounded-lg',
    lg: 'h-10 px-5 text-[14px] rounded-lg',
    xl: 'h-12 px-6 text-[15px] rounded-lg',
  };

  const variants = {
    primary: 'bg-[#FF6A00] text-white hover:bg-[#E65F00] shadow-sm',
    outline: 'bg-transparent border border-black/[0.08] text-[#0A0A0F]/70 hover:border-black/[0.15] hover:text-[#0A0A0F] hover:bg-black/[0.02]',
    secondary: 'bg-black/[0.04] text-[#0A0A0F]/70 hover:bg-black/[0.07] hover:text-[#0A0A0F]',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#21BD5C] shadow-sm shadow-[#25D366]/10',
    dark: 'bg-[#0A0A0F] text-white hover:bg-[#1a1a24] shadow-sm',
    ghost: 'bg-transparent text-[#0A0A0F]/45 hover:text-[#0A0A0F] hover:bg-black/[0.04]',
    glass: 'bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md',
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 13 : 15} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 13 : 15} />}
        </>
      )}
    </button>
  );
};

export default Button;
