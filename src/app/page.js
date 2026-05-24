"use client";

import React, { useState, useEffect } from "react";
import { BRAND } from "@/lib/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Store,
  MessageSquare,
  Globe,
  ArrowRight,
  CircleCheckBig,
  Search,
  Zap,
  ShieldCheck,
  TrendingUp,
  Star,
  Navigation,
  MapPin,
  ChevronRight,
  Phone,
  Award,
  Sparkles,
  Rocket,
  Shield,
  Layout,
  BarChart3,
  Layers,
} from "lucide-react";
import { slugify } from "@/lib/slugify";
import Button from "@/components/UI/Button";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/Search/SmartSearch";
import CategoryGrid from "@/components/Home/CategoryGrid";

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [featuredShop, setFeaturedShop] = useState(null);
  const [currentCity, setCurrentCity] = useState("ahmedabad");
  const [currentArea, setCurrentArea] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("last_city");
      const savedArea = localStorage.getItem("last_area");
      if (savedCity) setCurrentCity(slugify(savedCity));
      if (savedArea) setCurrentArea(slugify(savedArea));
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const savedCity = typeof window !== "undefined" ? localStorage.getItem("last_city") : "";
        const savedArea = typeof window !== "undefined" ? localStorage.getItem("last_area") : "";

        const [catsRes, shopsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/shops"),
        ]);

        if (catsRes.ok) {
          const cats = await catsRes.json();
          setCategories(cats);
        }

        if (shopsRes.ok) {
          const allShops = await shopsRes.json();
          setShops(allShops);

          if (allShops.length > 0) {
            let filtered = allShops;
            if (savedCity) {
              const cityShops = allShops.filter((s) => (s.city || "").toLowerCase().includes(savedCity.toLowerCase()));
              if (cityShops.length > 0) {
                filtered = cityShops;
                if (savedArea) {
                  const areaShops = cityShops.filter((s) => (s.area || "").toLowerCase().includes(savedArea.toLowerCase()));
                  if (areaShops.length > 0) filtered = areaShops;
                }
              }
            }
            const random = filtered[Math.floor(Math.random() * filtered.length)];
            setFeaturedShop(random);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F7F5] overflow-x-hidden selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <Navbar />

      {/* ── HERO SECTION (CLEAN CLOUD STYLE) ─────────────────────────── */}
      <section className="relative pt-[100px] pb-16 lg:pt-[120px] lg:pb-24 overflow-hidden bg-[#0A0A0F]">
        <div className="absolute inset-0 dot-grid opacity-[0.15]" />

        {/* Subtle Ambient Glow — top-right only */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FF6A00]/8 rounded-full blur-[120px] -mr-[10%] -mt-[10%] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center gap-12 lg:gap-16">

            {/* Top Content */}
            <div className="w-full space-y-8 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 animate-in fade-in duration-500">
                <div className="w-1 h-1 rounded-full bg-[#FF6A00] shadow-[0_0_8px_#FF6A00]" />
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em]">
                  Hyperlocal Marketplace
                </span>
              </div>

              <div className="space-y-3.5">
                <h1 className="text-[32px] md:text-[52px] lg:text-[64px] font-bold text-white leading-[1.05] tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                  Take Your Local Business <br />
                  <span className="text-gradient">Online. Seamlessly.</span>
                </h1>
                <p className="text-[14px] md:text-[17px] text-white/40 leading-relaxed max-w-xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  Join thousands of retailers, wholesalers, and small businesses growing their revenue with ShopBajar. Build your digital storefront, manage your catalog, and connect via WhatsApp.
                </p>
              </div>

              {/* Search Integration */}
              <div className="max-w-xl mx-auto relative z-30 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="p-1 rounded-md bg-white/[0.03] border border-white/[0.08] shadow-2xl">
                  <SmartSearch onFocusStateChange={setSearchFocused} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <Link href={`/${currentCity}`}>
                  <Button variant="primary" size="md" className="px-7 font-bold h-10">
                    Explore Marketplace
                  </Button>
                </Link>
                <div className="flex items-center gap-3 pl-2">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-7 h-7 rounded-full border border-[#0A0A0F] bg-zinc-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} alt="u" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                    Verified Network
                  </p>
                </div>
              </div>
            </div>



          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ─────────────────────────────────────────── */}
      <CategoryGrid categories={categories} currentCity={currentCity} />

      {/* ── VALUE PROPOSITION ─────────────────────────── */}
      <section className="py-12 bg-[#F7F7F5] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <p className="text-[#FF6A00] font-bold text-[10px] uppercase tracking-[0.2em] mb-2.5">
              The Platform
            </p>
            <h2 className="text-[26px] md:text-[36px] font-bold text-[#0A0A0F] tracking-tight leading-tight">
              Purpose-built for <br />
              <span className="text-gradient">high-performance</span> local commerce.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Zap,
                title: "Instant Setup",
                desc: "Go live in minutes. No domains, no hosting, zero technical setup required.",
                color: "bg-[#FF6A00]/5 text-[#FF6A00]",
              },
              {
                icon: BarChart3,
                title: "Local SEO Engine",
                desc: "Pre-indexed pages designed to rank at the top of local Google searches.",
                color: "bg-blue-500/5 text-blue-600",
              },
              {
                icon: MessageSquare,
                title: "Direct Access",
                desc: "Connect with customers via WhatsApp. Zero middleman, zero commission.",
                color: "bg-emerald-500/5 text-emerald-600",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-5 rounded-md bg-white border border-black/[0.05] hover:border-black/[0.1] transition-all duration-300 hover:shadow-sm"
              >
                <div className={`w-9 h-9 rounded-md ${feature.color} flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform`}>
                  <feature.icon size={16} />
                </div>
                <h3 className="text-[14px] font-bold text-[#0A0A0F] mb-1.5 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[12px] text-[#0A0A0F]/45 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS (COMPACT) ────────────────────────────────────────── */}
      <section className="py-16 bg-[#0A0A0F] border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Verified Shops", value: "1.2k+" },
              { label: "Market Reach", value: "450k+" },
              { label: "Cities", value: "50+" },
              { label: "Transactions", value: "85k" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1 text-center lg:text-left">
                <p className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="py-12 px-4 md:px-6 bg-[#F7F7F5]">
        <div className="max-w-5xl mx-auto rounded-md bg-[#0A0A0F] p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-[0.1]" />
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FF6A00]/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="space-y-2.5">
              <h2 className="text-[26px] md:text-[38px] font-bold text-white tracking-tight leading-tight">
                Scale your shop <br />
                <span className="text-gradient">with intelligence.</span>
              </h2>
              <p className="text-[13px] text-white/40 max-w-lg mx-auto font-medium leading-relaxed">
                Join the network of top-tier local businesses.
                Start building your professional digital presence today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 font-bold"
                onClick={() => router.push("/create")}
              >
                Get Started Free
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto px-8 font-bold text-white/50 hover:text-white"
              >
                Book a Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-2">
              {[
                { icon: Shield, label: "Enterprise Grade" },
                { icon: Rocket, label: "SEO Optimized" },
                { icon: Sparkles, label: "AI Ready" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/20">
                  <item.icon size={11} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
