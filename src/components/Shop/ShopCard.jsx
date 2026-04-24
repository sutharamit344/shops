"use client";

import React from "react";
import Link from "next/link";
import Card from "@/components/UI/Card";
import { MapPin, Star, ArrowRight, Store, Phone, MessageSquare } from "lucide-react";

const ShopCard = ({ shop, variant = "grid", showActions = false }) => {
  if (!shop) return null;

  const brandColor = shop.primaryColor || "#FF6B35";

  const normalizeHex = (hex) => {
    const clean = hex.startsWith('#') ? hex.slice(1) : hex;
    if (clean.length === 3) {
      return `#${clean.split('').map(c => c + c).join('')}`;
    }
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
    const cleanPhone = phone?.toString().replace(/\D/g, '') || '';
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=Hi%20I%20found%20your%20shop%20on%20ShopSetu`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCall = (e, phone) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanPhone = phone?.toString().replace(/\D/g, '') || '';
    window.location.href = `tel:${cleanPhone}`;
  };

  const content = (
    <Card
      className={`h-full flex relative overflow-hidden bg-white border border-black/[0.06] hover:border-[#FF6B35]/30 transition-all duration-300 shadow-sm hover:shadow-md group/card ${variant === "grid"
        ? "flex-col rounded-2xl p-0"
        : "flex-row items-center p-4 rounded-2xl"
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
        // LIST VARIANT
        <>
          {/* Logo / Icon */}
          <div className="relative flex-shrink-0">
            {shop.logo ? (
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-black/[0.06] shadow-sm group-hover/card:scale-105 transition-transform duration-300">
                <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#0F0F0F] text-white flex items-center justify-center font-black text-xl">
                {shop.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 px-4 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded-md">
                {shop.category}
              </span>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-[#FF6B35] fill-[#FF6B35]" />
                <span className="text-[11px] font-semibold text-[#0F0F0F]">{shop.avgRating || shop.rating || "5.0"}</span>
                <span className="text-[10px] text-[#999]">({shop.reviewCount || 124})</span>
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#0F0F0F] tracking-tight truncate group-hover/card:text-[#FF6B35] transition-colors">
              {shop.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
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

          {/* Arrow indicator if no actions */}
          {!showActions && (
            <div className="flex-shrink-0 ml-auto">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-[#0F0F0F] group-hover/card:bg-[#FF6B35] group-hover/card:text-white transition-all duration-300">
                <ArrowRight size={14} className="transform group-hover/card:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )}
        </>
      ) : (
        // GRID VARIANT (Default)
        <div className="p-5 flex flex-col flex-1 relative z-10">
          {/* Header with logo and category */}
          <div className="flex items-start justify-between mb-4">
            <div>
              {shop.logo ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-black/[0.06] shadow-sm group-hover/card:scale-110 transition-transform duration-300">
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#0F0F0F] text-white flex items-center justify-center font-black text-lg group-hover/card:scale-110 transition-transform duration-300">
                  {shop.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded-md">
                {shop.category}
              </span>
              <div className="flex items-center gap-1">
                <Star size={11} className="text-[#FF6B35] fill-[#FF6B35]" />
                <span className="text-[11px] font-semibold text-[#0F0F0F]">{shop.avgRating || shop.rating || "5.0"}</span>
              </div>
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

          {/* Footer with location and link */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between group/btn mt-auto">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-[#999]" />
              <span className="text-[11px] text-[#666] truncate max-w-[120px]">{shop.area}</span>
            </div>
            <div className="w-7 h-7 rounded-xl bg-gray-50 flex items-center justify-center text-[#0F0F0F] group-hover/card:bg-[#FF6B35] group-hover/card:text-white transition-all duration-300">
              <ArrowRight size={13} className="transform group-hover/card:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Quick action buttons for grid */}
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