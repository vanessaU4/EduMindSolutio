import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Trash2 } from 'lucide-react';

interface Question {
  question_number: number;
  question_text: string;
  options: { text: string; score: number }[];
  is_reverse_scored: boolean;
}

interface CreateAssessmentTypeFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const CreateAssessmentTypeForm: React.FC<CreateAssessmentTypeFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    instructions: '',
    is_active: true,
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assessmentData = {
        ...formData,
        total_questions: questions.length,
        max_score: questions.reduce((total, q) => total + Math.max(...q.options.map(o => o.score)), 0),
        questions: questions,
      };

      await onSubmit(assessmentData);
    } catch (error) {
      console.error('Error submitting assessment type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      question_number: questions.length + 1,
      question_text: '',
      options: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
      is_reverse_scored: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Renumber questions
    const renumberedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      question_number: i + 1,
    }));
    setQuestions(renumberedQuestions);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const addOptionToQuestion = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ text: '', score: 0 });
    setQuestions(updatedQuestions);
  };

  const removeOptionFromQuestion = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(updatedQuestions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Assessment Type</CardTitle>
              <CardDescription>
                Define a new assessment type with questions and scoring
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Assessment Code</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., PHQ9, GAD7"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Short code for the assessment (uppercase, no spaces)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="e.g., Patient Health Questionnaire-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of what this assessment measures"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Instructions for users taking this assessment"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Active (available for use)</Label>
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Questions</h3>
                <Button type="button" onClick={addQuestion} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {questions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                  No questions added yet. Click "Add Question" to start building your assessment.
                </p>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, questionIndex) => (
                    <Card key={questionIndex} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Question {question.question_number}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(questionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Question Text</Label>
                          <Textarea
                            value={question.question_text}
                            onChange={(e) => updateQuestion(questionIndex, 'question_text', e.target.value)}
                            placeholder="Enter the question text"
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={question.is_reverse_scored}
                            onCheckedChange={(checked) => updateQuestion(questionIndex, 'is_reverse_scored', checked)}
                          />
                          <Label>Reverse scored</Label>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Answer Options</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOptionToQuestion(questionIndex)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <Input
                                  value={option.text}
                                  onChange={(e) => updateQuestionOption(questionIndex, optionIndex, 'text', e.target.value)}
                                  placeholder="Option text"
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  value={option.score}
                                  onChange={(e) => updateQuestionOption(questionIndex, optionIndex, 'score', parseInt(e.target.value) || 0)}
                                  placeholder="Score"
                                  className="w-20"
                                />
                                {question.options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOptionFromQuestion(questionIndex, optionIndex)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {questions.length > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Assessment Summary</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Total Questions:</strong> {questions.length}</p>
                  <p><strong>Maximum Score:</strong> {questions.reduce((total, q) => total + Math.max(...q.options.map(o => o.score)), 0)}</p>
                  <p><strong>Reverse Scored Questions:</strong> {questions.filter(q => q.is_reverse_scored).length}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || questions.length === 0 || !formData.name || !formData.display_name}
              >
                {loading ? 'Creating...' : 'Create Assessment Type'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAssessmentTypeForm;
