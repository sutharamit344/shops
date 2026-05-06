import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchApprovedShops = createAsyncThunk(
  "shops/fetchApproved",
  async () => {
    const res = await fetch("/api/shops");
    if (!res.ok) throw new Error("Failed to fetch shops");
    return res.json();
  }
);
