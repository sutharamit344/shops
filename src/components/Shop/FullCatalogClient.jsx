"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Eye,
  Plus,
  Minus,
  MessageSquare,
  LayoutGrid,
  List,
  Store,
  ArrowRight,
  Trash2,
  X
} from "lucide-react";
import Dialog from "../UI/Dialog";
import Card from "../UI/Card";
import Button from "../UI/Button";
import { incrementLeads } from "@/lib/shopUtils";
import { BRAND, DOMAIN } from "@/lib/config";

const FullCatalogClient = ({ shop, masterCategories = [] }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("vertical");

  // Cart States
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (shop?.id && typeof window !== "undefined") {
      const savedCart = localStorage.getItem(`inquiry_cart_${shop.id}`);
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch(e){}
      }
    }
  }, [shop?.id]);

  const menuItems = shop.menu || [];
  const allItems = menuItems.flatMap(cat =>
    (cat.items || []).map(item => ({ ...item, category: cat.category || cat.name }))
  );

  const getCategoryViewType = (categoryName) => {
    const found = masterCategories.find(c => c.name?.toLowerCase() === categoryName?.toLowerCase());
    return found?.productViewType || "image";
  };

  const filteredItems = searchQuery
    ? allItems.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery?.toLowerCase());
      if (selectedCategory === "All") return matchesSearch;
      return matchesSearch && (item.category?.toLowerCase() === selectedCategory?.toLowerCase());
    })
    : [];

  const displaySections = menuItems.filter(section => {
    if (selectedCategory === "All") return true;
    const catName = section.name || section.category;
    return catName?.toLowerCase() === selectedCategory?.toLowerCase();
  });

  // Cart Handlers
  const handleUpdateCart = (item, quantity) => {
    let nextCart;
    if (quantity <= 0) {
      nextCart = cart.filter(i => i.name !== item.name);
    } else {
      const existing = cart.find(i => i.name === item.name);
      if (existing) {
        nextCart = cart.map(i => i.name === item.name ? { ...i, quantity } : i);
      } else {
        nextCart = [...cart, { ...item, quantity }];
      }
    }
    setCart(nextCart);
    if (shop?.id && typeof window !== "undefined") {
      localStorage.setItem(`inquiry_cart_${shop.id}`, JSON.stringify(nextCart));
    }
  };

  const handleWhatsAppCartOrder = () => {
    if (!shop.phone || cart.length === 0) return;
    incrementLeads(shop.id);
    const shopUrl = `${DOMAIN}/shop/${shop.slug}`;

    let itemList = cart.map((item, idx) => {
      const priceStr = item.price ? ` (₹${item.price})` : '';
      return `${idx + 1}. *${item.name}* x ${item.quantity}${priceStr}`;
    }).join('\n');

    const totalStr = cart.some(i => i.price)
      ? `\n\n*Estimated Total:* ₹${cart.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.quantity), 0)}`
      : '';

    const message = `Hi! I found your shop *${shop.name}* on ${BRAND}!\n\nI would like to inquire about the following items:\n\n${itemList}${totalStr}\n\nCan you please confirm availability and provide further details?\n\n🔗 ${shopUrl}`;

    const cleanPhone = shop.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] selection:bg-[#FF6A00]/10 selection:text-[#FF6A00] pb-24">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/[0.05] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-[#0A0A0F]/60 hover:text-[#0A0A0F] hover:bg-black/[0.06] transition-all flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-black/[0.08] overflow-hidden flex items-center justify-center flex-shrink-0 relative shadow-sm">
              {shop.logo ? (
                <Image src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo} alt={shop.name} fill unoptimized className="object-cover" />
              ) : (
                <Store size={16} className="text-[#0A0A0F]/40" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-[#0A0A0F] truncate tracking-tight">{shop.name}</h1>
              <p className="text-[11px] text-[#0A0A0F]/45 font-medium truncate">Full Catalog ({allItems.length} items)</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0F]/30" />
            <input
              type="text"
              placeholder={selectedCategory === "All" ? "Search all products & services..." : `Search in ${selectedCategory}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-black/[0.08] shadow-sm text-[13px] font-medium outline-none focus:border-[#FF6A00]/40 transition-all"
            />
          </div>
          <button
            onClick={() => setViewMode(viewMode === "vertical" ? "grid" : "vertical")}
            className="w-10 h-10 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center text-[#0A0A0F]/60 hover:text-[#0A0A0F] hover:bg-black/[0.04] transition-all shadow-sm flex-shrink-0"
            title={viewMode === "vertical" ? "Switch to Grid View" : "Switch to Vertical List View"}
          >
            {viewMode === "vertical" ? <LayoutGrid size={15} /> : <List size={15} />}
          </button>
        </div>

        {/* Category Scrollable Tabs */}
        {menuItems.length > 1 && (
          <div className="sticky top-[56px] z-30 bg-[#FAFAF8]/90 backdrop-blur-md py-2 border-b border-black/[0.05] -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div
              className="max-w-5xl mx-auto flex items-center gap-1.5 overflow-x-auto scroll-smooth pr-4 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => setSelectedCategory("All")}
                className={`h-8 px-3 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${selectedCategory === "All"
                  ? "bg-[#0A0A0F] text-white shadow-sm"
                  : "bg-black/[0.04] text-[#0A0A0F]/60 hover:bg-black/[0.08] hover:text-[#0A0A0F]"
                  }`}
              >
                <span>All Offerings</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${selectedCategory === 'All' ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-[#0A0A0F]/60'}`}>
                  {allItems.length}
                </span>
              </button>
              {menuItems.map((section, idx) => {
                const catName = section.name || section.category;
                const count = section.items?.length || 0;
                const isSelected = selectedCategory?.toLowerCase() === catName?.toLowerCase();
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(catName)}
                    className={`h-8 px-3 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${isSelected
                      ? "bg-[#0A0A0F] text-white shadow-sm"
                      : "bg-black/[0.04] text-[#0A0A0F]/60 hover:bg-black/[0.08] hover:text-[#0A0A0F]"
                      }`}
                  >
                    <span>{catName}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-[#0A0A0F]/60'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Catalog List */}
        {searchQuery ? (
          <div className="space-y-3 pt-1">
            <h3 className="text-[13px] font-bold text-[#0A0A0F]/40 uppercase tracking-wider px-1">Search Results ({filteredItems.length})</h3>
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3' : 'grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3'}`}>
              {filteredItems.map((item, idx) => (
                <ProductCard
                  key={idx}
                  item={item}
                  onView={(item) => setSelectedItem(item)}
                  viewType={getCategoryViewType(item.category)}
                  viewMode={viewMode}
                  cartItem={cart.find(i => i.name === item.name)}
                  onUpdateCart={handleUpdateCart}
                />
              ))}
            </div>
          </div>
        ) : displaySections.length > 0 ? (
          <div className="space-y-6 pt-1">
            {displaySections.map((section, idx) => (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center justify-between px-1 border-b border-black/[0.05] pb-1.5">
                  <h3 className="text-[16px] font-bold text-[#0A0A0F] tracking-tight">{section.name || section.category}</h3>
                  <span className="text-[11px] font-bold bg-black/[0.04] px-2 py-0.5 rounded text-[#0A0A0F]/60 uppercase tracking-widest">{section.items?.length || 0} items</span>
                </div>
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3' : 'grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3'}`}>
                  {(section.items || []).map((item, itemIdx) => (
                    <ProductCard
                      key={itemIdx}
                      item={{ ...item, category: section.name || section.category }}
                      onView={(item) => setSelectedItem(item)}
                      viewType={getCategoryViewType(section.name || section.category)}
                      viewMode={viewMode}
                      cartItem={cart.find(i => i.name === item.name)}
                      onUpdateCart={handleUpdateCart}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-xl border border-dashed border-black/[0.1] shadow-sm">
            <ShoppingBag size={36} className="mx-auto text-[#0A0A0F]/10 mb-3" />
            <h3 className="text-[15px] font-bold text-[#0A0A0F] mb-1">No items found</h3>
            <p className="text-[12px] text-[#0A0A0F]/45 font-medium">No products or services match your selection.</p>
          </div>
        )}
      </main>

      {/* ── PRODUCT DETAILS MODAL ── */}
      <Dialog
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        showHeader={false}
        maxWidth="max-w-[400px]"
      >
        {selectedItem && (
          <div className="flex flex-col gap-5 py-2 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#0A0A0F]/60 hover:text-[#0A0A0F] hover:bg-white shadow-lg transition-all"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="w-full aspect-video rounded-lg bg-zinc-50 border border-black/[0.05] overflow-hidden relative shadow-inner">
              {selectedItem.image ? (
                <Image src={selectedItem.image.includes(" ") ? selectedItem.image.replace(/\s/g, "%20") : selectedItem.image} alt={selectedItem.name} fill unoptimized className="object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-2 bg-[#FAFAF8]">
                  <ShoppingBag size={36} className="text-zinc-300" />
                  <span className="text-[11px] font-medium text-zinc-400">No image available</span>
                </div>
              )}
              {selectedItem.popular && (
                <div className="absolute top-2.5 left-2.5 bg-[#FF6A00] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow">
                  Popular Offering
                </div>
              )}
              {selectedItem.featured && (
                <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow">
                  Featured
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[16px] font-bold text-[#0A0A0F] tracking-tight mb-1">{selectedItem.name}</h3>
                  <p className="text-[12px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 inline-block px-2 py-0.5 rounded">
                    {selectedItem.price ? `₹${selectedItem.price}` : "Price on Enquiry"}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-black/[0.05]">
                <h4 className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest mb-1">Description</h4>
                <p className="text-[12px] text-[#0A0A0F]/70 font-medium leading-relaxed whitespace-pre-line">
                  {selectedItem.description || "Premium quality offering from our catalog. Contact us for more details, custom orders, or availability."}
                </p>
              </div>

              <div className="pt-3 border-t border-black/[0.05]">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-md shadow-[#FF6A00]/20 text-[13px] h-10"
                  icon={ShoppingBag}
                  onClick={() => {
                    handleUpdateCart(selectedItem, (cart.find(i => i.name === selectedItem.name)?.quantity || 0) + 1);
                    setSelectedItem(null);
                  }}
                >
                  Add to Inquiry Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── FLOATING CART BAR ── */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-fade-in">
          <div className="bg-[#0A0A0F] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/10 backdrop-blur-md bg-[#0A0A0F]/95">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FF6A00] relative flex-shrink-0">
                <ShoppingBag size={20} />
                <span className="absolute -top-1 -right-1 bg-[#FF6A00] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold tracking-tight truncate">
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'} Selected
                </h4>
                <p className="text-[11px] text-white/60 font-medium truncate">
                  {cart.map(i => `${i.name} (${i.quantity})`).join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsCartOpen(true)}
                className="h-9 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white text-[13px] font-bold transition-all shadow-lg shadow-[#FF6A00]/20 flex items-center gap-2 whitespace-nowrap"
              >
                <span>View Cart</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INQUIRY CART MODAL ── */}
      <Dialog
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Your Inquiry Cart"
        subtitle={shop?.name}
        maxWidth="max-w-[420px]"
      >
        <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-[#0A0A0F]/40 font-medium text-[13px]">
              Your cart is empty. Add items from the catalog to inquire.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <span className="text-[12px] font-bold text-[#0A0A0F]/60 uppercase tracking-wider">Selected Items</span>
                <button
                  onClick={() => { setCart([]); if (shop?.id) localStorage.removeItem(`inquiry_cart_${shop.id}`); }}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} />
                  <span>Clear All</span>
                </button>
              </div>
              <div className="space-y-2.5">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-black/[0.02] border border-black/[0.05]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-black/[0.05] overflow-hidden relative flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image.includes(" ") ? item.image.replace(/\s/g, "%20") : item.image} alt={item.name} fill unoptimized className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-white">
                            <ShoppingBag size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[13px] font-bold text-[#0A0A0F] truncate">{item.name}</h5>
                        <span className="text-[11px] font-black text-[#FF6A00]">
                          {item.price ? `₹${item.price}` : "Enquire"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center bg-white border border-black/[0.1] rounded-lg shadow-2xs overflow-hidden h-7 flex-shrink-0">
                      <button onClick={() => handleUpdateCart(item, item.quantity - 1)} className="w-7 h-full flex items-center justify-center text-[#0A0A0F]/60 hover:bg-black/[0.04] transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-[11px] font-black text-[#0A0A0F]">{item.quantity}</span>
                      <button onClick={() => handleUpdateCart(item, item.quantity + 1)} className="w-7 h-full flex items-center justify-center text-[#0A0A0F]/60 hover:bg-black/[0.04] transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {cart.some(i => i.price) && (
                <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#0A0A0F]/60">Estimated Total:</span>
                  <span className="text-[16px] font-black text-[#FF6A00]">
                    ₹{cart.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.quantity), 0)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-black/[0.05]">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-md shadow-[#FF6A00]/20 text-[13px] h-10"
                  icon={MessageSquare}
                  onClick={() => {
                    handleWhatsAppCartOrder();
                    setIsCartOpen(false);
                  }}
                >
                  Send Inquiry on WhatsApp
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};

const ProductCard = ({ item, onView, viewType = "image", viewMode = "vertical", cartItem, onUpdateCart }) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <Card padding={false} className={`group bg-white border border-black/[0.06] hover:border-black/[0.15] hover:shadow-md transition-all duration-300 rounded-2xl relative overflow-hidden flex ${viewMode === 'grid' ? 'flex-col items-stretch' : 'items-stretch'}`}>
      {viewType !== "text" && (
        <div
          className={`${viewMode === 'grid' ? 'w-full aspect-square border-b' : viewType === 'mini' ? 'w-16 self-stretch border-r' : 'w-24 sm:w-32 self-stretch border-r'} bg-zinc-50 border-black/[0.05] overflow-hidden relative cursor-pointer group-hover:border-black/[0.1] transition-all flex-shrink-0`}
          onClick={() => onView?.(item)}
        >
          {item.image && !imageError ? (
            <Image 
              src={item.image.includes(" ") ? item.image.replace(/\s/g, "%20") : item.image} 
              alt={item.name} 
              fill 
              unoptimized 
              onError={() => setImageError(true)}
              className="object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-[#FAFAF8] absolute inset-0">
              <ShoppingBag size={viewType === 'mini' ? 18 : 24} className="text-zinc-300" />
            </div>
          )}
          {/* Overlay Badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
            {item.featured ? (
              <span className="text-[9px] font-bold bg-amber-500/90 backdrop-blur-md border border-amber-600/20 text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">Featured</span>
            ) : item.popular ? (
              <span className="text-[9px] font-bold bg-white/90 backdrop-blur-md border border-black/[0.08] text-[#FF6A00] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">Popular</span>
            ) : null}
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0 p-2.5 sm:p-3.5 flex flex-col justify-between bg-white self-stretch">
        <div>
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <h4 className="text-[13px] sm:text-[15px] font-bold text-[#0A0A0F] truncate tracking-tight cursor-pointer group-hover:text-[#FF6A00] transition-colors" onClick={() => onView?.(item)}>{item.name}</h4>
          </div>
          <p className={`text-[11px] sm:text-[12px] text-[#0A0A0F]/60 font-medium mb-2 sm:mb-3 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1'} cursor-pointer leading-snug`} onClick={() => onView?.(item)}>{item.description || "Premium quality offering from our catalog. Contact us for details."}</p>
        </div>
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-black/[0.04]">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-[#0A0A0F]/40 uppercase tracking-widest block mb-0.5">Price</span>
            <span className="text-[13px] sm:text-[15px] font-black text-[#FF6A00] truncate block">
              {item.price ? `₹${item.price}` : "Enquire"}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {cartItem ? (
              <div className="flex items-center bg-[#FF6A00] text-white rounded-xl shadow-sm overflow-hidden h-7 sm:h-8 border border-[#FF6A00]">
                <button onClick={() => onUpdateCart(item, cartItem.quantity - 1)} className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-black/20 transition-colors">
                  <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <span className="px-1.5 sm:px-2 text-[11px] sm:text-[12px] font-black">{cartItem.quantity}</span>
                <button onClick={() => onUpdateCart(item, cartItem.quantity + 1)} className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-black/20 transition-colors">
                  <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onUpdateCart(item, 1)}
                className="h-7 px-2.5 sm:h-8 sm:px-3.5 rounded-xl bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center gap-1 sm:gap-1.5 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white transition-all shadow-2xs text-[11px] sm:text-[12px] font-bold"
                title="Add to Inquiry Cart"
              >
                <Plus size={13} className="sm:w-3.5 sm:h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FullCatalogClient;
