import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, Clock, Phone, MessageSquare, 
  CheckCircle, XCircle, User, Calendar, Shield
} from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import { guideService } from '@/services/guideService';

interface CrisisAlert {
  id: number;
  clientName: string;
  clientId: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'self_harm' | 'suicidal_ideation' | 'substance_abuse' | 'panic_attack' | 'other';
  description: string;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  assignedTo: string;
  lastAction: string;
  contactAttempts: number;
}

const CrisisAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await guideService.getCrisisAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load crisis alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'self_harm': return 'Self Harm';
      case 'suicidal_ideation': return 'Suicidal Ideation';
      case 'substance_abuse': return 'Substance Abuse';
      case 'panic_attack': return 'Panic Attack';
      default: return 'Other';
    }
  };

  const filterAlertsByStatus = (status: string) => {
    if (status === 'all') return alerts;
    return alerts.filter(alert => alert.status === status);
  };

  const handleContactClient = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, contactAttempts: alert.contactAttempts + 1, status: 'in_progress', lastAction: 'Phone call attempted' }
        : alert
    ));
  };

  const handleResolveAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved', lastAction: 'Resolved by guide' }
        : alert
    ));
  };

  const handleEscalateAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'escalated', assignedTo: 'Crisis Team', lastAction: 'Escalated to crisis team' }
        : alert
    ));
  };

  const stats = [
    { label: 'Total Alerts', value: alerts.length, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Pending', value: alerts.filter(a => a.status === 'pending').length, icon: Clock, color: 'text-orange-600' },
    { label: 'In Progress', value: alerts.filter(a => a.status === 'in_progress').length, icon: User, color: 'text-yellow-600' },
    { label: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, icon: Shield, color: 'text-red-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary"></div>
      </div>
    );
  }

  return (
    <RoleGuard requireGuide>
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Crisis Alerts</h1>
            <p className="text-gray-600 text-sm sm:text-base">Monitor and respond to client crisis situations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Emergency Protocols */}
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Protocols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Immediate Danger</h4>
                  <p className="text-red-700">Call 911 or local emergency services immediately</p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Crisis Hotline</h4>
                  <p className="text-red-700">National Suicide Prevention Lifeline: 988</p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Escalation</h4>
                  <p className="text-red-700">Contact supervisor or crisis team for guidance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Crisis Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="escalated">Escalated</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                {['pending', 'in_progress', 'resolved', 'escalated', 'all'].map(status => (
                  <TabsContent key={status} value={status} className="mt-6">
                    <div className="space-y-4">
                      {filterAlertsByStatus(status).map((alert) => (
                        <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${alert.clientName}`} />
                                <AvatarFallback>{alert.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">{alert.clientName}</h3>
                                  <Badge className={getSeverityColor(alert.severity)}>
                                    {alert.severity.toUpperCase()}
                                  </Badge>
                                  <Badge className={getStatusColor(alert.status)}>
                                    {alert.status.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant="outline">
                                    {getTypeLabel(alert.type)}
                                  </Badge>
                                </div>
                                <p className="text-gray-700 mb-3">{alert.description}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Time:</span>
                                    <br />
                                    {new Date(alert.timestamp).toLocaleString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Assigned To:</span>
                                    <br />
                                    {alert.assignedTo}
                                  </div>
                                  <div>
                                    <span className="font-medium">Contact Attempts:</span>
                                    <br />
                                    {alert.contactAttempts}
                                  </div>
                                  <div>
                                    <span className="font-medium">Last Action:</span>
                                    <br />
                                    {alert.lastAction}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              {alert.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleContactClient(alert.id)}
                                  >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Client
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEscalateAlert(alert.id)}
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Escalate
                                  </Button>
                                </>
                              )}
                              {alert.status === 'in_progress' && (
                                <>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => handleContactClient(alert.id)}
                                  >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Again
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleResolveAlert(alert.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Resolve
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEscalateAlert(alert.id)}
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Escalate
                                  </Button>
                                </>
                              )}
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filterAlertsByStatus(status).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No {status === 'all' ? '' : status} alerts found
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </RoleGuard>
  );
};

export default CrisisAlerts;