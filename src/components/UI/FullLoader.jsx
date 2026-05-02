"use client";

import React from "react";
import Image from "next/image";
import { BRAND } from "@/lib/config";

const FullLoader = ({ message = "Loading experience..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FF6A00]/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#1A1F36]/5 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-[0_20px_50px_rgba(255,106,0,0.15)] border border-[#FF6A00]/10 flex items-center justify-center p-4 animate-in zoom-in duration-500">
            <Image
              src="/sb-logo.png"
              alt={BRAND}
              width={60}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          {/* Circular Progress Ring */}
          <div className="absolute inset-[-8px] rounded-[34px] border-2 border-transparent border-t-[#FF6A00] border-r-[#FF6A00]/20 animate-spin duration-[1.5s]" />
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-[18px] font-black tracking-tighter text-[#1A1F36]">
            Shop<span className="text-[#FF6A00]">Bajar</span>
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-[13px] font-bold text-[#1A1F36]/30 uppercase tracking-[0.2em] animate-pulse">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-20">
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#1A1F36] to-transparent" />
        <span className="text-[10px] font-black tracking-widest uppercase">Premium Marketplace</span>
      </div>
    </div>
  );
};

export default FullLoader;
