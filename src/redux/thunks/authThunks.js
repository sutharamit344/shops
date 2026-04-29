import { signInWithPopup, signOut } from "firebase/auth";
import { doc, updateDoc, arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { setError, setLoading, toggleFavorite } from "../slices/authSlice";

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

export const toggleFavoriteInDb = (shopId) => async (dispatch, getState) => {
  const { user, favorites } = getState().auth;
  if (!user) return;

  const isFavorited = favorites.includes(shopId);
  dispatch(toggleFavorite(shopId)); // Optimistic update

  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      favorites: isFavorited ? arrayRemove(shopId) : arrayUnion(shopId)
    }, { merge: true });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    dispatch(toggleFavorite(shopId)); // Rollback on error
  }
};
