import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, X, Save, AlertCircle, Search, 
  MoreHorizontal, Eye, BarChart3, Brain, FileText, Settings,
  Users, Target, Award, TrendingUp, Filter, Download, Clipboard,
  BookOpen, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { 
  questionService, 
  AssessmentTypeWithQuestions, 
  AssessmentQuestion, 
  QuestionOption, 
  CreateQuestionData 
} from '@/services/questionService';

const QuestionManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentTypeWithQuestions[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentTypeWithQuestions | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<'overview' | 'questions' | 'analytics'>('overview');
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReadableView, setShowReadableView] = useState(false);

  // New question form state
  const [newQuestion, setNewQuestion] = useState<{
    question_text: string;
    question_type: 'multiple_choice' | 'multiple_select' | 'text_input' | 'rating_scale' | 'yes_no' | 'likert_scale';
    options: QuestionOption[];
    is_reverse_scored: boolean;
    is_required: boolean;
    min_value?: number;
    max_value?: number;
    scale_labels?: string[];
  }>({
    question_text: '',
    question_type: 'multiple_choice',
    options: [
      { text: 'Not at all', score: 0 },
      { text: 'Several days', score: 1 },
      { text: 'More than half the days', score: 2 },
      { text: 'Nearly every day', score: 3 }
    ],
    is_reverse_scored: false,
    is_required: true,
    min_value: undefined,
    max_value: undefined,
    scale_labels: undefined
  });

  useEffect(() => {
    loadAssessmentTypes();
  }, []);

  const getDefaultOptionsForType = (questionType: string): QuestionOption[] => {
    switch (questionType) {
      case 'multiple_choice':
      case 'likert_scale':
        return [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ];
      case 'multiple_select':
        return [
          { text: 'Option 1', score: 1 },
          { text: 'Option 2', score: 1 },
          { text: 'Option 3', score: 1 }
        ];
      case 'yes_no':
        return [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 1 }
        ];
      case 'rating_scale':
        return [
          { text: '1', score: 1 },
          { text: '2', score: 2 },
          { text: '3', score: 3 },
          { text: '4', score: 4 },
          { text: '5', score: 5 }
        ];
      case 'text_input':
        return [];
      default:
        return [];
    }
  };

  const renderQuestionTypeFields = () => {
    switch (newQuestion.question_type) {
      case 'rating_scale':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-value">Minimum Value</Label>
              <Input
                id="min-value"
                type="number"
                value={newQuestion.min_value || 1}
                onChange={(e) => setNewQuestion({ 
                  ...newQuestion, 
                  min_value: parseInt(e.target.value) || 1 
                })}
              />
            </div>
            <div>
              <Label htmlFor="max-value">Maximum Value</Label>
              <Input
                id="max-value"
                type="number"
                value={newQuestion.max_value || 5}
                onChange={(e) => setNewQuestion({ 
                  ...newQuestion, 
                  max_value: parseInt(e.target.value) || 5 
                })}
              />
            </div>
          </div>
        );
      case 'text_input':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Text input questions allow users to provide open-ended responses. No predefined options are needed.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const loadAssessmentTypes = async () => {
    setLoading(true);
    try {
      const types = await questionService.getAssessmentTypesWithQuestions();
      console.log('Loaded assessment types:', types);
      
      // Ensure types is an array
      if (Array.isArray(types)) {
        setAssessmentTypes(types);
        if (types.length > 0) {
          setSelectedAssessment(types[0]);
        }
      } else {
        console.error('Assessment types response is not an array:', types);
        setAssessmentTypes([]);
        toast({
          title: 'Data Format Error',
          description: 'Received invalid data format from server. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load assessment types:', error);
      setAssessmentTypes([]);
      
      // Check if it's a 404 (no assessment types exist) vs other errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isNotFound = errorMessage.includes('Not found') || errorMessage.includes('404');
      
      toast({
        title: isNotFound ? 'No Assessment Types Found' : 'Error',
        description: isNotFound 
          ? 'No assessment types are available. Please contact an administrator to create assessment types.'
          : 'Failed to load assessment types. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateQuestion = async () => {
    if (!selectedAssessment || !newQuestion.question_text.trim()) {
      toast({
        title: 'Error',
        description: 'Question text is required',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const questionData: CreateQuestionData = {
        assessment_type: selectedAssessment.id,
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type,
        options: newQuestion.options,
        is_reverse_scored: newQuestion.is_reverse_scored,
        is_required: newQuestion.is_required,
        min_value: newQuestion.min_value,
        max_value: newQuestion.max_value,
        scale_labels: newQuestion.scale_labels
      };

      const createdQuestion = await questionService.createQuestion(questionData);
      
      const updatedAssessment = {
        ...selectedAssessment,
        questions: [...selectedAssessment.questions, createdQuestion],
        total_questions: selectedAssessment.total_questions + 1,
        max_score: selectedAssessment.max_score + Math.max(...newQuestion.options.map(o => o.score))
      };
      setSelectedAssessment(updatedAssessment);

      setAssessmentTypes(prev => 
        prev.map(type => type.id === selectedAssessment.id ? updatedAssessment : type)
      );

      toast({
        title: 'Success',
        description: 'Question created successfully'
      });

      resetForm();
    } catch (error) {
      console.error('Failed to create question:', error);
      toast({
        title: 'Error',
        description: 'Failed to create question',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuestion = (question: AssessmentQuestion) => {
    setEditingQuestion(question);
    setNewQuestion({
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options,
      is_reverse_scored: question.is_reverse_scored,
      is_required: question.is_required,
      min_value: question.min_value,
      max_value: question.max_value,
      scale_labels: question.scale_labels
    });
    setIsCreatingNew(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !selectedAssessment || !newQuestion.question_text.trim()) {
      toast({
        title: 'Error',
        description: 'Question text is required',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const updatedQuestion = await questionService.updateQuestion(editingQuestion.id!, {
        question_text: newQuestion.question_text,
        options: newQuestion.options,
        is_reverse_scored: newQuestion.is_reverse_scored
      });

      const updatedAssessment = {
        ...selectedAssessment,
        questions: selectedAssessment.questions.map(q => 
          q.id === editingQuestion.id ? updatedQuestion : q
        )
      };
      setSelectedAssessment(updatedAssessment);

      setAssessmentTypes(prev => 
        prev.map(type => type.id === selectedAssessment.id ? updatedAssessment : type)
      );

      toast({
        title: 'Success',
        description: 'Question updated successfully'
      });

      resetForm();
    } catch (error) {
      console.error('Failed to update question:', error);
      toast({
        title: 'Error',
        description: 'Failed to update question',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!selectedAssessment) return;

    setSaving(true);
    try {
      await questionService.deleteQuestion(questionId);
      
      const updatedAssessment = {
        ...selectedAssessment,
        questions: selectedAssessment.questions.filter(q => q.id !== questionId),
        total_questions: selectedAssessment.total_questions - 1
      };
      setSelectedAssessment(updatedAssessment);

      setAssessmentTypes(prev => 
        prev.map(type => type.id === selectedAssessment.id ? updatedAssessment : type)
      );

      toast({
        title: 'Success',
        description: 'Question deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { text: '', score: 0 }]
    });
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleUpdateOption = (optionIndex: number, field: 'text' | 'score', value: string | number) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      [field]: value
    };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const resetForm = () => {
    setNewQuestion({
      question_text: '',
      question_type: 'multiple_choice',
      options: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 }
      ],
      is_reverse_scored: false,
      is_required: true,
      min_value: undefined,
      max_value: undefined,
      scale_labels: undefined
    });
    setIsCreatingNew(false);
    setEditingQuestion(null);
  };

  const canEdit = user?.role === 'admin' || user?.role === 'guide';

  const handleContentTypeSelect = (type: 'overview' | 'questions' | 'analytics') => {
    setSelectedContentType(type);
  };

  const getAssessmentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'phq9':
      case 'depression':
        return <Brain className="w-6 h-6" />;
      case 'gad7':
      case 'anxiety':
        return <Target className="w-6 h-6" />;
      case 'pcl5':
      case 'ptsd':
        return <Award className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const filteredQuestions = selectedAssessment?.questions.filter(q => 
    (q.text || q.question_text || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
                  Question Manager
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Create and manage assessment questions with professional tools
                </p>
              </div>
              {canEdit && selectedAssessment && (
                <Button 
                  onClick={() => setIsCreatingNew(true)}
                  className="bg-healthcare-primary hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              )}
            </div>
          </div>

          {/* Assessment Type Cards */}
          {!Array.isArray(assessmentTypes) || assessmentTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <Clipboard className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Types Available</h3>
              <p className="text-gray-500 mb-4">
                No assessment types have been created yet. Contact an administrator to set up assessment types.
              </p>
              {user?.role === 'admin' && (
                <p className="text-sm text-blue-600">
                  As an admin, you can create assessment types through the admin panel.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.isArray(assessmentTypes) && assessmentTypes.map((assessment) => (
              <Card 
                key={assessment.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedAssessment?.id === assessment.id 
                    ? 'ring-2 ring-healthcare-primary bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedAssessment(assessment)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      {getAssessmentIcon(assessment.name)}
                    </div>
                    <Badge variant="secondary">{assessment.questions.length} questions</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{assessment.display_name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{assessment.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Max Score: {assessment.max_score}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      assessment.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {assessment.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}

          {/* Content Type Navigation Cards */}
          {selectedAssessment && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedContentType === 'overview' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleContentTypeSelect('overview')}
              >
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600 w-fit mx-auto mb-4">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
                  <p className="text-sm text-gray-600">Assessment statistics and details</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedContentType === 'questions' 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleContentTypeSelect('questions')}
              >
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600 w-fit mx-auto mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Questions</h3>
                  <p className="text-sm text-gray-600">Manage assessment questions</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedContentType === 'analytics' 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleContentTypeSelect('analytics')}
              >
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600 w-fit mx-auto mb-4">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600">Question performance insights</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dynamic Content Area */}
          {selectedAssessment && (
            <div className="space-y-6">
              {selectedContentType === 'overview' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      {selectedAssessment.display_name} Overview
                    </CardTitle>
                    <p className="text-gray-600">{selectedAssessment.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {selectedAssessment.questions.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Questions</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {selectedAssessment.max_score}
                        </div>
                        <div className="text-sm text-gray-600">Max Score</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {selectedAssessment.questions.filter(q => q.is_required).length}
                        </div>
                        <div className="text-sm text-gray-600">Required Questions</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className={`text-3xl font-bold mb-2 ${
                          selectedAssessment.is_active ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedAssessment.is_active ? 'Active' : 'Inactive'}
                        </div>
                        <div className="text-sm text-gray-600">Status</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedContentType === 'questions' && (
                <div className="space-y-6">
                  {/* Search and Actions */}
                  <div className="flex justify-between items-center">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => setShowReadableView(!showReadableView)}
                        className="bg-blue-50 hover:bg-blue-100"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        {showReadableView ? 'Hide' : 'Read'} Questions
                        {showReadableView ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                      </Button>
                      {canEdit && (
                        <Button 
                          onClick={() => setIsCreatingNew(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Question
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Readable Questions View */}
                  {showReadableView && filteredQuestions.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          Readable Questions Preview ({filteredQuestions.length})
                        </CardTitle>
                        <p className="text-gray-600">Preview how questions will appear to users taking the assessment</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {filteredQuestions.map((question, index) => (
                            <div key={question.id} className="p-4 bg-gray-50 rounded-lg border">
                              <div className="flex items-start gap-3 mb-3">
                                <Badge variant="outline" className="mt-1">Q{question.question_number}</Badge>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 mb-2">
                                    {question.question_text}
                                  </p>
                                  <div className="flex gap-2 mb-3">
                                    <Badge variant="secondary" className="text-xs">
                                      {question.question_type.replace('_', ' ')}
                                    </Badge>
                                    {question.is_required && (
                                      <Badge variant="default" className="text-xs">Required</Badge>
                                    )}
                                    {question.is_reverse_scored && (
                                      <Badge variant="outline" className="text-xs">Reverse Scored</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {question.options && question.options.length > 0 && (
                                <div className="ml-8 space-y-2">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Answer Options:</p>
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center gap-3 p-2 bg-white rounded border">
                                      <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                      <span className="flex-1 text-sm text-gray-800">{option.text}</span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Score: {option.score}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Start Quiz Button */}
                          <div className="pt-4 border-t border-gray-200">
                            <Button 
                              className="w-full bg-healthcare-primary hover:bg-blue-700"
                              onClick={() => {
                                if (selectedAssessment) {
                                  console.log('Start Quiz clicked for assessment:', selectedAssessment.id);
                                  console.log('User role:', user?.role);
                                  window.location.href = `/assessments/take/${selectedAssessment.id}`;
                                }
                              }}
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Start Quiz - {selectedAssessment?.display_name}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Questions Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Questions ({filteredQuestions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {filteredQuestions.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                          <p className="text-gray-600 mb-4">
                            {searchTerm ? 'No questions match your search.' : 'Get started by adding your first question.'}
                          </p>
                          {canEdit && !searchTerm && (
                            <Button onClick={() => setIsCreatingNew(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add First Question
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Question</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Options</TableHead>
                              <TableHead>Required</TableHead>
                              <TableHead>Score Range</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredQuestions.map((question) => (
                              <TableRow key={question.id}>
                                <TableCell>
                                  <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-1">Q{question.question_number}</Badge>
                                    <div>
                                      <p className="font-medium text-gray-900 line-clamp-2">{question.question_text}</p>
                                      {question.is_reverse_scored && (
                                        <Badge variant="secondary" className="mt-1 text-xs">Reverse Scored</Badge>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{question.question_type.replace('_', ' ')}</Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-600">{question.options.length} options</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={question.is_required ? 'default' : 'secondary'}>
                                    {question.is_required ? 'Required' : 'Optional'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-600">
                                    {Math.min(...question.options.map(o => o.score))} - {Math.max(...question.options.map(o => o.score))}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      {canEdit && (
                                        <>
                                          <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleDeleteQuestion(question.id!)}
                                            className="text-red-600"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedContentType === 'analytics' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Question Analytics
                    </CardTitle>
                    <p className="text-gray-600">Performance insights and response patterns</p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                      <p className="text-gray-600">Detailed question performance analytics will be available here.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Question Form Modal */}
              {isCreatingNew && (
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={resetForm}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="question-text">Question Text</Label>
                        <textarea
                          id="question-text"
                          className="w-full p-3 border rounded-lg resize-none mt-1 min-h-[100px]"
                          value={newQuestion.question_text}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                          placeholder="Enter your question here..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="question-type">Question Type</Label>
                        <select
                          id="question-type"
                          className="w-full p-3 border rounded-lg mt-1"
                          value={newQuestion.question_type}
                          onChange={(e) => {
                            const questionType = e.target.value as typeof newQuestion.question_type;
                            setNewQuestion({ 
                              ...newQuestion, 
                              question_type: questionType,
                              options: getDefaultOptionsForType(questionType)
                            });
                          }}
                        >
                          <option value="multiple_choice">Multiple Choice (Single Answer)</option>
                          <option value="multiple_select">Multiple Choice (Multiple Answers)</option>
                          <option value="text_input">Text Input (Open Question)</option>
                          <option value="rating_scale">Rating Scale</option>
                          <option value="yes_no">Yes/No</option>
                          <option value="likert_scale">Likert Scale</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="reverse-scored"
                            checked={newQuestion.is_reverse_scored}
                            onChange={(e) => setNewQuestion({ ...newQuestion, is_reverse_scored: e.target.checked })}
                          />
                          <Label htmlFor="reverse-scored">Reverse scored question</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="required"
                            checked={newQuestion.is_required}
                            onChange={(e) => setNewQuestion({ ...newQuestion, is_required: e.target.checked })}
                          />
                          <Label htmlFor="required">Required question</Label>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic form fields based on question type */}
                    {renderQuestionTypeFields()}

                    {/* Options for multiple choice questions */}
                    {(newQuestion.question_type === 'multiple_choice' || 
                      newQuestion.question_type === 'multiple_select' || 
                      newQuestion.question_type === 'yes_no' || 
                      newQuestion.question_type === 'likert_scale' ||
                      newQuestion.question_type === 'rating_scale') && (
                      <div>
                        <Label className="text-base font-medium">Answer Options</Label>
                        <div className="space-y-3 mt-3">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <span className="text-sm font-medium text-gray-500 w-8">{index + 1}.</span>
                              <Input
                                value={option.text}
                                onChange={(e) => handleUpdateOption(index, 'text', e.target.value)}
                                placeholder="Option text"
                                className="flex-1"
                              />
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-gray-500">Score:</Label>
                                <Input
                                  type="number"
                                  value={option.score}
                                  onChange={(e) => handleUpdateOption(index, 'score', parseInt(e.target.value) || 0)}
                                  className="w-20"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveOption(index)}
                                disabled={newQuestion.options.length <= 2}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleAddOption}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4 border-t">
                      <Button
                        onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                        disabled={saving || !newQuestion.question_text.trim()}
                        className="bg-healthcare-primary hover:bg-blue-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* No Assessment Selected */}
          {!selectedAssessment && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Select an Assessment</h3>
                <p className="text-gray-600">Choose an assessment type above to manage its questions and view analytics.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

export default QuestionManager;
