"use client";

import React, { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getShopById, updateShop, getShopRatings, deleteShopRating } from "@/lib/db";
import { useModal } from "@/hooks/useModal";
import { getProfileCompletion } from "@/lib/shopUtils";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import ImageUpload from "@/components/UI/ImageUpload";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Settings2,
  Share2,
  TrendingUp,
  Clock,
  CircleCheckBig,
  CircleAlert,
  QrCode,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  Zap,
  BarChart3,
  ListFilter,
  Image as ImageIcon,
  History,
  ShoppingBag,
  Star,
  ChevronRight,
  Store,
  LayoutDashboard,
  Plus,
  Upload,
  Download,
  X,
  Info,
  Search,
  CalendarDays,
  ChevronUp,
  RefreshCw,
  Trash2,
  ThumbsUp as ThumbsUpIcon,
  User as UserIcon,
  Loader2
} from "lucide-react";
import Link from "next/link";
import ShopHistoryDialog from "@/components/Shop/HistoryDialog";
import ShopForm from "@/components/Create/ShopForm";
import Dialog from "@/components/UI/Dialog";
import Input from "@/components/UI/Input";
import Textarea from "@/components/UI/Textarea";
import Button from "@/components/UI/Button";
import { slugify } from "@/lib/slugify";
import { getWeeklyViewStats } from "@/lib/shopUtils";

function ShopDashboardContent() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("id");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyShop, setHistoryShop] = useState(null);
  const [activeView, setActiveView] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(null);
  const [activeItemIdx, setActiveItemIdx] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemFeatured, setItemFeatured] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounceRef = useRef(null);

  const handleCatalogSearch = useCallback((value) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setSearchQuery(value), 250);
  }, []);

  // Opening Hours State
  const defaultHours = {
    monday: { open: "09:00", close: "21:00", isClosed: false },
    tuesday: { open: "09:00", close: "21:00", isClosed: false },
    wednesday: { open: "09:00", close: "21:00", isClosed: false },
    thursday: { open: "09:00", close: "21:00", isClosed: false },
    friday: { open: "09:00", close: "21:00", isClosed: false },
    saturday: { open: "09:00", close: "21:00", isClosed: false },
    sunday: { open: "09:00", close: "21:00", isClosed: true },
  };
  const [openingHours, setOpeningHours] = useState(defaultHours);
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", title: "" });

  // Global Modal System
  const { showAlert, showConfirm } = useModal();

  const qrRef = useRef(null);
  const [downloadingQR, setDownloadingQR] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    setDownloadingQR(true);
    try {
      const { toPng } = await import("html-to-image");

      // Wait a moment to ensure images are hydrated
      await new Promise(r => setTimeout(r, 500));

      const dataUrl = await toPng(qrRef.current, {
        quality: 1,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
        cacheBust: true,
        style: {
          visibility: 'visible',
        }
      });

      const link = document.createElement("a");
      link.download = `${shop.name?.replace(/\s+/g, "_")}_QRCode.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("QR Download failed:", err);
      // Fallback: If html-to-image fails, open the QR directly
      const directUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(window.location.origin + "/shop/" + slugify(shop.slug))}`;
      window.open(directUrl, '_blank');
    } finally {
      setDownloadingQR(false);
    }
  };

  useEffect(() => {
    if (user && shopId) {
      const fetchShop = async () => {
        const data = await getShopById(shopId);
        if (data && data.ownerId === user.uid) {
          setShop(data);
          if (data.openingHoursDetails) setOpeningHours(data.openingHoursDetails);
          if (data.holidays) setHolidays(data.holidays);
        }
        setLoading(false);
      };
      fetchShop();
    } else if (!authLoading && !shopId) {
      setLoading(false);
    }
  }, [user, shopId, authLoading]);

  useEffect(() => {
    if (activeView === 'reviews' && shopId) {
      fetchReviews();
    }
  }, [activeView, shopId]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    const data = await getShopRatings(shopId);
    setReviews(data);
    setLoadingReviews(false);
  };

  const handleDeleteReview = async (reviewId) => {
    showConfirm({
      title: "Delete Review",
      message: "Are you sure you want to delete this customer review? This will also update your aggregate rating.",
      confirmText: "Yes, Delete",
      type: "error",
      onConfirm: async () => {
        const res = await deleteShopRating(shopId, reviewId);
        if (res.success) {
          fetchReviews();
          showAlert({ title: "Deleted", message: "Review removed successfully", type: "success" });
          // Refresh shop data to get new avgRating
          const updatedShop = await getShopById(shopId);
          setShop(updatedShop);
        }
      }
    });
  };

  const handleFullUpdate = async (finalData) => {
    setIsSaving(true);
    try {
      const result = await updateShop(shopId, {
        ...finalData,
        status: shop.status, // Keep existing status
      });
      if (result.success) {
        setShop(prev => ({ ...prev, ...finalData }));
        showAlert({
          title: "Success",
          message: "Shop details updated successfully!",
          type: "success"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      showAlert({
        title: "Update Failed",
        message: error.message || "Unknown error",
        type: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMenu = async (newMenu) => {
    try {
      const result = await updateShop(shopId, { menu: newMenu });
      if (result.success) {
        setShop(prev => ({ ...prev, menu: newMenu }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      showAlert({
        title: "Catalog Error",
        message: error.message || "Unknown error",
        type: "error"
      });
    }
  };

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;
    const newMenu = [...(shop.menu || []), { name: categoryName.trim(), items: [] }];
    handleUpdateMenu(newMenu);
    setCategoryName("");
    setShowCategoryModal(false);
  };

  const handleEditCategory = () => {
    if (!categoryName.trim()) return;
    const newMenu = [...(shop.menu || [])];
    newMenu[activeCategoryIdx].name = categoryName.trim();
    handleUpdateMenu(newMenu);
    setCategoryName("");
    setShowEditCategoryModal(false);
  };

  const handleDeleteCategory = () => {
    showConfirm({
      title: "Delete Category",
      message: `Are you sure you want to delete the entire category "${shop.menu[activeCategoryIdx]?.name}" and all its items? This action cannot be undone.`,
      confirmText: "Delete Everything",
      type: "error",
      onConfirm: () => {
        const newMenu = shop.menu.filter((_, i) => i !== activeCategoryIdx);
        handleUpdateMenu(newMenu);
        setShowEditCategoryModal(false);
      }
    });
  };

  const toggleCategory = (idx) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleAddItem = () => {
    if (!itemName.trim()) return;
    const newMenu = [...(shop.menu || [])];
    newMenu[activeCategoryIdx].items.push({
      name: itemName.trim(),
      price: itemPrice ? parseFloat(itemPrice) : "",
      description: itemDescription.trim(),
      image: itemImage,
      featured: itemFeatured
    });
    handleUpdateMenu(newMenu);
    resetItemForm();
    setShowItemModal(false);
  };

  const handleEditItem = () => {
    if (!itemName.trim()) return;
    const newMenu = [...(shop.menu || [])];
    newMenu[activeCategoryIdx].items[activeItemIdx] = {
      ...newMenu[activeCategoryIdx].items[activeItemIdx],
      name: itemName.trim(),
      price: itemPrice ? parseFloat(itemPrice) : "",
      description: itemDescription.trim(),
      image: itemImage,
      featured: itemFeatured
    };
    handleUpdateMenu(newMenu);
    resetItemForm();
    setShowEditItemModal(false);
  };

  const resetItemForm = () => {
    setItemName("");
    setItemPrice("");
    setItemDescription("");
    setItemImage("");
    setItemFeatured(false);
  };

  const handleDeleteItem = () => {
    const newMenu = [...(shop.menu || [])];
    newMenu[activeCategoryIdx].items.splice(activeItemIdx, 1);
    handleUpdateMenu(newMenu);
    setShowDeleteModal(false);
  };

  const handleUpdateGallery = async (url) => {
    if (!url) return;
    if ((shop.gallery || []).length >= 5) {
      showAlert({
        title: "Gallery Full",
        message: "Maximum 5 images allowed in the gallery.",
        type: "info"
      });
      return;
    }
    const newGallery = [...(shop.gallery || []), url];
    try {
      const result = await updateShop(shopId, { gallery: newGallery });
      if (result.success) {
        setShop(prev => ({ ...prev, gallery: newGallery }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePhoto = async (idx) => {
    const newGallery = shop.gallery.filter((_, i) => i !== idx);
    const result = await updateShop(shopId, { gallery: newGallery });
    if (result.success) {
      setShop(prev => ({ ...prev, gallery: newGallery }));
    }
  };

  const handleUpdateHours = async () => {
    setIsSaving(true);
    try {
      const result = await updateShop(shopId, {
        openingHoursDetails: openingHours,
        holidays: holidays
      });
      if (result.success) {
        setShop(prev => ({ ...prev, openingHoursDetails: openingHours, holidays }));
        showAlert({
          title: "Success",
          message: "Opening hours and holidays updated!",
          type: "success"
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.title) return;
    setHolidays([...holidays, newHoliday]);
    setNewHoliday({ date: "", title: "" });
  };

  const handleDeleteHoliday = (idx) => {
    setHolidays(holidays.filter((_, i) => i !== idx));
  };

  const handleExportCatalog = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import("xlsx");
      const menu = shop?.menu || [];
      const exportData = [];

      menu.forEach((section) => {
        const catName = section.category || section.name || "Catalog";
        if (section.items && Array.isArray(section.items)) {
          section.items.forEach((item) => {
            exportData.push({
              "Section Category": catName,
              "Item Name": item.name || "",
              "Description": item.description || "",
              "Price": item.price || "",
              "Image URL": item.image || "",
              "Is Popular": item.featured || item.popular ? "Yes" : "No"
            });
          });
        }
      });

      if (exportData.length === 0) {
        exportData.push({
          "Section Category": "Example Section",
          "Item Name": "Example Item",
          "Description": "Premium quality product",
          "Price": 500,
          "Image URL": "",
          "Is Popular": "Yes"
        });
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Catalog");
      XLSX.writeFile(wb, `${slugify(shop?.name || "shop")}_catalog.xlsx`);
      showAlert({
        title: "Export Successful",
        message: "Catalog exported successfully as an Excel spreadsheet.",
        type: "success"
      });
    } catch (err) {
      console.error("Export error:", err);
      showAlert({
        title: "Export Failed",
        message: "Failed to export catalog. Please verify xlsx dependency.",
        type: "error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCatalog = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const XLSX = await import("xlsx");
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (!jsonData || jsonData.length === 0) {
            showAlert({
              title: "Import Failed",
              message: "No items found in the uploaded spreadsheet.",
              type: "error"
            });
            return;
          }

          const sectionsMap = {};

          jsonData.forEach((row) => {
            const catName = row["Section Category"]?.toString().trim() || row["Category"]?.toString().trim() || row["section"]?.toString().trim() || "Catalog";
            const itemName = row["Item Name"]?.toString().trim() || row["Name"]?.toString().trim() || row["name"]?.toString().trim() || "";
            const description = row["Description"]?.toString().trim() || row["description"]?.toString().trim() || "";
            const price = parseFloat(row["Price"] || row["price"] || 0) || 0;
            const image = row["Image URL"]?.toString().trim() || row["image"]?.toString().trim() || "";
            const isPopStr = (row["Is Popular"] || row["popular"] || row["featured"] || "").toString().toLowerCase();
            const featured = isPopStr === "yes" || isPopStr === "true" || isPopStr === "1";

            if (itemName) {
              if (!sectionsMap[catName]) sectionsMap[catName] = [];
              sectionsMap[catName].push({
                name: itemName,
                description,
                price: price || "",
                image,
                featured,
                popular: featured
              });
            }
          });

          const newMenu = Object.entries(sectionsMap).map(([name, items]) => ({
            name,
            category: name,
            items
          }));

          await handleUpdateMenu(newMenu);
          showAlert({
            title: "Import Successful",
            message: `Successfully imported ${jsonData.length} items across ${newMenu.length} sections!`,
            type: "success"
          });
        } catch (error) {
          console.error("Import error:", error);
          showAlert({
            title: "Import Failed",
            message: "Failed to parse file. Please ensure correct template structure.",
            type: "error"
          });
        } finally {
          if (e.target) e.target.value = "";
          setIsImporting(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Import error:", err);
      showAlert({
        title: "Import Failed",
        message: "Failed to import catalog. Please verify xlsx dependency.",
        type: "error"
      });
      if (e.target) e.target.value = "";
      setIsImporting(false);
    }
  };



  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-[10px] font-bold text-[#0A0A0F]/20 uppercase tracking-[0.2em]">Loading Business...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-black/[0.02] border border-black/[0.05] rounded-2xl flex items-center justify-center mb-6">
          <CircleAlert size={32} className="text-[#0A0A0F]/15" />
        </div>
        <h1 className="text-[24px] font-bold text-[#0A0A0F] mb-2 tracking-tight">Business Not Found</h1>
        <p className="text-[13px] text-[#0A0A0F]/40 font-medium mb-8 max-w-sm">
          This business profile could not be located in your merchant portfolio.
        </p>
        <Link href="/dashboard" className="px-6 py-2.5 bg-[#0A0A0F] text-white text-[13px] font-bold rounded-lg">
          Return to Console
        </Link>
      </div>
    );
  }

  const catalogCount = shop.menu?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#F7F7F5] selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <Navbar />

      <main className="max-w-7xl mx-auto md:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-lg bg-white border border-black/[0.05] flex items-center justify-center text-[#0A0A0F]/40 hover:text-[#0A0A0F] hover:border-black/[0.1] transition-all"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-[20px] font-bold text-[#0A0A0F] tracking-tight">{shop.name}</h1>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  shop.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                  shop.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {shop.status === 'approved' ? 'Operational' : shop.status === 'rejected' ? 'Rejected' : 'Provisioning'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#0A0A0F]/40 font-medium">
                <span className="flex items-center gap-1"><Building2 size={11} /> {shop.category}</span>
                <span className="w-1 h-1 rounded-full bg-black/10" />
                <span className="flex items-center gap-1"><MapPin size={11} /> {shop.city}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-black/[0.05] shadow-sm overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "catalog", label: "Catalog", icon: ListFilter },
              { id: "gallery", label: "Gallery", icon: ImageIcon },
              { id: "hours", label: "Hours", icon: CalendarDays },
              { id: "reviews", label: "Reviews", icon: Star },
              { id: "settings", label: "Settings", icon: Settings2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  activeView === tab.id
                    ? "bg-[#0A0A0F] text-white shadow-md"
                    : "text-[#0A0A0F]/40 hover:bg-black/[0.03] hover:text-[#0A0A0F]"
                }`}
              >
                <tab.icon size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeView === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Views", value: shop.views || 0, icon: Eye },
                { label: "WhatsApp Leads", value: shop.leads || 0, icon: MessageSquare },
                { label: "Avg Rating", value: shop.avgRating || "5.0", icon: Star },
                { label: "Catalog Items", value: catalogCount, icon: ShoppingBag },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-black/[0.05] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/5 flex items-center justify-center text-[#FF6A00]">
                      <stat.icon size={16} />
                    </div>
                  </div>
                  <div className="text-[20px] font-bold text-[#0A0A0F] mb-0.5">{stat.value}</div>
                  <div className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.1em]">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Performance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Card */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-black/[0.05] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#0A0A0F] tracking-tight">Weekly Views</h3>
                    <p className="text-[10px] font-medium text-[#0A0A0F]/30">Last 7 days performance</p>
                  </div>
                  <div className="px-2 py-1 bg-black/[0.02] border border-black/[0.04] rounded-lg text-[9px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest">Last 7 Days</div>
                </div>
                <div className="h-40 flex items-end gap-2">
                  {(() => {
                    const stats = getWeeklyViewStats(shop);
                    const maxViews = Math.max(...stats.map(s => s.views), 1);
                    return stats.map((s, i) => {
                      const heightPct = Math.max((s.views / maxViews) * 100, 4);
                      const isToday = i === stats.length - 1;
                      return (
                        <div key={i} className="flex-1 relative group">
                          <div
                            className={`w-full transition-all rounded-lg ${isToday ? 'bg-[#FF6A00]' : 'bg-[#FF6A00]/15 hover:bg-[#FF6A00]/50'}`}
                            style={{ height: `${heightPct}%` }}
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0A0F] text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {s.views} view{s.views !== 1 ? 's' : ''}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="flex justify-between mt-3 text-[9px] font-bold text-[#0A0A0F]/20 uppercase">
                  {getWeeklyViewStats(shop).map((s, i) => (
                    <span key={i} className={i === 6 ? 'text-[#FF6A00]' : ''}>{s.day}</span>
                  ))}
                </div>
              </div>

              {/* QR & Share Card */}
              <div className="bg-white rounded-lg border border-black/[0.05] shadow-sm p-6 text-center">
                <div className="w-10 h-10 bg-[#FF6A00]/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <QrCode size={18} className="text-[#FF6A00]" />
                </div>
                <h3 className="text-[13px] font-bold text-[#0A0A0F] tracking-tight mb-3">Business Discovery Code</h3>
                <div className="bg-black/[0.02] border border-black/[0.04] p-4 rounded-lg mb-3 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "/shop/" + slugify(shop.slug))}`}
                    alt="Store QR"
                    className="w-32 h-32"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadQR}
                    disabled={downloadingQR}
                    className="flex-1 py-2 bg-[#0A0A0F] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-black/80 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {downloadingQR ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} className="rotate-180" />
                    )}
                    Download
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.origin + "/shop/" + slugify(shop.slug);
                      navigator.clipboard.writeText(url);
                      showAlert({
                        title: "Link Copied",
                        message: "The shop link has been copied to your clipboard.",
                        type: "success"
                      });
                    }}
                    className="flex-1 py-2 border border-black/[0.06] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 text-[#0A0A0F]/50 hover:text-[#0A0A0F] hover:border-black/[0.1] transition-all"
                  >
                    <Share2 size={12} /> Share
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveView("catalog")}
                className="bg-white p-5 rounded-lg border border-black/[0.05] text-left hover:border-[#FF6A00]/30 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-[#FF6A00]/5 rounded-lg flex items-center justify-center mb-3">
                  <ListFilter size={18} className="text-[#FF6A00]" />
                </div>
                <h3 className="text-[14px] font-bold text-[#0A0A0F] tracking-tight mb-1">Catalog Manager</h3>
                <p className="text-[11px] font-medium text-[#0A0A0F]/40">Update your items, prices, and categories.</p>
                <div className="mt-3 text-[#FF6A00] text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Manage Catalog →
                </div>
              </button>

              <button
                onClick={() => setActiveView("gallery")}
                className="bg-white p-5 rounded-lg border border-black/[0.05] text-left hover:border-blue-500/30 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500/5 rounded-lg flex items-center justify-center mb-3">
                  <ImageIcon size={18} className="text-blue-500" />
                </div>
                <h3 className="text-[14px] font-bold text-[#0A0A0F] tracking-tight mb-1">Photo Gallery</h3>
                <p className="text-[11px] font-medium text-[#0A0A0F]/40">Showcase your shop with high-quality photos.</p>
                <div className="mt-3 text-blue-500 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Upload Photos →
                </div>
              </button>
            </div>

            {/* ── Onboarding Checklist ── */}
            {(() => {
              const { score, items } = getProfileCompletion(shop);
              if (score === 100) return null;
              return (
                <div className="bg-white rounded-lg border border-black/[0.06] overflow-hidden">
                  <div className="p-5 border-b border-black/[0.04]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-[13px] font-bold text-[#0A0A0F]">Complete Your Profile</h3>
                        <p className="text-[10px] text-[#0A0A0F]/30 mt-0.5">More complete = more customers</p>
                      </div>
                      <span className="text-[24px] font-black text-[#FF6A00]">{score}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FF9A72] rounded-full transition-all duration-700"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 space-y-1">
                    {items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => !item.done && setActiveView(item.tab)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${item.done ? "opacity-60" : "hover:bg-black/[0.02] group cursor-pointer"
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${item.done ? "bg-[#FF6A00] border-[#FF6A00]" : "border-gray-200 group-hover:border-[#FF6A00]/50"
                          }`}>
                          {item.done && <CircleCheckBig size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] font-semibold ${item.done ? "line-through text-[#0A0A0F]/30" : "text-[#0A0A0F]"
                            }`}>{item.label}</p>
                          {!item.done && (
                            <p className="text-[10px] text-[#0A0A0F]/30 truncate">{item.hint}</p>
                          )}
                        </div>
                        {!item.done && (
                          <ChevronRight size={13} className="text-[#0A0A0F]/20 group-hover:text-[#FF6A00] transition-colors flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Growth Tip */}
            <div className="bg-gradient-to-r from-[#FF6A00]/5 to-transparent rounded-lg p-5 border border-[#FF6A00]/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#FF6A00]/10 rounded-lg flex items-center justify-center">
                  <Zap size={16} className="text-[#FF6A00]" />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-[#0A0A0F] mb-1">Growth Insight</h4>
                  <p className="text-[11px] text-[#0A0A0F]/45">
                    Businesses with complete catalogs see <span className="font-semibold text-[#FF6A00]">2.4x higher</span> customer conversion.
                  </p>
                </div>
              </div>
            </div>

            {/* System Links */}
            <div className="bg-white rounded-lg border border-black/[0.06] overflow-hidden">
              <button
                onClick={() => setHistoryShop(shop)}
                className="w-full flex items-center justify-between p-4 hover:bg-black/[0.02] transition-all text-[12px] font-medium text-[#0A0A0F]/45"
              >
                <div className="flex items-center gap-2">
                  <History size={14} />
                  <span>Audit History</span>
                </div>
                <ChevronRight size={14} />
              </button>
              <Link
                href={`/shop/${slugify(shop.slug)}`}
                target="_blank"
                className="w-full flex items-center justify-between p-4 border-t border-black/[0.06] hover:bg-black/[0.02] transition-all text-[12px] font-medium text-[#0A0A0F]/45"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink size={14} />
                  <span>View Live Page</span>
                </div>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Catalog Tab */}
        {activeView === "catalog" && (
          <div className="bg-white rounded-lg border border-black/[0.06] overflow-hidden">
            <div className="p-5 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-bold text-[#0A0A0F]">Catalog Management</h2>
                <p className="text-[11px] text-[#0A0A0F]/45">Manage your products and services</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0F]/30" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    defaultValue={searchQuery}
                    onChange={(e) => handleCatalogSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-black/[0.02] border border-black/[0.06] rounded-lg text-[11px] focus:bg-white focus:border-[#FF6A00]/30 outline-none transition-all w-40 sm:w-60 font-medium"
                  />
                </div>
                <button
                  onClick={handleExportCatalog}
                  disabled={isExporting}
                  className={`px-3 py-2 bg-white border border-black/[0.08] text-[#0A0A0F] text-[11px] font-semibold rounded-lg flex items-center gap-1.5 hover:bg-black/[0.02] hover:border-black/[0.15] active:scale-95 transition-all shadow-sm whitespace-nowrap ${isExporting ? "opacity-50 cursor-not-allowed" : ""}`}
                  title="Download Catalog as Excel Spreadsheet"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#FF6A00]" /> Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={14} className="text-[#0A0A0F]/70" /> Export Catalog
                    </>
                  )}
                </button>
                <label
                  className={`cursor-pointer px-3 py-2 bg-white border border-black/[0.08] text-[#0A0A0F] text-[11px] font-semibold rounded-lg flex items-center gap-1.5 hover:bg-black/[0.02] hover:border-black/[0.15] active:scale-95 transition-all shadow-sm whitespace-nowrap mb-0 ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
                  title="Upload Excel or CSV Catalog"
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#FF6A00]" /> Importing...
                    </>
                  ) : (
                    <>
                      <Upload size={14} className="text-[#0A0A0F]/70" /> Import Catalog
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleImportCatalog}
                        disabled={isImporting}
                        className="hidden"
                      />
                    </>
                  )}
                </label>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-2 bg-[#0F0F0F] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 hover:bg-black/90 active:scale-95 transition-all whitespace-nowrap shadow-md"
                >
                  <Plus size={14} /> Add Category
                </button>
              </div>
            </div>

            <div className="p-5">
              {(() => {
                const filteredMenu = (shop.menu || []).map(cat => ({
                  ...cat,
                  items: (cat.items || []).filter(item =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                })).filter(cat => cat.items.length > 0 || cat.name.toLowerCase().includes(searchQuery.toLowerCase()));

                if (filteredMenu.length > 0) {
                  return (
                    <div className="space-y-4">
                      {filteredMenu.map((category, idx) => {
                        const isCollapsed = collapsedCategories.has(idx) && searchQuery === "";
                        return (
                          <div key={idx} className="border border-black/[0.06] rounded-lg overflow-hidden mb-4 last:mb-0">
                            {/* Category Header (Same as before) */}
                            <div className="p-4 bg-black/[0.015] flex justify-between items-center border-b border-black/[0.06]">
                              <div
                                className="flex items-center gap-2 cursor-pointer group/header"
                                onClick={() => toggleCategory(idx)}
                              >
                                <div className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}>
                                  <ChevronRight size={14} className="text-[#0A0A0F]/30" />
                                </div>
                                <ShoppingBag size={14} className="text-[#FF6A00]" />
                                <span className="font-semibold text-[13px] text-[#0A0A0F]">{category.name}</span>
                                <span className="text-[9px] font-medium text-[#0A0A0F]/30 bg-white px-1.5 py-0.5 rounded-lg border border-black/[0.02]">
                                  {category.items?.length || 0} items
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setActiveCategoryIdx(idx);
                                    setCategoryName(category.name);
                                    setShowEditCategoryModal(true);
                                  }}
                                  className="p-1.5 hover:bg-white rounded-lg transition-all"
                                >
                                  <Settings2 size={12} className="text-[#0A0A0F]/45" />
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveCategoryIdx(idx);
                                    resetItemForm();
                                    setItemFeatured(false);
                                    setShowItemModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-[#0F0F0F] text-white text-[9px] font-semibold rounded-lg hover:bg-black/90 active:scale-95 transition-all"
                                >
                                  + Add Item
                                </button>
                              </div>
                            </div>

                            {!isCollapsed && (
                              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                                {category.items?.map((item, iIdx) => (
                                  <div key={iIdx} className="flex items-center gap-3 p-3 rounded-lg bg-black/[0.01] hover:bg-white hover:shadow-sm transition-all group/item">
                                    <div className="w-12 h-12 bg-black/[0.04] rounded-lg flex items-center justify-center overflow-hidden border border-black/[0.04] relative">
                                      {item.image ? (
                                        <Image
                                          src={item.image.includes(" ") ? item.image.replace(/\s/g, "%20") : item.image}
                                          alt={item.name}
                                          fill
                                          unoptimized
                                          className="object-cover"
                                          sizes="48px"
                                        />
                                      ) : (
                                        <ShoppingBag size={16} className="text-[#0A0A0F]/30" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[12px] font-bold text-[#0A0A0F]">{item.name}</p>
                                      {item.price !== "" && item.price != null
                                        ? <p className="text-[11px] font-medium text-[#FF6A00]">₹{item.price}</p>
                                        : <p className="text-[11px] font-medium text-[#0A0A0F]/30">On Request</p>
                                      }
                                    </div>
                                    <div className="flex gap-1 items-center">
                                      <label className="flex items-center gap-1.5 cursor-pointer mr-2" title="Toggle Featured Status">
                                        <input
                                          type="checkbox"
                                          checked={!!item.featured}
                                          onChange={(e) => {
                                            const originalCatIdx = (shop.menu || []).findIndex(c => c.name === category.name);
                                            const originalItemIdx = (shop.menu[originalCatIdx].items || []).findIndex(it => it.name === item.name);
                                            const newMenu = [...(shop.menu || [])];
                                            newMenu[originalCatIdx].items[originalItemIdx] = {
                                              ...newMenu[originalCatIdx].items[originalItemIdx],
                                              featured: e.target.checked
                                            };
                                            handleUpdateMenu(newMenu);
                                          }}
                                          className="w-4 h-4 rounded border-black/[0.06] text-[#FF6A00] focus:ring-[#FF6A00]"
                                        />
                                        <span className="text-[11px] font-semibold text-[#0A0A0F]/60 select-none hidden sm:inline">Featured</span>
                                      </label>
                                      <button
                                        onClick={() => {
                                          // Find the REAL index in the original shop.menu
                                          const originalCatIdx = (shop.menu || []).findIndex(c => c.name === category.name);
                                          const originalItemIdx = (shop.menu[originalCatIdx].items || []).findIndex(it => it.name === item.name);

                                          setActiveCategoryIdx(originalCatIdx);
                                          setActiveItemIdx(originalItemIdx);
                                          setItemName(item.name);
                                          setItemPrice(item.price.toString());
                                          setItemDescription(item.description || "");
                                          setItemImage(item.image || "");
                                          setItemFeatured(!!item.featured);
                                          setShowEditItemModal(true);
                                        }}
                                        className="p-2 hover:bg-black/[0.04] active:bg-black/[0.08] rounded-lg text-[#0A0A0F]/45 transition-all"
                                      >
                                        <Settings2 size={13} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const originalCatIdx = (shop.menu || []).findIndex(c => c.name === category.name);
                                          const originalItemIdx = (shop.menu[originalCatIdx].items || []).findIndex(it => it.name === item.name);
                                          setActiveCategoryIdx(originalCatIdx);
                                          setActiveItemIdx(originalItemIdx);
                                          setShowDeleteModal(true);
                                        }}
                                        className="p-2 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all"
                                      >
                                        <X size={13} className="text-red-400" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-black/[0.02] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={32} className="text-[#0A0A0F]/20" />
                      </div>
                      <h3 className="text-[15px] font-bold text-[#0A0A0F] mb-2">
                        {searchQuery ? "No results found" : "No Items Yet"}
                      </h3>
                      <p className="text-[12px] text-[#0A0A0F]/45 mb-6">
                        {searchQuery ? `Try searching for something else` : "Start adding products to your catalog"}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={() => {
                            resetItemForm();
                            setShowCategoryModal(true);
                          }}
                          className="px-5 py-2.5 bg-[#FF6A00] text-white text-[12px] font-semibold rounded-lg shadow-lg shadow-[#FF6A00]/20 active:scale-95 transition-all"
                        >
                          Add First Category
                        </button>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {/* Hours Tab */}
        {activeView === "hours" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-black/[0.06] overflow-hidden">
              <div className="p-5 border-b border-black/[0.05] flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-[#0A0A0F] tracking-tight">Weekly Schedule</h2>
                  <p className="text-[11px] font-medium text-[#0A0A0F]/35">Set your regular operating hours</p>
                </div>
                <Button onClick={handleUpdateHours} disabled={isSaving} size="sm">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
              <div className="p-5 space-y-3">
                {Object.keys(openingHours).map((day) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-black/[0.015] border border-black/[0.02] gap-3">
                    <div className="flex items-center gap-3 w-32">
                      <div className={`w-2 h-2 rounded-full ${openingHours[day].isClosed ? "bg-red-400" : "bg-green-400"}`} />
                      <span className="text-[12px] font-bold text-[#0A0A0F] capitalize">{day}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={openingHours[day].open}
                          disabled={openingHours[day].isClosed}
                          onChange={(e) => setOpeningHours({
                            ...openingHours,
                            [day]: { ...openingHours[day], open: e.target.value }
                          })}
                          className="px-2 py-1.5 bg-white border border-black/[0.06] rounded-lg text-[11px] outline-none disabled:opacity-50"
                        />
                        <span className="text-[10px] text-[#0A0A0F]/30">to</span>
                        <input
                          type="time"
                          value={openingHours[day].close}
                          disabled={openingHours[day].isClosed}
                          onChange={(e) => setOpeningHours({
                            ...openingHours,
                            [day]: { ...openingHours[day], close: e.target.value }
                          })}
                          className="px-2 py-1.5 bg-white border border-black/[0.06] rounded-lg text-[11px] outline-none disabled:opacity-50"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={openingHours[day].isClosed}
                          onChange={(e) => setOpeningHours({
                            ...openingHours,
                            [day]: { ...openingHours[day], isClosed: e.target.checked }
                          })}
                          className="w-4 h-4 rounded border-black/[0.06] text-[#FF6A00] focus:ring-[#FF6A00]"
                        />
                        <span className="text-[11px] font-medium text-[#0A0A0F]/45">Closed</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-black/[0.05] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-black/[0.05]">
                <h2 className="text-[15px] font-bold text-[#0A0A0F] tracking-tight">Upcoming Holidays</h2>
                <p className="text-[11px] font-medium text-[#0A0A0F]/35">Mark your shop as closed for specific dates</p>
              </div>
              <div className="p-5">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                      className="w-full px-4 py-2 bg-black/[0.02] border border-black/[0.06] rounded-lg text-[12px] outline-none focus:bg-white transition-all"
                    />
                  </div>
                  <div className="flex-[2]">
                    <input
                      type="text"
                      placeholder="Holiday Title (e.g. Diwali, Store Maintenance)"
                      value={newHoliday.title}
                      onChange={(e) => setNewHoliday({ ...newHoliday, title: e.target.value })}
                      className="w-full px-4 py-2 bg-black/[0.02] border border-black/[0.06] rounded-lg text-[12px] outline-none focus:bg-white transition-all"
                    />
                  </div>
                  <Button onClick={handleAddHoliday} disabled={!newHoliday.date || !newHoliday.title} variant="outline" size="sm">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {holidays.length > 0 ? (
                    holidays.map((holiday, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-black/[0.015] rounded-lg border border-black/[0.02]">
                        <div className="flex items-center gap-4">
                          <div className="px-3 py-1 bg-white border border-black/[0.06] rounded-lg text-[10px] font-bold text-[#FF6A00]">
                            {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <span className="text-[12px] font-bold text-[#0A0A0F]">{holiday.title}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteHoliday(idx)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-[#0A0A0F]/20 hover:text-red-500 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-black/[0.01] rounded-2xl border border-dashed border-black/[0.06]">
                      <p className="text-[11px] text-[#0A0A0F]/30">No holidays scheduled</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeView === "gallery" && (
          <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-[15px] font-bold text-[#0A0A0F] tracking-tight">Photo Gallery</h2>
                <p className="text-[11px] font-medium text-[#0A0A0F]/35">Visual showcase of your business</p>
              </div>
              <div className="px-3 py-1 bg-black/[0.02] border border-black/[0.04] rounded-lg text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest">
                {(shop.gallery || []).length} / 5
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {shop.gallery?.map((url, i) => (
                <div key={i} className="aspect-square relative group rounded-lg overflow-hidden border border-black/[0.06] shadow-sm bg-white">
                  <Image
                    src={url.includes(" ") ? url.replace(/\s/g, "%20") : url}
                    alt={`Gallery ${i}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                  <button
                    onClick={() => handleDeletePhoto(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {(shop.gallery || []).length < 5 && (
                <ImageUpload
                  onUpload={handleUpdateGallery}
                  folder="shops"
                  compact={true}
                />
              )}
            </div>

            <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/10 flex items-center gap-3">
              <ImageIcon size={16} className="text-blue-500 shrink-0" />
              <p className="text-[11px] font-medium text-blue-700">
                Tip: Upload high-quality photos to attract more customers. Tap an image to delete it.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeView === "settings" && (
          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="bg-white rounded-2xl border border-black/[0.05] p-8 shadow-sm">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FF6A00]/5 text-[#FF6A00] rounded-md border border-[#FF6A00]/10 mb-4">
                  <Settings2 size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Business Configuration</span>
                </div>
                <h2 className="text-[22px] font-bold text-[#0A0A0F] tracking-tight mb-1">Store Configuration</h2>
                <p className="text-[13px] text-[#0A0A0F]/40 font-medium">Manage your branding, location, and business metadata.</p>
              </div>

              <ShopForm
                initialData={shop}
                onSubmit={handleFullUpdate}
                isEdit={true}
                isLoading={isSaving}
              />
            </div>

          </div>
        )}
        {activeView === "reviews" && (
          <div className="bg-white rounded-lg border border-black/[0.05] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[15px] font-bold text-[#0A0A0F] tracking-tight">Customer Reviews</h3>
                <p className="text-[11px] font-medium text-[#0A0A0F]/35">Manage what customers are saying</p>
              </div>
              <div className="px-3 py-1 bg-[#FF6A00]/5 border border-[#FF6A00]/10 rounded-lg text-[11px] font-bold text-[#FF6A00]">
                ⭐ {shop.avgRating || "5.0"}
              </div>
            </div>

            {loadingReviews ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-[#FF6A00]/20 border-t-[#FF6A00] rounded-full animate-spin" />
                <p className="text-[12px] text-[#0A0A0F]/30 font-medium">Fetching feedback...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-5 rounded-2xl bg-black/[0.015] border border-black/[0.03] group hover:border-[#FF6A00]/10 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-black/[0.06] shadow-sm">
                          <UserIcon size={20} className="text-[#0A0A0F]/20" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[15px] font-bold text-[#0A0A0F]">{review.userName}</span>
                            <div className="flex items-center gap-0.5 text-[#FFB800]">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#0A0A0F]/30 mb-3">
                            Posted on {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[13px] text-[#0A0A0F]/45 leading-relaxed italic">
                            "{review.comment}"
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2.5 bg-white border border-red-100 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-black/[0.02] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ThumbsUpIcon size={32} className="text-[#0A0A0F]/20" />
                </div>
                <h3 className="text-[15px] font-bold text-[#0A0A0F] mb-1">No Reviews Yet</h3>
                <p className="text-[11px] text-[#0A0A0F]/30">Reviews from customers will appear here.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-black/[0.06] shadow-2xl">
        <div className="flex items-stretch">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "catalog", label: "Catalog", icon: ListFilter },
            { id: "gallery", label: "Gallery", icon: ImageIcon },
            { id: "hours", label: "Hours", icon: CalendarDays },
            { id: "settings", label: "Settings", icon: Settings2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[9px] font-bold uppercase tracking-wider transition-all ${activeView === tab.id
                ? "text-[#FF6A00]"
                : "text-[#0A0A0F]/30"
                }`}
            >
              <tab.icon size={18} className={activeView === tab.id ? "text-[#FF6A00]" : "text-[#0A0A0F]/20"} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <ShopHistoryDialog
        shop={historyShop}
        isOpen={!!historyShop}
        onClose={() => setHistoryShop(null)}
      />

      {/* Add Category Modal */}
      <Dialog
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="New Category"
        subtitle="Create a section for your items (e.g. Services, Food, Products)"
        icon={Plus}
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Haircuts, Breakfast, Footwear"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleAddCategory} disabled={!categoryName.trim()}>
              Create Category
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        title="Add Item"
        subtitle={`Adding to ${shop.menu?.[activeCategoryIdx]?.name}`}
        icon={ShoppingBag}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex-shrink-0">
              <ImageUpload
                onUpload={(url) => setItemImage(url)}
                currentImage={itemImage}
                compact
                label="Photo"
                folder="menu"
              />
            </div>
            <div className="flex-1 w-full space-y-4">
              <Input
                label="Item Name"
                placeholder="e.g. Premium Haircut"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Input
                label="Price ₹ (Optional)"
                type="number"
                placeholder="Leave blank if not applicable"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />
            </div>
          </div>
          <Textarea
            label="Short Description"
            placeholder="e.g. Include details about what's included or features..."
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            rows={2}
          />
          <label className="flex items-center gap-2 p-3 bg-black/[0.02] border border-black/[0.05] rounded-xl cursor-pointer hover:bg-black/[0.04] transition-all">
            <input
              type="checkbox"
              checked={itemFeatured}
              onChange={(e) => setItemFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-black/[0.06] text-[#FF6A00] focus:ring-[#FF6A00]"
            />
            <div>
              <span className="text-[13px] font-bold text-[#0A0A0F] block">Featured Item</span>
              <span className="text-[11px] text-[#0A0A0F]/45 block">Highlight this item at the top of your shop catalog.</span>
            </div>
          </label>
          <div className="flex justify-end pt-2">
            <Button onClick={handleAddItem} disabled={!itemName.trim()}>
              Add to Catalog
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog
        isOpen={showEditItemModal}
        onClose={() => setShowEditItemModal(false)}
        title="Edit Item"
        subtitle="Update details for this catalog entry"
        icon={Settings2}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex-shrink-0">
              <ImageUpload
                onUpload={(url) => setItemImage(url)}
                currentImage={itemImage}
                compact
                label="Photo"
                folder="menu"
              />
            </div>
            <div className="flex-1 w-full space-y-4">
              <Input
                label="Item Name"
                placeholder="e.g. Premium Haircut"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Input
                label="Price (₹)"
                type="number"
                placeholder="0.00"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />
            </div>
          </div>
          <Textarea
            label="Short Description"
            placeholder="e.g. Include details about what's included or features..."
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            rows={2}
          />
          <label className="flex items-center gap-2 p-3 bg-black/[0.02] border border-black/[0.05] rounded-xl cursor-pointer hover:bg-black/[0.04] transition-all">
            <input
              type="checkbox"
              checked={itemFeatured}
              onChange={(e) => setItemFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-black/[0.06] text-[#FF6A00] focus:ring-[#FF6A00]"
            />
            <div>
              <span className="text-[13px] font-bold text-[#0A0A0F] block">Featured Item</span>
              <span className="text-[11px] text-[#0A0A0F]/45 block">Highlight this item at the top of your shop catalog.</span>
            </div>
          </label>
          <div className="flex justify-end pt-2">
            <Button onClick={handleEditItem} disabled={!itemName.trim()}>
              Update Item
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog
        isOpen={showEditCategoryModal}
        onClose={() => setShowEditCategoryModal(false)}
        title="Edit Category"
        subtitle="Rename or remove this category section"
        icon={Settings2}
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Services, Food"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handleDeleteCategory}
              className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Delete Category
            </button>
            <Button onClick={handleEditCategory} disabled={!categoryName.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Item"
        subtitle="Are you sure you want to delete this item from your catalog?"
        icon={CircleAlert}
      >
        <div className="space-y-6">
          <div className="p-4 bg-black/[0.02] rounded-lg border border-black/[0.04]">
            <p className="text-[13px] font-bold text-[#0A0A0F]">
              {shop.menu?.[activeCategoryIdx]?.items?.[activeItemIdx]?.name}
            </p>
            <p className="text-[11px] text-[#FF6A00]">₹{shop.menu?.[activeCategoryIdx]?.items?.[activeItemIdx]?.price}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1 bg-red-500 hover:bg-red-600 border-red-500"
              onClick={handleDeleteItem}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Generic Message Modal */}

      {/* Generic Message Modal */}
      {/* ── Hidden Printable QR Card (for high-res download) ── */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div
          ref={qrRef}
          className="w-[420px] bg-white rounded-[40px] p-10 flex flex-col items-center text-center border shadow-sm"
        >
          <div className="w-24 h-24 bg-[#FF6A00]/10 rounded-3xl flex items-center justify-center mb-6 overflow-hidden">
            {shop?.logo ? (
              <img
                src={`https://images.weserv.nl/?url=${encodeURIComponent(shop.logo)}&output=png&t=${Date.now()}`}
                alt="Shop Logo"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <Store size={40} className="text-[#FF6A00]" />
            )}
          </div>

          <h2 className="text-3xl font-black text-[#0A0A0F] mb-1 tracking-tight">{shop?.name}</h2>
          <div className="flex items-center gap-2 text-[14px] text-[#0A0A0F]/45 tracking-widest mb-8">
            <MapPin size={14} className="text-[#FF6A00]" />
            {[shop?.zone, shop?.area, shop?.city].filter(Boolean).join(", ")}
          </div>

          <div className="p-8 bg-white border-4 border-[#0F0F0F] rounded-[48px] mb-8 shadow-sm">
            <img
              src={`https://images.weserv.nl/?url=${encodeURIComponent(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + "/shop/" + shop?.slug)}`)}&output=png`}
              alt="QR Code"
              className="w-48 h-48"
              crossOrigin="anonymous"
              onError={(e) => {
                // Fallback to direct if proxy fails
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + "/shop/" + shop?.slug)}`;
              }}
            />
          </div>

          <p className="text-[18px] font-black text-[#0A0A0F] uppercase tracking-tighter">Scan to explore</p>
          <p className="text-[12px] text-[#0A0A0F]/30 mt-2 font-medium">Powered by ShopBajar</p>
        </div>
      </div>

    </div>
  );
}

export default function ShopDashboard() {
  return (
    <Suspense fallback={null}>
      <ShopDashboardContent />
    </Suspense>
  );
}

