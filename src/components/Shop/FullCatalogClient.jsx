"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "../UI/SafeImage";
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
  X,
  ShieldCheck,
  Loader2
} from "lucide-react";
import Dialog from "../UI/Dialog";
import ItemModal from "./ItemModal";
import Card from "../UI/Card";
import Button from "../UI/Button";
import { incrementLeads } from "@/lib/shopUtils";
import { BRAND, DOMAIN } from "@/lib/config";
import { submitInquiry } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";

const FullCatalogClient = ({ shop, masterCategories = [] }) => {
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("vertical");

  // Cart States
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showInquiryAuthDialog, setShowInquiryAuthDialog] = useState(false);
  const [inquiryDetails, setInquiryDetails] = useState({ name: "", phone: "", email: "" });
  const [inquiryDetailsErrors, setInquiryDetailsErrors] = useState({});
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    if (shop?.id && typeof window !== "undefined") {
      const savedCart = localStorage.getItem(`inquiry_cart_${shop.id}`);
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) { }
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
  const isWhatsAppEnabled = shop?.paidFeatures?.whatsapp_checkout?.enabled;
  const isDashboardEnabled = shop?.paidFeatures?.dashboard_checkout?.enabled;
  const isAddToCartEnabled = isWhatsAppEnabled || isDashboardEnabled;

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

  const handleWhatsAppCartOrder = async () => {
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

    setCart([]);
    localStorage.removeItem(`inquiry_cart_${shop.id}`);

    const cleanPhone = shop.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const submitDashboardInquiry = async (details = {}) => {
    if (cart.length === 0) return;
    incrementLeads(shop.id);
    const shopUrl = `${DOMAIN}/shop/${shop.slug}`;

    let itemList = cart.map((item, idx) => {
      const priceStr = item.price ? ` (₹${item.price})` : '';
      return `${idx + 1}. *${item.name}* x ${item.quantity}${priceStr}`;
    }).join('\n');

    const totalStr = cart.some(i => i.price)
      ? `\n\n*Estimated Total:* ₹${cart.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.quantity), 0)}`
      : '';

    const message = `Hi! I found your shop *${shop.name}* on ${BRAND}!\n\nI would like to submit the following inquiry via dashboard:\n\n${itemList}${totalStr}\n\n🔗 ${shopUrl}`;

    setSubmittingInquiry(true);
    try {
      let deviceId = localStorage.getItem("guest_device_id");
      if (!deviceId) {
        deviceId = "dev_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("guest_device_id", deviceId);
      }

      await submitInquiry({
        shopId: shop.id,
        shopName: shop.name,
        shopPhone: shop.phone || "",
        deviceId,
        items: cart,
        totalAmount: cart.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.quantity), 0),
        message,
        type: "Dashboard Inquiry",
        ...details
      });
      setCart([]);
      localStorage.removeItem(`inquiry_cart_${shop.id}`);
      setShowSuccessDialog(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleDashboardCartOrder = async () => {
    if (cart.length === 0) return;
    if (user) {
      setInquiryDetails({
        name: inquiryDetails.name || user.displayName || user.name || "",
        email: inquiryDetails.email || user.email || "",
        phone: inquiryDetails.phone || user.phoneNumber || user.phone || ""
      });
    }
    setShowInquiryAuthDialog(true);
  };

  const handleManualInquirySubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!inquiryDetails.name.trim()) errors.name = "Name is required";
    if (!inquiryDetails.phone.trim()) {
      errors.phone = "Mobile is required";
    } else if (!/^\d{10}$/.test(inquiryDetails.phone.trim())) {
      errors.phone = "Enter a valid 10-digit mobile number";
    }
    if (inquiryDetails.email.trim() && !/\S+@\S+\.\S+/.test(inquiryDetails.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      setInquiryDetailsErrors(errors);
      return;
    }

    setInquiryDetailsErrors({});
    setShowInquiryAuthDialog(false);
    await submitDashboardInquiry({
      userId: user?.uid || user?.id || "",
      customerName: inquiryDetails.name.trim(),
      customerPhone: inquiryDetails.phone.trim(),
      customerEmail: inquiryDetails.email.trim()
    });
  };

  useEffect(() => {
    if (user && showInquiryAuthDialog) {
      setInquiryDetails(prev => ({
        name: prev.name || user.displayName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phoneNumber || user.phone || ""
      }));
    }
  }, [user, showInquiryAuthDialog]);

  const handleIndividualWhatsAppOrder = async (item) => {
    const itemToOrder = item || selectedItem;
    if (!itemToOrder || !shop.phone) return;
    incrementLeads(shop.id);
    const shopUrl = `${DOMAIN}/shop/${shop.slug}`;
    const message = `Hi! I found your shop *${shop.name}* on ${BRAND}!\n\nI'm interested in: *${itemToOrder.name}*\nCategory: ${itemToOrder.category || 'General'}\n\nCan you please provide more details?\n\n🔗 ${shopUrl}`;

    const cleanPhone = shop.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] selection:bg-[#FF6A00]/10 selection:text-[#FF6A00] pb-24">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/[0.05] shadow-sm">
        <div className="w-full px-4 sm:px-6 md:px-8 xl:px-12 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-md bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-[#0A0A0F]/60 hover:text-[#0A0A0F] hover:bg-black/[0.06] transition-all flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="w-8 h-8 rounded-md bg-zinc-50 border border-black/[0.08] overflow-hidden flex items-center justify-center flex-shrink-0 relative shadow-sm">
              <SafeImage
                src={shop.logo}
                alt={shop.name}
                fallbackIcon={Store}
                iconSize={16}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-[#0A0A0F] truncate tracking-tight">{shop.name}</h1>
              <p className="text-[11px] text-[#0A0A0F]/45 font-medium truncate">Full Catalog ({allItems.length} items)</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="w-full px-4 sm:px-6 md:px-8 xl:px-12 py-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0F]/30" />
            <input
              type="text"
              placeholder={selectedCategory === "All" ? "Search all products & services..." : `Search in ${selectedCategory}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md bg-white border border-black/[0.08] shadow-sm text-[13px] font-medium outline-none focus:border-[#FF6A00]/40 transition-all"
            />
          </div>
          <button
            onClick={() => setViewMode(viewMode === "vertical" ? "grid" : "vertical")}
            className="w-10 h-10 rounded-md bg-white border border-black/[0.08] flex items-center justify-center text-[#0A0A0F]/60 hover:text-[#0A0A0F] hover:bg-black/[0.04] transition-all shadow-sm flex-shrink-0"
            title={viewMode === "vertical" ? "Switch to Grid View" : "Switch to Vertical List View"}
          >
            {viewMode === "vertical" ? <LayoutGrid size={15} /> : <List size={15} />}
          </button>
        </div>

        {/* Category Scrollable Tabs */}
        {menuItems.length > 1 && (
          <div className="sticky top-[56px] z-30 bg-[#FAFAF8]/90 backdrop-blur-md py-2 border-b border-black/[0.05] -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div
              className="w-full flex items-center gap-1.5 overflow-x-auto scroll-smooth pr-4 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => setSelectedCategory("All")}
                className={`h-8 px-3 rounded-md text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${selectedCategory === "All"
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
                    className={`h-8 px-3 rounded-md text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${isSelected
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
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-2 sm:gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-3'}`}>
              {filteredItems.map((item, idx) => (
                <ProductCard
                  key={idx}
                  item={item}
                  onView={(item) => setSelectedItem(item)}
                  viewType={getCategoryViewType(item.category)}
                  viewMode={viewMode}
                  cartItem={cart.find(i => i.name === item.name)}
                  onUpdateCart={handleUpdateCart}
                  isAddToCartEnabled={isAddToCartEnabled}
                  onEnquireIndividual={handleIndividualWhatsAppOrder}
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
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-2 sm:gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-3'}`}>
                  {(section.items || []).map((item, itemIdx) => (
                    <ProductCard
                      key={itemIdx}
                      item={{ ...item, category: section.name || section.category }}
                      onView={(item) => setSelectedItem(item)}
                      viewType={getCategoryViewType(section.name || section.category)}
                      viewMode={viewMode}
                      cartItem={cart.find(i => i.name === item.name)}
                      onUpdateCart={handleUpdateCart}
                      isAddToCartEnabled={isAddToCartEnabled}
                      onEnquireIndividual={handleIndividualWhatsAppOrder}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-md border border-dashed border-black/[0.1] shadow-sm">
            <ShoppingBag size={36} className="mx-auto text-[#0A0A0F]/10 mb-3" />
            <h3 className="text-[15px] font-bold text-[#0A0A0F] mb-1">No items found</h3>
            <p className="text-[12px] text-[#0A0A0F]/45 font-medium">No products or services match your selection.</p>
          </div>
        )}
      </main>

      <ItemModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        cart={cart}
        onUpdateCart={handleUpdateCart}
        isAddToCartEnabled={isAddToCartEnabled}
        onEnquireIndividual={handleIndividualWhatsAppOrder}
      />

      {/* ── FLOATING CART BAR ── */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-fade-in">
          <div className="bg-[#0A0A0F] text-white px-4 py-3 rounded-md shadow-2xl flex items-center justify-between gap-4 border border-white/10 backdrop-blur-md bg-[#0A0A0F]/95">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center text-[#FF6A00] relative flex-shrink-0">
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
                disabled={submittingInquiry}
                className="h-9 px-4 rounded-md bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white text-[13px] font-bold transition-all shadow-lg shadow-[#FF6A00]/20 flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {submittingInquiry ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>View Cart</span>
                    <ArrowRight size={14} />
                  </>
                )}
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
                  <div key={idx} className="flex items-stretch justify-between rounded-md bg-black/[0.02] border border-black/[0.05] overflow-hidden min-h-[52px]">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-12 self-stretch bg-white border-r border-black/[0.05] overflow-hidden relative flex-shrink-0">
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          fallbackIcon={ShoppingBag}
                          iconSize={16}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 py-2 pr-1">
                        <h5 className="text-[13px] font-bold text-[#0A0A0F] truncate">{item.name}</h5>
                        <span className="text-[11px] font-black text-[#FF6A00] block mt-0.5">
                          {item.price ? `₹${item.price}` : "Enquire"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center pr-3 pl-1 flex-shrink-0">
                      <div className="flex items-center bg-white border border-black/[0.1] rounded-md shadow-2xs overflow-hidden h-7">
                        <button onClick={() => handleUpdateCart(item, item.quantity - 1)} className="w-7 h-full flex items-center justify-center text-[#0A0A0F]/60 hover:bg-black/[0.04] transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-[11px] font-black text-[#0A0A0F] min-w-[14px] text-center">{item.quantity}</span>
                        <button onClick={() => handleUpdateCart(item, item.quantity + 1)} className="w-7 h-full flex items-center justify-center text-[#0A0A0F]/60 hover:bg-black/[0.04] transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
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
              <div className="pt-3 border-t border-black/[0.05] flex flex-col gap-2">
                {isWhatsAppEnabled && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-bold shadow-md shadow-[#FF6A00]/10 text-[13px] h-10 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22c35e] border-none text-white"
                    onClick={() => {
                      handleWhatsAppCartOrder();
                      setIsCartOpen(false);
                    }}
                  >
                    <MessageSquare size={15} />
                    <span>Checkout on WhatsApp</span>
                  </Button>
                )}
                {isDashboardEnabled && (
                  <Button
                    variant="secondary"
                    size="lg"
                    loading={submittingInquiry}
                    className="w-full font-bold text-[13px] h-10 border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    onClick={() => {
                      handleDashboardCartOrder();
                      setIsCartOpen(false);
                    }}
                  >
                    <span>Submit Inquiry to Dashboard</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Inquiry Submitted!"
        subtitle="Your request was successfully sent to the shop dashboard"
        maxWidth="max-w-[420px]"
      >
        <div className="space-y-4 pt-2 text-center">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <ShieldCheck size={24} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            The merchant has received your inquiry on their dashboard. You can track all your inquiries from the <strong>My Inquiries</strong> section of your profile.
          </p>
          <div className="pt-2 flex justify-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSuccessDialog(false)}
              className="w-32 font-bold"
            >
              Okay
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Inquiry Auth & Details Dialog */}
      <Dialog
        isOpen={showInquiryAuthDialog}
        onClose={() => setShowInquiryAuthDialog(false)}
        title="Submit Inquiry Details"
        subtitle="Log in or fill your details to submit the inquiry to the merchant"
        maxWidth="max-w-[400px]"
      >
        <div className="space-y-4 py-1">
          {/* Quick Google Login */}
          {!user ? (
            <>
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors shadow-2xs cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">
                  Continue with Google
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/[0.05]"></div>
                </div>
                <span className="relative px-3 bg-white dark:bg-zinc-900 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Or Enter Details Manually
                </span>
              </div>
            </>
          ) : (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-md text-center">
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Logged in as <span className="font-bold text-zinc-900 dark:text-zinc-100">{user.displayName || user.email}</span>
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Please verify or enter your contact details below.</p>
            </div>
          )}

          {/* Manual Details Form */}
          <form onSubmit={handleManualInquirySubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={inquiryDetails.name}
                onChange={(e) => setInquiryDetails({ ...inquiryDetails, name: e.target.value })}
                className="w-full px-3 py-2 text-[13px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] transition-all h-9"
              />
              {inquiryDetailsErrors.name && (
                <p className="text-[11px] font-bold text-red-500">{inquiryDetailsErrors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={inquiryDetails.phone}
                onChange={(e) => setInquiryDetails({ ...inquiryDetails, phone: e.target.value })}
                className="w-full px-3 py-2 text-[13px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] transition-all h-9"
              />
              {inquiryDetailsErrors.phone && (
                <p className="text-[11px] font-bold text-red-500">{inquiryDetailsErrors.phone}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={inquiryDetails.email}
                onChange={(e) => setInquiryDetails({ ...inquiryDetails, email: e.target.value })}
                className="w-full px-3 py-2 text-[13px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] transition-all h-9"
              />
              {inquiryDetailsErrors.email && (
                <p className="text-[11px] font-bold text-red-500">{inquiryDetailsErrors.email}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submittingInquiry}
              className="w-full font-bold text-[13px] h-10 mt-2 bg-[#FF6A00] hover:bg-[#e65f00] border-none text-white flex items-center justify-center gap-2"
            >
              <span>Submit Inquiry</span>
            </Button>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

const ProductCard = ({ item, onView, viewType = "image", viewMode = "vertical", cartItem, onUpdateCart, isAddToCartEnabled, onEnquireIndividual }) => {
  return (
    <Card padding={false} className={`group bg-white border border-black/[0.06] hover:border-black/[0.15] hover:shadow-md transition-all duration-300 rounded-md relative overflow-hidden flex ${viewMode === 'grid' ? 'flex-col items-stretch' : 'items-stretch'}`}>
      {viewType !== "text" && (
        <div
          className={`${viewMode === 'grid' ? 'w-full aspect-square border-b' : viewType === 'mini' ? 'w-16 self-stretch border-r' : 'w-24 sm:w-32 self-stretch border-r'} bg-zinc-50 border-black/[0.05] overflow-hidden relative cursor-pointer group-hover:border-black/[0.1] transition-all flex-shrink-0`}
          onClick={() => onView?.(item)}
        >
          <SafeImage
            src={item.image}
            alt={item.name}
            fill
            fallbackIcon={ShoppingBag}
            iconSize={viewType === 'mini' ? 18 : 24}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay Badges Attached Flush to Corner */}
          <div className="absolute top-0 left-0 z-10 flex flex-col items-start">
            {item.featured && (
              <span className="text-[9px] font-black bg-[#FF6A00] text-white px-2.5 py-1 rounded-br-xl uppercase tracking-wider shadow-md border-b border-r border-[#FF6A00]/20 flex items-center gap-1">Featured</span>
            )}
            {item.isNew !== false && (
              <span className={`text-[9px] font-black bg-emerald-600 text-white px-2.5 py-1 rounded-br-xl border-b border-r uppercase tracking-wider shadow-md border-emerald-600/20 flex items-center gap-1`}>
                New
              </span>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0 p-2.5 sm:p-3.5 flex flex-col justify-between bg-white self-stretch">
        <div>
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <h4 className="text-[13px] sm:text-[15px] font-bold text-[#0A0A0F] truncate tracking-tight cursor-pointer group-hover:text-[#FF6A00] transition-colors" onClick={() => onView?.(item)}>{item.name}</h4>
          </div>
          <p className={`text-[11px] sm:text-[12px] text-[#0A0A0F]/60 font-medium mb-1.5 sm:mb-2 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1'} cursor-pointer leading-snug`} onClick={() => onView?.(item)}>{item.description || "Premium quality offering from our catalog. Contact us for details."}</p>
          {/* Stock Badge — only shown when stock is tracked */}
          {typeof item.stock === 'number' && (
            item.stock <= 0 ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md mb-1.5 uppercase tracking-wide">
                Out of stock
              </span>
            ) : item.stock <= 5 ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md mb-1.5 uppercase tracking-wide">
                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse inline-block" />
                {item.stock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md mb-1.5 uppercase tracking-wide">
                {item.stock} in stock
              </span>
            )
          )}
        </div>
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-black/[0.04]">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-[#0A0A0F]/40 uppercase tracking-widest block mb-0.5">Price</span>
            <span className="text-[13px] sm:text-[15px] font-black text-[#FF6A00] truncate block">
              {item.price ? `₹${item.price}` : "Enquire"}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {isAddToCartEnabled ? (
              cartItem ? (
                <div className="flex items-center bg-[#FF6A00] text-white rounded-md shadow-sm overflow-hidden h-7 sm:h-8 border border-[#FF6A00]">
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
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white transition-all shadow-2xs"
                  title="Add to Inquiry Cart"
                >
                  <ShoppingBag size={14} className="sm:w-4 sm:h-4" />
                </button>
              )
            ) : (
              <button
                onClick={() => onEnquireIndividual?.(item)}
                className="h-7 px-2.5 sm:h-8 sm:px-3.5 rounded-md bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center gap-1 sm:gap-1.5 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white transition-all shadow-2xs text-[11px] sm:text-[12px] font-bold"
                title="Inquire on WhatsApp"
              >
                <MessageSquare size={13} className="sm:w-3.5 sm:h-3.5" />
                <span>Enquire</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FullCatalogClient;
