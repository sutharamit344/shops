"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Card from "@/components/UI/Card";
import SectionHeader from "@/components/UI/SectionHeader";
import { MapPin, Star, ArrowRight } from "lucide-react";

export default function CategoryListingClient({ shops, title, subtitle, view }) {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12 pt-24">
        <SectionHeader title={title} subtitle={subtitle} />

        {shops.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-cream">
            <p className="text-gray-400 font-bold uppercase tracking-widest">
              No shops found in this {view}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((s) => (
              <Link key={s.id} href={`/${encodeURIComponent(s.city)}/${encodeURIComponent(s.category)}/${encodeURIComponent(s.slug)}`}>
                <Card className="h-full flex flex-col justify-between group border-2 hover:border-[#FF6B35] transition-all duration-500 rounded-[32px] overflow-hidden p-0">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {s.logo ? (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/20 flex-shrink-0 shadow-sm">
                          <img
                            src={s.logo}
                            alt={s.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#FF6B35]/5 flex items-center justify-center text-[#FF6B35] font-black text-2xl flex-shrink-0">
                          {s.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-navy truncate group-hover:text-[#FF6B35] transition-colors uppercase tracking-tight">
                          {s.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-[#FF6B35] px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tighter bg-primary/5 border border-primary/10">
                            <Star size={12} fill="currentColor" />{" "}
                            {s.avgRating || s.rating || "5.0"}
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {s.totalRatings || 1} Reviews
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed font-medium">
                      {s.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <MapPin size={14} /> {s.area}, {s.city}
                      </div>
                      {s.zone && (
                        <div className="bg-blue-50 text-[#FF6B35] px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                          {s.zone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50/50 border-t border-cream flex items-center justify-between">
                    <span className="text-[#FF6B35] font-black text-xs uppercase tracking-widest">
                      Visit Shop
                    </span>
                    <ArrowRight
                      size={18}
                      className="text-[#FF6B35] transform group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
