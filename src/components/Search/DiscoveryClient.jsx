"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchApprovedShops } from "@/redux/thunks/shopThunks";
import { fetchCategories } from "@/redux/thunks/categoryThunks";
import {
  setCity, setCategory, setArea,
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
  const {
    city: localCity,
    category: localCategory,
    area: localArea,
    nearby: isNearbyActive
  } = useSelector((state) => state.filters);
  const { userCoords, parsed } = useSelector((state) => state.search);

  // Local UI State
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detectedData, setDetectedData] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [localSubtitle, setLocalSubtitle] = useState(initialParsed?.location || "Select Location");

  const { sortBy = 'relevance', tags = {} } = useSelector((state) => state.filters || {});
  const { items: categories } = useSelector((state) => state.categories);
  const activeFilterCount = (sortBy !== 'relevance' ? 1 : 0) + Object.values(tags).filter(Boolean).length;

  // Helper for dynamic title
  const getDynamicTitle = () => {
    let city = initialParsed?.city || localCity;
    let category = initialParsed?.category || localCategory;
    let area = initialParsed?.area || localArea;

    // Fix: If category is empty but area exists, check if area is actually a category
    if (!category && area) {
      const isActuallyCategory = categories.some(c =>
        slugify(c.name) === slugify(area) ||
        c.name.toLowerCase().includes(area.toLowerCase())
      );
      if (isActuallyCategory) {
        category = area;
        area = "";
      }
    }

    const properCase = (str) => {
      if (!str) return "";
      return str
        .split(/[ -]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .replace(/\bAnd\b/g, "&")
        .trim();
    };

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
      parts.push(properCase(category));
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

  useEffect(() => {
    let finalCategory = initialParsed.category || "";
    let finalArea = initialParsed.area || "";

    // Fix: If category is empty but area exists, check if area is actually a category
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

    dispatch(setParsed({ ...initialParsed, category: finalCategory, area: finalArea }));
    dispatch(setQuery(finalCategory));
    dispatch(setCategory(finalCategory));
    dispatch(setCity(initialParsed.city || ""));
    dispatch(setArea(finalArea));
  }, [initialParsed, dispatch, categories]);

  useEffect(() => {
    const lastCity = localStorage.getItem('last_city');
    const lastArea = localStorage.getItem('last_area');
    const lastLat = localStorage.getItem('last_lat');
    const lastLng = localStorage.getItem('last_lng');

    if (lastLat && lastLng && !userCoords) {
      dispatch(setUserCoords({
        coords: { lat: parseFloat(lastLat), lng: parseFloat(lastLng) },
        name: lastArea || lastCity
      }));
    }

    const name = lastArea ? `${lastArea}, ${lastCity}` : lastCity;
    if (name) setLocalSubtitle(name);
  }, [isNearbyActive]);

  useEffect(() => {
    document.title = `${titleText} | ShopBajar`;
  }, [titleText]);

  // FETCH DATA ON MOUNT
  useEffect(() => {
    dispatch(fetchApprovedShops());
    dispatch(fetchCategories());
    dispatch(fetchClusters());
  }, [dispatch]);

  // FETCH RESULTS WHEN PARAMS CHANGE
  useEffect(() => {
    if (initialParsed) {
      dispatch(fetchSearchResults(initialParsed));
    }
  }, [initialParsed, dispatch, userCoords]);

  const applyLocation = (city, area, pincode, village, lat, lng) => {
    const cleanCity = city.replace(/ District| Division/g, "");
    const cleanArea = area ? area.replace(/ District| Division/g, "") : "";

    localStorage.setItem('last_city', cleanCity);
    if (cleanArea) localStorage.setItem('last_area', cleanArea);
    localStorage.setItem('last_lat', lat);
    localStorage.setItem('last_lng', lng);

    const displayLocation = cleanArea ? `${cleanArea}, ${cleanCity}` : cleanCity;
    setLocalSubtitle(displayLocation);

    dispatch(setUserCoords({ coords: { lat, lng }, name: cleanArea || cleanCity }));

    // Redirect to the new hierarchical URL for the selected location
    const url = generateDiscoveryUrl(initialParsed.category, cleanCity, "location", cleanArea);
    router.push(url);
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

      <main className="pt-20 sm:pt-22 md:pt-28 pb-8 px-4 md:px-8">
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
                    if (!detectedData && userCoords) {
                      setDetectedData({
                        lat: userCoords.lat,
                        lng: userCoords.lng,
                        city: initialParsed.city || "",
                        area: initialParsed.area || ""
                      });
                    }
                    setIsModalOpen(true);
                  }}
                  className="group flex items-center gap-2 text-[14px] md:text-[16px] font-bold text-[#FF6A00] transition-all hover:text-[#e65f00]"
                >
                  <MapPin size={16} className="text-[#FF6A00]/60 group-hover:text-[#FF6A00] transition-all duration-300  group-hover:animate-bounce" />
                  <span className="relative truncate">
                    {localSubtitle}
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
            subtitle={localSubtitle}
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

      {/* Mobile Sticky Search */}
      <div className="sticky top-16 z-40 py-2 px-3 transition-all lg:hidden bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <SmartSearch />
          </div>
          <Button
            variant={activeFilterCount > 0 ? "primary" : "ghost"}
            onClick={() => setIsFilterOpen(true)}
            className="px-3 h-10 relative"
          >
            <SlidersHorizontal size={18} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1A1F36] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

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
          applyLocation(confirmed.city, confirmed.area, confirmed.pincode, "", finalLat, finalLng);
        }}
      />

      <Footer />
    </div>
  );
};

export default DiscoveryClient;
