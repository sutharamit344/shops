"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { setUser, setFavorites } from "@/redux/slices/authSlice";

export default function AuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }));

        // Fetch favorites
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            dispatch(setFavorites(userDoc.data().favorites || []));
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
      } else {
        dispatch(setUser(null));
        dispatch(setFavorites([]));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}
