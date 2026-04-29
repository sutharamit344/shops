"use client";

import React, { useState, useEffect } from "react";
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
  Phone,
  Award,
} from "lucide-react";
import { slugify } from "@/lib/slugify";
import Button from "@/components/UI/Button";
import Input from "@/components/UI/Input";
import Card from "@/components/UI/Card";
import SmartSearch from "@/components/Search/SmartSearch";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories();
        if (cats && cats.length > 0) setCategories(cats);
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

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-center">
          <div className="space-y-10 max-w-2xl">
            <div className="space-y-4">
              <p className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.15em] animate-in fade-in slide-in-from-bottom-2 duration-500">
                1000+ Shops Already Joined!
              </p>
              <h1 className="text-[56px] md:text-[72px] font-extrabold text-[#1A1F36] leading-[0.95] tracking-[-0.03em] animate-in fade-in slide-in-from-bottom-4 duration-700">
                Your shop,
                <br />
                <span className="text-[#FF6B35]">found online.</span>
              </h1>
            </div>

            <p className="text-[17px] text-[#1A1F36]/60 leading-relaxed max-w-lg font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Create a Google-friendly page for your shop in 5 minutes. Get
              discovered and receive customers directly on WhatsApp — no website
              or tech knowledge needed.
            </p>

            {/* Search bar */}
            <div className="max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <SmartSearch />
            </div>

            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Link href="/cafe-near-me">
                <Button
                  variant="outline"
                  size="lg"
                  icon={Navigation}
                  className="bg-white"
                >
                  Find Cafe Near Me
                </Button>
              </Link>
              <Link
                href="/explore"
                className="text-[13px] font-bold text-[#1A1F36]/40 hover:text-[#FF6B35] transition-colors"
              >
                Explore Local Shops
              </Link>
            </div>

            {/* Trust tags */}
            <div className="flex items-center flex-wrap gap-6 pt-4">
              {[
                "No coding needed",
                "Free forever",
                "SEO optimised",
                "WhatsApp ready",
              ].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 text-[12px] font-bold text-[#1A1F36]/30 uppercase tracking-tight"
                >
                  <CheckCircle2 size={13} className="text-[#25D366]" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Shop Mockup */}
          <div className="relative hidden lg:block animate-in zoom-in-95 duration-1000">
            <div className="absolute inset-0 bg-[#FF6B35]/5 rounded-3xl blur-3xl scale-110" />

            <Card className="relative overflow-hidden border-[#1A1F36]/[0.08] shadow-md scale-105 group/mock">
              <div className="h-1 bg-[#FF6B35]" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1A1F36] text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                      S
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-bold text-[#1A1F36]">
                          Sharma Kirana Store
                        </span>
                        <ShieldCheck size={14} className="text-[#FF6B35]" />
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#1A1F36]/30" />
                        <span className="text-[11px] text-[#1A1F36]/40 font-semibold">
                          Maninagar, Ahmedabad
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF6B35]">
                    <Star size={12} className="fill-[#FF6B35]" />
                    <span className="text-[12px] font-bold">4.9</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {[
                    { name: "Atta — 5kg", price: "₹220" },
                    { name: "Basmati Rice — 5kg", price: "₹380" },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2 border-b border-[#1A1F36]/[0.05] last:border-0"
                    >
                      <span className="text-[13px] font-medium text-[#1A1F36]/70">
                        {item.name}
                      </span>
                      <span className="text-[14px] font-bold text-[#FF6B35] font-mono">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="whatsapp" size="sm" icon={MessageSquare}>
                    WhatsApp
                  </Button>
                  <Button variant="dark" size="sm" icon={Phone}>
                    Call Now
                  </Button>
                </div>
              </div>
            </Card>

            {/* Floating Stat Card */}
            <div className="absolute -top-6 -right-6 bg-[#1A1F36] text-white rounded-2xl p-5 shadow-md animate-theme-float">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                Growth this week
              </p>
              <div className="text-3xl font-bold">
                +42 <span className="text-[#25D366] text-sm">leads</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────────── */}
      <section className="py-12 border-y border-[#1A1F36]/[0.06] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 mb-10 px-4 py-2 bg-[#FAFAF8] rounded-full border border-[#1A1F36]/[0.04]">
            <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="text-[10px] font-bold text-[#1A1F36]/50 uppercase tracking-wider">
              Trusted by 1,000+ businesses across Bharat
            </span>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-3">
            {(categories.length > 0
              ? categories
              : [
                  { name: "Kirana Store" },
                  { name: "Salon" },
                  { name: "Restaurant" },
                  { name: "Medical Store" },
                  { name: "Bakery" },
                ]
            ).map((cat) => (
              <Link
                key={cat.id || cat.name}
                href={`/explore?category=${encodeURIComponent(slugify(cat.name))}`}
                className="px-5 py-2.5 bg-[#FAFAF8] hover:bg-white rounded-full text-[13px] font-bold text-[#1A1F36]/60 hover:text-[#FF6B35] border border-[#1A1F36]/[0.06] hover:border-[#FF6B35]/30 transition-all shadow-md"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEARCH GUIDE ───────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.15em] mb-4">
            Search Like a Pro
          </p>
          <h2 className="text-[32px] md:text-[48px] font-bold text-[#1A1F36] leading-tight tracking-tight">
            How to find exactly what you need
          </h2>
          <p className="text-[16px] text-[#1A1F36]/50 mt-4 max-w-2xl mx-auto font-medium">
            Our smart search understands natural language. Use these structures
            for the best results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Category + Location",
              example: '"Bakery in Thaltej"',
              desc: "Best for finding specific types of shops in a particular neighborhood.",
              icon: MapPin,
              color: "bg-blue-50 text-blue-500",
            },
            {
              title: "Intent Based",
              example: '"Salon near me"',
              desc: "Uses your real-time GPS to find the closest verified businesses.",
              icon: Navigation,
              color: "bg-emerald-50 text-emerald-500",
            },
            {
              title: "Direct Hubs",
              example: '"Food Park"',
              desc: "Search for market names or specialized business clusters directly.",
              icon: Award,
              color: "bg-amber-50 text-amber-500",
            },
            {
              title: "Top Rated",
              example: '"Best Cafe in Gota"',
              desc: "Finds high-rated businesses in your area with verified reviews.",
              icon: Star,
              color: "bg-purple-50 text-purple-500",
            },
          ].map((item, i) => (
            <Card
              key={i}
              className="p-8 border-[#1A1F36]/[0.04] hover:border-[#FF6B35]/20 transition-all group"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${item.color}`}
              >
                <item.icon size={22} />
              </div>
              <h3 className="text-[17px] font-bold text-[#1A1F36] mb-2">
                {item.title}
              </h3>
              <div className="bg-[#FAFAF8] rounded-xl px-4 py-3 mb-4 border border-black/[0.03]">
                <code className="text-[13px] font-bold text-[#FF6B35]">
                  {item.example}
                </code>
              </div>
              <p className="text-[13px] text-[#1A1F36]/50 leading-relaxed font-medium">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.15em] mb-4">
              The ShopSetu Advantage
            </p>
            <h2 className="text-[40px] md:text-[52px] font-bold text-[#1A1F36] leading-[1] tracking-tight">
              Everything your shop needs to grow online
            </h2>
          </div>
          <Button
            variant="dark"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="flex-shrink-0"
            onClick={() => router.push("/create")}
          >
            Get Started Free
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Globe,
              title: "Unique Shop URL",
              desc: "A dedicated, shareable link optimized for Google and perfect for your Instagram bio.",
              accent: "#FF6B35",
            },
            {
              icon: Store,
              title: "Smart Catalog",
              desc: "List your full menu or products with photos and prices. Update anytime from your phone.",
              accent: "#1A1F36",
            },
            {
              icon: MessageSquare,
              title: "Direct WhatsApp Orders",
              desc: "Every enquiry lands straight in your WhatsApp. Zero commission, zero middlemen.",
              accent: "#25D366",
            },
            {
              icon: Search,
              title: "Local SEO Built-in",
              desc: "Each page is server-rendered with structured data and category keywords baked in.",
              accent: "#FF6B35",
            },
            {
              icon: ShieldCheck,
              title: "Verified Trust Badge",
              desc: "Our team reviews and verifies every listing, giving customers the trust signal they need.",
              accent: "#1A1F36",
            },
            {
              icon: TrendingUp,
              title: "Live Insights",
              desc: "Track page views, WhatsApp clicks, and calls to know exactly how your shop is performing.",
              accent: "#FF6B35",
            },
          ].map((f, i) => (
            <Card
              key={i}
              className="p-8 group hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 bg-[#FAFAF8] text-[#1A1F36]/20 group-hover:bg-[#FF6B35]/10 group-hover:text-[#FF6B35]">
                <f.icon size={22} />
              </div>
              <h3 className="text-[17px] font-bold text-[#1A1F36] mb-3">
                {f.title}
              </h3>
              <p className="text-[14px] text-[#1A1F36]/50 leading-relaxed font-medium">
                {f.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── PROCESS SECTION ───────────────────────────────────── */}
      <section className="py-24 bg-[#1A1F36] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35]/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px]" />

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-20 text-center">
            <p className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.15em] mb-4">
              Simple 3-Step Process
            </p>
            <h2 className="text-[40px] md:text-[52px] font-bold tracking-tight">
              Go live in 24 hours
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              {
                n: "01",
                title: "Add Your Details",
                desc: "Name, category, and phone number. We handle the technical SEO setup automatically.",
              },
              {
                n: "02",
                title: "Upload Products",
                desc: "List your top items with prices. Clear photos help attract 3x more customers.",
              },
              {
                n: "03",
                title: "Start Receiving Leads",
                desc: "Your shop goes live on our marketplace and Google. Customers reach out on WhatsApp.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.05] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 flex items-center justify-center text-[#FF6B35] text-[13px] font-bold mb-6">
                  {step.n}
                </div>
                <h3 className="text-[19px] font-bold mb-3">{step.title}</h3>
                <p className="text-[14px] text-white/40 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button
              variant="primary"
              size="lg"
              className="h-14 px-10 shadow-md"
              onClick={() => router.push("/create")}
            >
              Create Your Free Page <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="mx-6 md:mx-12 my-24 rounded-[32px] bg-[#FF6B35] p-12 md:p-24 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-[40px] md:text-[56px] font-bold leading-tight tracking-tight mb-6">
            Ready to get found?
          </h2>
          <p className="text-white/80 text-[18px] mb-10 font-medium leading-relaxed">
            Join 1,000+ businesses. No technical knowledge needed. Free listing
            forever.
          </p>
          <Button
            variant="dark"
            size="xl"
            className="shadow-md"
            onClick={() => router.push("/create")}
          >
            Create your shop page <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-[#1A1F36]/[0.06] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center">
                <Store size={16} className="text-white" />
              </div>
              <span className="text-[18px] font-bold tracking-tight text-[#1A1F36]">
                Shop<span className="text-[#FF6B35]">Setu</span>
              </span>
            </Link>
            <p className="text-[14px] text-[#1A1F36]/50 leading-relaxed max-w-sm font-medium">
              Empowering Bharat's local businesses with a world-class digital
              presence. Found on Google, connected via WhatsApp.
            </p>
          </div>

          {[
            {
              heading: "Explore",
              links: ["All Shops", "Kirana Stores", "Restaurants", "Salons"],
            },
            {
              heading: "Business",
              links: ["List Your Shop", "Pricing", "How it Works", "Dashboard"],
            },
            {
              heading: "Company",
              links: ["About", "Contact", "Privacy Policy", "Terms"],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h6 className="text-[11px] font-bold text-[#1A1F36] uppercase tracking-[0.15em] mb-6">
                {heading}
              </h6>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href={
                        link === "Privacy Policy"
                          ? "/privacy"
                          : link === "Terms"
                            ? "/terms"
                            : "#"
                      }
                      className="text-[14px] font-bold text-[#1A1F36]/40 hover:text-[#FF6B35] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#1A1F36]/[0.06] px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] font-bold text-[#1A1F36]/20">
            © 2026 ShopSetu Technologies Pvt Ltd.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] font-bold text-[#1A1F36]/40 uppercase tracking-widest cursor-default">
              Designed for Bharat
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
