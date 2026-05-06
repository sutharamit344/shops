import { createAsyncThunk } from "@reduxjs/toolkit";
import { getClusters } from "@/lib/db";

export const fetchClusters = createAsyncThunk(
  "clusters/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getClusters();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
