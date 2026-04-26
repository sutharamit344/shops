import { createSlice } from "@reduxjs/toolkit";
import { fetchCategories, fetchClusters } from "../thunks/categoryThunks";

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    clusters: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchClusters.fulfilled, (state, action) => {
        state.clusters = action.payload;
      });
  },
});

export default categorySlice.reducer;
