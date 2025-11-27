import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Loader2, Save } from 'lucide-react';
import assessmentService, { AssessmentType, AssessmentResponse, TakeAssessmentData } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Remove unused interfaces as we're using the ones from assessmentService

const TakeAssessment: React.FC = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [assessmentType, setAssessmentType] = useState<AssessmentType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadAssessment();
  }, [type, id]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      
      // Use type parameter from URL (e.g., /assessments/take/1 or /assessments/take/anxiety)
      const assessmentId = type || id;
      
      // Debug logging
      console.log('TakeAssessment - URL params:', { type, id });
      console.log('TakeAssessment - Assessment ID:', assessmentId);
      
      if (!assessmentId) {
        console.error('No assessment ID provided in URL');
        toast({
          title: 'Error',
          description: 'Assessment ID is required. Please select an assessment from the main page.',
          variant: 'destructive',
        });
        navigate('/assessments');
        return;
      }

      // Try to parse as number first, then fallback to string for name-based lookup
      let data: AssessmentType;
      const numericId = parseInt(assessmentId);
      
      if (!isNaN(numericId)) {
        data = await assessmentService.getAssessmentType(numericId);
      } else {
        // Convert common names to proper assessment type names
        const nameMap: Record<string, string> = {
          'anxiety': 'GAD7',
          'depression': 'PHQ9',
          'ptsd': 'PCL5',
          'gad7': 'GAD7',
          'phq9': 'PHQ9',
          'pcl5': 'PCL5'
        };
        const mappedName = nameMap[assessmentId.toLowerCase()] || assessmentId.toUpperCase();
        data = await assessmentService.getAssessmentTypeByName(mappedName);
      }
      
      setAssessmentType(data);
      
      console.log('Loaded assessment type:', data);
      console.log('Assessment questions:', data.questions);
      console.log('Questions count:', data.questions?.length || 0);
      
      // Initialize responses array
      if (data.questions && data.questions.length > 0) {
        const initialResponses = data.questions.map(q => ({
          question_id: q.id,
          selected_option_index: -1
        }));
        console.log('Initial responses array:', initialResponses);
        setResponses(initialResponses);
      } else {
        console.error('No questions found for assessment type:', data);
        console.error('Assessment type details:', {
          id: data.id,
          name: data.name,
          display_name: data.display_name,
          total_questions: data.total_questions,
          questions_array_length: data.questions?.length || 0
        });
        
        toast({
          title: 'Assessment Configuration Error',
          description: `The assessment "${data.display_name}" has no questions configured. Please contact an administrator.`,
          variant: 'destructive',
        });
        navigate('/assessments');
        return;
      }
    } catch (error) {
      console.error('Failed to load assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assessment. Please try again.',
        variant: 'destructive',
      });
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    setResponses(prev => {
      const updated = [...prev];
      updated[questionIndex] = {
        ...updated[questionIndex],
        selected_option_index: optionIndex
      };
      return updated;
    });
  };

  const handleNext = () => {
    if (assessmentType && currentQuestion < assessmentType.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessmentType || !user) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate all questions are answered
      const unansweredQuestions = responses.filter(r => r.selected_option_index === -1);
      if (unansweredQuestions.length > 0) {
        toast({
          title: 'Incomplete Assessment',
          description: `Please answer all questions. ${unansweredQuestions.length} questions remaining.`,
          variant: 'destructive',
        });
        return;
      }
      
      // Validate that all response question IDs belong to this assessment type
      const assessmentQuestionIds = assessmentType.questions?.map(q => q.id) || [];
      const responseQuestionIds = responses.map(r => r.question_id);
      const invalidQuestionIds = responseQuestionIds.filter(id => !assessmentQuestionIds.includes(id));
      
      if (invalidQuestionIds.length > 0) {
        console.error('Invalid question IDs found:', invalidQuestionIds);
        console.error('Assessment question IDs:', assessmentQuestionIds);
        console.error('Response question IDs:', responseQuestionIds);
        toast({
          title: 'Data Validation Error',
          description: 'Some questions do not belong to this assessment type. Please refresh and try again.',
          variant: 'destructive',
        });
        return;
      }
      
      const submissionData: TakeAssessmentData = {
        assessment_type_id: assessmentType.id,
        responses: responses
      };

      console.log('Submitting assessment to database:', submissionData);
      console.log('Assessment Type:', assessmentType);
      console.log('User:', user);
      
      const result = await assessmentService.submitAssessment(submissionData);
      console.log('Assessment submitted successfully:', result);
      
      setResult(result);
      setIsCompleted(true);
      
      toast({
        title: 'Assessment Completed',
        description: 'Your assessment has been saved to the database and is now available in your history.',
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit assessment to database. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = () => {
    return responses.reduce((sum, response) => {
      return sum + (response.selected_option_index >= 0 ? response.selected_option_index : 0);
    }, 0);
  };

  const getScoreInterpretation = (score: number) => {
    if (assessmentType?.name === 'GAD7') {
      if (score <= 4) return { level: 'Minimal', color: 'text-green-600', description: 'Minimal anxiety' };
      if (score <= 9) return { level: 'Mild', color: 'text-yellow-600', description: 'Mild anxiety' };
      if (score <= 14) return { level: 'Moderate', color: 'text-orange-600', description: 'Moderate anxiety' };
      return { level: 'Severe', color: 'text-red-600', description: 'Severe anxiety' };
    } else {
      if (score <= 4) return { level: 'Minimal', color: 'text-green-600', description: 'Minimal depression' };
      if (score <= 9) return { level: 'Mild', color: 'text-yellow-600', description: 'Mild depression' };
      if (score <= 14) return { level: 'Moderate', color: 'text-orange-600', description: 'Moderate depression' };
      return { level: 'Severe', color: 'text-red-600', description: 'Severe depression' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary"></div>
      </div>
    );
  }

  if (!assessmentType) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h1>
          <Button onClick={() => navigate('/assessments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const score = calculateScore();
    const interpretation = getScoreInterpretation(score);
    
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Assessment Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{assessmentType.display_name}</h3>
                <div className="text-3xl font-bold mb-2">
                  Score: {score}/{assessmentType.max_score}
                </div>
                <div className={`text-lg font-semibold ${interpretation.color}`}>
                  {interpretation.level} - {interpretation.description}
                </div>
              </div>

              {score >= 10 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Your score indicates you may benefit from speaking with a mental health professional. 
                    Consider reaching out for support.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/assessments/history')}
                  className="bg-healthcare-primary hover:bg-blue-700"
                >
                  View Assessment History
                </Button>
                <Button variant="outline" onClick={() => navigate('/assessments')}>
                  Take Another Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQ = assessmentType.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessmentType.questions.length) * 100;
  const currentAnswer = responses[currentQuestion]?.selected_option_index;

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/assessments')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assessments
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-healthcare-primary" />
              <div>
                <CardTitle className="text-xl">{assessmentType.display_name}</CardTitle>
                <p className="text-sm text-gray-600">{assessmentType.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Question {currentQuestion + 1} of {assessmentType.questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Over the last 2 weeks, how often have you been bothered by:
              </h3>
              <p className="text-gray-900 font-medium">{currentQ.question_text}</p>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion, index)}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    currentAnswer === index
                      ? 'border-healthcare-primary bg-blue-50 text-healthcare-primary'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      currentAnswer === index
                        ? 'border-healthcare-primary bg-healthcare-primary'
                        : 'border-gray-300'
                    }`}>
                      {currentAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={currentQuestion === assessmentType.questions.length - 1 ? handleSubmit : handleNext}
                disabled={currentAnswer === undefined || currentAnswer === -1 || isSubmitting}
                className="bg-healthcare-primary hover:bg-blue-700"
              >
                {currentQuestion === assessmentType.questions.length - 1 ? 'Complete Assessment' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TakeAssessment;
