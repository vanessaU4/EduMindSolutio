import React, { useState, useEffect } from 'react';
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
import { 
  Users, Brain, Calendar, Clock, Send, Search, 
  Filter, CheckCircle, AlertTriangle, User, Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AssessmentType } from '@/services/assessmentService';

interface Client {
  id: number;
  name: string;
  email: string;
  lastAssessment?: string;
  riskLevel?: 'minimal' | 'mild' | 'moderate' | 'severe';
  status: 'active' | 'inactive';
}

const AssignAssessments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);

  useEffect(() => {
    loadClients();
    loadAssessmentTypes();
  }, []);

  const loadAssessmentTypes = async () => {
    try {
      // Import assessmentService dynamically
      const assessmentService = (await import('@/services/assessmentService')).default;
      const types = await assessmentService.getAssessmentTypes();
      console.log('Loaded assessment types:', types);
      setAssessmentTypes(types);
    } catch (error) {
      console.error('Failed to load assessment types:', error);
      // Fallback to hardcoded types with proper structure
      setAssessmentTypes([
        {
          id: 1,
          name: 'phq9',
          display_name: 'PHQ-9 (Depression)',
          description: 'Patient Health Questionnaire for depression screening',
          instructions: 'Please answer based on how you have been feeling over the past 2 weeks.',
          total_questions: 9,
          max_score: 27,
          is_active: true
        },
        {
          id: 2,
          name: 'gad7',
          display_name: 'GAD-7 (Anxiety)',
          description: 'Generalized Anxiety Disorder assessment',
          instructions: 'Please answer based on how you have been feeling over the past 2 weeks.',
          total_questions: 7,
          max_score: 21,
          is_active: true
        },
        {
          id: 3,
          name: 'pcl5',
          display_name: 'PCL-5 (PTSD)',
          description: 'PTSD Checklist for DSM-5',
          instructions: 'Please answer based on how much you have been bothered by each problem in the past month.',
          total_questions: 20,
          max_score: 80,
          is_active: true
        }
      ]);
    }
  };

  const loadClients = async () => {
    try {
      // Import userService dynamically to avoid circular imports
      const { userService } = await import('@/services/userService');
      
      // Get clients using the dedicated method
      const usersData = await userService.getClients();
      
      // Handle different response structures
      let userArray: any[] = [];
      if (Array.isArray(usersData)) {
        userArray = usersData;
      } else if (usersData && typeof usersData === 'object') {
        // Check for common pagination patterns
        const response = usersData as any;
        userArray = response.results || response.data || response.users || [];
      }
      
      console.log('Processing user array:', userArray);
      
      // Map User data to Client interface
      const clientsData: Client[] = userArray.map(user => ({
        id: typeof user.id === 'string' ? parseInt(user.id) : user.id,
        name: user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.username,
        email: user.email,
        lastAssessment: user.last_mood_checkin || undefined,
        riskLevel: 'minimal', // Default value, could be calculated from user data
        status: user.is_active ? 'active' : 'inactive'
      }));
      
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
      setClients([]);
      toast({
        title: 'Error',
        description: 'Failed to load clients. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientToggle = (clientId: number) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleAssignAssessment = async () => {
    if (!selectedAssessment || selectedClients.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please select an assessment type and at least one client.',
        variant: 'destructive',
      });
      return;
    }

    // Check if user is authenticated and has guide role
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to assign assessments.',
        variant: 'destructive',
      });
      return;
    }

    if (user.role !== 'guide' && user.role !== 'admin') {
      toast({
        title: 'Permission Denied',
        description: 'Only guides and admins can assign assessments.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Current user:', { id: user.id, role: user.role, username: user.username });

    setLoading(true);
    
    try {
      // Import assessmentService dynamically (default export)
      const assessmentService = (await import('@/services/assessmentService')).default;
      
      // Validate selected data
      console.log('Selected clients:', selectedClients);
      console.log('Selected assessment:', selectedAssessment);
      console.log('Available clients:', clients.map(c => ({ id: c.id, name: c.name })));
      console.log('Available assessments:', assessmentTypes.map(a => ({ id: a.id, name: a.name, display_name: a.display_name })));
      
      // Assign to each selected client
      const assignmentPromises = selectedClients.map(clientId => {
        // Ensure client ID is a number
        const numericClientId = typeof clientId === 'string' ? parseInt(clientId) : clientId;
        const numericAssessmentType = parseInt(selectedAssessment);
        
        if (isNaN(numericClientId) || isNaN(numericAssessmentType)) {
          throw new Error(`Invalid ID: client=${clientId}, assessment=${selectedAssessment}`);
        }
        
        const assignmentData = {
          client: numericClientId,
          assessment_type: numericAssessmentType,
          due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
          priority: priority.toLowerCase(), // Ensure lowercase to match backend choices
          notes: notes || '' // Ensure notes is never undefined
        };
        console.log('Preparing assignment data for client:', clientId, assignmentData);
        return assessmentService.assignAssessment(assignmentData);
      });

      await Promise.all(assignmentPromises);
      
      toast({
        title: 'Assessment Assigned Successfully',
        description: `${selectedClients.length} client(s) have been assigned the ${assessmentTypes.find(a => a.id.toString() === selectedAssessment)?.name} assessment.`,
      });

      // Reset form
      setSelectedClients([]);
      setSelectedAssessment('');
      setDueDate('');
      setNotes('');
      setPriority('medium');
      
    } catch (error: any) {
      console.error('Assignment error:', error);
      
      let errorMessage = 'There was an error assigning the assessment. Please try again.';
      
      // Try to extract specific error message from backend
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          // Handle field-specific errors
          const fieldErrors = Object.entries(error.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          if (fieldErrors) {
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
      }
      
      toast({
        title: 'Assignment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'minimal': return 'bg-green-100 text-green-800';
      case 'mild': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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
            Assign Assessments
          </h1>
          <p className="text-gray-600">
            Assign mental health assessments to your clients and track their progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Clients
                </CardTitle>
                <div className="flex items-center gap-2 mt-4">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedClients.includes(client.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleClientToggle(client.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedClients.includes(client.id) ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {client.riskLevel && (
                            <Badge className={getRiskLevelColor(client.riskLevel)}>
                              {client.riskLevel}
                            </Badge>
                          )}
                          {client.lastAssessment && (
                            <div className="text-xs text-gray-500">
                              Last: {new Date(client.lastAssessment).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedClients.length > 0 && (
                  <Alert className="mt-4">
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      {selectedClients.length} client(s) selected for assessment assignment
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assignment Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Assessment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assessment Type */}
                <div>
                  <Label htmlFor="assessment-type">Assessment Type</Label>
                  <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentTypes.map((assessment) => (
                        <SelectItem key={assessment.id} value={assessment.id.toString()}>
                          <div>
                            <div className="font-medium">{assessment.display_name || assessment.name}</div>
                            <div className="text-sm text-gray-500">
                              {assessment.total_questions ? `${assessment.total_questions} questions` : ''}
                              {assessment.max_score ? ` • Max score: ${assessment.max_score}` : ''}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAssessment && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        {assessmentTypes.find(a => a.id.toString() === selectedAssessment)?.description}
                      </div>
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <Label htmlFor="due-date">Due Date (Optional)</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Priority */}
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <Badge className={getPriorityColor('low')}>Low Priority</Badge>
                      </SelectItem>
                      <SelectItem value="medium">
                        <Badge className={getPriorityColor('medium')}>Medium Priority</Badge>
                      </SelectItem>
                      <SelectItem value="high">
                        <Badge className={getPriorityColor('high')}>High Priority</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any specific instructions or context for this assessment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Assign Button */}
                <Button
                  onClick={handleAssignAssessment}
                  disabled={loading || !selectedAssessment || selectedClients.length === 0}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Assigning...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Assign Assessment
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AssignAssessments;
