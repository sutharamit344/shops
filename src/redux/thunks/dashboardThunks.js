import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getShopById,
  updateShop,
  getShopRatings,
  deleteShopRating,
  getMasterFeatures,
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

export const fetchMasterFeatures = createAsyncThunk(
  "dashboard/fetchMasterFeatures",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMasterFeatures(false); // get active features
      return data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const purchaseMerchantFeature = createAsyncThunk(
  "dashboard/purchaseFeature",
  async ({ shopId, featureKey, billingCycle, price, trialDays, currentPaidFeatures = {} }, { rejectWithValue }) => {
    try {
      const now = new Date();
      let expiresAt = new Date();

      if (trialDays && trialDays > 0) {
        expiresAt.setDate(now.getDate() + trialDays);
      } else if (billingCycle === "monthly") {
        expiresAt.setMonth(now.getMonth() + 1);
      } else if (billingCycle === "annual") {
        expiresAt.setFullYear(now.getFullYear() + 1);
      } else {
        expiresAt.setFullYear(now.getFullYear() + 10); // one-time / lifetime
      }

      const featureRecord = {
        enabled: true,
        status: trialDays && trialDays > 0 ? "trial" : "active",
        billingCycle: billingCycle || "monthly",
        price: price || 0,
        activatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      const nextPaidFeatures = {
        ...currentPaidFeatures,
        [featureKey]: featureRecord,
      };

      const result = await updateShop(shopId, { paidFeatures: nextPaidFeatures });
      if (!result.success) {
        return rejectWithValue(result.error || "Failed to activate feature");
      }

      return { featureKey, featureRecord, nextPaidFeatures };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleMerchantFeature = createAsyncThunk(
  "dashboard/toggleFeature",
  async ({ shopId, featureKey, enabled, currentPaidFeatures = {} }, { rejectWithValue }) => {
    try {
      if (!currentPaidFeatures[featureKey]) {
        return rejectWithValue("Feature not purchased yet");
      }

      const featureRecord = {
        ...currentPaidFeatures[featureKey],
        enabled: !!enabled,
      };

      const nextPaidFeatures = {
        ...currentPaidFeatures,
        [featureKey]: featureRecord,
      };

      const result = await updateShop(shopId, { paidFeatures: nextPaidFeatures });
      if (!result.success) {
        return rejectWithValue(result.error || "Failed to toggle feature");
      }

      return { featureKey, featureRecord, nextPaidFeatures };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
