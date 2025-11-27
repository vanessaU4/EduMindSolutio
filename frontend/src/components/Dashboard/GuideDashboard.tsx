import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  Shield,
  MessageSquare,
  BarChart3,
  UserCheck,
  Heart,
  Target,
  Bell,
  FileText,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CapabilityGuard } from '@/components/Auth/RoleGuard';

interface ClientMetric {
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CrisisAlert {
  id: string;
  clientName: string;
  assessmentType: string;
  riskLevel: 'severe' | 'moderate';
  triggeredAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
  score: number;
  maxScore: number;
}

interface ClientActivity {
  id: string;
  clientName: string;
  action: string;
  timestamp: string;
  type: 'assessment' | 'mood' | 'crisis' | 'message';
  priority: 'high' | 'medium' | 'low';
}

interface PendingAssignment {
  id: string;
  clientName: string;
  assessmentType: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'completed';
  assignedDate: string;
}

export const GuideDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientMetrics, setClientMetrics] = useState<ClientMetric[]>([]);
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<ClientActivity[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuideDashboardData();
  }, []);

  const loadGuideDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      setClientMetrics([
        {
          label: 'Total Clients',
          value: 24,
          change: '+3 this month',
          trend: 'up',
          color: 'text-blue-600',
          icon: Users
        },
        {
          label: 'Active Crisis Alerts',
          value: 2,
          change: '-1 from yesterday',
          trend: 'down',
          color: 'text-red-600',
          icon: AlertTriangle
        },
        {
          label: 'Completed Assessments',
          value: 18,
          change: '+5 this week',
          trend: 'up',
          color: 'text-green-600',
          icon: CheckCircle
        },
        {
          label: 'Pending Follow-ups',
          value: 7,
          change: '2 overdue',
          trend: 'stable',
          color: 'text-orange-600',
          icon: Calendar
        }
      ]);

      setCrisisAlerts([
        {
          id: '1',
          clientName: 'Sarah Johnson',
          assessmentType: 'PHQ-9',
          riskLevel: 'severe',
          triggeredAt: '2 hours ago',
          status: 'active',
          score: 22,
          maxScore: 27
        },
        {
          id: '2',
          clientName: 'Michael Chen',
          assessmentType: 'GAD-7',
          riskLevel: 'moderate',
          triggeredAt: '6 hours ago',
          status: 'acknowledged',
          score: 16,
          maxScore: 21
        }
      ]);

      setRecentActivity([
        {
          id: '1',
          clientName: 'Emily Davis',
          action: 'Completed PHQ-9 Assessment',
          timestamp: '30 minutes ago',
          type: 'assessment',
          priority: 'medium'
        },
        {
          id: '2',
          clientName: 'Robert Wilson',
          action: 'Logged mood entry - Feeling anxious',
          timestamp: '1 hour ago',
          type: 'mood',
          priority: 'medium'
        },
        {
          id: '3',
          clientName: 'Lisa Anderson',
          action: 'Sent message requesting support',
          timestamp: '2 hours ago',
          type: 'message',
          priority: 'high'
        }
      ]);

      setPendingAssignments([
        {
          id: '1',
          clientName: 'John Smith',
          assessmentType: 'GAD-7',
          dueDate: '2024-01-25',
          status: 'overdue',
          assignedDate: '2024-01-20'
        },
        {
          id: '2',
          clientName: 'Maria Garcia',
          assessmentType: 'PCL-5',
          dueDate: '2024-01-26',
          status: 'pending',
          assignedDate: '2024-01-22'
        }
      ]);

    } catch (error) {
      console.error('Failed to load guide dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-danger';
      case 'acknowledged': return 'badge-warning';
      case 'resolved': return 'badge-success';
      case 'overdue': return 'badge-danger';
      case 'pending': return 'badge-warning';
      case 'completed': return 'badge-success';
      default: return 'badge-premium';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-neutral-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment': return Brain;
      case 'mood': return Heart;
      case 'crisis': return AlertTriangle;
      case 'message': return MessageSquare;
      default: return Activity;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-shenations-purple-50/20">
      <div className="container mx-auto px-6 py-8 pt-24">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-2">
                Guide Dashboard 👨‍⚕️
              </h1>
              <p className="text-lg text-neutral-600">
                Monitor your clients' mental health journey and provide professional support
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-3">
              <CapabilityGuard capability="assign_assessments">
                <Button 
                  className="btn-secondary"
                  onClick={() => navigate('/assessments/assign')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Assessment
                </Button>
              </CapabilityGuard>
              
              <CapabilityGuard capability="view_client_results">
                <Button 
                  className="btn-primary"
                  onClick={() => navigate('/clients')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Clients
                </Button>
              </CapabilityGuard>
            </div>
          </div>
        </motion.div>

        {/* Crisis Alerts */}
        <CapabilityGuard capability="view_crisis_alerts">
          {crisisAlerts.filter(alert => alert.status === 'active').length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Active Crisis Alerts:</strong> {crisisAlerts.filter(alert => alert.status === 'active').length} client(s) require immediate attention.
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white ml-4"
                    size="sm"
                    onClick={() => navigate('/crisis/alerts')}
                  >
                    Respond Now
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </CapabilityGuard>

        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {clientMetrics.map((metric, index) => (
            <motion.div key={metric.label} variants={itemVariants}>
              <Card className="card-premium hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-shenations-purple-500 to-shenations-pink-500 rounded-xl flex items-center justify-center`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-neutral-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-neutral-800">
                      {metric.value}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {metric.label}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {metric.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Crisis Alerts */}
            <CapabilityGuard capability="view_crisis_alerts">
              <motion.div variants={itemVariants}>
                <Card className="card-premium">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <span>Crisis Alerts</span>
                      </CardTitle>
                      
                      <Button 
                        className="btn-secondary"
                        onClick={() => navigate('/crisis/alerts')}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {crisisAlerts.length > 0 ? (
                      <div className="space-y-4">
                        {crisisAlerts.map((alert) => (
                          <div key={alert.id} className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-neutral-800">{alert.clientName}</h4>
                                <p className="text-sm text-neutral-600">
                                  {alert.assessmentType} • {alert.triggeredAt}
                                </p>
                              </div>
                              
                              <div className="text-right space-y-1">
                                <div className="font-semibold text-neutral-800">
                                  {alert.score}/{alert.maxScore}
                                </div>
                                <Badge className={getStatusColor(alert.status)}>
                                  {alert.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge className={alert.riskLevel === 'severe' ? 'badge-danger' : 'badge-warning'}>
                                {alert.riskLevel} risk
                              </Badge>
                              
                              <div className="flex space-x-2">
                                {alert.status === 'active' && (
                                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                    Respond
                                  </Button>
                                )}
                                <Button size="sm" className="btn-secondary">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No active crisis alerts</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </CapabilityGuard>

            {/* Recent Client Activity */}
            <CapabilityGuard capability="track_client_progress">
              <motion.div variants={itemVariants}>
                <Card className="card-premium">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-6 h-6 text-shenations-purple-600" />
                        <span>Recent Client Activity</span>
                      </CardTitle>
                      
                      <Button 
                        className="btn-secondary"
                        onClick={() => navigate('/clients')}
                      >
                        View All Clients
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => {
                        const ActivityIcon = getActivityIcon(activity.type);
                        return (
                          <div key={activity.id} className="flex items-center space-x-4 p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg hover:bg-white/80 transition-colors">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              activity.priority === 'high' ? 'bg-red-100' :
                              activity.priority === 'medium' ? 'bg-orange-100' : 'bg-green-100'
                            }`}>
                              <ActivityIcon className={`w-5 h-5 ${getPriorityColor(activity.priority)}`} />
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-neutral-800">{activity.clientName}</h4>
                              <p className="text-sm text-neutral-600">{activity.action}</p>
                              <p className="text-xs text-neutral-500">{activity.timestamp}</p>
                            </div>
                            
                            <Button size="sm" className="btn-ghost">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </CapabilityGuard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Pending Assignments */}
            <CapabilityGuard capability="assign_assessments">
              <motion.div variants={itemVariants}>
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Calendar className="w-5 h-5 text-shenations-purple-600" />
                      <span>Pending Assignments</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {pendingAssignments.length > 0 ? (
                      <div className="space-y-3">
                        {pendingAssignments.map((assignment) => (
                          <div key={assignment.id} className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-neutral-800 text-sm">{assignment.clientName}</h4>
                              <Badge className={getStatusColor(assignment.status)}>
                                {assignment.status}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-neutral-600 mb-2">
                              {assignment.assessmentType}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-xs text-neutral-500">
                                <Clock className="w-3 h-3" />
                                <span>Due: {assignment.dueDate}</span>
                              </div>
                              
                              <Button size="sm" className="btn-secondary">
                                Remind
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-neutral-500">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">All assignments completed</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </CapabilityGuard>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Target className="w-5 h-5 text-shenations-purple-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <CapabilityGuard capability="assign_assessments">
                      <Button 
                        className="w-full justify-start btn-secondary"
                        onClick={() => navigate('/assessments/assign')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Assessment
                      </Button>
                    </CapabilityGuard>
                    
                    <CapabilityGuard capability="view_client_results">
                      <Button 
                        className="w-full justify-start btn-secondary"
                        onClick={() => navigate('/analytics')}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Button>
                    </CapabilityGuard>
                    
                    <CapabilityGuard capability="moderate_forum_posts">
                      <Button 
                        className="w-full justify-start btn-secondary"
                        onClick={() => navigate('/community/moderation')}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Moderation Queue
                      </Button>
                    </CapabilityGuard>
                    
                    <CapabilityGuard capability="request_new_assessments">
                      <Button 
                        className="w-full justify-start btn-secondary"
                        onClick={() => navigate('/assessments/requests')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Assessment Requests
                      </Button>
                    </CapabilityGuard>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Professional Profile */}
            <CapabilityGuard capability="display_credentials">
              <motion.div variants={itemVariants}>
                <Card className="card-premium bg-gradient-to-br from-shenations-purple-50 to-shenations-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <UserCheck className="w-5 h-5 text-shenations-purple-600" />
                      <span>Professional Profile</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-neutral-800">
                          {user?.profile?.title || 'Mental Health Guide'}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {user?.profile?.credentials || 'Licensed Professional'}
                        </p>
                      </div>
                      
                      {user?.profile?.license_number && (
                        <div>
                          <p className="text-xs text-neutral-500">License #</p>
                          <p className="text-sm font-medium text-neutral-700">
                            {user.profile.license_number}
                          </p>
                        </div>
                      )}
                      
                      {user?.profile?.years_experience && (
                        <div>
                          <p className="text-xs text-neutral-500">Experience</p>
                          <p className="text-sm font-medium text-neutral-700">
                            {user.profile.years_experience} years
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        className="btn-secondary w-full"
                        onClick={() => navigate('/profile')}
                      >
                        Update Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </CapabilityGuard>
          </div>
        </div>
      </div>
    </div>
  );
};
