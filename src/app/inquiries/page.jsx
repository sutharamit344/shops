"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { getUserInquiries } from "@/lib/db";
import { MessageSquare, Store, Calendar, ArrowRight, ExternalLink, Loader2, ShoppingBag, CheckCircle2 } from "lucide-react";
import Button from "@/components/UI/Button";

const UserInquiriesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      let deviceId = "";
      if (typeof window !== "undefined") {
        deviceId = localStorage.getItem("guest_device_id");
      }
      const data = await getUserInquiries(deviceId, user?.uid || user?.id || null);
      setInquiries(data);
      setLoading(false);
    };

    fetchInquiries();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-zinc-950 pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-md bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00] flex-shrink-0">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                My Inquiries
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Track and manage your past order inquiries and business communications.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="secondary" size="sm">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Inquiries List */}
        {loading ? (
          <div className="py-24 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200/80 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 shadow-sm">
            <Loader2 size={28} className="text-[#FF6A00] animate-spin" />
            <p className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Loading your inquiries...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-20 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200/80 dark:border-zinc-800 text-center px-4 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-md flex items-center justify-center mx-auto border border-zinc-200/80 dark:border-zinc-700">
              <ShoppingBag size={32} className="text-zinc-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1">
                No Inquiries Found
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto">
                You haven't sent any product inquiries yet. Browse local businesses and send inquiries directly via WhatsApp.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/">
                <Button variant="primary" size="md" icon={ArrowRight}>
                  Browse Local Shops
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-sm hover:border-[#FF6A00]/30 transition-all relative flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Shop Info */}
                  <div className="flex items-center gap-3 w-48 flex-shrink-0">
                    <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 flex-shrink-0 border border-zinc-200/80 dark:border-zinc-700">
                      <Store size={18} />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/shop/${inquiry.shopSlug}`} className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#FF6A00] transition-colors truncate tracking-tight flex items-center gap-1.5">
                        <span className="truncate">{inquiry.shopName}</span>
                      </Link>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                        <Calendar size={10} />
                        <span>
                          {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          }) : "Recently"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {inquiry.type === "WhatsApp Order" ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/10">
                            WhatsApp Checkout
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md border border-zinc-500/10">
                            {inquiry.type || "Inquiry"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Minimal Items Summary */}
                  {inquiry.items?.length > 0 && (
                    <div className="hidden md:flex items-center gap-2 flex-1 min-w-0 border-l border-zinc-100 dark:border-zinc-800 pl-4">
                      <div className="w-8 h-8 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <ShoppingBag size={14} className="text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {inquiry.items.length} {inquiry.items.length === 1 ? 'Item' : 'Items'}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[150px] lg:max-w-[200px]">
                          {inquiry.items.map(i => i.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions & Status */}
                <div className="flex items-center gap-3 flex-shrink-0 flex-wrap lg:flex-nowrap">
                  {inquiry.totalAmount > 0 && (
                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-md border border-zinc-200/80 dark:border-zinc-700">
                      ₹{inquiry.totalAmount}
                    </span>
                  )}

                  <span className="px-2.5 py-1.5 rounded-md text-xs font-bold bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20 flex items-center gap-1 w-28 justify-center">
                    <CheckCircle2 size={12} />
                    <span>{inquiry.status || "Submitted"}</span>
                  </span>

                  <div className="flex items-center gap-2 border-l border-zinc-100 dark:border-zinc-800 pl-3">
                    <Link href={`/shop/${inquiry.shopSlug}`}>
                      <Button variant="secondary" size="sm" icon={ExternalLink} className="!px-2 sm:!px-3" title="Visit Storefront">
                        <span className="hidden sm:inline">Store</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInquiriesPage;
