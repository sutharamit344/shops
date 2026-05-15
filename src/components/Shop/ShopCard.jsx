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

const ShopCard = ({ shop, variant = "grid", showActions = false, index = 0 }) => {
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
      padding={false}
      className={`h-full flex relative overflow-hidden transition-all duration-300 group/card animate-fade-in-up ${variant === "grid" ? "flex-col" : "flex-row items-center p-3 md:p-4"
        } ${areaMatch || shop.isClusterMatch ? "border-[#FF6A00]/30 shadow-lg shadow-[#FF6A00]/5 bg-[#FF6A00]/[0.01]" : ""}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Branding Stripe */}
      {variant === "grid" && (
        <div className={`h-[1.5px] w-full bg-gradient-to-r from-[#FF6A00] to-transparent transition-opacity duration-300 ${areaMatch ? "opacity-100" : "opacity-40 group-hover/card:opacity-100"}`} />
      )}

      {variant === "list" ? (
        <>
          {/* Logo */}
          <div className="relative flex-shrink-0">
            {shop.logo ? (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-[#0A0A0F]/[0.06] group-hover/card:scale-105 transition-transform duration-300 relative shadow-sm">
                <Image
                  src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo}
                  alt={shop.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 48px, 56px"
                />
              </div>
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg text-white flex items-center justify-center font-black text-lg md:text-xl shadow-inner bg-[#0A0A0F]">
                {shop.name.charAt(0)}
              </div>
            )}
            {isApproved && (
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-md bg-[#FF6A00]">
                <ShieldCheck size={9} className="text-white" />
              </div>
            )}
          </div>

          {/* Info Columns */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center min-w-0 px-3 md:px-4">
            {/* Col 1: Name, Cluster & Description */}
            <div className="md:col-span-5 min-w-0">
              <h3 className="text-[15px] md:text-[16px] font-bold text-[#0A0A0F] group-hover/card:text-[#FF6A00] tracking-tight truncate transition-colors flex items-center gap-1.5 mb-0.5">
                {shop.name}
                {shop.isVerified && <ShieldCheck size={15} className="text-blue-500 fill-blue-50 flex-shrink-0" />}
              </h3>
              {shop.clusterType && (
                <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider truncate opacity-80">
                  <Award size={12} className="text-[#FF6A00] flex-shrink-0" />
                  <span className={`truncate ${shop.isClusterMatch ? "text-[#FF6A00] font-bold" : "text-[#0A0A0F]/60"}`}>
                    {shop.clusterType}
                  </span>
                </div>
              )}
              <p className="text-[12px] text-[#0A0A0F]/60 line-clamp-1 mt-1 font-medium leading-relaxed pr-2">
                {shop.description || "Verified local business offering quality products and trusted services."}
              </p>
            </div>

            {/* Col 2: Category & Status */}
            <div className="md:col-span-3 flex items-center gap-2 flex-wrap min-w-0">
              <span
                onClick={(e) => handleCategoryClick(e, shop.category)}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border text-[#FF6A00] bg-[#FF6A00]/5 border-[#FF6A00]/10 hover:bg-[#FF6A00] hover:text-white transition-all cursor-pointer truncate"
              >
                {shop.category}
              </span>
              <OpenNowBadge shop={shop} size="sm" />
            </div>

            {/* Col 3: Location & Distance */}
            <div
              onClick={(e) => handleCityClick(e, shop.city)}
              className="md:col-span-4 flex items-center gap-1.5 text-[12px] font-medium text-[#0A0A0F]/60 hover:text-[#FF6A00] transition-colors cursor-pointer group/loc min-w-0"
            >
              <MapPin size={13} className="text-[#FF6A00] flex-shrink-0" />
              <span className="truncate">
                <span className={areaMatch ? "text-[#FF6A00] font-bold" : ""}>{shop.area}</span>, <span className={cityMatch ? "text-[#FF6A00] font-bold" : ""}>{shop.city}</span>
              </span>
              {distanceText && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 border text-[#FF6A00] bg-[#FF6A00]/10 border-[#FF6A00]/10">
                  {distanceText}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 ml-auto flex items-center gap-1.5 md:gap-2">
            <div className="flex items-center gap-1 bg-black/[0.03] px-2 py-1 rounded-lg text-[12px] font-bold text-[#0A0A0F] border border-black/[0.04] mr-0.5">
              <Star size={12} className="text-[#FF6A00] fill-[#FF6A00]" />
              <span>{shop.avgRating || shop.rating || "5.0"}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={handleFavorite}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-all ${isFavorited
                  ? "bg-red-50 text-red-500 border border-red-100 shadow-sm"
                  : "bg-black/[0.03] text-[#0A0A0F]/30 hover:text-red-500 hover:bg-red-50"
                  }`}
              >
                <Heart size={15} className={isFavorited ? "fill-current" : ""} />
              </button>
              <button
                onClick={handleShare}
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-black/[0.03] flex items-center justify-center text-[#0A0A0F]/30 hover:text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-all"
              >
                {copied ? <Check size={15} className="text-green-500" /> : <Share2 size={15} />}
              </button>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-black/[0.04] text-[#0A0A0F]/40 flex items-center justify-center group-hover/card:bg-[#FF6A00] group-hover/card:text-white group-hover/card:scale-105 transition-all duration-300 shadow-sm">
              <ArrowRight size={16} className="transform group-hover/card:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </>
      ) : (
        <div className="p-3.5 md:p-4 flex flex-col flex-1 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="relative">
              {shop.logo ? (
                <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#0A0A0F]/[0.06] group-hover/card:scale-110 transition-transform duration-300 relative">
                  <Image
                    src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo}
                    alt={shop.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-lg bg-[#0A0A0F] text-white flex items-center justify-center font-bold text-base group-hover/card:scale-110 transition-transform duration-300">
                  {shop.name.charAt(0)}
                </div>
              )}
              {isApproved && (
                <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#FF6A00] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <ShieldCheck size={8} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="absolute top-3.5 right-3.5 z-20">
                <OpenNowBadge shop={shop} size="sm" />
              </div>
              <span
                onClick={(e) => handleCategoryClick(e, shop.category)}
                className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] bg-[#FF6A00]/5 px-2 py-0.5 rounded-md border border-[#FF6A00]/10 hover:bg-[#FF6A00] hover:text-white transition-all cursor-pointer"
              >
                {shop.category}
              </span>
            </div>
          </div>

          <div className="mb-3 flex-1">
            <h3 className="text-[15px] font-bold text-[#0A0A0F] tracking-tight mb-1 group-hover/card:text-[#FF6A00] transition-colors leading-tight flex items-center gap-1.5">
              {shop.name}
              {shop.isVerified && <ShieldCheck size={14} className="text-blue-500 fill-blue-50" />}
            </h3>
            <div className="flex items-center gap-1 mb-1.5">
              <Star size={11} className="text-[#FF6A00] fill-[#FF6A00]" />
              <span className="text-[13px] font-bold text-[#0A0A0F]">{shop.avgRating || shop.rating || "5.0"}</span>
            </div>
            <p className="text-[13px] text-[#0A0A0F]/60 line-clamp-2 leading-relaxed font-medium">
              {shop.description || "Verified local business offering quality products and trusted services."}
            </p>
          </div>

          <div className="pt-3 border-t border-[#0A0A0F]/[0.06] mt-auto">
            {shop.clusterType && (
              <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
                <Award size={10} className="text-[#FF6A00]" />
                <span className={`text-[10px] font-bold uppercase tracking-wide ${shop.isClusterMatch ? "text-[#FF6A00] font-bold" : "text-[#0A0A0F]/45"}`}>{shop.clusterType}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div
                onClick={(e) => handleCityClick(e, shop.city)}
                className="flex items-center gap-1.5 text-[#0A0A0F]/40 hover:text-[#FF6A00] transition-colors cursor-pointer group/loc flex-1 min-w-0"
              >
                <MapPin size={11} className="group-hover/loc:text-[#FF6A00] transition-colors flex-shrink-0" />
                <span className="text-[12px] font-bold group-hover/loc:text-[#FF6A00] transition-colors truncate">
                  <span className={areaMatch ? "text-[#FF6A00] font-bold" : ""}>{shop.area}</span>, <span className={cityMatch ? "text-[#FF6A00] font-bold" : ""}>{shop.city}</span>
                </span>
                {distanceText && (
                  <span className="text-[9px] font-bold text-[#FF6A00] bg-[#FF6A00]/5 px-1.5 py-0.5 rounded border border-[#FF6A00]/10 ml-1 whitespace-nowrap">
                    {distanceText}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleFavorite}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isFavorited
                    ? "bg-red-50 text-red-500 border border-red-100"
                    : "bg-black/[0.03] text-[#0A0A0F]/30 hover:text-red-500 hover:bg-red-50"
                    }`}
                >
                  <Heart size={12} className={isFavorited ? "fill-current" : ""} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-7 h-7 rounded-lg bg-black/[0.03] flex items-center justify-center text-[#0A0A0F]/30 hover:text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-all"
                >
                  {copied ? <Check size={12} className="text-green-500" /> : <Share2 size={12} />}
                </button>
              </div>
            </div>
          </div>

          {showActions && shop.phone && (
            <div className="mt-3 pt-3 border-t border-[#0A0A0F]/[0.06] flex gap-2">
              <Button onClick={(e) => handleWhatsApp(e, shop.phone)} variant="whatsapp" size="sm" className="flex-1 text-[11px]" icon={MessageSquare}>WhatsApp</Button>
              <Button onClick={(e) => handleCall(e, shop.phone)} variant="dark" size="sm" className="flex-1 text-[11px]" icon={Phone}>Call</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <div
      onClick={() => router.push(generateShopUrl(shop))}
      className="block group h-full cursor-pointer"
    >
      {content}
    </div>
  );
};

export default ShopCard;
