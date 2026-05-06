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
  CheckCircle2,
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
} from "lucide-react";
import { slugify } from "@/lib/slugify";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/Search/SmartSearch";

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
        const savedCity =
          typeof window !== "undefined"
            ? localStorage.getItem("last_city")
            : "";
        const savedArea =
          typeof window !== "undefined"
            ? localStorage.getItem("last_area")
            : "";

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
            // Filter by location if available
            let filtered = allShops;
            if (savedCity) {
              const cityShops = allShops.filter((s) =>
                (s.city || "").toLowerCase().includes(savedCity.toLowerCase()),
              );
              if (cityShops.length > 0) {
                filtered = cityShops;
                // Further filter by area if possible
                if (savedArea) {
                  const areaShops = cityShops.filter((s) =>
                    (s.area || "")
                      .toLowerCase()
                      .includes(savedArea.toLowerCase()),
                  );
                  if (areaShops.length > 0) filtered = areaShops;
                }
              }
            }

            const random =
              filtered[Math.floor(Math.random() * filtered.length)];
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
    <div className="flex flex-col min-h-screen bg-[#FAFAF8] overflow-x-hidden selection:bg-[#FF6A00]/20 selection:text-[#FF6A00]">
      <Navbar />

      {/* ── HERO SECTION (DARK PREMIUM) ─────────────────────────── */}
      <section className="relative min-h-screen pt-24 pb-10 lg:pt-28 lg:pb-32 overflow-hidden bg-[#020617]">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#FF6A00]/10 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#FF6A00]/5 rounded-full blur-[100px] animate-pulse-glow delay-1000" />
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[80px] animate-float" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-12  xl:pt-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-4 md:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto lg:mx-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">
                  1000+ Premium Shops Online
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-[32px] xs:text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-black text-white leading-[1.1] lg:leading-[1] tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                  Your business,
                  <br />
                  <span className="text-gradient">redefined online.</span>
                </h1>
                <p className="text-[14px] md:text-[16px] lg:text-[18px] text-white/40 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 px-2 sm:px-0">
                  Launch a professional digital presence in 5 minutes. No
                  coding, zero commission, direct WhatsApp connections.
                </p>
              </div>

              <div className={`max-w-lg mx-auto lg:mx-0 transition-all duration-300 ${searchFocused ? "static" : "relative z-30 animate-in fade-in slide-in-from-bottom-10 duration-1000"}`}>
                <div className={searchFocused ? "" : "glass-dark p-1 rounded-2xl glow-orange"}>
                  <SmartSearch onFocusStateChange={setSearchFocused} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <Link href={`/${currentCity}`} className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="w-full sm:w-auto shadow-xl shadow-[#FF6A00]/10 h-12 md:h-14 rounded-xl px-6 md:px-8 text-[14px] md:text-[15px]"
                  >
                    Explore Marketplace
                  </Button>
                </Link>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#020617] bg-[#1A1F36] flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                          alt="user"
                        />
                      </div>
                    ))}
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#020617] bg-[#FF6A00] flex items-center justify-center text-[10px] md:text-[11px] font-black text-white">
                      +1k
                    </div>
                  </div>
                  <p className="text-[11px] md:text-[13px] font-bold text-white/30 uppercase tracking-widest whitespace-nowrap">
                    Joined this month
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Premium Card/Device Mockup */}
            <div className="relative hidden lg:block animate-in zoom-in-95 duration-1000">
              <div className="absolute inset-0 bg-[#FF6A00]/20 rounded-[40px] blur-[80px] animate-rotate-slow opacity-30" />
              <Link
                href={featuredShop ? `/shop/${featuredShop.slug}` : "/explore"}
                className="block cursor-pointer"
              >
                <div className="relative glass-dark p-1 border-white/20 rounded-[32px] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] group">
                  <div className="bg-[#1A1F36] rounded-[30px] p-8">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#FF9A3C] flex items-center justify-center text-white font-black text-2xl shadow-lg uppercase">
                          {featuredShop?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">
                            {featuredShop?.name || "Sharma Organics"}
                          </h3>
                          <p className="text-white/40 text-sm font-bold flex items-center gap-1">
                            <MapPin size={12} />{" "}
                            {featuredShop?.area ? `${featuredShop.area}, ` : ""}
                            {featuredShop?.city || "Ahmedabad"}, India
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${featuredShop?.isVerified ? "text-blue-400" : "text-gray-600"}`}
                      >
                        <ShieldCheck size={20} />
                      </div>
                    </div>

                    <div className="space-y-4 mb-10">
                      {(featuredShop?.products?.length > 0
                        ? featuredShop.products.slice(0, 3)
                        : [
                            { name: "Premium Almonds", price: "₹850" },
                            { name: "Organic Honey", price: "₹450" },
                            { name: "Saffron Spices", price: "₹1,200" },
                          ]
                      ).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors"
                        >
                          <span className="text-white/70 font-bold">
                            {item.name}
                          </span>
                          <span className="text-[#FF6A00] font-black">
                            {item.price.toString().startsWith("₹")
                              ? item.price
                              : `₹${item.price}`}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(
                            `https://wa.me/${featuredShop?.whatsapp || featuredShop?.phone || ""}`,
                            "_blank",
                          );
                        }}
                        className="h-14 rounded-2xl bg-[#25D366] flex items-center justify-center gap-2 font-black text-white shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] transition-transform"
                      >
                        <MessageSquare size={18} /> WhatsApp
                      </div>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `tel:${featuredShop?.phone || ""}`;
                        }}
                        className="h-14 rounded-2xl bg-white/10 flex items-center justify-center gap-2 font-black text-white hover:bg-white/20 transition-colors hover:scale-[1.02] transition-transform"
                      >
                        <Phone size={18} /> Contact
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Stats Overlay */}
              <div className="absolute -bottom-6 -left-12 glass-dark p-6 rounded-[24px] border border-white/10 shadow-2xl animate-float">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                      Local Reach
                    </p>
                    <p className="text-2xl font-black text-white">
                      +
                      {featuredShop?.avgRating
                        ? (featuredShop.avgRating * 25).toFixed(0)
                        : "148"}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER SECTION (SOCIAL PROOF) ─────────────────────── */}
      <section className="py-10 bg-white border-y border-black/[0.05] overflow-hidden whitespace-nowrap">
        <div className="flex animate-ticker items-center">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-16 pr-16">
              {[
                "Kirana Store",
                "Bakery",
                "Clothing",
                "Electronics",
                "Jewellery",
                "Restaurant",
                "Salon",
                "Pharma",
                "Hardware",
                "Electrical",
              ].map((cat) => (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF6A00]" />
                  <span className="text-[16px] font-black text-[#1A1F36]/30 uppercase tracking-widest">
                    {cat}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUE PROPOSITION ──────────────────────────────────── */}
      <section className="py-32 bg-[#FAFAF8] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-[#FF6A00] font-black text-[13px] uppercase tracking-[0.25em] mb-4">
              Why Choose {BRAND}
            </p>
            <h2 className="text-[40px] md:text-[56px] font-black text-[#1A1F36] leading-tight tracking-tighter">
              Stop waiting,{" "}
              <span className="text-gradient">start growing.</span>
            </h2>
            <p className="mt-6 text-lg text-[#1A1F36]/50 font-medium">
              We've stripped away the complexity of traditional e-commerce to
              give local businesses the tools they actually need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Launch",
                desc: "Go live in less than 5 minutes. No domains, no hosting, no technical headaches.",
                color: "orange",
              },
              {
                icon: Globe,
                title: "SEO Optimized",
                desc: "Every shop page is server-rendered for peak performance and Google rankings.",
                color: "blue",
              },
              {
                icon: MessageSquare,
                title: "WhatsApp Integrated",
                desc: "Receive orders directly where you talk to customers. Zero middleman commission.",
                color: "emerald",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-10 rounded-[32px] bg-white border border-black/[0.03] hover:border-[#FF6A00]/20 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-[#FF6A00]/5"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#FAFAF8] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#FF6A00] group-hover:text-white transition-all duration-500">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-[#1A1F36] mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[#1A1F36]/50 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ──────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-[#1A1F36] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF6A00]/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-24 text-center">
            {[
              { label: "Active Shops", value: "1.2k+" },
              { label: "Monthly Visits", value: "450k" },
              { label: "Cities covered", value: "50+" },
              { label: "WhatsApp Leads", value: "85k" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-[36px] sm:text-[48px] md:text-[64px] font-black text-white tracking-tighter leading-tight">
                  {stat.value}
                </p>
                <p className="text-[9px] md:text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS SECTION (PREMIUM) ─────────────────────────── */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-10 md:space-y-12">
              <div className="text-center lg:text-left">
                <p className="text-[#FF6A00] font-black text-[12px] md:text-[13px] uppercase tracking-[0.25em] mb-4">
                  The Process
                </p>
                <h2 className="text-[32px] md:text-[48px] lg:text-[56px] font-black text-[#1A1F36] leading-[1.1] tracking-tighter">
                  Simple for you, <br className="hidden sm:block" />
                  <span className="text-gradient">powerful for business.</span>
                </h2>
              </div>

              <div className="space-y-8 md:space-y-10">
                {[
                  {
                    n: "01",
                    title: "List Your Shop",
                    desc: "Enter your basic business details and location.",
                  },
                  {
                    n: "02",
                    title: "Add Products",
                    desc: "Upload your catalog with prices and high-quality photos.",
                  },
                  {
                    n: "03",
                    title: "Receive Leads",
                    desc: "Get direct WhatsApp enquiries from local customers.",
                  },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-5 md:gap-6 group">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#FAFAF8] border border-black/[0.05] flex items-center justify-center font-black text-[#1A1F36] group-hover:bg-[#FF6A00] group-hover:text-white transition-all duration-300 text-sm md:text-base">
                      {step.n}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-[#1A1F36] mb-1 md:mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[14px] md:text-base text-[#1A1F36]/50 font-medium leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center lg:text-left">
                <Button
                  variant="dark"
                  size="xl"
                  className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl shadow-xl"
                  onClick={() => router.push("/create")}
                >
                  Start Listing Now
                </Button>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#FF6A00]/5 rounded-full blur-[100px]" />
              <div className="relative rounded-[32px] md:rounded-[40px] overflow-hidden border border-black/[0.05] shadow-2xl shadow-black/5">
                <img
                  src="https://images.unsplash.com/photo-1556740734-7f95837d053d?q=80&w=2070&auto=format&fit=crop"
                  alt="Shop management"
                  className="w-full h-full object-cover aspect-[4/5] sm:aspect-video lg:aspect-[4/5] scale-110 hover:scale-100 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F36]/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 p-5 md:p-8 glass rounded-[24px] md:rounded-[32px] border-white/20">
                  <div className="flex items-center gap-3 md:gap-4 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#FF6A00] flex items-center justify-center text-white">
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[11px] md:text-sm font-black text-[#1A1F36] uppercase tracking-widest">
                        Real-time Analytics
                      </p>
                      <p className="text-[10px] md:text-[12px] font-bold text-[#1A1F36]/50">
                        Updated 2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 md:h-2 w-full bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF6A00] w-[75%] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="px-5 md:px-12 py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto rounded-[32px] md:rounded-[48px] bg-[#020617] p-8 sm:p-16 md:p-32 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-[#FF6A00]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-[100px]" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-8 md:space-y-10">
            <div className="space-y-4">
              <h2 className="text-[36px] sm:text-[48px] md:text-[72px] font-black text-white leading-tight tracking-tighter">
                Take your shop <br className="hidden sm:block" />
                <span className="text-gradient">to the next level.</span>
              </h2>
              <p className="text-base md:text-xl text-white/40 font-medium">
                Join thousands of businesses across Bharat.{" "}
                <br className="hidden sm:block" />
                Launch your professional shop page for free today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Button
                variant="primary"
                size="xl"
                className="w-full sm:w-auto h-16 md:h-20 px-10 md:px-12 rounded-2xl md:rounded-3xl text-lg md:text-xl shadow-[0_20px_40px_-10px_rgba(255,106,0,0.4)] glow-orange"
                onClick={() => router.push("/create")}
              >
                Get Started Free
              </Button>
              <Button
                variant="secondary"
                size="xl"
                className="w-full sm:w-auto h-16 md:h-20 px-10 md:px-12 rounded-2xl md:rounded-3xl text-lg md:text-xl transition-all"
              >
                How it Works
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-4 md:pt-8">
              {[
                { icon: Shield, label: "Secure Data" },
                { icon: Rocket, label: "Fast Loading" },
                { icon: Sparkles, label: "AI Powered" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-white/30"
                >
                  <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-widest">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
