"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Target,
  Users,
  Heart,
  TrendingUp,
  Store,
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Rocket,
  Layout
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import { BRAND } from "@/lib/config";

const AboutPage = () => {
  const stats = [
    { label: "Active Nodes", value: "500+", icon: Store },
    { label: "Network Users", value: "10k+", icon: Users },
    { label: "Regional Hubs", value: "50+", icon: Globe },
    { label: "Performance", value: "40%", icon: TrendingUp },
  ];

  const values = [
    {
      icon: Heart,
      title: "Regional Optimization",
      description: "We prioritize regional discovery over global monoliths, ensuring the heartbeat of local commerce remains visible.",
    },
    {
      icon: Target,
      title: "Digital Provisioning",
      description: "Empowering small-scale merchants with a professional cloud presence and direct communication channels.",
    },
    {
      icon: Sparkles,
      title: "Elite UX Standards",
      description: "Delivering a world-class, high-density interface that brings enterprise-level tools to the local market.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative z-10 max-w-7xl mx-auto">
        <div className="animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 mb-6">
            <ShieldCheck size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Our Mission Architecture</span>
          </div>
          <h1 className="text-[36px] md:text-[56px] font-bold text-[#0A0A0F] mb-8 tracking-tight leading-none">
            Architecting the <span className="text-[#FF6A00]">Future of Bharat.</span>
          </h1>
          <p className="text-[15px] md:text-[18px] text-[#0A0A0F]/45 font-medium leading-relaxed max-w-2xl">
            {BRAND} is more than a directory. We are developing the infrastructure that connects local businesses
            to their neighborhood, provisioning every business with a premium digital storefront.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 border-black/[0.03] text-center hover:border-[#FF6A00]/30 transition-all group">
              <div className="w-10 h-10 rounded-md bg-black/[0.02] border border-black/[0.05] flex items-center justify-center text-[#FF6A00] mx-auto mb-4 group-hover:scale-105 transition-transform">
                <stat.icon size={18} />
              </div>
              <div className="text-[24px] font-bold text-[#0A0A0F] mb-0.5">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest">{stat.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10 animate-in slide-in-from-left-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/[0.02] border border-black/[0.05] rounded-md">
            <Zap size={14} className="text-[#FF6A00]" />
            <span className="text-[10px] font-bold text-[#0A0A0F]/60 uppercase tracking-widest">Inception Protocol</span>
          </div>
          <h2 className="text-[28px] md:text-[40px] font-bold text-[#0A0A0F] tracking-tight leading-none">
            Empowering the Future of Local Commerce
          </h2>
          <div className="space-y-6 text-[#0A0A0F]/45 font-medium text-[15px] leading-relaxed">
            <p>
              At {BRAND}, we believe that every local business deserves a powerful digital presence. Transitioning from an offline shop to a modern digital brand shouldn't be complicated or expensive. We built {BRAND} to bridge the gap between traditional retail and modern ecommerce.
            </p>
            <p>
              Whether you are a neighborhood retailer, an emerging startup, or an established wholesaler, our platform provides the tools you need to succeed. We handle the technology—from responsive design to search engine optimization—so you can focus on serving your customers and growing your business.
            </p>
            <p>
              {BRAND} is the leading digital commerce platform designed explicitly for local businesses. By providing a premium digital storefront and seamless WhatsApp integration, we make online selling personal, efficient, and accessible.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/create">
              <Button size="lg" icon={ArrowRight} iconPosition="right" className="shadow-xl">Register New Business</Button>
            </Link>
          </div>
        </div>
        <div className="relative animate-in slide-in-from-right-4 duration-700">
          <Card padding={false} className="p-2 border-none shadow-2xl rounded-md overflow-hidden aspect-square flex items-center justify-center bg-white relative">
            <div className="absolute inset-0 dot-grid opacity-[0.03]" />
            <div className="relative text-center z-10">
              <Store size={120} className="text-[#FF6A00]/10 mb-4 mx-auto" />
              <div className="text-[44px] font-bold text-[#0A0A0F] leading-none mb-2">{BRAND}</div>
              <div className="text-[12px] font-bold text-[#FF6A00] uppercase tracking-[0.4em]">NETWORK BHARAT</div>
            </div>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#0A0A0F] mb-4 tracking-tight leading-none">Core Governance.</h2>
            <p className="text-[#0A0A0F]/45 font-medium text-[16px] max-w-xl mx-auto">The engineering principles guiding the future of regional commerce.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((value, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 rounded-md bg-[#F7F7F5] border border-black/[0.05] flex items-center justify-center text-[#0A0A0F]/20 mx-auto shadow-sm group-hover:text-[#FF6A00] group-hover:bg-white transition-all duration-500 mb-8">
                  <value.icon size={28} />
                </div>
                <h3 className="text-[20px] font-bold text-[#0A0A0F] mb-4 tracking-tight">{value.title}</h3>
                <p className="text-[#0A0A0F]/45 font-medium text-[14px] leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <Card variant="dark" padding={false} className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-[32px] md:text-[56px] font-bold text-white mb-8 tracking-tight leading-none">Initialize the movement.</h2>
            <p className="text-white/40 text-[16px] md:text-[18px] font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              Whether you are a merchant node or a network participant, join the regional digital revolution today.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/">
                <Button size="lg" className="bg-white text-[#0A0A0F] border-white hover:bg-gray-100 px-10 h-12 shadow-xl">Explore Hubs</Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/5 px-10 h-12">Register Node</Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
