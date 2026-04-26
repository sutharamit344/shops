import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApprovedShops } from "@/lib/db";

export const fetchApprovedShops = createAsyncThunk(
  "shops/fetchApproved",
  async () => {
    const shops = await getApprovedShops();
    return shops;
  }
);
