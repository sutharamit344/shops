"use client";

import React from "react";
import Image from "next/image";
import { BRAND } from "@/lib/config";

const FullLoader = ({ message = "Loading experience..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAFAF8] overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF6A00]/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1A1F36]/5 blur-[120px] rounded-full animate-pulse delay-1000" />

      {/* Center Content */}
      <div className="relative flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="relative mb-12 group">
          {/* External Rotating Rings */}
          <div className="absolute inset-[-15px] border border-dashed border-[#FF6A00]/20 rounded-full animate-rotate-slow" />
          <div className="absolute inset-[-30px] border border-dotted border-[#1A1F36]/5 rounded-full animate-rotate-slow [animation-direction:reverse]" />

          {/* Main Logo Hexagon/Circle Container */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Liquid Background */}
            <div className="absolute inset-0 bg-white shadow-[0_20px_50px_rgba(255,106,0,0.12)] border border-[#FF6A00]/10 animate-liquid" />

            {/* Logo */}
            <Image
              src="/brand-logo-v1.png"
              alt={BRAND}
              width={72}
              height={72}
              className="relative z-10 w-full h-full object-contain animate-in zoom-in duration-1000 fade-in transition-transform duration-700 group-hover:scale-110"
              priority
            />
          </div>

          {/* Floating Particles */}
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#FF6A00] rounded-full blur-[2px] animate-ping" />
          <div className="absolute bottom-4 -left-2 w-1.5 h-1.5 bg-[#1A1F36]/20 rounded-full animate-bounce" />
        </div>

        {/* Branding & Message */}
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="relative">
            <h2 className="text-[28px] font-black tracking-tighter text-[#1A1F36] flex items-center">
              Shop<span className="text-[#FF6A00]">Bajar</span>
              <span className="absolute -top-1 -right-4 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6A00]"></span>
              </span>
            </h2>
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-[12px] font-bold text-[#1A1F36]/40 uppercase tracking-[0.3em] animate-pulse">
              {message}
            </p>
            {/* Progress Bar Emulation */}
            <div className="w-32 h-[2px] bg-[#1A1F36]/5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 flex flex-col items-center gap-4 animate-in slide-in-from-bottom duration-1000">
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#1A1F36]/10" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#1A1F36]/20">Premium Marketplace</span>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#1A1F36]/10" />
        </div>
      </div>
    </div>
  );
};

export default FullLoader;
