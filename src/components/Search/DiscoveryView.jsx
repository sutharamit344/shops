"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import ShopCard from "@/components/Shop/ShopCard";
import ClusterSlider from "@/components/Shop/ClusterSlider";
import { setSearch, setSortBy, setCategory } from "@/redux/slices/filterSlice";
import { getCategories, getClusters } from "@/lib/db";
import {
  ChevronDown, LayoutGrid, List, Search, RotateCcw, MapPin,
  SlidersHorizontal,
  ArrowUpDown
} from "lucide-react";
import Button from "@/components/UI/Button";
import { generateDiscoveryUrl } from "@/lib/urlArchitect";
import { slugify } from "@/lib/slugify";

import { ShopCardSkeleton } from "@/components/Shop/ShopCardSkeleton";

const DiscoveryView = ({ title, subtitle, onSubtitleClick }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { results: filteredShops, loading: shopsLoading, parsed } = useSelector((state) => state.search);
  const { sortBy, category: activeCategory } = useSelector((state) => state.filters);
  const { items: allShops } = useSelector((state) => state.shops);
  const [clusters, setClusters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [visibleCount, setVisibleCount] = useState(6);
  const [showSort, setShowSort] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const [clusterData, catData] = await Promise.all([
        getClusters(),
        getCategories()
      ]);
      setClusters(clusterData);
      setCategories(catData);
    };
    init();
  }, []);

  const handleCategoryChipClick = (catName) => {
    const newCat = activeCategory === catName ? "" : catName;
    dispatch(setCategory(newCat));
    const url = generateDiscoveryUrl(newCat, parsed.location || "", parsed.type || "all", parsed.clusterType || "");
    router.push(url);
  };

  const handleSortChange = (mode) => {
    dispatch(setSortBy(mode));
    setShowSort(false);
  };

  const handleClusterClick = (clusterName, clusterLocation) => {
    const url = generateDiscoveryUrl("", clusterLocation || "", "all", clusterName);
    router.push(url);
  };

  useEffect(() => {
    setVisibleCount(6);
  }, [filteredShops]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredShops.length) {
          setVisibleCount((prev) => prev + 6);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, filteredShops.length]);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-22">
      <header className="mb-8 mt-10 sm:mt-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1A1F36] tracking-tighter mb-2">
              {title}
            </h1>
            {subtitle && (
              <div 
                onClick={onSubtitleClick}
                className="flex items-center gap-1.5 text-[#FF6B35] font-bold text-[14px] hover:opacity-80 cursor-pointer group w-fit bg-[#FF6B35]/5 px-3 py-1 rounded-lg border border-[#FF6B35]/10"
              >
                <MapPin size={14} className="group-hover:animate-bounce" />
                <span>{subtitle}</span>
                <ChevronDown size={12} className="opacity-50" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className={`h-11 px-4 rounded-xl border flex items-center gap-2 text-[13px] font-bold transition-all ${
                  showSort ? "border-[#FF6B35] bg-white text-[#FF6B35] shadow-md" : "border-black/[0.06] bg-white text-[#1A1F36] hover:bg-gray-50"
                }`}
              >
                <ArrowUpDown size={14} />
                <span className="capitalize">{sortBy}</span>
              </button>

              {showSort && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-black/[0.08] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {[
                      { id: "relevance", label: "Smart Relevance" },
                      { id: "distance", label: "Near Me First" },
                      { id: "rating", label: "Top Rated" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSortChange(opt.id)}
                        className={`w-full text-left px-5 py-3 text-[13px] font-bold transition-colors ${
                          sortBy === opt.id ? "bg-[#FF6B35]/5 text-[#FF6B35]" : "text-[#1A1F36] hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white border border-black/[0.06] rounded-xl shadow-sm">
              {[
                { mode: "grid", icon: LayoutGrid },
                { mode: "list", icon: List },
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${viewMode === mode ? "bg-[#1A1F36] text-white shadow-md" : "text-[#1A1F36]/30 hover:text-[#1A1F36]"
                    }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Chips - Horizontal Scroll */}
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => handleCategoryChipClick("")}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all border ${
                !activeCategory ? "bg-[#1A1F36] text-white border-[#1A1F36] shadow-md" : "bg-white text-[#1A1F36]/60 border-black/[0.06] hover:border-black/[0.15]"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChipClick(cat.name)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all border whitespace-nowrap ${
                  activeCategory === cat.name ? "bg-[#FF6B35] text-white border-[#FF6B35] shadow-md" : "bg-white text-[#1A1F36]/60 border-black/[0.06] hover:border-black/[0.15]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {/* Fading Edges for Scroll */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#FAFAF8] to-transparent pointer-events-none md:hidden" />
        </div>
      </header>

      {!shopsLoading && filteredShops.length > 0 && (
        <ClusterSlider
          clusters={clusters}
          shops={allShops}
          onClusterClick={handleClusterClick}
          parsed={parsed}
        />
      )}

      {shopsLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" : "space-y-6"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ShopCardSkeleton key={i} variant={viewMode} />
          ))}
        </div>
      ) : filteredShops.length > 0 ? (
        <>
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            : "space-y-6 md:space-y-8"
          }>
            {filteredShops.slice(0, visibleCount).map((shop, i) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                viewMode={viewMode}
                index={i}
              />
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          <div ref={observerRef} className="h-20 flex items-center justify-center">
            {visibleCount < filteredShops.length && (
              <div className="flex items-center gap-2 text-[#FF6B35] font-bold text-[13px]">
                <div className="w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                <span>Discovering more...</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-[#1A1F36]/[0.07] py-24 px-6 flex flex-col items-center text-center gap-5 max-w-2xl mx-auto shadow-md">
          <div className="w-20 h-20 rounded-3xl bg-[#FAFAF8] flex items-center justify-center text-[#1A1F36]/10">
            <Search size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1A1F36] mb-1">No matching shops found</h3>
            <p className="text-[15px] text-[#1A1F36]/40">Try adjusting your search to see more results.</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default DiscoveryView;
