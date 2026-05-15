"use client";

import React from "react";
import { getBusinessStatus } from "@/lib/shopUtils";

/**
 * OpenNowBadge — shows Open Now / Closed / Closing Soon status.
 * Re-designed for premium platform aesthetics: compact, subtle, and semantic.
 */
const OpenNowBadge = ({ shop, size = "md" }) => {
  const status = getBusinessStatus(shop);
  if (!status) return null;

  const isSmall = size === "sm";
  const isClosingSoon = !!status.closingInMinutes;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border transition-all ${
        isSmall ? "px-2 py-0.5" : "px-2.5 py-1"
      } ${
        isClosingSoon 
          ? "border-amber-500/20 bg-amber-500/[0.03] text-amber-600" 
          : status.label === "Open Now"
            ? "border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-600"
            : "border-black/[0.08] bg-black/[0.02] text-[#0A0A0F]/40"
      }`}
    >
      <div className="relative flex items-center justify-center">
        <span
          className={`rounded-full flex-shrink-0 ${status.dotClass} ${
            isSmall ? "w-1 h-1" : "w-1.5 h-1.5"
          } ${status.label === "Open Now" ? "animate-pulse" : ""}`}
        />
        {status.label === "Open Now" && (
          <span className={`absolute inset-0 rounded-full ${status.dotClass} opacity-20 animate-ping`} />
        )}
      </div>
      <span
        className={`font-semibold whitespace-nowrap tracking-tight ${
          isSmall ? "text-[10px]" : "text-[11px]"
        }`}
      >
        {status.label}
      </span>
    </div>
  );
};

export default OpenNowBadge;
