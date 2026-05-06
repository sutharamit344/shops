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
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/UI/Button";
import { BRAND, CONTACT } from "@/lib/config";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = [
    {
      icon: Zap,
      title: "Getting Started",
      description: "Learn the basics of using ShopBajar to find local shops.",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Store,
      title: "For Merchants",
      description: "How to list your shop, manage products, and grow your business.",
      color: "bg-[#FF6A00]/10 text-[#FF6A00]",
    },
    {
      icon: ShieldCheck,
      title: "Trust & Safety",
      description: "Everything you need to know about our verification and privacy.",
      color: "bg-green-500/10 text-green-500",
    },
    {
      icon: User,
      title: "Your Account",
      description: "Managing your profile, dashboard, and login security.",
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  const faqs = [
    {
      question: "Is ShopBajar free to use for customers?",
      answer: "Yes, ShopBajar is completely free for customers. You can browse shops, view products, and contact sellers without any charges.",
    },
    {
      question: "How do I list my shop on ShopBajar?",
      answer: "To list your shop, click on the 'List Your Shop' button in the footer or navigation. Fill in your business details, upload images, and submit for verification.",
    },
    {
      question: "How long does verification take?",
      answer: "We typically verify shops within 24-48 hours. Once verified, your shop will be visible to all users in your area.",
    },
    {
      question: "Can I sell directly on ShopBajar?",
      answer: "Currently, ShopBajar is a discovery platform. Customers can find your shop and products, and then contact you directly via WhatsApp to complete the purchase.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-[#1A1F36] pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6A00]/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
            How can we <span className="text-[#FF6A00]">help you?</span>
          </h1>
          
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-[#FF6A00]/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] p-2 pr-4 shadow-2xl focus-within:bg-white focus-within:border-white transition-all">
              <div className="w-12 h-12 flex items-center justify-center text-white/40 group-focus-within:text-[#1A1F36]">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search for articles, guides..."
                className="flex-1 bg-transparent border-none outline-none text-white focus:text-[#1A1F36] font-medium text-lg placeholder:text-white/30 focus:placeholder:text-[#1A1F36]/30 py-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="sm" className="hidden md:flex">Search</Button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-white/40 text-sm font-bold uppercase tracking-widest">
            <span>Popular:</span>
            <button className="text-white hover:text-[#FF6A00] transition-colors underline decoration-white/20 underline-offset-4">Verification</button>
            <button className="text-white hover:text-[#FF6A00] transition-colors underline decoration-white/20 underline-offset-4">List Shop</button>
            <button className="text-white hover:text-[#FF6A00] transition-colors underline decoration-white/20 underline-offset-4">WhatsApp Help</button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div 
              key={i}
              className="bg-white p-8 rounded-[32px] border border-black/[0.05] shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-[#FF6A00]/10 hover:-translate-y-2 transition-all cursor-pointer group"
            >
              <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <cat.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-[#1A1F36] mb-3">{cat.title}</h3>
              <p className="text-gray-500 font-medium text-[15px] leading-relaxed mb-6">
                {cat.description}
              </p>
              <div className="flex items-center gap-2 text-[#FF6A00] font-black text-xs uppercase tracking-widest">
                <span>Explore</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-[#1A1F36] mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500 font-medium">Quick answers to common questions about our platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`bg-white rounded-[24px] border transition-all ${activeFaq === i ? 'border-[#FF6A00] shadow-lg' : 'border-black/[0.05]'}`}
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left"
              >
                <span className="text-lg font-bold text-[#1A1F36]">{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-400 transition-transform ${activeFaq === i ? 'rotate-180 text-[#FF6A00]' : ''}`} 
                />
              </button>
              {activeFaq === i && (
                <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed animate-in slide-in-from-top-2 duration-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="bg-[#1A1F36] rounded-[48px] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6A00]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Still have questions?</h2>
            <p className="text-white/60 text-lg font-medium mb-8">
              Our support team is here to help you 24/7. Connect with us via WhatsApp or email and we'll get back to you immediately.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg" className="bg-[#25D366] border-[#25D366] hover:bg-[#25D366]/90">
                  Contact via WhatsApp
                </Button>
              </a>
              <a href={`mailto:${CONTACT.email}`}>
                <Button variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/10">
                  Send an Email
                </Button>
              </a>
            </div>
          </div>
          
          <div className="relative z-10 w-full max-w-sm aspect-square bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center p-12">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF6A00] blur-[100px] opacity-20 animate-pulse"></div>
              <HelpCircle size={160} className="text-[#FF6A00] relative z-10" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenter;
