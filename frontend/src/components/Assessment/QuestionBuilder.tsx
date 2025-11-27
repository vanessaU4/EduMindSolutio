import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Trash2, GripVertical, Copy, RotateCcw, 
  CheckCircle, AlertCircle, HelpCircle, Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuestionOption {
  id: string;
  text: string;
  score: number;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'scale' | 'yes_no' | 'text';
  text: string;
  description?: string;
  options: QuestionOption[];
  isRequired: boolean;
  isReverseScored: boolean;
  category?: string;
}

interface QuestionBuilderProps {
  onSave: (question: Question) => void;
  onCancel: () => void;
  initialQuestion?: Question;
  assessmentType?: string;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  onSave,
  onCancel,
  initialQuestion,
  assessmentType = 'custom'
}) => {
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question>(
    initialQuestion || {
      id: `q_${Date.now()}`,
      type: 'multiple_choice',
      text: '',
      description: '',
      options: [
        { id: 'opt_1', text: 'Not at all', score: 0 },
        { id: 'opt_2', text: 'Several days', score: 1 },
        { id: 'opt_3', text: 'More than half the days', score: 2 },
        { id: 'opt_4', text: 'Nearly every day', score: 3 }
      ],
      isRequired: true,
      isReverseScored: false,
      category: 'general'
    }
  );

  const questionTemplates = {
    depression: {
      text: 'Over the last 2 weeks, how often have you been bothered by...',
      options: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 }
      ]
    },
    anxiety: {
      text: 'Over the last 2 weeks, how often have you been bothered by...',
      options: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 }
      ]
    },
    likert_5: {
      text: 'Please rate your agreement with the following statement:',
      options: [
        { text: 'Strongly Disagree', score: 1 },
        { text: 'Disagree', score: 2 },
        { text: 'Neutral', score: 3 },
        { text: 'Agree', score: 4 },
        { text: 'Strongly Agree', score: 5 }
      ]
    },
    frequency: {
      text: 'How often do you experience...',
      options: [
        { text: 'Never', score: 0 },
        { text: 'Rarely', score: 1 },
        { text: 'Sometimes', score: 2 },
        { text: 'Often', score: 3 },
        { text: 'Always', score: 4 }
      ]
    }
  };

  const handleTypeChange = (newType: string) => {
    let newOptions = question.options;
    
    if (newType === 'yes_no') {
      newOptions = [
        { id: 'yes', text: 'Yes', score: 1 },
        { id: 'no', text: 'No', score: 0 }
      ];
    } else if (newType === 'scale') {
      newOptions = Array.from({ length: 10 }, (_, i) => ({
        id: `scale_${i + 1}`,
        text: `${i + 1}`,
        score: i + 1
      }));
    } else if (newType === 'text') {
      newOptions = [];
    }

    setQuestion({
      ...question,
      type: newType as Question['type'],
      options: newOptions
    });
  };

  const handleAddOption = () => {
    const newOption: QuestionOption = {
      id: `opt_${Date.now()}`,
      text: '',
      score: question.options.length
    };
    setQuestion({
      ...question,
      options: [...question.options, newOption]
    });
  };

  const handleUpdateOption = (optionId: string, field: keyof QuestionOption, value: string | number) => {
    setQuestion({
      ...question,
      options: question.options.map(opt => 
        opt.id === optionId ? { ...opt, [field]: value } : opt
      )
    });
  };

  const handleRemoveOption = (optionId: string) => {
    if (question.options.length <= 2) {
      toast({
        title: 'Error',
        description: 'Questions must have at least 2 options',
        variant: 'destructive'
      });
      return;
    }

    setQuestion({
      ...question,
      options: question.options.filter(opt => opt.id !== optionId)
    });
  };

  const handleDuplicateOption = (optionId: string) => {
    const optionToDuplicate = question.options.find(opt => opt.id === optionId);
    if (optionToDuplicate) {
      const newOption: QuestionOption = {
        ...optionToDuplicate,
        id: `opt_${Date.now()}`,
        text: `${optionToDuplicate.text} (Copy)`
      };
      setQuestion({
        ...question,
        options: [...question.options, newOption]
      });
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = questionTemplates[templateKey as keyof typeof questionTemplates];
    if (template) {
      setQuestion({
        ...question,
        text: template.text,
        options: template.options.map((opt, index) => ({
          id: `opt_${index + 1}`,
          text: opt.text,
          score: opt.score
        }))
      });
      toast({
        title: 'Template Applied',
        description: `${templateKey} template has been applied to your question`
      });
    }
  };

  const validateQuestion = (): boolean => {
    if (!question.text.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Question text is required',
        variant: 'destructive'
      });
      return false;
    }

    if (question.type !== 'text' && question.options.length < 2) {
      toast({
        title: 'Validation Error',
        description: 'Questions must have at least 2 options',
        variant: 'destructive'
      });
      return false;
    }

    if (question.type !== 'text') {
      const emptyOptions = question.options.filter(opt => !opt.text.trim());
      if (emptyOptions.length > 0) {
        toast({
          title: 'Validation Error',
          description: 'All options must have text',
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (validateQuestion()) {
      onSave(question);
      toast({
        title: 'Success',
        description: 'Question saved successfully'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="mr-2 h-5 w-5" />
            Question Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Templates */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(questionTemplates).map((templateKey) => (
                <Button
                  key={templateKey}
                  size="sm"
                  variant="outline"
                  onClick={() => applyTemplate(templateKey)}
                  className="text-xs"
                >
                  <Lightbulb className="mr-1 h-3 w-3" />
                  {templateKey.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Question Type */}
          <div>
            <Label htmlFor="question-type">Question Type</Label>
            <Select value={question.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="scale">Rating Scale (1-10)</SelectItem>
                <SelectItem value="yes_no">Yes/No</SelectItem>
                <SelectItem value="text">Text Response</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div>
            <Label htmlFor="question-text">Question Text</Label>
            <Textarea
              id="question-text"
              value={question.text}
              onChange={(e) => setQuestion({ ...question, text: e.target.value })}
              placeholder="Enter your question..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Question Description */}
          <div>
            <Label htmlFor="question-description">Description (Optional)</Label>
            <Input
              id="question-description"
              value={question.description || ''}
              onChange={(e) => setQuestion({ ...question, description: e.target.value })}
              placeholder="Additional context or instructions..."
              className="mt-1"
            />
          </div>

          {/* Answer Options */}
          {question.type !== 'text' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Answer Options</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddOption}
                  disabled={question.type === 'yes_no' || question.type === 'scale'}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {question.options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Badge variant="outline" className="ml-2">
                          {index + 1}
                        </Badge>
                      </div>
                      
                      <Input
                        value={option.text}
                        onChange={(e) => handleUpdateOption(option.id, 'text', e.target.value)}
                        placeholder="Option text"
                        className="flex-1"
                      />
                      
                      <Input
                        type="number"
                        value={option.score}
                        onChange={(e) => handleUpdateOption(option.id, 'score', parseInt(e.target.value) || 0)}
                        placeholder="Score"
                        className="w-20"
                      />

                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicateOption(option.id)}
                          title="Duplicate option"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveOption(option.id)}
                          disabled={question.options.length <= 2 || question.type === 'yes_no'}
                          title="Remove option"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Question Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Question Settings</Label>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={question.isRequired}
                  onChange={(e) => setQuestion({ ...question, isRequired: e.target.checked })}
                />
                <span className="text-sm">Required question</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={question.isReverseScored}
                  onChange={(e) => setQuestion({ ...question, isReverseScored: e.target.checked })}
                />
                <span className="text-sm">Reverse scored</span>
              </label>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={question.category || 'general'} 
                onValueChange={(value) => setQuestion({ ...question, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="mood">Mood</SelectItem>
                  <SelectItem value="anxiety">Anxiety</SelectItem>
                  <SelectItem value="sleep">Sleep</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="physical">Physical Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Preview</Label>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2 mb-3">
                  <Badge variant={question.isRequired ? "default" : "secondary"}>
                    {question.isRequired ? "Required" : "Optional"}
                  </Badge>
                  {question.isReverseScored && (
                    <Badge variant="outline">Reverse Scored</Badge>
                  )}
                  {question.category && (
                    <Badge variant="secondary">{question.category}</Badge>
                  )}
                </div>
                
                <h4 className="font-medium text-gray-900 mb-2">{question.text || 'Question text will appear here...'}</h4>
                
                {question.description && (
                  <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                )}

                {question.type === 'text' ? (
                  <Textarea placeholder="User will type their response here..." disabled />
                ) : (
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <input type="radio" name="preview" disabled />
                        <span className="text-sm">{option.text || `Option ${index + 1}`}</span>
                        <Badge variant="outline" className="text-xs">Score: {option.score}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Question
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setQuestion({
                ...question,
                text: '',
                description: '',
                options: question.type === 'yes_no' ? question.options : [
                  { id: 'opt_1', text: '', score: 0 },
                  { id: 'opt_2', text: '', score: 1 }
                ]
              })}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionBuilder;
