/**
 * migrateClusterLocations.js — Admin Utility Script
 *
 * PURPOSE: Backfills cluster Firestore documents with location metadata
 * (area, city, pincode, lat, lng) derived from the shops assigned to each cluster.
 *
 * This fixes the root cause of inflated cluster shop counts — clusters lacked 
 * location context so their counts were city-wide instead of area-specific.
 *
 * USAGE:
 *   import { migrateClusterLocations } from "@/lib/migrateClusterLocations";
 *   await migrateClusterLocations();
 */

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function migrateClusterLocations(onProgress = null) {
  const results = { updated: 0, skipped: 0, total: 0 };

  // 1. Load all shops and cluster documents
  const [shopsSnap, clustersSnap] = await Promise.all([
    getDocs(collection(db, "shops")),
    getDocs(collection(db, "clusters")),
  ]);

  const allShops = shopsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const allClusters = clustersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  results.total = allClusters.length;
  console.log(`[ClusterMigration] Found ${allClusters.length} clusters, ${allShops.length} shops.`);

  for (const cluster of allClusters) {
    // Find all shops belonging to this cluster
    const clusterShops = allShops.filter(
      (s) => (s.clusterType || "").toLowerCase().trim() === (cluster.name || "").toLowerCase().trim()
    );

    if (clusterShops.length === 0) {
      results.skipped++;
      console.warn(`[Skipped] "${cluster.name}" — no shops assigned`);
      continue;
    }

    // Group by area+city to find the dominant location
    const locationGroups = {};
    clusterShops.forEach((shop) => {
      const key = `${shop.area || ""}|||${shop.city || ""}`;
      if (!locationGroups[key]) {
        locationGroups[key] = {
          area: shop.area || "",
          city: shop.city || "",
          pincode: shop.pincode || "",
          lat: shop.lat || null,
          lng: shop.lng || null,
          count: 0,
        };
      }
      locationGroups[key].count++;
      // Prefer location entry that has coordinates
      if (!locationGroups[key].lat && shop.lat) {
        locationGroups[key].lat = shop.lat;
        locationGroups[key].lng = shop.lng;
      }
    });

    // Pick the location group with the most shops
    const dominantLocation = Object.values(locationGroups).sort((a, b) => b.count - a.count)[0];

    const updatePayload = {
      area: dominantLocation.area,
      city: dominantLocation.city,
      pincode: dominantLocation.pincode,
      shopCount: clusterShops.length,
    };

    if (dominantLocation.lat) {
      updatePayload.lat = dominantLocation.lat;
      updatePayload.lng = dominantLocation.lng;
    }

    try {
      await updateDoc(doc(db, "clusters", cluster.id), updatePayload);
      results.updated++;
      console.log(`[✓] "${cluster.name}" → ${dominantLocation.area}, ${dominantLocation.city} (${clusterShops.length} shops)`);
      if (onProgress) onProgress({ type: "success", cluster: cluster.name, location: dominantLocation, count: clusterShops.length });
    } catch (err) {
      console.error(`[Error] "${cluster.name}":`, err);
      if (onProgress) onProgress({ type: "error", cluster: cluster.name, error: err.message });
    }
  }

  console.log("[ClusterMigration] Done!", results);
  if (onProgress) onProgress({ type: "done", results });
  return results;
}
