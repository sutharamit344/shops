"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setParsed, setQuery } from "@/redux/slices/searchSlice";
import { fetchSearchResults } from "@/redux/thunks/searchThunks";
import { fetchApprovedShops } from "@/redux/thunks/shopThunks";
import { fetchCategories } from "@/redux/thunks/categoryThunks";
import DiscoveryView from "@/components/Search/DiscoveryView";
import SmartSearch from "@/components/Search/SmartSearch";
import Navbar from "@/components/Navbar";

export default function DiscoveryClient({ slug, parsed }) {
  const dispatch = useDispatch();
  const [localTitle, setLocalTitle] = React.useState("");
  const [localSubtitle, setLocalSubtitle] = React.useState("");

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
      if (lastArea && lastCity) {
        setLocalSubtitle(`${lastArea} ${lastCity}`);
      } else if (lastCity) {
        setLocalSubtitle(lastCity);
      }

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

      <DiscoveryView title={localTitle || "Shops"} subtitle={localSubtitle} />
    </div>
  );
}
