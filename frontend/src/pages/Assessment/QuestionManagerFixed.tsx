import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      setAssessmentTypes(types);
      if (types.length > 0) {
        setSelectedAssessment(types[0]);
      }
    } catch (error) {
      console.error('Failed to load assessment types:', error);
      setAssessmentTypes([]);
      toast({
        title: 'Error',
        description: 'Failed to load assessment types. Please check your connection.',
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
        assessment_type_id: selectedAssessment.id,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Manager</h1>
          <p className="text-gray-600 mt-1">Manage assessment questions and answer options</p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsCreatingNew(true)} disabled={!selectedAssessment}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Assessment Types Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assessmentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedAssessment(type)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedAssessment?.id === type.id
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="font-medium">{type.display_name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {type.questions.length} questions
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedAssessment && (
            <>
              {/* Assessment Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedAssessment.display_name}</CardTitle>
                  <p className="text-gray-600">{selectedAssessment.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedAssessment.questions.length}
                      </div>
                      <div className="text-sm text-gray-500">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedAssessment.max_score}
                      </div>
                      <div className="text-sm text-gray-500">Max Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedAssessment.is_active ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-sm text-gray-500">Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Form */}
              {isCreatingNew && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={resetForm}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="question-text">Question Text</Label>
                        <textarea
                          id="question-text"
                          className="w-full p-3 border rounded-lg resize-none mt-1"
                          rows={3}
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

                      {/* Dynamic form fields based on question type */}
                      {renderQuestionTypeFields()}

                      {/* Options for multiple choice questions */}
                      {(newQuestion.question_type === 'multiple_choice' || 
                        newQuestion.question_type === 'multiple_select' || 
                        newQuestion.question_type === 'yes_no' || 
                        newQuestion.question_type === 'likert_scale' ||
                        newQuestion.question_type === 'rating_scale') && (
                        <div>
                          <Label>Answer Options</Label>
                          <div className="space-y-2 mt-2">
                            {newQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  value={option.text}
                                  onChange={(e) => handleUpdateOption(index, 'text', e.target.value)}
                                  placeholder="Option text"
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  value={option.score}
                                  onChange={(e) => handleUpdateOption(index, 'score', parseInt(e.target.value) || 0)}
                                  placeholder="Score"
                                  className="w-20"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveOption(index)}
                                  disabled={newQuestion.options.length <= 2}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleAddOption}
                              className="mt-2"
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                      )}

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

                    <div className="flex space-x-2 pt-4">
                      <Button
                        onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                        disabled={saving || !newQuestion.question_text.trim()}
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

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Questions ({selectedAssessment.questions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedAssessment.questions.map((question) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">Q{question.question_number}</Badge>
                            <Badge variant="secondary">{question.question_type}</Badge>
                            {question.is_reverse_scored && (
                              <Badge variant="secondary">Reverse Scored</Badge>
                            )}
                            {question.is_required && (
                              <Badge variant="outline">Required</Badge>
                            )}
                          </div>
                          <p className="font-medium mb-3">{question.question_text}</p>
                          {question.question_type !== 'text_input' && (
                            <div className="space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center space-x-2 text-sm">
                                  <Badge variant="outline" className="text-xs">
                                    {option.score}
                                  </Badge>
                                  <span>{option.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteQuestion(question.id!)}
                              disabled={saving}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;
