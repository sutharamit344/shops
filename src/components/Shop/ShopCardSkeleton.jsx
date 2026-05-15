"use client";

import React from "react";

export const ShopCardSkeleton = ({ variant = "grid" }) => {
  if (variant === "list") {
    return (
      <div className="bg-white rounded-lg border border-black/[0.06] p-3.5 flex items-center gap-3.5 overflow-hidden relative">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="w-12 h-12 rounded-lg bg-black/[0.05] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-28 bg-black/[0.05] rounded" />
          <div className="h-3.5 w-40 bg-black/[0.07] rounded" />
          <div className="h-2.5 w-20 bg-black/[0.04] rounded" />
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-black/[0.04]" />
          <div className="w-8 h-8 rounded-lg bg-black/[0.04]" />
          <div className="w-8 h-8 rounded-lg bg-black/[0.04]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-black/[0.06] overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 animate-shimmer" />
      {/* Accent stripe */}
      <div className="h-[2px] w-full bg-black/[0.04]" />
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-black/[0.06]" />
          <div className="h-5 w-20 bg-black/[0.04] rounded-md" />
        </div>
        {/* Name & rating */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 bg-black/[0.07] rounded" />
          <div className="h-3 w-16 bg-black/[0.04] rounded" />
        </div>
        {/* Footer */}
        <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between mt-auto">
          <div className="h-3 w-24 bg-black/[0.05] rounded" />
          <div className="flex gap-1">
            <div className="w-7 h-7 rounded-lg bg-black/[0.04]" />
            <div className="w-7 h-7 rounded-lg bg-black/[0.04]" />
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
