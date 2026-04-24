import React from 'react';

const Card = ({ children, className = '', hover = true, glass = false, ...props }) => {
  return (
    <div 
      className={`${glass ? 'glass' : 'bg-white'} rounded-md p-6 border border-navy/10 shadow-sm transition-all duration-300 ${hover ? 'hover:shadow-md' : ''} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
