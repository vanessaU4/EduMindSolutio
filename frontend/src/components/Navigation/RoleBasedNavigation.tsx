import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasCapability, UserRole } from '@/types/permissions';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Brain,
  Users,
  BarChart3,
  Settings,
  Heart,
  Shield,
  MessageSquare,
  Calendar,
  FileText,
  Bell,
  User,
  BookOpen,
  Activity,
  Target,
  LifeBuoy,
  UserCheck,
  AlertTriangle,
  UserCog,
  Zap,
  Award,
  HelpCircle,
  Search,
  Plus,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  requiredCapabilities?: string[];
  roles?: UserRole[];
  children?: NavigationItem[];
  category?: 'main' | 'professional' | 'community' | 'wellness' | 'admin' | 'account';
  description?: string;
}

export const useRoleBasedNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const allNavigationItems: NavigationItem[] = [
    // Main Navigation - Available to all authenticated users
    {
      name: 'Dashboard',
      href: getDashboardHref(user?.role),
      icon: Home,
      category: 'main',
      description: 'Your personalized dashboard'
    },

    // Assessment Navigation - Role-specific capabilities
    {
      name: 'Assessments',
      href: '/assessments',
      icon: Brain,
      category: 'main',
      description: 'Mental health assessments and screening tools',
      children: [
        {
          name: 'Take Assessment',
          href: '/assessments',
          icon: Brain,
          requiredCapabilities: ['take_assessments']
        },
        {
          name: 'Assessment History',
          href: '/assessments/history',
          icon: FileText,
          requiredCapabilities: ['view_own_assessment_history']
        },
        {
          name: 'Assign Assessments',
          href: '/assessments/assign',
          icon: UserCheck,
          requiredCapabilities: ['assign_assessments']
        },
        {
          name: 'Assessment Analytics',
          href: '/assessments/analytics',
          icon: BarChart3,
          requiredCapabilities: ['view_client_results', 'access_analytics_reporting']
        },
        {
          name: 'Create Assessment',
          href: '/assessments/create',
          icon: Plus,
          requiredCapabilities: ['create_assessment_types']
        }
      ]
    },

    // Community Features
    {
      name: 'Community',
      href: '/community',
      icon: Users,
      category: 'community',
      description: 'Connect with peers and support groups',
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
        {
          name: 'Moderation',
          href: '/community/moderation',
          icon: Shield,
          requiredCapabilities: ['moderate_forum_posts']
        }
      ]
    },

    // Wellness & Self-Care
    {
      name: 'Wellness',
      href: '/wellness',
      icon: Activity,
      category: 'wellness',
      description: 'Track mood, activities, and wellness goals',
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
        {
          name: 'Progress & Achievements',
          href: '/wellness/progress',
          icon: TrendingUp,
          requiredCapabilities: ['view_wellness_progress']
        }
      ]
    },

    // Educational Content
    {
      name: 'Education',
      href: '/education',
      icon: BookOpen,
      category: 'main',
      description: 'Educational resources and learning materials',
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
          icon: Search,
          requiredCapabilities: ['search_resources']
        }
      ]
    },


    // Professional Tools (Guides & Admins)
    {
      name: 'Client Management',
      href: '/clients',
      icon: UserCheck,
      category: 'professional',
      description: 'Manage your clients and their progress',
      requiredCapabilities: ['track_client_progress', 'view_client_results'],
      children: [
        {
          name: 'Client List',
          href: '/clients',
          icon: Users,
          requiredCapabilities: ['track_client_progress']
        },
        {
          name: 'High Risk Clients',
          href: '/clients/high-risk',
          icon: AlertTriangle,
          requiredCapabilities: ['monitor_high_risk_users']
        },
        {
          name: 'Follow-ups',
          href: '/clients/follow-ups',
          icon: Calendar,
          requiredCapabilities: ['set_followup_requirements']
        }
      ]
    },

    // Analytics & Reporting
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      category: 'professional',
      description: 'Comprehensive analytics and reporting',
      requiredCapabilities: ['access_analytics_reporting', 'view_client_results']
    },

    // Admin Tools
    {
      name: 'User Management',
      href: '/admin/users',
      icon: UserCog,
      category: 'admin',
      description: 'Manage user accounts and roles',
      requiredCapabilities: ['manage_user_accounts']
    },

    {
      name: 'Content Management',
      href: '/admin/content',
      icon: FileText,
      category: 'admin',
      description: 'Manage educational content and resources',
      requiredCapabilities: ['create_publish_articles', 'upload_manage_videos']
    },

    {
      name: 'System Configuration',
      href: '/admin/config',
      icon: Settings,
      category: 'admin',
      description: 'Configure system settings and policies',
      requiredCapabilities: ['configure_notifications', 'set_platform_policies']
    },

    // Account & Settings
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      category: 'account',
      description: 'Manage your profile and preferences',
      requiredCapabilities: ['update_profile']
    },

    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      category: 'account',
      description: 'Application settings and preferences',
      requiredCapabilities: ['manage_notifications']
    },

    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      category: 'account',
      description: 'View and manage notifications',
      badge: getNotificationCount(user)
    },

    {
      name: 'Help & Support',
      href: '/help',
      icon: HelpCircle,
      category: 'account',
      description: 'Get help and support'
    }
  ];

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

  const navigationItems = filterNavigationItems(allNavigationItems);

  // Group navigation items by category
  const groupedNavigation = {
    main: navigationItems.filter(item => item.category === 'main' || !item.category),
    professional: navigationItems.filter(item => item.category === 'professional'),
    community: navigationItems.filter(item => item.category === 'community'),
    wellness: navigationItems.filter(item => item.category === 'wellness'),
    admin: navigationItems.filter(item => item.category === 'admin'),
    account: navigationItems.filter(item => item.category === 'account')
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return {
    navigationItems,
    groupedNavigation,
    isActive,
    user
  };
};

// Helper functions
function getDashboardHref(role?: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'guide':
      return '/guide/dashboard';
    case 'user':
    default:
      return '/dashboard';
  }
}

function getCrisisAlertCount(user: any): string | undefined {
  // This would typically come from an API call or context
  // For now, return undefined or a mock count based on role
  if (hasCapability(user, 'view_crisis_alerts')) {
    return '3'; // Mock count
  }
  return undefined;
}

function getNotificationCount(user: any): string | undefined {
  // This would typically come from an API call or context
  // For now, return a mock count
  return '5'; // Mock count
}

// Navigation component that uses the role-based navigation
export const RoleBasedNavigationMenu: React.FC<{
  className?: string;
  showCategories?: boolean;
  compact?: boolean;
}> = ({ 
  className = '', 
  showCategories = true,
  compact = false 
}) => {
  const { groupedNavigation, isActive } = useRoleBasedNavigation();

  const renderNavigationItem = (item: NavigationItem, isChild = false) => (
    <Link
      key={item.name}
      to={item.href}
      className={`nav-item ${isActive(item.href) ? 'active' : ''} ${
        isChild ? 'ml-6 text-sm' : ''
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      
      <div className="flex items-center justify-between flex-1 min-w-0">
        <span className="truncate">{item.name}</span>
        
        {item.badge && (
          <Badge className="badge-premium text-xs ml-2">
            {item.badge}
          </Badge>
        )}
      </div>
    </Link>
  );

  const renderNavigationSection = (title: string, items: NavigationItem[]) => {
    if (items.length === 0) return null;

    return (
      <div key={title} className="space-y-2">
        {showCategories && !compact && (
          <div className="px-2 text-xs uppercase tracking-wide text-neutral-500 font-semibold">
            {title}
          </div>
        )}
        
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.name}>
              {renderNavigationItem(item)}
              
              {/* Render children if they exist and parent is active */}
              {item.children && item.children.length > 0 && isActive(item.href) && (
                <div className="mt-2 space-y-1">
                  {item.children.map(child => renderNavigationItem(child, true))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <nav className={`space-y-6 ${className}`}>
      {renderNavigationSection('Main', groupedNavigation.main)}
      {renderNavigationSection('Professional', groupedNavigation.professional)}
      {renderNavigationSection('Community', groupedNavigation.community)}
      {renderNavigationSection('Wellness', groupedNavigation.wellness)}
      {renderNavigationSection('Administration', groupedNavigation.admin)}
      {renderNavigationSection('Account', groupedNavigation.account)}
    </nav>
  );
};
