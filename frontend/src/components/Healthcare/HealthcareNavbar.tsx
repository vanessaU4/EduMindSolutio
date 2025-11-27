import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { logout } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Shield,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Phone,
  AlertTriangle,
  Lock,
  Smile,
} from 'lucide-react';

const HealthcareNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Heart, requireAuth: true },
    { name: 'Assessments', href: '/assessments', icon: Shield, requireAuth: true },
    { name: 'Mood Tracker', href: '/mood', icon: Smile, requireAuth: true },
    { name: 'Community', href: '/community', icon: User, requireAuth: true },
    { name: 'Wellness', href: '/wellness', icon: Heart, requireAuth: true },
    { name: 'Education', href: '/education', icon: Shield, requireAuth: true },
    { name: 'Resources', href: '/resources', icon: Phone, requireAuth: true },
  ];

  const guideNavigationItems = [
    { name: 'Guide Dashboard', href: '/guide', icon: Shield },
    { name: 'Client Management', href: '/guide/clients', icon: User },
    { name: 'Crisis Alerts', href: '/guide/crisis-alerts', icon: AlertTriangle },
    { name: 'Moderation', href: '/guide/moderation', icon: Settings },
  ];

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-healthcare-primary rounded-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900">EduMindSolutions</span>
                  <span className="text-xs text-gray-500">Mental Health Platform</span>
                </div>
              </Link>

              {/* HIPAA Compliance Badge */}
              <div className="ml-4 hidden sm:block">
                <Badge variant="outline" className="hipaa-compliant">
                  <Lock className="w-3 h-3 mr-1" />
                  HIPAA Compliant
                </Badge>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {isAuthenticated && (
                <>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePath(item.href)
                          ? 'text-healthcare-primary bg-blue-50'
                          : 'text-gray-700 hover:text-healthcare-primary hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}

                  {/* Guide-specific navigation */}
                  {user?.role === 'guide' && (
                    <>
                      <div className="h-6 w-px bg-gray-300" />
                      {guideNavigationItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActivePath(item.href)
                              ? 'text-healthcare-secondary bg-green-50'
                              : 'text-gray-700 hover:text-healthcare-secondary hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            {/* User Menu / Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.display_name} />
                        <AvatarFallback className="bg-healthcare-primary text-white">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.display_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <Badge variant="secondary" className="w-fit mt-1">
                          {user?.role === 'guide' ? 'Mental Health Guide' : 'User'}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="healthcare-button-primary">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated && (
                <>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                        isActivePath(item.href)
                          ? 'text-healthcare-primary bg-blue-50'
                          : 'text-gray-700 hover:text-healthcare-primary hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}

                  {user?.role === 'guide' && (
                    <>
                      <div className="border-t border-gray-200 my-2" />
                      {guideNavigationItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                            isActivePath(item.href)
                              ? 'text-healthcare-secondary bg-green-50'
                              : 'text-gray-700 hover:text-healthcare-secondary hover:bg-gray-50'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default HealthcareNavbar;
