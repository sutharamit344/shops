import { createSelector } from "@reduxjs/toolkit";

const selectFormDraftState = (state) => state.formDraft;

export const selectFormData = createSelector(
  [selectFormDraftState],
  (formDraft) => formDraft.formData
);

export const selectIsFormDraftHydrated = createSelector(
  [selectFormDraftState],
  (formDraft) => formDraft.isHydrated
);
