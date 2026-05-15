import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMasterLocations = createAsyncThunk(
  "search/fetchMasterLocations",
  async () => {
    const res = await fetch("/api/locations");
    if (!res.ok) throw new Error("Failed to fetch locations");
    return res.json();
  }
);
