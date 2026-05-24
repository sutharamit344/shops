"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Store,
  User,
  ShieldCheck,
  Zap,
  CircleHelp,
  MessageSquare,
  ChevronDown,
  ArrowRight,
  Layout,
  Sparkles,
  Rocket
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import { BRAND, CONTACT } from "@/lib/config";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = [
    {
      icon: Zap,
      title: "Quick Start",
      description: "Fundamental protocols for business discovery and navigation.",
      color: "text-blue-500",
    },
    {
      icon: Store,
      title: "Merchant Docs",
      description: "Merchant provisioning, listing management, and business growth.",
      color: "text-[#FF6A00]",
    },
    {
      icon: ShieldCheck,
      title: "Security Protocols",
      description: "Data governance, identity verification, and encryption layers.",
      color: "text-emerald-500",
    },
    {
      icon: User,
      title: "Identity Desk",
      description: "Authentication matrices and dashboard configuration.",
      color: "text-purple-500",
    },
  ];

  const faqs = [
    {
      question: "Is the discovery network free for users?",
      answer: "Yes, the {BRAND} network is open and free for all participants. You can browse regional hubs, index storefronts, and initiate direct communication without protocol fees.",
    },
    {
      question: "How do I provision a new local business?",
      answer: "To provision a business, select 'Initialize Business' from the primary navigation. Input your business parameters, verify your regional coordinates, and deploy to the directory.",
    },
    {
      question: "What is the verification latency?",
      answer: "Business verification typically completes within a 24-48 hour window. Once synchronized, your storefront becomes globally discoverable across the regional grid.",
    },
    {
      question: "Does the platform facilitate direct transactions?",
      answer: "Currently, {BRAND} operates as a high-density discovery layer. Transactions are finalized via a direct peer-to-peer handshake through encrypted WhatsApp channels.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative z-10 max-w-7xl mx-auto">
        <div className="animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black/[0.02] border border-black/[0.05] mb-6">
            <CircleHelp size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-bold text-[#0A0A0F]/60 uppercase tracking-[0.2em]">Support Infrastructure</span>
          </div>
          <h1 className="text-[36px] md:text-[56px] font-bold text-[#0A0A0F] mb-8 tracking-tight leading-none">
            Knowledge <span className="text-[#FF6A00]">Repository.</span>
          </h1>

          <div className="relative max-w-xl group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A0A0F]/20 group-focus-within:text-[#FF6A00] transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search documentation, guides, and businesses..."
              className="w-full h-12 bg-white border border-black/[0.08] rounded-md pl-11 pr-4 text-[14px] font-medium outline-none focus:border-[#FF6A00]/40 transition-all shadow-2xl shadow-black/[0.02]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-[#0A0A0F]/30">
            <span>Trending:</span>
            <button className="text-[#0A0A0F]/60 hover:text-[#FF6A00] transition-colors">Verification</button>
            <span className="text-black/5">|</span>
            <button className="text-[#0A0A0F]/60 hover:text-[#FF6A00] transition-colors">Deployment</button>
            <span className="text-black/5">|</span>
            <button className="text-[#0A0A0F]/60 hover:text-[#FF6A00] transition-colors">WhatsApp API</button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Card
              key={i}
              className="p-6 border-black/[0.03] hover:border-[#FF6A00]/30 transition-all cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-md bg-black/[0.02] border border-black/[0.05] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform ${cat.color}`}>
                <cat.icon size={18} />
              </div>
              <h3 className="text-[16px] font-bold text-[#0A0A0F] mb-2 tracking-tight">{cat.title}</h3>
              <p className="text-[#0A0A0F]/45 font-medium text-[13px] leading-relaxed mb-6">
                {cat.description}
              </p>
              <div className="flex items-center gap-2 text-[#FF6A00] font-bold text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                <span>Access Docs</span>
                <ArrowRight size={12} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Layout size={14} className="text-[#0A0A0F]/20" />
            <span className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.2em]">Frequent Index</span>
          </div>
          <h2 className="text-[32px] font-bold text-[#0A0A0F] tracking-tight leading-none">Operational FAQs.</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Card
              key={i}
              className={`p-0 border-black/[0.03] transition-all overflow-hidden ${activeFaq === i ? 'border-[#FF6A00]/30 shadow-xl' : ''}`}
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left group"
              >
                <span className={`text-[15px] font-bold transition-colors ${activeFaq === i ? 'text-[#FF6A00]' : 'text-[#0A0A0F]'}`}>{faq.question.replace('{BRAND}', BRAND)}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#0A0A0F]/20 transition-transform duration-500 ${activeFaq === i ? 'rotate-180 text-[#FF6A00]' : 'group-hover:text-[#0A0A0F]/40'}`}
                />
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-6 text-[#0A0A0F]/45 font-medium text-[14px] leading-relaxed animate-in slide-in-from-top-2 duration-500">
                  {faq.answer.replace('{BRAND}', BRAND)}
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Support Section */}
      <section className="max-w-7xl mx-auto px-4 pb-32 relative z-10">
        <Card variant="dark" padding={false} className="border-none shadow-2xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />

          <div className="relative z-10 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 text-[#FF6A00] rounded-md border border-white/10 mb-6">
              <Sparkles size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Support</span>
            </div>
            <h2 className="text-[32px] md:text-[44px] font-bold text-white mb-6 tracking-tight leading-none">Still have questions?</h2>
            <p className="text-white/40 text-[16px] font-medium mb-10 leading-relaxed">
              Our engineering team is available for real-time consultation.
              Synchronize with us via priority WhatsApp or standard email transmission.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-[#25D366] border-[#25D366] hover:bg-[#25D366]/90 shadow-xl shadow-[#25D366]/10 px-8 h-11">
                  WhatsApp Support
                </Button>
              </a>
              <a href={`mailto:${CONTACT.email}`}>
                <Button variant="outline" size="lg" className="text-white border-white/10 hover:bg-white/5 px-8 h-11">
                  Email Desk
                </Button>
              </a>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-[280px] aspect-square bg-white/5 rounded-md border border-white/10 flex items-center justify-center p-12">
            <CircleHelp size={120} className="text-[#FF6A00]/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket size={40} className="text-[#FF6A00] animate-pulse" />
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenter;
