"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Search, MapPin, Navigation, History, TrendingUp, X, Loader2 } from "lucide-react";
import { setQuery, setSuggestions, addRecentSearch } from "@/redux/slices/searchSlice";
import { parseSmartQuery } from "@/lib/searchParser";
import { generateDiscoveryUrl } from "@/lib/urlArchitect";
import { slugify } from "@/lib/slugify";

const SmartSearch = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { query, suggestions, recentSearches, loading } = useSelector((state) => state.search);
  const { items: categories } = useSelector((state) => state.categories);
  const { items: shops } = useSelector((state) => state.shops);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

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

  // Generate Suggestions logic
  useEffect(() => {
    if (!isOpen) return;

    const generateSuggestions = () => {
      if (!query) {
        // Show recent and trending
        return [
          ...recentSearches.map(s => ({ type: "history", text: s })),
          { type: "trending", text: "Salons near me" },
          { type: "trending", text: "Cafes in Ahmedabad" }
        ].slice(0, 8);
      }

      const parsed = parseSmartQuery(query);
      const list = [];

      // Category and Cluster matches
      const catMatches = categories
        .filter(c => slugify(c.name).includes(slugify(parsed.category)))
        .slice(0, 3);
      
      const clusterTypes = [...new Set(shops.map(s => s.clusterType).filter(Boolean))];
      const clusterMatches = clusterTypes
        .filter(c => slugify(c).includes(slugify(parsed.category)))
        .slice(0, 2);

      catMatches.forEach(cat => {
        list.push({ type: "category", text: cat.name, category: cat.name });
      });

      clusterMatches.forEach(cluster => {
        list.push({ type: "category", text: cluster, category: cluster });
      });

      // Location context suggestions
      if (parsed.category) {
        const locations = [...new Set(shops.map(s => s.city))].slice(0, 2);
        const areas = [...new Set(shops.map(s => s.area).filter(Boolean))].slice(0, 2);
        
        locations.forEach(loc => {
          list.push({ type: "location", text: `${parsed.category} in ${loc}`, category: parsed.category, location: loc });
        });
        areas.forEach(area => {
          list.push({ type: "location", text: `${parsed.category} in ${area}`, category: parsed.category, location: area });
        });
      }

      return list.slice(0, 8);
    };

    const timer = setTimeout(() => {
      dispatch(setSuggestions(generateSuggestions()));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, categories, shops, recentSearches, dispatch]);

  const handleSearch = (selectedText) => {
    const searchText = selectedText || query;
    if (!searchText) return;

    const parsed = parseSmartQuery(searchText);
    const url = generateDiscoveryUrl(parsed.category, parsed.location, parsed.type);
    
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
        handleSearch(suggestions[activeIndex].text);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-50">
      <div className={`relative flex items-center bg-white rounded-2xl border-2 transition-all shadow-lg ${isOpen ? "border-[#FF6B35] ring-4 ring-[#FF6B35]/10" : "border-black/[0.06] hover:border-black/[0.15]"}`}>
        <Search className="ml-5 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            dispatch(setQuery(e.target.value));
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search shops, category, or area..."
          className="w-full h-14 px-4 bg-transparent outline-none text-[15px] font-medium placeholder:text-gray-400"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {query && (
          <button onClick={() => dispatch(setQuery(""))} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={18} />
          </button>
        )}
        <button 
          onClick={() => handleSearch()}
          className="mr-2 h-10 px-6 bg-[#1A1F36] text-white rounded-xl text-[13px] font-bold hover:bg-[#333] transition-all active:scale-95"
        >
          Search
        </button>
      </div>

      {isOpen && (suggestions.length > 0 || !query) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[24px] border border-black/[0.06] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-3" role="listbox">
            {suggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSearch(item.text)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full px-5 py-3 flex items-center gap-4 text-left transition-colors ${activeIndex === index ? "bg-[#FAFAF8]" : ""}`}
                role="option"
                aria-selected={activeIndex === index}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.type === 'history' ? 'bg-gray-50 text-gray-400' :
                  item.type === 'category' ? 'bg-[#FF6B35]/10 text-[#FF6B35]' :
                  item.type === 'location' ? 'bg-blue-50 text-blue-500' :
                  'bg-purple-50 text-purple-500'
                }`}>
                  {item.type === 'history' ? <History size={16} /> :
                   item.type === 'category' ? <Search size={16} /> :
                   item.type === 'location' ? <MapPin size={16} /> :
                   <TrendingUp size={16} />}
                </div>
                <div className="flex-1">
                  <p className={`text-[14px] font-semibold ${activeIndex === index ? "text-[#FF6B35]" : "text-[#1A1F36]"}`}>
                    {item.text}
                  </p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                    {item.type}
                  </p>
                </div>
                <Navigation className="text-gray-200" size={14} />
              </button>
            ))}
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-black/[0.04] flex items-center justify-between">
             <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Smart Discovery Engine</span>
             <div className="flex gap-2">
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
