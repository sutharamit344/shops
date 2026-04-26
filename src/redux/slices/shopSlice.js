import { createSlice } from "@reduxjs/toolkit";
import { fetchApprovedShops } from "../thunks/shopThunks";

const shopSlice = createSlice({
  name: "shops",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedShops.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchApprovedShops.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchApprovedShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default shopSlice.reducer;
