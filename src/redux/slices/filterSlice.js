import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: "",
  state: "",
  city: "",
  category: "",
  area: "",
  nearby: false,
  sortBy: "relevance", // relevance, distance, rating
  tags: {
    openNow: false,
    verified: false,
  }
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearch: (state, action) => { state.search = action.payload; },
    setState: (state, action) => { state.state = action.payload; },
    setCity: (state, action) => { state.city = action.payload; },
    setCategory: (state, action) => { state.category = action.payload; },
    setArea: (state, action) => { state.area = action.payload; },
    setNearby: (state, action) => { state.nearby = action.payload; },
    resetFilters: () => initialState,
    setAllFilters: (state, action) => {
      return { ...state, ...action.payload };
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    toggleTag: (state, action) => {
      const tagName = action.payload;
      state.tags[tagName] = !state.tags[tagName];
    },
  },
});

export const { 
  setSearch, setState, setCity, setCategory, setArea, setNearby, 
  resetFilters, setAllFilters, setSortBy, toggleTag 
} = filterSlice.actions;

export default filterSlice.reducer;
