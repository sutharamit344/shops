import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // Array of { name, price, quantity, image, category, description }
  isOpen: false,
  isHydrated: false,
  activeShopId: null,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state, action) => {
      const { shopId, items } = action.payload;
      state.activeShopId = shopId;
      state.items = items || [];
      state.isHydrated = true;
    },
    addItem: (state, action) => {
      const { item, quantity, shopId } = action.payload;
      // If adding items from a different shop, reset the cart to scope to the new shop
      if (state.activeShopId !== shopId) {
        state.activeShopId = shopId;
        state.items = [];
      }
      const existing = state.items.find((i) => i.name === item.name);
      if (existing) {
        existing.quantity = quantity;
      } else {
        state.items.push({ ...item, quantity });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.name !== action.payload.name);
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleCart: (state, action) => {
      state.isOpen = action.payload ?? !state.isOpen;
    },
  },
});

export const { hydrateCart, addItem, removeItem, clearCart, toggleCart } = cartSlice.actions;
export default cartSlice.reducer;
