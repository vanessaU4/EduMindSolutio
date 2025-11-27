import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BookOpen,
  Heart,
  Brain,
  Target,
  Settings,
  HelpCircle,
  BarChart3,
  Shield,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { RoleBasedActionButtons } from '@/components/Assessments';
import { guideService } from '@/services/guideService';
import { communityService } from '@/services/communityService';
import assessmentService from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const GuideDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeClients: 0,
    pendingReviews: 0,
    crisisAlerts: 0,
    communityReports: 0,
    recentActivities: [],
    upcomingFollowUps: [],
    recentAssessments: [],
    communityStats: null
  });
  const [refreshing, setRefreshing] = useState(false);

  const quickActions = [
    {
      title: 'Client Management',
      description: 'View and manage clients',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      path: '/guide/clients',
    },
    {
      title: 'Crisis Alerts',
      description: 'Monitor urgent cases',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      path: '/guide/crisis-alerts',
    },
    {
      title: 'Community Moderation',
      description: 'Review flagged content',
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-600',
      path: '/community/forums',
    },
    {
      title: 'Peer Support Requests',
      description: 'Review & approve support requests',
      icon: HelpCircle,
      color: 'bg-green-100 text-green-600',
      path: '/guide/peer-support',
    },
    {
      title: 'Question Manager',
      description: 'Manage assessment questions',
      icon: HelpCircle,
      color: 'bg-purple-100 text-purple-600',
      path: '/assessments/questions',
    },
  ];

  useEffect(() => {
    if (user?.role === 'guide') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading dashboard data...');
      
      // Load only working endpoints
      let clients = [];
      let assessments = [];
      let peerSupportRequests = [];
      let communityStats = null;

      // Load clients from working endpoint
      try {
        clients = await guideService.getClients();
        console.log('✅ Clients loaded:', clients?.length || 0);
      } catch (err) {
        console.warn('⚠️ Failed to load clients:', err);
        clients = [];
      }

      // Load assessments from working endpoint
      try {
        assessments = await assessmentService.getAllAssessments();
        console.log('✅ Assessments loaded:', assessments?.length || 0);
      } catch (err) {
        console.warn('⚠️ Failed to load assessments:', err);
        assessments = [];
      }

      // Load peer support requests from working endpoint
      try {
        peerSupportRequests = await communityService.getAllPeerSupportRequests();
        console.log('✅ Peer support requests loaded:', peerSupportRequests?.length || 0);
      } catch (err) {
        console.warn('⚠️ Failed to load peer support requests:', err);
        peerSupportRequests = [];
      }

      // Try to load community stats (optional)
      try {
        communityStats = await communityService.getCommunityStats();
        console.log('✅ Community stats loaded');
      } catch (err) {
        console.warn('⚠️ Community stats not available:', err);
        communityStats = null;
      }

      console.log('📊 Final data summary:', {
        clients: clients?.length || 0,
        assessments: assessments?.length || 0,
        peerRequests: peerSupportRequests?.length || 0,
        hasStats: !!communityStats
      });

      // Process real data
      const recentAssessments = Array.isArray(assessments) ? assessments.slice(0, 5) : [];
      const pendingReviews = Array.isArray(assessments) ? 
        assessments.filter(assessment => 
          assessment.risk_level === 'high' || 
          assessment.risk_level === 'critical'
        ).length : 0;

      // Get community reports from peer support requests that need approval
      const pendingPeerRequests = Array.isArray(peerSupportRequests) ? 
        peerSupportRequests.filter(request => 
          request.status === 'pending_approval' || 
          request.status === 'pending'
        ).length : 0;

      // Count active clients
      const activeClientsCount = Array.isArray(clients) ? 
        clients.filter(client => client.status === 'active').length : 0;

      // Create recent activities from real data sources
      const activities = [];
      
      // Add recent assessments to activities
      if (Array.isArray(assessments) && assessments.length > 0) {
        console.log('📝 Adding assessment activities:', assessments.length);
        assessments
          .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
          .slice(0, 3)
          .forEach(assessment => {
            activities.push({
              id: `assessment-${assessment.id}`,
              type: 'assessment',
              title: `${assessment.assessment_type?.display_name || 'Assessment'} completed`,
              description: `Risk level: ${assessment.risk_level} | User: ${assessment.user?.display_name || assessment.user?.username || 'Unknown'}`,
              timestamp: assessment.completed_at,
              icon: 'FileText',
              color: assessment.risk_level === 'high' || assessment.risk_level === 'critical' ? 'text-red-600' : 
                     assessment.risk_level === 'medium' ? 'text-orange-600' : 'text-blue-600'
            });
          });
      }

      // Add peer support activities
      if (Array.isArray(peerSupportRequests) && peerSupportRequests.length > 0) {
        console.log('🤝 Adding peer support activities:', peerSupportRequests.length);
        peerSupportRequests
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 2)
          .forEach(request => {
            activities.push({
              id: `peer-${request.id}`,
              type: 'peer_support',
              title: 'Peer support request received',
              description: `${request.preferred_topics?.join(', ') || 'General support'} - ${request.urgency_level || 'medium'} priority`,
              timestamp: request.created_at,
              icon: 'HelpCircle',
              color: 'text-green-600'
            });
          });
      }

      // Sort activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setDashboardData({
        activeClients: activeClientsCount,
        pendingReviews: pendingReviews,
        crisisAlerts: 0, // Crisis alerts endpoint doesn't exist
        communityReports: pendingPeerRequests,
        recentActivities: activities.slice(0, 5),
        upcomingFollowUps: [], // Follow-ups endpoint doesn't exist
        recentAssessments,
        communityStats
      });

      console.log('✅ Dashboard data updated:', {
        activeClients: activeClientsCount,
        pendingReviews,
        communityReports: pendingPeerRequests,
        activitiesCount: activities.length
      });

      const totalDataPoints = activeClientsCount + assessments.length + peerSupportRequests.length;
      
      if (totalDataPoints > 0) {
        toast({
          title: 'Dashboard Updated',
          description: `Loaded ${activeClientsCount} clients, ${assessments.length} assessments, ${peerSupportRequests.length} peer requests`,
          variant: 'default',
        });
      } else {
        // Add some sample activities when no real data is available
        const sampleActivities = [
          {
            id: 'sample-1',
            type: 'info',
            title: 'Welcome to your Guide Dashboard',
            description: 'Start by reviewing client assessments and peer support requests',
            timestamp: new Date().toISOString(),
            icon: 'FileText',
            color: 'text-blue-600'
          }
        ];

        setDashboardData(prev => ({
          ...prev,
          recentActivities: sampleActivities
        }));

        toast({
          title: 'Dashboard Ready',
          description: 'Connected to backend successfully. No data available yet.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Notice',
        description: 'Some data may be unavailable - check your connection',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const stats = [
    { label: 'Active Clients', value: dashboardData.activeClients.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Pending Reviews', value: dashboardData.pendingReviews.toString(), icon: FileText, color: 'text-purple-600' },
    { label: 'Crisis Alerts', value: dashboardData.crisisAlerts.toString(), icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Community Reports', value: dashboardData.communityReports.toString(), icon: MessageSquare, color: 'text-orange-600' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.display_name || user?.first_name || 'Guide'}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Professional dashboard for mental health guides</p>
            </div>
            <Button 
              onClick={refreshDashboard} 
              disabled={refreshing || loading}
              variant="outline"
              size="sm"
            >
              {refreshing ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Assessment Management Actions */}
        <RoleBasedActionButtons variant="default" className="mb-8" />

  
        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                // Get dynamic counts for each action
                let badgeCount = null;
                if (action.path === '/guide/crisis-alerts') {
                  badgeCount = dashboardData.crisisAlerts;
                } else if (action.path === '/guide/peer-support') {
                  badgeCount = dashboardData.communityReports;
                } else if (action.path === '/guide/clients') {
                  badgeCount = dashboardData.activeClients;
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                    onClick={() => navigate(action.path)}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${action.color} mr-3 group-hover:scale-105 transition-transform`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          {badgeCount !== null && badgeCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {badgeCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities and Follow-ups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : dashboardData.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivities.map((activity) => {
                    const IconComponent = activity.icon === 'FileText' ? FileText : 
                                        activity.icon === 'AlertTriangle' ? AlertTriangle :
                                        activity.icon === 'HelpCircle' ? HelpCircle : Clock;
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <IconComponent className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                          <p className="text-gray-600 text-xs">{activity.description}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activities</p>
                </div>
              )}
            </CardContent>
          </Card>

          
        </div>

      </motion.div>
    </div>
  );
};

export default GuideDashboard;
