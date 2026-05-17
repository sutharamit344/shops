"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import ShopCard from "@/components/Shop/ShopCard";
import ClusterSlider from "@/components/Shop/ClusterSlider";
import { setCategory, setSortBy, toggleTag } from "@/redux/slices/filterSlice";
import { getCategories, getClusters } from "@/lib/db";
import { Search, MapPin, LayoutGrid, List, Award, ArrowRight, User, Star, ShieldCheck, Clock } from "lucide-react";
import { generateDiscoveryUrl } from "@/lib/urlArchitect";
import { slugify } from "@/lib/slugify";
import { ShopCardSkeleton } from "@/components/Shop/ShopCardSkeleton";
import { getEmojiByName } from "@/components/UI/CategoryIcon";

/**
 * Core View for Discovery Results
 * Consolidates 'explore' and 'discovery' into a single grid layout
 */
const properCase = (str) => {
  if (!str) return "";
  return str.split(/[ -]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const DiscoveryView = ({ title, subtitle, onSubtitleClick, onRefresh, isDetecting, onClusterClick, viewMode, setViewMode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { results: filteredShops, loading: shopsLoading, parsed } = useSelector((state) => state.search);
  const { category: activeCategory, sortBy, tags } = useSelector((state) => state.filters);
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

    allShops.forEach(shop => {
      const sCity = (shop.city || "").toLowerCase().trim();
      const sArea = (shop.area || "").toLowerCase().trim();
      const pCity = (parsed?.city || "").toLowerCase().trim();
      const pArea = (parsed?.area || "").toLowerCase().trim();

      let match = true;
      if (pCity && sCity !== pCity && !sCity.includes(pCity) && !pCity.includes(sCity)) match = false;
      if (pArea && sArea !== pArea && !sArea.includes(pArea) && !pArea.includes(sArea)) match = false;

      if (match) {
        const cat = (shop.category || "").toLowerCase().trim();
        if (cat) counts[cat] = (counts[cat] || 0) + 1;
      }
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
  }, [allShops, filteredShops, parsed]);

  useEffect(() => {
    setVisibleCount(6);
  }, [filteredShops]);

  const sortOptions = [
    { id: "relevance", label: "Most Relevant", icon: Star },
    { id: "distance", label: "Nearest to Me", icon: MapPin },
    { id: "rating", label: "Highest Rated", icon: Star },
  ];

  const tagOptions = [
    { id: "openNow", label: "Open Now", icon: Clock },
    { id: "verified", label: "Verified Only", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Desktop Sticky Sidebar for Sort & Filter */}
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-[80px] z-30">
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4 shadow-sm">
          <div className="mb-4 pb-3 border-b border-black/[0.05]">
            <h3 className="text-[15px] font-bold text-[#0A0A0F] mb-0.5">Sort & Filter</h3>
            <p className="text-[12px] text-[#0A0A0F]/40">Refine your discovery experience</p>
          </div>

          <div className="space-y-5">
            {/* Sort Section */}
            <div>
              <h4 className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.1em] mb-2.5 px-1">
                Sort Results By
              </h4>
              <div className="flex flex-col gap-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => dispatch(setSortBy(option.id))}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left ${sortBy === option.id
                      ? "border-[#FF6A00]/40 bg-[#FF6A00]/5 text-[#FF6A00]"
                      : "border-black/[0.05] bg-white text-[#0A0A0F]/60 hover:border-black/[0.1] hover:bg-black/[0.01]"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <option.icon size={14} className={sortBy === option.id ? "text-[#FF6A00]" : "text-[#0A0A0F]/30"} />
                      <span className={`text-[13px] font-medium ${sortBy === option.id ? "text-[#FF6A00]" : ""}`}>{option.label}</span>
                    </div>
                    {sortBy === option.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] shadow-[0_0_8px_rgba(255,106,0,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <h4 className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.1em] mb-2.5 px-1">
                Preference
              </h4>
              <div className="flex flex-col gap-1">
                {tagOptions.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => dispatch(toggleTag(tag.id))}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left ${tags[tag.id]
                      ? "border-[#FF6A00]/40 bg-[#FF6A00]/5 text-[#FF6A00]"
                      : "border-black/[0.05] bg-white text-[#0A0A0F]/60 hover:border-black/[0.1] hover:bg-black/[0.01]"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <tag.icon size={14} className={tags[tag.id] ? "text-[#FF6A00]" : "text-[#0A0A0F]/30"} />
                      <span className={`text-[13px] font-medium ${tags[tag.id] ? "text-[#FF6A00]" : ""}`}>{tag.label}</span>
                    </div>

                    {/* Compact Switch */}
                    <div className={`w-8 h-4 rounded-full transition-all relative ${tags[tag.id] ? "bg-[#FF6A00]" : "bg-black/[0.1]"
                      }`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${tags[tag.id] ? "left-4.5" : "left-0.5"
                        }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Listing Content */}
      <div className="flex-1 min-w-0 w-full space-y-4">
        {/* Category Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 border-b border-black/[0.05]">
          <button
            onClick={() => handleCategoryChipClick("")}
            className={`flex-shrink-0 h-7 px-3 rounded-md text-[12px] font-medium transition-all ${!activeCategory
              ? "bg-[#0A0A0F] text-white shadow-sm"
              : "bg-transparent text-[#0A0A0F]/50 hover:bg-black/[0.05] hover:text-[#0A0A0F]"
              }`}
          >
            All
          </button>
          {categories
            .filter((cat, index, self) =>
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
                  className={`flex-shrink-0 h-7 px-3 rounded-md text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${isSelected
                    ? "bg-[#0A0A0F] text-white shadow-sm"
                    : "bg-transparent text-[#0A0A0F]/50 hover:bg-black/[0.05] hover:text-[#0A0A0F]"
                    }`}
                >
                  <span className="text-[13px] leading-none">{getEmojiByName(cat.name)}</span>
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1 py-0.5 rounded font-semibold ${isSelected ? "bg-white/20 text-white" : "bg-black/[0.06] text-[#0A0A0F]/40"
                      }`}>{count}</span>
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

        {/* Results count row */}
        {!shopsLoading && filteredShops.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#0A0A0F]/60">
                <span className="text-[#0A0A0F] font-bold">
                  {parsed?.area ? exactMatches : filteredShops.length}
                </span> shops found
                {parsed?.area && (
                  <>
                    <span className="text-[#0A0A0F]/40"> in </span>
                    <span className="text-[#0A0A0F] font-bold">{properCase(parsed.area)}</span>
                  </>
                )}
              </span>
              {exactMatches > 0 && nearbyMatches > exactMatches && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#0A0A0F]/35 bg-black/[0.04] px-2 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
                  +{nearbyMatches - exactMatches} nearby
                </span>
              )}
            </div>
          </div>
        )}

        {/* Grid/List Content */}
        {shopsLoading ? (
          <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ShopCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredShops.length > 0 ? (
          <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
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
          <div className="bg-white rounded-lg border border-black/[0.06] py-14 px-6 flex flex-col items-center text-center gap-5">
            <div className="w-12 h-12 rounded-lg bg-black/[0.04] flex items-center justify-center text-[#0A0A0F]/20">
              <Search size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#0A0A0F] mb-1">No shops found</h3>
              <p className="text-[13px] text-[#0A0A0F]/40">Try adjusting your filters or searching in a different area.</p>
            </div>
            {clusters.length > 0 && (
              <div className="w-full pt-5 border-t border-black/[0.05]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0F]/30 mb-3">Nearby hubs</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {clusters.slice(0, 4).map((cluster) => (
                    <button
                      key={cluster.id}
                      onClick={() => onClusterClick(cluster.name, cluster.city, cluster.area)}
                      className="p-3 rounded-lg bg-black/[0.03] border border-transparent hover:border-black/[0.08] hover:bg-white hover:shadow-sm transition-all text-left"
                    >
                      <div className="text-xl mb-1">{getEmojiByName(cluster.name)}</div>
                      <div className="text-[13px] font-semibold text-[#0A0A0F] leading-tight">{cluster.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Load more trigger */}
        {!shopsLoading && visibleCount < filteredShops.length && (
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#0A0A0F]/10 border-t-[#FF6A00] rounded-full animate-spin" />
          </div>
        )}
        {/* Merchant CTA */}
        <div className="mt-10 p-6 md:p-8 rounded-2xl bg-[#0A0A0F] relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF6A00]/15 rounded-full blur-[60px]" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/8 border border-white/10 text-[#FF6A00] text-[11px] font-semibold mb-3">
                <Award size={11} />
                Merchant Partner Program
              </div>
              <h2 className="text-[20px] md:text-2xl font-bold text-white mb-1.5 leading-tight">
                Grow your local business digitally
              </h2>
              <p className="text-[13px] text-white/40 max-w-md">
                Join verified shops on ShopBajar. Get found by customers and connect via WhatsApp instantly.
              </p>
            </div>
            <button
              onClick={() => router.push('/create')}
              className="flex-shrink-0 h-10 px-5 rounded-lg bg-[#FF6A00] text-white text-[13px] font-semibold hover:bg-[#E65F00] transition-all flex items-center gap-2 shadow-lg shadow-[#FF6A00]/20"
            >
              List Your Shop Free
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryView;
