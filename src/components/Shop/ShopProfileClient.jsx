"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star, MapPin, MessageSquare, Phone, Share2, Heart,
  Clock, Award, Users, CheckCircle2, Globe, ChevronRight,
  ShoppingBag, Search, X, ExternalLink, Truck, Shield, DollarSign,
  Mail, Clock as ClockIcon, Calendar, Navigation, Info,
  Store
} from "lucide-react";
import Dialog from "../UI/Dialog";

// Robust Social Icon Mapper with SVG Fallbacks
const SocialIcon = ({ name, size = 18, className = "" }) => {
  const icons = {
    Instagram: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
    ),
    Facebook: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
    ),
    Youtube: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 103.03 103.03 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 103.03 103.03 0 0 1-15 0 2 2-2-2Z" /><path d="m10 15 5-3-5-3z" /></svg>
    ),
    Twitter: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
    ),
    Linkedin: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
    ),
    WhatsApp: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14 8.38 8.38 0 0 1 3.8.9L21 3z" /></svg>
    ),
    Globe: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
    )
  };

  const IconRenderer = icons[name] || icons.Globe;
  return <div className={className}>{IconRenderer(size)}</div>;
};

const ShopProfileClient = ({ shop }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const brandColor = shop.primaryColor || "#FF6B35";
  const avgRating = shop.rating || "5.0";
  const totalReviews = shop.reviewCount || 0;

  const socialLinks = shop.socialLinks || [];
  const menuItems = shop.menu || [];

  const allItems = menuItems.flatMap(cat =>
    (cat.items || []).map(item => ({ ...item, category: cat.category }))
  );

  const filteredItems = searchQuery
    ? allItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: shop.name, url });
      } catch (err) { }
    } else {
      await navigator.clipboard.writeText(url);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const handleWhatsAppOrder = (item) => {
    const itemToOrder = item || selectedItem;
    if (!itemToOrder || !shop.phone) return;

    const message = `Hi, I found your shop *${shop.name}* on ShopSetu!\n\nI'm interested in: *${itemToOrder.name}*\nCategory: ${itemToOrder.category || 'General'}\n\nCan you please provide more details?`;

    const cleanPhone = shop.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleGeneralWhatsApp = () => {
    if (!shop.phone) return;
    const message = `Hi, I found your shop *${shop.name}* on ShopSetu! I'd like to know more about your products and services.`;
    const cleanPhone = shop.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-[#1A1F36]" style={{ "--brand-color": brandColor }}>
      {/* Header Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {shop.coverImage ? (
          <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#1A1F36] flex items-center justify-center opacity-90">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
             <Store size={80} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8F3] via-transparent to-black/20" />
        
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-[#1A1F36] hover:bg-white transition-all shadow-lg active:scale-95 z-10"
        >
          <ChevronRight className="rotate-180" size={20} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-32 relative z-10 pb-32">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-black/[0.06] shadow-xl shadow-black/[0.02] p-6 md:p-8 mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 -mt-16 md:-mt-20 mb-6">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-[28px] bg-white p-1.5 shadow-2xl border border-black/[0.04]">
              <div className="w-full h-full rounded-[22px] bg-gray-50 flex items-center justify-center text-4xl font-bold text-[#1A1F36] overflow-hidden">
                {shop.logo ? (
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#FF6B35]">{shop.name?.charAt(0)}</span>
                )}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F36] tracking-tight">
                  {shop.name}
                </h1>
                {shop.verified && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#25D36615] text-[#25D366] rounded-full border border-[#25D36620]">
                    <ShieldCheck size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[#888] text-sm">
                 <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#FF6B35]" />
                    <span className="font-medium">{shop.area}, {shop.city}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-[#1A1F36]">{avgRating}</span>
                    <span className="opacity-60">({totalReviews})</span>
                 </div>
              </div>
            </div>
          </div>

          <p className="text-[#444] text-[15px] leading-relaxed mb-8 max-w-xl mx-auto md:mx-0">
            {shop.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
             <button 
              onClick={handleGeneralWhatsApp}
              className="w-full sm:flex-1 h-12 bg-[#25D366] hover:bg-[#1EB855] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95"
             >
                <MessageSquare size={18} fill="currentColor" /> Chat on WhatsApp
             </button>
             <div className="flex items-center gap-3 w-full sm:w-auto">
               <a 
                href={`tel:${shop.phone}`}
                className="flex-1 sm:w-12 h-12 bg-[#1A1F36] text-white rounded-xl flex items-center justify-center hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
               >
                  <Phone size={18} fill="currentColor" />
               </a>
               <div className="relative flex-1 sm:w-12">
                 <button 
                  onClick={handleShare}
                  className="w-full sm:w-12 h-12 bg-white border border-black/[0.08] text-[#1A1F36] rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
                 >
                    <Share2 size={18} />
                 </button>
                 {showShareTooltip && (
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-[#1A1F36] text-white text-[10px] font-bold rounded-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                     Copied to clipboard!
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* Sticky Tabs */}
        <div className="sticky top-4 z-30 flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-md border border-black/[0.06] rounded-2xl mb-8 shadow-lg shadow-black/[0.02]">
          {["menu", "gallery", "reviews", "about"].map((tab) => {
            const displayLabel = tab === "menu" ? (
              ['restaurant', 'cafe', 'bakery', 'food'].includes(shop.category?.toLowerCase()) ? 'Menu' :
                ['salon', 'spa', 'healthcare', 'pharmacy', 'service'].includes(shop.category?.toLowerCase()) ? 'Services' :
                  ['retail', 'boutique', 'electronics', 'grocery', 'store'].includes(shop.category?.toLowerCase()) ? 'Products' :
                    'Catalog'
            ) : tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all capitalize ${activeTab === tab
                  ? "bg-[#1A1F36] text-white shadow-xl"
                  : "text-[#888] hover:text-[#1A1F36]"
                  }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "menu" ? (
            <div className="space-y-8">
              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888] group-focus-within:text-[#FF6B35] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search in catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-black/[0.06] rounded-2xl py-4 pl-14 pr-6 text-sm font-medium outline-none focus:border-[#FF6B35]/30 focus:ring-4 focus:ring-[#FF6B35]/5 transition-all shadow-sm"
                />
              </div>

              {searchQuery ? (
                <div className="grid grid-cols-1 gap-3">
                  {filteredItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedItem(item)}
                      className="bg-white rounded-2xl border border-black/[0.06] p-4 flex items-center gap-4 hover:shadow-xl hover:shadow-black/[0.02] transition-all cursor-pointer group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-black/[0.04]">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag size={24} className="text-[#ccc] group-hover:text-[#FF6B35] transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h3 className="text-[15px] font-bold text-[#1A1F36] group-hover:text-[#FF6B35] transition-colors truncate">{item.name}</h3>
                         <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1">{item.category}</p>
                         <p className="text-[13px] text-[#666] line-clamp-1">{item.description}</p>
                      </div>
                      <ChevronRight size={18} className="text-[#ccc] group-hover:text-[#1A1F36] group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              ) : menuItems.length > 0 ? (
                <div className="space-y-10">
                  {menuItems.map((section, idx) => (
                    <div key={idx} className="space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-[#FF6B35] rounded-full" />
                        <h3 className="text-[17px] font-bold text-[#1A1F36] tracking-tight">{section.category}</h3>
                        <div className="flex-1 h-px bg-black/[0.06]" />
                        <span className="text-[10px] font-bold text-[#888] uppercase tracking-[0.1em]">{section.items?.length || 0} items</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {(section.items || []).map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            onClick={() => setSelectedItem(item)}
                            className="bg-white rounded-2xl border border-black/[0.06] p-4 hover:shadow-md transition-all cursor-pointer hover:border-[#FF6B35]/30 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-black/[0.04] bg-gray-50">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[#FF6B35]/5">
                                    <ShoppingBag size={20} className="text-[#FF6B35]" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h4 className="text-[15px] font-bold text-[#1A1F36] group-hover:text-[#FF6B35] transition-colors truncate">{item.name}</h4>
                                  {item.popular && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-[#FF6B35] uppercase">Hot</span>
                                  )}
                                </div>
                                <p className="text-[12px] text-[#666] line-clamp-1">{item.description}</p>
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#1A1F36] opacity-0 group-hover:opacity-100 transition-all group-hover:bg-[#FF6B35] group-hover:text-white">
                                <Plus size={18} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-black/[0.06] shadow-sm">
                  <div className="w-16 h-16 bg-[#FFF8F3] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#FF6B35]">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1F36] mb-1">No items listed</h3>
                  <p className="text-[13px] text-[#888] max-w-xs mx-auto">This shop hasn't published their catalog yet. Check back soon!</p>
                </div>
              )}
            </div>
          ) : activeTab === "about" ? (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-black/[0.06] p-8 space-y-8 shadow-sm">
                <div>
                  <h3 className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.2em] mb-4">Our Story</h3>
                  <p className="text-[15px] text-[#444] leading-relaxed whitespace-pre-wrap">
                    {shop.longDescription || shop.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-black/[0.06]">
                   <div>
                      <span className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Category</span>
                      <span className="text-[14px] font-bold text-[#1A1F36]">{shop.category}</span>
                   </div>
                   <div>
                      <span className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Business Type</span>
                      <span className="text-[14px] font-bold text-[#1A1F36] capitalize">{shop.businessType || 'Local Store'}</span>
                   </div>
                   <div>
                      <span className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Established</span>
                      <span className="text-[14px] font-bold text-[#1A1F36]">{shop.establishedYear || "2024"}</span>
                   </div>
                   <div>
                      <span className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">City</span>
                      <span className="text-[14px] font-bold text-[#1A1F36] capitalize">{shop.city}</span>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-black/[0.06] p-8 shadow-sm">
                <h3 className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.2em] mb-6">Contact & Location</h3>
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#FF6B35]/5 rounded-xl flex items-center justify-center text-[#FF6B35] shrink-0">
                         <Phone size={18} />
                      </div>
                      <div>
                         <span className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-0.5">Call Directly</span>
                         <a href={`tel:${shop.phone}`} className="text-[15px] font-bold text-[#1A1F36] hover:text-[#FF6B35] transition-colors">+91 {shop.phone}</a>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#FF6B35]/5 rounded-xl flex items-center justify-center text-[#FF6B35] shrink-0">
                         <MapPin size={18} />
                      </div>
                      <div>
                         <span className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-0.5">Location</span>
                         <p className="text-[15px] font-bold text-[#1A1F36] leading-snug">{shop.address || `${shop.area}, ${shop.city}`}</p>
                      </div>
                   </div>
                </div>
                <button 
                  className="w-full mt-10 h-14 bg-[#1A1F36] text-white rounded-2xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                   <Navigation size={18} /> Get Directions
                </button>
              </div>

              <div className="bg-[#1A1F36] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Shield size={120} />
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.2em] mb-4">Trust & Safety</h3>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-[#25D366]" />
                          <span className="text-[13px] font-medium opacity-80">Verified by ShopSetu Authority</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Truck size={16} className="text-[#FF6B35]" />
                          <span className="text-[13px] font-medium opacity-80">Local Store Pickup Available</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-black/[0.06] p-20 text-center shadow-sm">
              <div className="w-20 h-20 bg-[#FAFAF8] rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#ccc]">
                <Calendar size={40} />
              </div>
              <h3 className="text-xl font-bold text-[#1A1F36] mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon</h3>
              <p className="text-[#888] max-w-xs mx-auto text-sm">We're building this section for you. Stay tuned for more updates from {shop.name}!</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating WhatsApp CTA */}
      <a
        href={`https://wa.me/91${shop.phone?.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(shop.name)}%2C%20I%20found%20you%20on%20ShopSetu!`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EB855] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group shadow-green-500/40"
      >
        <MessageSquare size={28} fill="currentColor" />
        <div className="absolute right-full mr-4 px-4 py-2 bg-[#1A1F36] text-white text-[11px] font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
           Chat with Shop
        </div>
      </a>

      {/* Item Detail Dialog */}
      <Dialog
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        maxWidth="max-w-md"
        showHeader={false}
      >
        {selectedItem && (
          <div className="flex flex-col bg-white">
            {/* Image Section */}
            <div className="relative aspect-[4/3] w-full bg-[#FAFAF8] overflow-hidden">
              {selectedItem.image ? (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                  <ShoppingBag size={64} className="text-[#1A1F36]" />
                </div>
              )}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-all"
              >
                 <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-8">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#FF6B3515] text-[#FF6B35] text-[9px] font-bold uppercase tracking-wider">
                       {selectedItem.category || shop.category}
                    </span>
                    {selectedItem.popular && (
                      <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider">
                         Top Choice
                      </span>
                    )}
                 </div>
                 <h2 className="text-2xl font-bold text-[#1A1F36] tracking-tight leading-tight mb-2">
                   {selectedItem.name}
                 </h2>
                 <p className="text-[15px] text-[#666] leading-relaxed">
                   {selectedItem.description}
                 </p>
              </div>

              <div className="space-y-4">
                 <button
                   onClick={() => handleWhatsAppOrder(selectedItem)}
                   className="w-full h-14 bg-[#25D366] hover:bg-[#1EB855] text-white rounded-2xl font-bold text-sm shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                 >
                   <MessageSquare size={20} fill="currentColor" />
                   Order on WhatsApp
                 </button>
                 <button
                   onClick={() => setSelectedItem(null)}
                   className="w-full h-14 bg-white border border-black/[0.06] text-[#1A1F36] rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
                 >
                   Back to Gallery
                 </button>
              </div>

              <div className="mt-8 pt-8 border-t border-black/[0.06]">
                 <div className="flex items-center gap-4 text-[#888]">
                    <div className="flex-1 text-center">
                       <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">Delivery</div>
                       <div className="text-[12px] font-bold text-[#1A1F36]">Available</div>
                    </div>
                    <div className="w-px h-8 bg-black/[0.06]" />
                    <div className="flex-1 text-center">
                       <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">Payment</div>
                       <div className="text-[12px] font-bold text-[#1A1F36]">COD / UPI</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default ShopProfileClient;