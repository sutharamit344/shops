"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Award, ChevronRight, ChevronLeft, Store, MapPin } from "lucide-react";
import CategoryIcon from "@/components/UI/CategoryIcon";

const ClusterSlider = ({ clusters = [], shops = [], onClusterClick, parsed }) => {
  const { userCoords, userLocationName } = useSelector((state) => state.search);
  const scrollRef = useRef(null);
  const [visibleLimit, setVisibleLimit] = useState(4);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const currentCategory = (parsed?.category || "").toLowerCase().trim();
  const currentCluster = (parsed?.clusterType || "").toLowerCase().trim();
  const currentLocation = (parsed?.location || "").toLowerCase().trim();
  const targetCity = (parsed?.city || "").toLowerCase().trim();
  const targetArea = (parsed?.area || "").toLowerCase().trim();

  const clusterData = useMemo(() => {
    // Determine current location context
    const targetCity = (parsed?.city || "").toLowerCase().trim();
    const targetArea = (parsed?.area || "").toLowerCase().trim();
    const urlLoc = currentLocation && currentLocation !== "all" ? currentLocation : null;
    const gpsLoc = userLocationName ? userLocationName.split(',')[0].trim().toLowerCase() : null;
    const activeContext = (urlLoc === "current" ? gpsLoc : urlLoc) || gpsLoc;

    // Build a lookup map from cluster name -> cluster doc (for id, category metadata)
    const clusterDocMap = {};
    clusters.forEach(c => { clusterDocMap[c.name] = c; });

    // Filter shops to the current location context first
    let relevantShops = shops;
    if (targetCity || targetArea || activeContext) {
      relevantShops = shops.filter(s => {
        const sCity = (s.city || "").toLowerCase();
        const sArea = (s.area || "").toLowerCase();
        
        if (targetArea && sArea === targetArea) return true;
        if (targetCity && sCity === targetCity && !targetArea) return true;
        
        // Fallback to the general context match
        if (activeContext && (sArea === activeContext || sCity === activeContext || activeContext.includes(sArea) || activeContext.includes(sCity))) return true;
        
        return false;
      });
    }

    // Group relevant shops by (clusterType + area) to get accurate localized counts
    const groups = {};
    relevantShops.forEach(shop => {
      const clusterName = shop.clusterType;
      if (!clusterName) return;
      const shopArea = (shop.area || "").toLowerCase();
      const shopCity = (shop.city || "").toLowerCase();
      // Skip clusters being searched
      if (currentCluster && clusterName.toLowerCase() === currentCluster) return;
      if (currentCategory) {
        const doc = clusterDocMap[clusterName];
        const cat = (doc?.category || shop.category || "").toLowerCase().replace(/&/g, "and");
        const normalizedSearch = currentCategory.replace(/&/g, "and");
        const nm = clusterName.toLowerCase();

        const isMatch = cat.includes(normalizedSearch) || 
                       normalizedSearch.includes(cat) || 
                       nm.includes(normalizedSearch);
        
        if (!isMatch) return;
      }

      const key = `${clusterName}__${shopArea}__${shopCity}`;
      if (!groups[key]) {
        const doc = clusterDocMap[clusterName] || {};
        groups[key] = {
          id: doc.id || key,
          name: clusterName,
          category: doc.category || shop.category || "",
          area: shop.area || "",
          city: shop.city || "",
          lat: doc.lat || shop.lat || null,
          lng: doc.lng || shop.lng || null,
          count: 0,
        };
      }
      groups[key].count += 1;
    });

    const getDistance = (lat1, lon1, lat2, lon2) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const finalClusters = Object.values(groups).map(c => ({
      ...c,
      distance: getDistance(userCoords?.lat, userCoords?.lng, c.lat, c.lng)
    }));

    return finalClusters
      .filter(c => c.count > 0)
      .sort((a, b) => {
        // 1. Sort by distance if available
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }

        // 2. Fallback to area matching
        if (typeof window !== 'undefined') {
          const lastArea = (localStorage.getItem('last_area') || "").toLowerCase();
          if (lastArea) {
            const aMatch = a.area.toLowerCase() === lastArea;
            const bMatch = b.area.toLowerCase() === lastArea;
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
          }
        }
        
        // 3. Fallback to shop count
        return b.count - a.count;
      });
  }, [clusters, shops, currentCategory, currentCluster, currentLocation, userLocationName]);

  useEffect(() => {
    setVisibleLimit(4);
  }, [currentCategory, currentCluster, currentLocation]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setScrollPosition(scrollRef.current.scrollLeft);
        setMaxScroll(scrollRef.current.scrollWidth - scrollRef.current.clientWidth);
      }
    };
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [visibleLimit, clusterData.length]);

  if (clusters.length === 0 || clusterData.length === 0) return null;

  const handleNext = () => {
    if (visibleLimit < clusterData.length) {
      // Load more first
      setVisibleLimit(prev => Math.min(clusterData.length, prev + 4));
      // Then scroll (delayed slightly to allow render)
      setTimeout(() => {
        if (scrollRef.current) {
          const { scrollLeft, clientWidth } = scrollRef.current;
          scrollRef.current.scrollTo({ left: scrollLeft + clientWidth, behavior: "smooth" });
        }
      }, 100);
    } else if (scrollRef.current) {
      // Just scroll if all already loaded
      const { scrollLeft, clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({ left: scrollLeft + clientWidth, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({ left: scrollLeft - clientWidth, behavior: "smooth" });
    }
  };

  const visibleClusters = clusterData.slice(0, visibleLimit);

  const getTitle = () => {
    const properCase = (str) => {
      if (!str) return "";
      return str
        .split(/[ -]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .trim();
    };

    const category = properCase(parsed?.category || "");
    const city = properCase(parsed?.city || "");
    const area = properCase(parsed?.area || "");
    
    // Determine the most specific location for the title
    let location = area || city || userLocationName || "";

    // Fix: If the "area" is actually a cluster name (e.g. "City Center Market")
    // We should show hubs in the parent location instead
    const isClusterName = (str) => {
      const lower = str.toLowerCase();
      return lower.includes("market") || lower.includes("center") || lower.includes("hub") || lower.includes("district");
    };

    if (area && isClusterName(area)) {
      location = city || "Nearby Areas";
    }

    if (parsed?.type === "nearby") return "Specialized Hubs Near You";

    // 1. If explicit cluster searched
    if (parsed?.clusterType) {
      const clusterName = properCase(parsed.clusterType);
      return `Hubs related to ${clusterName}`;
    }

    // 2. If category searched
    if (category) {
      if (location) {
        return `${category} Markets in ${location}`;
      }
      return `Specialized ${category} Hubs`;
    }

    // 3. If location searched
    if (location) {
      return `Specialized Hubs in ${location}`;
    }

    return "Specialized Hubs Near You";
  };

  return (
    <div className="relative mb-6 group border-b border-[#1A1F36]/[0.08]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-[16px] md:text-lg font-bold text-[#1A1F36] flex items-center gap-2">
            <Award size={18} className="text-[#FF6A00]" />
            {getTitle()}
          </h2>
          <p className="text-[11px] md:text-[12px] text-[#1A1F36]/40">Explore specialized markets and hubs</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] font-bold text-[#1A1F36]/30 uppercase tracking-widest">
            {visibleClusters.length} / {clusterData.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={handlePrev}
              disabled={scrollPosition <= 5}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#1A1F36]/40 hover:text-[#FF6A00] hover:border-[#FF6A00]/20 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              disabled={scrollPosition >= maxScroll - 5 && visibleLimit >= clusterData.length}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#1A1F36]/40 hover:text-[#FF6A00] hover:border-[#FF6A00]/20 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibleClusters.map((cluster, idx) => {
          let distanceText = null;
          if (userCoords?.lat && userCoords?.lng && cluster.lat && cluster.lng) {
            const R = 6371; // km
            const dLat = (cluster.lat - userCoords.lat) * (Math.PI / 180);
            const dLon = (cluster.lng - userCoords.lng) * (Math.PI / 180);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userCoords.lat * (Math.PI / 180)) * Math.cos(cluster.lat * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceKm = R * c;

            if (distanceKm < 1) {
              distanceText = `${Math.round(distanceKm * 1000)}m`;
            } else {
              distanceText = `${distanceKm.toFixed(1)} km`;
            }
          }

          const isAreaMatch = targetArea && (cluster.area || "").toLowerCase().includes(targetArea);
          const isCityMatch = targetCity && (cluster.city || "").toLowerCase().includes(targetCity);

          return (
            <div
              key={`${cluster.name}-${cluster.area}-${cluster.city}-${idx}`}
              onClick={() => onClusterClick && onClusterClick(cluster.name, cluster.area || cluster.city)}
              className="flex-shrink-0 w-60 md:w-68 bg-white p-3.5 md:p-4 rounded-[20px] border border-black/[0.06] hover:border-[#FF6A00]/20 transition-all cursor-pointer group/card flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-start justify-between mb-2.5">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                    <CategoryIcon name={cluster.category} size={18} />
                  </div>
                  <span className="text-[10px] font-bold bg-[#1A1F36] text-white px-2.5 py-1 rounded-full">
                    {cluster.count} Shops
                  </span>
                </div>

                <h3 className="text-[13px] md:text-[14px] font-bold text-[#1A1F36] group-hover/card:text-[#FF6A00] transition-colors line-clamp-1 mb-0.5">
                  {cluster.name}
                </h3>
                <p className="text-[10px] font-semibold text-[#1A1F36]/40 uppercase tracking-wider">
                  {cluster.category}
                </p>

                {(cluster.area || cluster.city) && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[#1A1F36]/50">
                    <MapPin size={9} className="text-[#FF6A00]" />
                    <span className="truncate">
                      <span className={isAreaMatch ? "text-[#FF6A00] font-black" : ""}>{cluster.area}</span>
                      {cluster.area && cluster.city && ", "}
                      <span className={isCityMatch ? "text-[#FF6A00] font-black" : ""}>{cluster.city}</span>
                    </span>
                    {distanceText && (
                      <span className="font-bold text-[#FF6A00] bg-[#FF6A00]/10 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap">
                        {distanceText}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center text-[10px] font-bold text-[#FF6A00] opacity-0 group-hover/card:opacity-100 transition-all">
                <span>View Collection</span>
                <ChevronRight size={12} className="ml-0.5" />
              </div>
            </div>
          )
        })}

        {visibleLimit < clusterData.length && (
          <div
            onClick={handleNext}
            className="flex-shrink-0 w-36 flex flex-col items-center justify-center gap-2 text-[#FF6A00] font-bold cursor-pointer hover:bg-[#FF6A00]/5 rounded-[20px] border-2 border-dashed border-[#FF6A00]/20 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-[#FF6A00]/10 flex items-center justify-center">
              <ChevronRight size={20} />
            </div>
            <span className="text-[11px]">Load More</span>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ClusterSlider;
