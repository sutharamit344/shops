"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/UI/Button";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getPendingShops } from "@/lib/db";
import AdminShopCard from "@/components/Admin/ShopCard";
import CategoryManager from "@/components/Admin/CategoryManager";
import { ShieldCheck, RefreshCw, AlertCircle, ShieldAlert, LayoutDashboard, Tag, LogOut, Loader2 } from "lucide-react";

import { isUserAdmin } from "@/lib/db";

const AdminDashboard = () => {
  const { user, loginWithGoogle, logout, loading: authLoading } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("shops"); // "shops" or "categories"
  const [isAdmin, setIsAdmin] = useState(null);

  const fetchShops = async () => {
    setLoading(true);
    const data = await getPendingShops();
    setShops(data);
    setLoading(false);
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      if (user) {
        const status = await isUserAdmin();
        setIsAdmin(status);
        if (status) fetchShops();
      } else {
        setIsAdmin(false);
      }
    };
    verifyAdmin();
  }, [user]);

  if (authLoading || isAdmin === null) return <div className="min-h-screen bg-cream flex items-center justify-center p-4 text-navy font-bold uppercase tracking-widest text-xs">Validating Admin...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-xl shadow-red-200">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-4xl font-black text-navy mb-4 tracking-tighter uppercase italic">Access Denied</h1>
        <p className="text-gray-500 mb-8 max-w-sm font-medium">This area is reserved for platform administrators only.</p>
        <Link href="/"><Button variant="outline">Back to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold mb-2">
              <ShieldCheck size={20} /> System Administrator
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tighter italic mb-2">Control <span className="text-primary tracking-normal">Central</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Management & Verification Suite</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-[24px] shadow-xl shadow-cream/50 border border-white">
            <button
              onClick={() => setActiveTab("shops")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-tighter text-xs transition-all ${activeTab === 'shops' ? 'bg-navy text-white shadow-lg' : 'text-gray-400 hover:text-navy cursor-pointer'}`}
            >
              <LayoutDashboard size={16} /> Shops {shops.length > 0 && <span className="bg-primary text-white px-2 py-0.5 rounded-full text-[10px]">{shops.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-tighter text-xs transition-all ${activeTab === 'categories' ? 'bg-navy text-white shadow-lg' : 'text-gray-400 hover:text-navy cursor-pointer'}`}
            >
              <Tag size={16} /> Categories
            </button>
          </div>
        </header>

        {activeTab === "shops" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 mb-2 px-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-primary rounded-full"></div>
                <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Pending Verifications</h2>
              </div>
              <Button
                onClick={fetchShops}
                variant="outline"
                className="flex items-center gap-2 rounded-xl border-gray-100"
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
              </Button>
            </div>

            {loading ? (
              <div className="space-y-6 py-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-[32px] h-40 animate-pulse border border-cream shadow-sm"></div>
                ))}
              </div>
            ) : shops.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-cream rounded-[40px] p-20 text-center">
                <div className="w-16 h-16 bg-whatsapp/10 rounded-full flex items-center justify-center mx-auto mb-6 text-whatsapp">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-black text-navy mb-2">Queue Clear!</h2>
                <p className="text-gray-500 font-medium italic">No pending submissions need your attention right now.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] px-2 italic">
                  Critical Review Layer: {shops.length} waiting
                </p>
                {shops.map((shop) => (
                  <AdminShopCard key={shop.id} shop={shop} onRefresh={fetchShops} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <CategoryManager />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
