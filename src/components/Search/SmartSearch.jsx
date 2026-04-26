"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Search, MapPin, Navigation, History, TrendingUp, X, Loader2, Phone, MessageSquare, LayoutGrid, Store, Award } from "lucide-react";
import { setQuery, setSuggestions, addRecentSearch } from "@/redux/slices/searchSlice";
import { parseSmartQuery } from "@/lib/searchParser";
import { generateDiscoveryUrl } from "@/lib/urlArchitect";
import { slugify } from "@/lib/slugify";
import { getSuggestions } from "@/lib/searchEngine";
import { fetchCategories, fetchClusters } from "@/redux/thunks/categoryThunks";
import { fetchApprovedShops } from "@/redux/thunks/shopThunks";

const SmartSearch = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { query, suggestions, recentSearches, loading } = useSelector((state) => state.search);
  const { items: categories, clusters } = useSelector((state) => state.categories);
  const { items: shops } = useSelector((state) => state.shops);

  // Fetch data if missing
  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    if (shops.length === 0) dispatch(fetchApprovedShops());
    if (clusters.length === 0) dispatch(fetchClusters());
  }, [dispatch, categories.length, shops.length, clusters.length]);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  // Geolocation detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedCity = localStorage.getItem('last_city');
    const savedArea = localStorage.getItem('last_area');
    if ((!savedCity || !savedArea) && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use BigDataCloud for precise area detection (free tier)
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();

          if (data.city) {
            localStorage.setItem('last_city', data.city);
          }
          if (data.locality) {
            localStorage.setItem('last_area', data.locality);
          }
        } catch (e) {
          // Fallback to IP-based if GPS fails
          try {
            const res = await fetch(`https://ipapi.co/json/`);
            const data = await res.json();
            if (data.city) {
              localStorage.setItem('last_city', data.city);
            }
          } catch (err) {
            console.error("Location detection failed", err);
          }
        }
      });
    }
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Performance Optimization: Memoize the search pool
  const searchPool = React.useMemo(() => {
    // Pre-calculate counts for categories and clusters
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
    ];

    // De-duplicate by text to avoid identical suggestions from different sources
    const seen = new Set();
    return pool.filter(item => {
      const key = `${item.type}-${item.text.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories, shops]);

  // Helper for highlighting matching text
  const highlightMatch = (text, query) => {
    if (!query || !query.trim()) return text;
    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <b key={i} className="text-[#FF6B35]">{part}</b>
            : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  // Generate Suggestions logic
  useEffect(() => {
    if (!isOpen) return;

    const generateSuggestions = () => {
      if (!query.trim()) {
        return [
          ...recentSearches.map(s => ({ type: "history", text: s })),
          { type: "trending", text: "Salons near me" },
          { type: "trending", text: "Cafes in Ahmedabad" }
        ].slice(0, 8);
      }

      // Create a pool of searchable items
      const pool = [
        ...searchPool,
      ];

      // Use the intelligent engine to filter and rank
      const currentCity = typeof window !== 'undefined' ? localStorage.getItem('last_city') : "";
      let matches = getSuggestions(query, pool, 12, { preferredLocation: currentCity });

      // Detect intent (e.g. typing "cafe near", "cafe in", or "best cafe")
      const lowerQuery = query.toLowerCase().trim();
      const spatialMatch = lowerQuery.match(/^(.*?)\s+(near|in)\b/);
      const bestMatch = lowerQuery.match(/^best\s+(.*)/);

      if (spatialMatch) {
        const baseCategory = spatialMatch[1].trim();
        const keyword = spatialMatch[2];

        // Find if the base part is a valid category
        const baseMatches = getSuggestions(baseCategory, pool, 3);
        const topCat = baseMatches.find(m => m.type === "category");

        if (topCat) {
          if (keyword === "near") {
            matches.unshift({ type: "trending", text: `${topCat.text} near me`, relevance: 95 });
          } else if (keyword === "in" && currentCity) {
            matches.unshift({ type: "location", text: `${topCat.text} in ${currentCity}`, relevance: 95 });
          }
        }
      } else if (bestMatch) {
        const baseCategory = bestMatch[1].trim();
        const baseMatches = getSuggestions(baseCategory, pool, 3);
        const topCat = baseMatches.find(m => m.type === "category");

        if (topCat) {
          if (currentCity) {
            matches.unshift({ type: "trending", text: `Best ${topCat.text} shops in ${currentCity}`, relevance: 95 });
          }
          matches.push({ type: "trending", text: `Best ${topCat.text} shops`, relevance: 94 });
        }
      }

      // Add smart context templates for general strong matches
      const hasStrongMatch = matches.some(m => m.relevance >= 50);
      if (hasStrongMatch && query.length > 2 && !spatialMatch && !bestMatch) {
        const currentCity = typeof window !== 'undefined' ? localStorage.getItem('last_city') : "";

        // Template: Best {category} shops in {city}
        if (currentCity) {
          matches.push({
            type: "trending",
            text: `Best ${query} shops in ${currentCity}`,
            relevance: 46
          });
        }

        // Template: {category} near me
        matches.push({
          type: "trending",
          text: `${query} near me`,
          relevance: 45
        });

        // Template: Best {category}
        matches.push({
          type: "trending",
          text: `Best ${query} shops`,
          relevance: 44
        });
      }

      // Zero-Result Recovery: If no real matches, show trending/popular
      if (matches.length === 0) {
        matches = [
          { type: "trending", text: "Trending Categories", isHeader: true, relevance: 10 },
          ...categories.slice(0, 3).map(c => ({ type: "category", text: c.name, relevance: 9 })),
          { type: "trending", text: "Popular", isHeader: true, relevance: 8 },
          ...[...shops].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)).slice(0, 2)
            .map(s => ({
              type: "shop",
              text: s.name,
              slug: s.slug,
              category: s.category,
              relevance: 7,
              metrics: { avgRating: s.avgRating, totalRatings: s.totalRatings },
              phone: s.phone,
              whatsapp: s.whatsapp || s.phone
            }))
        ];
      } else {
        // 1. Identify the search category and location intent
        const inIndex = query.toLowerCase().indexOf(" in ");
        let baseCategory = "";
        let locationFilter = "";

        if (inIndex !== -1) {
          baseCategory = query.substring(0, inIndex).trim();
          locationFilter = query.substring(inIndex + 4).trim();
        } else {
          const topMatch = matches.find(m => m.type === "category");
          baseCategory = topMatch ? topMatch.text : query;
          locationFilter = query;
        }

        if (baseCategory && (query.length > 2 || locationFilter.length > 0)) {
          const term = locationFilter.toLowerCase();
          const lastCity = typeof window !== 'undefined' ? localStorage.getItem('last_city') : "";
          const lastArea = typeof window !== 'undefined' ? localStorage.getItem('last_area') : "";

          // Location Suggestions (City)
          const cityMatches = [...new Set(shops.map(s => s.city))].filter(c =>
            !term || c?.toLowerCase().includes(term)
          );
          cityMatches.forEach(city => {
            const isLocalCity = lastCity && city.toLowerCase() === lastCity.toLowerCase();
            matches.push({
              type: "location",
              text: `${baseCategory} in ${city}`,
              category: baseCategory,
              location: city,
              relevance: 90 + (isLocalCity ? 20 : 0) // Boost if local city
            });
          });

          // Area Suggestions (Neighborhoods)
          const areaMatches = shops.filter(s =>
            !term || s.area?.toLowerCase().includes(term)
          );
          const uniqueAreas = [];
          areaMatches.forEach(s => {
            const key = `${s.area}-${s.city}`;
            if (!uniqueAreas.includes(key)) {
              uniqueAreas.push(key);
              const isLocalArea = lastArea && s.area?.toLowerCase() === lastArea.toLowerCase();
              const isLocalCity = lastCity && s.city?.toLowerCase() === lastCity.toLowerCase();

              matches.push({
                type: "location",
                text: `${baseCategory} in ${s.area} ${s.city}`,
                category: baseCategory,
                location: `${s.area} ${s.city}`,
                relevance: 85 + (isLocalArea ? 30 : isLocalCity ? 15 : 0) // Extra boost for current area
              });
            }
          });
        }
      }

      // Final sort, deduplicate, and limit
      const uniqueMatches = [];
      const seenTexts = new Set();

      matches
        .sort((a, b) => b.relevance - a.relevance)
        .forEach(m => {
          const lowerText = m.text.toLowerCase().trim();
          if (!seenTexts.has(lowerText)) {
            seenTexts.add(lowerText);
            uniqueMatches.push(m);
          }
        });

      return uniqueMatches.slice(0, 8);
    };

    const timer = setTimeout(() => {
      dispatch(setSuggestions(generateSuggestions()));
    }, 400); // 400ms debounce as requested

    return () => clearTimeout(timer);
  }, [query, isOpen, categories, shops, recentSearches, dispatch]);

  const handleSearch = (selectedItem) => {
    const searchText = typeof selectedItem === 'string' ? selectedItem : (selectedItem?.text || query);
    if (!searchText) return;

    // Handle direct shop selection
    if (selectedItem?.type === 'shop' && selectedItem.slug) {
      router.push(`/shop/${selectedItem.slug}`);
      setIsOpen(false);
      return;
    }

    const parsed = parseSmartQuery(searchText, clusters.map(c => c.name));

    const url = generateDiscoveryUrl(parsed.category, parsed.location, parsed.type, parsed.clusterType);

    dispatch(addRecentSearch(searchText));
    setIsOpen(false);
    router.push(url);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        handleSearch(suggestions[activeIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full transition-all duration-300 z-50 md:max-w-2xl mx-auto focus-within:max-w-none">
      <div className={`relative flex items-center bg-white rounded-2xl border-2 transition-all ${isOpen ? "border-[#FF6B35] ring-4 ring-[#FF6B35]/10" : "border-black/[0.06] hover:border-black/[0.15]"}`}>
        <Search className="ml-3 md:ml-5 text-gray-400 flex-shrink-0 w-4 h-4 md:w-[18px] md:h-[18px]" />
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
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search shops, category, or area..."
          className="w-full h-10 md:h-12 px-3 md:px-4 bg-transparent outline-none text-[13px] md:text-[15px] font-medium placeholder:text-gray-400"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {query && (
          <button onClick={() => dispatch(setQuery(""))} className="p-2 mr-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={16} />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className="mr-1.5 h-9 md:h-10 px-3 md:px-6 bg-[#1A1F36] text-white rounded-xl text-[13px] font-bold hover:bg-[#333] transition-all active:scale-95 flex items-center gap-2 flex-shrink-0"
        >
          <Search size={15} />
          <span className="hidden md:inline">Search</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[24px] border border-black/[0.06] overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-3 max-h-[65vh] md:max-h-[450px] overflow-y-auto min-w-max" role="listbox">
            {suggestions.map((item, index) => (
              <React.Fragment key={index}>
                {item.isHeader ? (
                  <div className="px-4 md:px-5 py-1.5 md:py-2 bg-gray-50/50">
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.text}</span>
                  </div>
                ) : (
                  <div className="group relative">
                    <button
                      onClick={() => {
                        if (item.type === 'shop') {
                          handleSearch(item);
                        } else {
                          const parsed = parseSmartQuery(item.text, clusters.map(c => c.name));
                          const url = generateDiscoveryUrl(parsed.category, parsed.location, parsed.type, parsed.clusterType);
                          dispatch(addRecentSearch(item.text));
                          setIsOpen(false);
                          router.push(url);
                        }
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full px-4 py-2 md:px-5 md:py-3 flex items-center gap-3 md:gap-4 text-left transition-colors ${activeIndex === index ? "bg-[#FAFAF8]" : ""}`}
                      role="option"
                      aria-selected={activeIndex === index}
                    >
                      <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'history' ? 'bg-gray-50 text-gray-400' :
                        item.type === 'category' ? 'bg-[#FF6B35]/10 text-[#FF6B35]' :
                          item.type === 'shop' ? 'bg-emerald-50 text-emerald-500' :
                            item.type === 'cluster' ? 'bg-amber-50 text-amber-500' :
                              item.type === 'location' ? 'bg-blue-50 text-blue-500' :
                                'bg-gray-50 text-gray-400'
                        }`}>
                        {item.type === 'history' ? <History className="w-3.5 h-3.5 md:w-4 md:h-4" /> :
                          item.type === 'category' ? <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4" /> :
                            item.type === 'shop' ? <Store className="w-3.5 h-3.5 md:w-4 md:h-4" /> :
                              item.type === 'cluster' ? <Award className="w-3.5 h-3.5 md:w-4 md:h-4" /> :
                                item.type === 'location' ? <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> :
                                  <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-[13px] md:text-[14px] font-bold whitespace-nowrap ${activeIndex === index ? "text-[#FF6B35]" : "text-[#1A1F36]"}`}>
                          {highlightMatch(item.text, query)}
                        </p>
                        <p className="text-[10px] md:text-[11px] text-gray-400 font-bold whitespace-nowrap">
                          {item.type === 'shop' ? (item.category || 'Shop') :
                            item.count > 0 ? `${item.type} • ${item.count} Shops` : item.type}
                        </p>
                      </div>

                      {/* Action Buttons for Shops */}
                      {item.type === 'shop' && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1A1F36] hover:text-white transition-all"
                            >
                              <Phone size={14} />
                            </a>
                          )}
                          {item.whatsapp && (
                            <a
                              href={`https://wa.me/${item.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}
                        </div>
                      )}

                      {!item.type === 'shop' && <Navigation className="text-gray-200" size={14} />}
                    </button>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="bg-gray-50 px-4 md:px-5 py-2 md:py-3 border-t border-black/[0.04] flex items-center justify-between">
            <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest">Discovery Engine</span>
            <div className="hidden md:flex gap-2">
              <span className="px-1.5 py-0.5 rounded border border-gray-200 text-[9px] font-bold text-gray-400 uppercase">Enter to select</span>
              <span className="px-1.5 py-0.5 rounded border border-gray-200 text-[9px] font-bold text-gray-400 uppercase">Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
