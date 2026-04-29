"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setParsed, setQuery, setUserCoords } from "@/redux/slices/searchSlice";
import { fetchSearchResults } from "@/redux/thunks/searchThunks";
import { fetchApprovedShops } from "@/redux/thunks/shopThunks";
import { fetchCategories } from "@/redux/thunks/categoryThunks";
import DiscoveryView from "@/components/Search/DiscoveryView";
import SmartSearch from "@/components/Search/SmartSearch";
import Navbar from "@/components/Navbar";
import LocationModal from "@/components/UI/LocationModal";

export default function DiscoveryClient({ slug, parsed }) {
  const dispatch = useDispatch();
  const userCoords = useSelector((state) => state.search.userCoords);
  const [localTitle, setLocalTitle] = React.useState("");
  const [localSubtitle, setLocalSubtitle] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useEffect(() => {
    const hydrate = async () => {
      // Sync Redux with parsed slug
      dispatch(setParsed(parsed));
      const queryText = slug.replace(/-/g, " ");
      dispatch(setQuery(queryText));
      
      // Initial title from slug/parsed
      const formatTitle = (text) => text.replace(/-/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const baseTitle = formatTitle(slug === "explore" ? (parsed.location || "Shops") : slug);
      setLocalTitle(baseTitle);

      // Check for personalized location info
      const lastCity = localStorage.getItem('last_city');
      const lastArea = localStorage.getItem('last_area');
      const lastPin = localStorage.getItem('last_pincode');
      
      let sub = "";
      const safeArea = lastArea && lastArea !== "current" ? lastArea : "";
      const safeCity = lastCity && lastCity !== "current" ? lastCity : "";

      if (safeArea && safeCity) {
        sub = `${safeArea}, ${safeCity}`;
      } else if (safeCity) {
        sub = safeCity;
      }
      
      if (sub && lastPin) {
        sub += ` ${lastPin}`;
      }
      
      setLocalSubtitle(sub);

      // Fetch data
      await Promise.all([
        dispatch(fetchApprovedShops()),
        dispatch(fetchCategories())
      ]);
      
      dispatch(fetchSearchResults(parsed));
    };
    hydrate();
  }, [slug, parsed, dispatch]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      
      <div className="sticky top-16 z-40 py-4 px-4 md:px-8 lg:hidden bg-[#FAFAF8]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <SmartSearch />
        </div>
      </div>

      <DiscoveryView 
        title={localTitle || "Shops"} 
        subtitle={localSubtitle} 
        onSubtitleClick={() => setIsModalOpen(true)}
      />

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        detectedLocation={{
          city: typeof window !== 'undefined' ? localStorage.getItem('last_city') || "" : "",
          area: typeof window !== 'undefined' ? localStorage.getItem('last_area') || "" : "",
          pincode: typeof window !== 'undefined' ? localStorage.getItem('last_pincode') || "" : "",
          lat: userCoords?.lat || null,
          lng: userCoords?.lng || null
        }}
        onConfirm={(confirmed, isManual, mapCoords) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('last_city', confirmed.city || "");
            localStorage.setItem('last_area', confirmed.area || "");
            localStorage.setItem('last_pincode', confirmed.pincode || "");
          }
          
          if (mapCoords && mapCoords.lat && mapCoords.lng) {
            dispatch(setUserCoords({ lat: mapCoords.lat, lng: mapCoords.lng }));
          }

          let sub = confirmed.area ? `${confirmed.area}, ${confirmed.city}` : confirmed.city;
          if (confirmed.pincode) sub += ` ${confirmed.pincode}`;
          setLocalSubtitle(sub);
          
          // Re-fetch using new location context
          dispatch(fetchSearchResults(parsed));
        }}
      />
    </div>
  );
}
