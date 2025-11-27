import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { hasCapability, UserRole } from '@/types/permissions';
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck,
  AlertTriangle,
  LifeBuoy,
  UserCog,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface ProfessionalSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const ProfessionalSidebar: React.FC<ProfessionalSidebarProps> = ({ 
  collapsed = false, 
  onToggle 
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  // Helper function for crisis alert count
  const getCrisisAlertCount = (user: any): string | undefined => {
    if (hasCapability(user, 'view_crisis_alerts')) {
      return '3'; // Mock count
    }
    return undefined;
  };

  // Get role-appropriate dashboard URL
  const getDashboardHref = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'guide') return '/guide';
    return '/dashboard';
  };

  const allNavigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: getDashboardHref(),
      icon: Home,
      category: 'main'
    },
    {
      name: 'Assessments',
      href: '/assessments',
      icon: Brain,
      category: 'main',
      description: 'Mental health assessments - comprehensive tools for all users',
      children: [
        { 
          name: 'Take Assessment', 
          href: '/assessments', 
          icon: Brain,
          requiredCapabilities: ['take_assessments'],
          description: '👤 All Users: PHQ-9, GAD-7, PCL-5 assessments'
        },
        { 
          name: 'Assessment History', 
          href: '/assessments/history', 
          icon: FileText,
          requiredCapabilities: ['view_own_assessment_history'],
          description: '👤 All Users: View assessment results & progress'
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
      name: 'Client Management',
      href: '/clients',
      icon: Users,
      category: 'professional',
      requiredCapabilities: ['track_client_progress'],
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
      name: 'Community',
      href: '/community',
      icon: MessageSquare,
      category: 'community',
      requiredCapabilities: ['view_forum_content'],
      children: [
        {
          name: 'Forums',
          href: '/community/forums',
          icon: MessageSquare,
          requiredCapabilities: ['view_forum_content']
        },
      ]
    },
    // Admin Tools
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
      requiredCapabilities: ['create_publish_articles']
    },
    {
      name: 'System Configuration',
      href: '/admin/config',
      icon: Settings,
      category: 'admin',
      requiredCapabilities: ['configure_notifications']
    }
  ];

  // Filter navigation items based on user capabilities
  const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
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

  const bottomItems: NavigationItem[] = [
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: '5'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl z-50 flex flex-col"
    >
      
      {/* Header */}
      <div className="p-6 border-b border-neutral-200/50">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-shenations-purple-500 to-shenations-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-neutral-800">EduMindSolutions</div>
                  <div className="text-xs text-neutral-600">Professional</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            onClick={onToggle}
            className="btn-ghost p-2"
            size="sm"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-2 px-4">
          
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigationItems.filter(item => item.category === 'main' || !item.category).map((item, index) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={`nav-item group ${isActive(item.href) ? 'active' : ''}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.div
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between flex-1 min-w-0"
                      >
                        <span className="truncate">{item.name}</span>
                        
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <Badge className="badge-premium text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          
                          {item.children && (
                            <ChevronRight className={`w-4 h-4 transition-transform ${
                              expandedSections.includes(item.name.toLowerCase()) ? 'rotate-90' : ''
                            }`} />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>

                {/* Sub-navigation */}
                <AnimatePresence>
                  {!collapsed && item.children && expandedSections.includes(item.name.toLowerCase()) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 mt-2 space-y-1 border-l-2 border-shenations-purple-100 pl-4"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive(child.href)
                              ? 'text-shenations-purple-700 bg-shenations-purple-50'
                              : 'text-neutral-600 hover:text-shenations-purple-700 hover:bg-shenations-purple-50'
                          }`}
                        >
                          <child.icon className="w-4 h-4" />
                          <span>{child.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Professional Tools */}
          {navigationItems.filter(item => item.category === 'professional').length > 0 && (
            <>
              <div className="my-6 border-t border-neutral-200/50" />
              {!collapsed && (
                <div className="px-2 text-xs uppercase tracking-wide text-neutral-500 font-semibold mb-2">
                  Professional Tools
                </div>
              )}
              <div className="space-y-1">
                {navigationItems.filter(item => item.category === 'professional').map((item, index) => (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      className={`nav-item group ${isActive(item.href) ? 'active' : ''}`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.div
                            variants={contentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between flex-1 min-w-0"
                          >
                            <span className="truncate">{item.name}</span>
                            
                            <div className="flex items-center space-x-2">
                              {item.badge && (
                                <Badge className="badge-premium text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Admin Tools */}
          {navigationItems.filter(item => item.category === 'admin').length > 0 && (
            <>
              <div className="my-6 border-t border-neutral-200/50" />
              {!collapsed && (
                <div className="px-2 text-xs uppercase tracking-wide text-neutral-500 font-semibold mb-2">
                  Administration
                </div>
              )}
              <div className="space-y-1">
                {navigationItems.filter(item => item.category === 'admin').map((item, index) => (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      className={`nav-item group ${isActive(item.href) ? 'active' : ''}`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.div
                            variants={contentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between flex-1 min-w-0"
                          >
                            <span className="truncate">{item.name}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-neutral-200/50" />

          {/* Bottom Navigation */}
          <div className="space-y-1">
            {bottomItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between flex-1 min-w-0"
                    >
                      <span className="truncate">{item.name}</span>
                      
                      {item.badge && (
                        <Badge className="badge-danger text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200/50">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-shenations-purple-50 to-shenations-pink-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback className="bg-shenations-purple-500 text-white">
                      DA
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-800 truncate">
                      Dr. Anderson
                    </div>
                    <div className="text-sm text-neutral-600 truncate">
                      Clinical Director
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button className="btn-ghost flex-1" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  
                  <Button className="btn-ghost" size="sm">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <Badge className="badge-success">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Online
                </Badge>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center space-y-3"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback className="bg-shenations-purple-500 text-white">
                  DA
                </AvatarFallback>
              </Avatar>
              
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProfessionalSidebar;
