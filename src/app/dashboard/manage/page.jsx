"use client";

import React, { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { getProfileCompletion, getWeeklyViewStats } from "@/lib/shopUtils";
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
  ChefHat,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  Calculator,
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
  Loader2,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Globe,
  Sparkles,
  Menu,
  LayoutGrid,
  LayoutList,
  Bell
} from "lucide-react";
import Link from "next/link";
import ShopHistoryDialog from "@/components/Shop/HistoryDialog";
import MerchantSettingsForm from "@/components/Shop/MerchantSettingsForm";
import PaidFeaturesTab from "@/components/Shop/PaidFeaturesTab";
import InquiriesTab from "@/components/Shop/InquiriesTab";
import BillingPosTab from "@/components/Shop/BillingPosTab";
import Dialog from "@/components/UI/Dialog";
import Drawer from "@/components/UI/Drawer";
import Input from "@/components/UI/Input";
import Textarea from "@/components/UI/Textarea";
import Button from "@/components/UI/Button";
import Select from "@/components/UI/Select";
import { slugify } from "@/lib/slugify";

// Redux Toolkit Integration
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMerchantShop,
  updateMerchantShop,
  fetchMerchantReviews,
  deleteMerchantReview,
} from "@/redux/thunks/dashboardThunks";
import {
  selectMerchantShop,
  selectOpeningHours,
  selectHolidays,
  selectMerchantReviews,
  selectDashboardLoading,
  selectDashboardIsSaving,
  selectDashboardLoadingReviews,
  selectDashboardError,
} from "@/redux/selectors/dashboardSelectors";
import { setOpeningHoursState, setHolidaysState, clearDashboard } from "@/redux/slices/dashboardSlice";

function CatalogImage({ src, alt, featured, isNew }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
      {src && !hasError ? (
        <Image
          src={src.includes(" ") ? src.replace(/\s/g, "%20") : src}
          alt={alt}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-zinc-100 absolute inset-0 dark:bg-zinc-800 dark:text-zinc-600">
          <ShoppingBag size={18} className="text-zinc-300 dark:text-zinc-600" />
        </div>
      )}
      <div className="absolute top-0 left-0 z-10 flex flex-col items-start gap-0">
        {featured && (
          <span className="text-[7px] font-black bg-[#FF6A00] text-white px-1 py-px rounded-br uppercase tracking-wide shadow-sm flex items-center">
            Featured
          </span>
        )}
        {isNew !== false && (
          <span className={`text-[7px] font-black bg-emerald-600 text-white px-1 py-px ${featured ? 'rounded-r' : 'rounded-br'} uppercase tracking-wide shadow-sm flex items-center`}>
            New
          </span>
        )}
      </div>
    </div>
  );
}

function ShopDashboardContent() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("id");
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useAuth();
  const { showAlert, showConfirm } = useModal();

  // Redux Global Domain State
  const shop = useSelector(selectMerchantShop);
  const openingHours = useSelector(selectOpeningHours);
  const holidays = useSelector(selectHolidays);
  const reviews = useSelector(selectMerchantReviews);
  const loading = useSelector(selectDashboardLoading);
  const isSaving = useSelector(selectDashboardIsSaving);
  const loadingReviews = useSelector(selectDashboardLoadingReviews);
  const error = useSelector(selectDashboardError);

  // Local Ephemeral UI State
  const [activeView, setActiveView] = useState("overview");
  const [historyShop, setHistoryShop] = useState(null);
  const sectionRefs = useRef({});

  // Sync active view with query parameter for deep-linking
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam) {
      setActiveView(viewParam);
    }
  }, [searchParams]);

  const scrollToSection = (id) => {
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -100; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(null);
  const [activeItemIdx, setActiveItemIdx] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Item Form State
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemFeatured, setItemFeatured] = useState(false);
  const [itemIsNew, setItemIsNew] = useState(true);
  const [itemStock, setItemStock] = useState("");
  const [trackStock, setTrackStock] = useState(false);
  const [itemDiet, setItemDiet] = useState("");

  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounceRef = useRef(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [catalogView, setCatalogView] = useState("grid"); // "grid" | "list"

  const [newHoliday, setNewHoliday] = useState({ date: "", title: "" });
  const qrRef = useRef(null);
  const [downloadingQR, setDownloadingQR] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleCatalogSearch = useCallback((value) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setSearchQuery(value), 250);
  }, []);

  const navItems = [
    {
      id: "overview",
      label: "Overview & Analytics",
      shortLabel: "Overview",
      icon: LayoutDashboard,
      desc: "Views, leads & charts",
    },
    {
      id: "catalog",
      label: "Catalog Manager",
      shortLabel: "Catalog",
      icon: ListFilter,
      desc: "Categories & items",
    },
    {
      id: "gallery",
      label: "Photo Gallery",
      shortLabel: "Gallery",
      icon: ImageIcon,
      desc: "Storefront images",
    },
    {
      id: "hours",
      label: "Business Hours",
      shortLabel: "Hours",
      icon: CalendarDays,
      desc: "Timings & holidays",
    },
    {
      id: "reviews",
      label: "Customer Reviews",
      shortLabel: "Reviews",
      icon: Star,
      desc: "Ratings & feedback",
    },
    {
      id: "settings",
      label: "Shop Settings",
      shortLabel: "Settings",
      icon: Settings2,
      desc: "Configuration & SEO",
      subTabs: [
        { id: "identity", label: "Business Identity" },
        { id: "location", label: "Location & Address" },
        { id: "contact", label: "Contact Details" },
        { id: "delivery", label: "Delivery & Logistics" },
        { id: "social", label: "Social Media Links" },
        { id: "seo", label: "Discovery & SEO" },
      ],
    },
    {
      id: "features",
      label: "Paid Features",
      shortLabel: "Features",
      icon: Sparkles,
      desc: "SaaS Add-ons & Billing",
    },
    {
      id: "billing",
      label: "Billing & POS",
      shortLabel: "Billing",
      icon: Calculator,
      desc: "Invoices, counter bills & slips",
    },
    {
      id: "inquiries",
      label: "Customer Inquiries",
      shortLabel: "Inquiries",
      icon: MessageSquare,
      desc: "Order leads & requests",
    },
  ];

  const activeNavItem = navItems.find((item) => item.id === activeView) || navItems[0];

  const handleSelectView = (viewId) => {
    setActiveView(viewId);
    setIsMobileDrawerOpen(false);
  };

  const handleSelectSubTab = (subTabId) => {
    setActiveView("settings");
    setIsMobileDrawerOpen(false);
    setTimeout(() => scrollToSection(subTabId), 50);
  };

  // Redirect to dashboard if not authenticated or if shopId is missing
  useEffect(() => {
    if (!authLoading) {
      if (!user || !shopId) {
        router.replace("/dashboard");
      }
    }
  }, [authLoading, user, shopId, router]);

  // Fetch Shop Data on Mount
  useEffect(() => {
    if (user && shopId) {
      dispatch(fetchMerchantShop({ shopId, userId: user.uid }));
    }
    return () => {
      dispatch(clearDashboard());
    };
  }, [user, shopId, dispatch]);

  // Fetch Reviews when Reviews tab is active
  useEffect(() => {
    if (activeView === "reviews" && shopId) {
      dispatch(fetchMerchantReviews(shopId));
    }
  }, [activeView, shopId, dispatch]);



  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    setDownloadingQR(true);
    try {
      const { toPng } = await import("html-to-image");
      await new Promise((r) => setTimeout(r, 500));
      const dataUrl = await toPng(qrRef.current, {
        quality: 1,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
        cacheBust: true,
        style: { visibility: "visible" },
      });
      const link = document.createElement("a");
      link.download = `${shop.name?.replace(/\s+/g, "_")}_QRCode.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("QR Download failed:", err);
      const directUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(
        window.location.origin + "/shop/" + slugify(shop.slug)
      )}`;
      window.open(directUrl, "_blank");
    } finally {
      setDownloadingQR(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    showConfirm({
      title: "Delete Review",
      message:
        "Are you sure you want to delete this customer review? This will also update your aggregate rating.",
      confirmText: "Yes, Delete",
      type: "error",
      onConfirm: async () => {
        dispatch(deleteMerchantReview({ shopId, reviewId }))
          .unwrap()
          .then(() => {
            showAlert({
              title: "Deleted",
              message: "Review removed successfully",
              type: "success",
            });
          })
          .catch((err) => {
            showAlert({
              title: "Error",
              message: err || "Failed to delete review",
              type: "error",
            });
          });
      },
    });
  };

  const handleFullUpdate = async (finalData) => {
    dispatch(
      updateMerchantShop({
        shopId,
        updateData: { ...finalData, status: shop.status },
      })
    )
      .unwrap()
      .then(() => {
        showAlert({
          title: "Success",
          message: "Shop details updated successfully!",
          type: "success",
        });
      })
      .catch((err) => {
        showAlert({
          title: "Update Failed",
          message: err || "Unknown error",
          type: "error",
        });
      });
  };

  const handleUpdateMenu = async (newMenu) => {
    dispatch(updateMerchantShop({ shopId, updateData: { menu: newMenu } }))
      .unwrap()
      .catch((err) => {
        showAlert({
          title: "Catalog Error",
          message: err || "Unknown error",
          type: "error",
        });
      });
  };

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;
    const newMenu = [...(shop?.menu || []), { name: categoryName.trim(), items: [] }];
    handleUpdateMenu(newMenu);
    setCategoryName("");
    setShowCategoryModal(false);
  };

  const handleEditCategory = () => {
    if (!categoryName.trim()) return;
    const newMenu = [...(shop?.menu || [])];
    newMenu[activeCategoryIdx] = { ...newMenu[activeCategoryIdx], name: categoryName.trim() };
    handleUpdateMenu(newMenu);
    setCategoryName("");
    setShowEditCategoryModal(false);
  };

  const handleDeleteCategory = () => {
    showConfirm({
      title: "Delete Category",
      message: `Are you sure you want to delete the entire category "${shop?.menu?.[activeCategoryIdx]?.name}" and all its items? This action cannot be undone.`,
      confirmText: "Delete Everything",
      type: "error",
      onConfirm: () => {
        const newMenu = (shop?.menu || []).filter((_, i) => i !== activeCategoryIdx);
        handleUpdateMenu(newMenu);
        setShowEditCategoryModal(false);
      },
    });
  };

  const toggleCategory = (idx) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleAddItem = () => {
    if (!itemName.trim()) return;
    const newMenu = [...(shop?.menu || [])];
    const updatedCategory = { ...newMenu[activeCategoryIdx] };
    updatedCategory.items = [
      ...(updatedCategory.items || []),
      {
        name: itemName.trim(),
        price: itemPrice ? parseFloat(itemPrice) : "",
        description: itemDescription.trim(),
        image: itemImage,
        featured: itemFeatured,
        isNew: itemIsNew,
        stock: trackStock ? (itemStock ? parseInt(itemStock, 10) : 0) : null,
        diet: itemDiet || null,
      },
    ];
    newMenu[activeCategoryIdx] = updatedCategory;
    handleUpdateMenu(newMenu);
    resetItemForm();
    setShowItemModal(false);
  };

  const handleEditItem = () => {
    if (!itemName.trim()) return;
    const newMenu = [...(shop?.menu || [])];
    const updatedCategory = { ...newMenu[activeCategoryIdx] };
    const updatedItems = [...(updatedCategory.items || [])];
    updatedItems[activeItemIdx] = {
      ...updatedItems[activeItemIdx],
      name: itemName.trim(),
      price: itemPrice ? parseFloat(itemPrice) : "",
      description: itemDescription.trim(),
      image: itemImage,
      featured: itemFeatured,
      isNew: itemIsNew,
      stock: trackStock ? (itemStock ? parseInt(itemStock, 10) : 0) : null,
      diet: itemDiet || null,
    };
    updatedCategory.items = updatedItems;
    newMenu[activeCategoryIdx] = updatedCategory;
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
    setItemIsNew(true);
    setItemStock("");
    setTrackStock(false);
    setItemDiet("");
  };

  const handleDeleteItem = () => {
    const newMenu = [...(shop?.menu || [])];
    const updatedCategory = { ...newMenu[activeCategoryIdx] };
    const updatedItems = [...(updatedCategory.items || [])];
    updatedItems.splice(activeItemIdx, 1);
    updatedCategory.items = updatedItems;
    newMenu[activeCategoryIdx] = updatedCategory;
    handleUpdateMenu(newMenu);
    setShowDeleteModal(false);
  };

  const handleUpdateGallery = async (urls) => {
    if (!urls) return;
    const urlsArray = Array.isArray(urls) ? urls : [urls];
    if (urlsArray.length === 0) return;

    const currentCount = (shop?.gallery || []).length;
    if (currentCount >= 5) {
      showAlert({
        title: "Gallery Full",
        message: "Maximum 5 images allowed in the gallery.",
        type: "info",
      });
      return;
    }

    const availableSlots = 5 - currentCount;
    const urlsToAdd = urlsArray.slice(0, availableSlots);

    if (urlsArray.length > availableSlots) {
      showAlert({
        title: "Gallery Limit Reached",
        message: `Only 5 images allowed. Added ${urlsToAdd.length} image(s).`,
        type: "info",
      });
    }

    const newGallery = [...(shop?.gallery || []), ...urlsToAdd];
    dispatch(updateMerchantShop({ shopId, updateData: { gallery: newGallery } }));
  };

  const handleDeletePhoto = async (idx) => {
    showConfirm({
      title: "Delete Photo",
      message: "Are you sure you want to remove this photo from your gallery?",
      confirmText: "Yes, Delete",
      type: "error",
      onConfirm: async () => {
        const newGallery = (shop?.gallery || []).filter((_, i) => i !== idx);
        dispatch(updateMerchantShop({ shopId, updateData: { gallery: newGallery } }));
      },
    });
  };

  const handleUpdateHours = async () => {
    dispatch(
      updateMerchantShop({
        shopId,
        updateData: { openingHoursDetails: openingHours, holidays },
      })
    )
      .unwrap()
      .then(() => {
        showAlert({
          title: "Success",
          message: "Opening hours and holidays updated!",
          type: "success",
        });
      });
  };

  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.title) return;
    dispatch(setHolidaysState([...holidays, newHoliday]));
    setNewHoliday({ date: "", title: "" });
  };

  const handleDeleteHoliday = (idx) => {
    showConfirm({
      title: "Delete Holiday",
      message: "Are you sure you want to delete this holiday? Your shop will resume normal business hours for this date.",
      confirmText: "Yes, Delete",
      type: "error",
      onConfirm: () => {
        dispatch(setHolidaysState(holidays.filter((_, i) => i !== idx)));
      },
    });
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
              Description: item.description || "",
              Price: item.price || "",
              "Image URL": item.image || "",
              "Is Popular": item.featured || item.popular ? "Yes" : "No",
              "Is New": item.isNew !== false ? "Yes" : "No",
            });
          });
        }
      });

      if (exportData.length === 0) {
        exportData.push({
          "Section Category": "Example Section",
          "Item Name": "Example Item",
          Description: "Premium quality product",
          Price: 500,
          "Image URL": "",
          "Is Popular": "Yes",
          "Is New": "Yes",
        });
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Catalog");
      XLSX.writeFile(wb, `${slugify(shop?.name || "shop")}_catalog.xlsx`);
      showAlert({
        title: "Export Successful",
        message: "Catalog exported successfully as an Excel spreadsheet.",
        type: "success",
      });
    } catch (err) {
      console.error("Export error:", err);
      showAlert({
        title: "Export Failed",
        message: "Failed to export catalog. Please verify xlsx dependency.",
        type: "error",
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
              type: "error",
            });
            return;
          }

          const sectionsMap = {};

          jsonData.forEach((row) => {
            const catName =
              row["Section Category"]?.toString().trim() ||
              row["Category"]?.toString().trim() ||
              row["section"]?.toString().trim() ||
              "Catalog";
            const itemName =
              row["Item Name"]?.toString().trim() ||
              row["Name"]?.toString().trim() ||
              row["name"]?.toString().trim() ||
              "";
            const description =
              row["Description"]?.toString().trim() ||
              row["description"]?.toString().trim() ||
              "";
            const price = parseFloat(row["Price"] || row["price"] || 0) || 0;
            const image =
              row["Image URL"]?.toString().trim() ||
              row["image"]?.toString().trim() ||
              "";
            const isPopStr = (
              row["Is Popular"] ||
              row["popular"] ||
              row["featured"] ||
              ""
            )
              .toString()
              .toLowerCase();
            const featured =
              isPopStr === "yes" || isPopStr === "true" || isPopStr === "1";

            const isNewStr = (
              row["Is New"] ||
              row["new"] ||
              row["isNew"] ||
              ""
            )
              .toString()
              .toLowerCase();
            const isNew = isNewStr === "" ? true : (isNewStr === "yes" || isNewStr === "true" || isNewStr === "1");

            if (itemName) {
              if (!sectionsMap[catName]) sectionsMap[catName] = [];
              sectionsMap[catName].push({
                name: itemName,
                description,
                price: price || "",
                image,
                featured,
                popular: featured,
                isNew,
              });
            }
          });

          const newMenu = Object.entries(sectionsMap).map(([name, items]) => ({
            name,
            category: name,
            items,
          }));

          await handleUpdateMenu(newMenu);
          showAlert({
            title: "Import Successful",
            message: `Successfully imported ${jsonData.length} items across ${newMenu.length} sections!`,
            type: "success",
          });
        } catch (error) {
          console.error("Import error:", error);
          showAlert({
            title: "Import Failed",
            message:
              "Failed to parse file. Please ensure correct template structure.",
            type: "error",
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
        type: "error",
      });
      if (e.target) e.target.value = "";
      setIsImporting(false);
    }
  };

  const isPageLoading = authLoading || !!(user && shopId && loading);

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center dark:bg-zinc-950">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent animate-spin rounded-full mx-auto" />
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-center p-4 dark:bg-zinc-950">
        <div className="w-14 h-14 bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center mb-4 dark:bg-zinc-900 dark:border-zinc-800">
          <CircleAlert size={28} className="text-zinc-400" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-1 dark:text-zinc-100 tracking-tight">
          Workspace Not Found
        </h1>
        <p className="text-xs text-zinc-500 font-medium mb-6 max-w-xs dark:text-zinc-400">
          This business profile could not be located in your merchant portfolio.
        </p>
        <Link
          href="/dashboard"
          className="h-9 px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-md flex items-center justify-center transition-all shadow-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Return to Console
        </Link>
      </div>
    );
  }

  const catalogCount =
    shop?.menu?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <main className="w-full px-3 md:px-4 pt-3 md:pt-4 pb-12">
        {/* Compact ERP Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 bg-white p-3 rounded-md border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-md bg-zinc-50 border border-zinc-200/80 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all shrink-0 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <ArrowLeft size={14} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                  {shop?.name}
                </h1>
                <span
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 ${shop?.status === "approved"
                    ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : shop?.status === "rejected"
                      ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                      : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                    }`}
                >
                  {shop?.status === "approved"
                    ? "Operational"
                    : shop?.status === "rejected"
                      ? "Rejected"
                      : "Provisioning"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                <span className="flex items-center gap-1 shrink-0">
                  <Building2 size={11} /> {shop?.category}
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={11} /> {shop?.city}
                </span>
              </div>
            </div>
          </div>

          {/* Social Media Quick Links */}
          {shop?.socialLinks && shop.socialLinks.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {shop.socialLinks.map((link, index) => {
                if (!link.url) return null;
                const platforms = {
                  instagram: { icon: Instagram, color: "text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-500/10" },
                  facebook: { icon: Facebook, color: "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10" },
                  youtube: { icon: Youtube, color: "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" },
                  twitter: { icon: Twitter, color: "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800" },
                  linkedin: { icon: Linkedin, color: "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10" },
                  website: { icon: Globe, color: "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" },
                };
                const config = platforms[link.platform] || platforms.website;
                const Icon = config.icon;
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-7 h-7 rounded-md border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center transition-all shadow-sm bg-zinc-50 hover:border-zinc-300 dark:bg-zinc-800 ${config.color}`}
                    title={link.platform ? link.platform.charAt(0).toUpperCase() + link.platform.slice(1) : "Website"}
                  >
                    <Icon size={12} />
                  </a>
                );
              })}
            </div>
          )}

          {/* Navigation Drawer Trigger – visible on all screen sizes */}
          <button
            id="nav-drawer-trigger"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="flex items-center gap-2 h-9 px-3 rounded-md border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all shadow-sm shrink-0"
          >
            <Menu size={15} />
            <span className="text-xs font-semibold hidden sm:inline">{activeNavItem.shortLabel}</span>
          </button>
        </div>

        {/* ── Unified Navigation Drawer (all screen sizes) ── */}
        <Drawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          title="Command Center"
          subtitle={shop?.name || "Shop Dashboard"}
          width="w-72"
          footer={
            <a
              href="/help"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2 bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 text-[#FF6A00] text-[11px] font-bold rounded-md border border-[#FF6A00]/15 transition-all"
            >
              <Store size={13} />
              Contact Support
            </a>
          }
        >
          <div className="px-3 py-3 space-y-0.5">
            {/* Merchant badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[8px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Merchant
              </span>
            </div>

            {navItems.map((tab) => (
              <div key={tab.id}>
                <button
                  onClick={() => handleSelectView(tab.id)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-md text-left transition-all group ${activeView === tab.id
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${activeView === tab.id
                      ? "bg-white/10 text-[#FF6A00] dark:bg-black/10"
                      : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700 dark:group-hover:text-zinc-100"
                      }`}
                  >
                    <tab.icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold tracking-tight leading-tight">
                      {tab.label}
                    </div>
                    <div
                      className={`text-[10px] font-medium truncate mt-0.5 ${activeView === tab.id
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "text-zinc-400 dark:text-zinc-500"
                        }`}
                    >
                      {tab.desc}
                    </div>
                  </div>
                  {activeView === tab.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] shrink-0" />
                  )}
                </button>

                {/* Sub-tabs */}
                {activeView === tab.id && tab.subTabs && (
                  <div className="mt-1 ml-11 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                    {tab.subTabs.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectSubTab(sub.id)}
                        className="w-full text-left py-1.5 px-2 rounded-md text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50 transition-all flex items-center justify-between group"
                      >
                        <span>{sub.label}</span>
                        <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6A00]">→</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* QR Ordering quick links */}
            <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="px-3 text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                QR Ordering
              </span>
              <Link
                href={`/dashboard/tables?id=${shopId}`}
                className="w-full flex items-center gap-2.5 p-2 rounded-md text-left transition-all group text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700 dark:group-hover:text-zinc-100">
                  <QrCode size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold tracking-tight leading-tight">
                    Tables & QR
                  </div>
                  <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                    Manage table QR codes
                  </div>
                </div>
              </Link>
              <Link
                href={`/dashboard/kitchen?id=${shopId}`}
                className="w-full flex items-center gap-2.5 p-2 rounded-md text-left transition-all group text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700 dark:group-hover:text-zinc-100">
                  <ChefHat size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold tracking-tight leading-tight">
                    Kitchen View
                  </div>
                  <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                    Live orders dashboard
                  </div>
                </div>
              </Link>
              <Link
                href={`/dashboard/waiter?id=${shopId}`}
                className="w-full flex items-center gap-2.5 p-2 rounded-md text-left transition-all group text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700 dark:group-hover:text-zinc-100">
                  <Bell size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold tracking-tight leading-tight">
                    Waiter Console
                  </div>
                  <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                    Live service dashboard
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </Drawer>

        {/* ── Full-width Content Area (sidebar is now a drawer) ── */}
        <div>
          {/* Content Area */}
          <div className="space-y-4">
            {/* ── OVERVIEW TAB ── */}
            {activeView === "overview" && (
              <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total Views", value: shop?.views || 0, icon: Eye },
                    {
                      label: "WhatsApp Leads",
                      value: shop?.leads || 0,
                      icon: MessageSquare,
                    },
                    {
                      label: "Avg Rating",
                      value: shop?.avgRating || "5.0",
                      icon: Star,
                    },
                    { label: "Catalog Items", value: catalogCount, icon: ShoppingBag },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white p-3 rounded-md border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="w-7 h-7 rounded-md bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                          <stat.icon size={14} />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-0.5 tracking-tight">
                        {stat.value}
                      </div>
                      <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Performance & Discovery Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Chart Card */}
                  <div className="lg:col-span-2 bg-white rounded-md border border-zinc-200/80 shadow-sm p-4 dark:bg-zinc-900 dark:border-zinc-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                          Weekly Views
                        </h3>
                        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          Last 7 days performance
                        </p>
                      </div>
                      <div className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-[9px] font-bold text-zinc-500 uppercase tracking-widest dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
                        7 Days
                      </div>
                    </div>
                    <div className="h-28 flex items-end gap-1.5 pt-2">
                      {(() => {
                        const stats = getWeeklyViewStats(shop);
                        const maxViews = Math.max(...stats.map((s) => s.views), 1);
                        return stats.map((s, i) => {
                          const heightPct = Math.max((s.views / maxViews) * 100, 6);
                          const isToday = i === stats.length - 1;
                          return (
                            <div key={i} className="flex-1 relative group flex items-end h-full">
                              <div
                                className={`w-full transition-all rounded-md ${isToday
                                  ? "bg-[#FF6A00]"
                                  : "bg-[#FF6A00]/20 hover:bg-[#FF6A00]/40 dark:bg-[#FF6A00]/30 dark:hover:bg-[#FF6A00]/50"
                                  }`}
                                style={{ height: `${heightPct}%` }}
                              />
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-sm dark:bg-zinc-100 dark:text-zinc-900 font-bold">
                                {s.views} view{s.views !== 1 ? "s" : ""}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="flex justify-between mt-2.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
                      {getWeeklyViewStats(shop).map((s, i) => (
                        <span key={i} className={i === 6 ? "text-[#FF6A00]" : ""}>
                          {s.day}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* QR Discovery Card */}
                  <div className="bg-white rounded-md border border-zinc-200/80 shadow-sm p-4 text-center dark:bg-zinc-900 dark:border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 bg-[#FF6A00]/10 rounded-md flex items-center justify-center mx-auto mb-2">
                        <QrCode size={14} className="text-[#FF6A00]" />
                      </div>
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1.5">
                        Discovery Code
                      </h3>
                      <div className="bg-zinc-50 border border-zinc-200/80 p-2 rounded-md mb-3 flex items-center justify-center dark:bg-zinc-800 dark:border-zinc-700">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                            typeof window !== 'undefined' ? window.location.origin + "/shop/" + slugify(shop?.slug) : ""
                          )}`}
                          alt="Store QR"
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleDownloadQR}
                        disabled={downloadingQR}
                        className="flex-1 h-8 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold rounded-md flex items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        {downloadingQR ? (
                          <RefreshCw size={11} className="animate-spin" />
                        ) : (
                          <Download size={11} />
                        )}
                        Download
                      </button>
                      <button
                        onClick={() => {
                          const url =
                            window.location.origin + "/shop/" + slugify(shop?.slug);
                          navigator.clipboard.writeText(url);
                          showAlert({
                            title: "Link Copied",
                            message: "The shop link has been copied to your clipboard.",
                            type: "success",
                          });
                        }}
                        className="flex-1 h-8 border border-zinc-200/80 text-[11px] font-bold rounded-md flex items-center justify-center gap-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Share2 size={11} /> Share
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveView("catalog")}
                    className="bg-white p-3 rounded-md border border-zinc-200/80 text-left hover:border-[#FF6A00]/40 hover:shadow-sm transition-all group dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-[#FF6A00]/50"
                  >
                    <div className="w-8 h-8 bg-[#FF6A00]/10 rounded-md flex items-center justify-center mb-2">
                      <ListFilter size={14} className="text-[#FF6A00]" />
                    </div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-0.5">
                      Catalog Manager
                    </h3>
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Update your items, prices, and categories.
                    </p>
                    <div className="mt-1.5 text-[#FF6A00] text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Manage Catalog <ChevronRight size={12} />
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveView("gallery")}
                    className="bg-white p-3 rounded-md border border-zinc-200/80 text-left hover:border-blue-500/40 hover:shadow-sm transition-all group dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-500/50"
                  >
                    <div className="w-8 h-8 bg-blue-500/10 rounded-md flex items-center justify-center mb-2">
                      <ImageIcon size={14} className="text-blue-500" />
                    </div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-0.5">
                      Photo Gallery
                    </h3>
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Showcase your shop with high-quality photos.
                    </p>
                    <div className="mt-1.5 text-blue-500 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Upload Photos <ChevronRight size={12} />
                    </div>
                  </button>
                </div>

                {/* Onboarding Profile Checklist */}
                {(() => {
                  const { score, items } = getProfileCompletion(shop);
                  if (score === 100) return null;
                  return (
                    <div className="bg-white rounded-md border border-zinc-200/80 overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                              Complete Your Profile
                            </h3>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                              More complete = higher customer conversion
                            </p>
                          </div>
                          <span className="text-base font-black text-[#FF6A00]">
                            {score}%
                          </span>
                        </div>
                        <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FF9A72] rounded-full transition-all duration-700"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        {items.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => !item.done && setActiveView(item.tab)}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-md text-left transition-all ${item.done
                              ? "opacity-50 cursor-default"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group cursor-pointer"
                              }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${item.done
                                ? "bg-[#FF6A00] border-[#FF6A00]"
                                : "border-zinc-300 dark:border-zinc-700 group-hover:border-[#FF6A00]/50"
                                }`}
                            >
                              {item.done && (
                                <CircleCheckBig size={10} className="text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[11px] font-bold ${item.done
                                  ? "line-through text-zinc-400 dark:text-zinc-600"
                                  : "text-zinc-900 dark:text-zinc-100"
                                  }`}
                              >
                                {item.label}
                              </p>
                              {!item.done && (
                                <p className="text-[9.5px] text-zinc-400 dark:text-zinc-500 truncate font-medium">
                                  {item.hint}
                                </p>
                              )}
                            </div>
                            {!item.done && (
                              <ChevronRight
                                size={12}
                                className="text-zinc-400 group-hover:text-[#FF6A00] transition-colors shrink-0"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Growth Insight Banner */}
                <div className="bg-gradient-to-r from-[#FF6A00]/10 to-transparent rounded-md p-3 border border-[#FF6A00]/20 dark:from-[#FF6A00]/20 dark:to-transparent">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#FF6A00]/20 rounded-md flex items-center justify-center shrink-0">
                      <Zap size={14} className="text-[#FF6A00]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-0.5 tracking-tight">
                        Growth Insight
                      </h4>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
                        Businesses with complete catalogs see{" "}
                        <span className="font-bold text-[#FF6A00]">2.4x higher</span>{" "}
                        customer conversion rates.
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Navigation Links */}
                <div className="bg-white rounded-md border border-zinc-200/80 overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                  <button
                    onClick={() => setHistoryShop(shop)}
                    className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-xs font-bold text-zinc-600 dark:text-zinc-300"
                  >
                    <div className="flex items-center gap-2">
                      <History size={12} />
                      <span>Audit History</span>
                    </div>
                    <ChevronRight size={12} />
                  </button>
                  <Link
                    href={`/shop/${slugify(shop?.slug)}`}
                    target="_blank"
                    className="w-full flex items-center justify-between p-3 border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-xs font-bold text-zinc-600 dark:text-zinc-300"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink size={12} />
                      <span>View Live Page</span>
                    </div>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )}

            {/* ── CATALOG TAB ── */}
            {activeView === "catalog" && (
              <div className="bg-white rounded-md border border-zinc-200/80 overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                <div className="p-3 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Catalog Management
                    </h2>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      Manage your products and services
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="relative">
                      <Search
                        size={12}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="text"
                        placeholder="Search items..."
                        defaultValue={searchQuery}
                        onChange={(e) => handleCatalogSearch(e.target.value)}
                        className="pl-7 pr-2.5 h-8 bg-zinc-50 border border-zinc-200/80 rounded-md text-xs focus:bg-white focus:border-[#FF6A00]/40 outline-none transition-all w-32 sm:w-44 font-medium dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                      />
                    </div>
                    <button
                      onClick={handleExportCatalog}
                      disabled={isExporting}
                      className="h-8 px-2.5 bg-zinc-50 border border-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-md flex items-center gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
                      title="Download Catalog as Excel Spreadsheet"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-[#FF6A00]" />{" "}
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download size={12} /> Export
                        </>
                      )}
                    </button>
                    <label
                      className="cursor-pointer h-8 px-2.5 bg-zinc-50 border border-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-md flex items-center gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm whitespace-nowrap mb-0"
                      title="Upload Excel or CSV Catalog"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-[#FF6A00]" />{" "}
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload size={12} /> Import
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
                    {/* View Toggle */}
                    <div className="flex items-center h-8 rounded-md border border-zinc-200/80 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                      <button
                        onClick={() => setCatalogView("grid")}
                        title="Grid View"
                        className={`h-full w-8 flex items-center justify-center transition-all ${catalogView === "grid"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          }`}
                      >
                        <LayoutGrid size={13} />
                      </button>
                      <button
                        onClick={() => setCatalogView("list")}
                        title="List View"
                        className={`h-full w-8 flex items-center justify-center transition-all ${catalogView === "list"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          }`}
                      >
                        <LayoutList size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => setShowCategoryModal(true)}
                      className="h-8 px-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold rounded-md flex items-center gap-1 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 transition-all whitespace-nowrap shadow-sm"
                    >
                      <Plus size={12} /> Add Category
                    </button>
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  {(() => {
                    const filteredMenu = (shop?.menu || [])
                      .map((cat) => ({
                        ...cat,
                        items: (cat.items || []).filter((item) =>
                          item.name.toLowerCase().includes(searchQuery.toLowerCase())
                        ),
                      }))
                      .filter(
                        (cat) =>
                          cat.items.length > 0 ||
                          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                    if (filteredMenu.length > 0) {
                      return filteredMenu.map((category, idx) => {
                        const isCollapsed =
                          collapsedCategories.has(idx) && searchQuery === "";
                        return (
                          <div
                            key={idx}
                            className="border border-zinc-200/80 rounded-md overflow-hidden dark:border-zinc-800"
                          >
                            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center border-b border-zinc-200/80 dark:border-zinc-800">
                              <div
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => toggleCategory(idx)}
                              >
                                <div
                                  className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""
                                    }`}
                                >
                                  <ChevronRight size={14} className="text-zinc-400" />
                                </div>
                                <ShoppingBag size={14} className="text-[#FF6A00]" />
                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                  {category.name}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-500 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700 shadow-sm">
                                  {category.items?.length || 0} items
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setActiveCategoryIdx(idx);
                                    setCategoryName(category.name);
                                    setShowEditCategoryModal(true);
                                  }}
                                  className="h-7 w-7 hover:bg-zinc-200/50 dark:hover:bg-zinc-700 rounded-md flex items-center justify-center transition-all text-zinc-500 dark:text-zinc-400"
                                >
                                  <Settings2 size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveCategoryIdx(idx);
                                    resetItemForm();
                                    setItemFeatured(false);
                                    setShowItemModal(true);
                                  }}
                                  className="h-7 px-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-bold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 transition-all shadow-sm"
                                >
                                  + Add Item
                                </button>
                              </div>
                            </div>

                            {!isCollapsed && (
                              catalogView === "grid" ? (
                                /* ── GRID VIEW: compact 4-col vertical cards ── */
                                <div className="p-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 animate-in slide-in-from-top-2 duration-200">
                                  {category.items?.map((item, iIdx) => (
                                    <div
                                      key={iIdx}
                                      className="group bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm transition-all duration-200 rounded-md overflow-hidden flex flex-col dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
                                    >
                                      {/* Square Image */}
                                      <div className="relative w-full aspect-square bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
                                        <CatalogImage
                                          src={item.image}
                                          alt={item.name}
                                          featured={item.featured}
                                          isNew={item.isNew}
                                        />
                                      </div>
                                      {/* Card Body */}
                                      <div className="flex-1 flex flex-col p-2 gap-1.5">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            {item.diet === "veg" && (
                                              <div className="w-3 h-3 border border-emerald-600 flex items-center justify-center bg-white rounded-[2px] shrink-0" title="Vegetarian">
                                                <div className="w-1 h-1 rounded-full bg-emerald-600" />
                                              </div>
                                            )}
                                            {item.diet === "nonveg" && (
                                              <div className="w-3 h-3 border border-rose-600 flex items-center justify-center bg-white rounded-[2px] shrink-0" title="Non-Vegetarian">
                                                <div className="w-1 h-1 rounded-full bg-rose-600" />
                                              </div>
                                            )}
                                            <h4 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight leading-tight">
                                              {item.name}
                                            </h4>
                                          </div>
                                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium line-clamp-1 leading-snug mt-0.5">
                                            {item.description || "—"}
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-1 flex-wrap">
                                          <span className="text-[11px] font-black text-[#FF6A00] leading-none">
                                            {item.price !== "" && item.price != null ? `₹${item.price}` : "On Request"}
                                          </span>
                                          {(() => {
                                            const stockVal = item.stock;
                                            if (stockVal === undefined || stockVal === null || stockVal === "") {
                                              return null;
                                            }
                                            const stockNum = parseInt(stockVal, 10);
                                            if (isNaN(stockNum) || stockNum <= 0) {
                                              return (
                                                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/30">
                                                  Out of stock
                                                </span>
                                              );
                                            }
                                            if (stockNum <= 5) {
                                              return (
                                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 animate-pulse">
                                                  {stockNum} left
                                                </span>
                                              );
                                            }
                                            return (
                                              <span className="text-[9px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                {stockNum} in stock
                                              </span>
                                            );
                                          })()}
                                        </div>
                                        <div className="flex items-center gap-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                          <button
                                            onClick={() => {
                                              const originalCatIdx = (shop.menu || []).findIndex((c) => c.name === category.name);
                                              const originalItemIdx = (shop.menu[originalCatIdx].items || []).findIndex((it) => it.name === item.name);
                                              setActiveCategoryIdx(originalCatIdx); setActiveItemIdx(originalItemIdx);
                                              setItemName(item.name); setItemPrice(item.price.toString());
                                              setItemDescription(item.description || ""); setItemImage(item.image || "");
                                              setItemFeatured(!!item.featured); setItemIsNew(item.isNew !== false);
                                              setItemDiet(item.diet || "");
                                              const hasStock = item.stock !== undefined && item.stock !== null && item.stock !== "";
                                              setTrackStock(hasStock);
                                              setItemStock(hasStock ? item.stock.toString() : "");
                                              setShowEditItemModal(true);
                                            }}
                                            className="flex-1 h-6 bg-zinc-50 hover:bg-zinc-100 rounded-md text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-1 text-[9px] font-bold border border-zinc-200/80 dark:border-zinc-700"
                                          >
                                            <Settings2 size={10} /> Edit
                                          </button>
                                          <button
                                            onClick={() => {
                                              const originalCatIdx = (shop.menu || []).findIndex((c) => c.name === category.name);
                                              const originalItemIdx = (shop.menu[originalCatIdx].items || []).findIndex((it) => it.name === item.name);
                                              setActiveCategoryIdx(originalCatIdx); setActiveItemIdx(originalItemIdx);
                                              setShowDeleteModal(true);
                                            }}
                                            className="h-6 w-6 bg-red-500/10 hover:bg-red-500/20 rounded-md text-red-500 transition-all flex items-center justify-center border border-red-500/20 shrink-0"
                                          >
                                            <X size={10} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                /* ── LIST VIEW: compact horizontal cards ── */
                                <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-2 animate-in slide-in-from-top-2 duration-200">
                                  {category.items?.map((item, iIdx) => (
                                    <div
                                      key={iIdx}
                                      className="group flex items-center gap-3 p-2.5 bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-md transition-all"
                                    >
                                      {/* Thumbnail — full card height */}
                                      <div className="relative self-stretch w-16 shrink-0 rounded-l-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 -m-2.5 mr-0">
                                        <CatalogImage
                                          src={item.image}
                                          alt={item.name}
                                          featured={item.featured}
                                          isNew={item.isNew}
                                        />
                                      </div>
                                      {/* Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          {item.diet === "veg" && (
                                            <div className="w-3 h-3 border border-emerald-600 flex items-center justify-center bg-white rounded-[2px] shrink-0" title="Vegetarian">
                                              <div className="w-1 h-1 rounded-full bg-emerald-600" />
                                            </div>
                                          )}
                                          {item.diet === "nonveg" && (
                                            <div className="w-3 h-3 border border-rose-600 flex items-center justify-center bg-white rounded-[2px] shrink-0" title="Non-Vegetarian">
                                              <div className="w-1 h-1 rounded-full bg-rose-600" />
                                            </div>
                                          )}
                                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight leading-tight">
                                            {item.name}
                                          </h4>
                                          {item.featured && (
                                            <span className="text-[7px] font-black bg-[#FF6A00] text-white px-1 py-0.5 rounded uppercase tracking-wider shrink-0">
                                              ★
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate leading-snug mb-1">
                                          {item.description || "—"}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-[11px] font-black text-[#FF6A00] leading-none">
                                            {item.price !== "" && item.price != null ? `₹${item.price}` : "On Request"}
                                          </span>
                                          {(() => {
                                            const stockVal = item.stock;
                                            if (stockVal === undefined || stockVal === null || stockVal === "") {
                                              return null;
                                            }
                                            const stockNum = parseInt(stockVal, 10);
                                            if (isNaN(stockNum) || stockNum <= 0) {
                                              return (
                                                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/30">
                                                  Out of stock
                                                </span>
                                              );
                                            }
                                            if (stockNum <= 5) {
                                              return (
                                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 animate-pulse">
                                                  {stockNum} left
                                                </span>
                                              );
                                            }
                                            return (
                                              <span className="text-[9px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                {stockNum} in stock
                                              </span>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                      {/* Actions — hover reveal */}
                                      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => {
                                            const originalCatIdx = (shop.menu || []).findIndex((c) => c.name === category.name);
                                            const originalItemIdx = (shop.menu[originalCatIdx].items || []).findIndex((it) => it.name === item.name);
                                            setActiveCategoryIdx(originalCatIdx); setActiveItemIdx(originalItemIdx);
                                            setItemName(item.name); setItemPrice(item.price.toString());
                                            setItemDescription(item.description || ""); setItemImage(item.image || "");
                                            setItemFeatured(!!item.featured); setItemIsNew(item.isNew !== false);
                                            setItemDiet(item.diet || "");
                                            const hasStock = item.stock !== undefined && item.stock !== null && item.stock !== "";
                                            setTrackStock(hasStock);
                                            setItemStock(hasStock ? item.stock.toString() : "");
                                            setShowEditItemModal(true);
                                          }}
                                          className="h-5 w-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-md text-zinc-600 dark:text-zinc-300 transition-all flex items-center justify-center"
                                          title="Edit"
                                        >
                                          <Settings2 size={10} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            const originalCatIdx = (shop.menu || []).findIndex((c) => c.name === category.name);
                                            const originalItemIdx = (shop.menu[originalCatIdx].items || []).findIndex((it) => it.name === item.name);
                                            setActiveCategoryIdx(originalCatIdx); setActiveItemIdx(originalItemIdx);
                                            setShowDeleteModal(true);
                                          }}
                                          className="h-5 w-5 bg-red-500/10 hover:bg-red-500/20 rounded-md text-red-500 transition-all flex items-center justify-center"
                                          title="Delete"
                                        >
                                          <X size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
                        );
                      });
                    } else {
                      return (
                        <div className="text-center py-12">
                          <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-md flex items-center justify-center mx-auto mb-3 border border-zinc-200/80 dark:border-zinc-700">
                            <ShoppingBag size={28} className="text-zinc-400" />
                          </div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 tracking-tight">
                            {searchQuery ? "No results found" : "No Items Yet"}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-4 max-w-xs mx-auto">
                            {searchQuery
                              ? "Try searching for something else"
                              : "Start adding products to your catalog"}
                          </p>
                          {!searchQuery && (
                            <button
                              onClick={() => {
                                resetItemForm();
                                setShowCategoryModal(true);
                              }}
                              className="h-9 px-5 bg-[#FF6A00] text-white text-xs font-bold rounded-md shadow-sm active:scale-95 transition-all"
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

            {/* ── HOURS TAB ── */}
            {activeView === "hours" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                <div className="bg-white rounded-md border border-zinc-200/80 overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Weekly Schedule
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Set your regular operating hours
                      </p>
                    </div>
                    <Button onClick={handleUpdateHours} disabled={isSaving} size="sm">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {Object.keys(openingHours).map((day) => (
                      <div
                        key={day}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-zinc-50 border border-zinc-200/80 gap-3 dark:bg-zinc-800/50 dark:border-zinc-700/80"
                      >
                        <div className="flex items-center gap-3 w-32 shrink-0">
                          <div
                            className={`w-2 h-2 rounded-full ${openingHours[day].isClosed ? "bg-red-400" : "bg-emerald-400"
                              }`}
                          />
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 capitalize tracking-tight">
                            {day}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={openingHours[day].open}
                              disabled={openingHours[day].isClosed}
                              onChange={(e) =>
                                dispatch(
                                  setOpeningHoursState({
                                    ...openingHours,
                                    [day]: { ...openingHours[day], open: e.target.value },
                                  })
                                )
                              }
                              className="h-8 px-2.5 bg-white border border-zinc-200/80 rounded-md text-xs outline-none disabled:opacity-50 font-medium dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 shadow-sm"
                            />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">
                              to
                            </span>
                            <input
                              type="time"
                              value={openingHours[day].close}
                              disabled={openingHours[day].isClosed}
                              onChange={(e) =>
                                dispatch(
                                  setOpeningHoursState({
                                    ...openingHours,
                                    [day]: { ...openingHours[day], close: e.target.value },
                                  })
                                )
                              }
                              className="h-8 px-2.5 bg-white border border-zinc-200/80 rounded-md text-xs outline-none disabled:opacity-50 font-medium dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 shadow-sm"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={openingHours[day].isClosed}
                              onChange={(e) =>
                                dispatch(
                                  setOpeningHoursState({
                                    ...openingHours,
                                    [day]: {
                                      ...openingHours[day],
                                      isClosed: e.target.checked,
                                    },
                                  })
                                )
                              }
                              className="w-4 h-4 rounded border-zinc-300 text-[#FF6A00] focus:ring-[#FF6A00] dark:border-zinc-600 dark:bg-zinc-800"
                            />
                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                              Closed
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-md border border-zinc-200/80 overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Upcoming Holidays
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Mark your shop as closed for specific dates
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="date"
                          value={newHoliday.date}
                          onChange={(e) =>
                            setNewHoliday({ ...newHoliday, date: e.target.value })
                          }
                          className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200/80 rounded-md text-xs outline-none focus:bg-white transition-all font-medium dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 shadow-sm"
                        />
                      </div>
                      <div className="flex-[2]">
                        <input
                          type="text"
                          placeholder="Holiday Title (e.g. Diwali, Store Maintenance)"
                          value={newHoliday.title}
                          onChange={(e) =>
                            setNewHoliday({ ...newHoliday, title: e.target.value })
                          }
                          className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200/80 rounded-md text-xs outline-none focus:bg-white transition-all font-medium dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 shadow-sm"
                        />
                      </div>
                      <Button
                        onClick={handleAddHoliday}
                        disabled={!newHoliday.date || !newHoliday.title}
                        variant="outline"
                        size="sm"
                        className="h-9"
                      >
                        <Plus size={14} className="mr-1" /> Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {holidays.length > 0 ? (
                        holidays.map((holiday, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-md border border-zinc-200/80 dark:bg-zinc-800/50 dark:border-zinc-700 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="px-2.5 py-1 bg-white border border-zinc-200/80 rounded-md text-[10px] font-bold text-[#FF6A00] dark:bg-zinc-800 dark:border-zinc-700 shadow-sm">
                                {new Date(holiday.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                {holiday.title}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteHoliday(idx)}
                              className="p-1.5 hover:bg-red-50 rounded-md text-zinc-400 hover:text-red-500 transition-all dark:hover:bg-red-500/10"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-zinc-50 rounded-md border border-dashed border-zinc-200 dark:bg-zinc-800/30 dark:border-zinc-800">
                          <p className="text-xs text-zinc-400 font-medium">
                            No holidays scheduled
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── GALLERY TAB ── */}
            {activeView === "gallery" && (
              <div className="bg-white rounded-md border border-zinc-200/80 shadow-sm p-5 dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Photo Gallery
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Visual showcase of your business
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-zinc-50 border border-zinc-200/80 rounded-md text-[10px] font-bold text-zinc-500 uppercase tracking-widest dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 shadow-sm">
                    {(shop?.gallery || []).length} / 5
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {shop?.gallery?.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square relative group rounded-md overflow-hidden border border-zinc-200/80 shadow-sm bg-white dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <Image
                        src={url.includes(" ") ? url.replace(/\s/g, "%20") : url}
                        alt={`Gallery ${i}`}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 20vw"
                      />
                      <button
                        onClick={() => handleDeletePhoto(i)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm active:scale-95"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(shop?.gallery || []).length < 5 && (
                    <div className="aspect-square">
                      <ImageUpload
                        onUpload={handleUpdateGallery}
                        folder="shops"
                        compact={true}
                        multiple={true}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-blue-500/5 p-4 rounded-md border border-blue-500/10 flex items-center gap-3">
                  <ImageIcon size={16} className="text-blue-500 shrink-0" />
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    Tip: Upload high-quality photos to attract more customers. Tap an image
                    to delete it.
                  </p>
                </div>
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeView === "settings" && (
              <div className="w-full space-y-6 pb-12">
                <MerchantSettingsForm
                  initialData={shop}
                  onSubmit={handleFullUpdate}
                  isLoading={isSaving}
                  sectionRefs={sectionRefs}
                />
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeView === "reviews" && (
              <div className="bg-white rounded-md border border-zinc-200/80 shadow-sm p-5 dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Customer Reviews
                    </h3>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Manage what customers are saying
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-[#FF6A00]/10 border border-[#FF6A00]/20 rounded-md text-xs font-bold text-[#FF6A00] shadow-sm">
                    ⭐ {shop?.avgRating || "5.0"}
                  </div>
                </div>

                {loadingReviews ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#FF6A00]/20 border-t-[#FF6A00] rounded-full animate-spin" />
                    <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase">
                      Fetching feedback...
                    </p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 rounded-md bg-zinc-50 border border-zinc-200/80 group hover:border-[#FF6A00]/30 transition-all dark:bg-zinc-800/50 dark:border-zinc-700 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-zinc-200/80 shadow-sm shrink-0 dark:bg-zinc-800 dark:border-zinc-700">
                              <UserIcon size={18} className="text-zinc-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {review.userName}
                                </span>
                                <div className="flex items-center gap-0.5 text-[#FFB800] shrink-0">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      size={12}
                                      fill={s <= review.rating ? "currentColor" : "none"}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-[10px] text-zinc-400 mb-2 font-medium">
                                Posted on{" "}
                                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic font-medium">
                                "{review.comment}"
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="h-8 w-8 bg-white border border-red-100 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 flex items-center justify-center shrink-0 dark:bg-zinc-800 dark:border-red-500/20 dark:hover:bg-red-500/10 shadow-sm active:scale-95"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-md flex items-center justify-center mx-auto mb-3 border border-zinc-200/80 dark:border-zinc-700">
                      <ThumbsUpIcon size={28} className="text-zinc-400" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 tracking-tight">
                      No Reviews Yet
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Reviews from customers will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── PAID FEATURES TAB ── */}
            {activeView === "features" && (
              <div className="w-full space-y-6 pb-12">
                <PaidFeaturesTab shop={shop} />
              </div>
            )}
            {activeView === "billing" && (
              <div className="w-full space-y-6 pb-12">
                <BillingPosTab shop={shop} />
              </div>
            )}

            {/* ── CUSTOMER INQUIRIES TAB ── */}
            {activeView === "inquiries" && (
              <div className="w-full space-y-6 pb-12">
                <InquiriesTab shop={shop} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 shadow-2xl dark:bg-zinc-900/95 dark:border-zinc-800">
        <div className="flex items-stretch">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "catalog", label: "Catalog", icon: ListFilter },
            { id: "gallery", label: "Gallery", icon: ImageIcon },
            { id: "hours", label: "Hours", icon: CalendarDays },
            { id: "settings", label: "Settings", icon: Settings2 },
            { id: "features", label: "Features", icon: Sparkles },
            { id: "billing", label: "Billing", icon: Calculator },
            { id: "inquiries", label: "Inquiries", icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[9px] font-bold uppercase tracking-wider transition-all ${activeView === tab.id
                ? "text-[#FF6A00]"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
            >
              <tab.icon
                size={16}
                className={activeView === tab.id ? "text-[#FF6A00]" : "text-zinc-400"}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* History Dialog */}
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
        subtitle={`Adding to ${shop?.menu?.[activeCategoryIdx]?.name}`}
        icon={ShoppingBag}
      >
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex-shrink-0">
              <ImageUpload
                onUpload={(url) => setItemImage(url)}
                currentImage={itemImage}
                compact
                label="Photo"
                folder="menu"
              />
            </div>
            <div className="flex-1 w-full space-y-2">
              <Input
                label="Item Name"
                placeholder="e.g. Premium Haircut"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <div className={`grid ${trackStock ? 'grid-cols-2' : 'grid-cols-1'} gap-2 transition-all duration-200`}>
                <Input
                  label="Price ₹ (Optional)"
                  type="number"
                  placeholder="Leave blank"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                />
                {trackStock && (
                  <Input
                    label="Stock Count"
                    type="number"
                    placeholder="Enter stock quantity"
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
          <Select
            label="Dietary Preference (Veg / Non-Veg)"
            value={itemDiet}
            onChange={(e) => setItemDiet(e.target.value)}
            options={[
              { value: "", label: "Not Selected (None)" },
              { value: "veg", label: "Vegetarian (Veg)" },
              { value: "nonveg", label: "Non-Vegetarian (Non-Veg)" },
            ]}
          />
          <Textarea
            label="Short Description"
            placeholder="e.g. Include details about what's included or features..."
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            rows={2}
          />
          <div className="pt-1 grid grid-cols-3 gap-2">
            <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200/80 rounded-md cursor-pointer hover:bg-zinc-100 transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:hover:bg-zinc-800 shadow-sm">
              <input
                type="checkbox"
                checked={trackStock}
                onChange={(e) => {
                  setTrackStock(e.target.checked);
                  if (!e.target.checked) {
                    setItemStock("");
                  }
                }}
                className="w-4 h-4 rounded border-zinc-300 text-[#FF6A00] focus:ring-[#FF6A00] dark:border-zinc-600 dark:bg-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 block tracking-tight truncate">
                  Track Stock
                </span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block font-medium truncate">
                  Manage inventory
                </span>
              </div>
            </label>
            <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200/80 rounded-md cursor-pointer hover:bg-zinc-100 transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:hover:bg-zinc-800 shadow-sm">
              <input
                type="checkbox"
                checked={itemFeatured}
                onChange={(e) => setItemFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-[#FF6A00] focus:ring-[#FF6A00] dark:border-zinc-600 dark:bg-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 block tracking-tight truncate">
                  Featured
                </span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block font-medium truncate">
                  Highlight at top
                </span>
              </div>
            </label>
            <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200/80 rounded-md cursor-pointer hover:bg-zinc-100 transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:hover:bg-zinc-800 shadow-sm">
              <input
                type="checkbox"
                checked={itemIsNew}
                onChange={(e) => setItemIsNew(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-[#FF6A00] focus:ring-[#FF6A00] dark:border-zinc-600 dark:bg-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 block tracking-tight truncate">
                  New Tag
                </span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block font-medium truncate">
                  Show "New" badge
                </span>
              </div>
            </label>
          </div>
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
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex-shrink-0">
              <ImageUpload
                onUpload={(url) => setItemImage(url)}
                currentImage={itemImage}
                compact
                label="Photo"
                folder="menu"
              />
            </div>
            <div className="flex-1 w-full space-y-2">
              <Input
                label="Item Name"
                placeholder="e.g. Premium Haircut"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <div className={`grid ${trackStock ? 'grid-cols-2' : 'grid-cols-1'} gap-2 transition-all duration-200`}>
                <Input
                  label="Price ₹ (Optional)"
                  type="number"
                  placeholder="Leave blank"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                />
                {trackStock && (
                  <Input
                    label="Stock Count"
                    type="number"
                    placeholder="Enter stock quantity"
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
          <Select
            label="Dietary Preference (Veg / Non-Veg)"
            value={itemDiet}
            onChange={(e) => setItemDiet(e.target.value)}
            options={[
              { value: "", label: "Not Selected (None)" },
              { value: "veg", label: "Vegetarian (Veg)" },
              { value: "nonveg", label: "Non-Vegetarian (Non-Veg)" },
            ]}
          />
          <Textarea
            label="Short Description"
            placeholder="e.g. Include details about what's included or features..."
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            rows={2}
          />
          <div className="pt-1 grid grid-cols-3 gap-2">
            <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200/80 rounded-md cursor-pointer hover:bg-zinc-100 transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:hover:bg-zinc-800 shadow-sm">
              <input
                type="checkbox"
                checked={trackStock}
                onChange={(e) => {
                  setTrackStock(e.target.checked);
                  if (!e.target.checked) {
                    setItemStock("");
                  }
                }}
                className="w-4 h-4 rounded border-zinc-300 text-[#FF6A00] focus:ring-[#FF6A00] dark:border-zinc-600 dark:bg-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 block tracking-tight truncate">
                  Track Stock
                </span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block font-medium truncate">
                  Manage inventory
                </span>
              </div>
            </label>
            <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200/80 rounded-md cursor-pointer hover:bg-zinc-100 transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:hover:bg-zinc-800 shadow-sm">
              <input
                type="checkbox"
                checked={itemFeatured}
                onChange={(e) => setItemFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-[#FF6A00] focus:ring-[#FF6A00] dark:border-zinc-600 dark:bg-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 block tracking-tight truncate">
                  Featured
                </span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block font-medium truncate">
                  Highlight at top
                </span>
              </div>
            </label>
            <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200/80 rounded-md cursor-pointer hover:bg-zinc-100 transition-all dark:bg-zinc-800/50 dark:border-zinc-700 dark:hover:bg-zinc-800 shadow-sm">
              <input
                type="checkbox"
                checked={itemIsNew}
                onChange={(e) => setItemIsNew(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-[#FF6A00] focus:ring-[#FF6A00] dark:border-zinc-600 dark:bg-zinc-800"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 block tracking-tight truncate">
                  New Tag
                </span>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block font-medium truncate">
                  Show "New" badge
                </span>
              </div>
            </label>
          </div>
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
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
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
        <div className="space-y-4">
          <div className="p-3.5 bg-zinc-50 rounded-md border border-zinc-200/80 dark:bg-zinc-800/50 dark:border-zinc-700 shadow-sm">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-0.5">
              {shop?.menu?.[activeCategoryIdx]?.items?.[activeItemIdx]?.name}
            </p>
            <p className="text-[11px] font-bold text-[#FF6A00]">
              ₹{shop?.menu?.[activeCategoryIdx]?.items?.[activeItemIdx]?.price}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-9"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1 h-9 bg-red-500 hover:bg-red-600 border-red-500 text-white font-bold"
              onClick={handleDeleteItem}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Hidden Printable QR Card (for high-res download) */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div
          ref={qrRef}
          className="w-[400px] bg-white rounded-[32px] p-8 flex flex-col items-center text-center border shadow-sm"
        >
          <div className="w-20 h-20 bg-[#FF6A00]/10 rounded-md flex items-center justify-center mb-5 overflow-hidden shadow-inner">
            {shop?.logo ? (
              <img
                src={`https://images.weserv.nl/?url=${encodeURIComponent(
                  shop.logo
                )}&output=png&t=${Date.now()}`}
                alt="Shop Logo"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <Store size={32} className="text-[#FF6A00]" />
            )}
          </div>

          <h2 className="text-2xl font-black text-zinc-900 mb-1 tracking-tight">
            {shop?.name}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 tracking-widest mb-6 font-bold">
            <MapPin size={14} className="text-[#FF6A00]" />
            {[shop?.zone, shop?.area, shop?.city].filter(Boolean).join(", ")}
          </div>

          <div className="p-6 bg-white border-4 border-zinc-900 rounded-[40px] mb-6 shadow-sm">
            <img
              src={`https://images.weserv.nl/?url=${encodeURIComponent(
                `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                  window.location.origin + "/shop/" + shop?.slug
                )}`
              )}&output=png`}
              alt="QR Code"
              className="w-44 h-44 object-contain"
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                  window.location.origin + "/shop/" + shop?.slug
                )}`;
              }}
            />
          </div>

          <p className="text-base font-black text-zinc-900 uppercase tracking-wider mb-1">
            Scan to explore
          </p>
          <p className="text-[11px] text-zinc-400 font-bold tracking-wide">
            Powered by ShopBajar
          </p>
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
