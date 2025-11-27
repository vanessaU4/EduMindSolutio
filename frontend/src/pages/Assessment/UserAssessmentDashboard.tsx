import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Heart, Shield, TrendingUp, Calendar, Clock, 
  CheckCircle, AlertTriangle, ArrowRight, BarChart3, 
  Target, Award, Info, Loader2 
} from 'lucide-react';
import assessmentService, { AssessmentType, Assessment } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AssessmentProgress {
  total_completed: number;
  this_month: number;
  improvement_trend: number;
  last_assessment_date: string;
  recommended_frequency: number;
}

interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assessment_type: string;
  reason: string;
}

const UserAssessmentDashboard: React.FC = () => {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [types, history] = await Promise.all([
        assessmentService.getAssessmentTypes(),
        assessmentService.getAssessmentHistory(),
      ]);
      
      setAssessmentTypes(Array.isArray(types) ? types : []);
      const assessmentHistory = Array.isArray(history) ? history : [];
      setRecentAssessments(assessmentHistory.slice(0, 5));
      
      // Calculate progress metrics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const thisMonthAssessments = assessmentHistory.filter(assessment => {
        const assessmentDate = new Date(assessment.completed_at);
        return assessmentDate.getMonth() === currentMonth && assessmentDate.getFullYear() === currentYear;
      });

      const progressData: AssessmentProgress = {
        total_completed: assessmentHistory.length,
        this_month: thisMonthAssessments.length,
        improvement_trend: calculateImprovementTrend(assessmentHistory),
        last_assessment_date: assessmentHistory[0]?.completed_at || '',
        recommended_frequency: 2 // Bi-weekly recommendation
      };
      
      setProgress(progressData);
      setRecommendations(generatePersonalizedRecommendations(assessmentHistory, types));
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateImprovementTrend = (assessments: Assessment[]): number => {
    if (assessments.length < 2) return 0;
    
    // Get the last two assessments of the same type
    const recentAssessments = assessments.slice(0, 2);
    if (recentAssessments[0].assessment_type.id === recentAssessments[1].assessment_type.id) {
      const recent = recentAssessments[0].total_score;
      const previous = recentAssessments[1].total_score;
      return ((previous - recent) / previous) * 100; // Positive means improvement (lower scores are better)
    }
    return 0;
  };

  const generatePersonalizedRecommendations = (
    history: Assessment[], 
    types: AssessmentType[]
  ): PersonalizedRecommendation[] => {
    const recommendations: PersonalizedRecommendation[] = [];
    
    // Check if user hasn't taken assessments recently
    const lastAssessment = history[0];
    const daysSinceLastAssessment = lastAssessment 
      ? Math.floor((Date.now() - new Date(lastAssessment.completed_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastAssessment > 14) {
      recommendations.push({
        id: 'regular_checkup',
        title: 'Regular Mental Health Check-up',
        description: 'It\'s been a while since your last assessment. Regular monitoring helps track your wellbeing.',
        priority: 'high',
        assessment_type: 'PHQ9',
        reason: `${daysSinceLastAssessment} days since last assessment`
      });
    }

    // Check for concerning scores in recent assessments
    const concerningAssessments = history.filter(a => 
      a.risk_level === 'moderate' || a.risk_level === 'moderately_severe' || a.risk_level === 'severe'
    );

    if (concerningAssessments.length > 0) {
      const latest = concerningAssessments[0];
      recommendations.push({
        id: 'follow_up',
        title: 'Follow-up Assessment Recommended',
        description: 'Your recent assessment indicated elevated symptoms. A follow-up can help track changes.',
        priority: 'high',
        assessment_type: latest.assessment_type.name,
        reason: `Recent ${latest.assessment_type.display_name} score: ${latest.total_score}`
      });
    }

    // Recommend complementary assessments
    const takenTypes = new Set(history.map(a => a.assessment_type.name));
    if (takenTypes.has('PHQ9') && !takenTypes.has('GAD7')) {
      recommendations.push({
        id: 'anxiety_screening',
        title: 'Anxiety Screening',
        description: 'Since you\'ve completed depression screening, anxiety assessment can provide a complete picture.',
        priority: 'medium',
        assessment_type: 'GAD7',
        reason: 'Comprehensive mental health screening'
      });
    }

    return recommendations.slice(0, 3); // Limit to top 3 recommendations
  };

  const getAssessmentIcon = (name: string) => {
    switch (name) {
      case 'PHQ9':
        return <Brain className="w-6 h-6 text-blue-600" />;
      case 'GAD7':
        return <Heart className="w-6 h-6 text-purple-600" />;
      case 'PCL5':
        return <Shield className="w-6 h-6 text-green-600" />;
      default:
        return <Target className="w-6 h-6 text-gray-600" />;
    }
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
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
        {/* Header */}
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Your Mental Health Journey
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track your wellbeing with personalized assessments and insights
          </p>
        </div>

        {/* Progress Overview */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progress.total_completed}</div>
                <p className="text-xs text-muted-foreground">
                  Completed assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progress.this_month}</div>
                <p className="text-xs text-muted-foreground">
                  Assessments completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress Trend</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${progress.improvement_trend > 0 ? 'text-green-600' : progress.improvement_trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {progress.improvement_trend > 0 ? '+' : ''}{progress.improvement_trend.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress.improvement_trend > 0 ? 'Improving' : progress.improvement_trend < 0 ? 'Needs attention' : 'Stable'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {progress.last_assessment_date 
                    ? Math.floor((Date.now() - new Date(progress.last_assessment_date).getTime()) / (1000 * 60 * 60 * 24))
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress.last_assessment_date ? 'days ago' : 'No assessments yet'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-healthcare-primary" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Based on your assessment history and mental health goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Alert key={rec.id} className={getPriorityColor(rec.priority)}>
                    <Info className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{rec.title}</h4>
                          <p className="text-sm mt-1">{rec.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Reason: {rec.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => {
                              const assessmentType = assessmentTypes.find(t => t.name === rec.assessment_type);
                              if (assessmentType) {
                                navigate(`/assessments/take/${assessmentType.id}`);
                              }
                            }}
                          >
                            Take Assessment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Assessments */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Available Assessments</h2>
            <Button variant="outline" onClick={() => navigate('/assessments')}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessmentTypes.slice(0, 3).map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    {getAssessmentIcon(assessment.name)}
                    <Badge variant="secondary">{assessment.total_questions} questions</Badge>
                  </div>
                  <CardTitle className="text-xl">{assessment.display_name}</CardTitle>
                  <CardDescription>{assessment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-healthcare-primary hover:bg-blue-700"
                    onClick={() => navigate(`/assessments/take/${assessment.id}`)}
                  >
                    Take Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Assessment History */}
        {recentAssessments.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Assessment Results</CardTitle>
                  <CardDescription>Your latest assessment outcomes and trends</CardDescription>
                </div>
                <Button variant="outline" onClick={() => navigate('/assessments/history')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Full History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {getAssessmentIcon(assessment.assessment_type.name)}
                      <div>
                        <h4 className="font-semibold">{assessment.assessment_type.display_name}</h4>
                        <p className="text-sm text-gray-600">{assessment.interpretation}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(assessment.completed_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            Score: {assessment.total_score}/{assessment.assessment_type.max_score}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRiskLevelColor(assessment.risk_level)}>
                        {assessment.risk_level.replace('_', ' ')}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/assessments/results/${assessment.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started Message for New Users */}
        {recentAssessments.length === 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-healthcare-primary" />
                Start Your Mental Health Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Welcome! Taking your first assessment is an important step in understanding and monitoring your mental health.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium">Evidence-Based</h4>
                      <p className="text-sm text-gray-600">Clinically validated screening tools</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium">Private & Secure</h4>
                      <p className="text-sm text-gray-600">Your data is protected and confidential</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium">Track Progress</h4>
                      <p className="text-sm text-gray-600">Monitor changes over time</p>
                    </div>
                  </div>
                </div>
                <Button 
                  className="bg-healthcare-primary hover:bg-blue-700"
                  onClick={() => navigate('/assessments')}
                >
                  Take Your First Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default UserAssessmentDashboard;
