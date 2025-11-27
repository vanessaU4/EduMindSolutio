import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, TrendingUp, Users, Target, RefreshCw, Download, Filter
} from 'lucide-react';
import { 
  questionService, 
  QuestionAnalytics as QuestionAnalyticsType,
  AnalyticsResponse 
} from '@/services/questionService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const QuestionAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionAnalyticsType | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await questionService.getQuestionAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalytics(null);
      toast({
        title: 'Error',
        description: 'Failed to load question analytics. Please check your connection.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const analyticsData = analytics as any;
    if (!analyticsData || !analyticsData.questionPerformance) return null;
    
    return {
      totalQuestions: analyticsData.questionPerformance.length,
      averageScore: analyticsData.questionPerformance.reduce((sum: number, q: any) => sum + q.average_score, 0) / analyticsData.questionPerformance.length,
      averageCompletion: analyticsData.questionPerformance.reduce((sum: number, q: any) => sum + q.completionRate, 0) / analyticsData.questionPerformance.length
    };
  };

  const stats = calculateStats();
  const canViewAnalytics = user?.role === 'admin' || user?.role === 'guide';

  if (!canViewAnalytics) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            You don't have permission to view question analytics. This feature is available to guides and administrators only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Analytics</h1>
          <p className="text-gray-600 mt-2">Real-time insights into question performance and user responses</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Responses/Question</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgResponsesPerQuestion}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Most Answered</p>
                  <p className="text-sm font-bold text-gray-900">
                    {stats.mostAnsweredQuestion ? `${stats.mostAnsweredQuestion.total_responses} responses` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Questions Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Question Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(analytics as any)?.questionPerformance && (analytics as any).questionPerformance.length > 0 ? (
              (analytics as any).questionPerformance.map((question: any) => (
              <div
                key={question.question_id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedQuestion?.question_id === question.question_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedQuestion(question)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{question.assessment_type}</Badge>
                      <Badge variant="secondary">{question.total_responses} responses</Badge>
                    </div>
                    <p className="font-medium text-sm mb-2">{question.question_text}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span>Avg Score: {question.average_score.toFixed(1)}</span>
                      <span>ID: {question.question_id}</span>
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Available</h3>
                <p className="text-gray-500">No question performance data available to display</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Response Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedQuestion ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{selectedQuestion.question_text}</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge>{selectedQuestion.assessment_type}</Badge>
                    <Badge variant="outline">{selectedQuestion.total_responses} total responses</Badge>
                    <Badge variant="secondary">Avg: {selectedQuestion.average_score.toFixed(1)}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedQuestion.options.map((option, index) => {
                    const count = selectedQuestion.option_distribution[option.text] || 0;
                    const percentage = selectedQuestion.option_percentages[option.text] || 0;
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{option.text}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">Score: {option.score}</Badge>
                            <span>{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Responses:</span>
                      <span className="ml-2 font-medium">{selectedQuestion.total_responses}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Average Score:</span>
                      <span className="ml-2 font-medium">{selectedQuestion.average_score.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Question</h3>
                <p className="text-gray-500">Choose a question from the left to view detailed analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Question Performance</h4>
              <div className="space-y-2">
                {(analytics as any)?.questionPerformance && (analytics as any).questionPerformance.length > 0 ? (
                  (analytics as any).questionPerformance.map((question: any) => {
                    const responseRate = (question.total_responses / ((analytics as any).totalResponses / (analytics as any).totalQuestions)) * 100;
                    const isHighPerforming = responseRate > 80;
                    const isLowPerforming = responseRate < 50;
                    
                    return (
                      <div key={question.question_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate flex-1">{question.question_text.substring(0, 40)}...</span>
                        <Badge 
                          variant={isHighPerforming ? "default" : isLowPerforming ? "destructive" : "secondary"}
                          className="ml-2"
                        >
                          {responseRate.toFixed(1)}%
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No performance data available
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm">
                {stats?.leastAnsweredQuestion && 'question_text' in stats.leastAnsweredQuestion && (
                  <Alert>
                    <AlertDescription>
                      Consider reviewing question "{String(stats.leastAnsweredQuestion.question_text).substring(0, 30)}..." 
                      as it has the lowest response rate ({stats.leastAnsweredQuestion.total_responses} responses).
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    💡 <strong>Tip:</strong> Questions with average scores consistently above 2.5 may indicate 
                    areas where users need additional support or resources.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800">
                    ✅ <strong>Good Practice:</strong> Regularly review question analytics to identify 
                    patterns and improve assessment effectiveness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionAnalytics;
