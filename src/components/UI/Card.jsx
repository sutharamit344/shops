import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-2xl p-6 shadow-sm border border-cream hover:shadow-md transition-shadow ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
