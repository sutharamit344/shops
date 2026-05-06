import { useDispatch } from 'react-redux';
import { showToast, hideToast } from '@/redux/slices/toastSlice';
import { useCallback } from 'react';

export const useToast = () => {
  const dispatch = useDispatch();

  const toast = useCallback((message, type = 'success') => {
    dispatch(showToast({ message, type }));
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      dispatch(hideToast());
    }, 4000);
  }, [dispatch]);

  const success = (msg) => toast(msg, 'success');
  const error = (msg) => toast(msg, 'error');
  const info = (msg) => toast(msg, 'info');

  return { success, error, info, toast };
};
