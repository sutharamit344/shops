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
  Zap
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/UI/Button";
import { BRAND } from "@/lib/config";

const AboutPage = () => {
  const stats = [
    { label: "Shops Listed", value: "500+", icon: Store },
    { label: "Monthly Visitors", value: "10k+", icon: Users },
    { label: "Local Areas", value: "50+", icon: Globe },
    { label: "Growth Rate", value: "40%", icon: TrendingUp },
  ];

  const values = [
    {
      icon: Heart,
      title: "Local First",
      description: "We believe the heartbeat of Bharat is in its local markets. We prioritize local discovery over global chains.",
    },
    {
      icon: Target,
      title: "Digital Empowerment",
      description: "Giving every small shop owner the tools to be found on Google and connected via WhatsApp.",
    },
    {
      icon: Sparkles,
      title: "Premium Experience",
      description: "Bringing a world-class, clean, and high-performance digital experience to the local marketplace.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-[#1A1F36] pt-40 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6A00]/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-[120px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-[#FF6A00] font-black text-xs uppercase tracking-[0.3em] mb-6">Our Mission</p>
          <h1 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
            Digitizing the Heart of <span className="text-[#FF6A00]">Bharat.</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            {BRAND} is more than just a directory. We are building the infrastructure that connects local shopkeepers with their neighborhood, empowering them with a premium digital identity.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-black/[0.05] shadow-xl shadow-black/[0.02] text-center group hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FAFAF8] flex items-center justify-center text-[#FF6A00] mx-auto mb-4 group-hover:scale-110 transition-transform">
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-black text-[#1A1F36] mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6A00]/10 rounded-full border border-[#FF6A00]/20">
            <Zap size={14} className="text-[#FF6A00]" />
            <span className="text-[10px] font-black text-[#FF6A00] uppercase tracking-widest">Why we started</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1A1F36] tracking-tight leading-tight">
            Bridging the gap between the local market and the digital world.
          </h2>
          <div className="space-y-6 text-gray-500 font-medium text-lg leading-relaxed">
            <p>
              In an era dominated by global e-commerce giants, the local shopkeeper—the person who knows your name and your preferences—was being left behind.
            </p>
            <p>
              We realized that most local businesses don't need a complex inventory management system or a global delivery network. They need to be **found** and they need to **communicate**.
            </p>
            <p>
              {BRAND} provides a simple, beautiful, and powerful way for shops to list their presence and products, allowing customers to discover them via Google and reach them instantly via WhatsApp.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/create">
              <Button size="lg" icon={ArrowRight} iconPosition="right">List Your Business Now</Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-[#FF6A00]/20 rounded-[48px] rotate-3 blur-2xl -z-10"></div>
          <div className="bg-white p-4 rounded-[48px] border border-black/[0.05] shadow-2xl overflow-hidden aspect-square flex items-center justify-center relative group">
             <Store size={200} className="text-[#FF6A00]/10 group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                   <div className="text-6xl font-black text-[#1A1F36] mb-2">{BRAND}</div>
                   <div className="text-sm font-bold text-[#FF6A00] uppercase tracking-[0.4em]">BHARAT</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1F36] mb-4">Our Core Values</h2>
            <p className="text-gray-400 font-medium max-w-xl mx-auto">The principles that guide us as we build the future of local commerce.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((value, i) => (
              <div key={i} className="text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-[#FAFAF8] border border-black/[0.03] flex items-center justify-center text-[#FF6A00] mx-auto shadow-sm group hover:bg-[#FF6A00] hover:text-white transition-all duration-500">
                  <value.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-[#1A1F36]">{value.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="bg-[#FF6A00] rounded-[64px] p-12 md:p-24 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to join the movement?</h2>
            <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
              Whether you're a business owner or a curious neighbor, be a part of the local digital revolution.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/explore">
                <Button size="xl" className="bg-white text-[#FF6A00] border-white hover:bg-gray-50">Explore Shops</Button>
              </Link>
              <Link href="/create">
                <Button size="xl" variant="outline" className="text-white border-white/40 hover:bg-white/10">Register Shop</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
