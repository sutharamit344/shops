import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getShopById,
  updateShop,
  getShopRatings,
  deleteShopRating,
} from "@/lib/db";

export const fetchMerchantShop = createAsyncThunk(
  "dashboard/fetchShop",
  async ({ shopId, userId }, { rejectWithValue }) => {
    try {
      const data = await getShopById(shopId);
      if (!data) {
        return rejectWithValue("Shop not found");
      }
      if (userId && data.ownerId !== userId) {
        return rejectWithValue("Unauthorized access to shop");
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMerchantShop = createAsyncThunk(
  "dashboard/updateShop",
  async ({ shopId, updateData }, { rejectWithValue }) => {
    try {
      const result = await updateShop(shopId, updateData);
      if (!result.success) {
        return rejectWithValue(result.error || "Failed to update shop");
      }
      return updateData; // Return the delta to merge into state
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMerchantReviews = createAsyncThunk(
  "dashboard/fetchReviews",
  async (shopId, { rejectWithValue }) => {
    try {
      const data = await getShopRatings(shopId);
      return data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMerchantReview = createAsyncThunk(
  "dashboard/deleteReview",
  async ({ shopId, reviewId }, { rejectWithValue }) => {
    try {
      const res = await deleteShopRating(shopId, reviewId);
      if (!res.success) {
        return rejectWithValue(res.error || "Failed to delete review");
      }
      // Fetch the updated shop to get the recalculated average rating
      const updatedShop = await getShopById(shopId);
      return { reviewId, updatedShop };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
