"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import CategoryIcon from "@/components/UI/CategoryIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// Color Mapper for Categories (Cloud UI Palette)
const getCategoryColor = (name) => {
  const n = (name || "").toLowerCase();
  
  if (n.includes("grocery") || n.includes("kirana")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (n.includes("food") || n.includes("restaurant") || n.includes("bakery")) return "bg-orange-50 text-orange-600 border-orange-100";
  if (n.includes("cloth") || n.includes("fashion") || n.includes("wear")) return "bg-blue-50 text-blue-600 border-blue-100";
  if (n.includes("electron") || n.includes("mobile") || n.includes("smartphone")) return "bg-indigo-50 text-indigo-600 border-indigo-100";
  if (n.includes("jewel") || n.includes("watch")) return "bg-amber-50 text-amber-600 border-amber-100";
  if (n.includes("cafe") || n.includes("coffee")) return "bg-amber-100 text-amber-800 border-amber-200";
  if (n.includes("health") || n.includes("pharma") || n.includes("medical")) return "bg-red-50 text-red-600 border-red-100";
  if (n.includes("hardware") || n.includes("tool")) return "bg-slate-100 text-slate-700 border-slate-200";
  if (n.includes("electri")) return "bg-yellow-50 text-yellow-600 border-yellow-100";
  if (n.includes("salon") || n.includes("parlor") || n.includes("beauty")) return "bg-pink-50 text-pink-600 border-pink-100";
  if (n.includes("auto") || n.includes("car") || n.includes("bike")) return "bg-zinc-100 text-zinc-800 border-zinc-200";
  if (n.includes("game") || n.includes("toy")) return "bg-purple-50 text-purple-600 border-purple-100";
  if (n.includes("gift") || n.includes("love")) return "bg-rose-50 text-rose-600 border-rose-100";
  
  return "bg-black/[0.03] text-[#0A0A0F]/60 border-black/[0.05]";
};

const CategoryGrid = ({ categories = [], currentCity = "ahmedabad" }) => {
  if (categories.length === 0) return null;

  return (
    <section className="py-12 bg-[#F7F7F5] border-y border-black/[0.03]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#FF6A00] font-bold text-[10px] uppercase tracking-[0.2em] mb-1.5">
              Discovery Engine
            </p>
            <h2 className="text-[22px] md:text-[32px] font-bold text-[#0A0A0F] tracking-tight leading-tight">
              Explore local <span className="text-gradient">specialties</span>
            </h2>
          </div>
          
          <Link 
            href={`/${currentCity}`}
            className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest hover:text-[#FF6A00] transition-colors"
          >
            View All <ChevronRight size={13} />
          </Link>
        </div>

        <div className="relative group/swiper">
          {/* Custom Navigation Buttons (Compact) */}
          <button className="category-prev absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-[#0A0A0F]/40 hover:text-[#FF6A00] hover:border-[#FF6A00]/20 transition-all shadow-sm active:scale-95 disabled:opacity-0 pointer-events-auto cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          
          <button className="category-next absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-[#0A0A0F]/40 hover:text-[#FF6A00] hover:border-[#FF6A00]/20 transition-all shadow-sm active:scale-95 disabled:opacity-0 pointer-events-auto cursor-pointer">
            <ChevronRight size={18} />
          </button>

          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{
              nextEl: ".category-next",
              prevEl: ".category-prev",
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            spaceBetween={12}
            slidesPerView={2.2}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 16 },
              768: { slidesPerView: 4, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 20 },
              1280: { slidesPerView: 6, spaceBetween: 20 },
            }}
            className="!pb-6"
          >
            {categories.map((cat, idx) => {
              const categoryName = typeof cat === "string" ? cat : cat.name || "";
              const slug = cat.slug || (typeof cat === "string" ? cat : cat.name || "");
              const colorClass = getCategoryColor(categoryName);
              
              return (
                <SwiperSlide key={idx} className="!h-auto">
                  <Link
                    href={`/${currentCity}/${slug.toLowerCase()}`}
                    className="group relative flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-black/[0.05] hover:border-[#FF6A00]/20 transition-all duration-300 hover:shadow-sm h-full min-h-[110px] md:min-h-[130px]"
                  >
                    <div className={`w-10 h-10 rounded-lg border ${colorClass} flex items-center justify-center mb-2.5 transition-transform duration-300 group-hover:scale-105 flex-shrink-0`}>
                      <CategoryIcon name={categoryName} size={18} strokeWidth={1.5} />
                    </div>
                    
                    <span className="text-[12px] font-bold text-[#0A0A0F]/70 text-center tracking-tight group-hover:text-[#FF6A00] transition-colors line-clamp-2 w-full px-1 leading-tight">
                      {categoryName}
                    </span>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .swiper-button-disabled {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </section>
  );
};

export default CategoryGrid;
