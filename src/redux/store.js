import { configureStore } from "@reduxjs/toolkit";
import shopReducer from "./slices/shopSlice";
import categoryReducer from "./slices/categorySlice";
import filterReducer from "./slices/filterSlice";
import authReducer from "./slices/authSlice";
import modalReducer from "./slices/modalSlice";
import searchReducer from "./slices/searchSlice";
import toastReducer from "./slices/toastSlice";
import clusterReducer from "./slices/clusterSlice";
import cartReducer from "./slices/cartSlice";
import formDraftReducer from "./slices/formDraftSlice";
import masterDataReducer from "./slices/masterDataSlice";
import dashboardReducer from "./slices/dashboardSlice";
import { storageMiddleware } from "./middleware/storageMiddleware";

export const store = configureStore({
  reducer: {
    shops: shopReducer,
    categories: categoryReducer,
    filters: filterReducer,
    auth: authReducer,
    modal: modalReducer,
    search: searchReducer,
    toast: toastReducer,
    clusters: clusterReducer,
    cart: cartReducer,
    formDraft: formDraftReducer,
    masterData: masterDataReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/setUser",
          "modal/showModal",
          "dashboard/fetchShop/fulfilled",
          "dashboard/updateShop/fulfilled",
          "dashboard/fetchReviews/fulfilled",
        ],
        ignoredPaths: [
          "auth.user",
          "modal.onConfirm",
          "modal.onCancel",
          "dashboard.shop",
          "dashboard.reviews",
        ],
      },
    }).prepend(storageMiddleware.middleware),
});

