import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  title: "",
  message: "",
  type: "info", // info, success, error, confirm, prompt
  confirmText: "Confirm",
  cancelText: "Cancel",
  showInput: false,
  inputValue: "",
  // We can't store functions in Redux state easily (non-serializable).
  // Instead, we'll use a listener or a separate mechanism if needed,
  // or just pass a type that the ModalContainer handles.
  // However, for this refactor, we'll try to keep it simple.
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal: (state, action) => {
      return {
        ...initialState,
        ...action.payload,
        isOpen: true,
      };
    },
    closeModal: (state) => {
      state.isOpen = false;
    },
    setInputValue: (state, action) => {
      state.inputValue = action.payload;
    },
  },
});

export const { showModal, closeModal, setInputValue } = modalSlice.actions;
export default modalSlice.reducer;
