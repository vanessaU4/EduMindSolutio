import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, FileText, Clock, CheckCircle, XCircle, AlertTriangle, 
  Users, Settings, BarChart3, Eye, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import CreateAssessmentTypeForm from './CreateAssessmentTypeForm';

interface AdminStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_assessments: number;
  total_assignments: number;
  recent_requests: any[];
}

interface AssessmentRequest {
  id: number;
  title: string;
  description: string;
  justification: string;
  request_type: string;
  status: string;
  requester_name: string;
  target_assessment_name?: string;
  proposed_questions: any[];
  expected_outcomes: string;
  admin_notes: string;
  created_at: string;
  reviewed_at?: string;
}

interface AssessmentType {
  id: number;
  name: string;
  display_name: string;
  description: string;
  total_questions: number;
  max_score: number;
  is_active: boolean;
}

export const AdminAssessmentDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [requests, setRequests] = useState<AssessmentRequest[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AssessmentRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const useMocks = (import.meta as any).env?.VITE_USE_MOCKS === 'true';

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found' });
        return;
      }
      
      // Fetch admin stats
      const statsResponse = await fetch(`${API_BASE_URL}/assessments/admin/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        if (useMocks) {
          setStats({ total_requests: 3, pending_requests: 1, approved_requests: 1, rejected_requests: 1, total_assessments: 124, total_assignments: 42, recent_requests: [] });
        } else {
          console.error('Stats API error:', statsResponse.status, statsResponse.statusText);
          const errorText = await statsResponse.text();
          console.error('Stats API response:', errorText);
        }
      }

      // Fetch assessment requests
      const requestsResponse = await fetch(`${API_BASE_URL}/assessments/admin/requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setRequests(requestsData.results || requestsData);
      } else {
        if (useMocks) {
          setRequests([]);
        } else {
          console.error('Requests API error:', requestsResponse.status, requestsResponse.statusText);
          const errorText = await requestsResponse.text();
          console.error('Requests API response:', errorText);
        }
      }

      // Fetch assessment types
      const typesResponse = await fetch(`${API_BASE_URL}/assessments/admin/types/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        setAssessmentTypes(typesData.results || typesData);
      } else {
        if (useMocks) {
          setAssessmentTypes([
            { id: 1, name: 'PHQ9', display_name: 'Patient Health Questionnaire-9', description: 'Depression screening', total_questions: 9, max_score: 27, is_active: true },
            { id: 2, name: 'GAD7', display_name: 'Generalized Anxiety Disorder 7', description: 'Anxiety screening', total_questions: 7, max_score: 21, is_active: true },
          ]);
        } else {
          console.error('Types API error:', typesResponse.status, typesResponse.statusText);
          const errorText = await typesResponse.text();
          console.error('Types API response:', errorText);
        }
      }

    } catch (error) {
      if (useMocks) {
        setStats({ total_requests: 3, pending_requests: 1, approved_requests: 1, rejected_requests: 1, total_assessments: 124, total_assignments: 42, recent_requests: [] });
        setRequests([]);
        setAssessmentTypes([
          { id: 1, name: 'PHQ9', display_name: 'Patient Health Questionnaire-9', description: 'Depression screening', total_questions: 9, max_score: 27, is_active: true },
          { id: 2, name: 'GAD7', display_name: 'Generalized Anxiety Disorder 7', description: 'Anxiety screening', total_questions: 7, max_score: 21, is_active: true },
        ]);
        setMessage(null);
      } else {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load dashboard data' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (requestId: number, action: 'approve' | 'reject' | 'request_changes') => {
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found' });
        return;
      }
      
      if (useMocks) {
        setMessage({ type: 'success', text: 'Request reviewed (mock)' });
        setSelectedRequest(null);
        setReviewNotes('');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/assessments/admin/requests/${requestId}/review/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          admin_notes: reviewNotes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: result.message });
        setSelectedRequest(null);
        setReviewNotes('');
        fetchData();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to review request' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const handleCreateAssessmentType = async (typeData: any) => {
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found' });
        return;
      }
      
      if (useMocks) {
        setMessage({ type: 'success', text: 'Assessment type created successfully! (mock)' });
        setShowCreateForm(false);
        fetchData();
        return;
      }
      const response = await fetch(`${API_BASE_URL}/assessments/admin/types/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(typeData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Assessment type created successfully!' });
        setShowCreateForm(false);
        fetchData();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to create assessment type' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const toggleAssessmentTypeStatus = async (typeId: number, isActive: boolean) => {
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found' });
        return;
      }
      
      if (useMocks) {
        setMessage({ type: 'success', text: `Assessment type ${!isActive ? 'activated' : 'deactivated'} successfully! (mock)` });
        fetchData();
        return;
      }
      const response = await fetch(`${API_BASE_URL}/assessments/admin/types/${typeId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Assessment type ${!isActive ? 'activated' : 'deactivated'} successfully!` 
        });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Failed to update assessment type' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock },
      approved: { variant: 'default' as const, text: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, text: 'Rejected', icon: XCircle },
      in_progress: { variant: 'outline' as const, text: 'In Progress', icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const typeLabels = {
      new_assessment: 'New Assessment',
      modify_assessment: 'Modify Assessment',
      add_questions: 'Add Questions',
      modify_scoring: 'Modify Scoring',
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <RoleGuard requireAdmin={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assessment Administration</h1>
            <p className="text-muted-foreground">Manage assessment requests and types</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment Type
          </Button>
        </div>

        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_requests}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_requests}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_assessments}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_assignments}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">Assessment Requests</TabsTrigger>
            <TabsTrigger value="types">Assessment Types</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Requests</CardTitle>
                <CardDescription>
                  Review and manage requests from guides for new assessments or modifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No assessment requests found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{request.title}</h4>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Type:</strong> {getRequestTypeLabel(request.request_type)}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Requested by:</strong> {request.requester_name}
                            </p>
                            <p className="text-sm mb-2">{request.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Submitted: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Types</CardTitle>
                <CardDescription>
                  Manage existing assessment types and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessmentTypes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No assessment types found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {assessmentTypes.map((type) => (
                      <div key={type.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{type.display_name}</h4>
                              <Badge variant={type.is_active ? 'default' : 'secondary'}>
                                {type.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Code:</strong> {type.name}
                            </p>
                            <p className="text-sm mb-2">{type.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {type.total_questions} questions • Max score: {type.max_score}
                            </p>
                          </div>
                          <div className="ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAssessmentTypeStatus(type.id, type.is_active)}
                            >
                              {type.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
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

        {/* Request Review Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Review Request: {selectedRequest.title}</CardTitle>
                    <CardDescription>
                      Submitted by {selectedRequest.requester_name} on{' '}
                      {new Date(selectedRequest.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Request Details</h4>
                  <div className="bg-muted p-4 rounded space-y-2">
                    <p><strong>Type:</strong> {getRequestTypeLabel(selectedRequest.request_type)}</p>
                    <p><strong>Description:</strong> {selectedRequest.description}</p>
                    <p><strong>Justification:</strong> {selectedRequest.justification}</p>
                    <p><strong>Expected Outcomes:</strong> {selectedRequest.expected_outcomes}</p>
                    {selectedRequest.target_assessment_name && (
                      <p><strong>Target Assessment:</strong> {selectedRequest.target_assessment_name}</p>
                    )}
                  </div>
                </div>

                {selectedRequest.proposed_questions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Proposed Questions</h4>
                    <div className="bg-muted p-4 rounded">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(selectedRequest.proposed_questions, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="review_notes">Admin Notes</Label>
                  <Textarea
                    id="review_notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleReviewRequest(selectedRequest.id, 'request_changes')}
                  >
                    Request Changes
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReviewRequest(selectedRequest.id, 'reject')}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleReviewRequest(selectedRequest.id, 'approve')}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Assessment Type Form */}
        {showCreateForm && (
          <CreateAssessmentTypeForm
            onSubmit={handleCreateAssessmentType}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </div>
    </RoleGuard>
  );
};

export default AdminAssessmentDashboard;
