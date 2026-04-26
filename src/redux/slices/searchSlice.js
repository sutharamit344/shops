import { createSlice } from "@reduxjs/toolkit";
import { fetchSearchResults } from "../thunks/searchThunks";

const initialState = {
  query: "",
  parsed: {
    category: "",
    location: "",
    type: "all",
    cityFallback: ""
  },
  results: [],
  suggestions: [],
  recentSearches: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setParsed: (state, action) => {
      state.parsed = { ...state.parsed, ...action.payload };
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    addRecentSearch: (state, action) => {
      if (!state.recentSearches.includes(action.payload)) {
        state.recentSearches = [action.payload, ...state.recentSearches.slice(0, 4)];
      }
    },
    clearSearch: (state) => {
      state.query = "";
      state.results = [];
      state.suggestions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setQuery, setParsed, setSuggestions, addRecentSearch, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
