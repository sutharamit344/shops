"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Award, ChevronRight, ChevronLeft, Store, MapPin } from "lucide-react";

const ClusterSlider = ({ clusters = [], shops = [], onClusterClick, parsed }) => {
  const { userCoords, userLocationName } = useSelector((state) => state.search);
  const scrollRef = useRef(null);
  const [visibleLimit, setVisibleLimit] = useState(4);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const currentCategory = (parsed?.category || "").toLowerCase().trim();
  const currentCluster = (parsed?.clusterType || "").toLowerCase().trim();
  const currentLocation = (parsed?.location || "").toLowerCase().trim();

  const clusterData = useMemo(() => {
    // Determine current location context
    const urlLoc = currentLocation && currentLocation !== "all" ? currentLocation : null;
    const gpsLoc = userLocationName ? userLocationName.split(',')[0].trim().toLowerCase() : null;
    const activeContext = (urlLoc === "current" ? gpsLoc : urlLoc) || gpsLoc;

    // Build a lookup map from cluster name -> cluster doc (for id, category metadata)
    const clusterDocMap = {};
    clusters.forEach(c => { clusterDocMap[c.name] = c; });

    // Filter shops to the current location context first
    let relevantShops = shops;
    if (activeContext) {
      relevantShops = shops.filter(s =>
        (s.area || "").toLowerCase() === activeContext ||
        (s.city || "").toLowerCase() === activeContext
      );
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
        const cat = (doc?.category || "").toLowerCase();
        const nm = clusterName.toLowerCase();
        if (!cat.includes(currentCategory) && !currentCategory.includes(cat) && !nm.includes(currentCategory)) return;
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

    return Object.values(groups)
      .filter(c => c.count > 0)
      .sort((a, b) => {
        if (typeof window !== 'undefined') {
          const lastArea = (localStorage.getItem('last_area') || "").toLowerCase();
          const lastCity = (localStorage.getItem('last_city') || "").toLowerCase();
          if (lastArea) {
            const aMatch = a.area.toLowerCase() === lastArea;
            const bMatch = b.area.toLowerCase() === lastArea;
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
          }
          if (lastCity) {
            const aMatch = a.city.toLowerCase() === lastCity;
            const bMatch = b.city.toLowerCase() === lastCity;
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
          }
        }
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
    if (parsed?.type === "nearby") return "Clusters Nearby You";

    // 1. If explicit cluster searched
    if (parsed?.clusterType) {
      const clusterName = parsed.clusterType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `Clusters Nearby ${clusterName}`;
    }

    // 2. If location searched (area or city)
    if (parsed?.location && parsed?.location !== "all") {
      const locationName = parsed.location.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `Clusters Nearby ${locationName}`;
    }

    // Default fallback
    return `Clusters Nearby ${userLocationName || "You"}`;
  };

  return (
    <div className="relative mb-6 group">
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-[16px] md:text-lg font-bold text-[#1A1F36] flex items-center gap-2">
            <Award size={18} className="text-[#FF6B35]" />
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
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#1A1F36]/40 hover:text-[#FF6B35] hover:border-[#FF6B35]/20 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              disabled={scrollPosition >= maxScroll - 5 && visibleLimit >= clusterData.length}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#1A1F36]/40 hover:text-[#FF6B35] hover:border-[#FF6B35]/20 disabled:opacity-30 transition-all"
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

          return (
            <div
              key={cluster.id || idx}
              onClick={() => onClusterClick && onClusterClick(cluster.name, cluster.area || cluster.city)}
              className="flex-shrink-0 w-60 md:w-68 bg-white p-3.5 md:p-4 rounded-[20px] border border-black/[0.06] hover:border-[#FF6B35]/20 transition-all cursor-pointer group/card flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-start justify-between mb-2.5">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
                    <Store className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </div>
                  <span className="text-[10px] font-bold bg-[#1A1F36] text-white px-2.5 py-1 rounded-full">
                    {cluster.count} Shops
                  </span>
                </div>

                <h3 className="text-[13px] md:text-[14px] font-bold text-[#1A1F36] group-hover/card:text-[#FF6B35] transition-colors line-clamp-1 mb-0.5">
                  {cluster.name}
                </h3>
                <p className="text-[10px] font-semibold text-[#1A1F36]/40 uppercase tracking-wider">
                  {cluster.category}
                </p>

                {(cluster.area || cluster.city) && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[#1A1F36]/50">
                    <MapPin size={9} className="text-[#FF6B35]" />
                    <span className="truncate">{cluster.area || cluster.city}{cluster.area && cluster.city ? `, ${cluster.city}` : ""}</span>
                    {distanceText && (
                      <span className="font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap">
                        {distanceText}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center text-[10px] font-bold text-[#FF6B35] opacity-0 group-hover/card:opacity-100 transition-all">
                <span>View Collection</span>
                <ChevronRight size={12} className="ml-0.5" />
              </div>
            </div>
          )
        })}

        {visibleLimit < clusterData.length && (
          <div
            onClick={handleNext}
            className="flex-shrink-0 w-36 flex flex-col items-center justify-center gap-2 text-[#FF6B35] font-bold cursor-pointer hover:bg-[#FF6B35]/5 rounded-[20px] border-2 border-dashed border-[#FF6B35]/20 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
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
