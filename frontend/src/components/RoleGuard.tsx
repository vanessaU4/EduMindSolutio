import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'guide' | 'admin')[];
  requireAdmin?: boolean;
  requireGuide?: boolean;
  requireModeration?: boolean;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requireAdmin = false,
  requireGuide = false,
  requireModeration = false,
  fallback,
}) => {
  const { user, isAdmin, isGuide, canModerate } = useAuth();

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <ShieldAlert className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You don't have permission to access this feature. Admin access required.
        </AlertDescription>
      </Alert>
    );
  }

  // Admins have access to everything - bypass all other checks
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check guide requirement
  if (requireGuide && !isGuide) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <ShieldAlert className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You don't have permission to access this feature. Guide access required.
        </AlertDescription>
      </Alert>
    );
  }

  // Check moderation requirement
  if (requireModeration && !canModerate) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <ShieldAlert className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You don't have permission to access this feature. Moderator access required.
        </AlertDescription>
      </Alert>
    );
  }

  // Check allowed roles
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <ShieldAlert className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You don't have permission to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
