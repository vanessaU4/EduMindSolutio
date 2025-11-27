import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Users, MessageSquare, Phone, Calendar, TrendingUp, 
  AlertTriangle, CheckCircle, Brain, Shield, User as UserIcon, Mail, 
  UserCheck, Activity, Clock
} from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import { userService, User } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

const ClientsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [guides, setGuides] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const { toast } = useToast();

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      
      // Load all users first, then separate by role (since /accounts/clients/ only returns role='user')
      const allUsersResult = await userService.getAllUsers();
      console.log('Raw getAllUsers result:', allUsersResult);
      
      // Handle response format
      let allUsersList: User[] = [];
      if (Array.isArray(allUsersResult)) {
        allUsersList = allUsersResult;
      } else if (allUsersResult && typeof allUsersResult === 'object' && 'results' in allUsersResult && Array.isArray((allUsersResult as any).results)) {
        allUsersList = (allUsersResult as any).results;
      } else if (allUsersResult && typeof allUsersResult === 'object' && 'data' in allUsersResult && Array.isArray((allUsersResult as any).data)) {
        allUsersList = (allUsersResult as any).data;
      }
      
      console.log('Processed all users:', allUsersList);
      console.log('All users count:', allUsersList.length);
      console.log('All users roles:', allUsersList.map(u => u.role));
      
      // Separate by role on frontend
      const clientsList = allUsersList.filter(user => user.role === 'user');
      const guidesList = allUsersList.filter(user => user.role === 'guide');
      
      console.log('Filtered clients:', clientsList);
      console.log('Filtered guides:', guidesList);
      console.log('Clients count:', clientsList.length);
      console.log('Guides count:', guidesList.length);
      
      setUsers(clientsList);
      setGuides(guidesList);
      
      // Show appropriate messages
      if (clientsList.length === 0 && guidesList.length === 0) {
        toast({
          title: 'Info',
          description: 'No users found in the system.',
          variant: 'default',
        });
      } else {
        // Success - show what was loaded
        const loadedItems = [];
        if (clientsList.length > 0) loadedItems.push(`${clientsList.length} users`);
        if (guidesList.length > 0) loadedItems.push(`${guidesList.length} guides`);
        
        console.log(`Successfully loaded: ${loadedItems.join(', ')}`);
      }
    } catch (error) {
      console.error('Unexpected error loading users:', error);
      setUsers([]);
      setGuides([]);
      toast({
        title: 'Error',
        description: 'Failed to load users. You may not have sufficient permissions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredGuides = Array.isArray(guides) ? guides.filter(guide =>
    guide.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${guide.first_name || ''} ${guide.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getStatusColor = (isActive: boolean, lastActive?: string) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    
    if (lastActive) {
      const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActive <= 7) return 'bg-green-100 text-green-800';
      if (daysSinceActive <= 30) return 'bg-yellow-100 text-yellow-800';
    }
    
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive: boolean, lastActive?: string) => {
    if (!isActive) return 'Inactive';
    
    if (lastActive) {
      const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActive <= 7) return 'Active';
      if (daysSinceActive <= 30) return 'Recently Active';
    }
    
    return 'Inactive';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const userStats = [
    { label: 'Total Users', value: Array.isArray(users) ? users.length : 0, icon: Users, color: 'text-blue-600' },
    { label: 'Active Users', value: Array.isArray(users) ? users.filter(u => u.is_active).length : 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'New This Month', value: Array.isArray(users) ? users.filter(u => new Date(u.date_joined) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length : 0, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Recent Activity', value: Array.isArray(users) ? users.filter(u => u.last_active && new Date(u.last_active) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length : 0, icon: Activity, color: 'text-orange-600' },
  ];

  const guideStats = [
    { label: 'Total Guides', value: Array.isArray(guides) ? guides.length : 0, icon: Shield, color: 'text-blue-600' },
    { label: 'Active Guides', value: Array.isArray(guides) ? guides.filter(g => g.is_active).length : 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'New This Month', value: Array.isArray(guides) ? guides.filter(g => new Date(g.date_joined) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length : 0, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Recent Activity', value: Array.isArray(guides) ? guides.filter(g => g.last_active && new Date(g.last_active) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length : 0, icon: Activity, color: 'text-orange-600' },
  ];

  const renderUserCard = (user: User) => (
    <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
            <AvatarFallback>
              {user.first_name?.[0]}{user.last_name?.[0] || user.username[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">
              {user.display_name || `${user.first_name} ${user.last_name}` || user.username}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(user.is_active, user.last_active)}>
                {getStatusText(user.is_active, user.last_active)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {user.role === 'user' ? 'Client' : user.role}
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
          {user.role === 'user' && (
            <Button variant="outline" size="sm">
              <UserCheck className="w-4 h-4 mr-2" />
              Assign
            </Button>
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <span className="font-medium">Joined:</span>
          <br />
          {formatDate(user.date_joined)}
        </div>
        <div>
          <span className="font-medium">Last Active:</span>
          <br />
          {user.last_active ? formatDate(user.last_active) : 'Never'}
        </div>
      </div>
    </div>
  );

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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              View and manage all users and guides in the system
            </p>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Users and Guides */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Users ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="guides" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Guides ({filteredGuides.length})
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userStats.map((stat, index) => (
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

              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Users ({filteredUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">No users found</p>
                      </div>
                    ) : (
                      filteredUsers.map(renderUserCard)
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent value="guides" className="space-y-6">
              {/* Guide Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {guideStats.map((stat, index) => (
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

              {/* Guides List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Guides ({filteredGuides.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredGuides.length === 0 ? (
                      <div className="text-center py-8">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">No guides found</p>
                      </div>
                    ) : (
                      filteredGuides.map(renderUserCard)
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </RoleGuard>
  );
};

export default ClientsPage;
