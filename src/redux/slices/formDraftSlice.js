import { createSlice } from "@reduxjs/toolkit";

const initialFormData = {
  name: "",
  category: "",
  city: "",
  state: "",
  country: "India",
  area: "",
  zone: "",
  phone: "",
  ownerEmail: "",
  description: "",
  mapEmbed: "",
  primaryColor: "#FF6A00",
  secondaryColor: "#0A0A0F",
  rating: "5.0",
  logo: "",
  businessType: "mixed",
  shopNo: "",
  building: "",
  village: "",
  socialLinks: [],
  coverImage: "",
  clusterType: "",
  pincode: "",
  lat: null,
  lng: null,
};

const initialState = {
  formData: initialFormData,
  isHydrated: false,
};

export const formDraftSlice = createSlice({
  name: "formDraft",
  initialState,
  reducers: {
    hydrateDraft: (state, action) => {
      state.formData = { ...initialFormData, ...action.payload };
      state.isHydrated = true;
    },
    updateDraft: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearDraft: (state) => {
      state.formData = initialFormData;
    },
  },
});

export const { hydrateDraft, updateDraft, clearDraft } = formDraftSlice.actions;
export default formDraftSlice.reducer;
