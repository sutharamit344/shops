"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/UI/Button";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getPendingShops, getUpdatedShops, getApprovedShops, approveShop, rejectShop } from "@/lib/db";
import { useModal } from "@/hooks/useModal";

import AdminShopCard from "@/components/Admin/ShopCard";

import CategoryManager from "@/components/Admin/CategoryManager";
import GlobalActivity from "@/components/Admin/GlobalActivity";
import DatabaseManager from "@/components/Admin/DatabaseManager";
import Sidebar from "@/components/Admin/Sidebar";
import Pagination from "@/components/UI/Pagination";
import { ShieldCheck, RefreshCw, AlertCircle, ShieldAlert, LayoutDashboard, Tag, LogOut, Loader2, History, Search, Store, ArrowRight, CheckCircle2, Clock, ChevronLeft, ChevronRight, Menu } from "lucide-react";


import { isUserAdmin } from "@/lib/db";

const AdminDashboard = () => {
  const { user, loginWithGoogle, logout, loading: authLoading } = useAuth();
  const { showAlert, showConfirm, showPrompt } = useModal();
  const [shops, setShops] = useState([]);
  const [updatedShops, setUpdatedShops] = useState([]);
  const [approvedShops, setApprovedShops] = useState([]);
  const [rejectedShops, setRejectedShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [selectedShops, setSelectedShops] = useState(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const itemsPerPage = 8;

  const fetchShops = async () => {
    setLoading(true);
    try {
      const [allPending, updated, approved] = await Promise.all([
        getPendingShops(),
        getUpdatedShops(),
        getApprovedShops()
      ]);

      setShops(allPending.filter(s => s.status === 'pending'));
      setRejectedShops(allPending.filter(s => s.status === 'rejected'));
      setUpdatedShops(updated);
      setApprovedShops(approved);
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
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

  useEffect(() => {
    setCurrentPage(1);
    setSelectedShops(new Set());
  }, [activeMainTab, activeSubTab]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pin === "1234") {
      setIsUnlocked(true);
    } else {
      showAlert({ 
        title: "Security Failure", 
        message: "Invalid Security PIN. Access denied.", 
        type: "error" 
      });
      setPin("");
    }
  };

  const toggleSelectShop = (id) => {
    setSelectedShops(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkApprove = async () => {
    if (!selectedShops.size) return;
    
    showConfirm({
      title: "Bulk Approval",
      message: `Are you sure you want to approve ${selectedShops.size} selected shop(s)?`,
      confirmText: "Yes, Approve All",
      onConfirm: async () => {
        setBulkLoading(true);
        await Promise.all([...selectedShops].map(id => approveShop(id, user?.email)));
        setSelectedShops(new Set());
        fetchShops();
        setBulkLoading(true); // Keep loading state until fetchShops finishes
        setBulkLoading(false);
      }
    });
  };

  const handleBulkReject = async () => {
    if (!selectedShops.size) return;
    
    showPrompt({
      title: "Bulk Rejection",
      message: `Please provide a reason for rejecting ${selectedShops.size} shop(s):`,
      confirmText: "Reject All",
      onConfirm: async (reason) => {
        if (!reason?.trim()) {
          showAlert({ title: "Error", message: "A reason is required for rejection.", type: "error" });
          return;
        }
        setBulkLoading(true);
        await Promise.all([...selectedShops].map(id => rejectShop(id, reason, user?.email)));
        setSelectedShops(new Set());
        fetchShops();
        setBulkLoading(false);
      }
    });
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin mb-4" />
        <p className="text-[11px] font-bold text-[#1A1F36]/30 uppercase tracking-[0.2em]">Authority Check in Progress...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8 border border-red-100 shadow-md shadow-red-500/5">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-[32px] font-bold text-[#1A1F36] mb-3 tracking-tight">Access Restricted</h1>
        <p className="text-[#666] mb-10 max-w-sm text-[15px] leading-relaxed">This terminal is reserved for platform administrators only. Please return to the homepage.</p>
        <Link href="/">
          <button className="h-12 px-8 bg-[#1A1F36] text-white rounded-xl font-bold text-[13px] hover:bg-[#333] transition-all active:scale-95 shadow-md">
            Return to Safety
          </button>
        </Link>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[32px] border border-[#1A1F36]/[0.06] p-10 shadow-md shadow-[#1A1F36]/[0.02]">
          <div className="w-16 h-16 bg-[#FF6B35] rounded-2xl flex items-center justify-center mb-8 shadow-md shadow-[#FF6B35]/20 mx-auto">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1F36] text-center mb-2 tracking-tight">Admin Gate</h2>
          <p className="text-[#666] text-[14px] text-center mb-10">Enter your security PIN to access the control suite.</p>
          
          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Security PIN</label>
              <input
                type="password"
                value={pin}
                autoFocus
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full h-14 bg-gray-50 border border-[#1A1F36]/[0.07] rounded-2xl px-6 text-center text-2xl tracking-[1em] outline-none focus:border-[#FF6B35] transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full h-14 bg-[#1A1F36] text-white rounded-xl font-bold text-[14px] hover:bg-[#333] transition-all active:scale-95 shadow-md"
            >
              Authenticate
            </button>
          </form>
          
          <button 
            onClick={logout}
            className="w-full mt-6 text-[11px] font-bold text-[#1A1F36]/30 uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF8] min-h-screen relative">
      <Sidebar 
        activeTab={activeMainTab} 
        onTabChange={setActiveMainTab} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"} min-h-screen flex flex-col`}>
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-[#1A1F36]/[0.06] px-6 flex items-center justify-between sticky top-0 z-[200]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#1A1F36]"
            >
              <Menu size={20} />
            </button>
            <span className="text-[14px] font-bold text-[#1A1F36]">Studio Admin</span>
          </div>
          <div className="w-9 h-9 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-md shadow-[#FF6B35]/20">
            <ShieldCheck size={18} className="text-white" />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-12 w-full">
          {activeMainTab === 'dashboard' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto max-w-7xl w-full">
              {/* Header */}
              <div className="mb-10 w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F36] tracking-tight mb-2">
                  System Overview
                </h1>
                <p className="text-[14px] text-[#666]">Real-time platform performance and audit status.</p>
              </div>

              {/* High-Impact Stat Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                {[
                  { label: 'Pending Audit', count: shops.length, color: '#FF6B35', icon: AlertCircle },
                  { label: 'Updates Pending', count: updatedShops.length, color: '#1A1F36', icon: RefreshCw },
                  { label: 'Live Shops', count: approvedShops.length, color: '#25D366', icon: ShieldCheck },
                  { label: 'Rejected', count: rejectedShops.length, color: '#ef4444', icon: History }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-7 rounded-2xl border border-[#1A1F36]/[0.07] shadow-md hover:shadow-lg transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                      >
                        <stat.icon size={20} />
                      </div>
                      <span className="text-[32px] font-black text-[#1A1F36] tracking-tight">{stat.count}</span>
                    </div>
                    <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-widest">{stat.label}</h3>
                  </div>
                ))}
              </div>

              {/* Analytics Breakdown */}
              {!loading && approvedShops.length > 0 && (() => {
                // City breakdown
                const cityCount = approvedShops.reduce((acc, s) => {
                  const city = s.city || "Unknown";
                  acc[city] = (acc[city] || 0) + 1;
                  return acc;
                }, {});
                const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

                // Category breakdown
                const catCount = approvedShops.reduce((acc, s) => {
                  const cat = s.category || "Uncategorized";
                  acc[cat] = (acc[cat] || 0) + 1;
                  return acc;
                }, {});
                const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

                // Top performing shops by views
                const topShops = [...approvedShops]
                  .filter(s => s.views > 0 || s.leads > 0)
                  .sort((a, b) => ((b.views || 0) + (b.leads || 0) * 3) - ((a.views || 0) + (a.leads || 0) * 3))
                  .slice(0, 5);

                const maxCity = topCities[0]?.[1] || 1;
                const maxCat = topCats[0]?.[1] || 1;

                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-[20px] font-bold text-[#1A1F36] tracking-tight">Platform Analytics</h2>
                      <span className="text-[10px] font-bold text-[#1A1F36]/30 uppercase tracking-widest">Live Data</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Shops by City */}
                      <div className="bg-white rounded-2xl border border-[#1A1F36]/[0.07] p-6 shadow-md">
                        <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-widest mb-5">Shops by City</h3>
                        <div className="space-y-3">
                          {topCities.map(([city, count]) => (
                            <div key={city}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[13px] font-bold text-[#1A1F36]">{city}</span>
                                <span className="text-[11px] font-bold text-[#FF6B35]">{count}</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF6B35]/60 rounded-full transition-all duration-500"
                                  style={{ width: `${(count / maxCity) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Category Breakdown */}
                      <div className="bg-white rounded-2xl border border-[#1A1F36]/[0.07] p-6 shadow-md">
                        <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-widest mb-5">Top Categories</h3>
                        <div className="space-y-3">
                          {topCats.map(([cat, count]) => (
                            <div key={cat}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[13px] font-bold text-[#1A1F36] truncate max-w-[140px]">{cat}</span>
                                <span className="text-[11px] font-bold text-[#1A1F36]/60">{count}</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#1A1F36] to-[#1A1F36]/50 rounded-full transition-all duration-500"
                                  style={{ width: `${(count / maxCat) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Performing Shops */}
                      <div className="bg-white rounded-2xl border border-[#1A1F36]/[0.07] p-6 shadow-md">
                        <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-widest mb-5">Top Engagement</h3>
                        {topShops.length > 0 ? (
                          <div className="space-y-4">
                            {topShops.map((shop, i) => (
                              <div key={shop.id} className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-[#1A1F36]/20 w-4">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-bold text-[#1A1F36] truncate">{shop.name}</p>
                                  <p className="text-[10px] text-[#999] font-medium">{shop.views || 0} views · {shop.leads || 0} leads</p>
                                </div>
                                <div className="flex items-center gap-1 bg-[#FF6B35]/10 px-2 py-1 rounded-full">
                                  <span className="text-[10px] font-black text-[#FF6B35]">{(shop.views || 0) + (shop.leads || 0) * 3}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[13px] text-[#999] text-center mt-8">No engagement data yet.<br/>Shops need views or leads to appear here.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-[20px] font-bold text-[#1A1F36] tracking-tight">Recent Submissions</h2>
                    <button 
                      onClick={() => setActiveMainTab('shops')} 
                      className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      Audit Queue <ArrowRight size={14} />
                    </button>
                  </div>
                  {shops.length > 0 ? (
                    <div className="space-y-4">
                      {shops.slice(0, 4).map(shop => (
                        <div key={shop.id} className="bg-white p-5 rounded-2xl border border-[#1A1F36]/[0.07] flex items-center justify-between hover:border-[#FF6B35]/30 transition-all group shadow-md">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-black/[0.04] text-[#FF6B35]">
                              <Store size={20} />
                            </div>
                            <div className="space-y-0.5">
                              <h3 className="text-[15px] font-bold text-[#1A1F36] group-hover:text-[#FF6B35] transition-colors">{shop.name}</h3>
                              <p className="text-[11px] font-medium text-[#999] uppercase tracking-wider">{shop.category} • {shop.city}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => { setActiveMainTab('shops'); setActiveSubTab('pending'); }} 
                            className="w-10 h-10 rounded-xl bg-gray-50 text-[#1A1F36] flex items-center justify-center hover:bg-[#1A1F36] hover:text-white transition-all shadow-md"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-16 rounded-2xl border border-dashed border-[#1A1F36]/[0.1] text-center shadow-md">
                      <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} />
                      </div>
                      <p className="text-[14px] font-bold text-[#1A1F36] mb-1">Queue is Empty</p>
                      <p className="text-[12px] text-[#999]">All business registrations have been processed.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h2 className="text-[20px] font-bold text-[#1A1F36] tracking-tight px-2">System Status</h2>
                  <div className="bg-[#1A1F36] p-8 rounded-2xl shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                      <ShieldCheck size={160} />
                    </div>
                    <div className="relative z-10 space-y-8">
                      <div className="space-y-3">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Security Protocol</p>
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse shadow-lg shadow-[#25D366]/40"></div>
                          <span className="text-white font-bold text-[15px]">Active & Protected</span>
                        </div>
                      </div>
                      <div className="h-px bg-white/10 w-full"></div>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Audit Logs</span>
                          <span className="text-[#25D366] font-bold text-[11px] uppercase tracking-wider">Enabled</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Database</span>
                          <span className="text-[#FF6B35] font-bold text-[11px] uppercase tracking-wider">Optimal</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">CDN Cache</span>
                          <span className="text-blue-400 font-bold text-[11px] uppercase tracking-wider">Purged</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeMainTab === "shops" ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto max-w-7xl w-full">
              {/* Header */}
              <div className="flex items-center gap-5 w-full">
                <div className={`w-1.5 h-12 rounded-full ${
                  activeSubTab === 'pending' ? 'bg-[#FF6B35]' :
                  activeSubTab === 'updates' ? 'bg-[#1A1F36]' :
                  activeSubTab === 'approved' ? 'bg-[#25D366]' : 'bg-[#ef4444]'
                }`}></div>
                <div>
                  <h2 className="text-[28px] font-bold text-[#1A1F36] tracking-tight">
                    {activeSubTab === 'pending' ? 'Pending Registrations' :
                      activeSubTab === 'updates' ? 'Modification Audit' :
                      activeSubTab === 'approved' ? 'Verified Businesses' : 'Rejected Applications'}
                  </h2>
                  <p className="text-[13px] font-medium text-[#999] tracking-wide">
                    {activeSubTab === 'pending' ? `${shops.length} businesses waiting for manual review` :
                      activeSubTab === 'updates' ? `${updatedShops.length} live shops modified their data` :
                      activeSubTab === 'approved' ? `${approvedShops.length} shops are currently public` :
                      `${rejectedShops.length} applications were moved to archive`}
                  </p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex bg-white p-1.5 rounded-xl border border-[#1A1F36]/[0.07] shadow-md overflow-x-auto no-scrollbar">
                  {[
                    { id: 'pending', label: 'Pending', count: shops.length },
                    { id: 'updates', label: 'Updates', count: updatedShops.length },
                    { id: 'approved', label: 'Approved', count: approvedShops.length },
                    { id: 'rejected', label: 'Rejected', count: rejectedShops.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id)}
                      className={`px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2.5 ${
                        activeSubTab === tab.id 
                          ? 'bg-[#1A1F36] text-white shadow-md shadow-[#1A1F36]/10' 
                          : 'text-[#1A1F36]/60 hover:text-[#1A1F36] hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] ${activeSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#1A1F36]/5 text-[#1A1F36]/40'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative group flex-1 md:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1A1F36]/30 group-focus-within:text-[#FF6B35] transition-colors" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-14 pr-6 py-4 bg-white border border-[#1A1F36]/[0.07] rounded-xl shadow-md focus:border-[#FF6B35]/30 outline-none text-[14px] font-medium transition-all"
                    />
                  </div>
                  <button
                    onClick={fetchShops}
                    disabled={loading}
                    className="w-14 h-14 bg-white border border-[#1A1F36]/[0.07] rounded-xl flex items-center justify-center hover:border-[#FF6B35]/30 transition-all text-[#1A1F36]/60 shadow-md"
                  >
                    <RefreshCw size={20} className={loading ? "animate-spin text-[#FF6B35]" : ""} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-[#1A1F36]/[0.07] shadow-md"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    const filtered = (activeSubTab === 'pending' ? shops :
                      activeSubTab === 'updates' ? updatedShops :
                      activeSubTab === 'approved' ? approvedShops : rejectedShops)
                      .filter(shop => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          shop.name?.toLowerCase().includes(q) ||
                          shop.ownerEmail?.toLowerCase().includes(q) ||
                          shop.city?.toLowerCase().includes(q) ||
                          shop.category?.toLowerCase().includes(q)
                        );
                      });

                    if (filtered.length === 0) {
                      return (
                        <div className="bg-white border border-[#1A1F36]/[0.07] rounded-2xl py-24 text-center shadow-md">
                          <h3 className="text-xl font-bold text-[#1A1F36] mb-1">No Results</h3>
                          <p className="text-[14px] text-[#666]">Try a different search or filter.</p>
                        </div>
                      );
                    }

                    const totalPages = Math.ceil(filtered.length / itemsPerPage);
                    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                    return (
                      <div className="space-y-6">
                        {/* Bulk Actions Bar */}
                        {(activeSubTab === 'pending' || activeSubTab === 'rejected') && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#1A1F36]/[0.07] shadow-md flex-wrap relative overflow-hidden">
                            {bulkLoading && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <Loader2 size={16} className="text-[#FF6B35] animate-spin" />
                              </div>
                            )}
                            <button
                              onClick={() => {
                                const allSelected = paginated.every(s => selectedShops.has(s.id));
                                if (allSelected) {
                                  setSelectedShops(prev => { const next = new Set(prev); paginated.forEach(s => next.delete(s.id)); return next; });
                                } else {
                                  setSelectedShops(prev => { const next = new Set(prev); paginated.forEach(s => next.add(s.id)); return next; });
                                }
                              }}
                              disabled={bulkLoading}
                              className="px-3 py-1.5 bg-gray-50 border border-[#1A1F36]/[0.06] rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#1A1F36]/40 disabled:opacity-50"
                            >
                              {paginated.every(s => selectedShops.has(s.id)) ? "Deselect All" : "Select All"}
                            </button>
                            {selectedShops.size > 0 && (
                              <div className="flex items-center gap-2 ml-auto">
                                <span className="text-[10px] font-bold text-[#1A1F36]/30 uppercase tracking-wider mr-2">{selectedShops.size} selected</span>
                                <button 
                                  onClick={handleBulkApprove} 
                                  disabled={bulkLoading}
                                  className="px-4 py-1.5 bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={handleBulkReject} 
                                  disabled={bulkLoading}
                                  className="px-4 py-1.5 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-5">
                          {paginated.map((shop) => (
                            <AdminShopCard
                              key={shop.id}
                              shop={shop}
                              onRefresh={fetchShops}
                              isSelected={selectedShops.has(shop.id)}
                              onToggleSelect={(activeSubTab === 'pending' || activeSubTab === 'rejected') ? toggleSelectShop : undefined}
                            />
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex justify-center pt-8">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                              totalItems={filtered.length}
                              itemsPerPage={itemsPerPage}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : activeMainTab === "database" ? (
            <div className="mx-auto max-w-7xl w-full">
              <DatabaseManager />
            </div>
          ) : activeMainTab === "categories" ? (
            <div className="mx-auto max-w-7xl w-full">
              <CategoryManager />
            </div>
          ) : (
            <div className="mx-auto max-w-7xl w-full">
              <GlobalActivity />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
