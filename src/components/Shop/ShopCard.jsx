"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { toggleFavoriteInDb } from "@/redux/thunks/authThunks";
import { slugify } from "@/lib/slugify";
import { generateShopUrl } from "@/lib/urlArchitect";
import Card from "@/components/UI/Card";
import OpenNowBadge from "@/components/UI/OpenNowBadge";
import {
  MapPin, Star, ArrowRight, Store, Phone, MessageSquare,
  Share2, ShieldCheck, Copy, Check, Shield, Award, Heart
} from "lucide-react";
import Button from "@/components/UI/Button";

const ShopCard = ({ shop, variant = "grid", showActions = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const userCoords = useSelector((state) => state.search.userCoords);
  const { favorites, user } = useSelector((state) => state.auth);
  const isFavorited = favorites.includes(shop.id);

  if (!shop) return null;

  const isApproved = shop.status === "approved";

  const getDistanceDisplay = () => {
    if (!userCoords || !userCoords.lat || !userCoords.lng || !shop.lat || !shop.lng) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (shop.lat - userCoords.lat) * (Math.PI / 180);
    const dLon = (shop.lng - userCoords.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userCoords.lat * (Math.PI / 180)) * Math.cos(shop.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  };

  const distanceText = getDistanceDisplay();

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
    router.push(`/explore?category=${encodeURIComponent(slugify(category))}`);
  };

  const handleCityClick = (e, city) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/explore?city=${encodeURIComponent(slugify(city))}`);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${generateShopUrl(shop)}`;
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
  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please sign in to favorite shops!");
      return;
    }
    dispatch(toggleFavoriteInDb(shop.id));
  };

  const content = (
    <Card
      hover
      className={`h-full flex relative overflow-hidden transition-all duration-300 group/card ${variant === "grid" ? "flex-col p-0" : "flex-row items-center p-4"
        }`}
    >
      {/* Branding Stripe */}
      {variant === "grid" && (
        <div className="h-[2px] w-full bg-gradient-to-r from-[#FF6B35] to-transparent opacity-60 group-hover/card:opacity-100 transition-opacity duration-300" />
      )}

      {variant === "list" ? (
        <>
          {/* Logo */}
          <div className="relative flex-shrink-0">
            {shop.logo ? (
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-[#1A1F36]/[0.06] group-hover/card:scale-105 transition-transform duration-300">
                <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ) : (
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#1A1F36] text-white flex items-center justify-center font-bold text-xl">
                {shop.name.charAt(0)}
              </div>
            )}
            {isApproved && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center border-2 border-white">
                <ShieldCheck size={9} className="text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 px-4 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                onClick={(e) => handleCategoryClick(e, shop.category)}
                className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B35] bg-[#FF6B35]/10 px-2.5 py-1 rounded-full border border-[#FF6B35]/20 hover:bg-[#FF6B35] hover:text-white transition-all cursor-pointer"
              >
                {shop.category}
              </span>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-[#FF6B35] fill-[#FF6B35]" />
                <span className="text-[12px] font-bold text-[#1A1F36]">{shop.avgRating || shop.rating || "5.0"}</span>
              </div>
              <OpenNowBadge shop={shop} size="sm" />
            </div>
            <h3 className="text-[17px] font-bold text-[#1A1F36] tracking-tight truncate group-hover/card:text-[#FF6B35] transition-colors flex items-center gap-1.5">
              {shop.name}
              {shop.isVerified && <ShieldCheck size={16} className="text-blue-500 fill-blue-50" />}
            </h3>
            {shop.clusterType && (
              <div className="flex items-center gap-1.5 mt-0.5 opacity-70">
                <Award size={10} className="text-[#FF6B35]" />
                <span className="text-[10px] font-bold text-[#1A1F36]/60 uppercase tracking-tight">{shop.clusterType}</span>
              </div>
            )}
            <div
              onClick={(e) => handleCityClick(e, shop.city)}
              className="flex items-center gap-1.5 mt-0.5 hover:text-[#FF6B35] transition-colors cursor-pointer"
            >
              <MapPin size={12} className="text-[#1A1F36]/30" />
              <span className="text-[11px] text-[#1A1F36]/50 font-medium">{shop.area}, {shop.city}</span>
              {distanceText && (
                <span className="text-[10px] font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-1.5 py-0.5 rounded ml-1">
                  {distanceText}
                </span>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0 ml-auto flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isFavorited 
                  ? "bg-red-50 text-red-500 border border-red-100" 
                  : "bg-[#1A1F36]/[0.03] text-[#1A1F36]/30 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              <Heart size={14} className={isFavorited ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl bg-[#1A1F36]/[0.03] flex items-center justify-center text-[#1A1F36]/30 hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-all"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
            </button>
            <div className="w-9 h-9 rounded-xl bg-[#1A1F36]/[0.03] flex items-center justify-center text-[#1A1F36] group-hover/card:bg-[#FF6B35] group-hover/card:text-white transition-all duration-300">
              <ArrowRight size={16} className="transform group-hover/card:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 md:p-5 flex flex-col flex-1 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              {shop.logo ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#1A1F36]/[0.06] group-hover/card:scale-110 transition-transform duration-300">
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#1A1F36] text-white flex items-center justify-center font-bold text-lg group-hover/card:scale-110 transition-transform duration-300">
                  {shop.name.charAt(0)}
                </div>
              )}
              {isApproved && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <ShieldCheck size={9} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span
                onClick={(e) => handleCategoryClick(e, shop.category)}
                className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B35] bg-[#FF6B35]/10 px-2.5 py-1 rounded-full border border-[#FF6B35]/20 hover:bg-[#FF6B35] hover:text-white transition-all cursor-pointer"
              >
                {shop.category}
              </span>
            </div>
          </div>

          <div className="mb-4 flex-1">
            <h3 className="text-[15px] md:text-[17px] font-bold text-[#1A1F36] tracking-tight mb-2 group-hover/card:text-[#FF6B35] transition-colors leading-tight flex items-center gap-1.5">
              {shop.name}
              {shop.isVerified && <ShieldCheck size={16} className="text-blue-500 fill-blue-50" />}
            </h3>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-[#FF6B35] fill-[#FF6B35]" />
              <span className="text-[12px] font-bold text-[#1A1F36]">{shop.avgRating || shop.rating || "5.0"}</span>
            </div>
            <p className="text-[13px] text-[#1A1F36]/50 line-clamp-2 leading-relaxed">
              {shop.description || "Verified local business offering quality products and trusted services."}
            </p>
          </div>

          <div className="pt-4 border-t border-[#1A1F36]/[0.06] mt-auto">
            {shop.clusterType && (
              <div className="flex items-center gap-1.5 mb-2 opacity-80">
                <Award size={10} className="text-[#FF6B35]" />
                <span className="text-[10px] font-bold text-[#1A1F36]/60 uppercase tracking-wide">{shop.clusterType}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div
                onClick={(e) => handleCityClick(e, shop.city)}
                className="flex items-center gap-1.5 text-[#1A1F36]/40 hover:text-[#FF6B35] transition-colors cursor-pointer group/loc"
              >
                <MapPin size={12} className="group-hover/loc:text-[#FF6B35] transition-colors" />
                <span className="text-[11px] font-semibold group-hover/loc:text-[#FF6B35] transition-colors truncate max-w-[120px]">
                  {shop.area}, {shop.city}
                </span>
                {distanceText && (
                  <span className="text-[10px] font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap">
                    {distanceText}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleFavorite}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isFavorited 
                      ? "bg-red-50 text-red-500 border border-red-100" 
                      : "bg-[#1A1F36]/[0.03] text-[#1A1F36]/30 hover:text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Heart size={12} className={isFavorited ? "fill-current" : ""} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-8 h-8 rounded-xl bg-[#1A1F36]/[0.03] flex items-center justify-center text-[#1A1F36]/30 hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-all"
                >
                  {copied ? <Check size={12} className="text-green-500" /> : <Share2 size={12} />}
                </button>
                <div className="w-8 h-8 rounded-xl bg-[#1A1F36]/[0.03] flex items-center justify-center text-[#1A1F36] group-hover/card:bg-[#FF6B35] group-hover/card:text-white transition-all duration-300">
                  <ArrowRight size={14} className="transform group-hover/card:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {showActions && shop.phone && (
            <div className="mt-4 pt-4 border-t border-[#1A1F36]/[0.06] flex gap-2">
              <Button onClick={(e) => handleWhatsApp(e, shop.phone)} variant="whatsapp" size="sm" className="flex-1" icon={MessageSquare}>WhatsApp</Button>
              <Button onClick={(e) => handleCall(e, shop.phone)} variant="dark" size="sm" className="flex-1" icon={Phone}>Call</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <Link
      href={generateShopUrl(shop)}
      className="block group h-full"
    >
      {content}
    </Link>
  );
};

export default ShopCard;