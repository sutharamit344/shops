import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCategories } from "@/lib/db";

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async () => {
    const categories = await getCategories();
    return categories;
  }
);
