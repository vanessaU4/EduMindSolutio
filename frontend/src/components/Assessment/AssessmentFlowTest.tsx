import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Database, History, AlertCircle } from 'lucide-react';
import assessmentService, { TakeAssessmentData } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';

/**
 * Test component to verify assessment submission and history retrieval flow
 * This component helps verify that assessments are properly saved to database
 * and displayed in assessment history
 */
const AssessmentFlowTest: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const { toast } = useToast();

  const testSubmission = async () => {
    setIsSubmitting(true);
    try {
      // Create a test assessment submission
      const testData: TakeAssessmentData = {
        assessment_type_id: 1, // PHQ9
        responses: [
          { question_id: 1, selected_option_index: 1 },
          { question_id: 2, selected_option_index: 2 },
        ]
      };

      console.log('Testing assessment submission...');
      const result = await assessmentService.submitAssessment(testData);
      setLastSubmission(result);
      
      toast({
        title: 'Test Submission Successful',
        description: 'Assessment was successfully submitted to database',
      });
    } catch (error: any) {
      console.error('Test submission failed:', error);
      toast({
        title: 'Test Submission Failed',
        description: error.message || 'Failed to submit test assessment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const testHistoryRetrieval = async () => {
    setIsLoadingHistory(true);
    try {
      console.log('Testing assessment history retrieval...');
      const history = await assessmentService.getAssessmentHistory();
      setHistoryData(history);
      
      toast({
        title: 'History Retrieval Successful',
        description: `Retrieved ${history.length} assessments from database`,
      });
    } catch (error: any) {
      console.error('History retrieval failed:', error);
      toast({
        title: 'History Retrieval Failed',
        description: error.message || 'Failed to retrieve assessment history',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Assessment Database Flow Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={testSubmission}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Test Submission'}
          </Button>
          
          <Button
            onClick={testHistoryRetrieval}
            disabled={isLoadingHistory}
            variant="outline"
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            {isLoadingHistory ? 'Loading...' : 'Test History Retrieval'}
          </Button>
        </div>

        {/* Last Submission Result */}
        {lastSubmission && (
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Last Submission Result
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {lastSubmission.id}</p>
              <p><strong>Assessment Type:</strong> {lastSubmission.assessment_type?.display_name}</p>
              <p><strong>Score:</strong> {lastSubmission.total_score}</p>
              <p><strong>Risk Level:</strong> 
                <Badge className="ml-2" variant="secondary">
                  {lastSubmission.risk_level}
                </Badge>
              </p>
              <p><strong>Completed At:</strong> {new Date(lastSubmission.completed_at).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* History Data */}
        {historyData.length > 0 && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <History className="w-4 h-4" />
              Assessment History ({historyData.length} records)
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {historyData.map((assessment, index) => (
                <div key={assessment.id || index} className="bg-white p-3 rounded border text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{assessment.assessment_type?.display_name}</p>
                      <p className="text-gray-600">Score: {assessment.total_score}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{assessment.risk_level}</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(assessment.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="border rounded-lg p-4 bg-yellow-50">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Testing Instructions
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>1. Click "Test Submission" to submit a test assessment to the database</p>
            <p>2. Click "Test History Retrieval" to fetch all assessments from the database</p>
            <p>3. Check the browser console for detailed logging of database operations</p>
            <p>4. Verify that submitted assessments appear in the history</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentFlowTest;
