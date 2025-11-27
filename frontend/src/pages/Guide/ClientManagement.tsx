import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, Users, MessageSquare, Phone, 
  Calendar, TrendingUp, AlertTriangle, CheckCircle, Brain 
} from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import { guideService } from '@/services/guideService';

interface Client {
  id: number;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'inactive' | 'at_risk';
  lastAssessment: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastContact: string;
  assignedDate: string;
}

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await guideService.getClients();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-blue-600' },
    { label: 'Active Clients', value: clients.filter(c => c.status === 'active').length, icon: TrendingUp, color: 'text-green-600' },
    { label: 'At Risk', value: clients.filter(c => c.status === 'at_risk').length, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Need Follow-up', value: clients.filter(c => new Date(c.lastContact) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: Calendar, color: 'text-orange-600' },
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Client Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage and monitor your assigned clients</p>
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

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Clients List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Clients ({filteredClients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`} />
                          <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-600">{client.email} • Age {client.age}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(client.status)}>
                              {client.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getRiskColor(client.riskLevel)}>
                              {client.riskLevel} risk
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm">
                          <Brain className="w-4 h-4 mr-2" />
                          Assessments
                        </Button>
                        {client.status === 'at_risk' && (
                          <Button variant="destructive" size="sm">
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Last Assessment:</span>
                        <br />
                        {new Date(client.lastAssessment).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Last Contact:</span>
                        <br />
                        {new Date(client.lastContact).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Assigned:</span>
                        <br />
                        {new Date(client.assignedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </RoleGuard>
  );
};

export default ClientManagement;