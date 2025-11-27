import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Heart, Users, MessageCircle, Clock, 
  CheckCircle, Loader2, UserPlus, FileText, Send 
} from 'lucide-react';
import { communityService, PeerSupportMatch } from '@/services/communityService';
import { useToast } from '@/hooks/use-toast';

const PeerSupport: React.FC = () => {
  const [matches, setMatches] = useState<PeerSupportMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    preferred_topics: [] as string[],
    preferred_age_range: '',
    preferred_gender: '',
    urgency_level: 'medium',
    contact_preference: 'chat',
    availability: '',
    previous_support: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await communityService.getPeerSupportMatches();
      setMatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load peer support matches:', error);
      setMatches([]);
      toast({
        title: 'Error',
        description: 'Failed to load peer support matches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSupport = async () => {
    try {
      await communityService.createPeerSupportRequest({
        ...formData,
        preferred_topics: formData.preferred_topics.length > 0 ? formData.preferred_topics : ['general'],
      });
      toast({
        title: 'Success',
        description: 'Support request submitted for admin/guide approval. You will be notified when approved.',
      });
      setShowRequestForm(false);
      setFormData({
        reason: '',
        description: '',
        preferred_topics: [],
        preferred_age_range: '',
        preferred_gender: '',
        urgency_level: 'medium',
        contact_preference: 'chat',
        availability: '',
        previous_support: false
      });
      loadMatches();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit support request',
        variant: 'destructive',
      });
    }
  };

  const handleTopicChange = (topic: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferred_topics: checked 
        ? [...prev.preferred_topics, topic]
        : prev.preferred_topics.filter(t => t !== topic)
    }));
  };

  const availableTopics = [
    'anxiety', 'depression', 'stress', 'relationships', 'academic', 
    'family', 'work', 'self-esteem', 'grief', 'trauma', 'addiction', 'general'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Peer Support</h1>
          <p className="text-gray-600 text-sm sm:text-base">Connect with peers who understand what you're going through</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">{matches.length}</span>
              </div>
              <p className="text-sm text-gray-600">Total Matches</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {matches.filter(m => m.status === 'active').length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Active Connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {matches.filter(m => m.status === 'pending').length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Pending Matches</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-healthcare-primary" />
              Request Peer Support
            </CardTitle>
            <CardDescription>
              Fill out a detailed form to request peer support. Admin/Guide will review and approve your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showRequestForm ? (
              <Button 
                className="bg-healthcare-primary hover:bg-blue-700"
                onClick={() => setShowRequestForm(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Fill Support Request Form
              </Button>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Support *</Label>
                    <Input
                      id="reason"
                      placeholder="Brief reason for requesting support"
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={formData.urgency_level} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency_level: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Can wait a few days</SelectItem>
                        <SelectItem value="medium">Medium - Within 24-48 hours</SelectItem>
                        <SelectItem value="high">High - Within 24 hours</SelectItem>
                        <SelectItem value="urgent">Urgent - Immediate attention needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe your situation and what kind of support you're looking for..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Topics of Interest (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableTopics.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={formData.preferred_topics.includes(topic)}
                          onCheckedChange={(checked) => handleTopicChange(topic, checked as boolean)}
                        />
                        <Label htmlFor={topic} className="text-sm capitalize">{topic}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age-range">Preferred Age Range</Label>
                    <Select value={formData.preferred_age_range} onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_age_range: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any age</SelectItem>
                        <SelectItem value="18-25">18-25</SelectItem>
                        <SelectItem value="26-35">26-35</SelectItem>
                        <SelectItem value="36-45">36-45</SelectItem>
                        <SelectItem value="46+">46+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Preferred Gender</Label>
                    <Select value={formData.preferred_gender} onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any gender</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Preference</Label>
                    <Select value={formData.contact_preference} onValueChange={(value) => setFormData(prev => ({ ...prev, contact_preference: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chat">Text Chat</SelectItem>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Your Availability</Label>
                  <Textarea
                    id="availability"
                    placeholder="When are you typically available? (e.g., weekday evenings, weekend mornings, etc.)"
                    value={formData.availability}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="previous-support"
                    checked={formData.previous_support}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, previous_support: checked as boolean }))}
                  />
                  <Label htmlFor="previous-support" className="text-sm">
                    I have received peer support before
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleRequestSupport}
                    className="bg-healthcare-primary hover:bg-blue-700"
                    disabled={!formData.reason || !formData.description}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request for Approval
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Peer Support Connections</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No peer support matches yet</p>
                <p className="text-sm text-gray-500 mt-2">Request a match to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">Peer Support Match</h3>
                        <Badge className={getStatusColor(match.status)}>
                          {match.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Topics: {match.preferred_topics.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {match.status === 'active' && (
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PeerSupport;