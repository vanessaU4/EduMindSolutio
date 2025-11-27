import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, FileText, Plus, Edit, Trash2, Search, Loader2,
  Clock, CheckCircle, AlertTriangle, Eye
} from 'lucide-react';
import assessmentService, { AssessmentType } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Question {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'scale' | 'text';
  options?: { text: string; value: number }[];
  assessment_type: string;
  order: number;
  is_active: boolean;
}

interface AssessmentRequest {
  id: number;
  client_name: string;
  client_email: string;
  assessment_type: string;
  requested_by: string;
  requested_date: string;
  due_date: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

const AdminAssessmentOversight: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentRequests, setAssessmentRequests] = useState<AssessmentRequest[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>('all');
  const [newQuestion, setNewQuestion] = useState({ question_text: '', question_type: 'multiple_choice', assessment_type: '', options: [{ text: '', value: 0 }] });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const types = await assessmentService.getAssessmentTypes();
      setAssessmentTypes(Array.isArray(types) ? types : []);
      
      // Load mock questions and requests
      setQuestions(generateMockQuestions());
      setAssessmentRequests(generateMockRequests());
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load question and request data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockQuestions = (): Question[] => {
    return [
      {
        id: 1,
        question_text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
        question_type: 'multiple_choice',
        assessment_type: 'PHQ9',
        order: 1,
        is_active: true,
        options: [
          { text: 'Not at all', value: 0 },
          { text: 'Several days', value: 1 },
          { text: 'More than half the days', value: 2 },
          { text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 2,
        question_text: 'Feeling nervous, anxious, or on edge?',
        question_type: 'multiple_choice',
        assessment_type: 'GAD7',
        order: 1,
        is_active: true,
        options: [
          { text: 'Not at all', value: 0 },
          { text: 'Several days', value: 1 },
          { text: 'More than half the days', value: 2 },
          { text: 'Nearly every day', value: 3 }
        ]
      }
    ];
  };

  const generateMockRequests = (): AssessmentRequest[] => {
    return [
      {
        id: 1,
        client_name: 'John Doe',
        client_email: 'john.doe@example.com',
        assessment_type: 'PHQ9',
        requested_by: 'Dr. Smith',
        requested_date: '2024-01-20',
        due_date: '2024-01-27',
        status: 'pending',
        priority: 'high',
        notes: 'Follow-up assessment after therapy session'
      },
      {
        id: 2,
        client_name: 'Jane Smith',
        client_email: 'jane.smith@example.com',
        assessment_type: 'GAD7',
        requested_by: 'Dr. Johnson',
        requested_date: '2024-01-19',
        due_date: '2024-01-26',
        status: 'assigned',
        priority: 'medium'
      },
      {
        id: 3,
        client_name: 'Mike Wilson',
        client_email: 'mike.wilson@example.com',
        assessment_type: 'PCL5',
        requested_by: 'Dr. Brown',
        requested_date: '2024-01-18',
        due_date: '2024-01-25',
        status: 'completed',
        priority: 'low'
      }
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedAssessmentType === 'all' || question.assessment_type === selectedAssessmentType;
    return matchesSearch && matchesType;
  });

  const filteredRequests = assessmentRequests.filter(request => {
    const matchesSearch = request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.client_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const addQuestion = () => {
    if (newQuestion.question_text && newQuestion.assessment_type) {
      const question: Question = {
        id: questions.length + 1,
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type as 'multiple_choice' | 'scale' | 'text',
        assessment_type: newQuestion.assessment_type,
        order: questions.length + 1,
        is_active: true,
        options: newQuestion.question_type === 'multiple_choice' ? newQuestion.options : undefined
      };
      setQuestions([...questions, question]);
      setNewQuestion({ question_text: '', question_type: 'multiple_choice', assessment_type: '', options: [{ text: '', value: 0 }] });
      toast({
        title: 'Success',
        description: 'Question added successfully',
      });
    }
  };

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast({
      title: 'Success',
      description: 'Question deleted successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-healthcare-primary" />
      </div>
    );
  }

  return (
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
                Question & Request Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage assessment questions and client requests
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions">Question Management</TabsTrigger>
            <TabsTrigger value="requests">Assessment Requests</TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Assessment Questions</CardTitle>
                    <CardDescription>Manage questions for all assessment types</CardDescription>
                  </div>
                  <Button onClick={() => setActiveTab('add-question')} className="bg-healthcare-primary hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedAssessmentType}
                    onChange={(e) => setSelectedAssessmentType(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Types</option>
                    {assessmentTypes.map(type => (
                      <option key={type.id} value={type.name}>{type.display_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  {filteredQuestions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-4 h-4 text-blue-500" />
                            <Badge variant="outline">{question.assessment_type}</Badge>
                            <Badge className={question.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {question.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{question.question_text}</h4>
                          {question.options && (
                            <div className="ml-4 space-y-1">
                              {question.options.map((option, index) => (
                                <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  {option.text} (Value: {option.value})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteQuestion(question.id)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Requests</CardTitle>
                <CardDescription>Manage client assessment requests from guides and admins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by client name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority} priority
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-gray-900">{request.client_name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{request.client_email}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Assessment:</span> {request.assessment_type}
                            </div>
                            <div>
                              <span className="font-medium">Requested by:</span> {request.requested_by}
                            </div>
                            <div>
                              <span className="font-medium">Due:</span> {new Date(request.due_date).toLocaleDateString()}
                            </div>
                          </div>
                          {request.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <span className="font-medium">Notes:</span> {request.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {request.status === 'pending' && (
                            <Button size="sm" className="bg-healthcare-primary hover:bg-blue-700">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Assign
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminAssessmentOversight;
