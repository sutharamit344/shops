import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApprovedShops, getClusters } from "@/lib/db";
import { slugify } from "@/lib/slugify";

const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // km
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

export const fetchSearchResults = createAsyncThunk(
  "search/fetchResults",
  async ({ category, location, type, clusterType }, { getState }) => {
    const { userCoords } = getState().search;
    const { sortBy, tags } = getState().filters;
    const [allShops, allClusters] = await Promise.all([
      getApprovedShops(),
      getClusters(),
    ]);

    // ... existing normalization code ...
    const normalize = (s) => {
      if (!s) return "";
      return slugify(s)
        .replace(/-/g, " ")
        .replace(/\band\b/g, "")
        .replace(/\bservices\b/g, "service")
        .replace(/\bshops\b/g, "shop")
        .replace(/\bshop\b/g, "")
        .replace(/\bservice\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    let finalClusterType = clusterType;
    let finalCategory = category;

    if (!finalClusterType && category) {
      const normalizedInputCat = normalize(category);
      const match = allClusters.find(
        (c) => normalize(c.name) === normalizedInputCat,
      );
      if (match) {
        finalClusterType = match.name;
        finalCategory = "";
      }
    }

    const normalizedQueryCat = normalize(finalCategory || "");
    const normalizedCluster = normalize(finalClusterType || "");

    const filtered = allShops.filter((shop) => {
      const shopCat = normalize(shop.category || "");
      const shopCluster = normalize(shop.clusterType || "");

      let matchCategory = false;

      if (normalizedCluster) {
        matchCategory = shopCluster === normalizedCluster;
      } else {
        matchCategory =
          !category ||
          shopCat === normalizedQueryCat ||
          shopCluster === normalizedQueryCat ||
          shopCat.includes(normalizedQueryCat) ||
          normalizedQueryCat.includes(shopCat);
      }

      let matchLocation = true;
      if (location) {
        let targetCity = location;
        if (location === "current") {
          // Strict: Only use local fallbacks if the user is explicitly in "Nearby" mode.
          if (type === "nearby") {
            if (userCoords && userCoords.lat && userCoords.lng) {
              targetCity = "";
            } else {
              targetCity =
                typeof window !== "undefined"
                  ? localStorage.getItem("last_city")
                  : "";
            }
          } else {
            targetCity = ""; // Ignore "current" if not in nearby mode
          }
        }

        if (targetCity && targetCity !== "current") {
          const normalizedLoc = slugify(targetCity);
          const locParts = targetCity.toLowerCase().split(/\s+/).map(slugify);

          if (locParts.length > 1) {
            const shopCitySlug = slugify(shop.city || "");
            const shopAreaSlug = slugify(shop.area || "");
            matchLocation = locParts.some(
              (part) =>
                (part.length > 2 &&
                  (shopCitySlug.includes(part) ||
                    shopAreaSlug.includes(part))) ||
                shopCitySlug === part ||
                shopAreaSlug === part,
            );
          } else {
            const shopCitySlug = slugify(shop.city || "");
            const shopAreaSlug = slugify(shop.area || "");
            matchLocation =
              shopCitySlug === normalizedLoc ||
              shopAreaSlug === normalizedLoc ||
              (normalizedLoc.length > 3 &&
                (shopCitySlug.includes(normalizedLoc) ||
                  shopAreaSlug.includes(normalizedLoc)));
          }
        }
      }

      // 3. Apply Tags
      let matchTags = true;
      if (tags.verified && !shop.isVerified) matchTags = false;

      if (tags.openNow) {
        try {
          const now = new Date();
          const day = now.toLocaleString("en-US", { weekday: "long" });
          const hours = shop.businessHours?.[day];
          if (hours && hours.open && hours.close && !hours.isClosed) {
            const [hOpen, mOpen] = hours.open.split(":").map(Number);
            const [hClose, mClose] = hours.close.split(":").map(Number);
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const openTime = hOpen * 60 + mOpen;
            const closeTime = hClose * 60 + mClose;

            if (closeTime < openTime) {
              // Overnight case
              if (!(currentTime >= openTime || currentTime <= closeTime))
                matchTags = false;
            } else {
              if (!(currentTime >= openTime && currentTime <= closeTime))
                matchTags = false;
            }
          } else {
            matchTags = false; // No hours defined or closed for the day
          }
        } catch (e) {
          console.error("Open check error", e);
        }
      }

      return matchCategory && matchLocation && matchTags;
    });

    // Sorting Logic
    return filtered.sort((a, b) => {
      // 1. Forced Sort by user preference
      if (sortBy === "rating") {
        return (b.avgRating || 0) - (a.avgRating || 0);
      }

      if (sortBy === "distance" && userCoords?.lat && userCoords?.lng) {
        const distA = getDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const distB = getDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return distA - distB;
      }

      // 2. Default Smart Sorting (Relevance + Distance + Rating)

      // Distance (if available)
      // Distance sorting (Only if explicitly requested or in nearby mode)
      if (
        (sortBy === "distance" || type === "nearby") &&
        userCoords &&
        userCoords.lat &&
        userCoords.lng &&
        a.lat &&
        a.lng &&
        b.lat &&
        b.lng
      ) {
        const distA = getDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const distB = getDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        if (Math.abs(distA - distB) > 0.5) return distA - distB;
      }

      // 2. Pincode Match (High Priority)
      const userPincode =
        typeof window !== "undefined"
          ? localStorage.getItem("last_pincode")
          : "";
      const aPinMatch = userPincode && a.pincode === userPincode;
      const bPinMatch = userPincode && b.pincode === userPincode;
      if (aPinMatch && !bPinMatch) return -1;
      if (!aPinMatch && bPinMatch) return 1;

      // 3. Exact Area Match
      let detectedCity =
        typeof window !== "undefined" ? localStorage.getItem("last_city") : "";
      let detectedArea =
        typeof window !== "undefined" ? localStorage.getItem("last_area") : "";
      let targetLoc =
        location && location !== "current" ? location : detectedCity;
      let targetArea = detectedArea || "";

      if (location && location !== "current" && location.includes(" ")) {
        const parts = location.toLowerCase().split(/\s+/);
        targetArea = parts[0];
        targetLoc = parts[parts.length - 1];
      }

      const normalizedLoc = targetLoc ? slugify(targetLoc) : "";
      const normalizedArea = targetArea ? slugify(targetArea) : "";

      const shopAArea = slugify(a.area || "");
      const shopBArea = slugify(b.area || "");
      const shopACity = slugify(a.city || "");
      const shopBCity = slugify(b.city || "");

      const aExactArea = normalizedArea && shopAArea === normalizedArea;
      const bExactArea = normalizedArea && shopBArea === normalizedArea;
      if (aExactArea && !bExactArea) return -1;
      if (!aExactArea && bExactArea) return 1;

      const aCityMatch = normalizedLoc && shopACity === normalizedLoc;
      const bCityMatch = normalizedLoc && shopBCity === normalizedLoc;
      if (aCityMatch && !bCityMatch) return -1;
      if (!aCityMatch && bCityMatch) return 1;

      const aCatMatch =
        normalizedQueryCat &&
        normalize(a.category || "") === normalizedQueryCat;
      const bCatMatch =
        normalizedQueryCat &&
        normalize(b.category || "") === normalizedQueryCat;
      if (aCatMatch && !bCatMatch) return -1;
      if (!aCatMatch && bCatMatch) return 1;

      return (b.avgRating || 0) - (a.avgRating || 0);
    });

    return filtered;
  },
);
