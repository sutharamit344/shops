import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { setError, setLoading } from "../slices/authSlice";

export const loginWithGoogle = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login failed:", error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const logout = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};
