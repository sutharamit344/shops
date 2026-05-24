"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import ShopCard from "@/components/Shop/ShopCard";
import Button from "@/components/UI/Button";
import { Search, MapPin, Store, ChevronRight } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

const ListingLayout = ({ shops = [], title, subtitle, city, type }) => {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 pt-28 md:pt-36">
        <header className="mb-12">
          <p className="text-[11px] font-bold text-[#FF6A00] uppercase tracking-[0.15em] mb-2">Marketplace Directory</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#0A0A0F] tracking-tight leading-tight mb-2">
                {title}
              </h1>
              <p className="text-[16px] text-[#0A0A0F]/50 font-medium max-w-2xl leading-relaxed">
                {subtitle || `Discover the best local ${type || 'businesses'} and services curated specifically for your needs.`}
              </p>
            </div>
            {city && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#0A0A0F]/[0.06] shadow-sm">
                <MapPin size={14} className="text-[#FF6A00]" />
                <span className="text-[12px] font-bold text-[#0A0A0F] uppercase tracking-wider">
                  Verified in {city}
                </span>
              </div>
            )}
          </div>
        </header>

        {shops.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[32px] border border-[#0A0A0F]/[0.06] shadow-sm flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#FAFAF8] rounded-[24px] flex items-center justify-center text-[#0A0A0F]/10">
               <Search size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0A0A0F] mb-1">No businesses found</h3>
              <p className="text-[14px] text-[#0A0A0F]/40 font-medium">We couldn&apos;t find any approved shops matching this {type || 'category'} yet.</p>
            </div>
            <Link href="/explore">
              <Button variant="primary" icon={ChevronRight} iconPosition="right">Explore All Shops</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in fade-in duration-700">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} variant="grid" />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ListingLayout;

