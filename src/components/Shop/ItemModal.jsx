"use client";

import React from "react";
import { ShoppingBag, X, Plus, Minus, MessageSquare } from "lucide-react";
import Dialog from "../UI/Dialog";
import SafeImage from "../UI/SafeImage";
import Button from "../UI/Button";

/**
 * Premium Item Detail Modal Component
 * Styled to match linear/vercel cloud dashboard design.
 */
export default function ItemModal({
  item,
  isOpen,
  onClose,
  cart = [],
  onUpdateCart,
  isAddToCartEnabled = true,
  onEnquireIndividual
}) {
  if (!item) return null;

  const cartItem = cart.find(i => i.name === item.name);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
      padding={false}
      rounded="rounded-md"
      maxWidth="max-w-[420px]"
    >
      <div className="flex flex-col relative text-[#0A0A0F] dark:text-zinc-100 bg-white dark:bg-zinc-950 overflow-hidden">
        {/* Close Button floating top-right */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-[#0A0A0F]/60 dark:text-zinc-400 hover:text-[#0A0A0F] dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-900 shadow-md transition-all border border-black/5 dark:border-white/5"
          aria-label="Close"
        >
          <X size={15} className="w-3.5 h-3.5" />
        </button>

        {/* Image Banner */}
        <div className="w-full aspect-[4/3] bg-zinc-50 dark:bg-zinc-900 border-b border-black/[0.05] dark:border-zinc-800/60 overflow-hidden relative shadow-inner">
          <SafeImage
            src={item.image}
            alt={item.name}
            fill
            unoptimized
            className="object-cover"
            fallbackIcon={ShoppingBag}
            showLabel={true}
            iconSize={48}
          />

          {/* Badges floating top-left */}
          <div className="absolute top-3.5 left-3.5 z-20 flex flex-col items-start gap-1">
            {item.featured && (
              <span className="text-[9px] font-black bg-[#FF6A00] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                Featured
              </span>
            )}
            {item.isNew !== false && (
              <span className="text-[9px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                New
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-[17px] sm:text-[19px] font-bold text-[#0A0A0F] dark:text-zinc-100 tracking-tight leading-snug">
              {item.name}
            </h3>
            <div className="flex items-center">
              <span className="text-[11px] sm:text-[12px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 dark:bg-[#FF6A00]/20 border border-[#FF6A00]/20 rounded px-2.5 py-0.5 inline-block">
                {item.price ? `₹${item.price}` : "Price on Enquiry"}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.05] dark:border-zinc-900">
            <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
              Description
            </h4>
            <p className="text-[12.5px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed whitespace-pre-line">
              {item.description || "Premium quality offering from our catalog. Contact us for details, custom orders, or availability."}
            </p>
          </div>

          {/* Stock Availability — only when stock is tracked */}
          {typeof item.stock === 'number' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Availability
              </span>
              {item.stock <= 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                  Out of stock
                </span>
              ) : item.stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block flex-shrink-0" />
                  Only {item.stock} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
                  {item.stock} in stock
                </span>
              )}
            </div>
          )}

          {/* Footer Interactive Actions */}
          <div className="pt-2">
            {isAddToCartEnabled ? (
              quantity > 0 ? (
                <div className="flex items-center justify-between gap-3 h-12 w-full bg-[#FF6A00]/5 border border-[#FF6A00]/20 rounded-md px-3.5 animate-in fade-in duration-200">
                  <span className="text-[13px] font-bold text-[#FF6A00]">
                    {quantity} {quantity === 1 ? 'item' : 'items'} in cart
                  </span>
                  <div className="flex items-center bg-white dark:bg-zinc-900 border border-[#FF6A00]/25 rounded-full overflow-hidden h-8 px-0.5 shadow-2xs">
                    <button
                      onClick={() => onUpdateCart(item, quantity - 1)}
                      className="w-8 h-full flex items-center justify-center text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-[12.5px] font-black text-[#0A0A0F] dark:text-zinc-100 min-w-[20px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateCart(item, quantity + 1)}
                      className="w-8 h-full flex items-center justify-center text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-md shadow-[#FF6A00]/20 text-[13px] h-10.5 rounded-md bg-[#FF6A00] hover:bg-[#FF6A00]/90 border-none text-white flex items-center justify-center gap-2"
                  icon={ShoppingBag}
                  onClick={() => onUpdateCart(item, 1)}
                >
                  Add to Inquiry Cart
                </Button>
              )
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md shadow-[#FF6A00]/20 text-[13px] h-10.5 rounded-md bg-[#FF6A00] hover:bg-[#FF6A00]/90 border-none text-white flex items-center justify-center gap-2"
                icon={MessageSquare}
                onClick={() => {
                  if (onEnquireIndividual) {
                    onEnquireIndividual(item);
                  } else {
                    const msg = `Hello, I'm interested in "${item.name}" from your catalog.`;
                    window.open(`https://wa.me/91${item.phone || ''}?text=${encodeURIComponent(msg)}`, "_blank");
                  }
                }}
              >
                Enquire on WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
