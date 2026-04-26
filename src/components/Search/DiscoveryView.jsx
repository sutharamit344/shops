"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import ShopCard from "@/components/Shop/ShopCard";
import ClusterSlider from "@/components/Shop/ClusterSlider";
import { getClusters } from "@/lib/db";
import {
  ChevronDown, LayoutGrid, List, Search, RotateCcw, MapPin
} from "lucide-react";
import Button from "@/components/UI/Button";
import { setSearch } from "@/redux/slices/filterSlice";
import { generateDiscoveryUrl } from "@/lib/urlArchitect";

const DiscoveryView = ({ title, subtitle }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { results: filteredShops, loading: shopsLoading, parsed } = useSelector((state) => state.search);
  const { items: allShops } = useSelector((state) => state.shops);
  const [clusters, setClusters] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchClusters = async () => {
      const data = await getClusters();
      setClusters(data);
    };
    fetchClusters();
  }, []);

  const handleClusterClick = (clusterName) => {
    // Generate clean URL based on cluster and current location
    const url = generateDiscoveryUrl("", parsed?.location, "all", clusterName);
    router.push(url);
  };

  useEffect(() => {
    setVisibleCount(6);
  }, [filteredShops]);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-22">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.12em] mb-2">Verified Businesses</p>
          <h1 className="text-2xl md:text-4xl font-bold text-[#1A1F36] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <div className="flex items-center gap-1.5 mt-2 text-[#FF6B35] font-semibold text-[13px]">
              <MapPin size={14} />
              <span>{subtitle}</span>
            </div>
          )}
          <p className="text-[15px] text-[#1A1F36]/50 mt-1">
            {shopsLoading ? "Discovering local businesses..." : `${filteredShops.length} certified business${filteredShops.length !== 1 ? "es" : ""} found`}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1 p-1 bg-[#1A1F36]/[0.03] rounded-xl flex-shrink-0">
          {[
            { mode: "grid", icon: LayoutGrid },
            { mode: "list", icon: List },
          ].map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === mode ? "bg-[#1A1F36] text-white shadow-sm" : "text-[#1A1F36]/30 hover:text-[#1A1F36]/60"
                }`}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </header>

      {!shopsLoading && filteredShops.length > 0 && (
        <ClusterSlider
          clusters={clusters}
          shops={allShops}
          onClusterClick={handleClusterClick}
          parsed={parsed}
        />
      )}

      {shopsLoading ? (
        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1A1F36]/[0.06] p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100" />
                <div className="w-20 h-6 rounded-full bg-gray-100" />
              </div>
              <div className="w-3/4 h-5 rounded bg-gray-100 mb-3" />
              <div className="w-full h-10 rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      ) : filteredShops.length > 0 ? (
        <>
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            : "space-y-6 md:space-y-8"
          }>
            {filteredShops.slice(0, visibleCount).map((shop, i) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                viewMode={viewMode}
                index={i}
              />
            ))}
          </div>

          {visibleCount < filteredShops.length && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="px-12 py-6 text-[14px] font-bold border-2 hover:bg-[#1A1F36] hover:text-white transition-all shadow-lg hover:shadow-[#1A1F36]/20 group"
              >
                Show More Shops
                <ChevronDown size={18} className="ml-2 group-hover:translate-y-1 transition-transform" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-[#1A1F36]/[0.07] py-24 px-6 flex flex-col items-center text-center gap-5 max-w-2xl mx-auto shadow-md">
          <div className="w-20 h-20 rounded-3xl bg-[#FAFAF8] flex items-center justify-center text-[#1A1F36]/10">
            <Search size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1A1F36] mb-1">No matching shops found</h3>
            <p className="text-[15px] text-[#1A1F36]/40">Try adjusting your search to see more results.</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default DiscoveryView;
