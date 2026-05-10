"use client";

import React from "react";
import { getBusinessStatus } from "@/lib/shopUtils";

/**
 * OpenNowBadge — shows Open Now / Closed / Closing Soon status.
 * @param {object} shop - Full shop object
 * @param {string} size - "sm" | "md" (default: "md")
 */
const OpenNowBadge = ({ shop, size = "md" }) => {
  const status = getBusinessStatus(shop);
  if (!status) return null;

  const isSmall = size === "sm";

  const isClosingSoon = !!status.closingInMinutes;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm transition-all ${
        isSmall ? "px-2.5 py-0.5" : "px-3.5 py-1.5"
      } ${
        isClosingSoon 
          ? "border-amber-200 bg-amber-50 shadow-amber-500/10" 
          : status.label === "Open Now"
            ? "border-emerald-100 bg-emerald-50/50 shadow-emerald-500/5"
            : "border-gray-100 bg-gray-50/50"
      }`}
    >
      <div className="relative flex items-center justify-center">
        <span
          className={`rounded-full flex-shrink-0 ${status.dotClass} ${
            isSmall ? "w-1.5 h-1.5" : "w-2 h-2"
          } ${isClosingSoon ? "animate-pulse" : "animate-pulse"}`}
        />
        {status.label === "Open Now" && (
          <span className={`absolute inset-0 rounded-full ${status.dotClass} opacity-40 animate-ping`} />
        )}
      </div>
      <span
        className={`font-black whitespace-nowrap tracking-tight ${status.colorClass} ${
          isSmall ? "text-[10px]" : "text-[11px]"
        }`}
      >
        {status.label}
      </span>
    </div>
  );
};

export default OpenNowBadge;
