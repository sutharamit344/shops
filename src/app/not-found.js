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
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col selection:bg-[#FF6A00]/10">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 text-center">
        <div className="w-20 h-20 bg-black/[0.03] border border-black/[0.05] rounded-2xl flex items-center justify-center mb-8 shadow-sm">
          <Store size={32} className="text-[#0A0A0F]/20" />
        </div>
        <h1 className="text-[32px] md:text-[48px] font-bold text-[#0A0A0F] mb-3 tracking-tight">Location not found</h1>
        <p className="text-[15px] text-[#0A0A0F]/45 font-medium mb-10 max-w-sm">
          The business or discovery path you're requesting is not active on the ShopBajar network.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/">
            <Button variant="dark" size="lg" className="px-8 shadow-xl">Return Home</Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="lg" className="px-8">Discovery Engine</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
