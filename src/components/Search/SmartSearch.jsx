"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Search, MapPin, History, X, Phone, MessageSquare, Store, Award, ArrowLeft, ChevronRight } from "lucide-react";
import CategoryIcon from "@/components/UI/CategoryIcon";
import { setQuery, setSuggestions, addRecentSearch } from "@/redux/slices/searchSlice";
import { parseSmartQuery } from "@/lib/searchParser";
import { generateDiscoveryUrl } from "@/lib/urlArchitect";
import { slugify } from "@/lib/slugify";
import { BRAND } from "@/lib/config";
import { getSuggestions, getSmartSuggestions, getDefaultSuggestions } from "@/lib/searchEngine";
import { fetchCategories, fetchClusters } from "@/redux/thunks/categoryThunks";
import { fetchApprovedShops } from "@/redux/thunks/shopThunks";

import { getCachedLocation, updateLocationCache } from "@/lib/db";

const SmartSearch = ({ onFocusStateChange }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { query, suggestions, recentSearches } = useSelector((state) => state.search);
  const { items: categories, clusters } = useSelector((state) => state.categories);
  const { items: shops } = useSelector((state) => state.shops);

  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    if (shops.length === 0) dispatch(fetchApprovedShops());
    if (clusters.length === 0) dispatch(fetchClusters());
  }, [dispatch, categories.length, shops.length, clusters.length]);

  const containerRef = useRef(null);

  useEffect(() => {
    onFocusStateChange?.(isFocused);
  }, [isFocused, onFocusStateChange]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Memoize search pool
  const searchPool = React.useMemo(() => {
    const categoryCounts = shops.reduce((acc, shop) => {
      const cat = (shop.category || "").toLowerCase().trim();
      if (cat) acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const clusterCounts = shops.reduce((acc, shop) => {
      const clus = (shop.clusterType || "").toLowerCase().trim();
      if (clus) acc[clus] = (acc[clus] || 0) + 1;
      return acc;
    }, {});

    const pool = [
      ...categories.map(c => ({
        type: "category",
        text: c.name,
        count: categoryCounts[c.name.toLowerCase().trim()] || 0
      })),
      ...clusters.map(c => ({
        type: "cluster",
        text: c.name,
        count: clusterCounts[c.name.toLowerCase().trim()] || 0
      })),
      ...shops.map(s => ({
        type: "shop",
        text: s.name,
        slug: s.slug,
        category: s.category,
        metrics: { avgRating: s.avgRating, totalRatings: s.totalRatings },
        phone: s.phone,
        whatsapp: s.whatsapp || s.phone
      })),
      ...Array.from(new Set(shops.map(s => `${s.area}, ${s.city}`)))
        .filter(Boolean)
        .map(locStr => {
          const [area, city] = locStr.split(", ");
          return {
            type: "location",
            text: locStr,
            area,
            city,
            count: shops.filter(s => s.area === area && s.city === city).length
          };
        }),
    ];

    const seen = new Set();
    return pool.filter(item => {
      const key = `${item.type}-${item.text.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories, shops, clusters]);

  const highlightMatch = (text, query) => {
    if (!text) return "";
    if (!query || !query.trim()) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <b key={i} className="text-[#FF6A00]">{part}</b>
            : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    const generateSuggestions = () => {
      const currentCity = typeof window !== 'undefined' ? localStorage.getItem('last_city') : "india";
      const currentArea = typeof window !== 'undefined' ? localStorage.getItem('last_area') : "";
      const context = { city: currentCity, area: currentArea };

      if (!query.trim()) {
        return getDefaultSuggestions(categories, context);
      }

      // Use the new Smart Suggestion Engine
      return getSmartSuggestions(query, searchPool, context);
    };

    const timer = setTimeout(() => {
      dispatch(setSuggestions(generateSuggestions()));
    }, query ? 300 : 0);

    return () => clearTimeout(timer);
  }, [query, isOpen, searchPool, dispatch]);

  const handleSearch = async (selectedItem) => {
    // If the item already has a pre-calculated SEO path, use it immediately
    if (selectedItem?.path) {
      router.push(selectedItem.path);
      setIsOpen(false);
      setIsFocused(false);
      return;
    }

    const searchText = typeof selectedItem === 'string' ? selectedItem : (selectedItem?.text || query);
    if (!searchText) return;

    if (selectedItem?.type === 'shop' && selectedItem.slug) {
      router.push(`/shop/${selectedItem.slug}`);
      setIsOpen(false);
      setIsFocused(false);
      return;
    }

    const parsed = parseSmartQuery(searchText, clusters.map(c => c.name));

    // Use last saved city/area if no location specified in search
    let searchCity = parsed.location;
    let searchArea = "";

    // If the location string looks like "Area, City" or "Area City", split it
    if (searchCity && searchCity !== "current") {
      const locParts = searchCity.split(/[ ,]+/).filter(Boolean);
      if (locParts.length >= 2) {
        // Assume last word is city, rest is area (e.g. "Gota Ahmedabad")
        searchCity = locParts[locParts.length - 1];
        searchArea = locParts.slice(0, locParts.length - 1).join(" ");
      }
    }

    if (!searchCity || searchCity === "current") {
      const savedCity = typeof window !== 'undefined' ? localStorage.getItem('last_city') : "";
      const savedArea = typeof window !== 'undefined' ? localStorage.getItem('last_area') : "";

      if (savedCity) {
        searchCity = savedCity;
        searchArea = savedArea || "";
      }
    }

    if (searchCity && searchCity !== "current") {
      try {
        const cached = await getCachedLocation(searchCity);
        if (!cached) {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchCity)}&limit=1`);
          const geoData = await res.json();
          if (geoData && geoData[0]) {
            const lat = parseFloat(geoData[0].lat);
            const lng = parseFloat(geoData[0].lon);
            await updateLocationCache(searchCity, lat, lng);
            // Removed localStorage.setItem to keep "Current Location" sticky
          }
        } else {
          // Removed localStorage.setItem to keep "Current Location" sticky
        }
      } catch (e) { console.error(e); }
    }

    const url = generateDiscoveryUrl(parsed.category, searchCity, parsed.type, searchArea || parsed.clusterType);
    dispatch(addRecentSearch(searchText));
    setIsOpen(false);
    setIsFocused(false);
    router.push(url);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    else if (e.key === "ArrowUp") setActiveIndex(prev => Math.max(prev - 1, -1));
    else if (e.key === "Enter") {
      if (activeIndex >= 0) handleSearch(suggestions[activeIndex]);
      else handleSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  if (!mounted) return null;

  return (
    <div ref={containerRef} className={`w-full transition-all duration-300 z-50 md:max-w-2xl mx-auto ${isFocused ? "fixed inset-0 mt-[69px] lg:mt-0 lg:top-0 bg-white z-[999] p-4 flex flex-col md:relative md:p-0 md:bg-transparent md:z-50 md:flex-none" : "relative"}`}>
      <div className={`relative flex items-center bg-white transition-all ${isFocused ? "rounded-t-[20px] md:rounded-2xl border-b md:border-2 border-[#FF6A00] ring-0 md:ring-4 md:ring-[#FF6A00]/10 shadow-xl" : "rounded-[20px] md:rounded-2xl border-2 border-black/[0.06] hover:border-black/[0.15]"}`}>
        {isFocused ? (
          <button onClick={() => { setIsOpen(false); setIsFocused(false); }} className="ml-3 lg:hidden p-2 text-gray-400">
            <ArrowLeft size={18} />
          </button>
        ) : (
          <Search className="ml-4 md:ml-5 text-gray-400 flex-shrink-0 w-4 h-4 md:w-[18px] md:h-[18px]" />
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => {
            dispatch(setQuery(e.target.value));
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            setIsFocused(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search shops, category, or area..."
          className="w-full h-12 md:h-14 px-3 md:px-4 bg-transparent outline-none text-[15px] font-bold text-[#1A1F36] placeholder:text-gray-400 placeholder:font-medium"
          role="combobox"
          aria-expanded={isOpen}
        />
        {query && (
          <button onClick={() => dispatch(setQuery(""))} className="p-2 mr-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={16} />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className={`mr-2 h-9 md:h-10 px-3 md:px-4 bg-[#FF6A00] text-white rounded-xl md:rounded-xl text-[13px] font-black hover:bg-[#E65F00] transition-all active:scale-95 flex items-center gap-2 flex-shrink-0 ${isFocused ? "flex" : "hidden md:flex"}`}
        >
          <Search size={15} />
          <span className="hidden md:inline uppercase tracking-widest">Search</span>
        </button>
      </div>

      {(isOpen || isFocused) && (
        <div className={`w-full bg-white md:absolute md:top-full md:left-0 md:right-0 md:mt-2 md:rounded-b-[24px] md:border-x md:border-b md:border md:border-black/[0.06] animate-in fade-in slide-in-from-top-2 duration-200 md:shadow-2xl overflow-hidden z-[110] ${isFocused ? "flex-1 overflow-y-auto" : "hidden md:block"}`}>
          <div className="py-2 max-h-full md:max-h-[450px] overflow-y-auto" role="listbox">
            {suggestions.map((item, index) => (
              <React.Fragment key={index}>
                {item.isHeader ? (
                  <div className="px-5 py-2.5 bg-gray-50/50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.text}</span>
                  </div>
                ) : (
                  <div className="group relative">
                    <div
                      onClick={() => handleSearch(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full px-5 py-4 md:py-3.5 flex items-center gap-4 text-left cursor-pointer transition-colors ${activeIndex === index ? "bg-[#FAFAF8]" : ""}`}
                      role="option"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'history' ? 'bg-gray-50 text-gray-400' :
                        item.type === 'category' ? 'bg-[#FF6A00]/10 text-[#FF6A00]' :
                          item.type === 'shop' ? 'bg-emerald-50 text-emerald-500' :
                            item.type === 'cluster' ? 'bg-amber-50 text-amber-500' :
                              item.type === 'location' ? 'bg-blue-50 text-blue-500' :
                                'bg-gray-50 text-gray-400'
                        }`}>
                        {item.type === 'history' ? <History size={18} /> :
                          item.type === 'category' ? <CategoryIcon name={item.text} size={18} /> :
                            item.type === 'shop' ? <Store size={18} /> :
                              item.type === 'cluster' ? <Award size={18} /> :
                                item.type === 'location' ? <MapPin size={18} /> :
                                  <Search size={18} />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className={`text-[15px] font-bold truncate ${activeIndex === index ? "text-[#FF6A00]" : "text-[#1A1F36]"}`}>
                          {highlightMatch(item.text, query)}
                        </p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider truncate">
                          {item.type === 'shop' ? (item.category || 'Shop') :
                            item.count > 0 ? `${item.type} • ${item.count} Shops` : item.type}
                        </p>
                      </div>

                      {item.type === 'shop' && (
                        <div className="flex gap-2 pr-2">
                          {item.whatsapp && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const msg = encodeURIComponent(`Hi! Found your shop *${item.text}* on ${BRAND}!`);
                                window.open(`https://wa.me/91${item.whatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank');
                              }}
                              className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all active:scale-90"
                              title="WhatsApp"
                            >
                              <MessageSquare size={16} />
                            </button>
                          )}
                          {item.phone && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `tel:${item.phone}`;
                              }}
                              className="w-10 h-10 rounded-xl bg-[#0F0F0F]/5 text-[#0F0F0F] flex items-center justify-center hover:bg-[#0F0F0F] hover:text-white transition-all active:scale-90"
                              title="Call Now"
                            >
                              <Phone size={16} />
                            </button>
                          )}
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF6A00]/5 group-hover:text-[#FF6A00] transition-all">
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
            {suggestions.length === 0 && query && (
              <div className="px-10 py-20 text-center">
                <Search size={40} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">No results found for "{query}"</p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-5 py-4 border-t border-black/[0.04] flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Discovery Engine v2.0</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
