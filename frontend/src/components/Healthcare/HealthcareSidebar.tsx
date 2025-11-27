import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { logout } from '@/features/auth/authSlice';
import { hasCapability, UserRole } from '@/types/permissions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  ChevronDown,
  ChevronRight,
  Home,
  Brain,
  Users,
  Activity,
  BookOpen,
  FileText,
  LifeBuoy,
  UserCheck,
  BarChart3,
  MessageSquare,
  Target,
  Award,
  Calendar,
  Stethoscope,
  UserCog,
  Database,
  Minimize2,
  Maximize2,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  requiredCapabilities?: string[];
  roles?: UserRole[];
  badge?: string | number;
  children?: NavigationItem[];
  category?: 'main' | 'professional' | 'community' | 'wellness' | 'admin' | 'account';
  description?: string;
}

const HealthcareSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard']);
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

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  // Helper functions
  const getCrisisAlertCount = (user: any): string | undefined => {
    // This would typically come from an API call or context
    if (hasCapability(user, 'view_crisis_alerts')) {
      return '3'; // Mock count
    }
    return undefined;
  };

  // Navigation structure based on user capabilities
  const getNavigationItems = (): NavigationItem[] => {
    // Get role-appropriate dashboard URL
    const getDashboardHref = () => {
      if (user?.role === 'admin') return '/admin';
      if (user?.role === 'guide') return '/guide';
      return '/dashboard';
    };

    const baseItems: NavigationItem[] = [
      {
        name: 'Dashboard',
        href: getDashboardHref(),
        icon: Home,
        requireAuth: true,
        category: 'main',
        description: 'Your personalized dashboard'
      },
      {
        name: 'Assessments',
        href: '/assessments',
        icon: Brain,
        requireAuth: true,
        category: 'main',
        description: 'Mental health assessments and screening tools - available to all users',
        children: [
          {
            name: 'Take Assessment',
            href: '/assessments',
            icon: Brain,
            requiredCapabilities: ['take_assessments'],
            description: '👤 Users: Take PHQ-9, GAD-7, PCL-5 assessments'
          },
          {
            name: 'Assessment History',
            href: '/assessments/history',
            icon: FileText,
            requiredCapabilities: ['view_own_assessment_history'],
            description: '👤 Users: View your past assessment results'
          },
          {
            name: 'Assign Assessments',
            href: '/assessments/assign',
            icon: UserCheck,
            requiredCapabilities: ['assign_assessments'],
            description: '👨‍⚕️ Guides: Assign assessments to clients'
          },
        ]
      },
      {
        name: 'Community',
        href: '/community',
        icon: Users,
        requireAuth: true,
        category: 'community',
        requiredCapabilities: ['create_forum_posts', 'view_forum_content'],
        children: [
          {
            name: 'Forums',
            href: '/community/forums',
            icon: MessageSquare,
            requiredCapabilities: ['view_forum_content']
          },
          {
            name: 'Chat Rooms',
            href: '/community/chat',
            icon: MessageSquare,
            requiredCapabilities: ['participate_chat_rooms']
          },
        ]
      },
      {
        name: 'Wellness',
        href: '/wellness',
        icon: Activity,
        requireAuth: true,
        category: 'wellness',
        requiredCapabilities: ['log_mood_entries', 'track_activities'],
        children: [
          {
            name: 'Mood Tracker',
            href: '/wellness/mood-tracker',
            icon: Target,
            requiredCapabilities: ['log_mood_entries']
          },
          {
            name: 'Wellness Challenges',
            href: '/wellness/challenges',
            icon: Award,
            requiredCapabilities: ['complete_wellness_challenges']
          },
        ]
      },
      {
        name: 'Education',
        href: '/education',
        icon: BookOpen,
        requireAuth: true,
        category: 'main',
        requiredCapabilities: ['browse_articles', 'watch_videos'],
        children: [
          {
            name: 'Articles',
            href: '/education/articles',
            icon: FileText,
            requiredCapabilities: ['browse_articles']
          },
          {
            name: 'Videos',
            href: '/education/videos',
            icon: FileText,
            requiredCapabilities: ['watch_videos']
          },
          {
            name: 'Audio Content',
            href: '/education/audio',
            icon: FileText,
            requiredCapabilities: ['listen_audio_content']
          },
          {
            name: 'Resource Directory',
            href: '/education/resources',
            icon: FileText,
            requiredCapabilities: ['search_resources']
          }
        ]
      },
    ];

    // Professional Tools (Guides & Admins)
    baseItems.push(
      {
        name: 'Client Management',
        href: '/clients',
        icon: UserCheck,
        category: 'professional',
        requiredCapabilities: ['track_client_progress', 'view_client_results'],
        children: [
          {
            name: 'Client List',
            href: '/clients',
            icon: Users,
            requiredCapabilities: ['track_client_progress']
          },
        ]
      },
      {
        name: 'User Management',
        href: '/admin/users',
        icon: UserCog,
        category: 'admin',
        requiredCapabilities: ['manage_user_accounts']
      },
      {
        name: 'Content Management',
        href: '/admin/content',
        icon: FileText,
        category: 'admin',
        requiredCapabilities: ['create_publish_articles', 'upload_manage_videos']
      }
    );

    // Common account links removed - Profile and Settings no longer available in sidebar

    return baseItems;
  };

  // Filter navigation items based on user capabilities and roles
  const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      // Check role requirements
      if (item.roles && item.roles.length > 0) {
        if (!user || !item.roles.includes(user.role)) {
          return false;
        }
      }

      // Check capability requirements
      if (item.requiredCapabilities && item.requiredCapabilities.length > 0) {
        const hasRequiredCapabilities = item.requiredCapabilities.some(capability => 
          hasCapability(user, capability)
        );
        if (!hasRequiredCapabilities) {
          return false;
        }
      }

      // Filter children recursively
      if (item.children) {
        item.children = filterNavigationItems(item.children);
      }

      return true;
    });
  };

  const navigationItems = filterNavigationItems(getNavigationItems());

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.name.toLowerCase());
    const isActive = isActivePath(item.href);
    // Check authentication requirement
    if (item.requireAuth && !isAuthenticated) return null;
    
    // Check capability requirements
    if (item.requiredCapabilities && item.requiredCapabilities.length > 0) {
      const hasRequiredCapabilities = item.requiredCapabilities.some(capability => 
        hasCapability(user, capability)
      );
      if (!hasRequiredCapabilities) return null;
    }
    
    // Check role requirements
    if (item.roles && item.roles.length > 0) {
      if (!user || !item.roles.includes(user.role)) {
        return null;
      }
    }
    
    const shouldShow = true;

    if (!shouldShow) return null;

    const itemClasses = `
      flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
      ${level > 0 ? 'ml-4 pl-6' : ''}
      ${isActive 
        ? 'bg-healthcare-primary text-white shadow-sm' 
        : 'text-gray-700 hover:bg-gray-100 hover:text-healthcare-primary'
      }
      ${isCollapsed && level === 0 ? 'justify-center' : 'justify-start'}
    `;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.name}
          open={isExpanded}
          onOpenChange={() => toggleSection(item.name.toLowerCase())}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={itemClasses}
              aria-expanded={isExpanded}
              aria-label={`Toggle ${item.name} section`}
            >
              <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <Badge className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {!isCollapsed && (
            <CollapsibleContent className="space-y-1">
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    const linkEl = (
      <Link
        key={item.name}
        to={item.href}
        className={itemClasses}
        aria-label={item.name}
        aria-current={isActive ? 'page' : undefined}
        data-active={isActive || undefined}
      >
        <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} />
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <Badge className="text-xs ml-2">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.name}>
          <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
      );
    }

    return linkEl;
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
      aria-label="Healthcare platform navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-healthcare-primary rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">EduMindSolutions</span>
              <span className="text-xs text-gray-500">Mental Health Platform</span>
            </div>
          </Link>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* HIPAA Compliance Badge */}
      {!isCollapsed && (
        <div className="px-4 py-2">
          <Badge variant="outline" className="w-full justify-center hipaa-compliant">
            <Lock className="w-3 h-3 mr-1" />
            HIPAA Compliant
          </Badge>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
        {/* Group navigation items by category */}
        {(() => {
          const groupedNavigation = {
            main: navigationItems.filter(item => item.category === 'main' || !item.category),
            professional: navigationItems.filter(item => item.category === 'professional'),
            community: navigationItems.filter(item => item.category === 'community'),
            wellness: navigationItems.filter(item => item.category === 'wellness'),
            admin: navigationItems.filter(item => item.category === 'admin'),
            account: navigationItems.filter(item => item.category === 'account')
          };

          const renderNavigationSection = (title: string, items: NavigationItem[]) => {
            if (items.length === 0) return null;

            return (
              <div key={title} className="space-y-2">
                {!isCollapsed && (
                  <div className="px-2 text-[10px] uppercase tracking-wide text-gray-500">
                    {title}
                  </div>
                )}
                <div className="space-y-1">
                  {items.map(item => renderNavigationItem(item))}
                </div>
              </div>
            );
          };

          return (
            <>
              {renderNavigationSection('Main', groupedNavigation.main)}
              {renderNavigationSection('Professional', groupedNavigation.professional)}
              {renderNavigationSection('Community', groupedNavigation.community)}
              {renderNavigationSection('Wellness', groupedNavigation.wellness)}
              {renderNavigationSection('Administration', groupedNavigation.admin)}
              {renderNavigationSection('Account', groupedNavigation.account)}
            </>
          );
        })()}
      </nav>

      {/* Profile footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={(user as any)?.avatar || ''} alt={user?.display_name || user?.username} />
              <AvatarFallback>{(user?.display_name || user?.username || 'U').slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.display_name || user?.username}</div>
              <div className="text-xs text-gray-500 truncate">{user?.role?.toUpperCase()}</div>
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

    </aside>
  );
};

export default HealthcareSidebar;
