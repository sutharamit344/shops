"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchApprovedShops } from "@/redux/thunks/shopThunks";
import { fetchCategories } from "@/redux/thunks/categoryThunks";
import {
  setSearch, setCity, setCategory, setArea, setState,
  resetFilters, setAllFilters
} from "@/redux/slices/filterSlice";
import { setParsed, setUserCoords } from "@/redux/slices/searchSlice";
import { fetchSearchResults } from "@/redux/thunks/searchThunks";
import ShopCard from "@/components/Shop/ShopCard";
import { slugify } from "@/lib/slugify";
import {
  Search, MapPin, Layers, Map, SlidersHorizontal,
  ChevronDown, RotateCcw, LayoutGrid, List, X, Store, Navigation, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Button from "@/components/UI/Button";
import Input from "@/components/UI/Input";
import Select from "@/components/UI/Select";
import SmartSearch from "@/components/Search/SmartSearch";
import DiscoveryView from "@/components/Search/DiscoveryView";
import { getNearestLocation, updateLocationCache } from "@/lib/db";
import LocationModal from "@/components/UI/LocationModal";
import FilterModal from "@/components/Search/FilterModal";

export default function ExploreClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  // Redux State
  const { items: shops, loading: shopsLoading } = useSelector((state) => state.shops);
  const { items: categories } = useSelector((state) => state.categories);
  const {
    search: localSearch,
    city: localCity,
    category: localCategory,
    area: localArea,
    state: localState,
    nearby: isNearbyActive
  } = useSelector((state) => state.filters);
  const { userCoords } = useSelector((state) => state.search);

  // Local UI State
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isDetecting, setIsDetecting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detectedData, setDetectedData] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [localSubtitle, setLocalSubtitle] = useState("Nearby Shops");
  const { sortBy, tags } = useSelector((state) => state.filters);
  const activeFilterCount = (sortBy !== 'relevance' ? 1 : 0) + Object.values(tags).filter(Boolean).length;

  // Helper for dynamic title
  const getDynamicTitle = () => {
    const q = localSearch;
    const city = localCity;
    const category = localCategory;
    const area = localArea;

    if (q) return `Results for "${q}"`;
    if (!category && !city && !area && isNearbyActive) return "Shops Near Me";

    let parts = [];
    if (category) {
      parts.push(category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    } else {
      parts.push("Shops");
    }

    if (area && city) {
      parts.push(`in ${area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ${city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);
    } else if (city) {
      parts.push(`in ${city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);
    } else if (area) {
      parts.push(`in ${area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);
    }
    const title = parts.join(' ');
    return title === "Shops" ? "Explore Marketplace" : title;
  };
  const titleText = getDynamicTitle();

  useEffect(() => {
    if (!localCity && !isNearbyActive) {
      setLocalSubtitle("");
      dispatch(setUserCoords({ coords: null, name: "" })); // Clear coordinates if not nearby
      return;
    }
    
    const lastCity = localStorage.getItem('last_city');
    const lastArea = localStorage.getItem('last_area');
    const lastPin = localStorage.getItem('last_pincode');
    const lastLat = localStorage.getItem('last_lat');
    const lastLng = localStorage.getItem('last_lng');
    
    // Only use cached coords if nearby is active
    if (isNearbyActive && lastLat && lastLng) {
      dispatch(setUserCoords({ 
        coords: { lat: parseFloat(lastLat), lng: parseFloat(lastLng) }, 
        name: lastArea || lastCity 
      }));
    }

    if (localCity && lastCity && localCity.toLowerCase() === lastCity.toLowerCase()) {
      let sub = lastArea && lastArea !== "current" ? lastArea : "";
      if (sub && lastCity) sub += `, ${lastCity}`;
      else if (lastCity) sub = lastCity;
      if (sub && lastPin) sub += ` ${lastPin}`;
      setLocalSubtitle(sub);
    } else if (localCity) {
      setLocalSubtitle(`${localArea ? localArea + ', ' : ''}${localCity}`);
    } else if (isNearbyActive && lastCity) {
       setLocalSubtitle(`${lastArea ? lastArea + ', ' : ''}${lastCity}`);
    }
  }, [localCity, localArea, isNearbyActive]);

  useEffect(() => {
    document.title = `${titleText} | ShopSetu Marketplace`;
  }, [titleText]);

  const applyLocation = (city, area, pincode, village, lat, lng) => {
    const cleanCity = city.replace(/ District| Division/g, "");
    const cleanArea = area ? area.replace(/ District| Division/g, "") : "";

    localStorage.setItem('last_city', cleanCity);
    if (cleanArea) localStorage.setItem('last_area', cleanArea);

    if (pincode) localStorage.setItem('last_pincode', pincode);
    else localStorage.removeItem('last_pincode');

    if (village) localStorage.setItem('last_village', village);
    else localStorage.removeItem('last_village');

    localStorage.setItem('last_lat', lat);
    localStorage.setItem('last_lng', lng);

    const displayLocation = cleanArea
      ? `${cleanArea}, ${cleanCity}${pincode ? ' ' + pincode : ''}`
      : `${cleanCity}${pincode ? ' ' + pincode : ''}`;

    setLocalSubtitle(displayLocation);
    dispatch(setUserCoords({ 
      coords: { lat, lng }, 
      name: cleanArea || cleanCity 
    }));

    // Auto-update Redux filters to match
    dispatch(setCity(cleanCity));
    if (cleanArea) dispatch(setArea(cleanArea));

    // Save to Cache for future users
    updateLocationCache(cleanArea || cleanCity, lat, lng, {
      city: cleanCity,
      area: cleanArea,
      pincode: pincode || "",
      village: village || ""
    });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // 1. SMART CHECK: Is there a cached location within 2km?
          const nearest = await getNearestLocation(latitude, longitude, 2000);

          if (nearest) {
            const areaName = nearest.area || nearest.name;
            console.log("Smart Discovery: Match found in database for", areaName);
            applyLocation(
              nearest.city || nearest.name,
              nearest.area || "",
              nearest.pincode || "",
              nearest.village || "",
              latitude,
              longitude
            );
            setIsDetecting(false);
            return;
          }

          console.log("Smart Discovery: No nearby match found. Starting discovery...");
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            { headers: { "User-Agent": "ShopSetu_Marketplace_App" } }
          );

          const data = await res.json();
          const address = data.address || {};

          const city = address.city || address.city_district || address.state_district || address.town || address.village || "";
          const area = address.suburb || address.neighbourhood || address.residential || "";
          const village = address.village || address.hamlet || "";
          const pincode = address.postcode || "";

          setDetectedData({ city, area, village, pincode });
          setPendingCoords({ lat: latitude, lng: longitude });
          setIsModalOpen(true);
        } catch (error) {
          console.error("Location error:", error);
          alert("Could not detect your location precisely.");
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setIsDetecting(false);
        alert("Location access denied.");
      }
    );
  };

  const handleNearbyToggle = () => {
    if (isNearbyActive) {
      dispatch(setAllFilters({ nearby: false, city: "", area: "" }));
      const params = new URLSearchParams(searchParams.toString());
      params.delete("nearby");
      params.delete("city");
      params.delete("area");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      dispatch(setAllFilters({ nearby: true }));
      const params = new URLSearchParams(searchParams.toString());
      params.set("nearby", "true");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      detectLocation();
    }
  };

  useEffect(() => {
    if (searchParams.get("nearby") === "true" && !searchParams.get("city") && !isDetecting) {
      detectLocation();
    }
  }, []);

  useEffect(() => {
    dispatch(setAllFilters({
      search: searchParams.get("q") || "",
      state: searchParams.get("state") || "",
      city: searchParams.get("city") || "",
      category: searchParams.get("category") || "",
      area: searchParams.get("area") || "",
      nearby: searchParams.get("nearby") === "true"
    }));

    dispatch(fetchApprovedShops());
    dispatch(fetchCategories());
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const category = searchParams.get("category") || "";
    const area = searchParams.get("area") || "";
    const nearby = searchParams.get("nearby") === "true";

    const parsed = {
      category: category || q,
      location: area || city || (nearby ? "current" : ""),
      type: nearby ? "nearby" : (area || city ? "location" : "category")
    };

    dispatch(setParsed(parsed));
    dispatch(fetchSearchResults(parsed));
  }, [searchParams, dispatch, userCoords]);

  const handleSearch = (shouldCloseFilters = false) => {
    const params = new URLSearchParams();
    if (localSearch) params.set("q", localSearch);
    if (localState) params.set("state", localState);
    if (localCity) params.set("city", slugify(localCity));
    if (localCategory) params.set("category", slugify(localCategory));
    if (localArea) params.set("area", slugify(localArea));
    if (isNearbyActive) params.set("nearby", "true");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    if (shouldCloseFilters) setShowFilters(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      const currentS = searchParams.get("state") || "";
      const currentC = searchParams.get("city") || "";
      const currentCat = searchParams.get("category") || "";
      const currentA = searchParams.get("area") || "";

      if (
        localSearch !== currentQ ||
        localState !== currentS ||
        (localCity && slugify(localCity) !== currentC) ||
        (localCategory && slugify(localCategory) !== currentCat) ||
        (localArea && slugify(localArea) !== currentA)
      ) {
        handleSearch(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, localState, localCity, localCategory, localArea, searchParams]);

  useEffect(() => {
    setVisibleCount(5);
  }, [localSearch, localState, localCity, localCategory, localArea]);

  const handleReset = () => {
    dispatch(resetFilters());
    router.push(pathname);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="sticky top-16 z-40 py-2 px-3 md:px-6 transition-all lg:hidden bg-[#FAFAF8]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3 md:gap-6 group">
          <div className="flex-1 w-full transition-all duration-300">
            <SmartSearch />
          </div>
          <div className="flex items-center gap-2 transition-all duration-300">
            <Button
              variant={isNearbyActive ? "primary" : "ghost"}
              onClick={handleNearbyToggle}
              loading={isDetecting}
              icon={Navigation}
              className="px-3 md:px-5"
            >
              <span className="hidden md:inline">{isNearbyActive ? "Near Me Active" : "Near Me"}</span>
            </Button>
            <Button
              variant={activeFilterCount > 0 ? "primary" : "ghost"}
              onClick={() => setIsFilterOpen(true)}
              icon={SlidersHorizontal}
              className="px-3 md:px-5 relative"
            >
              <span className="hidden md:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1A1F36] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" onClick={handleReset} icon={RotateCcw} className="px-3 md:px-5">
              <span className="hidden md:inline">Reset</span>
            </Button>
          </div>
        </div>
      </div>

      <DiscoveryView 
        title={titleText} 
        subtitle={isNearbyActive ? localSubtitle : ""} 
        onSubtitleClick={() => {
          setDetectedData({
            city: localCity || localStorage.getItem('last_city') || "",
            area: localArea || localStorage.getItem('last_area') || "",
            pincode: localStorage.getItem('last_pincode') || "",
            village: "",
            lat: userCoords?.lat || null,
            lng: userCoords?.lng || null
          });
          setIsModalOpen(true);
        }}
      />

      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        detectedLocation={detectedData}
        onConfirm={(confirmed, isManual, mapCoords) => {
          const finalLat = mapCoords ? mapCoords.lat : (pendingCoords ? pendingCoords.lat : null);
          const finalLng = mapCoords ? mapCoords.lng : (pendingCoords ? pendingCoords.lng : null);
          
          applyLocation(
            confirmed.city,
            confirmed.area,
            isManual ? confirmed.pincode : "",
            isManual ? confirmed.village : "",
            finalLat,
            finalLng
          );
        }}
      />
    </div>
  );
}
