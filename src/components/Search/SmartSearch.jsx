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
import { fetchMasterLocations } from "@/redux/thunks/locationThunks";

import { getCachedLocation, updateLocationCache } from "@/lib/db";

const SmartSearch = ({ onFocusStateChange, pageTitle, pageContext }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { query, suggestions, recentSearches } = useSelector((state) => state.search);
  const { items: categories, clusters } = useSelector((state) => state.categories);
  const { items: shops } = useSelector((state) => state.shops);
  const { cities: masterCities, areas: masterAreas } = useSelector((state) => state.search);

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
    if (masterCities.length === 0) dispatch(fetchMasterLocations());
  }, [dispatch, categories.length, shops.length, clusters.length, masterCities.length]);

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
      ...masterCities.map(c => ({
        type: "location",
        text: c.name,
        city: c.name,
        area: "",
        count: shops.filter(s => s.city === c.name).length
      })),
      ...masterAreas.map(a => {
        const cityObj = masterCities.find(c => c.id === a.cityId);
        const cityName = cityObj ? cityObj.name : "";
        return {
          type: "location",
          text: cityName ? `${a.name}, ${cityName}` : a.name,
          city: cityName,
          area: a.name,
          pincode: a.pincode || "",
          count: shops.filter(s => s.area === a.name).length
        };
      }),
      ...shops.filter(s => s.pincode).map(s => ({
        type: "location",
        text: `${s.pincode} (${s.area || s.city})`,
        city: s.city,
        area: s.area,
        pincode: s.pincode,
        count: 1
      }))
    ];

    const all = [...pool];

    // Remove duplicates based on text (not just path) to prevent same-text doubles
    const seen = new Set();
    return all
      .filter(item => {
        const key = item.text?.toLowerCase()?.trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [categories, shops, clusters, masterCities, masterAreas]);

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
      // Prefer pageContext (from current page URL) over localStorage
      const currentCity = pageContext?.city || (typeof window !== 'undefined' ? localStorage.getItem('last_city') : "") || "Ahmedabad";
      const currentArea = pageContext?.area || (typeof window !== 'undefined' ? localStorage.getItem('last_area') : "") || "";
      const context = { city: currentCity, area: currentArea };

      if (!query.trim()) {
        return getDefaultSuggestions(categories, context, recentSearches);
      }

      return getSmartSuggestions(query, searchPool, context);
    };

    const timer = setTimeout(() => {
      dispatch(setSuggestions(generateSuggestions()));
    }, query ? 300 : 0);

    return () => clearTimeout(timer);
  }, [query, isOpen, searchPool, pageContext, dispatch]);

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
    <div
      ref={containerRef}
      className={`w-full transition-all duration-200 z-50 ${isFocused
        ? "fixed inset-0 mt-[60px] lg:mt-0 lg:top-0 bg-white z-[999] p-3 flex flex-col md:relative md:p-0 md:bg-transparent md:z-50 md:flex-none"
        : "relative"
        }`}
    >
      {/* Input bar */}
      <div
        className={`relative flex items-center bg-white transition-all duration-150 ${isFocused
          ? "rounded-t-lg md:rounded-md border border-black/[0.12] shadow-[0_0_0_3px_rgba(255,106,0,0.08)]"
          : "rounded-md border border-black/[0.08] hover:border-black/[0.14]"
          }`}
      >
        {isFocused ? (
          <button
            onClick={() => { setIsOpen(false); setIsFocused(false); }}
            className="ml-2.5 lg:hidden p-1.5 text-[#0A0A0F]/40 hover:text-[#0A0A0F]"
          >
            <ArrowLeft size={16} />
          </button>
        ) : (
          <Search className="ml-3 text-[#0A0A0F]/30 flex-shrink-0" size={14} />
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => {
            dispatch(setQuery(e.target.value));
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => { setIsOpen(true); setIsFocused(true); }}
          onKeyDown={handleKeyDown}
          placeholder={pageTitle || "Search shops, category, or area..."}
          className="w-full h-9 md:h-9 px-2.5 bg-transparent outline-none text-[13px] font-medium text-[#0A0A0F] placeholder:text-[#0A0A0F]/35"
          role="combobox"
          aria-expanded={isOpen}
        />

        {query && (
          <button
            onClick={() => dispatch(setQuery(""))}
            className="p-1.5 mr-1 hover:bg-black/[0.04] rounded-md transition-colors text-[#0A0A0F]/30 hover:text-[#0A0A0F]/60"
          >
            <X size={13} />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className={`mr-1.5 h-7 px-3 bg-[#FF6A00] text-white rounded-md text-[12px] font-semibold hover:bg-[#E65F00] transition-all flex items-center gap-1.5 flex-shrink-0 ${isFocused ? "flex" : "hidden md:flex"
            }`}
        >
          <Search size={12} />
          <span className="hidden md:inline">Search</span>
        </button>
      </div>

      {(isOpen || isFocused) && (
        <div
          className={`w-full bg-white md:absolute md:top-full md:left-0 md:right-0 md:mt-1 md:rounded-b-lg md:border md:border-black/[0.08] md:border-t-0 animate-in fade-in slide-in-from-top-1 duration-150 md:shadow-xl overflow-hidden z-[110] ${isFocused ? "flex-1 overflow-y-auto" : "hidden md:block"
            }`}
        >
          <div className="py-1 max-h-full md:max-h-[400px] overflow-y-auto" role="listbox">
            {suggestions.map((item, index) => (
              <React.Fragment key={index}>
                {item.isHeader ? (
                  <div className="px-4 pt-3 pb-1.5">
                    <span className="text-[10px] font-semibold text-[#0A0A0F]/30 uppercase tracking-widest">{item.text}</span>
                  </div>
                ) : (
                  <div
                    onClick={() => handleSearch(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full px-3.5 py-2.5 flex items-center gap-3 text-left cursor-pointer transition-colors ${activeIndex === index ? "bg-black/[0.03]" : "hover:bg-black/[0.02]"
                      }`}
                    role="option"
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${item.type === "history" ? "bg-black/[0.04] text-[#0A0A0F]/40" :
                        item.type === "category" ? "bg-[#FF6A00]/10 text-[#FF6A00]" :
                          item.type === "shop" ? "bg-emerald-50 text-emerald-600" :
                            item.type === "cluster" ? "bg-amber-50 text-amber-600" :
                              item.type === "location" ? "bg-blue-50 text-blue-600" :
                                "bg-black/[0.04] text-[#0A0A0F]/40"
                        }`}
                    >
                      {item.type === "history" ? <History size={14} /> :
                        item.type === "category" ? <CategoryIcon name={item.text} size={14} /> :
                          item.type === "shop" ? <Store size={14} /> :
                            item.type === "cluster" ? <Award size={14} /> :
                              item.type === "location" ? <MapPin size={14} /> :
                                <Search size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${activeIndex === index ? "text-[#FF6A00]" : "text-[#0A0A0F]"
                        }`}>
                        {highlightMatch(item.text, query)}
                      </p>
                      <p className="text-[11px] text-[#0A0A0F]/35 truncate">
                        {item.type === "shop" ? (item.category || "Shop") :
                          item.count > 0 ? `${item.count} shops` : item.type}
                      </p>
                    </div>

                    {item.type === "shop" && (
                      <div className="flex gap-1.5 pr-1">
                        {item.whatsapp && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const msg = encodeURIComponent(`Hi! Found your shop *${item.text}* on ${BRAND}!`);
                              window.open(`https://wa.me/91${item.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
                            }}
                            className="w-7 h-7 rounded-md bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all"
                          >
                            <MessageSquare size={13} />
                          </button>
                        )}
                        {item.phone && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${item.phone}`;
                            }}
                            className="w-7 h-7 rounded-md bg-black/[0.04] text-[#0A0A0F]/50 flex items-center justify-center hover:bg-[#0A0A0F] hover:text-white transition-all"
                          >
                            <Phone size={13} />
                          </button>
                        )}
                        <div className="w-7 h-7 rounded-md bg-black/[0.03] flex items-center justify-center text-[#0A0A0F]/25 group-hover:text-[#FF6A00] transition-all">
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
            {suggestions.length === 0 && query && (
              <div className="px-4 py-10 text-center">
                <Search size={24} className="mx-auto text-[#0A0A0F]/15 mb-2" />
                <p className="text-[13px] text-[#0A0A0F]/35">No results for "{query}"</p>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-black/[0.05] flex items-center justify-between bg-black/[0.01]">
            <span className="text-[10px] font-semibold text-[#0A0A0F]/25 uppercase tracking-widest">Discovery Engine</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-semibold text-[#0A0A0F]/30 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
