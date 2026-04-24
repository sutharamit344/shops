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
import { AlertCircle } from "lucide-react";

/**
 * Universal Fallback Router (not-found.js)
 * Catches all unknown routes in development (Local) and production (Firebase 404).
 * This is essential for 'output: export' to handle dynamic content without full rebuilds.
 */
export default function NotFound() {
  const pathname = usePathname();
  const pathParts = (pathname || "").split("/").filter(Boolean);

  const [data, setData] = useState(null);
  const [view, setView] = useState(null); // 'shop', 'category', 'loading', '404', 'error'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [ratings, setRatings] = useState([]);

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
            document.title = `${shop.name} | ShopSetu`;
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
            document.title = `Best Shops in ${slug} | ShopSetu`;
          } else {
            // Try Shop Profile
            const shop = await getShopBySlug(slug, isPreview);
            if (shop) {
              setData(shop);
              setView("shop");
              document.title = `${shop.name} | ShopSetu`;
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
              ? `Best ${slug} in ${city} | ShopSetu`
              : `Shops in ${slug}, ${city} | ShopSetu`;
          } else {
            // Try Shop Profile (using the second part as slug)
            const shop = await getShopBySlug(slug, isPreview);
            if (shop) {
              setData(shop);
              setView("shop");
              document.title = `${shop.name} | ShopSetu`;
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
            document.title = `${shop.name} - ${shop.category} in ${shop.city} | ShopSetu`;
            const recentRatings = await getShopRatings(shop.id);
            setRatings(recentRatings);
          } else {
            // Priority 2: Zone Listing
            const shops = await getShopsByZoneInArea(city, area, slugOrZone);
            if (shops.length > 0) {
              setData({ city, area, label: slugOrZone, shops, type: 'zone' });
              setView("listing");
              document.title = `${slugOrZone} in ${area}, ${city} | ShopSetu`;
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
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <Navbar />
      <div className="text-center mt-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-4xl font-black text-navy mb-4 uppercase tracking-tighter">404 - Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">We couldn't find the shop or category you're looking for.</p>
        <div className="flex gap-4">
          <Link href="/"><Button variant="outline">Back to Home</Button></Link>
        </div>
      </div>
    </div>
  );
}
