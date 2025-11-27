import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, Clock, User, Phone, MessageSquare, 
  CheckCircle, XCircle, Eye, Filter, Search, Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CrisisAlert {
  id: number;
  clientId: number;
  clientName: string;
  alertType: 'suicide_risk' | 'self_harm' | 'severe_depression' | 'panic_attack' | 'substance_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  description: string;
  triggerSource: 'assessment' | 'self_report' | 'ai_detection' | 'manual';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
  notes: string[];
  contactAttempts: number;
  lastContactAt?: string;
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
}

const CrisisAlertsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const statuses = ['All', 'active', 'acknowledged', 'resolved', 'escalated'];
  const severities = ['All', 'low', 'medium', 'high', 'critical'];

  // Mock crisis alerts data
  const mockAlerts: CrisisAlert[] = [
    {
      id: 1,
      clientId: 101,
      clientName: 'Sarah Johnson',
      alertType: 'suicide_risk',
      severity: 'critical',
      status: 'active',
      description: 'High suicide risk detected from PHQ-9 assessment with score of 23. Client expressed active suicidal ideation.',
      triggerSource: 'assessment',
      createdAt: '2024-10-13T14:30:00Z',
      assignedTo: 'Dr. Michael Chen',
      notes: [
        'Initial assessment completed - immediate intervention required',
        'Attempted phone contact at 2:45 PM - no answer'
      ],
      contactAttempts: 2,
      lastContactAt: '2024-10-13T14:45:00Z',
      emergencyContacts: [
        { name: 'Mark Johnson', relationship: 'Spouse', phone: '555-0123' },
        { name: 'Lisa Johnson', relationship: 'Sister', phone: '555-0124' }
      ]
    },
    {
      id: 2,
      clientId: 102,
      clientName: 'Michael Chen',
      alertType: 'self_harm',
      severity: 'high',
      status: 'acknowledged',
      description: 'Client reported recent self-harm behavior during check-in. Cuts on arms observed.',
      triggerSource: 'self_report',
      createdAt: '2024-10-13T12:15:00Z',
      acknowledgedAt: '2024-10-13T12:30:00Z',
      assignedTo: 'Dr. Lisa Martinez',
      notes: [
        'Client contacted and assessed',
        'Safety plan reviewed and updated',
        'Follow-up scheduled for tomorrow'
      ],
      contactAttempts: 1,
      lastContactAt: '2024-10-13T12:30:00Z',
      emergencyContacts: [
        { name: 'Emma Chen', relationship: 'Mother', phone: '555-0125' }
      ]
    },
    {
      id: 3,
      clientId: 103,
      clientName: 'Emma Davis',
      alertType: 'severe_depression',
      severity: 'medium',
      status: 'resolved',
      description: 'Severe depression symptoms with social isolation. Client missed last 3 appointments.',
      triggerSource: 'ai_detection',
      createdAt: '2024-10-12T16:20:00Z',
      acknowledgedAt: '2024-10-12T16:45:00Z',
      resolvedAt: '2024-10-13T10:30:00Z',
      assignedTo: 'Dr. James Wilson',
      notes: [
        'Client contacted successfully',
        'Rescheduled appointment',
        'Medication adjustment discussed',
        'Client stable and engaged'
      ],
      contactAttempts: 3,
      lastContactAt: '2024-10-13T10:30:00Z',
      emergencyContacts: [
        { name: 'Robert Davis', relationship: 'Father', phone: '555-0126' }
      ]
    }
  ];

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlerts(mockAlerts);
      
      toast({
        title: 'Demo Mode',
        description: 'Displaying sample crisis alerts. Backend integration in progress.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load crisis alerts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || alert.status === selectedStatus;
    const matchesSeverity = selectedSeverity === 'All' || alert.severity === selectedSeverity;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'suicide_risk': return 'Suicide Risk';
      case 'self_harm': return 'Self Harm';
      case 'severe_depression': return 'Severe Depression';
      case 'panic_attack': return 'Panic Attack';
      case 'substance_abuse': return 'Substance Abuse';
      default: return type;
    }
  };

  const handleAcknowledgeAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged', 
            acknowledgedAt: new Date().toISOString() 
          }
        : alert
    ));
    
    toast({
      title: 'Alert Acknowledged',
      description: 'Crisis alert has been acknowledged and assigned.',
    });
  };

  const handleResolveAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved', 
            resolvedAt: new Date().toISOString() 
          }
        : alert
    ));
    
    toast({
      title: 'Alert Resolved',
      description: 'Crisis alert has been marked as resolved.',
    });
  };

  const handleEscalateAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'escalated' }
        : alert
    ));
    
    toast({
      title: 'Alert Escalated',
      description: 'Crisis alert has been escalated to emergency services.',
      variant: 'destructive',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const canManageAlerts = user?.role === 'admin' || user?.role === 'guide';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
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
        {/* Emergency Alert */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Crisis Management:</strong> All alerts require immediate attention. Contact emergency services (911) for life-threatening situations.
          </AlertDescription>
        </Alert>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Crisis Alerts
              </h1>
              <p className="text-gray-600">
                Monitor and respond to crisis situations requiring immediate attention
              </p>
            </div>
            {canManageAlerts && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-red-600">
                      {alerts.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Acknowledged</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {alerts.filter(a => a.status === 'acknowledged').length}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resolved Today</p>
                    <p className="text-2xl font-bold text-green-600">
                      {alerts.filter(a => a.status === 'resolved').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Critical</p>
                    <p className="text-2xl font-bold text-red-600">
                      {alerts.filter(a => a.severity === 'critical').length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {severities.map(severity => (
                <option key={severity} value={severity}>
                  {severity === 'All' ? 'All Severities' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity).split(' ')[2]} hover:shadow-lg transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{alert.clientName}</CardTitle>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {getAlertTypeLabel(alert.alertType)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getTimeAgo(alert.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {alert.assignedTo || 'Unassigned'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {alert.contactAttempts} attempts
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">{alert.description}</p>
                
                {alert.notes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                    <ul className="space-y-1">
                      {alert.notes.map((note, index) => (
                        <li key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {alert.emergencyContacts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Emergency Contacts:</h4>
                    <div className="flex flex-wrap gap-2">
                      {alert.emergencyContacts.map((contact, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {contact.name} ({contact.relationship}) - {contact.phone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Created: {formatDateTime(alert.createdAt)}
                    {alert.lastContactAt && (
                      <span className="ml-4">
                        Last Contact: {formatDateTime(alert.lastContactAt)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <Button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    {(alert.status === 'active' || alert.status === 'acknowledged') && (
                      <>
                        <Button
                          onClick={() => handleResolveAlert(alert.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          onClick={() => handleEscalateAlert(alert.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Escalate
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No crisis alerts found</h3>
            <p className="text-gray-500">
              No alerts match your current search criteria.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CrisisAlertsPage;
