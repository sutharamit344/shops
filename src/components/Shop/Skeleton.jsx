import React from 'react';

const ShopSkeleton = () => {
  return (
    <div className="bg-cream min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-cream h-20 animate-pulse flex items-center justify-between px-4 max-w-4xl mx-auto w-full">
        <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* About Skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream space-y-4 animate-pulse">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-6 w-40 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
          </div>
        </div>

        {/* Menu Skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-40 bg-gray-200 rounded-lg mb-4 ml-1 animate-pulse"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-cream flex justify-between animate-pulse">
              <div className="h-5 w-32 bg-gray-100 rounded"></div>
              <div className="h-5 w-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>

        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopSkeleton;
