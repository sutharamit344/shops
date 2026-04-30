"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  getShopBySlug,
  getShopsByCity,
  getShopsByCityAndCategory,
  getShopsByCityAndArea,
  getShopsByZoneInArea,
  getShopRatings,
} from "@/lib/db";
import ShopProfileClient from "@/components/Shop/ShopProfileClient";
import ListingLayout from "@/components/Shop/ListingLayout";
import Navbar from "@/components/Navbar";
import Button from "@/components/UI/Button";
import ShopSkeleton from "@/components/Shop/Skeleton";
import { AlertCircle, Store, MapPin, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/config";
import { slugify } from "@/lib/slugify";

/**
 * Universal Fallback Router (not-found.js)
 * Catches all unknown routes in development (Local) and production (Firebase 404).
 * This is essential for 'output: export' to handle dynamic content without full rebuilds.
 */
export default function NotFound() {
  const pathname = usePathname();
  const pathParts = (pathname || "").split("/").filter(Boolean);

  const [data, setData] = useState(null);
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [ratings, setRatings] = useState([]);
  const [suggestedShops, setSuggestedShops] = useState([]);

  useEffect(() => {
    const route = async () => {
      if (!pathname || pathname.includes(".") || pathname.startsWith("/_next")) {
        setView("404");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg("");

      try {
        const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=true");

        // Case 0: Direct Shop Link (/shop/[slug])
        if (pathParts[0] === 'shop' && pathParts[1]) {
          const slug = decodeURIComponent(pathParts[1]);
          const shop = await getShopBySlug(slug, true); // Allow hidden for direct links
          if (shop) {
            setData(shop);
            setView("shop");
            document.title = `${shop.name} | ${BRAND}`;
            const recentRatings = await getShopRatings(shop.id);
            setRatings(recentRatings);
            setLoading(false);
            return;
          }
        }

        // Case 1: City Listing (/[city]) or Shop Profile (/[slug])
        if (pathParts.length === 1) {
          const slug = decodeURIComponent(pathParts[0]);
          
          // Try City Listing first
          const shops = await getShopsByCity(slug);
          if (shops.length > 0) {
            setData({ city: slug, shops, type: 'city' });
            setView("listing");
            document.title = `Best Shops in ${slug} | ${BRAND}`;
          } else {
            // Try Shop Profile
            const shop = await getShopBySlug(slug, isPreview);
            if (shop) {
              setData(shop);
              setView("shop");
              document.title = `${shop.name} | ${BRAND}`;
              const recentRatings = await getShopRatings(shop.id);
              setRatings(recentRatings);
            } else {
              setView("404");
            }
          }
        }
        // Case 2: Category/Area Listing (/[city]/[slug]) or Shop Profile
        else if (pathParts.length === 2) {
          const city = decodeURIComponent(pathParts[0]);
          const slug = decodeURIComponent(pathParts[1]);
          
          // Try Category
          let shops = await getShopsByCityAndCategory(city, slug);
          let type = 'category';
          
          if (shops.length === 0) {
            // Try Area
            shops = await getShopsByCityAndArea(city, slug);
            type = 'area';
          }

          if (shops.length > 0) {
            setData({ city, label: slug, shops, type });
            setView("listing");
            document.title = type === 'category' 
              ? `Best ${slug} in ${city} | ${BRAND}`
              : `Shops in ${slug}, ${city} | ${BRAND}`;
          } else {
            // Try Shop Profile (using the second part as slug)
            const shop = await getShopBySlug(slug, isPreview);
            if (shop) {
              setData(shop);
              setView("shop");
              document.title = `${shop.name} | ${BRAND}`;
              const recentRatings = await getShopRatings(shop.id);
              setRatings(recentRatings);
            } else {
              setView("404");
            }
          }
        }
        // Case 3: Shop Profile or Zone Listing (/[city]/[area]/[slug_or_zone])
        else if (pathParts.length >= 3) {
          const city = decodeURIComponent(pathParts[0]);
          const area = decodeURIComponent(pathParts[1]);
          const slugOrZone = decodeURIComponent(pathParts[2]);

          // Priority 1: Shop Profile (usually at index 2 or 3)
          const shop = await getShopBySlug(slugOrZone, isPreview);
          if (shop) {
            setData(shop);
            setView("shop");
            document.title = `${shop.name} - ${shop.category} in ${shop.city} | ${BRAND}`;
            const recentRatings = await getShopRatings(shop.id);
            setRatings(recentRatings);
          } else {
            // Priority 2: Zone Listing
            const shops = await getShopsByZoneInArea(city, area, slugOrZone);
            if (shops.length > 0) {
              setData({ city, area, label: slugOrZone, shops, type: 'zone' });
              setView("listing");
              document.title = `${slugOrZone} in ${area}, ${city} | ${BRAND}`;
            } else {
              setView("404");
            }
          }
        } else {
          setView("404");
        }
      } catch (error) {
        console.error("Router Error:", error);
        setErrorMsg("An unexpected error occurred while loading this page.");
        setView("error");
      }
      setLoading(false);
    };

    route();
  }, [pathname]);

  // When hitting a real 404, try to load nearby shops from last visited city
  useEffect(() => {
    if (view !== "404") return;
    const lastCity = typeof window !== "undefined" ? localStorage.getItem("last_city") : null;
    if (!lastCity) return;
    getShopsByCity(lastCity).then(shops => {
      // Pick up to 3 random approved shops
      const approved = shops.filter(s => s.status === "approved");
      const shuffled = approved.sort(() => Math.random() - 0.5).slice(0, 3);
      setSuggestedShops(shuffled);
    }).catch(() => {});
  }, [view]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 pt-24">
          <ShopSkeleton />
        </div>
      </div>
    );
  }

  if (view === "shop" && data) {
    return <ShopProfileClient shop={data} initialRatings={ratings} />;
  }

  if (view === "listing" && data) {
    return (
      <ListingLayout 
        shops={data.shops} 
        title={data.type === 'city' ? `Discover ${data.city}` : (data.type === 'category' ? `Best ${data.label}` : `Explore ${data.label}`)}
        subtitle={data.type === 'city' ? "The heart of local commerce" : (data.type === 'category' ? `Top-rated in ${data.city}` : `Local favorites in ${data.city}`)}
        city={data.city}
        type={data.type}
      />
    );
  }

  if (view === "error") {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-navy mb-4">Connection Error</h1>
          <p className="text-gray-600 mb-8">{errorMsg}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </main>
      </div>
    );
  }

  // Final 404
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16">
        {/* Error Icon */}
        <div className="w-24 h-24 bg-[#FF6B35]/10 rounded-3xl flex items-center justify-center mb-6">
          <Store size={44} className="text-[#FF6B35]" />
        </div>
        <h1 className="text-4xl font-black text-[#1A1F36] mb-3 tracking-tight">Page Not Found</h1>
        <p className="text-[15px] text-[#666] mb-8 max-w-md text-center">
          We couldn't find the shop or page you're looking for. It may have moved or been removed.
        </p>
        <div className="flex gap-3 flex-wrap justify-center mb-16">
          <Link href="/explore">
            <Button variant="dark" className="h-11 px-6">Browse Marketplace</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="h-11 px-6">Back to Home</Button>
          </Link>
        </div>

        {/* Suggested Shops Recovery Section */}
        {suggestedShops.length > 0 && (
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={16} className="text-[#FF6B35]" />
              <h2 className="text-[14px] font-bold text-[#1A1F36]">You might like these nearby</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {suggestedShops.map(shop => (
                <Link
                  key={shop.id}
                  href={`/shop/${slugify(shop.slug)}`}
                  className="bg-white rounded-2xl border border-[#1A1F36]/[0.06] p-4 flex items-center gap-4 hover:border-[#FF6B35]/30 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0 text-[#FF6B35] font-bold text-lg overflow-hidden">
                    {shop.logo
                      ? <img src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                      : shop.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#1A1F36] truncate">{shop.name}</p>
                    <p className="text-[11px] text-[#999] truncate">{shop.category}</p>
                  </div>
                  <ArrowRight size={14} className="text-[#ccc] group-hover:text-[#FF6B35] flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
