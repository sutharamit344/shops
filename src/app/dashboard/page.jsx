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
  Building2, Clock, CheckCircle2, ChevronRight, Plus,
  ExternalLink, Settings2, AlertCircle, RefreshCw, Eye,
  History, Search, MapPin, Store, MessageSquare, Phone,
  TrendingUp, LayoutDashboard, Settings, HelpCircle,
  LogOut, ChevronDown, Shield, Star, Calendar, Mail, User,
  X, ShoppingBag, ListFilter, Image as ImageIcon, Share2,
  ArrowLeft, ChevronLeft,
  ArrowRight, Heart
} from "lucide-react";

import ShopHistoryDialog from "@/components/Shop/HistoryDialog";
import ShopCard from "@/components/Shop/ShopCard";

const UserDashboard = () => {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyShop, setHistoryShop] = useState(null);
  const [activeTab, setActiveTab] = useState("businesses");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchMyShops = async () => {
        setLoading(true);
        const [data, adminStatus] = await Promise.all([
          getShopsByOwner(user.uid),
          isUserAdmin()
        ]);
        setShops(data);
        setIsAdmin(adminStatus);
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
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#FF6B35] border-t-transparent animate-spin mx-auto mb-6"></div>
          <p className="text-[11px] font-bold text-[#1A1F36]/30 uppercase tracking-[0.2em]">Loading Console</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-32">
          <Card className="p-16 text-center shadow-md">
            <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Store size={40} className="text-[#FF6B35]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1F36] mb-4 tracking-tight">
              Sign in to manage
            </h1>
            <p className="text-[16px] text-[#1A1F36]/50 mb-10 max-w-md mx-auto font-medium">
              Access your merchant console and real-time performance analytics.
            </p>
            <Button
              onClick={loginWithGoogle}
              variant="dark"
              size="xl"
              icon={ArrowRight}
              iconPosition="right"
              className="px-10 shadow-md shadow-[#1A1F36]/20"
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

  const { favorites } = useSelector((state) => state.auth);
  const { items: allShops } = useSelector((state) => state.shops);

  const sidebarItems = [
    { id: "businesses", label: "My Businesses", icon: Store, count: shops.length },
    { id: "saved", label: "Saved Shops", icon: Heart, count: favorites.length },
    { id: "profile", label: "My Profile", icon: User },
    ...(isAdmin ? [{ id: "admin", label: "Admin Panel", icon: Shield, href: "/admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* ── MOBILE SIDEBAR/DRAWER ────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="absolute inset-0 bg-[#1A1F36]/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-80 bg-white shadow-md transition-transform duration-300 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-12">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B35] flex items-center justify-center shadow-sm">
                  <Store size={16} className="text-white" />
                </div>
                <span className="text-[18px] font-bold tracking-tight text-[#1A1F36]">
                  Shop<span className="text-[#FF6B35]">Setu</span>
                </span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 rounded-xl bg-[#FAFAF8] flex items-center justify-center text-[#1A1F36]/40 hover:text-[#1A1F36]">
                <X size={18} />
              </button>
            </div>

            <nav className="space-y-1.5">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.id;
                const baseStyles = `w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all ${isActive
                  ? "bg-[#1A1F36] text-white shadow-md"
                  : "text-[#1A1F36]/40 hover:bg-[#FAFAF8] hover:text-[#1A1F36]"
                  }`;

                return item.href ? (
                  <Link key={item.id} href={item.href} className={baseStyles}>
                    <div className="flex items-center gap-3"><item.icon size={18} /><span>{item.label}</span></div>
                  </Link>
                ) : (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={baseStyles}>
                    <div className="flex items-center gap-3"><item.icon size={18} /><span>{item.label}</span></div>
                    {item.count !== undefined && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20" : "bg-[#1A1F36]/5"}`}>{item.count}</span>}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-8 border-t border-[#1A1F36]/[0.06]">
              <div className="bg-[#FAFAF8] rounded-2xl p-4 mb-6 border border-[#1A1F36]/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#1A1F36]/[0.06] flex items-center justify-center font-bold text-[#1A1F36] shadow-sm">
                    {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover rounded-xl" /> : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#1A1F36] truncate">{user.displayName || "Owner"}</p>
                    <p className="text-[11px] text-[#1A1F36]/30 truncate font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={18} /><span>Sign Out Account</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────── */}
      <aside className={`hidden lg:flex bg-white border-r border-[#1A1F36]/[0.06] flex-col sticky top-0 h-screen transition-all duration-500 ease-in-out ${isSidebarCollapsed ? "w-24" : "w-80"}`}>
        <div className={`p-8 pb-4 flex flex-col h-full ${isSidebarCollapsed ? "items-center" : ""}`}>
          <Link href="/" className={`flex items-center gap-2.5 mb-12 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-xl bg-[#FF6B35] flex items-center justify-center shadow-sm shrink-0">
              <Store size={16} className="text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-[18px] font-bold tracking-tight text-[#1A1F36] animate-in fade-in duration-500">
                Shop<span className="text-[#FF6B35]">Setu</span>
              </span>
            )}
          </Link>

          <nav className={`space-y-1.5 w-full ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`}>
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              const baseStyles = `flex items-center justify-between rounded-2xl text-[14px] font-bold transition-all duration-300 ${isSidebarCollapsed ? "w-12 h-12 justify-center" : "w-full px-4 py-3.5"
                } ${isActive
                  ? "bg-[#1A1F36] text-white shadow-md shadow-[#1A1F36]/20"
                  : "text-[#1A1F36]/40 hover:bg-[#FAFAF8] hover:text-[#1A1F36]"
                }`;

              return item.href ? (
                <Link key={item.id} href={item.href} className={baseStyles} title={isSidebarCollapsed ? item.label : ""}>
                  <div className="flex items-center gap-3"><item.icon size={18} />{!isSidebarCollapsed && <span className="animate-in fade-in">{item.label}</span>}</div>
                </Link>
              ) : (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={baseStyles} title={isSidebarCollapsed ? item.label : ""}>
                  <div className="flex items-center gap-3"><item.icon size={18} />{!isSidebarCollapsed && <span className="animate-in fade-in">{item.label}</span>}</div>
                  {item.count !== undefined && !isSidebarCollapsed && <span className={`text-[10px] px-2 py-0.5 rounded-full animate-in fade-in ${isActive ? "bg-white/20" : "bg-[#1A1F36]/5"}`}>{item.count}</span>}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-6 w-full">
            <div className={`pt-6 border-t border-[#1A1F36]/[0.06] ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`}>
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`flex items-center rounded-xl text-[#1A1F36]/30 hover:bg-[#FAFAF8] hover:text-[#1A1F36] transition-all ${isSidebarCollapsed ? "w-12 h-12 justify-center" : "w-full px-4 py-3 gap-3"}`}>
                {isSidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span className="text-[13px] font-bold animate-in fade-in">Collapse Menu</span></>}
              </button>
            </div>

            {!isSidebarCollapsed && (
              <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-[#1A1F36]/[0.03] animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#1A1F36]/[0.06] flex items-center justify-center font-bold text-[#1A1F36] shadow-sm shrink-0 overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#1A1F36] truncate">{user.displayName || "Owner"}</p>
                    <p className="text-[11px] text-[#1A1F36]/30 truncate font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <button onClick={logout} className={`flex items-center text-red-500 hover:bg-red-50 rounded-2xl transition-all ${isSidebarCollapsed ? "w-12 h-12 justify-center" : "w-full px-4 py-3 gap-3"}`} title={isSidebarCollapsed ? "Sign Out" : ""}>
              <LogOut size={18} />{!isSidebarCollapsed && <span className="text-[13px] font-bold animate-in fade-in">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-16 bg-white border-b border-[#1A1F36]/[0.06] px-6 flex items-center justify-between sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center"><Store size={14} className="text-white" /></div>
            <span className="text-[15px] font-bold tracking-tight text-[#1A1F36]">ShopSetu</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(true)} className="w-9 h-9 rounded-xl bg-[#FAFAF8] flex items-center justify-center text-[#1A1F36]/40"><User size={18} /></button>
        </header>

        <main className="flex-1 p-6 md:p-10 lg:p-16 overflow-y-auto">
          {activeTab === "businesses" && (
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
              <header className="mb-12">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#FF6B35]/10 rounded-full mb-6 border border-[#FF6B35]/20">
                  <LayoutDashboard size={14} className="text-[#FF6B35]" />
                  <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-widest">Merchant Console</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1A1F36] tracking-tight mb-4">My Businesses</h1>
                <p className="text-[17px] text-[#1A1F36]/40 font-medium max-w-xl">Manage your storefronts, update catalogs, and track real-time customer leads.</p>
              </header>

              {/* Stats Grid */}
              {shops.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                  {[
                    { label: "Total Shops", value: shops.length, icon: Store },
                    { label: "Live Stores", value: approvedShops, icon: CheckCircle2 },
                    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye },
                    { label: "Customer Leads", value: totalLeads.toLocaleString(), icon: MessageSquare },
                  ].map((stat, i) => (
                    <Card key={i} className="p-6 border-[#1A1F36]/[0.04]">
                      <div className="text-[#FF6B35] mb-4"><stat.icon size={22} /></div>
                      <div className="text-3xl font-extrabold text-[#1A1F36] mb-1">{stat.value}</div>
                      <div className="text-[11px] font-bold text-[#1A1F36]/30 uppercase tracking-widest">{stat.label}</div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1A1F36]/20 group-focus-within:text-[#FF6B35] transition-colors" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by business name or location..."
                    className="w-full pl-14 pr-6 py-4 bg-white border border-[#1A1F36]/[0.08] rounded-2xl focus:outline-none focus:border-[#FF6B35]/40 text-[15px] font-bold transition-all placeholder:text-[#1A1F36]/20"
                  />
                </div>
                <Link href="/create">
                  <Button variant="dark" size="xl" icon={Plus} className="shadow-md shadow-[#1A1F36]/10 w-full md:w-auto">List New Business</Button>
                </Link>
              </div>

              {/* Listings */}
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-[#1A1F36]/[0.05]" />)}
                </div>
              ) : filteredShops.length === 0 ? (
                <Card className="py-24 text-center border-dashed border-[#1A1F36]/[0.1]">
                  <div className="w-20 h-20 bg-[#FAFAF8] rounded-3xl flex items-center justify-center mx-auto mb-8 text-[#1A1F36]/10"><Building2 size={40} /></div>
                  <h2 className="text-2xl font-bold text-[#1A1F36] mb-3">No matching businesses</h2>
                  <p className="text-[16px] text-[#1A1F36]/40 max-w-sm mx-auto font-medium">
                    {searchQuery ? "Try a different search query." : "You haven't listed any businesses yet. Start today!"}
                  </p>
                  {!searchQuery && (
                    <Link href="/create" className="inline-block mt-10">
                      <Button variant="primary" size="lg" icon={Plus}>List Your Business</Button>
                    </Link>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {filteredShops.map(shop => (
                    <Card key={shop.id} className="p-6 md:p-8 hover:border-[#FF6B35]/30 group transition-all duration-500">
                      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-20 h-20 rounded-[24px] bg-[#FAFAF8] shrink-0 overflow-hidden border border-[#1A1F36]/[0.06] shadow-sm">
                          {shop.logo ? <img src={shop.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-[#FF6B35] text-2xl font-bold">{shop.name.charAt(0)}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl font-extrabold text-[#1A1F36] group-hover:text-[#FF6B35] transition-colors">{shop.name}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${shop.status === 'approved' ? 'bg-green-100 text-green-700' : shop.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-[#FF6B35]/10 text-[#FF6B35]'}`}>
                              {shop.status === 'approved' ? <><CheckCircle2 size={12} /> Live Store</> : shop.status === 'rejected' ? <><AlertCircle size={12} /> Rejected</> : <><Clock size={12} /> Under Review</>}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-bold text-[#1A1F36]/30 uppercase tracking-widest mb-4">
                            <span className="flex items-center gap-2"><Store size={14} /> {shop.category}</span>
                            <span className="flex items-center gap-2"><MapPin size={14} /> {shop.city}</span>
                            {shop.status === 'approved' && <><span className="flex items-center gap-2 text-[#1A1F36]/60"><Eye size={14} /> {shop.views || 0} Views</span><span className="flex items-center gap-2 text-[#FF6B35]"><MessageSquare size={14} /> {shop.leads || 0} Leads</span></>}
                          </div>
                          <p className="text-[14px] text-[#1A1F36]/40 line-clamp-1 font-medium">{shop.description || "Professional merchant storefront on ShopSetu."}</p>
                        </div>
                        <div className="flex items-center w-full md:w-auto mt-4 md:mt-0">
                          <Link href={`/dashboard/manage?id=${shop.id}`} className="w-full md:w-auto">
                            <Button variant="dark" size="lg" className="w-full" icon={Settings2}>Manage Business</Button>
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
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
              <header className="mb-12">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-red-50 rounded-full mb-6 border border-red-100">
                  <Heart size={14} className="text-red-500 fill-current" />
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Personal Favorites</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1A1F36] tracking-tight mb-4">Saved Shops</h1>
                <p className="text-[17px] text-[#1A1F36]/40 font-medium max-w-xl">Quickly access the local businesses you love and follow.</p>
              </header>

              {favorites.length === 0 ? (
                <Card className="py-24 text-center border-dashed border-[#1A1F36]/[0.1]">
                  <div className="w-20 h-20 bg-[#FAFAF8] rounded-3xl flex items-center justify-center mx-auto mb-8 text-[#1A1F36]/10">
                    <Heart size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1F36] mb-3">No saved shops</h2>
                  <p className="text-[16px] text-[#1A1F36]/40 max-w-sm mx-auto font-medium">
                    Start exploring the marketplace and heart the shops you want to save for later.
                  </p>
                  <Link href="/explore" className="inline-block mt-10">
                    <Button variant="primary" size="lg" icon={Search}>Explore Shops</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {allShops
                    .filter(shop => favorites.includes(shop.id))
                    .map(shop => (
                      <div key={shop.id} className="h-full">
                        <ShopCard shop={shop} variant="grid" />
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-4 max-w-4xl">
              <header className="mb-12">
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1A1F36] tracking-tight mb-4">Merchant Profile</h1>
                <p className="text-[17px] text-[#1A1F36]/40 font-medium">Manage your personal account and security settings.</p>
              </header>

              <Card className="p-10">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="w-32 h-32 rounded-[32px] bg-[#FAFAF8] flex items-center justify-center text-4xl font-bold text-[#FF6B35] border border-[#1A1F36]/[0.08] shadow-md overflow-hidden shrink-0">
                    {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : user.displayName?.charAt(0) || "M"}
                  </div>
                  <div className="flex-1 w-full space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[11px] font-bold text-[#1A1F36]/30 uppercase tracking-[0.2em] mb-3">Merchant Identity</label>
                        <div className="px-5 py-4 bg-[#FAFAF8] rounded-2xl text-[15px] font-bold text-[#1A1F36] border border-[#1A1F36]/[0.04] shadow-sm">{user.displayName || "Verified Merchant"}</div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#1A1F36]/30 uppercase tracking-[0.2em] mb-3">Login Email</label>
                        <div className="px-5 py-4 bg-[#FAFAF8] rounded-2xl text-[15px] font-bold text-[#1A1F36] border border-[#1A1F36]/[0.04] shadow-sm">{user.email}</div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-[#1A1F36]/[0.06]">
                      <h3 className="text-[13px] font-bold text-[#1A1F36] uppercase tracking-[0.15em] mb-6">Aggregate Merchant Performance</h3>
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { label: "Businesses", value: shops.length },
                          { label: "Gross Views", value: totalViews.toLocaleString() },
                          { label: "Total Leads", value: totalLeads.toLocaleString() },
                        ].map((stat, i) => (
                          <div key={i} className="p-6 bg-[#FAFAF8] rounded-2xl text-center border border-[#1A1F36]/[0.04]">
                            <div className="text-3xl font-extrabold text-[#1A1F36] mb-1">{stat.value}</div>
                            <div className="text-[10px] font-bold text-[#1A1F36]/30 uppercase tracking-widest">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button variant="outline" className="bg-white border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200" onClick={logout} icon={LogOut}>Logout Securely</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "admin" && (
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
              <header className="mb-12">
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1A1F36] tracking-tight mb-4">System Console</h1>
                <p className="text-[17px] text-[#1A1F36]/40 font-medium">Access global controls and management tools.</p>
              </header>

              <Card className="py-24 text-center">
                <div className="w-24 h-24 bg-[#FF6B35]/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 text-[#FF6B35] shadow-inner"><Shield size={48} /></div>
                <h2 className="text-3xl font-extrabold text-[#1A1F36] mb-4">Global Administration</h2>
                <p className="text-[17px] text-[#1A1F36]/40 mb-10 max-w-sm mx-auto font-medium">Review pending shop applications, manage categories, and monitor platform activity.</p>
                <Link href="/admin">
                  <Button variant="dark" size="xl" icon={Shield} className="px-12 shadow-md shadow-[#1A1F36]/20">Enter Admin Dashboard</Button>
                </Link>
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