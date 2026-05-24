"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchApprovedShops } from "@/redux/thunks/shopThunks";
import { fetchCategories } from "@/redux/thunks/categoryThunks";
import {
  setCategory,
  setAllFilters
} from "@/redux/slices/filterSlice";
import { setParsed, setUserCoords, setQuery } from "@/redux/slices/searchSlice";
import { fetchSearchResults } from "@/redux/thunks/searchThunks";
import { fetchClusters } from "@/redux/thunks/clusterThunks";
import { slugify } from "@/lib/slugify";
import {
  Search, MapPin, SlidersHorizontal, RotateCcw,
  ChevronDown, LayoutGrid, List
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SmartSearch from "@/components/Search/SmartSearch";
import DiscoveryView from "@/components/Search/DiscoveryView";
import { getNearestLocation, updateLocationCache } from "@/lib/db";
import LocationModal from "@/components/UI/LocationModal";
import FilterModal from "@/components/Search/FilterModal";
import Footer from "@/components/Footer";
import { generateDiscoveryUrl } from "@/lib/urlArchitect";

const properCase = (str) => {
  if (!str) return "";
  return str
    .split(/[ -]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/\bAnd\b/g, "&")
    .trim();
};

/**
 * Universal Shop Listing Component
 * Restored to "Old UI" but compatible with Hierarchical Routes
 */
const DiscoveryClient = ({ slug, parsed: initialParsed }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  // Redux State
  const { items: shops, loading: shopsLoading } = useSelector((state) => state.shops);
  const { items: categories } = useSelector((state) => state.categories);
  const {
    city: localCity,
    category: localCategory,
    area: localArea,
    nearby: isNearbyActive
  } = useSelector((state) => state.filters);
  const { userCoords, userLocationName, parsed: searchParsed } = useSelector((state) => state.search);
  const { items: clusters } = useSelector((state) => state.clusters);

  // Local UI State
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detectedData, setDetectedData] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null);
  const isCurrentLocationMode = typeof window !== 'undefined' && localStorage.getItem('location_mode') === 'current';

  // USER'S HOME/CURRENT LOCATION — shown in the location pill
  // Always reflects where the user IS (saved or GPS), never the browsed/searched area
  const userHomeLocation = React.useMemo(() => {
    // 1. If GPS "Current Location" mode is active, use that
    if (isCurrentLocationMode && userLocationName) {
      return { city: "", area: "", full: userLocationName };
    }

    // 2. Use saved location from cache (set by user explicitly)
    if (typeof window !== 'undefined') {
      const savedCity = localStorage.getItem('last_city');
      const savedArea = localStorage.getItem('last_area');
      if (savedCity) {
        const city = properCase(savedCity);
        const area = properCase(savedArea || "");
        return {
          city,
          area,
          full: area ? `${area}, ${city}` : city
        };
      }
    }

    // 3. Fallback to city from URL (only if nothing saved)
    const fallbackCity = properCase(initialParsed?.city || localCity || "");
    return { city: fallbackCity, area: "", full: fallbackCity || "Select Location" };
  }, [isCurrentLocationMode, userLocationName, initialParsed, localCity]);

  // SEARCH CONTEXT LOCATION — used for page title and filtering context
  // Reflects the URL (what the user is browsing)
  const currentActiveLocation = React.useMemo(() => {
    let city = searchParsed?.city || initialParsed?.city || localCity || "";
    let area = searchParsed?.area || initialParsed?.area || localArea || "";
    let category = searchParsed?.category || initialParsed?.category || localCategory || "";

    // Filter out area segment if it's actually a category or cluster slug
    if (area && (clusters?.length > 0 || categories?.length > 0)) {
      const isCategory = categories.some(c =>
        slugify(c.name) === slugify(area) ||
        c.name.toLowerCase().includes(area.toLowerCase())
      );
      if (isCategory || slugify(area) === slugify(category)) area = "";
    }

    return {
      city: properCase(city),
      area: properCase(area),
      full: area ? `${properCase(area)}, ${properCase(city)}` : properCase(city) || "Select Location"
    };
  }, [initialParsed, localCity, localArea, clusters, searchParsed, categories]);


  const { sortBy = 'relevance', tags = {} } = useSelector((state) => state.filters || {});
  const activeFilterCount = (sortBy !== 'relevance' ? 1 : 0) + Object.values(tags).filter(Boolean).length;

  // Refactored shared title logic
  const constructPageTitle = (cat, ar, ci, clType) => {
    let category = cat || "";
    let area = ar || "";
    let city = ci || "";
    let cluster = clType || "";

    if (cluster) {
      const parts = [`Shops in ${properCase(cluster)}`];
      if (area && city) parts.push(`${properCase(area)}, ${properCase(city)}`);
      else if (area) parts.push(`${properCase(area)}`);
      else if (city) parts.push(`${properCase(city)}`);
      return parts.join(', ');
    }

    // 1. Resolve Area vs Category redundancy
    if (area && (categories?.length > 0 || slugify(area) === slugify(category))) {
      const isActuallyCategory = categories.some(c =>
        slugify(c.name) === slugify(area) ||
        c.name.toLowerCase().includes(area.toLowerCase())
      );
      if (isActuallyCategory || slugify(area) === slugify(category)) {
        if (!category) category = area;
        area = "";
      }
    }

    // 2. Clean "Shops" suffix
    if (category.toLowerCase().endsWith(" shops")) category = category.slice(0, -6).trim();
    else if (category.toLowerCase().endsWith(" shop")) category = category.slice(0, -5).trim();

    // 3. Identify "Near Me" context
    let isNearMe = false;
    if (typeof window !== "undefined") {
      const lastCity = (localStorage.getItem('last_city') || "").toLowerCase();
      const lastArea = (localStorage.getItem('last_area') || "").toLowerCase();
      const tCity = (city || "").toLowerCase();
      const tArea = (area || "").toLowerCase();

      if (tCity && lastCity.includes(tCity)) {
        if (!tArea || (tArea && lastArea.includes(tArea))) {
          isNearMe = true;
        }
      }
    }

    const parts = [];
    parts.push(category ? `${properCase(category)} Shops` : "Shops");

    if (isNearMe) {
      parts.push("Near Me");
    } else if (area && city) {
      parts.push(`in ${properCase(area)}, ${properCase(city)}`);
    } else if (city) {
      parts.push(`in ${properCase(city)}`);
    }

    const title = parts.join(' ');
    return title === "Shops" ? "Explore Marketplace" : title;
  };

  const activeCategory = searchParsed ? searchParsed.category : (initialParsed?.category || localCategory);
  const activeCluster = searchParsed ? searchParsed.clusterType : "";
  const activeArea = searchParsed ? searchParsed.area : (initialParsed?.area || localArea);
  const activeCity = searchParsed ? searchParsed.city : (initialParsed?.city || localCity);

  const titleText = constructPageTitle(activeCategory, activeArea, activeCity, activeCluster);

  const hasSyncedRef = useRef(false);
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    if (!initialParsed || hasSyncedRef.current) return;

    let finalCategory = initialParsed.category || "";
    let finalArea = initialParsed.area || "";
    let clusterType = "";

    // 1. Distinguish between Area and Category
    if (finalArea) {
      const isActuallyCategory = categories.some(c =>
        slugify(c.name) === slugify(finalArea) ||
        c.name.toLowerCase().includes(finalArea.toLowerCase())
      );
      if (isActuallyCategory || slugify(finalArea) === slugify(finalCategory || "")) {
        if (!finalCategory) finalCategory = finalArea;
        finalArea = "";
      }
    }

    // 2. Distinguish between Area and Cluster
    if (finalArea && clusters.length > 0) {
      const clusterMatch = clusters.find(c =>
        slugify(c.name) === slugify(finalArea) ||
        c.name.toLowerCase().includes(finalArea.toLowerCase())
      );
      if (clusterMatch) {
        clusterType = clusterMatch.name;
        finalArea = ""; // Cluster is NOT a geographic area
      }
    }

    dispatch(setParsed({ ...initialParsed, category: finalCategory, area: finalArea, clusterType }));
    dispatch(setCategory(finalCategory));

    hasSyncedRef.current = true;
    setHasSynced(true);
  }, [initialParsed, categories, clusters, dispatch]);

  // Reactive sync: Ensure search input box perfectly matches the dynamic page title
  useEffect(() => {
    if (titleText && titleText !== "Explore Marketplace") {
      dispatch(setQuery(titleText));
    } else {
      dispatch(setQuery(""));
    }
  }, [titleText, dispatch]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastLat = localStorage.getItem('last_lat');
      const lastLng = localStorage.getItem('last_lng');
      const lastCity = localStorage.getItem('last_city');
      const lastArea = localStorage.getItem('last_area');

      if (lastLat && lastLng && !userCoords) {
        const locationName = lastArea ? `${properCase(lastArea)}, ${properCase(lastCity)}` : properCase(lastCity);
        dispatch(setUserCoords({
          coords: { lat: parseFloat(lastLat), lng: parseFloat(lastLng) },
          name: locationName
        }));
      }
    }
  }, [userCoords, dispatch]);

  useEffect(() => {
    document.title = `${titleText} | ShopBajar`;
  }, [titleText]);

  // FETCH DATA ON MOUNT
  useEffect(() => {
    dispatch(fetchApprovedShops());
    dispatch(fetchCategories());
    dispatch(fetchClusters());
  }, [dispatch]);

  // FETCH RESULTS WHEN PARAMS CHANGE — only after initial sync is complete
  useEffect(() => {
    if (!hasSynced) return;
    dispatch(fetchSearchResults({
      ...initialParsed,
      area: localArea || initialParsed.area,
      // Pass GPS-detected area name into thunk so it can use it for filtering
      detectedAreaName: userLocationName || "",
    }));
  }, [hasSynced, initialParsed, userCoords?.lat, userCoords?.lng, localArea, userLocationName, sortBy, tags, dispatch]);

  const applyLocation = (city, area, pincode, village, lat, lng, isCurrent = false) => {
    const cleanCity = city.replace(/ District| Division/g, "");
    const cleanArea = area ? area.replace(/ District| Division/g, "") : (village || "");

    localStorage.setItem('last_lat', lat);
    localStorage.setItem('last_lng', lng);
    localStorage.setItem('last_city', cleanCity);
    localStorage.setItem('last_area', cleanArea);
    localStorage.setItem('location_mode', isCurrent ? 'current' : 'manual');

    const locationName = cleanArea ? `${cleanArea}, ${cleanCity}${pincode ? ', ' + pincode : ''}` : cleanCity;

    dispatch(setUserCoords({ coords: { lat, lng }, name: locationName }));
    setDetectedData({ city: cleanCity, area: cleanArea, lat, lng, pincode: pincode || "" });

    // Only navigate if the resulting URL differs from the current path
    const url = generateDiscoveryUrl(initialParsed.category || localCategory, cleanCity, "location", cleanArea);
    if (url !== pathname) {
      router.push(url);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const nearest = await getNearestLocation(latitude, longitude, 2000);

          if (nearest) {
            setDetectedData({
              city: nearest.city || nearest.name,
              area: nearest.area || "",
              pincode: "",
              lat: latitude,
              lng: longitude
            });
            setIsDetecting(false);
            setIsModalOpen(true);
            return;
          }

          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
          const data = await res.json();
          const address = data.address || {};
          const city = address.city || address.city_district || address.state_district || address.town || "";
          let area = address.suburb || address.neighbourhood || address.residential || address.village || "";

          setDetectedData({ city, area, pincode: address.postcode || "", lat: latitude, lng: longitude });
          setPendingCoords({ lat: latitude, lng: longitude });
          setIsModalOpen(true);
        } catch (error) {
          console.error("Location error:", error);
        } finally {
          setIsDetecting(false);
        }
      },
      () => setIsDetecting(false)
    );
  };

  const [viewMode, setViewMode] = useState("grid");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <Navbar />

      <main className="pt-[60px] pb-12">
        {/* Mobile Sticky Sub-header */}
        <div className={`sticky top-[60px] z-40 ${isSearchFocused ? 'bg-white' : 'bg-[#F7F7F5]/90 backdrop-blur-lg'} border-b border-black/[0.05] px-4 py-2 mb-4 lg:hidden`}>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SmartSearch pageTitle={titleText} pageContext={currentActiveLocation} onFocusStateChange={setIsSearchFocused} />
            </div>
            {!isSearchFocused && (
              <button
                onClick={() => setIsFilterOpen(true)}
                className={`relative h-9 w-9 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${activeFilterCount > 0
                    ? "bg-[#FF6A00] border-[#FF6A00] text-white"
                    : "bg-white border-black/[0.07] text-[#0A0A0F]/50 hover:border-black/[0.15]"
                  }`}
              >
                <SlidersHorizontal size={15} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[#FF6A00] text-[9px] flex items-center justify-center rounded-full border border-[#FF6A00] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 py-4 mb-1">
            {/* Left: Title + Location */}
            <div className="flex flex-col gap-1 min-w-0">
              <h1 className="text-[22px] md:text-[28px] font-bold text-[#0A0A0F] tracking-tight leading-tight truncate">
                {titleText}
              </h1>
              <button
                onClick={() => {
                  const lastLat = localStorage.getItem('last_lat');
                  const lastLng = localStorage.getItem('last_lng');
                  setDetectedData({
                    lat: parseFloat(lastLat) || userCoords?.lat || null,
                    lng: parseFloat(lastLng) || userCoords?.lng || null,
                    city: userHomeLocation.city,
                    area: userHomeLocation.area,
                    pincode: (isCurrentLocationMode && userLocationName?.split(', ').pop()) || ""
                  });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1 text-[13px] font-medium text-[#0A0A0F]/45 hover:text-[#FF6A00] transition-colors duration-150 w-fit"
              >
                <MapPin size={12} className="text-[#FF6A00]" />
                <span className="truncate">{userHomeLocation.full}</span>
                <ChevronDown size={11} className="text-[#0A0A0F]/25" />
              </button>
            </div>

            {/* Right: View toggle */}
            <div className="hidden md:flex items-center gap-0.5 p-0.5 bg-white border border-black/[0.07] rounded-md shadow-sm flex-shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-[#0A0A0F] text-white" : "text-[#0A0A0F]/35 hover:text-[#0A0A0F]"
                  }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === "list" ? "bg-[#0A0A0F] text-white" : "text-[#0A0A0F]/35 hover:text-[#0A0A0F]"
                  }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Discovery Results */}
          <DiscoveryView
            title={titleText}
            subtitle={userHomeLocation.full}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onSubtitleClick={() => setIsModalOpen(true)}
            onRefresh={detectLocation}
            isDetecting={isDetecting}
            onClusterClick={(clusterName, clusterCity, clusterArea) => {
              const city = clusterCity || initialParsed.city || "ahmedabad";
              const area = clusterArea || initialParsed.area || "";
              const url = generateDiscoveryUrl(clusterName, city, "all", area);
              router.push(url);
            }}
          />
        </div>
      </main>



      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        detectedLocation={detectedData}
        onRefresh={detectLocation}
        isRefreshing={isDetecting}
        onConfirm={(confirmed, isManual, mapCoords) => {
          const finalLat = mapCoords ? mapCoords.lat : (pendingCoords ? pendingCoords.lat : null);
          const finalLng = mapCoords ? mapCoords.lng : (pendingCoords ? pendingCoords.lng : null);
          applyLocation(confirmed.city, confirmed.area, confirmed.pincode, "", finalLat, finalLng, !isManual);
        }}
      />

      <Footer />
    </div>
  );
};

export default DiscoveryClient;
