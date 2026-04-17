import React from 'react';

const GlobalLoading = () => {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-2xl font-black text-navy animate-pulse">ShopSetu</h2>
    </div>
  );
};

export default GlobalLoading;
