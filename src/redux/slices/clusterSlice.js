import { createSlice } from "@reduxjs/toolkit";
import { fetchClusters } from "../thunks/clusterThunks";

const clusterSlice = createSlice({
  name: "clusters",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setClusters: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClusters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClusters.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClusters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setClusters } = clusterSlice.actions;
export default clusterSlice.reducer;
