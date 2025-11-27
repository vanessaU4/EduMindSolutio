import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

/**
 * Smart dashboard router that redirects users to their role-appropriate dashboard
 * This component handles the routing logic for authenticated users
 */
const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Check both Redux state and localStorage for authentication
  const storedUser = authService.getUser();
  const hasToken = !!authService.getAccessToken();
  const isAuthed = isAuthenticated || (!!storedUser && hasToken);
  const currentUser = user || storedUser;

  // If not authenticated, redirect to login
  if (!isAuthed || !currentUser) {
    console.log('DashboardRouter: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('DashboardRouter: Current user:', currentUser);
  console.log('DashboardRouter: User role:', currentUser.role);

  // Onboarding system removed - proceed directly to role-based routing

  // Route based on user role
  switch (currentUser.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'guide':
      return <Navigate to="/guide" replace />;
    case 'user':
      return <Navigate to="/dashboard" replace />;
    default:
      // Unknown role, redirect to home
      console.warn(`Unknown user role: ${currentUser.role}`);
      return <Navigate to="/" replace />;
  }
};

export default DashboardRouter;
