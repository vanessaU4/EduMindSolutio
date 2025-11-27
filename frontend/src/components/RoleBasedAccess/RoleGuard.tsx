import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: ('user' | 'guide' | 'admin')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

/**
 * RoleGuard component that conditionally renders content based on user role
 * Used throughout the application to enforce role-based access control
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
  showAccessDenied = false
}) => {
  const { user } = useAuth();

  // If user is not authenticated, don't render anything
  if (!user) {
    return fallback || null;
  }

  // Check if user's role is in the allowed roles
  const hasAccess = allowedRoles.includes(user.role as 'user' | 'guide' | 'admin');

  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Access Denied:</strong> You don't have permission to view this content.
            Required roles: {allowedRoles.join(', ')}
          </AlertDescription>
        </Alert>
      );
    }
    return fallback || null;
  }

  return <>{children}</>;
};

interface PermissionCheckProps {
  requiredRole: 'user' | 'guide' | 'admin';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionCheck component for minimum role requirements
 * Allows access if user has the required role or higher
 */
export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  requiredRole,
  children,
  fallback
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback || null;
  }

  const roleHierarchy = {
    user: 1,
    guide: 2,
    admin: 3
  };

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  const hasPermission = userLevel >= requiredLevel;

  return hasPermission ? <>{children}</> : (fallback || null);
};

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminOnly component - shorthand for admin-only content
 */
export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback }) => (
  <RoleGuard allowedRoles={['admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

interface GuideOrAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * GuideOrAdmin component - shorthand for guide/admin content
 */
export const GuideOrAdmin: React.FC<GuideOrAdminProps> = ({ children, fallback }) => (
  <RoleGuard allowedRoles={['guide', 'admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

interface UserOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * UserOnly component - shorthand for standard user content
 */
export const UserOnly: React.FC<UserOnlyProps> = ({ children, fallback }) => (
  <RoleGuard allowedRoles={['user']} fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Hook for checking user permissions in components
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: 'user' | 'guide' | 'admin') => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: ('user' | 'guide' | 'admin')[]) => {
    return user ? roles.includes(user.role as 'user' | 'guide' | 'admin') : false;
  };

  const hasMinimumRole = (minimumRole: 'user' | 'guide' | 'admin') => {
    if (!user) return false;

    const roleHierarchy = {
      user: 1,
      guide: 2,
      admin: 3
    };

    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[minimumRole];

    return userLevel >= requiredLevel;
  };

  const isUser = () => hasRole('user');
  const isGuide = () => hasRole('guide');
  const isAdmin = () => hasRole('admin');
  const isGuideOrAdmin = () => hasAnyRole(['guide', 'admin']);

  return {
    user,
    hasRole,
    hasAnyRole,
    hasMinimumRole,
    isUser,
    isGuide,
    isAdmin,
    isGuideOrAdmin
  };
};
