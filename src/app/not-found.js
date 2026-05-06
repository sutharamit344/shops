"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  getShopBySlug,
  getShopRatings,
} from "@/lib/db";
import ShopProfileClient from "@/components/Shop/ShopProfileClient";
import Navbar from "@/components/Navbar";
import Button from "@/components/UI/Button";
import ShopSkeleton from "@/components/Shop/Skeleton";
import { Store, MapPin, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/config";
import { slugify } from "@/lib/slugify";
import { parseDiscoveryPath } from "@/lib/urlArchitect";
import DiscoveryClient from "@/components/Search/DiscoveryClient";

/**
 * Universal Fallback Router (not-found.js)
 * Strictly handles:
 * 1. /[shop-slug] -> Direct shop profile
 * 2. /[city] -> City discovery
 * 3. /[city]/[category] -> Category discovery
 * 4. /[city]/[area] -> Area discovery
 * 5. /[city]/[area]/[category] -> Deep discovery
 */
export default function NotFound() {
  const pathname = usePathname();
  const pathParts = (pathname || "").split("/").filter(Boolean);

  const [data, setData] = useState(null);
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const route = async () => {
      if (!pathname || pathname.includes(".") || pathname.startsWith("/_next")) {
        setView("404");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 1. Direct Shop Check (/shop/[slug] or /[slug])
        const firstSegment = decodeURIComponent(pathParts[0] || "");
        const secondSegment = decodeURIComponent(pathParts[1] || "");
        
        if (firstSegment === 'shop' && secondSegment) {
          const shop = await getShopBySlug(secondSegment, true);
          if (shop) {
            setData(shop);
            setView("shop");
            const recentRatings = await getShopRatings(shop.id);
            setRatings(recentRatings);
            setLoading(false);
            return;
          }
        }

        // 2. Hierarchical Discovery Check
        let parsed = null;
        if (pathParts.length === 1) {
          parsed = parseDiscoveryPath({ slug: firstSegment });
        } else if (pathParts.length === 2) {
          parsed = parseDiscoveryPath({ city: firstSegment, category: secondSegment });
        } else if (pathParts.length === 3) {
          parsed = parseDiscoveryPath({ city: firstSegment, area: secondSegment, category: decodeURIComponent(pathParts[2]) });
        }

        if (parsed) {
          // Double check if single segment is a shop (legacy compatibility)
          if (pathParts.length === 1) {
            const shop = await getShopBySlug(firstSegment);
            if (shop) {
              setData(shop);
              setView("shop");
              const r = await getShopRatings(shop.id);
              setRatings(r);
              setLoading(false);
              return;
            }
          }
          
          setData({ slug: pathname.substring(1), parsed });
          setView("discovery");
          setLoading(false);
          return;
        }

        setView("404");
      } catch (error) {
        console.error("Router Error:", error);
        setView("404");
      }
      setLoading(false);
    };

    route();
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-32">
          <ShopSkeleton />
        </div>
      </div>
    );
  }

  if (view === "discovery" && data) {
    return <DiscoveryClient slug={data.slug} parsed={data.parsed} />;
  }

  if (view === "shop" && data) {
    return <ShopProfileClient shop={data} initialRatings={ratings} />;
  }

  // Final 404 UI
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        <div className="w-24 h-24 bg-[#FF6A00]/10 rounded-[32px] flex items-center justify-center mb-8">
          <Store size={44} className="text-[#FF6A00]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#1A1F36] mb-4 tracking-tight italic">Page Not Found</h1>
        <p className="text-[17px] text-gray-400 font-medium mb-10 max-w-md">
          The location or shop you're looking for doesn't seem to exist in our marketplace.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/">
            <Button className="h-12 px-8 rounded-2xl bg-[#1A1F36] text-white font-bold hover:shadow-xl transition-all">Back to Home</Button>
          </Link>
          <Link href="/explore-nearby">
            <Button variant="outline" className="h-12 px-8 rounded-2xl border-black/[0.1] font-bold">Discover Shops</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
