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

  useEffect(() => {
    const hydrate = async () => {
      // Sync Redux with parsed slug
      dispatch(setParsed(parsed));
      dispatch(setQuery(slug.replace(/-/g, " ")));
      
      // Fetch data
      await Promise.all([
        dispatch(fetchApprovedShops()),
        dispatch(fetchCategories())
      ]);
      
      dispatch(fetchSearchResults(parsed));
    };
    hydrate();
  }, [slug, parsed, dispatch]);

  const displayTitle = slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      
      <div className="bg-white border-b border-[#1A1F36]/[0.06] py-12 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h2 className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.2em]">Smart Discovery</h2>
          <SmartSearch />
        </div>
      </div>

      <DiscoveryView title={displayTitle} />
    </div>
  );
}
