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
import { setParsed } from "@/redux/slices/searchSlice";
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

  // Local UI State
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isDetecting, setIsDetecting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  // Helper for dynamic title
  const getDynamicTitle = () => {
    const q = searchParams.get("q");
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    const area = searchParams.get("area");

    if (q) return `Results for "${q}"`;

    let parts = [];
    if (category) {
      parts.push(category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    } else {
      parts.push("Shops");
    }

    if (city) {
      parts.push(`in ${city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);
    }

    if (area) {
      parts.push(`- ${area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);
    }

    const title = parts.join(' ');
    return title === "Shops" ? "Explore Marketplace" : title;
  };
  const titleText = getDynamicTitle();

  useEffect(() => {
    document.title = `${titleText} | ShopSetu Marketplace`;
  }, [titleText]);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: { "User-Agent": "ShopSetu_Marketplace_App" }
            }
          );

          if (res.status === 429) {
            throw new Error("Location service is busy. Please try again in a few seconds.");
          }

          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
          if (city) {
            const cleanCity = city.replace(/ District| Division/g, "");
            dispatch(setCity(cleanCity));
            const params = new URLSearchParams(searchParams.toString());
            params.set("city", slugify(cleanCity));
            params.set("nearby", "true");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          }
        } catch (error) {
          console.error("Location error:", error);
          alert(error.message.includes("busy") ? error.message : "Could not detect your city. Please select it manually.");
        } finally {
          setIsDetecting(false);
        }
      },
      () => setIsDetecting(false)
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
    // Only auto-detect on initial load if nearby is true and no city is set
    if (searchParams.get("nearby") === "true" && !searchParams.get("city") && !isDetecting) {
      detectLocation();
    }
  }, []); // Run once on mount

  useEffect(() => {
    // Sync URL params to Redux on mount
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
  }, []); // Run once on mount

  // Sync with Smart Search Results
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
  }, [searchParams, dispatch]);

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

  // Live Search Effect (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      const currentS = searchParams.get("state") || "";
      const currentC = searchParams.get("city") || "";
      const currentCat = searchParams.get("category") || "";
      const currentA = searchParams.get("area") || "";

      // Check if any local state differs from URL params
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
  }, [localSearch, localState, localCity, localCategory, localArea]);

  // Reset pagination when search/filters change
  useEffect(() => {
    setVisibleCount(5);
  }, [localSearch, localState, localCity, localCategory, localArea]);

  const handleReset = () => {
    dispatch(resetFilters());
    router.push(pathname);
  };

  const filteredShops = shops.filter((shop) => {
    const q = searchParams.get("q")?.toLowerCase() || "";
    const s = searchParams.get("state") || "";
    const c = searchParams.get("city") || "";
    const cat = searchParams.get("category") || "";
    const a = searchParams.get("area") || "";
    return (
      (!q || shop.name.toLowerCase().includes(q) || shop.description?.toLowerCase().includes(q)) &&
      (!s || shop.state === s) &&
      (!c || slugify(shop.city) === c) &&
      (!cat || slugify(shop.category) === cat) &&
      (!a || slugify(shop.area) === a)
    );
  });

  const availableCities = [...new Set(shops.filter(s => !localState || s.state === localState).map(s => s.city).filter(Boolean))].sort();
  const availableAreas = [...new Set(shops.filter(s => !localCity || s.city === localCity).map(s => s.area).filter(Boolean))].sort();
  const activeFilterCount = [localState, localCity, localCategory, localArea].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      {/* SMART SEARCH BAR */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-[#1A1F36]/[0.06] shadow-md py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <SmartSearch />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isNearbyActive ? "primary" : "ghost"}
              onClick={handleNearbyToggle}
              loading={isDetecting}
              icon={Navigation}
            >
              {isNearbyActive ? "Near Me Active" : "Near Me"}
            </Button>
            <Button variant="ghost" onClick={handleReset} icon={RotateCcw}>Reset</Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <DiscoveryView title={titleText} />
    </div>
  );
}
