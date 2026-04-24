import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'font-black uppercase tracking-tighter transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group';

  const sizes = {
    sm: 'py-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-md',
    md: 'py-3 px-6 text-[11px] font-black uppercase tracking-[0.2em] rounded-md shadow-md',
    lg: 'py-4 px-10 text-xs font-black uppercase tracking-[0.3em] rounded-md shadow-md',
    xl: 'py-5 px-12 text-sm font-black uppercase tracking-[0.4em] rounded-md shadow-md',
  };

  const variants = {
    primary: 'bg-primary text-white shadow-primary/20 hover:shadow-primary/30',
    secondary: 'bg-cream text-navy border border-primary/10 shadow-cream/20',
    whatsapp: 'bg-whatsapp text-white shadow-whatsapp/20 hover:shadow-whatsapp/30',
    outline: 'bg-white border-2 border-primary text-navy hover:bg-primary hover:text-white shadow-cream/20',
    dark: 'bg-navy text-white shadow-navy/20 hover:bg-black',
    glass: 'glass text-navy hover:bg-white/20 border-white/40 shadow-xl',
    ghost: 'bg-transparent text-navy/20 hover:text-navy hover:bg-navy/5 shadow-none border-none',
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
