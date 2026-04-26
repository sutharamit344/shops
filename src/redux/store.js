import { configureStore } from "@reduxjs/toolkit";
import shopReducer from "./slices/shopSlice";
import categoryReducer from "./slices/categorySlice";
import filterReducer from "./slices/filterSlice";
import authReducer from "./slices/authSlice";
import modalReducer from "./slices/modalSlice";
import searchReducer from "./slices/searchSlice";

export const store = configureStore({
  reducer: {
    shops: shopReducer,
    categories: categoryReducer,
    filters: filterReducer,
    auth: authReducer,
    modal: modalReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setUser", "modal/showModal"],
        ignoredPaths: ["auth.user", "modal.onConfirm", "modal.onCancel"],
      },
    }),
});
