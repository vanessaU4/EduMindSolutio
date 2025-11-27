import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RoleGuard } from '@/components/RoleGuard';
import AssessmentRequestForm from './AssessmentRequestForm';
import ClientAssignmentForm from './ClientAssignmentForm';

interface AssessmentStats {
  total_assignments: number;
  pending_assignments: number;
  completed_assignments: number;
  pending_requests: number;
  recent_assignments: any[];
}

interface AssessmentRequest {
  id: number;
  title: string;
  request_type: string;
  status: string;
  created_at: string;
  admin_notes: string;
}

export const GuideAssessmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [requests, setRequests] = useState<AssessmentRequest[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const API_BASE_URL = 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        return;
      }
      
      // Fetch stats
      const statsResponse = await fetch(`${API_BASE_URL}/assessments/guide/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch requests
      const requestsResponse = await fetch(`${API_BASE_URL}/assessments/guide/requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setRequests(requestsData.results || requestsData);
      }

      // Fetch assignments
      const assignmentsResponse = await fetch(`${API_BASE_URL}/assessments/guide/assignments/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData.results || assignmentsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (requestData: any) => {
    try {
      const API_BASE_URL = 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/assessments/guide/requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Assessment request submitted successfully!' });
        setShowRequestForm(false);
        fetchData();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to submit request' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const handleAssignmentSubmit = async (assignmentData: any) => {
    try {
      const API_BASE_URL = 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/assessments/guide/assignments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(assignmentData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Assessment assigned to client successfully!' });
        setShowAssignmentForm(false);
        fetchData();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to assign assessment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending' },
      approved: { variant: 'default' as const, text: 'Approved' },
      rejected: { variant: 'destructive' as const, text: 'Rejected' },
      in_progress: { variant: 'outline' as const, text: 'In Progress' },
      completed: { variant: 'default' as const, text: 'Completed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <RoleGuard requireGuide={true}>
    <div className="space-y-6 pt-[120px] px-4">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assessment Management</h1>
            <p className="text-muted-foreground">
              Manage assessments and requests for your clients
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowRequestForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Assessment
            </Button>
            <Button onClick={() => setShowAssignmentForm(true)}>
              <Users className="h-4 w-4 mr-2" />
              Assign Assessment
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_assignments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_assignments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed_assignments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_requests}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="assignments" className="space-y-4 mt-4">
          <TabsList>
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Assessment Assignments</CardTitle>
                <CardDescription>
                  Assessments you've assigned to your clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No assignments yet. Start by assigning assessments to your clients.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{assignment.client_name}</h4>
                          <p className="text-sm text-muted-foreground">{assignment.assessment_type_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.priority === 'high' ? 'destructive' : assignment.priority === 'medium' ? 'default' : 'secondary'}>
                            {assignment.priority}
                          </Badge>
                          {assignment.is_completed ? (
                            <Badge variant="default">Completed</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Requests</CardTitle>
                <CardDescription>
                  Your requests for new assessments or modifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No requests yet. Submit a request for new assessment types or modifications.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{request.title}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {request.request_type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                            {request.admin_notes && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <strong>Admin Notes:</strong> {request.admin_notes}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showRequestForm && (
          <AssessmentRequestForm
            onSubmit={handleRequestSubmit}
            onCancel={() => setShowRequestForm(false)}
          />
        )}

        {showAssignmentForm && (
          <ClientAssignmentForm
            onSubmit={handleAssignmentSubmit}
            onCancel={() => setShowAssignmentForm(false)}
          />
        )}
      </div>
    </RoleGuard>
  );
};

export default GuideAssessmentDashboard;
