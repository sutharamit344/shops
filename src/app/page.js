"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getCategories } from "@/lib/db";
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
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories();
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(
      query.trim()
        ? `/explore?q=${encodeURIComponent(query.trim())}`
        : "/explore",
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF8] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-center">
          {/* Left copy */}
          <div className="space-y-8 max-w-2xl">
            <h1 className="text-[52px] md:text-[72px] font-bold text-[#0F0F0F] leading-[0.95] tracking-[-0.03em]">
              Your local shop,
              <br />
              <span className="text-[#FF6B35]">found online.</span>
            </h1>

            <p className="text-[17px] text-[#666] leading-relaxed max-w-lg font-normal">
              Create a Google-friendly page for your shop in 5 minutes. Get
              discovered and receive customers directly on WhatsApp — no website
              needed.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-black/10 shadow-sm max-w-lg"
            >
              <Search size={16} className="ml-3 text-[#999] flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shops, categories, cities..."
                className="flex-1 text-[14px] text-[#0F0F0F] placeholder:text-[#bbb] bg-transparent outline-none font-medium py-2"
              />
              <button
                type="submit"
                className="h-9 px-5 bg-[#0F0F0F] text-white text-[12px] font-semibold rounded-xl hover:bg-[#333] transition-all flex-shrink-0"
              >
                Explore
              </button>
            </form>

            <div className="flex items-center gap-4">
              <Link
                href="/explore?nearby=true"
                className="inline-flex items-center gap-2 px-6 h-12 bg-white border border-black/10 rounded-2xl text-[14px] font-bold text-[#0F0F0F] hover:border-[#FF6B35]/30 hover:bg-[#FF6B35]/[0.02] transition-all group shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
                  <Navigation
                    size={14}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </div>
                Find Shops Near Me
              </Link>
              <Link
                href="/explore"
                className="text-[13px] font-semibold text-[#666] hover:text-[#0F0F0F] hover:underline"
              >
                Browse all categories
              </Link>
            </div>

            {/* Trust tags */}
            <div className="flex items-center flex-wrap gap-5">
              {[
                "No coding needed",
                "Free forever",
                "SEO optimised",
                "WhatsApp ready",
              ].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#888]"
                >
                  <CheckCircle2 size={13} className="text-[#25D366]" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — shop card mockup */}
          <div className="relative hidden lg:block">
            {/* Glow */}
            <div className="absolute inset-0 bg-[#FF6B35]/8 rounded-3xl blur-3xl scale-110" />

            <div className="relative bg-white rounded-2xl border border-black/8 shadow-xl overflow-hidden">
              {/* Mock shop header */}
              <div className="h-1 bg-gradient-to-r from-[#FF6B35] to-[#FF9A72]" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F0F0F] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#0F0F0F]">
                        Sharma Kirana Store
                      </span>
                      <ShieldCheck size={13} className="text-[#FF6B35]" />
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-[#999]" />
                      <span className="text-[11px] text-[#999]">
                        Maninagar, Ahmedabad
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mock menu items */}
                {[
                  { name: "Atta — 5kg", price: "₹220" },
                  { name: "Basmati Rice — 5kg", price: "₹380" },
                  { name: "Toor Dal — 1kg", price: "₹135" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0"
                  >
                    <span className="text-[13px] font-medium text-[#333]">
                      {item.name}
                    </span>
                    <span className="text-[13px] font-bold text-[#FF6B35]">
                      {item.price}
                    </span>
                  </div>
                ))}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="h-10 bg-[#25D366] rounded-xl text-white text-[12px] font-semibold flex items-center justify-center gap-1.5">
                    <MessageSquare size={13} /> WhatsApp
                  </button>
                  <button className="h-10 bg-[#F5F5F3] rounded-xl text-[#0F0F0F] text-[12px] font-semibold">
                    Call Now
                  </button>
                </div>
              </div>
            </div>

            {/* Floating stat */}
            <div className="absolute -top-4 -right-4 bg-[#0F0F0F] text-white rounded-2xl px-4 py-3 shadow-lg">
              <div className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-0.5">
                This week
              </div>
              <div className="text-[22px] font-bold leading-none">
                +42 <span className="text-[#25D366] text-[14px]">leads</span>
              </div>
            </div>

            {/* Floating rating */}
            <div className="absolute -bottom-3 -left-4 bg-white border border-black/8 rounded-xl px-3 py-2 shadow-md flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={11}
                    className="text-[#FF6B35] fill-[#FF6B35]"
                  />
                ))}
              </div>
              <span className="text-[12px] font-semibold text-[#0F0F0F]">
                4.9
              </span>
              <span className="text-[11px] text-[#999]">· 124 reviews</span>
            </div>
          </div>
        </div>
      </section>
      {/* ── SOCIAL PROOF ───────────────────────────────── */}
      <section className="py-10 border-y border-black/[0.06] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Trust message with live indicator */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></div>
              <span className="text-[9px] font-medium text-[#666] uppercase tracking-wider">
                Trusted by 10,000+ shop owners
              </span>
            </div>
          </div>

          {/* Categories as interactive pills */}
          <div className="flex items-center justify-center flex-wrap gap-3">
            {(categories.length > 0
              ? categories
              : [
                  { name: "Kirana Store" },
                  { name: "Salon" },
                  { name: "Restaurant" },
                  { name: "Medical Store" },
                  { name: "Coaching" },
                  { name: "Hardware" },
                  { name: "Bakery" },
                  { name: "Mobile Repair" },
                ]
            ).map((cat) => (
              <Link
                key={cat.id || cat.name}
                href={`/category/${encodeURIComponent(cat.name)}`}
                className="px-4 py-2 bg-gray-50 hover:bg-white rounded-xl text-[12px] font-medium text-[#666] hover:text-[#FF6B35] border border-black/[0.06] hover:border-[#FF6B35]/30 transition-all cursor-pointer"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Simple stats */}
          <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-black/[0.06] text-center">
            <div>
              <div className="text-[18px] font-bold text-[#0F0F0F]">10K+</div>
              <div className="text-[9px] text-[#999]">Shops</div>
            </div>
            <div className="w-px h-6 bg-black/[0.06]"></div>
            <div>
              <div className="text-[18px] font-bold text-[#0F0F0F]">50+</div>
              <div className="text-[9px] text-[#999]">Cities</div>
            </div>
            <div className="w-px h-6 bg-black/[0.06]"></div>
            <div>
              <div className="text-[18px] font-bold text-[#0F0F0F]">4.9⭐</div>
              <div className="text-[9px] text-[#999]">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold text-[#FF6B35] uppercase tracking-widest mb-3">
              Platform features
            </p>
            <h2 className="text-[38px] md:text-[48px] font-bold text-[#0F0F0F] leading-[1] tracking-tight">
              Everything your shop
              <br />
              needs to grow online
            </h2>
          </div>
          <Link
            href="/create"
            className="flex-shrink-0 h-10 px-5 bg-[#0F0F0F] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors flex items-center gap-2"
          >
            Start free <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <Globe size={20} />,
              label: "Unique shop URL",
              desc: "Your shop gets a dedicated, shareable link — optimised for Google and perfect for your Instagram bio or WhatsApp status.",
              accent: "#FF6B35",
            },
            {
              icon: <Store size={20} />,
              label: "Products & services",
              desc: "Add your full menu or product list with photos, descriptions, and prices. Update anytime from your phone.",
              accent: "#0F0F0F",
            },
            {
              icon: <MessageSquare size={20} />,
              label: "Direct WhatsApp orders",
              desc: "Every enquiry lands straight in your WhatsApp. Zero commission, zero middlemen — just you and your customer.",
              accent: "#25D366",
            },
            {
              icon: <Search size={20} />,
              label: "Google SEO built-in",
              desc: "Each shop page is server-rendered with structured data, sitemaps, and city + category keywords baked in.",
              accent: "#4285F4",
            },
            {
              icon: <ShieldCheck size={20} />,
              label: "Verified badge",
              desc: "Our team reviews and verifies every listing, giving customers the trust signal they need to reach out.",
              accent: "#FF6B35",
            },
            {
              icon: <TrendingUp size={20} />,
              label: "Analytics & insights",
              desc: "See how many people viewed your page, clicked WhatsApp, or called you — so you know what's working.",
              accent: "#0F0F0F",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="group p-6 bg-white rounded-2xl border border-black/[0.07] hover:border-[#FF6B35]/30 hover:shadow-md transition-all duration-300 cursor-default"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                style={{ backgroundColor: f.accent + "15", color: f.accent }}
              >
                {f.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-[#0F0F0F] mb-2">
                {f.label}
              </h3>
              <p className="text-[13px] text-[#888] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="py-24 bg-[#0F0F0F] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-semibold text-[#FF6B35] uppercase tracking-widest mb-3">
              Process
            </p>
            <h2 className="text-[38px] md:text-[48px] font-bold leading-[1] tracking-tight">
              Go live in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-[1px] bg-white/10" />

            {[
              {
                n: "01",
                title: "Fill in your details",
                desc: "Name, category, city, phone number, and a short description of what you offer.",
              },
              {
                n: "02",
                title: "Add your products",
                desc: "List your menu items or services with prices. Upload photos for a better first impression.",
              },
              {
                n: "03",
                title: "Go live",
                desc: "We review and publish your page within 24 hours. Your shop appears on Google soon after.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.07] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35] text-[13px] font-bold mb-6">
                  {step.n}
                </div>
                <h3 className="text-[17px] font-semibold mb-3">{step.title}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 h-12 px-8 bg-[#FF6B35] text-white text-[14px] font-semibold rounded-xl hover:bg-[#e85c25] transition-colors"
            >
              Create your page — it's free <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ──────────────────────────────────────── */}
      {/* <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#FF6B35] uppercase tracking-widest mb-3">
              Categories
            </p>
            <h2 className="text-[32px] font-bold text-[#0F0F0F] leading-tight tracking-tight">
              Browse by type
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-[13px] font-semibold text-[#FF6B35] hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(categories.length > 0
            ? categories
            : [
                { name: "Kirana Store", emoji: "🛒" },
                { name: "Restaurant", emoji: "🍽️" },
                { name: "Medical Store", emoji: "💊" },
                { name: "Salon", emoji: "💇" },
                { name: "Mobile Repair", emoji: "📱" },
                { name: "Coaching", emoji: "📚" },
                { name: "Bakery", emoji: "🍰" },
                { name: "Hardware", emoji: "🔧" },
              ]
          )
            .slice(0, 8)
            .map((cat) => (
              <Link
                key={cat.id || cat.name}
                href={`/category/${encodeURIComponent(cat.name)}`}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/[0.07] hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/[0.02] transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform block">
                  {cat.emoji || "📁"}
                </span>
                <span className="text-[13px] font-semibold text-[#0F0F0F]">
                  {cat.name}
                </span>
              </Link>
            ))}
        </div>
      </section> */}

      {/* ── FINAL CTA ──────────────────────────────────────────── */}
      <section className="mx-4 mt-12 md:mx-12 mb-20 rounded-3xl bg-[#FF6B35] p-12 md:p-16 text-white text-center overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/5 translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <h2 className="text-[32px] md:text-[44px] font-bold leading-tight tracking-tight mb-4">
            Ready to get found on Google?
          </h2>
          <p className="text-white/80 text-[16px] mb-8 max-w-md mx-auto">
            Free listing. 5 minutes to set up. No website or tech knowledge
            needed.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 h-12 px-8 bg-white text-[#FF6B35] text-[14px] font-bold rounded-xl hover:bg-white/90 transition-colors"
          >
            Create your shop page <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.06] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center">
                <Store size={14} className="text-white" />
              </div>
              <span className="text-[14px] font-bold text-[#0F0F0F]">
                Shop<span className="text-[#FF6B35]">Setu</span>
              </span>
            </Link>
            <p className="text-[12px] text-[#999] leading-relaxed max-w-[220px]">
              Connecting local shops to digital customers across India.
            </p>
          </div>

          {[
            {
              heading: "Discover",
              links: [
                "Explore shops",
                "Kirana stores",
                "Restaurants",
                "Salons",
              ],
            },
            {
              heading: "Business",
              links: [
                "List your shop",
                "Pricing",
                "How it works",
                "Admin panel",
              ],
            },
            {
              heading: "Company",
              links: ["About", "Contact", "Privacy policy", "Terms of use"],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h6 className="text-[11px] font-semibold text-[#0F0F0F] uppercase tracking-wider mb-4">
                {heading}
              </h6>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-[13px] text-[#888] hover:text-[#0F0F0F] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-black/[0.06] px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#bbb]">
            © 2026 ShopSetu. Made with ❤️ for Bharat.
          </p>
          <p className="text-[12px] text-[#ddd]">
            शॉपसेतु · Your shop. Online. Found.
          </p>
        </div>
      </footer>
    </div>
  );
}
