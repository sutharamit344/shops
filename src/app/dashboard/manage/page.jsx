"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getShopById } from "@/lib/db";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Settings2,
  Share2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  Zap,
  BarChart3
} from "lucide-react";
import Link from "next/link";

function ShopDashboardContent() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("id");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && shopId) {
      const fetchShop = async () => {
        const data = await getShopById(shopId);
        if (data && data.ownerId === user.uid) {
          setShop(data);
        }
        setLoading(false);
      };
      fetchShop();
    } else if (!authLoading && !shopId) {
      setLoading(false);
    }
  }, [user, shopId, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#FF6B35] border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Hydrating Console...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-[32px] flex items-center justify-center mb-6">
          <AlertCircle size={40} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-black text-[#0F0F0F] mb-2 tracking-tight">Business Not Found</h1>
        <p className="text-[15px] text-[#666] mb-8 max-w-sm">
          We couldn't locate this business in your portfolio. It may have been moved or deleted.
        </p>
        <Link href="/dashboard" className="h-11 px-6 bg-[#0F0F0F] text-white text-[13px] font-bold rounded-xl flex items-center">
          Return to Console
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-20">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#666] hover:text-[#0F0F0F] mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back to My Businesses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-[40px] p-8 md:p-10 border border-black/[0.05] shadow-xl shadow-black/[0.01]">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 rounded-[36px] bg-gray-50 flex-shrink-0 overflow-hidden border border-black/[0.05] shadow-sm">
                  {shop.logo ? (
                    <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F8F8F8] to-[#F2F2F2] text-[#FF6B35] text-4xl font-black">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h1 className="text-3xl md:text-4xl font-black text-[#0F0F0F] tracking-tight">{shop.name}</h1>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${shop.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-[#FF6B35]/10 text-[#FF6B35]'}`}>
                      {shop.status === 'approved' ? <CheckCircle2 size={10} fill="currentColor" className="text-white" /> : <Clock size={10} />}
                      {shop.status}
                    </span>
                  </div>

                  <p className="text-[15px] text-[#666] leading-relaxed mb-6 max-w-xl">
                    {shop.description || "Manage your digital presence and customer interactions for this storefront."}
                  </p>

                  <div className="flex flex-wrap gap-4 text-[13px] font-bold text-[#0F0F0F]">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-black/[0.04]">
                      <Building2 size={16} className="text-[#FF6B35]" />
                      {shop.category}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-black/[0.04]">
                      <MapPin size={16} className="text-[#FF6B35]" />
                      {shop.city}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-black/[0.04]">
                      <Calendar size={16} className="text-[#FF6B35]" />
                      {shop.createdAt ? new Date(shop.createdAt.seconds * 1000).toLocaleDateString() : 'Active'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Profile Traffic", value: shop.views || 0, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Business Leads", value: shop.leads || 0, icon: MessageSquare, color: "text-green-600", bg: "bg-green-50" },
                { label: "Search Ranking", value: "#14", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[36px] border border-black/[0.05] shadow-sm hover:shadow-md transition-all">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} mb-4`}>
                    <stat.icon size={22} />
                  </div>
                  <p className="text-[11px] font-black text-[#999] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-[#0F0F0F]">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[40px] p-8 md:p-10 border border-black/[0.05] shadow-sm">
              <h3 className="text-xl font-black text-[#0F0F0F] mb-8 tracking-tight flex items-center gap-3">
                <Zap size={22} className="text-[#FF6B35]" />
                Management Center
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link href={`/edit?id=${shop.id}`} className="p-6 bg-gray-50 rounded-[32px] border border-black/[0.04] hover:bg-white hover:border-[#FF6B35]/30 hover:shadow-lg transition-all group text-center">
                  <Settings2 size={24} className="text-[#666] group-hover:text-[#FF6B35] mx-auto mb-3" />
                  <span className="text-[13px] font-bold text-[#0F0F0F] block">Edit Store</span>
                </Link>
                {shop.status === 'approved' ? (
                  <Link href={`/${encodeURIComponent(shop.city)}/${encodeURIComponent(shop.category)}/${encodeURIComponent(shop.slug)}`} className="p-6 bg-gray-50 rounded-[32px] border border-black/[0.04] hover:bg-white hover:border-[#FF6B35]/30 hover:shadow-lg transition-all group text-center">
                    <ExternalLink size={24} className="text-[#666] group-hover:text-[#FF6B35] mx-auto mb-3" />
                    <span className="text-[13px] font-bold text-[#0F0F0F] block">View Live</span>
                  </Link>
                ) : (
                  <button disabled className="p-6 bg-gray-50/50 rounded-[32px] border border-black/[0.02] opacity-60 cursor-not-allowed group text-center">
                    <ExternalLink size={24} className="text-[#999] mx-auto mb-3" />
                    <span className="text-[13px] font-bold text-[#999] block">Pending Approval</span>
                  </button>
                )}
                <button className="p-6 bg-gray-50 rounded-[32px] border border-black/[0.04] hover:bg-white hover:border-[#FF6B35]/30 hover:shadow-lg transition-all group text-center">
                  <Share2 size={24} className="text-[#666] group-hover:text-[#FF6B35] mx-auto mb-3" />
                  <span className="text-[13px] font-bold text-[#0F0F0F] block">Share Page</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#0F0F0F] rounded-[40px] p-8 text-white text-center shadow-2xl shadow-black/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <h3 className="text-lg font-black mb-6 tracking-tight flex items-center justify-center gap-2">
                <QrCode size={20} className="text-[#FF6B35]" />
                Store QR Code
              </h3>
              <div className="bg-white p-6 rounded-[32px] aspect-square flex items-center justify-center mb-6 shadow-xl">
                <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
                  <QrCode size={80} />
                </div>
              </div>
              <p className="text-[12px] text-white/60 mb-6 font-medium leading-relaxed">
                Print this QR code for your physical shop to let customers browse your digital catalog instantly.
              </p>
              <button className="w-full h-12 bg-white text-[#0F0F0F] rounded-2xl text-[13px] font-bold hover:bg-white/90 transition-all">
                Download QR Kit
              </button>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-black/[0.05] shadow-sm">
              <h3 className="text-lg font-black text-[#0F0F0F] mb-6 tracking-tight flex items-center gap-2">
                <TrendingUp size={18} className="text-[#FF6B35]" />
                Recent Activity
              </h3>
              <div className="space-y-6">
                {[
                  { event: "Profile updated", time: "2h ago", icon: Settings2 },
                  { event: "New lead from WhatsApp", time: "5h ago", icon: MessageSquare },
                  { event: "Store approved", time: "1d ago", icon: CheckCircle2 },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <item.icon size={14} className="text-[#666]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#0F0F0F] leading-tight mb-0.5">{item.event}</p>
                      <p className="text-[11px] text-[#999] font-medium">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ShopDashboard() {
  return (
    <Suspense fallback={null}>
      <ShopDashboardContent />
    </Suspense>
  );
}
