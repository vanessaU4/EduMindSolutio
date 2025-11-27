import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, TrendingUp, Brain, Heart, Shield, 
  ArrowRight, Loader2, CheckCircle, Info, Users, BarChart3, Settings, HelpCircle,
  BookOpen, ChevronDown, ChevronUp, Plus, Edit, Trash2, Search, Eye, FileText, Clock, AlertTriangle
} from 'lucide-react';
import assessmentService, { AssessmentType, Assessment } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';
import { RoleBasedActionButtons } from '@/components/Assessments';
import { useAuth } from '@/hooks/useAuth';

interface AssessmentStats {
  totalAssessments: number;
  completedThisMonth: number;
  averageScore: number;
  lastAssessmentDate: string | null;
  riskLevelDistribution: Record<string, number>;
  progressTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
}

interface Question {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'scale' | 'text';
  options?: { text: string; value: number }[];
  assessment_type: string;
  order: number;
  is_active: boolean;
}

interface AssessmentRequest {
  id: number;
  client_name: string;
  client_email: string;
  assessment_type: string;
  requested_by: string;
  requested_date: string;
  due_date: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface UserSubmission {
  id: number;
  user_name: string;
  user_email: string;
  assessment_type: string;
  score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  completed_date: string;
  completion_time: string;
}

const AssessmentCenter: React.FC = () => {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<AssessmentStats>({
    totalAssessments: 0,
    completedThisMonth: 0,
    averageScore: 0,
    lastAssessmentDate: null,
    riskLevelDistribution: {},
    progressTrend: 'insufficient_data'
  });
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  
  // Admin-specific state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentRequests, setAssessmentRequests] = useState<AssessmentRequest[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [adminTab, setAdminTab] = useState('questions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>('all');
  const [adminDataLoaded, setAdminDataLoaded] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when component becomes visible (e.g., returning from assessment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Only reload main data, not admin data to preserve it
        const loadMainData = async () => {
          try {
            setLoading(true);
            const [types, history] = await Promise.all([
              assessmentService.getAssessmentTypes(),
              assessmentService.getAssessmentHistory(),
            ]);
            
            const typesArray = Array.isArray(types) ? types : [];
            const detailedTypes = await Promise.all(
              typesArray.map(async (type) => {
                try {
                  const detailedType = await assessmentService.getAssessmentType(type.id);
                  return detailedType;
                } catch (error) {
                  console.error(`Failed to load questions for assessment ${type.id}:`, error);
                  return type;
                }
              })
            );
            
            const historyArray = Array.isArray(history) ? history : [];
            
            setAssessmentTypes(detailedTypes);
            setRecentAssessments(historyArray.slice(0, 3));
            setStats(calculateStats(historyArray));
          } catch (error) {
            console.error('Failed to refresh main data:', error);
          } finally {
            setLoading(false);
          }
        };
        
        loadMainData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const toggleQuestions = (assessmentId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assessmentId)) {
        newSet.delete(assessmentId);
      } else {
        newSet.add(assessmentId);
      }
      return newSet;
    });
  };

  const calculateStats = (assessments: Assessment[]): AssessmentStats => {
    if (!assessments || assessments.length === 0) {
      return {
        totalAssessments: 0,
        completedThisMonth: 0,
        averageScore: 0,
        lastAssessmentDate: null,
        riskLevelDistribution: {},
        progressTrend: 'insufficient_data'
      };
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate basic stats
    const totalAssessments = assessments.length;
    const completedThisMonth = assessments.filter(a => 
      new Date(a.completed_at) >= thisMonth
    ).length;
    
    // Calculate average score (normalized to percentage)
    const totalScore = assessments.reduce((sum, a) => {
      const percentage = (a.total_score / a.assessment_type.max_score) * 100;
      return sum + percentage;
    }, 0);
    const averageScore = Math.round(totalScore / totalAssessments);
    
    // Get last assessment date
    const sortedAssessments = [...assessments].sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
    const lastAssessmentDate = sortedAssessments[0]?.completed_at || null;
    
    // Calculate risk level distribution
    const riskLevelDistribution: Record<string, number> = {};
    assessments.forEach(a => {
      const level = a.risk_level || 'unknown';
      riskLevelDistribution[level] = (riskLevelDistribution[level] || 0) + 1;
    });
    
    // Calculate progress trend (comparing recent vs older assessments)
    let progressTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data' = 'insufficient_data';
    if (assessments.length >= 3) {
      const recent = sortedAssessments.slice(0, Math.ceil(assessments.length / 2));
      const older = sortedAssessments.slice(Math.ceil(assessments.length / 2));
      
      const recentAvg = recent.reduce((sum, a) => sum + (a.total_score / a.assessment_type.max_score), 0) / recent.length;
      const olderAvg = older.reduce((sum, a) => sum + (a.total_score / a.assessment_type.max_score), 0) / older.length;
      
      const difference = recentAvg - olderAvg;
      if (Math.abs(difference) < 0.1) progressTrend = 'stable';
      else if (difference > 0) progressTrend = 'declining'; // Higher scores usually mean worse in mental health assessments
      else progressTrend = 'improving';
    }
    
    return {
      totalAssessments,
      completedThisMonth,
      averageScore,
      lastAssessmentDate,
      riskLevelDistribution,
      progressTrend
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [types, history] = await Promise.all([
        assessmentService.getAssessmentTypes(),
        assessmentService.getAssessmentHistory(),
      ]);
      
      // Load detailed assessment types with questions
      const typesArray = Array.isArray(types) ? types : [];
      const detailedTypes = await Promise.all(
        typesArray.map(async (type) => {
          try {
            // Get detailed assessment type with questions
            const detailedType = await assessmentService.getAssessmentType(type.id);
            return detailedType;
          } catch (error) {
            console.error(`Failed to load questions for assessment ${type.id}:`, error);
            // Return the basic type if detailed loading fails
            return type;
          }
        })
      );
      
      const historyArray = Array.isArray(history) ? history : [];
      
      setAssessmentTypes(detailedTypes);
      setRecentAssessments(historyArray.slice(0, 3));
      setStats(calculateStats(historyArray));
      
      // Load admin data if user is admin
      if (user?.role === 'admin' && !adminDataLoaded) {
        loadAdminData();
      }
      
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setAssessmentTypes([]);
      setRecentAssessments([]);
      toast({
        title: 'Error',
        description: 'Failed to load assessments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const [questionsData, requestsData, submissionsData] = await Promise.all([
        assessmentService.getAllQuestions(),
        assessmentService.getAssessmentRequests(),
        assessmentService.getAllAssessments()
      ]);

      // Transform questions data to match interface
      const transformedQuestions = Array.isArray(questionsData) ? questionsData.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type || 'multiple_choice',
        options: q.options || [],
        assessment_type: q.assessment_type,
        order: q.question_number || 1,
        is_active: q.is_active !== false
      })) : [];

      // Transform requests data to match interface
      const transformedRequests = Array.isArray(requestsData) ? requestsData.map(r => ({
        id: r.id,
        client_name: r.requester?.username || 'Unknown',
        client_email: r.requester?.email || 'unknown@example.com',
        assessment_type: r.request_type || 'Unknown',
        requested_by: r.requester?.username || 'Unknown',
        requested_date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        due_date: r.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: (r.status === 'pending' ? 'pending' : r.status === 'approved' ? 'assigned' : 'completed') as 'pending' | 'assigned' | 'completed' | 'cancelled',
        priority: 'medium' as 'low' | 'medium' | 'high',
        notes: r.description || r.justification
      })) : [];

      // Transform submissions data to match interface
      const transformedSubmissions = Array.isArray(submissionsData) ? submissionsData.map(s => ({
        id: s.id,
        user_name: s.user?.full_name || s.user?.username || `${s.user?.first_name || ''} ${s.user?.last_name || ''}`.trim() || 'Unknown User',
        user_email: s.user?.email || 'unknown@example.com',
        assessment_type: s.assessment_type?.display_name || s.assessment_type?.name || 'Unknown',
        score: s.total_score,
        risk_level: s.risk_level as 'low' | 'medium' | 'high' | 'critical',
        completed_date: s.completed_at ? new Date(s.completed_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        completion_time: '8 minutes' // This would need to be calculated from actual data
      })) : [];

      setQuestions(transformedQuestions);
      setAssessmentRequests(transformedRequests);
      setUserSubmissions(transformedSubmissions);
      setAdminDataLoaded(true);

    } catch (error) {
      console.error('Failed to load admin data:', error);
      // Set empty arrays on error
      setQuestions([]);
      setAssessmentRequests([]);
      setUserSubmissions([]);
      setAdminDataLoaded(false);
    }
  };

  const generateMockQuestions = (): Question[] => {
    return [
      {
        id: 1,
        question_text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
        question_type: 'multiple_choice',
        assessment_type: 'PHQ9',
        order: 1,
        is_active: true,
        options: [
          { text: 'Not at all', value: 0 },
          { text: 'Several days', value: 1 },
          { text: 'More than half the days', value: 2 },
          { text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 2,
        question_text: 'Feeling nervous, anxious, or on edge?',
        question_type: 'multiple_choice',
        assessment_type: 'GAD7',
        order: 1,
        is_active: true,
        options: [
          { text: 'Not at all', value: 0 },
          { text: 'Several days', value: 1 },
          { text: 'More than half the days', value: 2 },
          { text: 'Nearly every day', value: 3 }
        ]
      }
    ];
  };

  const generateMockRequests = (): AssessmentRequest[] => {
    return [
      {
        id: 1,
        client_name: 'John Doe',
        client_email: 'john.doe@example.com',
        assessment_type: 'PHQ9',
        requested_by: 'Dr. Smith',
        requested_date: '2024-01-20',
        due_date: '2024-01-27',
        status: 'pending',
        priority: 'high',
        notes: 'Follow-up assessment after therapy session'
      },
      {
        id: 2,
        client_name: 'Jane Smith',
        client_email: 'jane.smith@example.com',
        assessment_type: 'GAD7',
        requested_by: 'Dr. Johnson',
        requested_date: '2024-01-19',
        due_date: '2024-01-26',
        status: 'assigned',
        priority: 'medium'
      }
    ];
  };

  const generateMockSubmissions = (): UserSubmission[] => {
    return [
      {
        id: 1,
        user_name: 'Alice Johnson',
        user_email: 'alice.johnson@example.com',
        assessment_type: 'PHQ9',
        score: 12,
        risk_level: 'medium',
        completed_date: '2024-01-18',
        completion_time: '8 minutes'
      },
      {
        id: 2,
        user_name: 'Bob Wilson',
        user_email: 'bob.wilson@example.com',
        assessment_type: 'GAD7',
        score: 8,
        risk_level: 'low',
        completed_date: '2024-01-17',
        completion_time: '6 minutes'
      },
      {
        id: 3,
        user_name: 'Carol Davis',
        user_email: 'carol.davis@example.com',
        assessment_type: 'PHQ9',
        score: 18,
        risk_level: 'high',
        completed_date: '2024-01-16',
        completion_time: '12 minutes'
      }
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'minimal': return 'bg-green-100 text-green-800';
      case 'mild': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'moderately_severe': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedAssessmentType === 'all' || question.assessment_type === selectedAssessmentType;
    return matchesSearch && matchesType;
  });

  const filteredRequests = assessmentRequests.filter(request => {
    const matchesSearch = request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.client_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredSubmissions = userSubmissions.filter(submission => {
    const matchesSearch = submission.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedAssessmentType === 'all' || submission.assessment_type === selectedAssessmentType;
    return matchesSearch && matchesType;
  });

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast({
      title: 'Success',
      description: 'Question deleted successfully',
    });
  };


  const getAssessmentIcon = (name: string) => {
    switch (name) {
      case 'PHQ9':
        return <Brain className="w-8 h-8 text-blue-600" />;
      case 'GAD7':
        return <Heart className="w-8 h-8 text-purple-600" />;
      case 'PCL5':
        return <Shield className="w-8 h-8 text-green-600" />;
      default:
        return <ClipboardList className="w-8 h-8 text-gray-600" />;
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Assessment Center
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Monitor your mental health with evidence-based assessments
              </p>
            </div>
            
            {/* Role-based Quick Actions */}
            <div className="flex gap-2">
              {user?.role === 'user' && (
                <Button 
                  onClick={() => navigate('/assessments/dashboard')}
                  className="bg-healthcare-primary hover:bg-blue-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  My Dashboard
                </Button>
              )}
          
            </div>
          </div>
        </div>





        {/* Available Assessments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Assessments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(assessmentTypes) && assessmentTypes.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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

        {/* Recent Assessments */}
        {recentAssessments.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Assessments</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/assessments/dashboard')}
                  className="hidden sm:flex"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/assessments/history')}
                >
                  View All History
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {recentAssessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getAssessmentIcon(assessment.assessment_type.name)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {assessment.assessment_type.display_name}
                          </h3>
                          <Badge className={getRiskLevelColor(assessment.risk_level)}>
                            {assessment.risk_level.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{assessment.interpretation}</p>
                        
                        {/* Enhanced Assessment Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-gray-500">Score</p>
                              <p className="text-sm font-medium">
                                {assessment.total_score}/{assessment.assessment_type.max_score} 
                                <span className="text-gray-500 ml-1">
                                  ({Math.round((assessment.total_score / assessment.assessment_type.max_score) * 100)}%)
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-xs text-gray-500">Completed</p>
                              <p className="text-sm font-medium">
                                {new Date(assessment.completed_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-purple-500" />
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="text-sm font-medium">
                                {assessment.time_taken ? `${Math.round(assessment.time_taken / 60)} min` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Assessment Type Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
                          <span>{assessment.assessment_type.total_questions} questions</span>
                          <span>•</span>
                          <span>ID: {assessment.id}</span>
                          {assessment.created_at !== assessment.completed_at && (
                            <>
                              <span>•</span>
                              <span>Started: {new Date(assessment.created_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/assessments/results/${assessment.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/assessments/take/${assessment.assessment_type.id}`)}
                          className="text-xs"
                        >
                          Retake Assessment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Admin Management Section - Only visible to admins */}
        {user?.role === 'admin' && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>Manage assessment questions and client requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={adminTab} onValueChange={setAdminTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="questions">Question Management</TabsTrigger>
                    <TabsTrigger value="requests">Assessment Requests</TabsTrigger>
                    <TabsTrigger value="submissions">User Submissions</TabsTrigger>
                  </TabsList>

                  {/* Questions Tab */}
                  <TabsContent value="questions" className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <select
                        value={selectedAssessmentType}
                        onChange={(e) => setSelectedAssessmentType(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="all">All Types</option>
                        {assessmentTypes.map(type => (
                          <option key={type.id} value={type.name}>{type.display_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      {filteredQuestions.map((question) => (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <HelpCircle className="w-4 h-4 text-blue-500" />
                                <Badge variant="outline">{question.assessment_type}</Badge>
                                <Badge className={question.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {question.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-2">{question.question_text}</h4>
                              {question.options && (
                                <div className="ml-4 space-y-1">
                                  {question.options.map((option, index) => (
                                    <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                      {option.text} (Value: {option.value})
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteQuestion(question.id)}>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Assessment Requests Tab */}
                  <TabsContent value="requests" className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search by client name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <Badge className={getStatusColor(request.status)}>
                                  {request.status}
                                </Badge>
                                <Badge className={getPriorityColor(request.priority)}>
                                  {request.priority} priority
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-gray-900">{request.client_name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{request.client_email}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Assessment:</span> {request.assessment_type}
                                </div>
                                <div>
                                  <span className="font-medium">Requested by:</span> {request.requested_by}
                                </div>
                                <div>
                                  <span className="font-medium">Due:</span> {new Date(request.due_date).toLocaleDateString()}
                                </div>
                              </div>
                              {request.notes && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                  <span className="font-medium">Notes:</span> {request.notes}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              {request.status === 'pending' && (
                                <Button size="sm" className="bg-healthcare-primary hover:bg-blue-700">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Assign
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* User Submissions Tab */}
                  <TabsContent value="submissions" className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search by user name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <select
                        value={selectedAssessmentType}
                        onChange={(e) => setSelectedAssessmentType(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="all">All Types</option>
                        {assessmentTypes.map(type => (
                          <option key={type.id} value={type.name}>{type.display_name}</option>
                        ))}
                      </select>
                      <Button 
                        onClick={() => {
                          setAdminDataLoaded(false);
                          loadAdminData();
                        }}
                        variant="outline"
                      >
                        Refresh Data
                      </Button>
                    </div>

                    {!adminDataLoaded ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-healthcare-primary mr-2" />
                        <span>Loading user submissions...</span>
                      </div>
                    ) : filteredSubmissions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No user submissions found
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredSubmissions.map((submission) => (
                        <div key={submission.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                <Badge variant="outline">{submission.assessment_type}</Badge>
                                <Badge className={getRiskLevelColor(submission.risk_level)}>
                                  {submission.risk_level} risk
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-gray-900">{submission.user_name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{submission.user_email}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Score:</span> {submission.score}
                                </div>
                                <div>
                                  <span className="font-medium">Completed:</span> {new Date(submission.completed_date).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Duration:</span> {submission.completion_time}
                                </div>
                                <div>
                                  <span className="font-medium">Risk Level:</span> 
                                  <span className={`ml-1 px-2 py-1 rounded text-xs ${getRiskLevelColor(submission.risk_level)}`}>
                                    {submission.risk_level}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  // TODO: Implement view details modal/page
                                  console.log('View details for submission:', submission);
                                  toast({
                                    title: 'Assessment Details',
                                    description: `${submission.user_name} completed ${submission.assessment_type} with ${submission.risk_level} risk level (Score: ${submission.score})`,
                                  });
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              {submission.risk_level === 'high' || submission.risk_level === 'critical' ? (
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                  <AlertTriangle className="w-4 h-4 mr-1" />
                                  Follow Up
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AssessmentCenter;
