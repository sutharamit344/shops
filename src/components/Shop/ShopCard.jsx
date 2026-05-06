"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { toggleFavoriteInDb } from "@/redux/thunks/authThunks";
import { incrementLeads } from "@/lib/shopUtils";
import { slugify } from "@/lib/slugify";
import { generateShopUrl } from "@/lib/urlArchitect";
import Card from "@/components/UI/Card";
import OpenNowBadge from "@/components/UI/OpenNowBadge";
import {
  MapPin, Star, ArrowRight, Store, Phone, MessageSquare,
  Share2, ShieldCheck, Copy, Check, Shield, Award, Heart
} from "lucide-react";
import Button from "@/components/UI/Button";
import { BRAND } from "@/lib/config";

const ShopCard = ({ shop, variant = "grid", showActions = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const userCoords = useSelector((state) => state.search.userCoords);
  const { favorites, user } = useSelector((state) => state.auth);
  const { parsed } = useSelector((state) => state.search);
  const isFavorited = favorites.includes(shop.id);

  const targetCity = (parsed?.city || "").toLowerCase().trim();
  const targetArea = (parsed?.area || "").toLowerCase().trim();

  const areaMatch = shop.isLocationMatch || (targetArea && (shop.area || "").toLowerCase().includes(targetArea));
  const cityMatch = shop.isCityMatch || (targetCity && (shop.city || "").toLowerCase().includes(targetCity));

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
    const dC = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * dC;

    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  };

  const distanceText = getDistanceDisplay();

  const handleWhatsApp = (e, phone) => {
    e.preventDefault();
    e.stopPropagation();
    incrementLeads(shop.id);
    const clean = phone?.toString().replace(/\D/g, "") || "";
    const url = `https://wa.me/${clean.startsWith("91") ? clean : `91${clean}`}?text=Hi%20I%20found%20your%20shop%20on%20${BRAND}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCall = (e, phone) => {
    e.preventDefault();
    e.stopPropagation();
    incrementLeads(shop.id);
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
        await navigator.share({ title: shop.name, text: `Check out ${shop.name} on ${BRAND}`, url });
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
        } ${areaMatch || shop.isClusterMatch ? "border-[#FF6A00]/30 shadow-lg shadow-[#FF6A00]/5 bg-[#FF6A00]/[0.01]" : ""}`}
    >
      {/* Location Match Badge */}

      {/* Branding Stripe */}
      {variant === "grid" && (
        <div className={`h-[2px] w-full bg-gradient-to-r from-[#FF6A00] to-transparent transition-opacity duration-300 ${areaMatch ? "opacity-100" : "opacity-60 group-hover/card:opacity-100"}`} />
      )}

      {variant === "list" ? (
        <>
          {/* Logo */}
          <div className="relative flex-shrink-0">
            {shop.logo ? (
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border group-hover/card:scale-105 transition-transform duration-500 relative shadow-sm ${areaMatch ? "border-[#FF6A00]/40" : "border-[#1A1F36]/[0.08]"}`}>
                <Image
                  src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo}
                  alt={shop.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 64px, 96px"
                />
              </div>
            ) : (
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl text-white flex items-center justify-center font-black text-2xl md:text-3xl shadow-inner ${areaMatch ? "bg-[#FF6A00]" : "bg-[#1A1F36]"}`}>
                {shop.name.charAt(0)}
              </div>
            )}
            {isApproved && (
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg ${areaMatch ? "bg-blue-500" : "bg-[#FF6A00]"}`}>
                <ShieldCheck size={11} className="text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 px-5 md:px-8 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                onClick={(e) => handleCategoryClick(e, shop.category)}
                className={`text-[12px] font-black uppercase tracking-[0.05em] px-3 py-1 rounded-lg border transition-all cursor-pointer ${areaMatch ? "bg-[#FF6A00] text-white border-[#FF6A00]" : "text-[#FF6A00] bg-[#FF6A00]/5 border-[#FF6A00]/10 hover:bg-[#FF6A00] hover:text-white"}`}
              >
                {shop.category}
              </span>
              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md border border-black/[0.03]">
                <Star size={14} className="text-[#FF6A00] fill-[#FF6A00]" />
                <span className="text-[15px] font-black text-[#1A1F36]">{shop.avgRating || shop.rating || "5.0"}</span>
              </div>
              <OpenNowBadge shop={shop} size="md" />
            </div>
            <h3 className={`text-[19px] md:text-[22px] font-black tracking-tight truncate transition-colors flex items-center gap-2 mb-1.5 ${areaMatch ? "text-[#FF6A00]" : "text-[#1A1F36] group-hover/card:text-[#FF6A00]"}`}>
              {shop.name}
              {shop.isVerified && <ShieldCheck size={20} className="text-blue-500 fill-blue-50" />}
            </h3>

            {shop.clusterType && (
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Award size={13} className="text-[#FF6A00]" />
                <span className={`text-[12px] font-bold uppercase tracking-wide ${shop.isClusterMatch ? "text-[#FF6A00] font-black" : "text-[#1A1F36]/75"}`}>{shop.clusterType}</span>
              </div>
            )}

            <div
              onClick={(e) => handleCityClick(e, shop.city)}
              className="flex items-center gap-2 hover:text-[#FF6A00] transition-colors cursor-pointer group/loc flex-1 min-w-0"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors border border-black/[0.03] flex-shrink-0 ${areaMatch ? "bg-[#FF6A00] text-white" : "bg-gray-50 text-gray-400 group-hover/loc:bg-[#FF6A00]/10 group-hover/loc:text-[#FF6A00]"}`}>
                <MapPin size={14} />
              </div>
              <span className="text-[15px] text-[#1A1F36]/75 font-bold truncate">
                <span className={areaMatch ? "text-[#FF6A00] font-black" : ""}>{shop.area}</span>, <span className={cityMatch ? "text-[#FF6A00] font-black" : ""}>{shop.city}</span>
              </span>
              {distanceText && (
                <span className={`text-[12px] font-black px-2 py-0.5 rounded-md ml-1 border ${areaMatch ? "bg-[#FF6A00] text-white border-[#FF6A00]" : "text-[#FF6A00] bg-[#FF6A00]/10 border-[#FF6A00]/10"}`}>
                  {distanceText}
                </span>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0 ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <button
                onClick={handleFavorite}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isFavorited
                  ? "bg-red-50 text-red-500 border border-red-100 shadow-sm"
                  : "bg-[#1A1F36]/[0.03] text-[#1A1F36]/30 hover:text-red-500 hover:bg-red-50"
                  }`}
              >
                <Heart size={18} className={isFavorited ? "fill-current" : ""} />
              </button>
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-2xl bg-[#1A1F36]/[0.03] flex items-center justify-center text-[#1A1F36]/30 hover:text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-all"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#1A1F36] text-white flex items-center justify-center shadow-lg group-hover/card:bg-[#FF6A00] group-hover/card:scale-105 transition-all duration-300">
              <ArrowRight size={20} className="transform group-hover/card:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 md:p-5 flex flex-col flex-1 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              {shop.logo ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#1A1F36]/[0.06] group-hover/card:scale-110 transition-transform duration-300 relative">
                  <Image
                    src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo}
                    alt={shop.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#1A1F36] text-white flex items-center justify-center font-bold text-lg group-hover/card:scale-110 transition-transform duration-300">
                  {shop.name.charAt(0)}
                </div>
              )}
              {isApproved && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FF6A00] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <ShieldCheck size={9} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span
                onClick={(e) => handleCategoryClick(e, shop.category)}
                className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] bg-[#FF6A00]/10 px-2.5 py-1 rounded-full border border-[#FF6A00]/20 hover:bg-[#FF6A00] hover:text-white transition-all cursor-pointer"
              >
                {shop.category}
              </span>
            </div>
          </div>

          <div className="mb-4 flex-1">
            <h3 className="text-[15px] md:text-[17px] font-bold text-[#1A1F36] tracking-tight mb-2 group-hover/card:text-[#FF6A00] transition-colors leading-tight flex items-center gap-1.5">
              {shop.name}
              {shop.isVerified && <ShieldCheck size={16} className="text-blue-500 fill-blue-50" />}
            </h3>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-[#FF6A00] fill-[#FF6A00]" />
              <span className="text-[14px] font-bold text-[#1A1F36]">{shop.avgRating || shop.rating || "5.0"}</span>
            </div>
            <p className="text-[14px] text-[#1A1F36]/70 line-clamp-2 leading-relaxed">
              {shop.description || "Verified local business offering quality products and trusted services."}
            </p>
          </div>

          <div className="pt-4 border-t border-[#1A1F36]/[0.06] mt-auto">
            {shop.clusterType && (
              <div className="flex items-center gap-1.5 mb-2 opacity-80">
                <Award size={10} className="text-[#FF6A00]" />
                <span className={`text-[11px] font-bold uppercase tracking-wide ${shop.isClusterMatch ? "text-[#FF6A00] font-black" : "text-[#1A1F36]/75"}`}>{shop.clusterType}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div
                onClick={(e) => handleCityClick(e, shop.city)}
                className="flex items-center gap-1.5 text-[#1A1F36]/40 hover:text-[#FF6A00] transition-colors cursor-pointer group/loc flex-1 min-w-0"
              >
                <MapPin size={12} className="group-hover/loc:text-[#FF6A00] transition-colors flex-shrink-0" />
                <span className="text-[13px] font-semibold group-hover/loc:text-[#FF6A00] transition-colors truncate">
                  <span className={areaMatch ? "text-[#FF6A00] font-black" : ""}>{shop.area}</span>, <span className={cityMatch ? "text-[#FF6A00] font-black" : ""}>{shop.city}</span>
                </span>
                {distanceText && (
                  <span className="text-[10px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap">
                    {distanceText}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleFavorite}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isFavorited
                    ? "bg-red-50 text-red-500 border border-red-100"
                    : "bg-[#1A1F36]/[0.03] text-[#1A1F36]/30 hover:text-red-500 hover:bg-red-50"
                    }`}
                >
                  <Heart size={12} className={isFavorited ? "fill-current" : ""} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-8 h-8 rounded-xl bg-[#1A1F36]/[0.03] flex items-center justify-center text-[#1A1F36]/30 hover:text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-all"
                >
                  {copied ? <Check size={12} className="text-green-500" /> : <Share2 size={12} />}
                </button>
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
