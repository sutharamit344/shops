import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  favorites: [],
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload || [];
    },
    toggleFavorite: (state, action) => {
      const shopId = action.payload;
      if (state.favorites.includes(shopId)) {
        state.favorites = state.favorites.filter(id => id !== shopId);
      } else {
        state.favorites.push(shopId);
      }
    },
  },
});

export const { setUser, setLoading, setError, setFavorites, toggleFavorite } = authSlice.actions;
export default authSlice.reducer;
