import React from 'react';

const Card = ({ children, className = '', hover = true, variant = 'default', ...props }) => {
  const baseStyles = 'rounded-2xl border transition-all duration-300';
  
  const variants = {
    default: 'bg-white border-[#1A1F36]/[0.07]',
    navy: 'bg-[#1A1F36] border-white/10 text-white',
    cream: 'bg-[#FFF8F3] border-[#1A1F36]/[0.07]',
    surface: 'bg-[#FAFAF8] border-[#1A1F36]/[0.07]',
  };

  const hoverStyles = hover ? 'hover:border-[#FF6B35]/30 hover:-translate-y-0.5' : '';

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
