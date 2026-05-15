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
import Button from "@/components/UI/Button";
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
    let area = searchParsed?.area || localArea || "";

    // Filter out area segment if it's actually a category or cluster slug
    if (area && (clusters?.length > 0 || categories?.length > 0)) {
      const isCluster = clusters.some(c =>
        slugify(c.name) === slugify(area) ||
        c.name.toLowerCase().includes(area.toLowerCase())
      );
      const isCategory = categories.some(c =>
        slugify(c.name) === slugify(area) ||
        c.name.toLowerCase().includes(area.toLowerCase())
      );
      if (isCluster || isCategory) area = "";
    }

    return {
      city: properCase(city),
      area: properCase(area),
      full: area ? `${properCase(area)}, ${properCase(city)}` : properCase(city) || "Select Location"
    };
  }, [initialParsed, localCity, localArea, clusters, searchParsed, categories]);


  const { sortBy = 'relevance', tags = {} } = useSelector((state) => state.filters || {});
  const activeFilterCount = (sortBy !== 'relevance' ? 1 : 0) + Object.values(tags).filter(Boolean).length;

  // Helper for dynamic title
  const getDynamicTitle = () => {
    let city = searchParsed?.city || initialParsed?.city || localCity;
    let category = searchParsed?.category || initialParsed?.category || localCategory;
    let area = searchParsed?.area || localArea;

    // Fix: If area is actually a category or cluster, remove it from area context
    if (area && (categories?.length > 0 || clusters?.length > 0)) {
      const isActuallyCategory = categories.some(c =>
        slugify(c.name) === slugify(area) ||
        c.name.toLowerCase().includes(area.toLowerCase())
      );
      const isActuallyCluster = clusters.some(c =>
        slugify(c.name) === slugify(area) ||
        c.name.toLowerCase().includes(area.toLowerCase())
      );
      
      if (isActuallyCategory) {
        if (!category) category = area;
        area = "";
      } else if (isActuallyCluster) {
        area = "";
      }
    }



    // Check for "Near You" match
    let isNearYou = false;
    if (typeof window !== "undefined") {
      const lastCity = (localStorage.getItem('last_city') || "").toLowerCase();
      const lastArea = (localStorage.getItem('last_area') || "").toLowerCase();
      const tCity = (city || "").toLowerCase();
      const tArea = (area || "").toLowerCase();

      if (tCity && lastCity.includes(tCity)) {
        if (!tArea || (tArea && lastArea.includes(tArea))) {
          isNearYou = true;
        }
      }
    }

    let parts = [];
    if (category) {
      parts.push(`${properCase(category)} Shops`);
    } else {
      parts.push("Shops");
    }

    if (isNearYou) {
      parts.push("Near You");
    } else if (area && city) {
      parts.push(`in ${properCase(area)}, ${properCase(city)}`);
    } else if (city) {
      parts.push(`in ${properCase(city)}`);
    }

    const title = parts.join(' ');
    return title === "Shops" ? "Explore Marketplace" : title;
  };
  const titleText = getDynamicTitle();

  const hasSyncedRef = useRef(false);
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    if (!initialParsed || hasSyncedRef.current) return;
    
    let finalCategory = initialParsed.category || "";
    let finalArea = initialParsed.area || "";
    let clusterType = "";

    // 1. Distinguish between Area and Category
    if (!finalCategory && finalArea) {
      const isActuallyCategory = categories.some(c =>
        slugify(c.name) === slugify(finalArea) ||
        c.name.toLowerCase().includes(finalArea.toLowerCase())
      );
      if (isActuallyCategory) {
        finalCategory = finalArea;
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
    // Set the full title as the search input value (e.g. "Electronics Shops in Thaltej, Ahmedabad")
    // We compute it here directly since titleText is derived after this effect runs
    const titleParts = [];
    if (finalCategory) {
      titleParts.push(`${properCase(finalCategory)} Shops`);
    } else {
      titleParts.push("Shops");
    }
    const urlArea = finalArea || initialParsed?.area || "";
    const urlCity = initialParsed?.city || localCity || "";
    if (urlArea && urlCity) {
      titleParts.push(`in ${properCase(urlArea)}, ${properCase(urlCity)}`);
    } else if (urlCity) {
      titleParts.push(`in ${properCase(urlCity)}`);
    }
    const inputTitle = titleParts.join(" ");
    dispatch(setQuery(inputTitle !== "Shops" ? inputTitle : ""));
    dispatch(setCategory(finalCategory));
    
    hasSyncedRef.current = true;
    setHasSynced(true);
  }, [initialParsed, categories, clusters, dispatch]);

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
  }, [hasSynced, initialParsed, userCoords?.lat, userCoords?.lng, localArea, userLocationName, dispatch]);

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

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <main className="pt-[69px] sm:pt-22 md:pt-28 pb-8 px-4 md:px-8">
        {/* Mobile Sticky Search */}
        <div className="sticky top-[69px] z-40 py-2 transition-all lg:hidden bg-[#FAFAF8]/95 backdrop-blur-md border-b border-black/[0.04] -mx-4 px-4 mb-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="flex-1">
              <SmartSearch pageTitle={titleText} pageContext={currentActiveLocation} />
            </div>
            <Button
              variant={activeFilterCount > 0 ? "primary" : "ghost"}
              onClick={() => setIsFilterOpen(true)}
              className="px-3 h-12 relative rounded-2xl"
            >
              <SlidersHorizontal size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6A00] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header Section: Title, Location & Toggle */}
          <div className="flex flex-col md:flex-row md:items-end items-center justify-between gap-6 mb-3">
            <div className="flex flex-col gap-2 items-start md:items-center md:flex-row items-center justify-between flex-nowrap w-full">
              <h1 className="text-2xl md:text-4xl font-black text-[#1A1F36] tracking-tighter leading-tight ">
                {titleText}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
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
                  className="group flex items-center gap-2 text-[14px] md:text-[16px] font-bold text-[#FF6A00] transition-all hover:text-[#e65f00]"
                >
                  <MapPin size={16} className="text-[#FF6A00]/60 group-hover:text-[#FF6A00] transition-all duration-300  group-hover:animate-bounce" />
                  <span className="relative truncate">
                    {userHomeLocation.full}
                  </span>
                  <ChevronDown size={14} className="ml-0.5 text-gray-400 group-hover:text-[#FF6A00] transition-colors" />
                </button>
              </div>
            </div>

            {/* Desktop View Toggle */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-white border border-black/[0.08] rounded-2xl shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-[#1A1F36] text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === "list" ? "bg-[#1A1F36] text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List size={18} />
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
            onClusterClick={(clusterName, location) => {
              const url = generateDiscoveryUrl("", location || initialParsed.location || "ahmedabad", "all", clusterName);
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
