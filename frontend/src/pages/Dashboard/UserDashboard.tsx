import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Brain, Users, TrendingUp, Calendar, 
  MessageSquare, BookOpen, Shield, ArrowRight, HelpCircle,
  ClipboardList, Activity, Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import assessmentService, { Assessment } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await assessmentService.getAssessmentHistory();
      // Handle both array and paginated response formats
      const assessments = Array.isArray(response) ? response : (response as any)?.results || [];
      setRecentAssessments(assessments.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set empty array on error to prevent further issues
      setRecentAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Take Assessment',
      description: 'Check your mental health',
      icon: ClipboardList,
      color: 'bg-blue-100 text-blue-600',
      path: '/assessments',
    },
    {
      title: 'Community Forums',
      description: 'Connect with others',
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-600',
      path: '/community/forums',
    },
   
    {
      title: 'Wellness Center',
      description: 'Track your progress',
      icon: Activity,
      color: 'bg-orange-100 text-orange-600',
      path: '/wellness',
    },
    {
      title: 'Crisis Support',
      description: 'Get immediate help',
      icon: Shield,
      color: 'bg-red-100 text-red-600',
      path: '/crisis',
    },
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'minimal':
        return 'bg-green-100 text-green-800';
      case 'mild':
        return 'bg-blue-100 text-blue-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderately_severe':
        return 'bg-orange-100 text-orange-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-healthcare-primary" />
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
          
          <p className="text-gray-600 text-sm sm:text-base">Here's your mental health journey overview</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Assessments */}
        {recentAssessments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Assessments</CardTitle>
                <Button variant="outline" onClick={() => navigate('/assessments/history')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssessments.map((assessment) => (
                  <div 
                    key={assessment.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/assessments/results/${assessment.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {assessment.assessment_type.display_name}
                        </h4>
                        <Badge className={getRiskLevelColor(assessment.risk_level)}>
                          {assessment.risk_level.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(assessment.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        
      </motion.div>
    </div>
  );
};

export default UserDashboard;
