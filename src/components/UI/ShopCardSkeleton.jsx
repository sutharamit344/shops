import React from 'react';

const ShopCardSkeleton = ({ variant = "grid" }) => {
  if (variant === "list") {
    return (
      <div className="bg-white rounded-2xl p-4 flex items-center gap-4 animate-pulse border border-black/[0.04]">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 bg-gray-100 rounded-full"></div>
          <div className="h-5 w-3/4 bg-gray-100 rounded-lg"></div>
          <div className="h-3 w-1/2 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="w-9 h-9 bg-gray-50 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse border border-black/[0.04] h-full flex flex-col">
      <div className="h-[2px] w-full bg-gray-100"></div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
          <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
        </div>
        <div className="space-y-3 flex-1">
          <div className="h-5 w-3/4 bg-gray-100 rounded-lg"></div>
          <div className="h-3 w-1/4 bg-gray-100 rounded-lg"></div>
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full bg-gray-50 rounded"></div>
            <div className="h-3 w-5/6 bg-gray-50 rounded"></div>
          </div>
        </div>
        <div className="pt-4 border-t border-black/[0.04] mt-4 flex justify-between items-center">
          <div className="h-3 w-24 bg-gray-100 rounded"></div>
          <div className="flex gap-1.5">
            <div className="w-8 h-8 bg-gray-50 rounded-xl"></div>
            <div className="w-8 h-8 bg-gray-50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCardSkeleton;
