import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, hasCapability, hasRoleOrHigher, canAccessRoute } from '@/types/permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredCapabilities?: string[];
  requireAll?: boolean; // If true, user must have ALL capabilities, if false, ANY capability
  fallbackComponent?: React.ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles = [],
  requiredCapabilities = [],
  requireAll = false,
  fallbackComponent,
  redirectTo,
  showAccessDenied = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  const hasRoleAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role);
  
  // Check capability-based access
  let hasCapabilityAccess = true;
  if (requiredCapabilities.length > 0) {
    if (requireAll) {
      hasCapabilityAccess = requiredCapabilities.every(cap => hasCapability(user, cap));
    } else {
      hasCapabilityAccess = requiredCapabilities.some(cap => hasCapability(user, cap));
    }
  }

  const hasAccess = hasRoleAccess && hasCapabilityAccess;

  if (!hasAccess) {
    // If redirect path is specified, redirect there
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // If custom fallback component is provided, show it
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    // Show access denied message
    if (showAccessDenied) {
      return <AccessDeniedMessage user={user} requiredCapabilities={requiredCapabilities} />;
    }

    // Default: don't render anything
    return null;
  }

  return <>{children}</>;
};

interface AccessDeniedMessageProps {
  user: any;
  requiredCapabilities: string[];
}

const AccessDeniedMessage: React.FC<AccessDeniedMessageProps> = ({ user, requiredCapabilities }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-shenations-purple-50/20 flex items-center justify-center p-6">
      <div className="card-premium max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-neutral-800">Access Denied</h2>
          <p className="text-neutral-600">
            You don't have permission to access this resource.
          </p>
        </div>

        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Current Role:</strong> {user?.role || 'Unknown'}
            <br />
            {requiredCapabilities.length > 0 && (
              <>
                <strong>Required Capabilities:</strong> {requiredCapabilities.join(', ')}
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            className="btn-primary w-full"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          
          <Button 
            className="btn-secondary w-full"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        </div>

        <div className="text-sm text-neutral-500">
          If you believe this is an error, please contact your administrator.
        </div>
      </div>
    </div>
  );
};

// Capability Guard - for protecting specific features within components
interface CapabilityGuardProps {
  children: React.ReactNode;
  capability: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const CapabilityGuard: React.FC<CapabilityGuardProps> = ({
  children,
  capability,
  fallback,
  showFallback = false
}) => {
  const { user } = useAuth();

  if (!hasCapability(user, capability)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showFallback) {
      return (
        <div className="text-center py-4 text-neutral-500">
          <Shield className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Feature not available for your role</p>
        </div>
      );
    }
    
    return null;
  }

  return <>{children}</>;
};

// Multiple Capability Guard - for checking multiple capabilities
interface MultiCapabilityGuardProps {
  children: React.ReactNode;
  capabilities: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const MultiCapabilityGuard: React.FC<MultiCapabilityGuardProps> = ({
  children,
  capabilities,
  requireAll = false,
  fallback
}) => {
  const { user } = useAuth();

  let hasAccess = false;
  
  if (requireAll) {
    hasAccess = capabilities.every(cap => hasCapability(user, cap));
  } else {
    hasAccess = capabilities.some(cap => hasCapability(user, cap));
  }

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Role-specific component wrapper
interface RoleSpecificProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleSpecific: React.FC<RoleSpecificProps> = ({
  children,
  roles,
  fallback
}) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Admin only wrapper
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleSpecific roles={['admin']} fallback={fallback}>
      {children}
    </RoleSpecific>
  );
};

// Guide and Admin wrapper
export const GuideAndAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleSpecific roles={['guide', 'admin']} fallback={fallback}>
      {children}
    </RoleSpecific>
  );
};

// User only wrapper
export const UserOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleSpecific roles={['user']} fallback={fallback}>
      {children}
    </RoleSpecific>
  );
};
