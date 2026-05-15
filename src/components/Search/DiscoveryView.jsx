"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import ShopCard from "@/components/Shop/ShopCard";
import ClusterSlider from "@/components/Shop/ClusterSlider";
import { setCategory } from "@/redux/slices/filterSlice";
import { getCategories, getClusters } from "@/lib/db";
import { Search, MapPin, LayoutGrid, List, Award, ArrowRight, User } from "lucide-react";
import { generateDiscoveryUrl } from "@/lib/urlArchitect";
import { slugify } from "@/lib/slugify";
import { ShopCardSkeleton } from "@/components/Shop/ShopCardSkeleton";
import { getEmojiByName } from "@/components/UI/CategoryIcon";

/**
 * Core View for Discovery Results
 * Consolidates 'explore' and 'discovery' into a single grid layout
 */
const DiscoveryView = ({ title, subtitle, onSubtitleClick, onRefresh, isDetecting, onClusterClick, viewMode, setViewMode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { results: filteredShops, loading: shopsLoading, parsed } = useSelector((state) => state.search);
  const { category: activeCategory } = useSelector((state) => state.filters);
  const { items: allShops } = useSelector((state) => state.shops);
  const { items: categories } = useSelector((state) => state.categories);
  const { items: clusters } = useSelector((state) => state.clusters);
  const [visibleCount, setVisibleCount] = useState(6);
  const loadMoreRef = useRef(null);

  // Infinite Scroll Observer
  useEffect(() => {
    if (shopsLoading || visibleCount >= filteredShops.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 6);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [filteredShops.length, visibleCount, shopsLoading]);


  const handleCategoryChipClick = (catName) => {
    const newCat = activeCategory === catName ? "" : catName;
    dispatch(setCategory(newCat));

    // Explicitly pass city and area for hierarchical SEO routes
    const url = generateDiscoveryUrl(
      newCat,
      parsed.city || "ahmedabad",
      "all",
      parsed.area || ""
    );
    router.push(url);
  };

  const { categoryCounts, exactMatches, nearbyMatches, isNearYou } = React.useMemo(() => {
    const counts = {};
    const exact = filteredShops.filter(s => s.isLocationMatch).length;

    filteredShops.forEach(shop => {
      const cat = (shop.category || "").toLowerCase().trim();
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });

    const isNearYou = typeof window !== "undefined"
      ? (localStorage.getItem('last_city')?.toLowerCase().includes((parsed?.city || "").toLowerCase()) &&
        (!parsed?.area || localStorage.getItem('last_area')?.toLowerCase().includes(parsed.area.toLowerCase())))
      : false;

    return {
      categoryCounts: counts,
      exactMatches: exact,
      nearbyMatches: filteredShops.length,
      isNearYou
    };
  }, [filteredShops, parsed]);

  useEffect(() => {
    setVisibleCount(6);
  }, [filteredShops]);

  return (
    <div className="space-y-4">
      {/* Old Style Category Navigation */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4 border-b border-black/[0.04]">
        <button
          onClick={() => handleCategoryChipClick("")}
          className={`flex-shrink-0 px-3 py-1 rounded-xl text-xs md:text-md font-bold transition-all border ${!activeCategory ? "bg-[#1A1F36] text-white border-[#1A1F36] shadow-lg shadow-black/10" : "bg-white text-gray-500 border-black/[0.08] hover:border-black/[0.15]"}`}
        >
          All Categories
        </button>
        {categories
          .filter((cat, index, self) => 
            // 1. Ensure count > 0
            (categoryCounts[cat.name.toLowerCase().trim()] || 0) > 0 &&
            // 2. Ensure name is unique in the displayed list
            self.findIndex(c => c.name.toLowerCase().trim() === cat.name.toLowerCase().trim()) === index
          )
          .map((cat) => {
            const isSelected = activeCategory && (
              slugify(activeCategory) === slugify(cat.name) ||
              cat.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
              activeCategory.toLowerCase().includes(cat.name.toLowerCase())
            );
            const count = categoryCounts[cat.name.toLowerCase().trim()] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChipClick(cat.name)}
                className={`flex-shrink-0 px-3 py-1 rounded-xl text-xs md:text-md font-bold transition-all border whitespace-nowrap flex items-center gap-1.5 ${isSelected
                  ? "bg-[#1A1F36] text-white border-[#1A1F36] shadow-lg shadow-black/10"
                  : "bg-white text-gray-500 border-black/[0.08] hover:border-black/[0.15]"
                  }`}
              >
                <span className="text-md">{getEmojiByName(cat.name)}</span>
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Cluster Slider */}
      {!shopsLoading && clusters.length > 0 && (
        <ClusterSlider
          clusters={clusters}
          shops={allShops}
          parsed={parsed}
          onClusterClick={onClusterClick}
        />
      )}

      {/* Results Summary Count */}
      {!shopsLoading && filteredShops.length > 0 && (
        <div className="flex items-center justify-between gap-4 px-1 py-4 mb-2 border-b border-black/[0.03]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-gradient-to-b from-[#FF6A00] to-[#FF6A00]/20 rounded-full" />
            <div className="flex flex-col">
              <h2 className="text-lg md:text-xl font-black text-[#1A1F36] leading-none tracking-tight flex gap-3">
                {exactMatches > 0 ? (
                  <><span className="text-[#FF6A00]">{exactMatches}</span> Shops {isNearYou ? "Near You" : `in ${parsed.area || parsed.city}`}</>
                ) : (
                  <><span className="text-[#FF6A00]">{nearbyMatches}</span> Shops near you</>
                )}
              </h2>
            </div>
          </div>

          {exactMatches > 0 && nearbyMatches > exactMatches && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-black/[0.06] shadow-sm">
              <span className="w-2 h-2 bg-[#FF6A00] rounded-full animate-pulse shadow-[0_0_8px_#FF6A00]" />
              <span className="text-[12px] font-bold text-gray-500 whitespace-nowrap">
                +{nearbyMatches - exactMatches} <span className="text-gray-400">NEARBY</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grid/List Content */}
      {shopsLoading ? (
        <div className={`grid gap-10 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ShopCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredShops.length > 0 ? (
        <div className={`grid gap-10 md:gap-12 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {filteredShops.slice(0, visibleCount).map((shop, i) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              variant={viewMode}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[48px] border border-black/[0.06] py-20 px-6 flex flex-col items-center text-center gap-8 max-w-4xl mx-auto shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-[28px] bg-[#FAFAF8] flex items-center justify-center text-gray-300">
              <Search size={40} strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#1A1F36] mb-2">No matching shops found</h3>
              <p className="text-[15px] text-gray-400 font-medium">Try adjusting your filters or searching in a different area.</p>
            </div>
          </div>

          {clusters.length > 0 && (
            <div className="w-full pt-8 border-t border-black/[0.04]">
              <h4 className="text-[13px] font-black uppercase tracking-widest text-gray-400 mb-6">You might like these nearby hubs</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {clusters.slice(0, 4).map((cluster) => (
                  <button
                    key={cluster.id}
                    onClick={() => onClusterClick(cluster.name)}
                    className="p-4 rounded-3xl bg-[#FAFAF8] border border-black/[0.02] hover:border-[#FF6A00]/20 hover:bg-white hover:shadow-xl hover:shadow-[#FF6A00]/5 transition-all group text-left"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{getEmojiByName(cluster.name)}</div>
                    <div className="text-[14px] font-black text-[#1A1F36] leading-tight mb-1">{cluster.name}</div>
                    <div className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-widest">Explore Hub</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination / Auto-Loader Target */}
      {!shopsLoading && visibleCount < filteredShops.length && (
        <div ref={loadMoreRef} className="pt-20 pb-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#FF6A00]/20 border-t-[#FF6A00] rounded-full animate-spin" />
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Loading more shops...</p>
        </div>
      )}
      {/* Merchant CTA Section */}
      <div className="mt-20 py-16 px-6 rounded-[48px] bg-gradient-to-br from-[#1A1F36] to-[#0F0F0F] relative overflow-hidden shadow-2xl shadow-black/20">
        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6A00]/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] -ml-24 -mb-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 max-w-5xl mx-auto">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#FF6A00] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Award size={12} />
              Merchant Partner Program
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6 tracking-tighter">
              Ready to grow your <br className="hidden lg:block" /> 
              <span className="text-[#FF6A00]">local business</span> digitally?
            </h2>
            <p className="text-[16px] md:text-lg text-white/50 font-medium leading-relaxed max-w-xl">
              Join 5,000+ verified shops on ShopBajar. Get found by local customers on Google 
              and connect instantly via WhatsApp.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => router.push('/create')}
              className="group relative px-10 py-5 bg-[#FF6A00] text-white rounded-[24px] font-black text-lg shadow-xl shadow-[#FF6A00]/20 hover:bg-[#FF8457] transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              List Your Shop Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-4 text-white/30 text-[12px] font-bold uppercase tracking-widest">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1A1F36] bg-gray-700 flex items-center justify-center text-[10px]">
                    <User size={12} />
                  </div>
                ))}
              </div>
              <span>Trusted by 5k+ Merchants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryView;
