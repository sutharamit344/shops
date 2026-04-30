"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Star, MapPin, MessageSquare, Phone, Share2, Heart,
  Clock, Award, Users, CheckCircle2, Globe, ChevronRight,
  ShoppingBag, Search, X, ExternalLink, Truck, Shield, DollarSign,
  Mail, Clock as ClockIcon, Calendar, Navigation, Info,
  Store,
  Plus,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
  ThumbsUp,
  Twitter,
  Star as StarIcon,
  Send,
  User,
  Loader2
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

const ShopProfileClient = ({ shop }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
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

  useEffect(() => {
    if (shop?.id) incrementViews(shop.id);
  }, [shop?.id]);

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

  const brandColor = shop.primaryColor || "#FF6B35";
  const avgRating = shop.rating || "5.0";
  const totalReviews = shop.reviewCount || 0;
  const menuItems = shop.menu || [];

  const allItems = menuItems.flatMap(cat =>
    (cat.items || []).map(item => ({ ...item, category: cat.category || cat.name }))
  );

  const filteredItems = searchQuery
    ? allItems.filter(item =>
      item.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery?.toLowerCase())
    )
    : [];

  const handleShare = async () => {
    const url = `${DOMAIN}/shop/${shop.slug}`;
    const shareText = `Check out *${shop.name}* on ${BRAND}! A ${shop.category} in ${shop.area ? shop.area + ', ' : ''}${shop.city}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: shop.name, text: shareText, url });
      } catch (err) { }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
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
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 w-full overflow-hidden bg-gradient-to-r from-[#FF6B35]/20 to-[#FF9A72]/20">
        {shop.coverImage ? (
          <Image 
            src={shop.coverImage} 
            alt={shop.name} 
            fill 
            priority
            className="object-cover" 
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store size={80} className="text-[#FF6B35]/20" />
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-[#666] hover:text-[#0F0F0F] transition-all"
        >
          <ChevronRight className="rotate-180" size={18} />
        </button>

        {/* Share Button */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-[#666] hover:text-[#0F0F0F] transition-all"
            >
              <Share2 size={16} />
            </button>
            {showShareTooltip && (
              <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-[#0F0F0F] text-white text-[10px] font-medium rounded-lg whitespace-nowrap z-10">
                Link copied!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-32">

        {/* Shop Info Card */}
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden mb-6">
          <div className="p-6">
            {/* Logo & Basic Info */}
            <div className="flex flex-col md:flex-row gap-5 mb-5">
              <div className="w-20 h-20 rounded-xl bg-white border border-black/[0.06] overflow-hidden flex-shrink-0 relative">
                {shop.logo ? (
                  <Image 
                    src={shop.logo.includes(" ") ? shop.logo.replace(/\s/g, "%20") : shop.logo} 
                    alt={shop.name} 
                    fill 
                    unoptimized
                    className="object-cover" 
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#FF9A72] flex items-center justify-center text-white text-2xl font-bold">
                    {shop.name?.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-[#0F0F0F] tracking-tight">
                    {shop.name}
                  </h1>
                  {shop.isVerified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-lg border border-blue-100">
                      <ShieldCheck size={12} className="text-blue-500" />
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tight">Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#666] mb-3">
                  <Link
                    href={`/explore?category=${encodeURIComponent(slugify(shop.category))}`}
                    className="flex items-center gap-1 hover:text-[#FF6B35] transition-colors"
                  >
                    <Store size={12} className="text-[#FF6B35]" />
                    <span>{shop.category}</span>
                  </Link>
                  {shop.clusterType && (
                    <div className="flex items-center gap-1">
                      <Award size={12} className="text-[#FF6B35]" />
                      <span className="font-semibold">{shop.clusterType}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-[#FF6B35]" />
                    <span className="capitalize">{shop.area}, {shop.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-[#FFB800] fill-[#FFB800]" />
                    <span className="font-semibold text-[#0F0F0F]">{avgRating}</span>
                    <span className="text-[#999]">({totalReviews})</span>
                  </div>
                </div>

                <p className="text-[13px] text-[#666] leading-relaxed">
                  {shop.description || "Welcome to our shop! We offer quality products and services tailored to your needs."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-black/[0.06]">
              <button
                onClick={handleGeneralWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-[13px] font-semibold rounded-xl hover:bg-[#20BD5A] transition-all"
              >
                <MessageSquare size={16} /> WhatsApp
              </button>
              {shop.phone && (
                <button
                  onClick={() => {
                    incrementLeads(shop.id);
                    window.location.href = `tel:${shop.phone}`;
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F0F0F] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-all"
                >
                  <Phone size={16} /> Call
                </button>
              )}
              <OpenNowBadge shop={shop} size="md" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="md:sticky md:top-0 md:bottom-auto fixed bottom-6 left-4 right-4 z-40 flex gap-1 bg-white/90 backdrop-blur-md rounded-xl p-1 border border-black/[0.06] md:mb-8">
          {["menu", "about", "gallery", "reviews"].map((tab) => {
            const tabLabels = {
              menu: shop.category?.toLowerCase() === 'restaurant' ? 'Menu' : 'Products',
              about: 'About',
              gallery: 'Gallery',
              reviews: 'Reviews'
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-[12px] font-semibold rounded-lg transition-all capitalize ${activeTab === tab
                  ? "bg-[#0F0F0F] text-white"
                  : "text-[#666] hover:text-[#0F0F0F]"
                  }`}
              >
                {tabLabels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/[0.06] rounded-xl py-3 pl-11 pr-4 text-[13px] outline-none focus:border-[#FF6B35]/30 transition-all"
              />
            </div>

            {searchQuery ? (
              // Search Results
              <div className="space-y-3">
                {filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedItem(item)}
                    className="bg-white rounded-xl border border-black/[0.06] p-4 flex items-center gap-4 cursor-pointer hover:border-[#FF6B35]/30 transition-all"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover" 
                          sizes="56px"
                        />
                      ) : (
                        <ShoppingBag size={22} className="text-[#ccc]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[14px] font-semibold text-[#0F0F0F]">{item.name}</h3>
                      <p className="text-[10px] text-[#999] mt-0.5">{item.category}</p>
                      {item.price && (
                        <span className="text-[13px] font-bold text-[#FF6B35] mt-1 block">₹{item.price}</span>
                      )}
                    </div>
                    <Plus size={18} className="text-[#999]" />
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-black/[0.06]">
                    <ShoppingBag size={40} className="text-[#ccc] mx-auto mb-3" />
                    <p className="text-[13px] text-[#666]">No items found</p>
                  </div>
                )}
              </div>
            ) : menuItems.length > 0 ? (
              // Category View
              <div className="space-y-8">
                {menuItems.map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[15px] font-semibold text-[#0F0F0F]">{section.name || section.category}</h3>
                      <div className="h-px flex-1 bg-black/[0.06]" />
                      <span className="text-[10px] text-[#999]">{section.items?.length || 0} items</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {(section.items || []).map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          onClick={() => setSelectedItem({ ...item, category: section.name || section.category })}
                          className="bg-white rounded-xl border border-black/[0.06] p-4 flex items-center gap-4 cursor-pointer hover:border-[#FF6B35]/30 transition-all group"
                        >
                          <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            {item.image ? (
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform" 
                                sizes="56px"
                              />
                            ) : (
                              <ShoppingBag size={22} className="text-[#ccc]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-[14px] font-semibold text-[#0F0F0F]">{item.name}</h4>
                              {item.popular && (
                                <span className="text-[8px] font-semibold bg-[#FF6B35]/10 text-[#FF6B35] px-1.5 py-0.5 rounded-full">Popular</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#999] mt-0.5 line-clamp-1">{item.description}</p>
                          </div>
                          <div className="text-right">
                            {item.price && (
                              <span className="text-[14px] font-bold text-[#FF6B35]">₹{item.price}</span>
                            )}
                            <Plus size={16} className="text-[#999] group-hover:text-[#FF6B35] mt-1 ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-16 bg-white rounded-xl border border-black/[0.06]">
                <ShoppingBag size={48} className="text-[#ccc] mx-auto mb-4" />
                <h3 className="text-[15px] font-semibold text-[#0F0F0F] mb-2">Coming Soon</h3>
                <p className="text-[12px] text-[#666] max-w-xs mx-auto">Catalog is being updated. Contact us directly for inquiries!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Business Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-black/[0.06]">
                  <div>
                    <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-1">Category</p>
                    <p className="text-[14px] font-medium text-[#0F0F0F]">{shop.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-1">Business Type</p>
                    <p className="text-[14px] font-medium text-[#0F0F0F] capitalize">
                      {shop.businessType?.toLowerCase() === 'mixed' ? 'Products & Services' : (shop.businessType || 'Local Store')}
                    </p>
                  </div>
                  {shop.clusterType && (
                    <div>
                      <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-1">Cluster Hub</p>
                      <p className="text-[14px] font-medium text-[#0F0F0F]">{shop.clusterType}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-1">Established</p>
                    <p className="text-[14px] font-medium text-[#0F0F0F]">{shop.establishedYear || "2024"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-1">Location</p>
                    <p className="text-[14px] font-medium text-[#0F0F0F]">{shop.area}, {shop.city}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
                      <Phone size={18} className="text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">Phone Number</p>
                      <a href={`tel:${shop.phone}`} className="text-[14px] font-medium text-[#0F0F0F] hover:text-[#FF6B35] transition-colors">
                        +91 {shop.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
                      <MapPin size={18} className="text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">Address</p>
                      <p className="text-[14px] font-medium text-[#0F0F0F]">{shop.address || `${shop.area}, ${shop.city}`}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {shop.description && (
                  <div className="pt-4 border-t border-black/[0.06]">
                    <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">About Us</p>
                    <p className="text-[13px] text-[#666] leading-relaxed">{shop.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
                    <ClockIcon size={18} className="text-[#FF6B35]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#0F0F0F]">Business Hours</p>
                    <p className="text-[11px] text-[#999]">Timing details for the week</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(() => {
                    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const todayIdx = new Date().getDay();
                    const orderedDays = [...days.slice(todayIdx), ...days.slice(0, todayIdx)];

                    return orderedDays.map((day, idx) => {
                      const hours = shop.openingHoursDetails?.[day];
                      const isToday = idx === 0;

                      return (
                        <div key={day} className={`flex items-center justify-between py-2 ${isToday ? 'px-3 -mx-3 bg-gray-50 rounded-lg' : ''}`}>
                          <div className="flex items-center gap-3">
                            <span className={`text-[13px] capitalize ${isToday ? 'font-bold text-[#0F0F0F]' : 'font-medium text-[#666]'}`}>
                              {day}
                            </span>
                            {isToday && (
                              <span className="text-[9px] font-bold bg-[#FF6B35] text-white px-1.5 py-0.5 rounded-full uppercase">Today</span>
                            )}
                          </div>
                          <div className="text-right">
                            {hours && !hours.isClosed ? (
                              <span className={`text-[13px] ${isToday ? 'font-bold text-[#FF6B35]' : 'font-medium text-[#0F0F0F]'}`}>
                                {hours.open} - {hours.close}
                              </span>
                            ) : (
                              <span className="text-[13px] font-medium text-red-500 italic">Closed</span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Holidays */}
                {shop.holidays && shop.holidays.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-black/[0.06]">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar size={16} className="text-[#999]" />
                      <p className="text-[12px] font-semibold text-[#0F0F0F]">Upcoming Holidays</p>
                    </div>
                    <div className="space-y-2">
                      {shop.holidays.map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-[13px]">
                          <span className="text-[#666] font-medium">{h.name || 'Holiday'}</span>
                          <span className="text-[#0F0F0F] font-bold">{h.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verified Badge */}
            {shop.isVerified && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <ShieldCheck size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-blue-900">Verified Business</p>
                    <p className="text-[11px] text-blue-700 font-medium leading-tight">Identity and physical location verified by ShopBajar</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="bg-white rounded-xl border border-black/[0.06] p-6">
            {shop.gallery && shop.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {shop.gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-all border border-black/[0.06] relative"
                  >
                    <Image 
                      src={img} 
                      alt={`Gallery ${idx + 1}`} 
                      fill 
                      className="object-cover" 
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon size={48} className="text-[#ccc] mx-auto mb-4" />
                <h3 className="text-[15px] font-semibold text-[#0F0F0F] mb-2">No Photos Yet</h3>
                <p className="text-[12px] text-[#666]">Gallery will be updated soon</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-black/[0.06] p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#0F0F0F] mb-1">Customer Reviews</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#FFB800]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} size={16} fill={s <= Math.round(avgRating) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-[14px] font-bold text-[#0F0F0F]">{avgRating} out of 5</span>
                    <span className="text-[13px] text-[#999]">({totalReviews} total)</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-2.5 bg-[#0F0F0F] text-white text-[12px] font-bold rounded-xl hover:bg-[#333] transition-all"
                >
                  Write a Review
                </button>
              </div>

              {loadingReviews ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-2 border-[#FF6B35]/20 border-t-[#FF6B35] rounded-full animate-spin" />
                  <p className="text-[12px] text-[#999] font-medium">Loading verified reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review, i) => (
                    <div key={i} className="pb-6 border-b border-black/[0.04] last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-black/[0.05]">
                            <User size={18} className="text-[#999]" />
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-[#0F0F0F]">{review.userName}</p>
                            <p className="text-[11px] text-[#999]">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-[#FFB800]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <StarIcon key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[13px] text-[#666] leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ThumbsUp size={48} className="text-[#ccc] mx-auto mb-4" />
                  <p className="text-[13px] text-[#666] max-w-sm mx-auto">No reviews yet. Be the first to share your experience with this shop!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review Form Dialog */}
        <Dialog
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          title="Write a Review"
          subtitle={`Sharing your experience with ${shop.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Your Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`p-2 transition-all hover:scale-110 ${reviewForm.rating >= star ? "text-[#FFB800]" : "text-gray-200"}`}
                  >
                    <StarIcon size={32} fill={reviewForm.rating >= star ? "currentColor" : "none"} strokeWidth={2.5} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rajesh Kumar"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full bg-gray-50 border border-black/[0.06] rounded-xl py-3 px-4 text-[14px] outline-none focus:border-[#FF6B35]/30 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Your Experience</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell others what you liked about this shop..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full bg-gray-50 border border-black/[0.06] rounded-xl py-3 px-4 text-[14px] outline-none focus:border-[#FF6B35]/30 transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-4 bg-[#FF6B35] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#FF8457] transition-all disabled:opacity-50"
            >
              {submittingReview ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send size={18} /> Post Review
                </>
              )}
            </button>
          </form>
        </Dialog>
      </div>

      {/* Item Modal */}
      <Dialog
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        maxWidth="max-w-md"
        showHeader={false}
      >
        {selectedItem && (
          <div className="flex flex-col">
            <div className="relative aspect-square w-full bg-gray-50 overflow-hidden rounded-t-2xl">
              {selectedItem.image ? (
                <Image 
                  src={selectedItem.image} 
                  alt={selectedItem.name} 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, 448px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={56} className="text-[#ccc]" />
                </div>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#666] hover:text-[#0F0F0F] transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-[9px] font-semibold">
                    {selectedItem.category}
                  </span>
                  {selectedItem.popular && (
                    <span className="px-2 py-0.5 rounded-full bg-[#0F0F0F] text-white text-[9px] font-semibold">
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-[#0F0F0F]">{selectedItem.name}</h2>
                  {selectedItem.price && (
                    <span className="text-lg font-bold text-[#FF6B35]">₹{selectedItem.price}</span>
                  )}
                </div>
                <p className="text-[13px] text-[#666] leading-relaxed">
                  {selectedItem.description || "Premium quality item. Contact us for more details."}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleWhatsAppOrder(selectedItem)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white text-[13px] font-semibold rounded-xl hover:bg-[#20BD5A] transition-all"
                >
                  <MessageSquare size={16} /> Order on WhatsApp
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-3 text-[12px] font-medium text-[#999] hover:text-[#666] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default ShopProfileClient;
