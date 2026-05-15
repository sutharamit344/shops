import { createAsyncThunk } from "@reduxjs/toolkit";
import { slugify } from "../../lib/urlArchitect";

// --- Utility: Haversine distance in km ---
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// --- Utility: Levenshtein distance ---
const getLevenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// --- Utility: Fuzzy string match (extracted outside filter loop for performance) ---
const isFuzzyMatch = (s1, s2) => {
  if (!s1 || !s2) return false;
  if (s1 === s2 || s1.includes(s2) || s2.includes(s1)) return true;
  // Only use Levenshtein for longer strings to avoid false positives
  if (s1.length > 5 && s2.length > 5) return getLevenshteinDistance(s1, s2) <= 1;
  return false;
};

export const fetchSearchResults = createAsyncThunk(
  "search/fetchResults",
  async ({ category, type, clusterType, city, area, detectedAreaName }, { getState }) => {
    const { userCoords } = getState().search;
    const { sortBy, tags } = getState().filters;
    const { items: stateShops } = getState().shops;
    const { items: stateClusters } = getState().clusters;

    let allShops = stateShops;
    let allClusters = stateClusters;

    // Only fetch if Redux state is empty
    if (allShops.length === 0 || allClusters.length === 0) {
      const [shopsRes, clustersRes] = await Promise.all([
        fetch("/api/shops"),
        fetch("/api/clusters"),
      ]);

      if (shopsRes.ok && clustersRes.ok) {
        const [fetchedShops, fetchedClusters] = await Promise.all([
          shopsRes.json(),
          clustersRes.json(),
        ]);
        allShops = allShops.length === 0 ? fetchedShops : allShops;
        allClusters = allClusters.length === 0 ? fetchedClusters : allClusters;
      }
    }

    if (!allShops || allShops.length === 0) {
      return { shops: [], correctedParsed: {} };
    }

    const normalize = (s) => {
      if (!s) return "";
      return slugify(s)
        .replace(/-/g, " ")
        .replace(/\band\b/g, "")
        .replace(/\bservices\b/g, "service")
        .replace(/\bshops\b/g, "shop")
        .replace(/\bshop\b/g, "")
        .replace(/\bservice\b/g, "")
        .replace(/\bnear me\b/g, "")
        .replace(/\bnearby\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Cross-reference parameters with DB vocabulary
    const allCityNames = Array.from(new Set([
      ...allShops.map(s => s.city),
      ...getState().search.cities.map(c => c.name)
    ])).filter(Boolean);

    const allAreaNames = Array.from(new Set([
      ...allShops.map(s => s.area),
      ...getState().search.areas.map(a => a.name)
    ])).filter(Boolean);

    const allCatNames = getState().categories.items.map(c => c.name);

    let finalCity = city || "";
    let finalArea = area || "";
    let finalCategory = category || "";
    let finalClusterType = clusterType || "";

    const param1 = (city || "").toLowerCase().trim();
    const param2 = (area || "").toLowerCase().trim();

    // Re-resolve param1 if it doesn't match a known city
    if (param1 && !allCityNames.some(c => slugify(c) === param1)) {
      if (allAreaNames.some(a => slugify(a) === param1)) {
        finalArea = allAreaNames.find(a => slugify(a) === param1);
        finalCity = allShops.find(s => s.area === finalArea)?.city || "";
      } else if (allCatNames.some(c => slugify(c) === param1)) {
        finalCategory = allCatNames.find(c => slugify(c) === param1);
        finalCity = "";
      }
    }

    // Re-resolve param2 as cluster or category if it is not an area
    if (param2 && !finalClusterType) {
      const clusterMatch = allClusters.find(c => normalize(c.name) === normalize(param2));
      if (clusterMatch) {
        finalClusterType = clusterMatch.name;
        if (!finalCity) finalCity = clusterMatch.city;
        if (!finalArea) finalArea = clusterMatch.area;
      } else if (allCatNames.some(c => slugify(c) === param2)) {
        finalCategory = allCatNames.find(c => slugify(c) === param2);
        finalArea = ""; // It's a category slug in the URL, not an area
      }
    }

    const nQueryCat = normalize(finalCategory || "");
    const nQueryCluster = normalize(finalClusterType || "");

    // Resolved target location
    const tCityFinal = (finalCity || "").toLowerCase().trim();
    let tAreaFinal = (finalArea || "").toLowerCase().trim();

    // FIX: Use detectedAreaName passed from DiscoveryClient (not userLocationName which is out of scope)
    if (!tAreaFinal && detectedAreaName) {
      const detectedArea = detectedAreaName.split(",")[0].trim().toLowerCase();
      if (detectedArea !== tCityFinal) {
        tAreaFinal = detectedArea;
      }
    }

    // --- Core Filter Function ---
    const performFilter = (targetCityVal, targetAreaVal, targetCatVal, targetClusterVal, radius = null) => {
      const nCat = normalize(targetCatVal || "");
      const nCluster = normalize(targetClusterVal || "");
      const tCity = (targetCityVal || "").toLowerCase().trim();
      const tArea = (targetAreaVal || "").toLowerCase().trim();

      return allShops
        .filter((shop) => {
          const shopCat = normalize(shop.category || "");
          const shopCluster = normalize(shop.clusterType || "");
          const sCity = (shop.city || "").toLowerCase().trim();
          const sArea = (shop.area || "").toLowerCase().trim();

          // 1. Category Match — strict: only check shop's own category field
          let matchCategory = false;
          if (nCluster && nCat) {
            matchCategory = isFuzzyMatch(shopCluster, nCluster) || isFuzzyMatch(shopCat, nCat);
          } else if (nCluster) {
            matchCategory = isFuzzyMatch(shopCluster, nCluster);
          } else if (nCat) {
            // STRICT: Do NOT check cluster name. A Fashion shop in an Electronics Hub is still Fashion.
            matchCategory = isFuzzyMatch(shopCat, nCat);
          } else {
            matchCategory = true;
          }

          // 2. Tag Filters
          let matchTags = true;
          if (tags?.whatsapp && !shop.whatsapp) matchTags = false;
          if (tags?.verified && !shop.isVerified) matchTags = false;
          if (tags?.featured && !shop.isFeatured) matchTags = false;

          // 3. Location Match
          let matchLocation = true;
          const isClusterMatch = nCluster && isFuzzyMatch(shopCluster, nCluster);

          if (isClusterMatch) {
            matchLocation = true; // Cluster match overrides location gating
          } else if (radius && userCoords?.lat && shop.lat) {
            const dist = getDistance(userCoords.lat, userCoords.lng, shop.lat, shop.lng);
            matchLocation = dist <= radius;
          } else if (tArea) {
            // Match area AND city strictly
            matchLocation =
              (sArea === tArea || sArea.includes(tArea) || tArea.includes(sArea)) &&
              (sCity === tCity || sCity.includes(tCity));
          } else if (tCity) {
            // FIX: Only match city against city — removed sArea === tCity comparison
            matchLocation = sCity === tCity || sCity.includes(tCity) || tCity.includes(sCity);
          }

          return matchCategory && matchLocation && matchTags;
        })
        // FIX: Clone shop objects instead of mutating Redux state directly
        .map(shop => {
          const sArea = (shop.area || "").toLowerCase().trim();
          const sCity = (shop.city || "").toLowerCase().trim();
          const isClusterMatch = nCluster && isFuzzyMatch(normalize(shop.clusterType || ""), nCluster);
          return {
            ...shop,
            isClusterMatch,
            isLocationMatch: tArea ? (sArea === tArea || sArea.includes(tArea)) : false,
            isCityMatch: tCity ? (sCity === tCity || sCity.includes(tCity)) : false,
          };
        });
    };

    let filtered = performFilter(tCityFinal, tAreaFinal, nQueryCat, nQueryCluster);

    // Fallback Strategy — always keep category strict
    if (filtered.length === 0) {
      // Fallback 1: Broaden Area -> entire City (keep category)
      if (tAreaFinal) {
        filtered = performFilter(tCityFinal, "", nQueryCat, nQueryCluster);
      }

      // Fallback 2: Broaden to nearby radius (keep category)
      if (filtered.length === 0 && userCoords?.lat) {
        filtered = performFilter("", "", nQueryCat, nQueryCluster, 50);
      }
    }

    // Sort: Exact Area > Distance > Rating
    filtered.sort((a, b) => {
      // 1. Prioritize exact area matches first
      if (tAreaFinal) {
        const aExact = (a.area || "").toLowerCase() === tAreaFinal;
        const bExact = (b.area || "").toLowerCase() === tAreaFinal;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
      }

      // 2. Explicit rating sort
      if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);

      // 3. Distance sort (if GPS coords available)
      if (userCoords?.lat && userCoords?.lng) {
        const distA = a.lat && a.lng ? getDistance(userCoords.lat, userCoords.lng, a.lat, a.lng) : Infinity;
        const distB = b.lat && b.lng ? getDistance(userCoords.lat, userCoords.lng, b.lat, b.lng) : Infinity;
        if (Math.abs(distA - distB) > 0.1) return distA - distB;
      }

      // 4. Default: Rating
      return (b.avgRating || 0) - (a.avgRating || 0);
    });

    return {
      shops: filtered,
      correctedParsed: {
        city: finalCity,
        area: finalArea,
        category: finalCategory,
        clusterType: finalClusterType,
      },
    };
  }
);
