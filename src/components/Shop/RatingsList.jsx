"use client";

import React from "react";
import { Star } from "lucide-react";
import Card from "@/components/UI/Card";

export default function ShopRatingsList({ ratings }) {
  if (!ratings || ratings.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 px-2">
         <h2 className="text-xs font-black uppercase tracking-[0.5em] text-navy/20">Guest Reviews</h2>
         <div className="h-[1px] flex-1 bg-navy/5"></div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {ratings.map((rev) => (
          <Card key={rev.id} className="p-6 border-navy/5 bg-navy/5 backdrop-blur-md rounded-md hover:bg-navy/[0.08] transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black text-navy uppercase tracking-wider">{rev.userName || "Customer"}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={s <= rev.rating ? "text-primary" : "text-navy/10"}
                      fill={s <= rev.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[9px] font-bold text-navy/20 uppercase tracking-widest">
                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
              </span>
            </div>
            {rev.comment ? (
              <p className="text-navy/60 text-xs leading-relaxed font-medium italic">"{rev.comment}"</p>
            ) : (
              <p className="text-navy/20 text-[10px] italic">No comment left.</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
