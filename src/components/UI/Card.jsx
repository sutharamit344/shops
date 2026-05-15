import React from 'react';

const Card = ({ children, className = '', hover = true, variant = 'default', padding = true, ...props }) => {
  const baseStyles = 'rounded-lg border transition-all duration-300 overflow-hidden';
  
  const variants = {
    default: 'bg-white border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
    dark: 'bg-[#0A0A0F] border-white/[0.08] text-white',
    muted: 'bg-black/[0.02] border-black/[0.05]',
    glass: 'bg-white/70 backdrop-blur-xl border-white/30 shadow-sm',
  };

  const hoverStyles = hover ? 'hover:border-black/[0.12] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]' : '';
  const paddingStyle = padding ? 'p-4 md:p-6' : '';

  return (
    <div 
      className={`${baseStyles} ${variants[variant] || variants.default} ${hoverStyles} ${paddingStyle} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
