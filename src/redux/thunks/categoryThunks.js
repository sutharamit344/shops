import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async () => {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  }
);

export const fetchClusters = createAsyncThunk(
  "categories/fetchClusters",
  async () => {
    const res = await fetch("/api/clusters");
    if (!res.ok) throw new Error("Failed to fetch clusters");
    return res.json();
  }
);
