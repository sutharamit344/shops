"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import Button from "@/components/UI/Button";
import Dialog from "@/components/UI/Dialog";

export default function ItemModal({ item, onClose }) {
  if (!item) return null;

  return (
    <Dialog
      isOpen={!!item}
      onClose={onClose}
      title={item.name}
      subtitle="Verified Catalog Entry"
      icon={ShoppingBag}
      maxWidth="max-w-xl"
    >
      <div className="-m-6 flex flex-col">
        {/* Modal Image Header */}
        <div className="relative h-64 w-full flex-shrink-0 bg-navy/5 border-b border-navy/5">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-navy/5">
              <ShoppingBag size={80} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent"></div>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start gap-4">
             <div className="space-y-1">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Price Specification</h4>
                {item.price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-navy italic leading-none">
                      ₹{Number(item.price)}
                    </span>
                    {item.unit && <span className="text-[9px] font-black text-navy/20 uppercase tracking-[0.4em]">per {item.unit}</span>}
                  </div>
                ) : (
                  <span className="text-xl font-black text-navy/20 uppercase tracking-widest italic">Contact for Price</span>
                )}
             </div>
          </div>

          <div className="space-y-8">
            <p className="text-navy/60 text-sm leading-relaxed font-black uppercase tracking-tight italic bg-navy/[0.02] p-6 rounded-md border border-navy/5">
              {item.description || "Premium selection curated for platform excellence."}
            </p>

            <Button 
               onClick={() => {
                 const msg = `Hello, I'm interested in "${item.name}" from your catalog.`;
                 window.open(`https://wa.me/91${item.phone || ''}?text=${encodeURIComponent(msg)}`, "_blank");
               }}
               className="w-full theme-bg-primary text-white py-5 rounded-md shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-[11px] font-black uppercase tracking-[0.2em]"
            >
              Inquire Authority
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
