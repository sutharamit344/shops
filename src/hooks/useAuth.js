import { useSelector, useDispatch } from "react-redux";
import { loginWithGoogle, logout } from "@/redux/thunks/authThunks";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  return {
    user,
    loading,
    error,
    loginWithGoogle: () => dispatch(loginWithGoogle()),
    logout: () => dispatch(logout()),
  };
};
