import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface AssessmentType {
  id: number;
  name: string;
  display_name: string;
}

interface AssessmentRequestFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const AssessmentRequestForm: React.FC<AssessmentRequestFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    request_type: '',
    title: '',
    description: '',
    justification: '',
    target_assessment: '',
    proposed_questions: '',
    expected_outcomes: '',
  });
  
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssessmentTypes();
  }, []);

  const fetchAssessmentTypes = async () => {
    try {
      const response = await fetch('/api/assessments/types/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssessmentTypes(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching assessment types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse proposed questions if provided
      let proposedQuestions = [];
      if (formData.proposed_questions.trim()) {
        try {
          proposedQuestions = JSON.parse(formData.proposed_questions);
        } catch {
          // If not valid JSON, treat as plain text and convert to simple format
          proposedQuestions = formData.proposed_questions.split('\n').filter(q => q.trim()).map((question, index) => ({
            question_number: index + 1,
            question_text: question.trim(),
            options: []
          }));
        }
      }

      const requestData = {
        ...formData,
        target_assessment: formData.target_assessment ? parseInt(formData.target_assessment) : null,
        proposed_questions: proposedQuestions,
      };

      await onSubmit(requestData);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const requestTypeOptions = [
    { value: 'new_assessment', label: 'New Assessment Type' },
    { value: 'modify_assessment', label: 'Modify Existing Assessment' },
    { value: 'add_questions', label: 'Add Questions to Assessment' },
    { value: 'modify_scoring', label: 'Modify Scoring System' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Request New Assessment</CardTitle>
              <CardDescription>
                Submit a request for a new assessment type or modifications to existing ones
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="request_type">Request Type</Label>
              <Select value={formData.request_type} onValueChange={(value) => handleInputChange('request_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief title for your request"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of what you're requesting"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justification</Label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e) => handleInputChange('justification', e.target.value)}
                placeholder="Why is this assessment needed? How will it benefit your clients?"
                rows={3}
                required
              />
            </div>

            {(formData.request_type === 'modify_assessment' || formData.request_type === 'add_questions') && (
              <div className="space-y-2">
                <Label htmlFor="target_assessment">Target Assessment</Label>
                <Select value={formData.target_assessment} onValueChange={(value) => handleInputChange('target_assessment', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment to modify" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="proposed_questions">Proposed Questions (Optional)</Label>
              <Textarea
                id="proposed_questions"
                value={formData.proposed_questions}
                onChange={(e) => handleInputChange('proposed_questions', e.target.value)}
                placeholder="Enter questions one per line, or provide JSON format for detailed question structure"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                You can enter questions as simple text (one per line) or as JSON for more detailed structure
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_outcomes">Expected Outcomes</Label>
              <Textarea
                id="expected_outcomes"
                value={formData.expected_outcomes}
                onChange={(e) => handleInputChange('expected_outcomes', e.target.value)}
                placeholder="What outcomes do you expect from this assessment?"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentRequestForm;
