import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCategories, getClusters } from "@/lib/db";

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async () => {
    const categories = await getCategories();
    return categories;
  }
);

export const fetchClusters = createAsyncThunk(
  "clusters/fetchAll",
  async () => {
    const clusters = await getClusters();
    return clusters;
  }
);
