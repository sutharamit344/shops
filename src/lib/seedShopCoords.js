/**
 * seedShopCoords.js — Admin Utility Script
 *
 * PURPOSE: Geocodes all shops in Firestore that are missing lat/lng coordinates.
 * Uses the free Nominatim API (OpenStreetMap).
 *
 * USAGE (run from browser console on the /admin page, or call from a button):
 *   import { seedShopCoords } from "@/lib/seedShopCoords";
 *   await seedShopCoords();
 *
 * RATE LIMIT: Nominatim requires 1 request/second. This script respects that.
 */

import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const geocodeAddress = async (shop) => {
  const parts = [];
  if (shop.area) parts.push(shop.area);
  if (shop.city) parts.push(shop.city);
  if (shop.pincode) parts.push(shop.pincode);
  parts.push("India");

  const addressString = parts.join(", ");
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&countrycodes=in`;

  const res = await fetch(url, {
    headers: { "User-Agent": "ShopBajar/1.0 (contact: sutharamit344@gmail.com)" },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (data && data[0]) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }

  return null;
};

export async function seedShopCoords(onProgress = null) {
  const results = { success: 0, failed: 0, skipped: 0, total: 0 };

  try {
    // Only fetch shops that are missing lat/lng
    const snap = await getDocs(
      query(collection(db, "shops"), where("status", "==", "approved"))
    );

    const shopsWithoutCoords = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((s) => !s.lat || !s.lng);

    results.total = shopsWithoutCoords.length;

    console.log(`[ShopBajar Geocoder] Found ${results.total} shops without coordinates.`);
    if (onProgress) onProgress({ type: "start", total: results.total });

    for (let i = 0; i < shopsWithoutCoords.length; i++) {
      const shop = shopsWithoutCoords[i];

      if (!shop.city) {
        results.skipped++;
        console.warn(`[Skipped] ${shop.name} — no city`);
        if (onProgress) onProgress({ type: "skip", shop: shop.name, i, total: results.total });
        continue;
      }

      try {
        const coords = await geocodeAddress(shop);

        if (coords) {
          await updateDoc(doc(db, "shops", shop.id), {
            lat: coords.lat,
            lng: coords.lng,
          });
          results.success++;
          console.log(`[✓] ${shop.name} → ${coords.lat}, ${coords.lng}`);
          if (onProgress) onProgress({ type: "success", shop: shop.name, coords, i, total: results.total });
        } else {
          results.failed++;
          console.warn(`[✗] ${shop.name} — no geocode result`);
          if (onProgress) onProgress({ type: "fail", shop: shop.name, i, total: results.total });
        }
      } catch (err) {
        results.failed++;
        console.error(`[Error] ${shop.name}:`, err.message);
        if (onProgress) onProgress({ type: "error", shop: shop.name, error: err.message, i, total: results.total });
      }

      // Respect Nominatim rate limit: 1 req/sec
      await sleep(1100);
    }

    console.log("[ShopBajar Geocoder] Done!", results);
    if (onProgress) onProgress({ type: "done", results });
    return results;
  } catch (err) {
    console.error("[ShopBajar Geocoder] Fatal error:", err);
    throw err;
  }
}
