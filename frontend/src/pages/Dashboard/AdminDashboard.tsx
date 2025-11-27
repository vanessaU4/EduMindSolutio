import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Users, AlertTriangle, BarChart3, 
  Settings, Database, Activity, TrendingUp, 
  FileText, Clock, CheckCircle, ArrowRight, HelpCircle,
  MessageSquare, UserCheck, Lock, Brain
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGuides: 0,
    totalAssessments: 0,
    systemAlerts: 0,
    contentReports: 0,
    systemHealth: 'healthy',
    recentActivities: []
  });

  // Admin-only quick actions
  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles & permissions',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      path: '/admin/users',
    },
    {
      title: 'Content Moderation',
      description: 'Review flagged content',
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-600',
      path: '/admin/community',
    },
    {
      title: 'Peer Support Requests',
      description: 'Review & approve support requests',
      icon: HelpCircle,
      color: 'bg-green-100 text-green-600',
      path: '/admin/peer-support',
    },
    {
      title: 'Assessment Requests',
      description: 'Review pending assessment requests',
      icon: FileText,
      color: 'bg-orange-100 text-orange-600',
      path: '/assessments/admin',
    },
    {
      title: 'Question Management',
      description: 'Manage assessment questions',
      icon: HelpCircle,
      color: 'bg-purple-100 text-purple-600',
      path: '/assessments/questions',
    },
    {
      title: 'Content Management',
      description: 'Manage articles, videos & resources',
      icon: FileText,
      color: 'bg-indigo-100 text-indigo-600',
      path: '/admin/content',
    },
    {
      title: 'Assessment Management',
      description: 'Manage assessment types',
      icon: FileText,
      color: 'bg-indigo-100 text-indigo-600',
      path: '/admin/assessments',
    },
    {
      title: 'Mood Tracker',
      description: 'Monitor user mood patterns & analytics',
      icon: Brain,
      color: 'bg-purple-100 text-purple-600',
      path: '/admin/mood-tracker',
    },
  ];

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading admin dashboard data...');
      console.log('🔄 Current user:', user);
      console.log('🔄 User role:', user?.role);
      
      // Initialize dashboard stats with defaults
      let dashboardStats = {
        totalUsers: 0,
        activeUsers: 0,
        totalGuides: 0,
        totalAssessments: 0,
        systemAlerts: 0,
        contentReports: 0,
        systemHealth: 'healthy',
        recentActivities: []
      };

      // Fetch admin dashboard data using authenticated API client
      try {
        console.log('🔄 Fetching user stats...');
        const userData = await apiClient.get('/accounts/admin/stats/') as any;
        console.log('✅ User stats received:', userData);
        dashboardStats.totalUsers = userData?.total_users || 0;
        dashboardStats.activeUsers = userData?.active_users || 0;
        dashboardStats.totalGuides = userData?.total_guides || 0;
      } catch (userError: any) {
        console.error('❌ Failed to fetch user stats:', userError);
        console.error('❌ User stats error status:', userError.response?.status);
        console.error('❌ User stats error data:', userError.response?.data);
      }

      try {
        console.log('🔄 Fetching assessment stats...');
        const assessmentData = await apiClient.get('/assessments/admin/stats/') as any;
        console.log('✅ Assessment stats received:', assessmentData);
        dashboardStats.totalAssessments = assessmentData?.total_assessments || 0;
      } catch (assessmentError: any) {
        console.error('❌ Failed to fetch assessment stats:', assessmentError);
        console.error('❌ Assessment stats error status:', assessmentError.response?.status);
      }

      try {
        console.log('🔄 Fetching system stats...');
        const systemData = await apiClient.get('/admin/system/stats/') as any;
        console.log('✅ System stats received:', systemData);
        dashboardStats.systemAlerts = systemData?.system_alerts || 0;
        dashboardStats.contentReports = systemData?.content_reports || 0;
        dashboardStats.systemHealth = systemData?.system_health || 'healthy';
        dashboardStats.recentActivities = systemData?.recent_activities || [];
      } catch (systemError: any) {
        console.error('❌ Failed to fetch system stats:', systemError);
        console.error('❌ System stats error status:', systemError.response?.status);
      }

      console.log('✅ Final dashboard stats:', dashboardStats);
      setDashboardData(dashboardStats);

      toast({
        title: 'Admin Dashboard Updated',
        description: 'System overview loaded successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
      toast({
        title: 'Notice',
        description: 'Using offline data - backend may not be running',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Total Users', 
      value: dashboardData.totalUsers.toString(), 
      icon: Users, 
      color: 'text-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    { 
      label: 'Active Users', 
      value: dashboardData.activeUsers.toString(), 
      icon: Activity, 
      color: 'text-green-600',
      change: '+8%',
      changeType: 'positive'
    },
    { 
      label: 'Total Guides', 
      value: dashboardData.totalGuides.toString(), 
      icon: UserCheck, 
      color: 'text-purple-600',
      change: '+3%',
      changeType: 'positive'
    },
    { 
      label: 'System Alerts', 
      value: dashboardData.systemAlerts.toString(), 
      icon: AlertTriangle, 
      color: 'text-red-600',
      change: '-2%',
      changeType: 'negative'
    },
  ];

  const systemHealthColor = dashboardData.systemHealth === 'healthy' ? 'text-green-600' : 'text-red-600';
  const systemHealthBg = dashboardData.systemHealth === 'healthy' ? 'bg-green-50' : 'bg-red-50';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
      
          <p className="text-gray-600 text-sm sm:text-base">
            System administration and platform management
          </p>
        </div>

     


        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Administrative Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(action.path)}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
};

export default AdminDashboard;
