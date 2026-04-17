"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getShopBySlug, getShopsByCategory, submitShopRating } from "@/lib/db";
import ShopHeader from "@/components/Shop/Header";
import ShopAbout from "@/components/Shop/About";
import ShopMenu from "@/components/Shop/Menu";
import ShopContact from "@/components/Shop/Contact";
import ShopGallery from "@/components/Shop/Gallery";
import ShopMap from "@/components/Shop/Map";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import Navbar from "@/components/Navbar";
import ShopSkeleton from "@/components/Shop/Skeleton";
import {
  MapPin,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Star,
  Share2,
  QrCode,
} from "lucide-react";

/**
 * Universal Fallback Router (not-found.js)
 * Catches all unknown routes in development (Local) and production (Firebase 404).
 */
export default function NotFound() {
  const pathname = usePathname();
  const pathParts = (pathname || "").split("/").filter(Boolean);

  const [data, setData] = useState(null);
  const [view, setView] = useState(null); // 'shop', 'category', 'loading', '404', 'error'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const route = async () => {
      // If we're at a valid system file (manifests, etc), don't try to route
      if (
        !pathname ||
        pathname.includes(".") ||
        pathname.startsWith("/_next")
      ) {
        setView("404");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg("");

      try {
        // Case 1: Category Listing (/category/:cat)
        if (pathParts[0] === "category" && pathParts[1]) {
          const category = decodeURIComponent(pathParts[1]);
          const shops = await getShopsByCategory(category);
          setData({ category, shops });
          setView("category");
          document.title = `${category} Shops | ShopSetu`;
        }
        // Case 2: Shop Profile (/:city/:category/:slug)
        else if (pathParts.length >= 3) {
          const shopSlug = pathParts[2];
          const shop = await getShopBySlug(shopSlug);
          if (shop) {
            setData(shop);
            setView("shop");
            document.title = `${shop.name} - ${shop.category} in ${shop.city} | ShopSetu`;
          } else {
            setView("404");
          }
        } else {
          setView("404");
        }
      } catch (error) {
        console.error("Router Error:", error);
        if (error.message?.includes("index")) {
          setErrorMsg(
            "Missing Database Index. Please click the index link provided in the instructions.",
          );
        } else {
          setErrorMsg("An unexpected error occurred while loading this page.");
        }
        setView("error");
      }

      setLoading(false);
    };

    route();
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <ShopSkeleton />
        </div>
      </div>
    );
  }

  // --- SHOP VIEW ---
  if (view === "shop" && data) {
    const shop = data;
    const whatsappUrl = `https://wa.me/91${shop.phone}?text=Hi%20I%20found%20${shop.name}%20on%20ShopSetu`;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    // Theming Logic
    const themeStyles = {
      "--primary-color": shop.primaryColor || "#E94E1B",
      "--secondary-color": shop.secondaryColor || "#0F172A",
      "--shop-font": shop.fontFamily || "Outfit",
    };

    return (
      <div
        className="bg-cream min-h-screen pb-20 transition-all duration-500"
        style={themeStyles}
      >
        {/* Inject Google Fonts dynamically */}
        {shop.fontFamily && (
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @import url('https://fonts.googleapis.com/css2?family=${shop.fontFamily.replace(/ /g, "+")}:wght@400;700;900&display=swap');
            .shop-name { font-family: '${shop.fontFamily}', sans-serif !important; }
            .theme-text-primary { color: var(--primary-color) !important; }
            .theme-bg-primary { background-color: var(--primary-color) !important; }
            .theme-border-primary { border-color: var(--primary-color) !important; }
            .theme-text-secondary { color: var(--secondary-color) !important; }
            .theme-bg-secondary { background-color: var(--secondary-color) !important; }
          `,
            }}
          />
        )}

        <div className="shop-container">
          <ShopHeader
            name={shop.name}
            phone={shop.phone}
            primaryColor={shop.primaryColor}
            shareUrl={shareUrl}
            logo={shop.logo}
          />

          <main className="max-w-4xl mx-auto px-4 py-8">
            {/* Brand Highlight Strip */}
            <div className="flex flex-wrap items-center gap-4 mb-8 bg-white p-4 rounded-3xl border border-cream shadow-sm">
              <div className="flex items-center gap-1 theme-bg-primary text-white px-3 py-1 rounded-full text-sm font-black tracking-tighter shadow-sm">
                <Star size={16} fill="currentColor" />{" "}
                {shop.avgRating || shop.rating || "5.0"}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                {shop.totalRatings || 1} Reviews
              </div>
              <div className="h-4 w-[1px] bg-cream"></div>
              <div className="text-[10px] font-black theme-text-primary font-black uppercase tracking-widest">
                Verified Local Business
              </div>
              <div className="flex-1"></div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="text-navy/40 hover:theme-text-primary transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <QrCode size={18} /> QR
                </button>
              </div>
            </div>

            <ShopAbout
              description={shop.description}
              area={shop.area}
              city={shop.city}
              category={shop.category}
            />
            <ShopMenu menu={shop.menu} />

            {/* Live Rating Component */}
            <RatingSection shop={shop} />

            <ShopGallery images={shop.gallery} />
            <ShopMap
              area={shop.area}
              city={shop.city}
              mapEmbed={shop.mapEmbed}
            />
            <ShopContact
              name={shop.name}
              phone={shop.phone}
              area={shop.area}
              city={shop.city}
            />
          </main>
        </div>

        {showQRModal && (
          <QRModal
            shop={shop}
            shareUrl={shareUrl}
            onClose={() => setShowQRModal(false)}
          />
        )}

        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="theme-bg-primary text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all"
          >
            <MessageSquare size={28} />
          </a>
        </div>
      </div>
    );
  }

  // --- CATEGORY VIEW ---
  if (view === "category" && data) {
    const { category, shops } = data;
    return (
      <div className="bg-cream min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-black text-navy mb-8">
            Local {category} Shops
          </h1>
          {shops.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500 mb-8">
                No approved shops found in this category yet.
              </p>
              <Link href="/create">
                <Button>Be the first!</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/${shop.city}/${shop.category}/${shop.slug}`}
                >
                  <Card className="h-full flex flex-col justify-between group border-2 hover:border-primary transition-all duration-300">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        {shop.logo ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary/20 flex-shrink-0">
                            <img
                              src={shop.logo}
                              alt={shop.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xl flex-shrink-0">
                            {shop.name.charAt(0)}
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-navy truncate group-hover:text-primary transition-colors">
                          {shop.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {shop.description}
                      </p>
                      <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase">
                        <MapPin size={14} /> {shop.area}, {shop.city}
                      </div>
                    </div>
                    <div className="mt-6 flex items-center text-primary font-bold text-sm">
                      Visit Shop{" "}
                      <ArrowRight
                        size={16}
                        className="ml-1 group-hover:ml-2 transition-all"
                      />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- ERROR VIEW ---
  if (view === "error") {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-navy mb-4">
            Database Connection Error
          </h1>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
            {errorMsg}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // 404 View
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <Navbar />
      <div className="text-center mt-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-4xl font-black text-navy mb-4 uppercase tracking-tighter">
          404 - Not Found
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We couldn't find the shop or category you're looking for.
        </p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

// --- SUB-COMPONENTS ---

function QRModal({ shop, shareUrl, onClose }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareUrl)}`;
  const downloadQr = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${shop.slug}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback
      window.open(qrUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 text-center bg-cream/10 border-b border-cream">
          {shop.logo && (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-16 h-16 rounded-2xl mx-auto mb-4 border-2 border-primary object-cover shadow-sm"
            />
          )}
          <h2 className="text-2xl font-black text-navy uppercase tracking-tighter">
            {shop.name}
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {shop.area}, {shop.city}
          </p>
        </div>

        <div className="p-10 flex flex-col items-center">
          <div className="bg-white p-4 rounded-3xl border-4 border-primary/10 shadow-inner mb-8">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
          </div>

          <div className="grid grid-cols-1 gap-3 w-full">
            <Button
              onClick={downloadQr}
              className="w-full py-4 text-sm uppercase tracking-widest font-black shadow-xl shadow-primary/20"
            >
              Download QR Code
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-navy transition-colors py-2"
            >
              Close Discovery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingSection({ shop }) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (val) => {
    if (submitted || submitting) return;
    setSubmitting(true);
    setUserRating(val);

    const res = await submitShopRating(shop.id, val);
    if (res.success) {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <Card className="mb-12 p-6 md:p-10 rounded-[32px] border-cream bg-white shadow-xl shadow-cream/20 text-center">
      <h3 className="text-xl md:text-2xl font-black text-navy uppercase tracking-tighter mb-2">
        Rate your experience
      </h3>
      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-6 italic">
        Support this local shop
      </p>

      {submitted ? (
        <div className="animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-whatsapp/10 text-whatsapp rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={32} fill="currentColor" />
          </div>
          <p className="text-navy font-black text-lg">Thank you for rating!</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRate(star)}
                disabled={submitting}
                className="transition-transform active:scale-90 disabled:opacity-50"
              >
                <Star
                  size={42}
                  className={
                    star <= (hoverRating || userRating)
                      ? "theme-text-primary"
                      : "text-gray-100"
                  }
                  fill={
                    star <= (hoverRating || userRating)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            ))}
          </div>
          {submitting && (
            <p className="text-[10px] theme-text-primary font-black animate-pulse uppercase tracking-widest">
              Submitting feedback...
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
