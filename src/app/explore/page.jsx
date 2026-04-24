"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getApprovedShops, getCategories } from "@/lib/db";
import ShopCard from "@/components/Shop/ShopCard";
import {
  Search, MapPin, Layers, Map, SlidersHorizontal,
  ChevronDown, RotateCcw, LayoutGrid, List, X, Store, Navigation, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";

function ExploreContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isDetecting, setIsDetecting] = useState(false);

  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const [localState, setLocalState] = useState(searchParams.get("state") || "");
  const [localCity, setLocalCity] = useState(searchParams.get("city") || "");
  const [localCategory, setLocalCategory] = useState(searchParams.get("category") || "");
  const [localArea, setLocalArea] = useState(searchParams.get("area") || "");

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
          if (city) {
            const cleanCity = city.replace(/ District| Division/g, "");
            setLocalCity(cleanCity);
            // Apply immediately
            const params = new URLSearchParams(searchParams.toString());
            params.set("city", cleanCity);
            params.delete("nearby");
            router.push(`${pathname}?${params.toString()}`);
          }
        } catch (error) {
          console.error("Location error:", error);
        } finally {
          setIsDetecting(false);
        }
      },
      () => setIsDetecting(false)
    );
  };

  useEffect(() => {
    if (searchParams.get("nearby") === "true") {
      detectLocation();
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      const [allShops, allCats] = await Promise.all([
        getApprovedShops(),
        getCategories(),
      ]);
      setShops(allShops);
      setCategories(allCats);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (localSearch) params.set("q", localSearch);
    if (localState) params.set("state", localState);
    if (localCity) params.set("city", localCity);
    if (localCategory) params.set("category", localCategory);
    if (localArea) params.set("area", localArea);
    router.push(`${pathname}?${params.toString()}`);
    setShowFilters(false);
  };

  const handleReset = () => {
    setLocalSearch(""); setLocalState(""); setLocalCity("");
    setLocalCategory(""); setLocalArea("");
    router.push(pathname);
  };

  const filteredShops = shops.filter((shop) => {
    const q = searchParams.get("q")?.toLowerCase() || "";
    const s = searchParams.get("state") || "";
    const c = searchParams.get("city") || "";
    const cat = searchParams.get("category") || "";
    const a = searchParams.get("area") || "";
    return (
      (!q || shop.name.toLowerCase().includes(q) || shop.description?.toLowerCase().includes(q)) &&
      (!s || shop.state === s) &&
      (!c || shop.city === c) &&
      (!cat || shop.category === cat) &&
      (!a || shop.area === a)
    );
  });

  const availableCities = [...new Set(shops.filter(s => !localState || s.state === localState).map(s => s.city))].sort();
  const availableAreas = [...new Set(shops.filter(s => !localCity || s.city === localCity).map(s => s.area))].sort();
  const activeFilterCount = [localState, localCity, localCategory, localArea].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center gap-3">

          {/* Search input */}
          <div className="flex-1 flex items-center gap-2 h-9 px-3 bg-white border border-black/10 rounded-xl">
            <Search size={14} className="text-[#999] flex-shrink-0" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search shops..."
              className="flex-1 text-[13px] font-medium text-[#0F0F0F] placeholder:text-[#bbb] bg-transparent outline-none"
            />
            {localSearch && (
              <button onClick={() => setLocalSearch("")} className="text-[#bbb] hover:text-[#666]">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl border text-[12px] font-semibold transition-all flex-shrink-0 ${activeFilterCount > 0 || showFilters
              ? "bg-[#FF6B35] border-[#FF6B35] text-white"
              : "bg-white border-black/10 text-[#555] hover:border-[#FF6B35]/50"
              }`}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:block">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 p-0.5 bg-white border border-black/10 rounded-xl flex-shrink-0">
            {[
              { mode: "grid", icon: LayoutGrid },
              { mode: "list", icon: List },
            ].map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === mode ? "bg-[#0F0F0F] text-white shadow-sm" : "text-[#999] hover:text-[#555]"
                  }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* Nearby Toggle */}
          <button
            onClick={detectLocation}
            disabled={isDetecting}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl border text-[12px] font-semibold transition-all flex-shrink-0 ${localCity && !searchParams.get("city") // if city detected but not applied yet? or just show active
              ? "bg-[#FF6B35]/10 border-[#FF6B35]/20 text-[#FF6B35]"
              : "bg-white border-black/10 text-[#555] hover:border-[#FF6B35]/50"
              }`}
          >
            {isDetecting ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
            <span className="hidden sm:block">{isDetecting ? "Detecting..." : "Nearby"}</span>
          </button>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="h-9 px-4 bg-[#0F0F0F] text-white text-[12px] font-semibold rounded-xl hover:bg-[#333] transition-colors flex-shrink-0 hidden sm:flex items-center"
          >
            Search
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="border-t border-black/[0.06] bg-white px-4 md:px-8 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto flex flex-wrap items-end gap-3">
              {[
                { label: "State", value: localState, onChange: setLocalState, options: [...new Set(shops.map(s => s.state))].filter(Boolean).sort() },
                { label: "City", value: localCity, onChange: setLocalCity, options: availableCities },
                { label: "Category", value: localCategory, onChange: setLocalCategory, options: categories.map(c => c.name).filter(Boolean) },
                { label: "Area", value: localArea, onChange: setLocalArea, options: availableAreas },
              ].map(({ label, value, onChange, options }) => (
                <div key={label} className="flex flex-col gap-1 min-w-[140px]">
                  <label className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">{label}</label>
                  <div className="relative">
                    <select
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="appearance-none w-full h-9 pl-3 pr-8 bg-[#F5F5F3] border border-black/[0.07] rounded-xl text-[12px] font-medium text-[#333] outline-none focus:border-[#FF6B35]/50 transition-colors"
                    >
                      <option value="">All {label}s</option>
                      {options.map((opt, i) => (
                        <option key={`${opt}-${i}`} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none" />
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleReset}
                  className="h-9 px-4 flex items-center gap-1.5 text-[12px] font-medium text-[#888] hover:text-[#333] transition-colors"
                >
                  <RotateCcw size={12} /> Reset
                </button>
                <button
                  onClick={handleSearch}
                  className="h-9 px-5 bg-[#FF6B35] text-white text-[12px] font-semibold rounded-xl hover:bg-[#e85c25] transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Results meta */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-[#0F0F0F] tracking-tight">
              {searchParams.get("q")
                ? `Results for "${searchParams.get("q")}"`
                : "All shops"}
            </h1>
            <p className="text-[13px] text-[#999] mt-0.5">
              {loading ? "Loading..." : `${filteredShops.length} verified business${filteredShops.length !== 1 ? "es" : ""} found`}
            </p>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { label: localState, key: "state", clear: () => setLocalState("") },
              { label: localCity, key: "city", clear: () => setLocalCity("") },
              { label: localCategory, key: "category", clear: () => setLocalCategory("") },
              { label: localArea, key: "area", clear: () => setLocalArea("") },
            ].filter(f => f.label).map((f) => (
              <div key={f.key} className="flex items-center gap-1.5 h-7 pl-3 pr-2 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-full text-[11px] font-semibold text-[#FF6B35]">
                {f.label}
                <button onClick={f.clear} className="hover:bg-[#FF6B35]/20 rounded-full p-0.5 transition-colors">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`bg-white rounded-2xl border border-black/[0.06] animate-pulse ${viewMode === "grid" ? "h-64" : "h-24"}`} />
            ))}
          </div>
        ) : filteredShops.length > 0 ? (
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} variant={viewMode} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/[0.06] py-24 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F5F3] flex items-center justify-center">
              <Search size={24} className="text-[#ccc]" />
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#0F0F0F] mb-1">No shops found</h3>
              <p className="text-[13px] text-[#999]">Try adjusting your filters or search term</p>
            </div>
            <button
              onClick={handleReset}
              className="mt-2 h-9 px-5 bg-[#FF6B35] text-white text-[12px] font-semibold rounded-xl hover:bg-[#e85c25] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-[13px] text-[#999] font-medium">Loading...</div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}