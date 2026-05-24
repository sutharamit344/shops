"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getShopsByOwner, isUserAdmin } from "@/lib/db";
import { useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import Link from "next/link";
import {
  Building2, Clock, CircleCheckBig, ChevronRight, Plus,
  ExternalLink, Settings2, CircleAlert, RefreshCw, Eye,
  History, Search, MapPin, Store, MessageSquare, Phone,
  TrendingUp, LayoutDashboard, Settings, CircleHelp,
  LogOut, ChevronDown, Shield, Star, Calendar, Mail, User,
  X, ShoppingBag, ListFilter, Image as ImageIcon, Share2,
  ArrowLeft, ChevronLeft, ArrowRight, Heart, PanelLeftClose, PanelLeft,
  MenuIcon, QrCode, ChefHat, Bell
} from "lucide-react";

import ShopHistoryDialog from "@/components/Shop/HistoryDialog";
import Image from "next/image";
import { BRAND } from "@/lib/config";

const UserDashboard = () => {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyShop, setHistoryShop] = useState(null);
  const [activeTab, setActiveTab] = useState("businesses");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { favorites } = useSelector((state) => state.auth);
  const { items: allShops } = useSelector((state) => state.shops);

  useEffect(() => {
    if (user) {
      const fetchMyShops = async () => {
        setLoading(true);
        const data = await getShopsByOwner(user.uid);
        setShops(data);
        setLoading(false);
      };
      fetchMyShops();
    }
  }, [user]);

  const totalViews = shops.reduce((acc, shop) => acc + (shop.views || 0), 0);
  const totalLeads = shops.reduce((acc, shop) => acc + (shop.leads || 0), 0);
  const approvedShops = shops.filter(s => s.status === 'approved').length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center bg-[#F7F7F5] dark:bg-zinc-950">
          <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-[0.2em]">Authenticating Console</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] dark:bg-zinc-950">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32">
          <Card className="p-12 text-center shadow-2xl bg-white dark:bg-zinc-900 border border-black/[0.05] dark:border-zinc-800">
            <div className="w-16 h-16 bg-[#FF6A00]/10 rounded-md flex items-center justify-center mx-auto mb-8">
              <Store size={32} className="text-[#FF6A00]" />
            </div>
            <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">
              Sign in to manage
            </h1>
            <p className="text-[14px] text-zinc-550 dark:text-zinc-400 mb-10 max-w-sm mx-auto font-medium">
              Access your merchant console and real-time performance analytics.
            </p>
            <Button
              onClick={loginWithGoogle}
              variant="dark"
              size="xl"
              icon={ArrowRight}
              className="px-10"
            >
              Sign In with Google
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const filteredShops = shops.filter(shop =>
    !searchQuery || shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarItems = [
    { id: "businesses", label: "Businesses", icon: Store, count: shops.length },
    { id: "saved", label: "Library", icon: Heart, count: favorites.length },
    { id: "profile", label: "Account", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">

      {/* ── MOBILE OVERLAY ─────────────────────────────────────── */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      </div>

      {/* ── SIDEBAR ───────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:relative bg-white dark:bg-zinc-900 border-r border-black/[0.05] dark:border-zinc-800 flex flex-col transition-all duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${isSidebarCollapsed ? "lg:w-[68px]" : "lg:w-[240px]"}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`h-[50px] flex items-center px-4 mb-3 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/brand-logo-v1.png" alt="ShopBajar" width={32} height={32} className="w-8 h-8 object-contain shrink-0" />
              {!isSidebarCollapsed && (
                <span className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Shop<span className="text-[#FF6A00]">Bajar</span>
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden w-8 h-8 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-zinc-400 dark:text-zinc-550">
              <X size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2.5 space-y-0.5">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-semibold transition-all ${isActive
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md animate-in fade-in duration-200"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-zinc-900 dark:hover:text-zinc-100"
                    } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={isSidebarCollapsed ? item.label : ""}
                >
                  <item.icon size={15} />
                  {!isSidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                  {item.count !== undefined && !isSidebarCollapsed && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white dark:bg-zinc-800/80 dark:text-zinc-200" : "bg-black/[0.05] dark:bg-white/[0.05] text-zinc-400 dark:text-zinc-500"}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
            {/* ── QR Ordering quick links ── */}
            <div className="pt-2 mt-1 border-t border-black/[0.04] dark:border-zinc-800 space-y-0.5">
              {!isSidebarCollapsed && (
                <p className="px-2.5 pb-1 text-[9px] font-black text-zinc-400/40 dark:text-zinc-500/40 uppercase tracking-[0.15em]">QR Ordering</p>
              )}
              <Link
                href="/dashboard/tables"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-zinc-900 dark:hover:text-zinc-100 transition-all ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                title={isSidebarCollapsed ? "Tables & QR" : ""}
              >
                <QrCode size={15} />
                {!isSidebarCollapsed && <span className="flex-1 text-left">Tables & QR</span>}
              </Link>
              <Link
                href="/dashboard/kitchen"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-zinc-900 dark:hover:text-zinc-100 transition-all ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                title={isSidebarCollapsed ? "Kitchen View" : ""}
              >
                <ChefHat size={15} />
                {!isSidebarCollapsed && <span className="flex-1 text-left">Kitchen View</span>}
              </Link>
              <Link
                href="/dashboard/waiter"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-zinc-900 dark:hover:text-zinc-100 transition-all ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                title={isSidebarCollapsed ? "Waiter Console" : ""}
              >
                <Bell size={15} />
                {!isSidebarCollapsed && <span className="flex-1 text-left">Waiter Console</span>}
              </Link>
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-2 border-t border-black/[0.05] dark:border-zinc-800 space-y-0.5">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden lg:flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-zinc-900 dark:hover:text-zinc-100 transition-all ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
            >
              {isSidebarCollapsed ? <PanelLeft size={15} /> : <><PanelLeftClose size={15} /> <span>Collapse</span></>}
            </button>

            <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-zinc-850 ${isSidebarCollapsed ? "justify-center px-1" : ""}`}>
              <div className="w-7 h-7 rounded-md bg-white dark:bg-zinc-800 border border-black/[0.05] dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden relative">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="p" fill className="object-cover" sizes="28px" />
                ) : (
                  <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">{user.email?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate">{user.displayName || "Merchant"}</p>
                  <p className="text-[9px] font-medium text-zinc-450 dark:text-zinc-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
            <button onClick={logout} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all ${isSidebarCollapsed ? "justify-center px-0" : ""}`}>
              <LogOut size={15} />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F7F7F5] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

        {/* Mobile Navbar */}
        <header className="lg:hidden h-[56px] bg-white dark:bg-zinc-900 border-b border-black/[0.05] dark:border-zinc-800 px-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="w-8 h-8 rounded-md bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-zinc-550 dark:text-zinc-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors">
            <MenuIcon size={16} />
          </button>
          <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Console</span>
          <div className="w-8 h-8" /> {/* Spacer */}
        </header>

        <main className="flex-1 p-3.5 lg:p-4.5 w-full">
          {activeTab === "businesses" && (
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-2">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3.5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FF6A00]/5 dark:bg-[#FF6A00]/10 text-[#FF6A00] rounded border border-[#FF6A00]/10 dark:border-[#FF6A00]/20 mb-1">
                    <LayoutDashboard size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Merchant Control Center</span>
                  </div>
                  <h1 className="text-[20px] md:text-[24px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Active Businesses</h1>
                </div>
                <Link href="/create">
                  <Button variant="dark" icon={Plus} size="sm" className="h-8 text-xs">Deploy New Business</Button>
                </Link>
              </header>

              {/* Stats High-Density */}
              {shops.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3.5">
                  {[
                    { label: "Active Businesses", value: approvedShops, icon: Store },
                    { label: "Pending", value: shops.length - approvedShops, icon: Clock },
                    { label: "Gross Views", value: totalViews.toLocaleString(), icon: Eye },
                    { label: "Network Leads", value: totalLeads.toLocaleString(), icon: TrendingUp },
                  ].map((stat, i) => (
                    <Card key={i} padding={false} className="p-2.5 border-black/[0.03] dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-6 h-6 rounded bg-[#FF6A00]/5 dark:bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                          <stat.icon size={12} />
                        </div>
                        <div className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                      </div>
                      <div className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100 leading-none">{stat.value}</div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Search Toolbar */}
              <div className="mb-3.5 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-[#FF6A00] transition-colors" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter businesses by name, location or status..."
                  className="w-full h-9 pl-9 pr-3 bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-zinc-800 rounded-md focus:outline-none focus:border-[#FF6A00]/40 text-xs font-medium text-zinc-900 dark:text-zinc-100 transition-all shadow-sm"
                />
              </div>

              {/* Business Listings */}
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white dark:bg-zinc-900 rounded-md animate-pulse border border-black/[0.05] dark:border-zinc-800" />)}
                </div>
              ) : filteredShops.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-md border border-dashed border-black/[0.1] dark:border-zinc-800">
                  <div className="w-12 h-12 bg-black/[0.02] dark:bg-white/[0.02] rounded-md flex items-center justify-center mx-auto mb-3 text-zinc-405 dark:text-zinc-600">
                    <Search size={20} />
                  </div>
                  <h3 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 mb-1">No matching businesses</h3>
                  <p className="text-[12px] text-zinc-450 dark:text-zinc-500 font-medium">Try refining your search parameters.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredShops.map(shop => (
                    <Card key={shop.id} padding={false} className="p-3 group hover:border-[#FF6A00]/40 dark:hover:border-[#FF6A00]/60 transition-all duration-300">
                      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                        <div className="w-12 h-12 rounded-md bg-black/[0.02] dark:bg-zinc-800 border border-black/[0.05] dark:border-zinc-700 overflow-hidden relative shrink-0">
                          {shop.logo ? (
                            <Image src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo} alt="logo" fill className="object-cover" sizes="48px" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#FF6A00] font-bold text-lg">{shop.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h3 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{shop.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${shop.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                              shop.status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-amber-500/10 text-amber-650 dark:bg-amber-550/20 dark:text-amber-400'
                              }`}>
                              {shop.status === 'approved' ? 'Operational' : shop.status === 'rejected' ? 'Rejected' : 'Provisioning'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                            <span className="flex items-center gap-1"><Store size={11} className="text-[#FF6A00]" /> {shop.category}</span>
                            <span className="flex items-center gap-1"><MapPin size={11} /> {shop.city}</span>
                            <span className="flex items-center gap-1"><TrendingUp size={11} /> {shop.views || 0} hits</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 w-full md:w-auto items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={History}
                            className="h-8 w-8 p-0 shrink-0 border border-black/[0.08] dark:border-zinc-800 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                            title="Audit History"
                            onClick={() => setHistoryShop(shop)}
                          />
                          <Button variant="outline" size="sm" icon={ExternalLink} className="flex-1 md:flex-none h-8 text-[11px] px-2.5" onClick={() => window.open(`/shop/${shop.slug}`, '_blank')}>View</Button>
                          <Link href={`/dashboard/manage?id=${shop.id}`} className="flex-1 md:flex-none">
                            <Button variant="dark" size="sm" icon={Settings} className="w-full h-8 text-[11px] px-2.5">Configure</Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-2">
              <header className="mb-4">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/5 dark:bg-red-500/10 text-red-500 rounded border border-red-500/10 mb-1">
                  <Heart size={10} fill="currentColor" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Saved Collection</span>
                </div>
                <h1 className="text-[20px] md:text-[24px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Saved Businesses</h1>
              </header>

              {favorites.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-md border border-dashed border-black/[0.1] dark:border-zinc-800">
                  <Heart size={32} className="mx-auto text-zinc-300 dark:text-zinc-650 mb-3" />
                  <p className="text-[12px] text-zinc-550 dark:text-zinc-400 font-medium">No saved shops in your library.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allShops.filter(s => favorites.includes(s.id)).map(shop => (
                    <Card key={shop.id} padding={false} className="p-2.5 dark:border-zinc-800">
                      <div className="flex gap-2.5 items-center">
                        <div className="w-10 h-10 rounded-md bg-black/[0.02] dark:bg-zinc-800 border border-black/[0.05] dark:border-zinc-700 shrink-0 overflow-hidden relative">
                          <Image src={shop.logo || "/placeholder.png"} alt="l" fill className="object-cover" sizes="40px" unoptimized />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">{shop.name}</h4>
                          <p className="text-[10px] text-zinc-450 dark:text-zinc-400 font-medium">{shop.category}</p>
                        </div>
                        <Button variant="ghost" size="sm" icon={ChevronRight} className="p-1.5 h-7 w-7 rounded-md" onClick={() => window.open(`/shop/${shop.slug}`, '_blank')} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-2 max-w-xl">
              <header className="mb-4">
                <h1 className="text-[20px] md:text-[24px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Account Configuration</h1>
              </header>

              <Card padding={false} className="p-4 md:p-6 dark:border-zinc-800">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-md bg-white dark:bg-zinc-850 border-2 border-white dark:border-zinc-800 shadow-md relative overflow-hidden mb-3">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt="p" fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xl font-bold">{user.email?.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{user.displayName || "Verified Merchant"}</h2>
                  <p className="text-[12px] font-medium text-zinc-550 dark:text-zinc-400">{user.email}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Businesses", value: shops.length },
                    { label: "Views", value: totalViews },
                    { label: "Leads", value: totalLeads },
                  ].map((stat, i) => (
                    <div key={i} className="p-2.5 bg-black/[0.01] dark:bg-white/[0.01] rounded-md border border-black/[0.03] dark:border-zinc-800 text-center">
                      <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</div>
                      <div className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-black/[0.05] dark:border-zinc-800">
                  <Button variant="outline" className="w-full border-red-500/10 dark:border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 hover:border-red-500/20 text-xs h-9" icon={LogOut} onClick={logout}>Sign Out Securely</Button>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      <ShopHistoryDialog shop={historyShop} isOpen={!!historyShop} onClose={() => setHistoryShop(null)} />
    </div>
  );
};

export default UserDashboard;
