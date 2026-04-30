"use client";

import React from "react";

export const ShopCardSkeleton = ({ variant = "grid" }) => {
  if (variant === "list") {
    return (
      <div className="bg-white rounded-2xl border border-[#1A1F36]/[0.06] p-4 flex items-center gap-4 animate-pulse">
        {/* Logo */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gray-100 flex-shrink-0" />
        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 bg-gray-100 rounded-full" />
          <div className="h-4 w-40 bg-gray-200 rounded-full" />
          <div className="h-3 w-24 bg-gray-100 rounded-full" />
        </div>
        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gray-100" />
          <div className="w-8 h-8 rounded-xl bg-gray-100" />
          <div className="w-8 h-8 rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#1A1F36]/[0.06] overflow-hidden animate-pulse h-full flex flex-col">
      {/* Top stripe */}
      <div className="h-[2px] w-full bg-gray-100" />
      <div className="p-4 md:p-5 flex flex-col flex-1">
        {/* Logo + category row */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100" />
          <div className="h-6 w-24 bg-gray-100 rounded-full" />
        </div>
        {/* Name */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 w-36 bg-gray-200 rounded-full" />
          <div className="h-3 w-12 bg-gray-100 rounded-full" />
          <div className="h-3 w-full bg-gray-100 rounded-full mt-2" />
          <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
        </div>
        {/* Footer */}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
          <div className="h-3 w-24 bg-gray-100 rounded-full" />
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-xl bg-gray-100" />
            <div className="w-7 h-7 rounded-xl bg-gray-100" />
            <div className="w-7 h-7 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShopCardSkeletonGrid = ({ count = 6, variant = "grid" }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <ShopCardSkeleton key={i} variant={variant} />
    ))}
  </>
);

export default ShopCardSkeleton;
