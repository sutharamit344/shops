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
  MenuIcon
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
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-bold text-[#0A0A0F]/20 uppercase tracking-[0.2em]">Authenticating Console</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F7F5]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32">
          <Card className="p-12 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#FF6A00]/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Store size={32} className="text-[#FF6A00]" />
            </div>
            <h1 className="text-[28px] font-bold text-[#0A0A0F] mb-3 tracking-tight">
              Sign in to manage
            </h1>
            <p className="text-[14px] text-[#0A0A0F]/45 mb-10 max-w-sm mx-auto font-medium">
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
    <div className="min-h-screen bg-[#F7F7F5] flex selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">

      {/* ── MOBILE OVERLAY ─────────────────────────────────────── */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      </div>

      {/* ── SIDEBAR ───────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:relative bg-white border-r border-black/[0.05] flex flex-col transition-all duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${isSidebarCollapsed ? "lg:w-[68px]" : "lg:w-[240px]"}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`h-[60px] flex items-center px-4 mb-6 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF6A00] flex items-center justify-center shrink-0 shadow-sm">
                <Store size={16} className="text-white" />
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[16px] font-bold tracking-tight text-[#0A0A0F]">
                  Shop<span className="text-[#FF6A00]">Bajar</span>
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center text-[#0A0A0F]/40">
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${isActive
                      ? "bg-[#0A0A0F] text-white shadow-xl"
                      : "text-[#0A0A0F]/45 hover:bg-black/[0.03] hover:text-[#0A0A0F]"
                    } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={isSidebarCollapsed ? item.label : ""}
                >
                  <item.icon size={16} />
                  {!isSidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                  {item.count !== undefined && !isSidebarCollapsed && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-black/[0.05] text-[#0A0A0F]/40"}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-black/[0.05] space-y-1">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold text-[#0A0A0F]/45 hover:bg-black/[0.03] hover:text-[#0A0A0F] transition-all ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
            >
              {isSidebarCollapsed ? <PanelLeft size={16} /> : <><PanelLeftClose size={16} /> <span>Collapse</span></>}
            </button>

            <div className={`flex items-center gap-3 px-3 py-3 rounded-lg bg-black/[0.02] border border-black/[0.05] ${isSidebarCollapsed ? "justify-center px-2" : ""}`}>
              <div className="w-8 h-8 rounded-lg bg-white border border-black/[0.05] flex items-center justify-center shrink-0 overflow-hidden relative">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="p" fill className="object-cover" sizes="32px" />
                ) : (
                  <span className="text-[12px] font-bold text-[#0A0A0F]/30">{user.email?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-[#0A0A0F] truncate">{user.displayName || "Merchant"}</p>
                  <p className="text-[10px] font-medium text-[#0A0A0F]/30 truncate">{user.email}</p>
                </div>
              )}
            </div>

            <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold text-red-500 hover:bg-red-50 transition-all ${isSidebarCollapsed ? "justify-center px-0" : ""}`}>
              <LogOut size={16} />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Navbar */}
        <header className="lg:hidden h-[56px] bg-white border-b border-black/[0.05] px-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="w-8 h-8 rounded-lg bg-black/[0.02] flex items-center justify-center text-[#0A0A0F]/50 hover:bg-black/[0.05] transition-colors">
            <MenuIcon size={16} />
          </button>
          <span className="text-[13px] font-bold text-[#0A0A0F] tracking-tight">Console</span>
          <div className="w-8 h-8" /> {/* Spacer */}
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
          {activeTab === "businesses" && (
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-2">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FF6A00]/5 text-[#FF6A00] rounded-md border border-[#FF6A00]/10 mb-2">
                    <LayoutDashboard size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Merchant Control Center</span>
                  </div>
                  <h1 className="text-[24px] md:text-[32px] font-bold text-[#0A0A0F] tracking-tight">Active Businesses</h1>
                </div>
                <Link href="/create">
                  <Button variant="dark" icon={Plus} size="sm">Deploy New Business</Button>
                </Link>
              </header>

              {/* Stats High-Density */}
              {shops.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Active Businesses", value: approvedShops, icon: Store },
                    { label: "Pending", value: shops.length - approvedShops, icon: Clock },
                    { label: "Gross Views", value: totalViews.toLocaleString(), icon: Eye },
                    { label: "Network Leads", value: totalLeads.toLocaleString(), icon: TrendingUp },
                  ].map((stat, i) => (
                    <Card key={i} className="p-3 border-black/[0.03]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-[#FF6A00]/5 flex items-center justify-center text-[#FF6A00]">
                          <stat.icon size={14} />
                        </div>
                        <div className="text-[9px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest">{stat.label}</div>
                      </div>
                      <div className="text-[20px] font-bold text-[#0A0A0F] leading-none">{stat.value}</div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Search Toolbar */}
              <div className="mb-6 relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A0A0F]/20 group-focus-within:text-[#FF6A00] transition-colors" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter businesses by name, location or status..."
                  className="w-full h-11 pl-10 pr-4 bg-white border border-black/[0.08] rounded-lg focus:outline-none focus:border-[#FF6A00]/40 text-[13.5px] font-medium transition-all shadow-sm"
                />
              </div>

              {/* Business Listings */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-lg animate-pulse border border-black/[0.05]" />)}
                </div>
              ) : filteredShops.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-black/[0.1]">
                  <div className="w-12 h-12 bg-black/[0.02] rounded-lg flex items-center justify-center mx-auto mb-4 text-[#0A0A0F]/10">
                    <Search size={24} />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0F] mb-1">No matching businesses</h3>
                  <p className="text-[13px] text-[#0A0A0F]/40 font-medium">Try refining your search parameters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredShops.map(shop => (
                    <Card key={shop.id} className="p-4 group hover:border-[#FF6A00]/40 transition-all duration-300">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="w-16 h-16 rounded-lg bg-black/[0.02] border border-black/[0.05] overflow-hidden relative shrink-0">
                          {shop.logo ? (
                            <Image src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo} alt="logo" fill className="object-cover" sizes="64px" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#FF6A00] font-bold text-xl">{shop.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="text-[16px] font-bold text-[#0A0A0F] tracking-tight">{shop.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${shop.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                                shop.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                              }`}>
                              {shop.status === 'approved' ? 'Operational' : shop.status === 'rejected' ? 'Rejected' : 'Provisioning'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[12px] text-[#0A0A0F]/40 font-medium">
                            <span className="flex items-center gap-1"><Store size={12} className="text-[#FF6A00]" /> {shop.category}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {shop.city}</span>
                            <span className="flex items-center gap-1"><TrendingUp size={12} /> {shop.views || 0} hits</span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button variant="outline" size="sm" icon={ExternalLink} className="flex-1 md:flex-none" onClick={() => window.open(`/shop/${shop.slug}`, '_blank')}>View</Button>
                          <Link href={`/dashboard/manage?id=${shop.id}`} className="flex-1 md:flex-none">
                            <Button variant="dark" size="sm" icon={Settings} className="w-full">Configure</Button>
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
              <header className="mb-10">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-500/5 text-red-500 rounded-md border border-red-500/10 mb-3">
                  <Heart size={12} fill="currentColor" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Saved Collection</span>
                </div>
                <h1 className="text-[28px] md:text-[36px] font-bold text-[#0A0A0F] tracking-tight">Saved Businesses</h1>
              </header>

              {favorites.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-black/[0.1]">
                  <Heart size={40} className="mx-auto text-[#0A0A0F]/10 mb-4" />
                  <p className="text-[13px] text-[#0A0A0F]/40 font-medium">No saved shops in your library.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allShops.filter(s => favorites.includes(s.id)).map(shop => (
                    <Card key={shop.id} className="p-3">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-lg bg-black/[0.02] border border-black/[0.05] shrink-0 overflow-hidden relative">
                          <Image src={shop.logo || "/placeholder.png"} alt="l" fill className="object-cover" sizes="48px" unoptimized />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[14px] font-bold text-[#0A0A0F] truncate tracking-tight">{shop.name}</h4>
                          <p className="text-[11px] text-[#0A0A0F]/40 font-medium">{shop.category}</p>
                        </div>
                        <Button variant="ghost" size="sm" icon={ChevronRight} className="p-2 h-auto" onClick={() => window.open(`/shop/${shop.slug}`, '_blank')} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-2 max-w-2xl">
              <header className="mb-10">
                <h1 className="text-[28px] md:text-[36px] font-bold text-[#0A0A0F] tracking-tight">Account Configuration</h1>
              </header>

              <Card className="p-6 md:p-10">
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-24 h-24 rounded-[32px] bg-white border-4 border-white shadow-2xl relative overflow-hidden mb-4">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt="p" fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[#0A0A0F]/30 text-3xl font-bold">{user.email?.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <h2 className="text-[20px] font-bold text-[#0A0A0F]">{user.displayName || "Verified Merchant"}</h2>
                  <p className="text-[13px] font-medium text-[#0A0A0F]/40">{user.email}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  {[
                    { label: "Businesses", value: shops.length },
                    { label: "Views", value: totalViews },
                    { label: "Leads", value: totalLeads },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-black/[0.01] rounded-lg border border-black/[0.03] text-center">
                      <div className="text-[18px] font-bold text-[#0A0A0F]">{stat.value}</div>
                      <div className="text-[9px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-black/[0.05]">
                  <Button variant="outline" className="w-full border-red-500/10 text-red-500 hover:bg-red-500/5 hover:border-red-500/20" icon={LogOut} onClick={logout}>Sign Out Securely</Button>
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
