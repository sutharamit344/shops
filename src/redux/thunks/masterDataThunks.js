import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCategories,
  getClusters,
  getCountries,
  getStates,
  getCities,
  getAreas,
} from "@/lib/db";

export const fetchMasterDirectory = createAsyncThunk(
  "masterData/fetchDirectory",
  async (_, { getState, rejectWithValue }) => {
    const { masterData } = getState();
    // Avoid redundant network fetches if data is already cached
    if (
      masterData?.categories?.length > 0 &&
      masterData?.clusters?.length > 0 &&
      masterData?.countries?.length > 0
    ) {
      return { cached: true };
    }

    try {
      const [categories, clusters, countries, states, cities, areas] =
        await Promise.all([
          getCategories(),
          getClusters(),
          getCountries(),
          getStates(),
          getCities(),
          getAreas(),
        ]);

      return {
        categories,
        clusters,
        countries,
        states,
        cities,
        areas,
        cached: false,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
