import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApprovedShops, getClusters } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export const fetchSearchResults = createAsyncThunk(
  "search/fetchResults",
  async ({ category, location, type, clusterType }) => {
    const [allShops, allClusters] = await Promise.all([
      getApprovedShops(),
      getClusters()
    ]);

    const normalize = (s) =>
      s
        .toLowerCase()
        .trim()
        .replace(/\bservices\b/g, "service")
        .replace(/\bshops\b/g, "shop")
        .replace(/\bshop\b/g, "")
        .replace(/\bservice\b/g, "")
        .trim();

    let finalClusterType = clusterType;
    let finalCategory = category;

    // Smart detection: If keyword matches a known cluster, prioritize cluster search
    if (!finalClusterType && category) {
      const match = allClusters.find(c => 
        c.name.toLowerCase().trim() === category.toLowerCase().trim()
      );
      if (match) {
        finalClusterType = match.name;
        finalCategory = ""; // Treat purely as cluster search
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
          targetCity = typeof window !== "undefined" ? localStorage.getItem("last_city") : "";
          if (!targetCity) return true;
        }

        const normalizedLoc = slugify(targetCity);
        const locParts = targetCity.toLowerCase().split(/\s+/).map(slugify);

        if (locParts.length > 1) {
          // Compound location (e.g., "Gota Ahmedabad")
          const shopCitySlug = slugify(shop.city || "");
          const shopAreaSlug = slugify(shop.area || "");
          matchLocation = locParts.some(part => 
            (part.length > 2 && (shopCitySlug.includes(part) || shopAreaSlug.includes(part))) ||
            shopCitySlug === part || shopAreaSlug === part
          );
        } else {
          const shopCitySlug = slugify(shop.city || "");
          const shopAreaSlug = slugify(shop.area || "");
          matchLocation =
            shopCitySlug === normalizedLoc ||
            shopAreaSlug === normalizedLoc ||
            (normalizedLoc.length > 3 && (shopCitySlug.includes(normalizedLoc) || shopAreaSlug.includes(normalizedLoc)));
        }
      }

      return matchCategory && matchLocation;
    });

    // Sorting Logic: Prioritize Area matches over City matches
    let detectedCity = typeof window !== "undefined" ? localStorage.getItem("last_city") : "";
    let detectedArea = typeof window !== "undefined" ? localStorage.getItem("last_area") : "";

    // Determine the sorting target
    let targetLoc = location && location !== "current" ? location : detectedCity;
    let targetArea = detectedArea || "";

    // If explicit location is searched (e.g., "Satellite Ahmedabad"), prioritize that area
    if (location && location !== "current" && location.includes(" ")) {
      const parts = location.toLowerCase().split(/\s+/);
      // Usually first part is area, last part is city
      targetArea = parts[0]; 
      targetLoc = parts[parts.length - 1];
    }

    if (targetLoc || targetArea) {
      const normalizedLoc = targetLoc ? slugify(targetLoc) : "";
      const normalizedArea = targetArea ? slugify(targetArea) : "";

      return filtered.sort((a, b) => {
        const shopAArea = slugify(a.area || "");
        const shopBArea = slugify(b.area || "");
        const shopACity = slugify(a.city || "");
        const shopBCity = slugify(b.city || "");

        // 1. Exact Area Match
        const aExactArea = normalizedArea && shopAArea === normalizedArea;
        const bExactArea = normalizedArea && shopBArea === normalizedArea;
        if (aExactArea && !bExactArea) return -1;
        if (!aExactArea && bExactArea) return 1;

        // 2. Partial Area Match (Fuzzy/Typo)
        const aPartialArea = normalizedArea && normalizedArea.length > 2 && shopAArea.includes(normalizedArea);
        const bPartialArea = normalizedArea && normalizedArea.length > 2 && shopBArea.includes(normalizedArea);
        if (aPartialArea && !bPartialArea) return -1;
        if (!aPartialArea && bPartialArea) return 1;

        // 3. City Match
        const aCityMatch = normalizedLoc && shopACity === normalizedLoc;
        const bCityMatch = normalizedLoc && shopBCity === normalizedLoc;
        if (aCityMatch && !bCityMatch) return -1;
        if (!aCityMatch && bCityMatch) return 1;

        // 4. Category match strength
        const aCatMatch = normalizedQueryCat && normalize(a.category || "") === normalizedQueryCat;
        const bCatMatch = normalizedQueryCat && normalize(b.category || "") === normalizedQueryCat;
        if (aCatMatch && !bCatMatch) return -1;
        if (!aCatMatch && bCatMatch) return 1;

        return (b.avgRating || 0) - (a.avgRating || 0);
      });
    }

    return filtered;
  }
);
