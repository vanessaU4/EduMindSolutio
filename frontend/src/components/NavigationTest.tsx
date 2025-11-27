import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';

/**
 * Navigation test component to verify page connections
 * Only visible in development mode
 */
const NavigationTest: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  const testRoutes = [
    { name: 'Home', path: '/', description: 'Landing page' },
    { name: 'Login', path: '/login', description: 'Login page' },
    { name: 'Register', path: '/register', description: 'Registration page' },
    { name: 'Dashboard Router', path: '/dashboard-router', description: 'Smart role-based router' },
    { name: 'User Dashboard', path: '/dashboard', description: 'User-specific dashboard' },
    { name: 'Guide Dashboard', path: '/guide', description: 'Guide-specific dashboard' },
    { name: 'Admin Dashboard', path: '/admin', description: 'Admin-specific dashboard' },
    { name: 'Assessments', path: '/assessments', description: 'Assessment center' },
    { name: 'Community', path: '/community', description: 'Community hub' },
    { name: 'Profile', path: '/profile', description: 'User profile' },
    { name: 'Settings', path: '/settings', description: 'User settings' },
  ];

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'guide': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTestLogin = async (role: 'admin' | 'guide' | 'user') => {
    const testCredentials = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      guide: { email: 'guide@example.com', password: 'guide123' },
      user: { email: 'test@example.com', password: 'testpass123' }
    };

    try {
      await authService.login(testCredentials[role]);
      window.location.reload(); // Refresh to update auth state
    } catch (error) {
      console.error(`Failed to login as ${role}:`, error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-yellow-400 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            🧪 Navigation Test
            <Badge variant="outline" className="text-xs">DEV</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current Status */}
          <div className="text-xs space-y-1">
            <div><strong>Current Path:</strong> {location.pathname}</div>
            <div><strong>Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}</div>
            {user && (
              <div className="flex items-center gap-2">
                <strong>Role:</strong> 
                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              </div>
            )}
            {user && (
              <div><strong>Onboarding:</strong> {user.onboarding_completed ? '✅' : '❌'}</div>
            )}
          </div>

          {/* Quick Login Buttons */}
          <div className="space-y-1">
            <div className="text-xs font-semibold">Quick Login:</div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => handleTestLogin('user')} className="text-xs px-2 py-1">
                User
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleTestLogin('guide')} className="text-xs px-2 py-1">
                Guide
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleTestLogin('admin')} className="text-xs px-2 py-1">
                Admin
              </Button>
              <Button size="sm" variant="outline" onClick={handleLogout} className="text-xs px-2 py-1">
                Logout
              </Button>
            </div>
          </div>

          {/* Test Routes */}
          <div className="space-y-1 max-h-40 overflow-y-auto">
            <div className="text-xs font-semibold">Test Routes:</div>
            {testRoutes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className="block text-xs p-1 hover:bg-gray-100 rounded border-l-2 border-transparent hover:border-blue-400 transition-colors"
              >
                <div className="font-medium">{route.name}</div>
                <div className="text-gray-500">{route.path}</div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationTest;
