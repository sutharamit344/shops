"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getShopsByOwner, isUserAdmin } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import Link from "next/link";
import {
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
  ExternalLink,
  Settings2,
  AlertCircle,
  RefreshCw,
  Eye,
  History,
  Search,
  MapPin,
  Store,
  MessageSquare,
  Phone,
  TrendingUp,
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Shield,
  Star,
  Calendar,
  Mail,
  User,
  X,
  ShoppingBag,
  ListFilter,
  Image as ImageIcon,
  Share2,
  ArrowLeft
} from "lucide-react";

import ShopHistoryDialog from "@/components/Shop/HistoryDialog";

const UserDashboard = () => {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyShop, setHistoryShop] = useState(null);
  const [activeTab, setActiveTab] = useState("businesses");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Calculate total stats
  const totalViews = shops.reduce((acc, shop) => acc + (shop.views || 0), 0);
  const totalLeads = shops.reduce((acc, shop) => acc + (shop.leads || 0), 0);
  const approvedShops = shops.filter(s => s.status === 'approved').length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#FF6B35] border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">Loading Console...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-[32px] p-12 shadow-sm border border-black/[0.06]">
            <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-[24px] flex items-center justify-center mx-auto mb-6">
              <Store size={40} className="text-[#FF6B35]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-3 tracking-tight">
              Sign in to manage
            </h1>
            <p className="text-[15px] text-[#666] mb-8 max-w-md mx-auto">
              Access your business dashboard and real-time performance analytics.
            </p>
            <button
              onClick={loginWithGoogle}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0F0F0F] text-white text-[14px] font-semibold rounded-2xl hover:bg-[#333] transition-all shadow-lg"
            >
              Sign In with Google
            </button>
          </div>
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
    { id: "businesses", label: "My Businesses", icon: Store, count: shops.length },
    { id: "profile", label: "My Profile", icon: User },
    ...(isAdmin ? [{ id: "admin", label: "Admin Panel", icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* Mobile Sidebar/Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer Content */}
        <aside
          className={`absolute inset-y-0 left-0 w-80 bg-white shadow-2xl transition-transform duration-300 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B35] flex items-center justify-center shadow-sm">
                  <Store size={16} className="text-white" />
                </div>
                <span className="text-[16px] font-bold tracking-tight text-[#0F0F0F]">
                  Shop<span className="text-[#FF6B35]">Setu</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#666]"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${activeTab === item.id
                    ? "bg-[#0F0F0F] text-white"
                    : "text-[#666] hover:bg-gray-50 hover:text-[#0F0F0F]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === item.id ? "bg-white/20" : "bg-gray-100"
                      }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-black/[0.06]">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.04] flex items-center justify-center font-bold text-[#0F0F0F] shadow-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#0F0F0F] truncate">
                      {user.displayName || "Business Owner"}
                    </p>
                    <p className="text-[10px] text-[#999] truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 bg-white border-r border-black/[0.06] flex-col sticky top-0 h-screen">
        <div className="p-8 pb-4">
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B35] flex items-center justify-center shadow-sm">
              <Store size={16} className="text-white" />
            </div>
            <span className="text-[16px] font-bold tracking-tight text-[#0F0F0F]">
              Shop<span className="text-[#FF6B35]">Setu</span>
            </span>
          </Link>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${activeTab === item.id
                  ? "bg-[#0F0F0F] text-white"
                  : "text-[#666] hover:bg-gray-50 hover:text-[#0F0F0F]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === item.id ? "bg-white/20" : "bg-gray-100"
                    }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 pt-4">
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.04] flex items-center justify-center font-bold text-[#0F0F0F] shadow-sm">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#0F0F0F] truncate">
                  {user.displayName || "Business Owner"}
                </p>
                <p className="text-[10px] text-[#999] truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-black/[0.06] px-4 flex items-center justify-between sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B35] flex items-center justify-center">
              <Store size={14} className="text-white" />
            </div>
            <span className="text-[14px] font-bold tracking-tight text-[#0F0F0F]">ShopSetu</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"
          >
            <User size={16} className="text-[#666]" />
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
          {activeTab === "businesses" && (
            <div className="animate-in fade-in duration-500">
              {/* Header */}
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6B35]/10 rounded-full mb-4">
                  <LayoutDashboard size={12} className="text-[#FF6B35]" />
                  <span className="text-[9px] font-semibold text-[#FF6B35] uppercase tracking-wider">
                    Dashboard
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#0F0F0F] tracking-tight mb-2">
                  My Businesses
                </h1>
                <p className="text-[14px] text-[#666] max-w-xl">
                  Manage your storefronts and track performance from one place.
                </p>
              </div>

              {/* Quick Stats */}
              {shops.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-4 border border-black/[0.06]">
                    <div className="text-[#FF6B35] mb-1">
                      <Store size={18} />
                    </div>
                    <div className="text-2xl font-bold text-[#0F0F0F]">{shops.length}</div>
                    <div className="text-[10px] text-[#999]">Total Shops</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-black/[0.06]">
                    <div className="text-[#FF6B35] mb-1">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="text-2xl font-bold text-[#0F0F0F]">{approvedShops}</div>
                    <div className="text-[10px] text-[#999]">Live Shops</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-black/[0.06]">
                    <div className="text-[#FF6B35] mb-1">
                      <Eye size={18} />
                    </div>
                    <div className="text-2xl font-bold text-[#0F0F0F]">{totalViews.toLocaleString()}</div>
                    <div className="text-[10px] text-[#999]">Total Views</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-black/[0.06]">
                    <div className="text-[#FF6B35] mb-1">
                      <MessageSquare size={18} />
                    </div>
                    <div className="text-2xl font-bold text-[#0F0F0F]">{totalLeads.toLocaleString()}</div>
                    <div className="text-[10px] text-[#999]">Total Leads</div>
                  </div>
                </div>
              )}

              {/* Search & Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, city, or category..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-black/[0.06] rounded-xl focus:outline-none focus:border-[#FF6B35]/50 text-[13px] transition-all"
                  />
                </div>
                <Link href="/create">
                  <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F0F0F] text-white text-[12px] font-semibold rounded-xl hover:bg-[#333] transition-all whitespace-nowrap">
                    <Plus size={16} /> New Shop
                  </button>
                </Link>
              </div>

              {/* Shop Listings */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-white rounded-xl animate-pulse border border-black/[0.06]"></div>
                  ))}
                </div>
              ) : filteredShops.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-black/[0.06]">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 size={32} className="text-[#ccc]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#0F0F0F] mb-2">No shops found</h2>
                  <p className="text-[13px] text-[#666] max-w-sm mx-auto">
                    {searchQuery ? "Try a different search term." : "Create your first shop to get started."}
                  </p>
                  {!searchQuery && (
                    <Link href="/create" className="inline-block mt-6">
                      <button className="px-5 py-2.5 bg-[#FF6B35] text-white text-[12px] font-semibold rounded-xl hover:bg-[#e85c25] transition-all">
                        Create Shop
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredShops.map(shop => (
                    <div key={shop.id} className="bg-white rounded-xl border border-black/[0.06] hover:border-[#FF6B35]/30 hover:shadow-md transition-all overflow-hidden">
                      <div className="p-5">
                        <div className="flex flex-wrap gap-4">
                          {/* Logo */}
                          <div className="w-14 h-14 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-black/[0.04]">
                            {shop.logo ? (
                              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#FF6B35] text-xl font-bold">
                                {shop.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-base font-bold text-[#0F0F0F]">{shop.name}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold ${shop.status === 'approved'
                                ? 'bg-green-50 text-green-600'
                                : shop.status === 'rejected'
                                  ? 'bg-red-50 text-red-500'
                                  : 'bg-[#FF6B35]/5 text-[#FF6B35]'
                                }`}>
                                {shop.status === 'approved' ? (
                                  <><CheckCircle2 size={8} /> Approved</>
                                ) : shop.status === 'rejected' ? (
                                  <><AlertCircle size={8} /> Rejected</>
                                ) : (
                                  <><Clock size={8} /> Pending</>
                                )}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#666] mb-3">
                              <span className="flex items-center gap-1">
                                <Building2 size={11} /> {shop.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={11} /> {shop.city}
                              </span>
                              {shop.status === 'approved' && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Eye size={11} /> {shop.views || 0} views
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare size={11} /> {shop.leads || 0} leads
                                  </span>
                                </>
                              )}
                            </div>

                            <p className="text-[12px] text-[#666] line-clamp-1">
                              {shop.description || "-"}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center ml-auto">
                            <Link href={`/dashboard/manage?id=${shop.id}`}>
                              <button
                                className="px-6 py-2.5 bg-[#0F0F0F] text-white text-[12px] font-bold rounded-xl hover:bg-black/90 transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95"
                              >
                                Manage <ChevronRight size={14} />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0F0F0F] tracking-tight mb-2">
                  My Profile
                </h1>
                <p className="text-[14px] text-[#666]">Manage your account information.</p>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.06] p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl font-bold text-[#FF6B35] border border-black/[0.04] overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[11px] font-bold text-[#999] uppercase tracking-wider mb-2">Display Name</label>
                        <div className="px-4 py-3 bg-gray-50 border border-black/[0.04] rounded-xl text-[13px] font-medium text-[#0F0F0F]">
                          {user.displayName || "Not set"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#999] uppercase tracking-wider mb-2">Email Address</label>
                        <div className="px-4 py-3 bg-gray-50 border border-black/[0.04] rounded-xl text-[13px] font-medium text-[#0F0F0F]">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-black/[0.04]">
                      <h3 className="text-[13px] font-bold text-[#0F0F0F] mb-4">Account Statistics</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl text-center">
                          <div className="text-2xl font-bold text-[#0F0F0F]">{shops.length}</div>
                          <div className="text-[10px] text-[#999]">Businesses</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl text-center">
                          <div className="text-2xl font-bold text-[#0F0F0F]">{totalViews.toLocaleString()}</div>
                          <div className="text-[10px] text-[#999]">Total Views</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl text-center">
                          <div className="text-2xl font-bold text-[#0F0F0F]">{totalLeads.toLocaleString()}</div>
                          <div className="text-[10px] text-[#999]">Total Leads</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "admin" && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0F0F0F] tracking-tight mb-2">
                  Admin Panel
                </h1>
                <p className="text-[14px] text-[#666]">System administration tools.</p>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.06] p-8 text-center">
                <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-[#FF6B35]" />
                </div>
                <h2 className="text-lg font-bold text-[#0F0F0F] mb-2">Admin Dashboard</h2>
                <p className="text-[13px] text-[#666] mb-6">Access admin controls and manage all shops.</p>
                <Link href="/admin">
                  <button className="px-6 py-2.5 bg-[#0F0F0F] text-white text-[12px] font-semibold rounded-xl hover:bg-[#333] transition-all">
                    Enter Admin Dashboard
                  </button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <ShopHistoryDialog
        shop={historyShop}
        isOpen={!!historyShop}
        onClose={() => setHistoryShop(null)}
      />
    </div>
  );
};

export default UserDashboard;