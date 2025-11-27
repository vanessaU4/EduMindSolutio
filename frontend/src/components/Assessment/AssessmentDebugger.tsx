import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Database, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import assessmentService, { AssessmentType } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Debug component to investigate assessment submission issues
 */
const AssessmentDebugger: React.FC = () => {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadAssessmentTypes = async () => {
    setLoading(true);
    try {
      const types = await assessmentService.getAssessmentTypes();
      setAssessmentTypes(Array.isArray(types) ? types : []);
      console.log('Loaded assessment types:', types);
    } catch (error) {
      console.error('Failed to load assessment types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assessment types',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testAssessmentSubmission = async (assessmentTypeId: number) => {
    try {
      console.log(`Testing submission for assessment type ID: ${assessmentTypeId}`);
      
      // Get the assessment type details
      const assessmentType = await assessmentService.getAssessmentType(assessmentTypeId);
      console.log('Assessment type details:', assessmentType);
      
      if (!assessmentType.questions || assessmentType.questions.length === 0) {
        setTestResults(prev => [...prev, {
          assessmentTypeId,
          status: 'error',
          message: 'No questions found for this assessment type',
          timestamp: new Date().toISOString()
        }]);
        return;
      }

      // Create test responses (select first option for each question)
      const testResponses = assessmentType.questions.map(question => ({
        question_id: question.id,
        selected_option_index: 0 // Select first option
      }));

      console.log('Test responses:', testResponses);

      const submissionData = {
        assessment_type_id: assessmentTypeId,
        responses: testResponses
      };

      const result = await assessmentService.submitAssessment(submissionData);
      
      setTestResults(prev => [...prev, {
        assessmentTypeId,
        status: 'success',
        message: `Successfully submitted test assessment. Score: ${result.total_score}`,
        result,
        timestamp: new Date().toISOString()
      }]);

      toast({
        title: 'Test Successful',
        description: `Assessment type ${assessmentTypeId} submission works!`,
      });

    } catch (error: any) {
      console.error(`Test failed for assessment type ${assessmentTypeId}:`, error);
      
      setTestResults(prev => [...prev, {
        assessmentTypeId,
        status: 'error',
        message: error.message || 'Unknown error',
        error: error,
        timestamp: new Date().toISOString()
      }]);

      toast({
        title: 'Test Failed',
        description: `Assessment type ${assessmentTypeId}: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    loadAssessmentTypes();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Assessment Submission Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current User:</strong> {user?.username || 'Not logged in'} | 
              <strong> Role:</strong> {user?.role || 'Unknown'} | 
              <strong> Authenticated:</strong> {user ? 'Yes' : 'No'}
            </AlertDescription>
          </Alert>

          {/* Assessment Types */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Available Assessment Types</h3>
              <div className="flex gap-2">
                <Button onClick={loadAssessmentTypes} disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh Types'}
                </Button>
                <Button onClick={clearResults} variant="outline">
                  Clear Results
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assessmentTypes.map((type) => (
                <Card key={type.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{type.display_name}</h4>
                        <Badge variant="secondary">ID: {type.id}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{type.name}</p>
                      <p className="text-xs text-gray-500">
                        Questions: {type.total_questions} | Max Score: {type.max_score}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => testAssessmentSubmission(type.id)}
                        className="w-full"
                      >
                        Test Submission
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {assessmentTypes.length === 0 && !loading && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  No assessment types found. This might be the root cause of the submission error.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Test Results</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <Alert key={index} className={
                    result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }>
                    {result.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      <div className="space-y-1">
                        <p><strong>Assessment Type ID {result.assessmentTypeId}:</strong> {result.message}</p>
                        <p className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</p>
                        {result.error && (
                          <details className="text-xs">
                            <summary>Error Details</summary>
                            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.error, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentDebugger;
