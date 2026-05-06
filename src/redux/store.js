import { configureStore } from "@reduxjs/toolkit";
import shopReducer from "./slices/shopSlice";
import categoryReducer from "./slices/categorySlice";
import filterReducer from "./slices/filterSlice";
import authReducer from "./slices/authSlice";
import modalReducer from "./slices/modalSlice";
import searchReducer from "./slices/searchSlice";
import toastReducer from "./slices/toastSlice";
import clusterReducer from "./slices/clusterSlice";

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setUser", "modal/showModal"],
        ignoredPaths: ["auth.user", "modal.onConfirm", "modal.onCancel"],
      },
    }),
});
