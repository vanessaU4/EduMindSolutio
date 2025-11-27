import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  HelpCircle, Users, Clock, CheckCircle, XCircle, 
  Eye, MessageSquare, AlertTriangle, Loader2, Send,
  Calendar, User, Mail, Phone, Video, Hash
} from 'lucide-react';
import { communityService, PeerSupportMatch } from '@/services/communityService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const GuidePeerSupportManagement: React.FC = () => {
  const [requests, setRequests] = useState<PeerSupportMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PeerSupportMatch | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'match' | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [availableSupporters, setAvailableSupporters] = useState<any[]>([]);
  const [selectedSupporter, setSelectedSupporter] = useState<number | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadPeerSupportRequests();
  }, []);

  const loadPeerSupportRequests = async () => {
    try {
      setLoading(true);
      // Get all peer support requests for guide review
      const data = await communityService.getAllPeerSupportRequests();
      setRequests(Array.isArray(data) ? data : []);
      
      // Show info if no data and it might be due to missing backend endpoints
      if (data.length === 0) {
        console.info('No peer support requests found. This might be due to missing backend endpoints.');
      }
    } catch (error: any) {
      console.error('Failed to load peer support requests:', error);
      setRequests([]);
      
      const errorMessage = error.message?.includes('401') 
        ? 'Access denied. Please check your guide permissions.'
        : 'Failed to load peer support requests. Please try again later.';
        
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: PeerSupportMatch) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    setActionType(null);
    setReplyMessage('');
    setRejectionReason('');
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      // Call backend API to approve the request
      await communityService.approvePeerSupportRequest(selectedRequest.id, {
        admin_message: replyMessage
      });
      
      toast({
        title: 'Success',
        description: 'Peer support request approved successfully',
      });
      
      setShowDetailsModal(false);
      loadPeerSupportRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;
    
    try {
      // Call backend API to reject the request
      await communityService.rejectPeerSupportRequest(selectedRequest.id, {
        rejection_reason: rejectionReason,
        admin_message: replyMessage
      });
      
      toast({
        title: 'Success',
        description: 'Peer support request rejected',
      });
      
      setShowDetailsModal(false);
      loadPeerSupportRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const handleShowMatchModal = async () => {
    if (!selectedRequest) return;
    
    try {
      const supporters = await communityService.getAvailableSupporters(selectedRequest.id);
      setAvailableSupporters(supporters);
      setShowMatchModal(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load available supporters',
        variant: 'destructive',
      });
    }
  };

  const handleMatchUsers = async () => {
    if (!selectedRequest || !selectedSupporter) return;
    
    try {
      await communityService.matchPeerSupportUsers(selectedRequest.id, selectedSupporter, {
        admin_message: replyMessage
      });
      
      toast({
        title: 'Success',
        description: 'Users matched successfully',
      });
      
      setShowMatchModal(false);
      setShowDetailsModal(false);
      loadPeerSupportRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to match users',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatContactPreference = (preference: string) => {
    const icons = {
      chat: <MessageSquare className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />
    };
    return (
      <div className="flex items-center gap-2">
        {icons[preference as keyof typeof icons]}
        <span className="capitalize">{preference}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-healthcare-primary" />
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending_approval');
  const otherRequests = requests.filter(r => r.status !== 'pending_approval');

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Peer Support Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Review and manage peer support requests from users
          </p>
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {pendingRequests.length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'active').length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Active Matches</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {requests.length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Total Requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {requests.filter(r => r.urgency_level === 'urgent').length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Urgent Requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending Review ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {request.reason || 'Support Request'}
                          </h3>
                          <Badge className={getUrgencyColor(request.urgency_level || 'medium')}>
                            {request.urgency_level || 'medium'}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            Pending Review
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {request.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {request.requester_name || 'Anonymous User'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          {request.contact_preference && formatContactPreference(request.contact_preference)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Requests */}
        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {otherRequests.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No other requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {otherRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {request.reason || 'Support Request'}
                          </h3>
                          <Badge className={getUrgencyColor(request.urgency_level || 'medium')}>
                            {request.urgency_level || 'medium'}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {request.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {request.requester_name || 'Anonymous User'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          {request.contact_preference && formatContactPreference(request.contact_preference)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Peer Support Request Details
              </DialogTitle>
              <DialogDescription>
                Review the request details and take appropriate action
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-6">
                {/* Request Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Urgency</Label>
                    <Badge className={getUrgencyColor(selectedRequest.urgency_level || 'medium')}>
                      {selectedRequest.urgency_level || 'medium'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Requester</Label>
                  <p className="text-sm">{selectedRequest.requester_name || 'Anonymous User'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Reason</Label>
                  <p className="text-sm">{selectedRequest.reason || 'No reason provided'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedRequest.description || 'No description provided'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Preferred Topics</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRequest.preferred_topics?.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      )) || <span className="text-sm text-gray-500">None specified</span>}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Contact Preference</Label>
                    <div className="mt-1">
                      {selectedRequest.contact_preference ? formatContactPreference(selectedRequest.contact_preference) : <span className="text-sm text-gray-500">Not specified</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Age Range</Label>
                    <p className="text-sm">{selectedRequest.preferred_age_range || 'Any'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender Preference</Label>
                    <p className="text-sm">{selectedRequest.preferred_gender || 'Any'}</p>
                  </div>
                </div>

                {selectedRequest.availability && (
                  <div>
                    <Label className="text-sm font-medium">Availability</Label>
                    <p className="text-sm">{selectedRequest.availability}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Previous Support Experience</Label>
                  <p className="text-sm">{selectedRequest.previous_support ? 'Yes' : 'No'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Submitted</Label>
                  <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>

                {/* Action Buttons */}
                {(selectedRequest.status === 'pending_approval' || selectedRequest.status === 'pending') && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="reply">Reply Message (Optional)</Label>
                      <Textarea
                        id="reply"
                        placeholder="Add a message to the user..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {actionType === 'reject' && (
                      <div>
                        <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="Please provide a reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          required
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      {selectedRequest.status === 'pending_approval' && (
                        <>
                          <Button
                            onClick={() => {
                              if (actionType === 'approve') {
                                handleApproveRequest();
                              } else {
                                setActionType('approve');
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {actionType === 'approve' ? 'Confirm Approval' : 'Approve Request'}
                          </Button>
                          
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (actionType === 'reject') {
                                handleRejectRequest();
                              } else {
                                setActionType('reject');
                              }
                            }}
                            disabled={actionType === 'reject' && !rejectionReason.trim()}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {actionType === 'reject' ? 'Confirm Rejection' : 'Reject Request'}
                          </Button>
                        </>
                      )}
                      
                      {selectedRequest.status === 'pending' && (
                        <Button
                          onClick={handleShowMatchModal}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Match with Supporter
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Match Modal */}
        <Dialog open={showMatchModal} onOpenChange={setShowMatchModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Match with Supporter
              </DialogTitle>
              <DialogDescription>
                Select a suitable supporter for this peer support request
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedRequest && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Request Summary</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedRequest.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.preferred_topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium mb-3 block">Available Supporters</Label>
                {availableSupporters.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No available supporters found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Try expanding the search criteria or check back later
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {availableSupporters.map((supporter) => (
                      <div
                        key={supporter.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedSupporter === supporter.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSupporter(supporter.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{supporter.display_name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {supporter.experience_level || 'Peer'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              {supporter.age_range && (
                                <p>Age Range: {supporter.age_range}</p>
                              )}
                              {supporter.gender && (
                                <p>Gender: {supporter.gender}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-xs text-gray-500">Topics:</span>
                                {supporter.available_topics.map((topic: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                              {supporter.availability && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Available: {supporter.availability}
                                </p>
                              )}
                            </div>
                          </div>
                          {selectedSupporter === supporter.id && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedSupporter && (
                <div>
                  <Label htmlFor="match-message">Message to Both Users (Optional)</Label>
                  <Textarea
                    id="match-message"
                    placeholder="Add a message that will be sent to both the requester and supporter..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMatchModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleMatchUsers}
                disabled={!selectedSupporter}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Create Match
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default GuidePeerSupportManagement;
