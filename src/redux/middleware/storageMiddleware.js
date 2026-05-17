import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { addItem, removeItem, clearCart } from "../slices/cartSlice";
import { updateDraft, clearDraft } from "../slices/formDraftSlice";

export const storageMiddleware = createListenerMiddleware();

// Listener for Cart Persistence
storageMiddleware.startListening({
  matcher: isAnyOf(addItem, removeItem, clearCart),
  effect: (action, listenerApi) => {
    const state = listenerApi.getState().cart;
    if (state.activeShopId && typeof window !== "undefined") {
      localStorage.setItem(
        `inquiry_cart_${state.activeShopId}`,
        JSON.stringify(state.items)
      );
    }
  },
});

// Listener for Shop Form Draft Persistence
storageMiddleware.startListening({
  matcher: isAnyOf(updateDraft, clearDraft),
  effect: (action, listenerApi) => {
    const state = listenerApi.getState().formDraft;
    if (typeof window !== "undefined") {
      if (action.type === clearDraft.type) {
        localStorage.removeItem("shop_form_draft");
      } else if (state.formData.name) {
        localStorage.setItem("shop_form_draft", JSON.stringify(state.formData));
      }
    }
  },
});
