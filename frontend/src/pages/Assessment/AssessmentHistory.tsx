import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Calendar, Loader2, RefreshCw } from 'lucide-react';
import assessmentService, { Assessment } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AssessmentHistory: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AssessmentHistory component mounted, loading history...');
    loadHistory();
  }, []);

  // Refresh history when component becomes visible (e.g., after completing an assessment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadHistory();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      console.log('Loading assessment history...');
      const data = await assessmentService.getAssessmentHistory();
      console.log('Assessment history loaded:', data);
      
      // Handle both paginated response and direct array
      let assessmentArray: Assessment[] = [];
      if (Array.isArray(data)) {
        assessmentArray = data;
      } else if (data && data.results && Array.isArray(data.results)) {
        assessmentArray = data.results;
      }
      
      console.log('History count:', assessmentArray.length);
      console.log('Assessment array:', assessmentArray);
      setAssessments(assessmentArray);
    } catch (error) {
      console.error('Failed to load assessment history:', error);
      setAssessments([]);
      toast({
        title: 'Error',
        description: 'Failed to load assessment history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Assessment History</h1>
            <Button
              variant="outline"
              onClick={() => {
                console.log('Manual refresh clicked');
                loadHistory();
              }}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Track your mental health assessment progress over time</p>
        </div>

        {assessments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No assessment history yet</p>
              <p className="text-sm text-gray-500 mb-6">Take your first assessment to start tracking your progress</p>
              <Button
                onClick={() => navigate('/assessments')}
                className="bg-healthcare-primary hover:bg-blue-700"
              >
                Take Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {assessment.assessment_type.display_name}
                        </h3>
                        <Badge className={getRiskLevelColor(assessment.risk_level)}>
                          {assessment.risk_level.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{assessment.interpretation}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Score: {assessment.total_score}/{assessment.assessment_type.max_score}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(assessment.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/assessments/results/${assessment.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AssessmentHistory;
