import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Calendar, TrendingUp, AlertCircle, CheckCircle, 
  Clock, Send, Eye, Filter, Search, Plus, BarChart3,
  FileText, MessageSquare, UserCheck, Loader2
} from 'lucide-react';
import assessmentService, { AssessmentType, Assessment } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ClientAssignment {
  id: number;
  client_email: string;
  client_name: string;
  assessment_type: AssessmentType;
  assigned_date: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  completion_date?: string;
  notes?: string;
  result?: Assessment;
}

interface AssignmentRequest {
  client_email: string;
  assessment_type_id: number;
  due_date: string;
  notes?: string;
}

const GuideAssessmentManagement: React.FC = () => {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [assignments, setAssignments] = useState<ClientAssignment[]>([]);
  const [completedAssessments, setCompletedAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState<AssignmentRequest>({
    client_email: '',
    assessment_type_id: 0,
    due_date: '',
    notes: ''
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [types, history] = await Promise.all([
        assessmentService.getAssessmentTypes(),
        assessmentService.getAssessmentHistory(),
      ]);
      
      setAssessmentTypes(Array.isArray(types) ? types : []);
      setCompletedAssessments(Array.isArray(history) ? history : []);
      
      // Fetch real client assignments from API
      try {
        const assignmentsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/guide/assignments/`);
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setAssignments(assignmentsData.data || []);
        } else {
          setAssignments([]);
        }
      } catch (assignmentError) {
        console.error('Failed to load assignments:', assignmentError);
        setAssignments([]);
      }
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assessment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleAssignAssessment = async () => {
    if (!assignmentForm.client_email || !assignmentForm.assessment_type_id || !assignmentForm.due_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAssignmentLoading(true);
      
      // In real implementation, this would call the API
      // await assessmentService.assignAssessment(assignmentForm);
      
      // Mock successful assignment
      const newAssignment: ClientAssignment = {
        id: assignments.length + 1,
        client_email: assignmentForm.client_email,
        client_name: assignmentForm.client_email.split('@')[0],
        assessment_type: assessmentTypes.find(t => t.id === assignmentForm.assessment_type_id)!,
        assigned_date: new Date().toISOString().split('T')[0],
        due_date: assignmentForm.due_date,
        status: 'pending',
        notes: assignmentForm.notes
      };
      
      setAssignments(prev => [newAssignment, ...prev]);
      setAssignmentForm({
        client_email: '',
        assessment_type_id: 0,
        due_date: '',
        notes: ''
      });
      
      toast({
        title: 'Assessment Assigned',
        description: `Assessment assigned to ${assignmentForm.client_email}`,
      });
      
    } catch (error) {
      console.error('Failed to assign assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign assessment',
        variant: 'destructive',
      });
    } finally {
      setAssignmentLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.client_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total_assignments: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    overdue: assignments.filter(a => a.status === 'overdue').length
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Assessment Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Assign and monitor client assessments
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_assignments}</div>
              <p className="text-xs text-muted-foreground">
                Active client assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assign">Assign Assessment</TabsTrigger>
            <TabsTrigger value="results">Results & Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Client Assignments</CardTitle>
                <CardDescription>Manage and monitor assessment assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('pending')}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={filterStatus === 'completed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('completed')}
                    >
                      Completed
                    </Button>
                    <Button
                      variant={filterStatus === 'overdue' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('overdue')}
                    >
                      Overdue
                    </Button>
                  </div>
                </div>

                {/* Assignments List */}
                <div className="space-y-4">
                  {filteredAssignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-healthcare-primary/10 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-healthcare-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{assignment.client_name}</h4>
                            <p className="text-sm text-gray-600">{assignment.client_email}</p>
                            <p className="text-sm text-gray-500">{assignment.assessment_type.display_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">Due: {assignment.due_date}</p>
                            <p className="text-xs text-gray-500">
                              Assigned: {assignment.assigned_date}
                            </p>
                          </div>
                          <Badge className={getStatusColor(assignment.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(assignment.status)}
                              {assignment.status}
                            </div>
                          </Badge>
                          <div className="flex gap-2">
                            {assignment.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                View Results
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </div>
                      {assignment.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {assignment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No assignments found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assign Assessment Tab */}
          <TabsContent value="assign" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assign New Assessment</CardTitle>
                <CardDescription>Send an assessment to a client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="client_email">Client Email *</Label>
                    <Input
                      id="client_email"
                      type="email"
                      placeholder="client@example.com"
                      value={assignmentForm.client_email}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, client_email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assessment_type">Assessment Type *</Label>
                    <select
                      id="assessment_type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-primary"
                      value={assignmentForm.assessment_type_id}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, assessment_type_id: parseInt(e.target.value) }))}
                    >
                      <option value={0}>Select an assessment</option>
                      {assessmentTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.display_name} ({type.total_questions} questions)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={assignmentForm.due_date}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, due_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional instructions or context for the client..."
                      value={assignmentForm.notes}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The client will receive an email notification with instructions to complete the assessment.
                    They will have until the due date to submit their responses.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleAssignAssessment}
                  disabled={assignmentLoading}
                  className="w-full bg-healthcare-primary hover:bg-blue-700"
                >
                  {assignmentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Assign Assessment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results & Analytics Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Results & Analytics</CardTitle>
                <CardDescription>View completed assessment results and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Completed Assessments */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Completed Assessments</h3>
                    <div className="space-y-4">
                      {completedAssessments.slice(0, 5).map((assessment) => (
                        <div key={assessment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{assessment.assessment_type.display_name}</h4>
                              <p className="text-sm text-gray-600">
                                Completed: {new Date(assessment.completed_at).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Score: {assessment.total_score}/{assessment.assessment_type.max_score}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={`${
                                assessment.risk_level === 'minimal' ? 'bg-green-100 text-green-800' :
                                assessment.risk_level === 'mild' ? 'bg-blue-100 text-blue-800' :
                                assessment.risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {assessment.risk_level.replace('_', ' ')}
                              </Badge>
                              <Button size="sm" variant="outline">
                                <BarChart3 className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {completedAssessments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No completed assessments to display.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default GuideAssessmentManagement;
