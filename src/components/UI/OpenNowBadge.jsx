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
      className={`inline-flex items-center gap-1.5 rounded-full border border-black/[0.04] bg-white shadow-sm transition-all ${
        isSmall ? "px-2 py-0.5" : "px-3 py-1"
      } ${isClosingSoon ? "border-amber-100 bg-amber-50/30" : ""}`}
    >
      <span
        className={`rounded-full flex-shrink-0 ${status.dotClass} ${
          isSmall ? "w-1.5 h-1.5" : "w-2 h-2"
        } ${isClosingSoon ? "animate-[pulse_0.8s_infinite]" : "animate-pulse"}`}
      />
      <span
        className={`font-bold whitespace-nowrap ${status.colorClass} ${
          isSmall ? "text-[9px] uppercase tracking-wider" : "text-[10px] uppercase tracking-wider"
        }`}
      >
        {status.label}
      </span>
    </div>
  );
};

export default OpenNowBadge;
