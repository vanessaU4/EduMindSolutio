import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Calendar } from 'lucide-react';

interface AssessmentType {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  status: string;
}

interface ClientAssignmentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ClientAssignmentForm: React.FC<ClientAssignmentFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    client: '',
    assessment_type: '',
    due_date: '',
    priority: 'medium',
    notes: '',
  });
  
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const API_BASE_URL = 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      // Fetch assessment types
      const assessmentResponse = await fetch(`${API_BASE_URL}/assessments/types/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (assessmentResponse.ok) {
        const assessmentData = await assessmentResponse.json();
        setAssessmentTypes(assessmentData.results || assessmentData);
      }

      // Fetch guide's clients
      const clientsResponse = await fetch(`${API_BASE_URL}/guide/clients/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData.results || clientsData);
      } else {
        console.warn('Clients endpoint not available, using empty list');
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assignmentData = {
        ...formData,
        client: parseInt(formData.client),
        assessment_type: parseInt(formData.assessment_type),
        due_date: formData.due_date || null,
      };

      await onSubmit(assignmentData);
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' },
  ];

  // Get tomorrow's date as minimum due date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assign Assessment to Client</CardTitle>
              <CardDescription>
                Assign a specific assessment to one of your clients
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
              <Label htmlFor="client">Select Client</Label>
              <Select value={formData.client} onValueChange={(value) => handleInputChange('client', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-xs text-muted-foreground">{client.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No clients found. Make sure you have clients assigned to you.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessment_type">Assessment Type</Label>
              <Select value={formData.assessment_type} onValueChange={(value) => handleInputChange('assessment_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      <div className="flex flex-col">
                        <span>{type.display_name}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <div className="relative">
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  min={minDate}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty for no specific due date
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any specific instructions or context for this assessment"
                rows={3}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Assignment Summary</h4>
              <div className="text-sm space-y-1">
                <p><strong>Client:</strong> {clients.find(c => c.id.toString() === formData.client)?.name || 'Not selected'}</p>
                <p><strong>Assessment:</strong> {assessmentTypes.find(a => a.id.toString() === formData.assessment_type)?.display_name || 'Not selected'}</p>
                <p><strong>Priority:</strong> {priorityOptions.find(p => p.value === formData.priority)?.label}</p>
                {formData.due_date && <p><strong>Due Date:</strong> {new Date(formData.due_date).toLocaleDateString()}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.client || !formData.assessment_type}
              >
                {loading ? 'Assigning...' : 'Assign Assessment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAssignmentForm;
