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

// Color Mapper for Categories
const getCategoryColor = (name) => {
  const n = (name || "").toLowerCase();
  
  if (n.includes("grocery") || n.includes("kirana")) return "bg-emerald-50 text-emerald-600";
  if (n.includes("food") || n.includes("restaurant") || n.includes("bakery")) return "bg-orange-50 text-orange-600";
  if (n.includes("cloth") || n.includes("fashion") || n.includes("wear")) return "bg-blue-50 text-blue-600";
  if (n.includes("electron") || n.includes("mobile") || n.includes("smartphone")) return "bg-indigo-50 text-indigo-600";
  if (n.includes("jewel") || n.includes("watch")) return "bg-amber-50 text-amber-600";
  if (n.includes("cafe") || n.includes("coffee")) return "bg-amber-100 text-amber-800";
  if (n.includes("health") || n.includes("pharma") || n.includes("medical")) return "bg-red-50 text-red-600";
  if (n.includes("hardware") || n.includes("tool")) return "bg-gray-100 text-gray-700";
  if (n.includes("electri")) return "bg-yellow-50 text-yellow-600";
  if (n.includes("salon") || n.includes("parlor") || n.includes("beauty")) return "bg-pink-50 text-pink-600";
  if (n.includes("auto") || n.includes("car") || n.includes("bike")) return "bg-slate-100 text-slate-800";
  if (n.includes("game") || n.includes("toy")) return "bg-purple-50 text-purple-600";
  if (n.includes("gift") || n.includes("love")) return "bg-rose-50 text-rose-600";
  
  return "bg-orange-50 text-[#FF6A00]";
};

const CategoryGrid = ({ categories = [], currentCity = "ahmedabad" }) => {
  if (categories.length === 0) return null;

  return (
    <section className="py-24 bg-[#FAFAF8] relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#FF6A00]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4 md:px-0">
          <div className="max-w-2xl text-center md:text-left">
            <p className="text-[#FF6A00] font-black text-[13px] uppercase tracking-[0.25em] mb-4">
              Explore by category
            </p>
            <h2 className="text-[32px] md:text-[48px] font-black text-[#1A1F36] leading-tight tracking-tighter">
              What are you <br className="hidden sm:block" />
              <span className="text-gradient">looking for today?</span>
            </h2>
          </div>
          
          <Link 
            href={`/${currentCity}`}
            className="hidden md:flex group items-center gap-2 text-[14px] font-black text-[#1A1F36]/40 uppercase tracking-widest hover:text-[#FF6A00] transition-colors ml-4"
          >
            Marketplace <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative px-4 sm:px-12">
          {/* Custom Navigation Buttons */}
          <button className="category-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border border-black/[0.05] flex items-center justify-center text-[#1A1F36]/40 hover:text-[#FF6A00] hover:border-[#FF6A00]/20 transition-all shadow-lg active:scale-90 disabled:opacity-30 cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          
          <button className="category-next absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border border-black/[0.05] flex items-center justify-center text-[#1A1F36]/40 hover:text-[#FF6A00] hover:border-[#FF6A00]/20 transition-all shadow-lg active:scale-90 disabled:opacity-30 cursor-pointer">
            <ChevronRight size={24} />
          </button>

          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{
              nextEl: ".category-next",
              prevEl: ".category-prev",
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            spaceBetween={16}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 20 },
              768: { slidesPerView: 4, spaceBetween: 24 },
              1024: { slidesPerView: 5, spaceBetween: 24 },
              1280: { slidesPerView: 6, spaceBetween: 30 },
            }}
            className="category-swiper !pb-12 !px-2"
          >
            {categories.map((cat, idx) => {
              const categoryName = typeof cat === "string" ? cat : cat.name || "";
              const slug = cat.slug || (typeof cat === "string" ? cat : cat.name || "");
              const colorClass = getCategoryColor(categoryName);
              
              return (
                <SwiperSlide key={idx} className="!h-auto">
                  <Link
                    href={`/${currentCity}/${slug.toLowerCase()}`}
                    className="group relative flex flex-col items-center justify-center p-5 md:p-8 rounded-[28px] bg-white border border-black/[0.03] hover:border-[#FF6A00]/20 transition-all duration-500 hover:shadow-xl hover:shadow-[#FF6A00]/5 hover:-translate-y-1.5 overflow-hidden h-full min-h-[140px] md:min-h-[190px]"
                  >
                    {/* Hover Accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${colorClass} flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm flex-shrink-0`}>
                      <CategoryIcon name={categoryName} size={24} className="md:w-8 md:h-8" strokeWidth={2.5} />
                    </div>
                    
                    <span className="text-[12px] md:text-[14px] font-black text-[#1A1F36] text-center tracking-tight group-hover:text-[#FF6A00] transition-colors line-clamp-2 w-full px-1 leading-tight">
                      {categoryName}
                    </span>
                    
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 hidden md:block">
                      <div className="px-3 py-1 rounded-full bg-[#FF6A00]/5 text-[#FF6A00] text-[9px] font-black uppercase tracking-widest">
                        Browse
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .category-swiper .swiper-button-disabled {
          opacity: 0.3 !important;
          cursor: not-allowed !important;
        }
      `}</style>
    </section>
  );
};

export default CategoryGrid;


