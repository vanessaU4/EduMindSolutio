import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, Plus, Trash2, Save, Eye, Settings, 
  AlertTriangle, CheckCircle, Info, Target, BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import assessmentService from '@/services/assessmentService';

interface Question {
  id: string;
  text: string;
  type: 'likert' | 'multiple_choice' | 'yes_no' | 'text';
  options?: string[];
  required: boolean;
  weight: number;
}

interface ScoreRange {
  min: number;
  max: number;
  label: string;
  description: string;
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  recommendations: string[];
}

const CreateAssessment: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [assessmentName, setAssessmentName] = useState<string>('');
  const [assessmentDescription, setAssessmentDescription] = useState<string>('');
  const [assessmentCategory, setAssessmentCategory] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(5);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scoreRanges, setScoreRanges] = useState<ScoreRange[]>([]);
  const [loading, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    'Depression Screening',
    'Anxiety Assessment',
    'PTSD Evaluation',
    'General Mental Health',
    'Substance Use',
    'Eating Disorders',
    'Sleep Disorders',
    'Custom Assessment'
  ];

  const questionTypes = [
    { value: 'likert', label: 'Likert Scale (0-3 or 0-4)', description: 'Not at all, Several days, More than half, Nearly every day' },
    { value: 'multiple_choice', label: 'Multiple Choice', description: 'Select one from multiple options' },
    { value: 'yes_no', label: 'Yes/No', description: 'Simple binary choice' },
    { value: 'text', label: 'Text Input', description: 'Open-ended text response' }
  ];

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      type: 'likert',
      required: true,
      weight: 1,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addScoreRange = () => {
    const newRange: ScoreRange = {
      min: 0,
      max: 4,
      label: 'Minimal',
      description: 'Minimal symptoms',
      riskLevel: 'minimal',
      recommendations: ['Continue regular self-care practices']
    };
    setScoreRanges([...scoreRanges, newRange]);
  };

  const updateScoreRange = (index: number, updates: Partial<ScoreRange>) => {
    setScoreRanges(scoreRanges.map((range, i) => i === index ? { ...range, ...updates } : range));
  };

  const removeScoreRange = (index: number) => {
    setScoreRanges(scoreRanges.filter((_, i) => i !== index));
  };

  const handleSaveAssessment = async () => {
    if (!assessmentName || !assessmentDescription || questions.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields and add at least one question.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    
    try {
      // Prepare assessment data for the API
      const assessmentData = {
        name: assessmentName.replace(/\s+/g, '_').toUpperCase(), // Convert to valid format
        display_name: assessmentName,
        description: assessmentDescription,
        instructions: assessmentDescription,
        is_active: isActive,
        questions_data: questions.map((q, index) => ({
          question_text: q.text,
          question_type: q.type === 'likert' ? 'rating_scale' : q.type,
          is_reverse_scored: false,
          is_required: q.required,
          options: q.options?.map((opt, optIndex) => ({
            text: opt,
            score: optIndex + 1
          })) || []
        }))
      };

      const result = await assessmentService.createAssessmentType(assessmentData);
      
      toast({
        title: 'Assessment Created Successfully',
        description: `${assessmentName} has been created and ${isActive ? 'activated' : 'saved as draft'}.`,
      });

      // Reset form
      setAssessmentName('');
      setAssessmentDescription('');
      setAssessmentCategory('');
      setEstimatedTime(5);
      setIsActive(false);
      setQuestions([]);
      setScoreRanges([]);
      
    } catch (error) {
      console.error('Creation error:', error);
      toast({
        title: 'Creation Failed',
        description: 'There was an error creating the assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'minimal': return 'bg-green-100 text-green-800';
      case 'mild': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'moderately_severe': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Create Assessment
          </h1>
          <p className="text-gray-600">
            Design and configure new mental health assessment tools for the platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="assessment-name">Assessment Name *</Label>
                  <Input
                    id="assessment-name"
                    placeholder="e.g., Custom Depression Screening"
                    value={assessmentName}
                    onChange={(e) => setAssessmentName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="assessment-description">Description *</Label>
                  <Textarea
                    id="assessment-description"
                    placeholder="Describe the purpose and scope of this assessment..."
                    value={assessmentDescription}
                    onChange={(e) => setAssessmentDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={assessmentCategory} onValueChange={setAssessmentCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="estimated-time">Estimated Time (minutes)</Label>
                    <Input
                      id="estimated-time"
                      type="number"
                      min="1"
                      max="60"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 5)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="is-active">Activate immediately after creation</Label>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Questions ({questions.length})
                  </CardTitle>
                  <Button onClick={addQuestion} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No questions added yet. Click "Add Question" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          <Button
                            onClick={() => removeQuestion(question.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Question Text</Label>
                            <Textarea
                              placeholder="Enter your question..."
                              value={question.text}
                              onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label>Question Type</Label>
                              <Select 
                                value={question.type} 
                                onValueChange={(value: 'likert' | 'multiple_choice' | 'yes_no' | 'text') => 
                                  updateQuestion(question.id, { type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {questionTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Weight</Label>
                              <Input
                                type="number"
                                min="0.1"
                                max="5"
                                step="0.1"
                                value={question.weight}
                                onChange={(e) => updateQuestion(question.id, { weight: parseFloat(e.target.value) || 1 })}
                              />
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                              <Switch
                                checked={question.required}
                                onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                              />
                              <Label>Required</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Ranges */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Score Interpretation ({scoreRanges.length})
                  </CardTitle>
                  <Button onClick={addScoreRange} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Range
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {scoreRanges.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No score ranges defined. Add ranges to interpret assessment results.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scoreRanges.map((range, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={getRiskLevelColor(range.riskLevel)}>
                            {range.label}
                          </Badge>
                          <Button
                            onClick={() => removeScoreRange(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label>Min Score</Label>
                            <Input
                              type="number"
                              value={range.min}
                              onChange={(e) => updateScoreRange(index, { min: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <Label>Max Score</Label>
                            <Input
                              type="number"
                              value={range.max}
                              onChange={(e) => updateScoreRange(index, { max: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <Label>Label</Label>
                            <Input
                              value={range.label}
                              onChange={(e) => updateScoreRange(index, { label: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Risk Level</Label>
                            <Select 
                              value={range.riskLevel} 
                              onValueChange={(value: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe') => 
                                updateScoreRange(index, { riskLevel: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minimal">Minimal</SelectItem>
                                <SelectItem value="mild">Mild</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="moderately_severe">Moderately Severe</SelectItem>
                                <SelectItem value="severe">Severe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Describe what this score range means..."
                            value={range.description}
                            onChange={(e) => updateScoreRange(index, { description: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSaveAssessment}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Assessment
                    </div>
                  )}
                </Button>

                <Button
                  onClick={() => setPreviewMode(!previewMode)}
                  variant="outline"
                  className="w-full"
                  disabled={questions.length === 0}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Assessment
                </Button>
              </CardContent>
            </Card>

            {/* Assessment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <Badge>{questions.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Score Ranges:</span>
                  <Badge>{scoreRanges.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Time:</span>
                  <Badge>{estimatedTime} min</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {isActive ? 'Active' : 'Draft'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Keep questions clear and concise</p>
                  <p>• Use validated scales when possible</p>
                  <p>• Define appropriate score ranges</p>
                  <p>• Test thoroughly before activation</p>
                  <p>• Consider cultural sensitivity</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateAssessment;
