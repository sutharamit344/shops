"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/UI/SectionHeader";
import ShopCard from "@/components/Shop/ShopCard";

const ListingLayout = ({ shops = [], title, subtitle, city, type }) => {
  return (
    <div className="min-h-screen bg-cream selection:bg-primary/10 selection:text-primary">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 pt-28 md:pt-36">
        <div className="mb-12">
           <SectionHeader 
            title={title} 
            subtitle={subtitle} 
          />
          {city && (
            <div className="flex items-center gap-2 mt-2 px-1">
              <div className="h-[1px] w-4 bg-primary/30"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-navy/40">
                Found in {city}
              </span>
            </div>
          )}
        </div>

        {shops.length === 0 ? (
          <div className="text-center py-24 bg-white/40 backdrop-blur-sm rounded-md border border-navy/5 shadow-sm">
            <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="text-2xl opacity-20">🔍</span>
            </div>
            <p className="text-navy/40 font-black uppercase tracking-[0.2em] text-xs">
              No approved shops found in this {type || 'category'}.
            </p>
            <p className="text-gray-400 text-[10px] mt-2 font-medium">
              Try exploring other areas or categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} variant="grid" />
            ))}
          </div>
        )}
      </main>

      <footer className="py-12 px-4 border-t border-navy/5 bg-white/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-navy rounded flex items-center justify-center">
              <span className="text-white font-black text-[10px] italic uppercase">S</span>
            </div>
            <span className="text-sm font-black text-navy uppercase tracking-tighter italic">ShopSetu</span>
          </div>
          <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} ShopSetu Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ListingLayout;
