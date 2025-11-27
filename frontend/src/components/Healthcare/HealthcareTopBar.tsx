import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { logout } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/Notifications';
import {
  Heart,
  Menu,
  X,
  Lock,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

interface HealthcareTopBarProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  showMobileToggle: boolean;
}

const HealthcareTopBar: React.FC<HealthcareTopBarProps> = ({
  onMobileMenuToggle,
  isMobileMenuOpen,
  showMobileToggle,
}) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          {showMobileToggle && (
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={onMobileMenuToggle}
              data-mobile-menu-trigger
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          )}

          {/* Logo - Always visible on mobile, hidden on desktop when authenticated */}
          <Link 
            to="/" 
            className={`flex items-center space-x-3 ${isAuthenticated ? 'md:hidden' : ''}`}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-healthcare-primary rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">EduMindSolutions</span>
              <span className="text-xs text-gray-500 hidden sm:block">Mental Health Platform</span>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* HIPAA Compliance Badge - Hidden on small screens */}
          <div className="hidden sm:block">
            <Badge variant="outline" className="hipaa-compliant">
              <Lock className="w-3 h-3 mr-1" />
              HIPAA Compliant
            </Badge>
          </div>

          {/* Notifications */}
          {isAuthenticated && <NotificationBell />}

          {/* Authentication Section */}
          {isAuthenticated ? (
            /* Authenticated User Menu */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={user?.avatar} 
                      alt={user?.display_name || user?.first_name} 
                    />
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
                      {user?.display_name || `${user?.first_name} ${user?.last_name}`}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Unauthenticated User Buttons */
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="healthcare-button-primary">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HealthcareTopBar;
