import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-opacity-90',
    whatsapp: 'bg-whatsapp text-white hover:bg-opacity-90',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    dark: 'bg-navy text-white hover:bg-opacity-90',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
