import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApprovedShops } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export const fetchSearchResults = createAsyncThunk(
  "search/fetchResults",
  async ({ category, location, type }) => {
    const allShops = await getApprovedShops();
    
    return allShops.filter(shop => {
      const matchCategory = !category || 
        slugify(shop.category) === slugify(category) || 
        (shop.clusterType && slugify(shop.clusterType) === slugify(category));
      
      let matchLocation = true;
      if (location && location !== "current") {
        matchLocation = slugify(shop.city) === slugify(location) || slugify(shop.area) === slugify(location);
      }
      
      // For type "nearby", filtering is usually done by coordinates, 
      // but here we follow the fallback city rule or just show all if location not detected yet.
      
      return matchCategory && matchLocation;
    });
  }
);
