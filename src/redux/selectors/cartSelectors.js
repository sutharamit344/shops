import { createSelector } from "@reduxjs/toolkit";

const selectCartState = (state) => state.cart;

export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart.items
);

export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.quantity, 0)
);

export const selectCartTotal = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce(
      (total, item) => total + parseFloat(item.price || 0) * item.quantity,
      0
    )
);

export const selectIsCartOpen = createSelector(
  [selectCartState],
  (cart) => cart.isOpen
);

export const selectActiveCartShopId = createSelector(
  [selectCartState],
  (cart) => cart.activeShopId
);

export const selectIsCartHydrated = createSelector(
  [selectCartState],
  (cart) => cart.isHydrated
);
