"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/UI/Card";
import OpenNowBadge from "@/components/UI/OpenNowBadge";
import {
  MapPin, Star, ArrowRight, Store, Phone, MessageSquare,
  Share2, ShieldCheck, Copy, Check
} from "lucide-react";

const ShopCard = ({ shop, variant = "grid", showActions = false }) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!shop) return null;

  const brandColor = shop.primaryColor || "#FF6B35";
  const isApproved = shop.status === "approved";

  const normalizeHex = (hex) => {
    const clean = hex.startsWith("#") ? hex.slice(1) : hex;
    if (clean.length === 3) return `#${clean.split("").map((c) => c + c).join("")}`;
    return `#${clean}`;
  };

  const fullHex = normalizeHex(brandColor);
  const themeStyles = {
    "--primary-color": fullHex,
    "--primary-bg-soft": `${fullHex}0D`,
    "--primary-border-soft": `${fullHex}1A`,
  };

  const handleWhatsApp = (e, phone) => {
    e.preventDefault();
    e.stopPropagation();
    const clean = phone?.toString().replace(/\D/g, "") || "";
    const url = `https://wa.me/${clean.startsWith("91") ? clean : `91${clean}`}?text=Hi%20I%20found%20your%20shop%20on%20ShopSetu`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCall = (e, phone) => {
    e.preventDefault();
    e.stopPropagation();
    const clean = phone?.toString().replace(/\D/g, "") || "";
    window.location.href = `tel:${clean}`;
  };

  const handleCategoryClick = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/explore?category=${encodeURIComponent(category)}&nearby=true`);
  };

  const handleCityClick = (e, city) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/explore?city=${encodeURIComponent(city)}`);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/${encodeURIComponent(shop.city?.toLowerCase())}/${encodeURIComponent(shop.category?.toLowerCase())}/${shop.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: shop.name, text: `Check out ${shop.name} on ShopSetu`, url });
      } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const content = (
    <Card
      className={`h-full flex relative overflow-hidden bg-white border border-black/[0.06] hover:border-[#FF6B35]/30 transition-all duration-300 shadow-sm hover:shadow-md group/card ${
        variant === "grid" ? "flex-col rounded-2xl p-0" : "flex-row items-center p-4 rounded-2xl"
      }`}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-0 group-hover/card:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: brandColor }}
      />

      {variant === "grid" && (
        <div className="h-[2px] w-full bg-gradient-to-r from-[#FF6B35] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
      )}

      {variant === "list" ? (
        // ── LIST VARIANT ──
        <>
          {/* Logo / Icon */}
          <div className="relative flex-shrink-0">
            {shop.logo ? (
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-black/[0.06] shadow-sm group-hover/card:scale-105 transition-transform duration-300">
                <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ) : (
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#0F0F0F] text-white flex items-center justify-center font-black text-xl">
                {shop.name.charAt(0)}
              </div>
            )}
            {/* Verified badge overlay */}
            {isApproved && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                <ShieldCheck size={9} className="text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 px-4 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                onClick={(e) => handleCategoryClick(e, shop.category)}
                className="text-[9px] font-bold uppercase tracking-wider text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded-md hover:bg-[#FF6B35] hover:text-white transition-all cursor-pointer"
              >
                {shop.category}
              </span>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-[#FF6B35] fill-[#FF6B35]" />
                <span className="text-[11px] font-semibold text-[#0F0F0F]">{shop.avgRating || shop.rating || "5.0"}</span>
                <span className="text-[10px] text-[#999]">({shop.totalRatings || 0})</span>
              </div>
              <OpenNowBadge shop={shop} size="sm" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#0F0F0F] tracking-tight truncate group-hover/card:text-[#FF6B35] transition-colors">
              {shop.name}
            </h3>
            <div
              onClick={(e) => handleCityClick(e, shop.city)}
              className="flex items-center gap-1.5 mt-1 hover:text-[#FF6B35] transition-colors cursor-pointer"
            >
              <MapPin size={12} className="text-[#999]" />
              <span className="text-[11px] text-[#666]">{shop.area}, {shop.city}</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={(e) => handleWhatsApp(e, shop.phone)}
                className="h-8 px-3 bg-[#25D366] text-white text-[11px] font-semibold rounded-lg hover:bg-[#20BD5A] transition-all flex items-center gap-1.5"
              >
                <MessageSquare size={12} />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={(e) => handleCall(e, shop.phone)}
                className="h-8 px-3 bg-[#0F0F0F] text-white text-[11px] font-semibold rounded-lg hover:bg-[#333] transition-all flex items-center gap-1.5"
              >
                <Phone size={12} />
                <span>Call</span>
              </button>
            </div>
          )}

          {/* Arrow if no actions */}
          {!showActions && (
            <div className="flex-shrink-0 ml-auto flex items-center gap-2">
              {/* Share */}
              <button
                onClick={handleShare}
                className="relative w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-[#999] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-all"
                title="Share"
              >
                {copied ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
              </button>
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-[#0F0F0F] group-hover/card:bg-[#FF6B35] group-hover/card:text-white transition-all duration-300">
                <ArrowRight size={14} className="transform group-hover/card:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )}
        </>
      ) : (
        // ── GRID VARIANT ──
        <div className="p-5 flex flex-col flex-1 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              {shop.logo ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-black/[0.06] shadow-sm group-hover/card:scale-110 transition-transform duration-300">
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#0F0F0F] text-white flex items-center justify-center font-black text-lg group-hover/card:scale-110 transition-transform duration-300">
                  {shop.name.charAt(0)}
                </div>
              )}
              {/* Verified dot */}
              {isApproved && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                  <ShieldCheck size={9} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span
                onClick={(e) => handleCategoryClick(e, shop.category)}
                className="text-[9px] font-bold uppercase tracking-wider text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded-md hover:bg-[#FF6B35] hover:text-white transition-all cursor-pointer"
              >
                {shop.category}
              </span>
              <div className="flex items-center gap-1">
                <Star size={11} className="text-[#FF6B35] fill-[#FF6B35]" />
                <span className="text-[11px] font-semibold text-[#0F0F0F]">{shop.avgRating || shop.rating || "5.0"}</span>
              </div>
              <OpenNowBadge shop={shop} size="sm" />
            </div>
          </div>

          {/* Shop info */}
          <div className="mb-3 flex-1">
            <h3 className="text-lg font-bold text-[#0F0F0F] tracking-tight mb-2 group-hover/card:text-[#FF6B35] transition-colors leading-tight">
              {shop.name}
            </h3>
            <p className="text-[12px] text-[#666] line-clamp-2 leading-relaxed">
              {shop.description || "Local shop offering quality products and services in your neighborhood."}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between mt-auto">
            <div
              onClick={(e) => handleCityClick(e, shop.city)}
              className="flex items-center gap-1.5 hover:text-[#FF6B35] transition-colors cursor-pointer group/loc"
            >
              <MapPin size={12} className="text-[#999] group-hover/loc:text-[#FF6B35] transition-colors" />
              <span className="text-[11px] text-[#666] group-hover/loc:text-[#FF6B35] transition-colors truncate max-w-[110px]">
                {shop.area}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Share button */}
              <button
                onClick={handleShare}
                className="relative w-7 h-7 rounded-xl bg-gray-50 flex items-center justify-center text-[#999] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-all"
                title="Share"
              >
                {copied ? <Check size={11} className="text-green-500" /> : <Share2 size={11} />}
              </button>
              <div className="w-7 h-7 rounded-xl bg-gray-50 flex items-center justify-center text-[#0F0F0F] group-hover/card:bg-[#FF6B35] group-hover/card:text-white transition-all duration-300">
                <ArrowRight size={13} className="transform group-hover/card:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          {showActions && shop.phone && (
            <div className="mt-4 pt-3 border-t border-black/[0.06] grid grid-cols-2 gap-2">
              <button
                onClick={(e) => handleWhatsApp(e, shop.phone)}
                className="py-2 bg-[#25D366] text-white text-[10px] font-semibold rounded-lg hover:bg-[#20BD5A] transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare size={11} />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={(e) => handleCall(e, shop.phone)}
                className="py-2 bg-[#0F0F0F] text-white text-[10px] font-semibold rounded-lg hover:bg-[#333] transition-all flex items-center justify-center gap-1.5"
              >
                <Phone size={11} />
                <span>Call</span>
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <Link
      href={`/${encodeURIComponent(shop.city)}/${encodeURIComponent(shop.category)}/${encodeURIComponent(shop.slug)}`}
      className="block group h-full"
      style={themeStyles}
    >
      {content}
    </Link>
  );
};

export default ShopCard;