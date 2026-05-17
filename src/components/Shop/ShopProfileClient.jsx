"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Star, MapPin, MessageSquare, Phone, Share2, Heart,
  Clock, Award, Users, CircleCheckBig, Globe, ChevronRight,
  ShoppingBag, Search, X, ExternalLink, Truck, Shield, DollarSign,
  Mail, Clock as ClockIcon, Calendar, Navigation, Info,
  Store, Plus, ArrowRight, ShieldCheck, Image as ImageIcon,
  ThumbsUp, Star as StarIcon, Send, User, Loader2, Copy,
  ArrowLeft,
  LayoutGrid,
  List,
  Menu as MenuIcon,
  Eye,
  Minus,
  Trash2,
  Cross,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin
} from "lucide-react";
import Dialog from "../UI/Dialog";
import Link from "next/link";
import Image from "next/image";
import { incrementViews, incrementLeads } from "@/lib/shopUtils";
import { submitShopRating, getShopRatings } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { BRAND, DOMAIN } from "@/lib/config";
import Button from "../UI/Button";
import Card from "../UI/Card";
import OpenNowBadge from "../UI/OpenNowBadge";

const ShopProfileClient = ({ shop, masterCategories = [] }) => {
  const router = useRouter();

  const getFullAddress = (s) => {
    if (!s) return "";
    const cand = [
      s.shopNo,
      s.building,
      s.zone,
      s.village,
      s.address,
      s.area,
      s.city,
      s.state,
      s.pincode
    ].filter(Boolean).map(x => String(x).trim()).filter(Boolean);

    const res = [];
    cand.forEach(item => {
      if (res.some(existing => existing.toLowerCase().includes(item.toLowerCase()))) {
        return;
      }
      const subsetIdx = res.findIndex(existing => item.toLowerCase().includes(existing.toLowerCase()));
      if (subsetIdx !== -1) {
        res[subsetIdx] = item;
      } else {
        res.push(item);
      }
    });

    return res.join(", ") || [s.area, s.city].filter(Boolean).join(", ");
  };

  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    name: ""
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showCompactHeader, setShowCompactHeader] = useState(false);
  const [viewMode, setViewMode] = useState("vertical");

  // Cart States
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (shop?.id && typeof window !== "undefined") {
      const savedCart = localStorage.getItem(`inquiry_cart_${shop.id}`);
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) { }
      }
    }
  }, [shop?.id]);

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
    if (!shop?.phone || cart.length === 0) return;
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

  useEffect(() => {
    if (shop?.id) {
      incrementViews(shop.id);
      if (typeof window !== "undefined") {
        const savedShops = JSON.parse(localStorage.getItem("saved_shops") || "[]");
        setIsSaved(savedShops.includes(shop.id));
      }
    }
  }, [shop?.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 180) {
        setShowCompactHeader(true);
      } else {
        setShowCompactHeader(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined" && shop?.id) {
      const savedShops = JSON.parse(localStorage.getItem("saved_shops") || "[]");
      if (isSaved) {
        const nextSaved = savedShops.filter(id => id !== shop.id);
        localStorage.setItem("saved_shops", JSON.stringify(nextSaved));
        setIsSaved(false);
      } else {
        savedShops.push(shop.id);
        localStorage.setItem("saved_shops", JSON.stringify(savedShops));
        setIsSaved(true);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews' && reviews.length === 0) {
      fetchReviews();
    }
  }, [activeTab]);

  const fetchReviews = async () => {
    if (!shop?.id) return;
    setLoadingReviews(true);
    const data = await getShopRatings(shop.id);
    setReviews(data);
    setLoadingReviews(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;

    setSubmittingReview(true);
    const res = await submitShopRating(
      shop.id,
      reviewForm.rating,
      reviewForm.comment,
      reviewForm.name
    );

    if (res.success) {
      setReviewForm({ rating: 5, comment: "", name: "" });
      setShowReviewForm(false);
      fetchReviews();
    }
    setSubmittingReview(false);
  };

  const avgRating = shop.rating || "5.0";
  const totalReviews = shop.reviewCount || 0;
  const menuItems = shop.menu || [];

  const allItems = menuItems.flatMap(cat =>
    (cat.items || []).map(item => ({ ...item, category: cat.category || cat.name }))
  );

  const featuredItems = allItems.filter(item => item.featured);

  const getCategoryViewType = (categoryName) => {
    const found = masterCategories.find(c => c.name?.toLowerCase() === categoryName?.toLowerCase());
    return found?.productViewType || "image";
  };

  const filteredItems = searchQuery
    ? allItems.filter(item =>
      item.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery?.toLowerCase())
    )
    : [];

  const handleShare = async () => {
    if (navigator.share) {
      const url = `${DOMAIN}/shop/${shop.slug}`;
      const shareText = `Check out *${shop.name}* on ${BRAND}! A ${shop.category} in ${shop.area ? shop.area + ', ' : ''}${shop.city}.`;
      try {
        await navigator.share({ title: shop.name, text: shareText, url });
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async () => {
    const url = `${DOMAIN}/shop/${shop.slug}`;
    await navigator.clipboard.writeText(url);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  const handleWhatsAppOrder = (item) => {
    const itemToOrder = item || selectedItem;
    if (!itemToOrder || !shop.phone) return;
    incrementLeads(shop.id);
    const shopUrl = `${DOMAIN}/shop/${shop.slug}`;
    const message = `Hi! I found your shop *${shop.name}* on ${BRAND}!\n\nI'm interested in: *${itemToOrder.name}*\nCategory: ${itemToOrder.category || 'General'}\n\nCan you please provide more details?\n\n🔗 ${shopUrl}`;
    const cleanPhone = shop.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGeneralWhatsApp = () => {
    if (!shop.phone) return;
    incrementLeads(shop.id);
    const shopUrl = `${DOMAIN}/shop/${shop.slug}`;
    const location = [shop.area, shop.city].filter(Boolean).join(', ');
    const message = `Hi! I found your shop *${shop.name}* on ${BRAND}! 🏪\n\n📍 ${location}\n\nI'd like to know more about your products and services.\n\n🔗 ${shopUrl}`;
    const cleanPhone = shop.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-transparent selection:bg-[#FF6A00]/10 selection:text-[#FF6A00] relative overflow-hidden">

      {/* ── IMMERSIVE BACKGROUND (COVER + DYNAMIC BRAND GRADIENT) ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${shop.primaryColor || '#FF6A00'}15 0%, #F7F7F5 40%, #FFFFFF 100%)`
        }}
      >
        <div className="absolute inset-0 dot-grid opacity-[0.08]" />
        {shop.coverImage ? (
          <div className={`absolute top-0 left-0 right-0 h-60 md:h-[350px] transition-opacity duration-500 ${showCompactHeader ? "opacity-25" : "opacity-100"}`}>
            <Image
              src={shop.coverImage.includes(" ") ? shop.coverImage.replace(/\s/g, "%20") : shop.coverImage}
              alt={shop.name}
              fill
              priority
              unoptimized
              className="object-cover opacity-80"
              sizes="100vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%, ${shop.primaryColor || '#FF6A00'}20 80%, #F7F7F5 100%)`
              }}
            />
          </div>
        ) : (
          <div
            className="absolute top-0 left-0 right-0 h-60 md:h-[350px] flex items-center justify-center"
            style={{ backgroundColor: shop.primaryColor || '#0A0A0F' }}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/[0.15] backdrop-blur-md border border-white/[0.2] flex items-center justify-center shadow-lg">
              <Store size={40} className="text-white" />
            </div>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%, #F7F7F5 100%)`
              }}
            />
          </div>
        )}
      </div>

      {/* ── DYNAMIC OVERLAY HEADER (MOBILE ONLY) ───────────── */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center px-4 pt-2 pointer-events-auto transition-all duration-300 ${showCompactHeader ? "bg-white/90 backdrop-blur-xl border-b border-black/[0.05] shadow-sm justify-center" : "bg-gradient-to-b from-black/60 via-black/20 to-transparent justify-between"}`}>
        <button onClick={() => router.back()} className={`rounded-full backdrop-blur-md flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300 ${showCompactHeader ? "w-0 h-0 opacity-0 pointer-events-none overflow-hidden" : "w-9 h-9 opacity-100 bg-black/30 border border-white/10 text-white"}`}>
          <ArrowLeft size={18} />
        </button>

        <div className={`flex items-center gap-2.5 transition-all duration-300 min-w-0 ${showCompactHeader ? "opacity-100 translate-y-0 max-w-full" : "opacity-0 translate-y-2 pointer-events-none max-w-[210px]"}`}>
          <div className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-sm border border-black/[0.08] flex-shrink-0 relative overflow-hidden">
            {shop.logo ? (
              <Image
                src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo}
                alt={shop.name}
                fill
                unoptimized
                className="object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full rounded-md bg-gradient-to-br from-[#FF6A00] to-[#E65F00] flex items-center justify-center text-white text-[11px] font-bold">
                {shop.name?.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-[15px] font-bold text-[#0A0A0F] tracking-tight truncate">
            {shop.name}
          </span>
        </div>

        <div className={`flex items-center gap-2 transition-all duration-300 ${showCompactHeader ? "w-0 h-0 opacity-0 pointer-events-none overflow-hidden" : "opacity-100"}`}>
          <button onClick={handleSave} className={`w-9 h-9 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-all ${isSaved ? "text-red-500" : "text-white"}`} title={isSaved ? "Remove from saved" : "Save shop"}>
            <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button onClick={handleShare} className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all" title="Share shop">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT (SCROLLING CARDS & DETAILS) ── */}
      <div className="relative z-10 pt-48 md:pt-[260px]">
        {/* Scrolling gradient backdrop with seamless fade to blend perfectly into the cover image without any sharp border or separation line */}
        <div
          className="absolute inset-x-0 top-32 md:top-[180px] bottom-0 z-0"
          style={{
            background: `linear-gradient(180deg, rgba(247,247,245,0) 0%, #F7F7F5 15%, #FFFFFF 100%)`
          }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Panel: Profile Summary */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6 lg:z-30 transition-all duration-300 self-start">

              {/* Desktop Navigation & Actions */}
              <div className="hidden lg:flex items-center justify-between bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-black/[0.06] shadow-sm">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => router.back()} className="text-[#0A0A0F]/60 hover:text-[#0A0A0F] font-bold">Back</Button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" icon={Share2} onClick={handleShare} className="text-[#0A0A0F]/60 hover:text-[#0A0A0F] font-bold">Share</Button>
                  <Button variant="ghost" size="sm" icon={Heart} onClick={handleSave} className={`font-bold ${isSaved ? "text-red-500 hover:text-red-600 bg-red-50/50" : "text-[#0A0A0F]/60 hover:text-[#0A0A0F]"}`}>
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>

              <Card className="p-4 md:p-6 shadow-2xl border border-black/[0.06] rounded-lg overflow-hidden bg-white">
                {/* Header Info Row */}
                <div className="flex items-center gap-3 md:gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white p-1 shadow-md border border-black/[0.06] relative overflow-hidden">
                      {shop.logo ? (
                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                          <Image
                            src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo}
                            alt={shop.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#E65F00] flex items-center justify-center text-white text-2xl font-bold">
                          {shop.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    {shop.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10" title="Verified Business">
                        <ShieldCheck size={14} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1">
                      <h1 className="text-[17px] md:text-[22px] font-bold text-[#0A0A0F] tracking-tight leading-snug">{shop.name}</h1>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] md:text-[13px] text-[#0A0A0F]/50 font-medium flex-wrap mt-0.5">
                      <span>{shop.category}</span>
                      <span className="w-1 h-1 rounded-full bg-black/[0.2] flex-shrink-0" />
                      <span>{shop.area}, {shop.city}</span>
                    </div>
                  </div>
                </div>

                {/* Rating & Open Status */}
                <div className="flex items-center justify-between gap-2 p-3 bg-black/[0.02] rounded-lg border border-black/[0.04] mb-5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <StarIcon size={15} className="text-amber-500 flex-shrink-0" fill="currentColor" />
                    <span className="text-[14px] font-bold text-[#0A0A0F]">{avgRating}</span>
                    <span className="text-[12px] text-[#0A0A0F]/40 font-medium truncate">({totalReviews} reviews)</span>
                  </div>
                  <OpenNowBadge shop={shop} size="sm" />
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-5">
                  <Button variant="primary" className="flex-1 font-bold h-10 text-[13px]" icon={MessageSquare} onClick={handleGeneralWhatsApp}>WhatsApp</Button>
                  <Button variant="dark" className="w-12 h-10 p-0 rounded-lg flex items-center justify-center" onClick={() => window.location.href = `tel:${shop.phone}`}>
                    <Phone size={16} />
                  </Button>
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-black/[0.05]">
                  <p className="text-[13px] text-[#0A0A0F]/65 leading-relaxed font-medium mb-4">
                    {shop.description || `Welcome to ${shop.name}! We provide high-quality ${shop.category} services in ${shop.area}, ${shop.city}. Visit us for the best experience.`}
                  </p>
                </div>

                {/* Social Links */}
                {shop.socialLinks && shop.socialLinks.length > 0 && (
                  <div className="pt-4 border-t border-black/[0.05]">
                    <p className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.1em] mb-3">Social & Web</p>
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {shop.socialLinks.map((link, index) => {
                        if (!link.url) return null;
                        const platforms = {
                          instagram: { icon: Instagram, color: "text-pink-500 hover:bg-pink-50 border-pink-100 dark:border-pink-900/30 dark:hover:bg-pink-500/10" },
                          facebook: { icon: Facebook, color: "text-blue-600 hover:bg-blue-50 border-blue-100 dark:border-blue-900/30 dark:hover:bg-blue-500/10" },
                          youtube: { icon: Youtube, color: "text-red-500 hover:bg-red-50 border-red-100 dark:border-red-900/30 dark:hover:bg-red-500/10" },
                          twitter: { icon: Twitter, color: "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 border-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800" },
                          linkedin: { icon: Linkedin, color: "text-blue-500 hover:bg-blue-50 border-blue-100 dark:border-blue-900/30 dark:hover:bg-blue-500/10" },
                          website: { icon: Globe, color: "text-emerald-500 hover:bg-emerald-50 border-emerald-100 dark:border-emerald-900/30 dark:hover:bg-emerald-500/10" },
                        };
                        const config = platforms[link.platform] || platforms.website;
                        const Icon = config.icon;
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all shadow-sm bg-white dark:bg-zinc-900 ${config.color}`}
                            title={link.platform ? link.platform.charAt(0).toUpperCase() + link.platform.slice(1) : "Website"}
                          >
                            <Icon size={16} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contact List */}
                <div className="pt-4 border-t border-black/[0.05] space-y-3">
                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(getFullAddress(shop))}`)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-[#0A0A0F]/30 group-hover:text-[#FF6A00] transition-colors flex-shrink-0">
                        <Navigation size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.1em] mb-0.5">Address</p>
                        <p className="text-[12px] font-semibold text-[#0A0A0F]/70 leading-snug pr-2">{getFullAddress(shop)}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#0A0A0F]/20 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>

                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => window.location.href = `tel:${shop.phone}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-[#0A0A0F]/30 group-hover:text-emerald-500 transition-colors flex-shrink-0">
                        <Phone size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.1em] mb-0.5">Contact</p>
                        <p className="text-[12px] font-semibold text-[#0A0A0F]/70 truncate">+91 {shop.phone}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#0A0A0F]/20 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>

                  {(shop.ownerEmail || shop.email) && (
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => window.location.href = `mailto:${shop.ownerEmail || shop.email}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-[#0A0A0F]/30 group-hover:text-blue-500 transition-colors flex-shrink-0">
                          <Mail size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.1em] mb-0.5">Email</p>
                          <p className="text-[12px] font-semibold text-[#0A0A0F]/70 truncate">{shop.ownerEmail || shop.email}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-[#0A0A0F]/20 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                  )}
                </div>
              </Card>

              {/* Business Hours Widget */}
              <Card className="p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <ClockIcon size={16} className="text-[#0A0A0F]/30" />
                  <h3 className="text-[14px] font-bold text-[#0A0A0F] tracking-tight">Business Hours</h3>
                </div>
                <div className="space-y-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const hours = shop.openingHoursDetails?.[day];
                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;
                    return (
                      <div key={day} className={`flex items-center justify-between ${isToday ? "bg-[#FF6A00]/5 -mx-3 px-3 py-1.5 rounded-lg" : "py-0.5"}`}>
                        <span className={`text-[12px] capitalize font-medium ${isToday ? "text-[#FF6A00] font-bold" : "text-[#0A0A0F]/50"}`}>{day}</span>
                        <span className={`text-[12px] font-semibold ${isToday ? "text-[#FF6A00]" : "text-[#0A0A0F]/80"}`}>
                          {hours && !hours.isClosed ? `${hours.open} - ${hours.close}` : "Closed"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right Panel: Tabs & Details */}
            <div className="lg:col-span-8 space-y-6">

              {/* Desktop Tabs */}
              <div className="bg-white p-1 rounded-lg border border-black/[0.05] flex gap-1 shadow-sm overflow-x-auto scrollbar-hide">
                {[
                  { id: "products", label: "Catalog", icon: ShoppingBag },
                  { id: "gallery", label: "Gallery", icon: ImageIcon },
                  { id: "reviews", label: "Reviews", icon: MessageSquare },
                  { id: "info", label: "Details", icon: Info },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap flex-1 ${activeTab === tab.id
                      ? "bg-[#0A0A0F] text-white"
                      : "text-[#0A0A0F]/45 hover:bg-black/[0.04] hover:text-[#0A0A0F]"
                      }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── PRODUCTS TAB ──────────────────────────────────── */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  {/* Search / Filter Row */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0F]/30" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-white border border-black/[0.05] text-[13px] font-medium outline-none focus:border-[#FF6A00]/40 transition-all"
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

                  {searchQuery ? (
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3' : 'grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3'}`}>
                      {filteredItems.map((item, idx) => (
                        <ProductCard key={idx} item={item} onOrder={handleWhatsAppOrder} onView={(item) => setSelectedItem(item)} viewType={getCategoryViewType(item.category)} viewMode={viewMode} cartItem={cart.find(i => i.name === item.name)} onUpdateCart={handleUpdateCart} />
                      ))}
                    </div>
                  ) : featuredItems.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-1 border-b border-black/[0.05] pb-3 gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <StarIcon size={18} className="text-[#FF6A00] flex-shrink-0" fill="currentColor" />
                            <h3 className="text-[18px] font-bold text-[#0A0A0F] tracking-tight truncate">
                              Featured Offerings
                            </h3>
                            <span className="text-[11px] font-bold bg-[#FF6A00]/10 text-[#FF6A00] px-2.5 py-0.5 rounded-lg uppercase tracking-wider border border-[#FF6A00]/20">
                              {featuredItems.length} {featuredItems.length === 1 ? 'Item' : 'Items'}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#0A0A0F]/45 font-medium truncate">Handpicked premium products & services</p>
                        </div>
                        <Link href={`/shop/${shop.slug}/catalog`} className="h-9 px-4 bg-[#0A0A0F] text-white rounded-xl font-bold text-[12px] flex items-center gap-1.5 shadow-md hover:bg-black/80 active:scale-[0.99] transition-all flex-shrink-0 whitespace-nowrap group">
                          <span>Full Catalog ({allItems.length})</span>
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3' : 'grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3'}`}>
                        {featuredItems.map((item, idx) => (
                          <ProductCard key={idx} item={item} onOrder={handleWhatsAppOrder} onView={(item) => setSelectedItem(item)} viewType={getCategoryViewType(item.category)} viewMode={viewMode} cartItem={cart.find(i => i.name === item.name)} onUpdateCart={handleUpdateCart} />
                        ))}
                      </div>
                    </div>
                  ) : menuItems.length > 0 ? (
                    <div className="space-y-10">
                      {menuItems.map((section, idx) => (
                        <div key={idx} className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <h3 className="text-[16px] font-bold text-[#0A0A0F] tracking-tight">{section.name || section.category}</h3>
                            <span className="text-[11px] font-bold text-[#0A0A0F]/20 uppercase tracking-widest">{section.items?.length || 0} items</span>
                          </div>
                          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3' : 'grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3'}`}>
                            {(section.items || []).map((item, itemIdx) => (
                              <ProductCard key={itemIdx} item={{ ...item, category: section.name || section.category }} onOrder={handleWhatsAppOrder} onView={(item) => setSelectedItem(item)} viewType={getCategoryViewType(section.name || section.category)} viewMode={viewMode} cartItem={cart.find(i => i.name === item.name)} onUpdateCart={handleUpdateCart} />
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="pt-6 border-t border-black/[0.05]">
                        <Link href={`/shop/${shop.slug}/catalog`} className="w-full py-3.5 px-4 bg-[#0A0A0F] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg hover:bg-black/90 active:scale-[0.99] transition-all group">
                          <span>Explore Full Catalog ({allItems.length} Items)</span>
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-24 text-center bg-white rounded-lg border border-dashed border-black/[0.1]">
                      <ShoppingBag size={48} className="mx-auto text-[#0A0A0F]/10 mb-4" />
                      <h3 className="text-[15px] font-bold text-[#0A0A0F] mb-1">Catalogue is empty</h3>
                      <p className="text-[13px] text-[#0A0A0F]/40 font-medium">This shop hasn't listed any products yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── GALLERY TAB ───────────────────────────────────── */}
              {activeTab === "gallery" && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {shop.gallery && shop.gallery.length > 0 ? (
                    shop.gallery.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-black/[0.05] relative group cursor-pointer" onClick={() => setSelectedGalleryIndex(idx)}>
                        <Image src={img.includes(" ") ? img.replace(/\s/g, "%20") : img} alt="g" fill unoptimized className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye size={20} className="text-white" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-lg border border-dashed border-black/[0.1]">
                      <ImageIcon size={48} className="mx-auto text-[#0A0A0F]/10 mb-4" />
                      <p className="text-[13px] text-[#0A0A0F]/40 font-medium">No gallery images available.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── REVIEWS TAB ───────────────────────────────────── */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#0A0A0F] tracking-tight mb-1">Customer Reviews</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} size={14} fill={s <= Math.round(avgRating) ? "currentColor" : "none"} />)}
                          </div>
                          <span className="text-[15px] font-bold text-[#0A0A0F]">{avgRating}</span>
                          <span className="text-[13px] text-[#0A0A0F]/30 font-medium">Based on {totalReviews} ratings</span>
                        </div>
                      </div>
                      <Button variant="dark" size="md" onClick={() => setShowReviewForm(true)}>Post a Review</Button>
                    </div>
                  </Card>

                  {loadingReviews ? (
                    <div className="py-20 flex justify-center"><Loader2 size={24} className="animate-spin text-[#FF6A00]" /></div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review, i) => (
                        <Card key={i} className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-[#0A0A0F]/30">
                                <User size={20} />
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-[#0A0A0F]">{review.userName}</p>
                                <p className="text-[11px] font-medium text-[#0A0A0F]/30">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} size={10} fill={s <= review.rating ? "currentColor" : "none"} />)}
                            </div>
                          </div>
                          <p className="text-[13px] text-[#0A0A0F]/60 font-medium leading-relaxed italic">"{review.comment}"</p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <ThumbsUp size={48} className="mx-auto text-[#0A0A0F]/10 mb-4" />
                      <p className="text-[13px] text-[#0A0A0F]/40 font-medium">Be the first to review this shop.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── INFO TAB ──────────────────────────────────────── */}
              {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 space-y-6">
                    <div>
                      <h3 className="text-[15px] font-bold text-[#0A0A0F] mb-4">Verification Status</h3>
                      <div className={`p-4 rounded-lg border flex items-center gap-4 ${shop.isVerified ? "bg-blue-500/[0.03] border-blue-500/10" : "bg-zinc-50 border-black/[0.05]"}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${shop.isVerified ? "bg-blue-500/10 text-blue-500" : "bg-zinc-200 text-zinc-500"}`}>
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <p className={`text-[13px] font-bold ${shop.isVerified ? "text-blue-600" : "text-zinc-600"}`}>
                            {shop.isVerified ? "Verified Merchant" : "Unverified Listing"}
                          </p>
                          <p className="text-[11px] font-medium text-[#0A0A0F]/40 leading-tight">
                            {shop.isVerified ? "This business has been physically verified by our team." : "This listing is yet to be verified by the ShopBajar team."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[15px] font-bold text-[#0A0A0F] mb-4">Metadata</h3>
                      <div className="space-y-4">
                        {[
                          { label: "Category", val: shop.category },
                          { label: "Area Hub", val: shop.clusterType || "General Market" },
                          { label: "Business ID", val: shop.id?.slice(-8).toUpperCase() },
                          { label: "Founded", val: shop.establishedYear || "2024" },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-black/[0.03] last:border-0">
                            <span className="text-[12px] font-medium text-[#0A0A0F]/40 uppercase tracking-widest">{item.label}</span>
                            <span className="text-[13px] font-bold text-[#0A0A0F]">{item.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-0 overflow-hidden min-h-[300px]">
                    {/* Minimalist Map Placeholder or actual map if available */}
                    <div className="w-full h-full bg-[#FAFAF8] flex flex-col items-center justify-center p-8 text-center">
                      <MapPin size={40} className="text-[#FF6A00]/20 mb-4" />
                      <h3 className="text-[14px] font-bold text-[#0A0A0F] mb-1">Visual Location</h3>
                      <p className="text-[12px] text-[#0A0A0F]/40 font-medium mb-6">{getFullAddress(shop)}</p>
                      <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(getFullAddress(shop))}`)}>
                        Open in Google Maps
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      <Dialog
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        title="Post a Review"
        subtitle={`Sharing your experience with ${shop.name}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-6 pt-2">
          <div className="flex flex-col items-center gap-3">
            <p className="text-[11px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.2em]">Select Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className={`p-1.5 rounded-lg transition-all ${reviewForm.rating >= star ? "text-amber-500 scale-110" : "text-[#0A0A0F]/10 hover:text-[#0A0A0F]/20"}`}
                >
                  <StarIcon size={28} fill={reviewForm.rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest px-1">Display Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Alex Rivers"
                value={reviewForm.name}
                onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                className="w-full h-11 px-4 rounded-lg bg-black/[0.03] border border-black/[0.05] text-[14px] font-medium outline-none focus:border-[#FF6A00]/40 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest px-1">Comment</label>
              <textarea
                required
                rows={4}
                placeholder="How was your experience?"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full p-4 rounded-lg bg-black/[0.03] border border-black/[0.05] text-[14px] font-medium outline-none focus:border-[#FF6A00]/40 transition-all resize-none"
              />
            </div>
          </div>

          <Button type="submit" variant="dark" size="xl" className="w-full" loading={submittingReview}>
            Submit Review
          </Button>
        </form>
      </Dialog>

      <Dialog
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Profile"
        subtitle="Invite others to explore this business"
        maxWidth="max-w-[340px]"
      >
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="p-4 bg-white rounded-lg border border-black/[0.08] shadow-xl relative">
            <div className="w-40 h-40 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${DOMAIN}/shop/${shop.slug}`)}&color=0A0A0F&bgcolor=FFFFFF`}
                alt="QR"
                className="w-full h-full"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FF6A00] text-white text-[9px] font-bold uppercase tracking-widest rounded shadow-lg">
              Scan Profile
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="p-3 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-[#0A0A0F]/40 truncate flex-1">{`${DOMAIN}/shop/${shop.slug}`}</span>
              <button onClick={copyToClipboard} className="p-1.5 rounded-md hover:bg-black/[0.05] text-[#0A0A0F]/40 hover:text-[#FF6A00] transition-all">
                <Copy size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="md" icon={MessageSquare} className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" onClick={handleGeneralWhatsApp}>WhatsApp</Button>
              <Button variant="secondary" size="md" className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" onClick={() => window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${DOMAIN}/shop/${shop.slug}`)}`, '_blank')}>Facebook</Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* ── GALLERY IMMERSIVE LIGHTBOX ──────────────────────────────── */}
      {selectedGalleryIndex !== null && shop.gallery?.[selectedGalleryIndex] && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedGalleryIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedGalleryIndex(null)}
            className="absolute top-4 right-4 z-[610] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-lg"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-[610] px-4 py-2 rounded-full bg-white/10 text-white text-[12px] font-bold tracking-wider backdrop-blur-lg">
            {selectedGalleryIndex + 1} / {shop.gallery.length}
          </div>

          {/* Main Image Container */}
          <div
            className="relative w-full max-w-4xl max-h-[85vh] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={shop.gallery[selectedGalleryIndex].includes(" ") ? shop.gallery[selectedGalleryIndex].replace(/\s/g, "%20") : shop.gallery[selectedGalleryIndex]}
              alt={`Gallery image ${selectedGalleryIndex + 1}`}
              fill
              unoptimized
              className="object-contain"
            />

            {/* Navigation Buttons */}
            {shop.gallery.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGalleryIndex((selectedGalleryIndex - 1 + shop.gallery.length) % shop.gallery.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
                  aria-label="Previous"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGalleryIndex((selectedGalleryIndex + 1) % shop.gallery.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
                  aria-label="Next"
                >
                  <ArrowRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Dialog
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        showHeader={false}
        maxWidth="max-w-[420px]"
      >
        {selectedItem && (
          <div className="flex flex-col gap-6 py-2 relative">
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
                  <ShoppingBag size={40} className="text-zinc-300" />
                  <span className="text-[12px] font-medium text-zinc-400">No image available</span>
                </div>
              )}
              {/* Overlay Badges Attached Flush to Corner */}
              <div className="absolute top-0 left-0 z-10 flex items-center shadow-md rounded-br-xl overflow-hidden border-b border-r border-black/[0.1]">
                {selectedItem.featured && (
                  <span className="text-[10px] font-black bg-[#FF6A00] text-white px-3 py-1 uppercase tracking-wider flex items-center gap-1">Featured</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0A0A0F] tracking-tight mb-1">{selectedItem.name}</h3>
                  <p className="text-[12px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 inline-block px-2 py-0.5 rounded-md">
                    {selectedItem.price ? `₹${selectedItem.price}` : "Price on Enquiry"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.05]">
                <h4 className="text-[11px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest mb-1.5">Description</h4>
                <p className="text-[13px] text-[#0A0A0F]/70 font-medium leading-relaxed whitespace-pre-line">
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

/* ── SUB-COMPONENTS ────────────────────────────────────────── */

const ProductCard = ({ item, onOrder, onView, viewType = "image", viewMode = "vertical", cartItem, onUpdateCart }) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <Card padding={false} className={`group bg-white border border-black/[0.06] hover:border-black/[0.15] hover:shadow-md transition-all duration-300 rounded-2xl relative overflow-hidden flex ${viewMode === 'grid' ? 'flex-col items-stretch' : 'items-stretch'}`}>
      {viewType !== "text" && (
        <div className={`${viewMode === 'grid' ? 'w-full aspect-square border-b' : viewType === 'mini' ? 'w-16 self-stretch border-r' : 'w-24 sm:w-32 self-stretch border-r'} bg-zinc-50 border-black/[0.05] overflow-hidden flex-shrink-0 relative cursor-pointer group-hover:border-black/[0.1] transition-all`} onClick={() => onView?.(item)}>
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
          {/* Overlay Badges Attached Flush to Corner */}
          <div className="absolute top-0 left-0 z-10 flex items-center">
            {item.featured && (
              <span className="text-[9px] font-black bg-[#FF6A00] text-white px-2.5 py-1 rounded-br-xl uppercase tracking-wider shadow-md border-b border-r border-[#FF6A00]/20 flex items-center gap-1">Featured</span>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0 p-2.5 sm:p-3.5 flex flex-col justify-between bg-white self-stretch">
        <div>
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <h4 className="text-[13px] sm:text-[15px] font-bold text-[#0A0A0F] truncate tracking-tight cursor-pointer group-hover:text-[#FF6A00] transition-colors" onClick={() => onView?.(item)}>{item.name}</h4>
          </div>
          <p className={`text-[11px] sm:text-[12px] text-[#0A0A0F]/60 font-medium mb-2 sm:mb-3 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1'} cursor-pointer leading-snug`} onClick={() => onView?.(item)}>{item.description || "Premium quality product."}</p>
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
                onClick={() => onUpdateCart ? onUpdateCart(item, 1) : onOrder(item)}
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

export default ShopProfileClient;
