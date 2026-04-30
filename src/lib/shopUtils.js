/**
 * shopUtils.js — Shared platform utilities
 * getBusinessStatus  → Open Now / Closed badge logic
 * incrementViews     → Atomic Firestore view counter (session-guarded)
 * getProfileCompletion → Onboarding checklist scores
 */

import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/**
 * Returns the current Open/Closed status of a shop based on its opening hours.
 * @param {object} shop - Shop object with openingHoursDetails & holidays
 * @returns {{ isOpen: boolean, label: string, colorClass: string, dotClass: string } | null}
 */
export function getBusinessStatus(shop) {
  if (!shop?.openingHoursDetails) return null;

  const now = new Date();
  const today = DAYS[now.getDay()];
  const todayStr = now.toISOString().split("T")[0]; // "2026-04-25"

  // Check holidays first
  if (shop.holidays?.some((h) => h.date === todayStr)) {
    return {
      isOpen: false,
      label: "Holiday Today",
      colorClass: "text-purple-500",
      dotClass: "bg-purple-500",
    };
  }

  const hours = shop.openingHoursDetails[today];
  if (!hours || hours.isClosed) {
    return {
      isOpen: false,
      label: "Closed Today",
      colorClass: "text-red-500",
      dotClass: "bg-red-400",
    };
  }

  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);

  const open = new Date(now);
  open.setHours(openH, openM, 0, 0);

  const close = new Date(now);
  close.setHours(closeH, closeM, 0, 0);

  if (now >= open && now <= close) {
    // Closing within 60 minutes — show "Closing Soon" with countdown
    const diffMs = close - now;
    const minutesLeft = Math.floor(diffMs / (60 * 1000));
    
    if (diffMs > 0 && diffMs <= 60 * 60 * 1000) {
      return {
        isOpen: true,
        label: minutesLeft <= 1 ? "Closing Now" : `Closing in ${minutesLeft}m`,
        closingInMinutes: minutesLeft,
        colorClass: "text-amber-500",
        dotClass: "bg-amber-400",
      };
    }
    return {
      isOpen: true,
      label: "Open Now",
      colorClass: "text-green-500",
      dotClass: "bg-green-400",
    };
  }

  // Show when it opens next
  if (now < open) {
    const h = String(openH).padStart(2, "0");
    const m = String(openM).padStart(2, "0");
    return {
      isOpen: false,
      label: `Opens at ${h}:${m}`,
      colorClass: "text-[#999]",
      dotClass: "bg-gray-300",
    };
  }

  return {
    isOpen: false,
    label: "Closed",
    colorClass: "text-red-500",
    dotClass: "bg-red-400",
  };
}

/**
 * Atomically increments the shop's view counter in Firestore.
 * Also writes a daily bucket (daily_views.YYYY_MM_DD) for trend analytics.
 * Uses sessionStorage to ensure only one increment per browser session per shop.
 * @param {string} shopId
 */
export async function incrementViews(shopId) {
  if (!shopId) return;

  const sessionKey = `viewed_${shopId}`;
  if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) return;

  try {
    const shopRef = doc(db, "shops", shopId);
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "_"); // e.g. 2026_04_30
    await updateDoc(shopRef, {
      views: increment(1),
      [`daily_views.${today}`]: increment(1),
    });
    if (typeof window !== "undefined") sessionStorage.setItem(sessionKey, "1");
  } catch {
    // Silently fail — view counter is non-critical
  }
}

/**
 * Extracts the last 7 days of view data from a shop's daily_views map.
 * Returns an array of { day: "Mon", views: 12, date: "2026_04_30" } objects.
 * @param {object} shop
 * @returns {Array<{ day: string, views: number, date: string }>}
 */
export function getWeeklyViewStats(shop) {
  const stats = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0].replace(/-/g, "_");
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    stats.push({ day, views: shop?.daily_views?.[key] || 0, date: key });
  }
  return stats;
}

/**
 * Atomically increments the shop's leads counter in Firestore.
 * A "lead" is any direct customer intent action: WhatsApp click, phone call.
 * @param {string} shopId
 */
export async function incrementLeads(shopId) {
  if (!shopId) return;
  try {
    const shopRef = doc(db, "shops", shopId);
    await updateDoc(shopRef, { leads: increment(1) });
  } catch {
    // Silently fail — lead counter is non-critical
  }
}

/**
 * Computes the profile completion percentage for the onboarding checklist.
 * @param {object} shop
 * @returns {{ score: number, items: Array<{ label: string, done: boolean, tab: string }> }}
 */
export function getProfileCompletion(shop) {
  if (!shop) return { score: 0, items: [] };

  const items = [
    {
      label: "Add a logo",
      done: !!shop.logo,
      tab: "settings",
      hint: "A logo builds instant brand recognition",
    },
    {
      label: "Write a description",
      done: !!(shop.description && shop.description.length > 20),
      tab: "settings",
      hint: "Tell customers what makes you special",
    },
    {
      label: "Add at least one catalog item",
      done: (shop.menu || []).some((cat) => (cat.items || []).length > 0),
      tab: "catalog",
      hint: "Shops with catalogs get 2.4× more enquiries",
    },
    {
      label: "Upload a gallery photo",
      done: (shop.gallery || []).length > 0,
      tab: "gallery",
      hint: "Photos build trust before a customer calls",
    },
    {
      label: "Set your opening hours",
      done: !!shop.openingHoursDetails,
      tab: "hours",
      hint: "Customers want to know when you're open",
    },
    {
      label: "Add your location details",
      done: !!(shop.city && shop.area),
      tab: "settings",
      hint: "Help nearby customers discover you",
    },
  ];

  const done = items.filter((i) => i.done).length;
  const score = Math.round((done / items.length) * 100);

  return { score, items };
}
