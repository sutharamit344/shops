import { createAsyncThunk } from "@reduxjs/toolkit";
import { slugify } from "../../lib/urlArchitect";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

export const fetchSearchResults = createAsyncThunk(
  "search/fetchResults",
  async ({ category, location, type, clusterType, city, area }, { getState }) => {
    const { userCoords, userLocationName } = getState().search;
    const { sortBy, tags } = getState().filters;
    
    // Fetch from API routes
    const [shopsRes, clustersRes] = await Promise.all([
      fetch("/api/shops"),
      fetch("/api/clusters"),
    ]);

    if (!shopsRes.ok || !clustersRes.ok) {
      throw new Error("Failed to fetch search data from API");
    }

    const [allShops, allClusters] = await Promise.all([
      shopsRes.json(),
      clustersRes.json(),
    ]);

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

    // Genius Route Detection: Cross-reference parameters with DB vocabulary
    const allCityNames = Array.from(new Set(allShops.map(s => s.city))).filter(Boolean);
    const allAreaNames = Array.from(new Set(allShops.map(s => s.area))).filter(Boolean);
    const allCatNames = getState().categories.items.map(c => c.name);

    let finalCity = city || "";
    let finalArea = area || "";
    let finalCategory = category || "";
    let finalClusterType = clusterType || "";

    const param1 = (city || "").toLowerCase().trim();
    const param2 = (area || "").toLowerCase().trim();
    const param3 = (category || "").toLowerCase().trim();

    // Re-resolve parameters if they seem misplaced
    if (param1 && !allCityNames.some(c => slugify(c) === param1)) {
        // Param1 might be an area or category
        if (allAreaNames.some(a => slugify(a) === param1)) {
            finalArea = allAreaNames.find(a => slugify(a) === param1);
            finalCity = allShops.find(s => s.area === finalArea)?.city || "";
        } else if (allCatNames.some(c => slugify(c) === param1)) {
            finalCategory = allCatNames.find(c => slugify(c) === param1);
            finalCity = ""; 
        }
    }

    if (param2 && !finalClusterType) {
        // 1. Check if it's a cluster
        const clusterMatch = allClusters.find(c => normalize(c.name) === normalize(param2));
        if (clusterMatch) {
            finalClusterType = clusterMatch.name;
            if (!finalCity) finalCity = clusterMatch.city;
            if (!finalArea) finalArea = clusterMatch.area;
        } 
        // 2. Check if it's actually a category (Case: /[city]/[category])
        else if (allCatNames.some(c => slugify(c) === param2)) {
            finalCategory = allCatNames.find(c => slugify(c) === param2);
            finalArea = ""; // It's not an area, it's a category
        }
    }

    const normalizedQueryCat = normalize(finalCategory || "");
    const normalizedCluster = normalize(finalClusterType || "");

    // Prepare normalized target location
    const targetCity = (city || "").toLowerCase().trim();
    let targetArea = (finalArea || "").toLowerCase().trim();
    const locationStr = (location || "").toLowerCase().trim();

    // If no area in URL, check if we have a detected area name
    if (!targetArea && userLocationName) {
      const parts = userLocationName.split(",");
      if (parts.length > 0) {
        const detectedArea = parts[0].trim().toLowerCase();
        // Only use detected area if it's not the same as city
        if (detectedArea !== targetCity) {
          targetArea = detectedArea;
        }
      }
    }

    const performFilter = (targetType, targetCityVal, targetAreaVal, targetCatVal, targetClusterVal, radius = null) => {
      const nCat = normalize(targetCatVal || "");
      const nCluster = normalize(targetClusterVal || "");
      const tCity = (targetCityVal || "").toLowerCase().trim();
      const tArea = (targetAreaVal || "").toLowerCase().trim();

      return allShops.filter((shop) => {
        const shopCat = normalize(shop.category || "");
        const shopCluster = normalize(shop.clusterType || "");
        const sCity = (shop.city || "").toLowerCase().trim();
        const sArea = (shop.area || "").toLowerCase().trim();

        // 1. Category/Cluster Match
        let matchCategory = false;
        const isFuzzyMatch = (s1, s2) => {
          if (!s1 || !s2) return false;
          if (s1 === s2 || s1.includes(s2) || s2.includes(s1)) return true;
          if (s1.length > 3 && s2.length > 3) return getLevenshteinDistance(s1, s2) <= 2;
          return false;
        };

        if (nCluster && nCat) {
          matchCategory = isFuzzyMatch(shopCluster, nCluster) || isFuzzyMatch(shopCat, nCat);
        } else if (nCluster) {
          matchCategory = isFuzzyMatch(shopCluster, nCluster) || isFuzzyMatch(shopCat, nCluster);
        } else if (nCat) {
          matchCategory = isFuzzyMatch(shopCat, nCat) || isFuzzyMatch(shopCluster, nCat);
        } else {
          matchCategory = true;
        }

        // 2. Location Match
        let matchLocation = true;
        const isClusterMatch = nCluster && isFuzzyMatch(shopCluster, nCluster);

        if (isClusterMatch) {
          matchLocation = true;
        } else if (radius && userCoords?.lat && shop.lat) {
          const dist = getDistance(userCoords.lat, userCoords.lng, shop.lat, shop.lng);
          matchLocation = dist <= radius;
        } else if (targetAreaVal) {
          matchLocation = (sArea === tArea || sArea.includes(tArea) || tArea.includes(sArea)) && 
                          (sCity === tCity || sCity.includes(tCity));
        } else if (targetCityVal) {
          matchLocation = sCity === tCity || sCity.includes(tCity) || tCity.includes(sCity) || 
                          sArea === tCity || sArea.includes(tCity) || tCity.includes(sArea);
        }

        const isMatch = matchCategory && matchLocation;
        if (isMatch) {
          shop.isClusterMatch = isClusterMatch;
          shop.isLocationMatch = targetAreaVal && (sArea === tArea || sArea.includes(tArea));
          shop.isCityMatch = targetCityVal && (sCity === tCity || sCity.includes(tCity));
        }
        return isMatch;
      });
    };

    let filtered = performFilter(type, finalCity, finalArea, finalCategory, finalClusterType);

    // Genius Fallback Strategy
    if (filtered.length === 0) {
      console.log("No exact results found. Initiating genius fallbacks...");
      
      // Fallback 1: Broaden Area -> City
      if (finalArea) {
        filtered = performFilter(type, finalCity, "", finalCategory, finalClusterType);
        if (filtered.length > 0) filtered.fallbackType = "broadened_to_city";
      }

      // Fallback 2: Broaden City -> Nearby (within 50km)
      if (filtered.length === 0 && userCoords?.lat) {
        filtered = performFilter(type, "", "", finalCategory, finalClusterType, 50);
        if (filtered.length > 0) filtered.fallbackType = "nearby";
      }

      // Fallback 3: Related Categories/Clusters in same area
      if (filtered.length === 0) {
        filtered = performFilter(type, finalCity, finalArea, "", "");
        if (filtered.length > 0) filtered.fallbackType = "related";
      }
    }

    filtered.sort((a, b) => {
      // Sort priority: Exact location > Rating > Distance
      if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);
      
      if (userCoords?.lat && userCoords?.lng) {
        const distA = a.lat && a.lng ? getDistance(userCoords.lat, userCoords.lng, a.lat, a.lng) : Infinity;
        const distB = b.lat && b.lng ? getDistance(userCoords.lat, userCoords.lng, b.lat, b.lng) : Infinity;
        if (Math.abs(distA - distB) > 0.1) return distA - distB;
      }

      return (b.avgRating || 0) - (a.avgRating || 0);
    });

    return {
      shops: filtered,
      correctedParsed: {
        city: finalCity,
        area: finalArea,
        category: finalCategory,
        clusterType: finalClusterType
      }
    };
  }
);
