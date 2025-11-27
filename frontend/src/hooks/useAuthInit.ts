import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { loadUserFromStorage } from '@/features/auth/authSlice';
import { authService } from '@/services/authService';

/**
 * Hook to initialize authentication state on app startup
 * Ensures Redux state is synchronized with localStorage before components mount
 */
export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Load user from storage first
        dispatch(loadUserFromStorage());
        
        // If we have tokens, verify they're still valid
        const token = authService.getAccessToken();
        if (token) {
          try {
            // Try to get current user to verify token validity
            await authService.getCurrentUser();
          } catch (error) {
            // Token is invalid, logout user
            console.warn('Token validation failed, logging out user');
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  return {
    isInitialized,
    isAuthenticated,
    loading
  };
};

export default useAuthInit;
