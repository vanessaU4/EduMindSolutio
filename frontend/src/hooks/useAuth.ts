import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.role === 'admin';
  const isGuide = user?.role === 'guide';
  const isUser = user?.role === 'user';
  const canModerate = user?.role === 'admin' || user?.role === 'guide';

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    isGuide,
    isUser,
    canModerate,
  };
};

export default useAuth;
