import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Edit, Trash2, Target, Calendar, Trophy, 
  Users, BarChart3, Settings, CheckCircle, Clock,
  Zap, Star, Award, TrendingUp, Activity
} from 'lucide-react';
import { wellnessService, Challenge, WeeklyChallenge } from '@/services/wellnessService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ChallengeFormData {
  title: string;
  description: string;
  challenge_type: string;
  instructions: string;
  points_reward: number;
  target_value?: number;
  duration_minutes?: number;
  is_active: boolean;
}

interface WeeklyChallengeFormData {
  title: string;
  description: string;
  challenge_type: string;
  instructions: string;
  target_days: number;
  points_per_day: number;
  bonus_points: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const WellnessManagement: React.FC = () => {
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | WeeklyChallenge | null>(null);
  const [activeTab, setActiveTab] = useState('daily');
  const { toast } = useToast();
  const { user } = useAuth();

  const [dailyFormData, setDailyFormData] = useState<ChallengeFormData>({
    title: '',
    description: '',
    challenge_type: 'mood_checkin',
    instructions: '',
    points_reward: 10,
    target_value: undefined,
    duration_minutes: undefined,
    is_active: true
  });

  const [weeklyFormData, setWeeklyFormData] = useState<WeeklyChallengeFormData>({
    title: '',
    description: '',
    challenge_type: 'habit_building',
    instructions: '',
    target_days: 7,
    points_per_day: 10,
    bonus_points: 50,
    start_date: '',
    end_date: '',
    is_active: true
  });

  const dailyChallengeTypes = [
    { value: 'mood_checkin', label: 'Mood Check-in' },
    { value: 'breathing', label: 'Breathing Exercise' },
    { value: 'gratitude', label: 'Gratitude Practice' },
    { value: 'physical', label: 'Physical Activity' },
    { value: 'social', label: 'Social Connection' },
    { value: 'learning', label: 'Educational Content' },
    { value: 'mindfulness', label: 'Mindfulness Practice' }
  ];

  const weeklyChallengeTypes = [
    { value: 'habit_building', label: 'Habit Building' },
    { value: 'fitness', label: 'Fitness Goal' },
    { value: 'mindfulness', label: 'Mindfulness Practice' },
    { value: 'social', label: 'Social Connection' },
    { value: 'learning', label: 'Personal Development' },
    { value: 'creativity', label: 'Creative Expression' }
  ];

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const [daily, weekly] = await Promise.all([
        wellnessService.getDailyChallenges(),
        wellnessService.getWeeklyChallenges()
      ]);
      setDailyChallenges(Array.isArray(daily) ? daily : []);
      setWeeklyChallenges(Array.isArray(weekly) ? weekly : []);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load challenges',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDailyChallenge = async () => {
    try {
      // Debug user role and permissions
      console.log('🔍 User Debug Info:');
      console.log('- User object:', user);
      console.log('- User role:', user?.role);
      console.log('- User is_staff:', user?.is_staff);
      console.log('- User is_superuser:', user?.is_superuser);
      console.log('- Is admin check:', user?.role === 'admin');
      
      console.log('📝 Creating daily challenge with data:', dailyFormData);
      console.log('📝 JSON stringified data:', JSON.stringify(dailyFormData, null, 2));
      
      // Validate required fields
      if (!dailyFormData.title || !dailyFormData.description || !dailyFormData.instructions) {
        throw new Error('Please fill in all required fields (title, description, instructions)');
      }
      
      // Clean the data - remove undefined values
      const cleanedData: any = {
        title: dailyFormData.title,
        description: dailyFormData.description,
        challenge_type: dailyFormData.challenge_type,
        instructions: dailyFormData.instructions,
        points_reward: dailyFormData.points_reward,
        is_active: dailyFormData.is_active
      };
      
      // Only add optional fields if they have values
      if (dailyFormData.target_value && dailyFormData.target_value > 0) {
        cleanedData.target_value = dailyFormData.target_value;
      }
      if (dailyFormData.duration_minutes && dailyFormData.duration_minutes > 0) {
        cleanedData.duration_minutes = dailyFormData.duration_minutes;
      }
      
      console.log('🧹 Cleaned data being sent:', cleanedData);
      const result = await wellnessService.createDailyChallenge(cleanedData);
      console.log('✅ Challenge created successfully:', result);
      toast({
        title: 'Success',
        description: 'Daily challenge created successfully'
      });
      setIsCreateDialogOpen(false);
      resetDailyForm();
      loadChallenges();
    } catch (error) {
      console.error('❌ Error creating challenge:', error);
      console.error('❌ Error details:', error.message);
      
      // Check if it's a permission error
      if (error.message.includes('permission') || error.message.includes('403')) {
        console.log('🚨 Permission Error Detected!');
        console.log('💡 Possible solutions:');
        console.log('1. Check if user.is_staff = True in backend');
        console.log('2. Check if user.is_superuser = True in backend');
        console.log('3. Verify user role is set to "admin"');
      }
      
      toast({
        title: 'Error',
        description: `Failed to create challenge: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  const handleCreateWeeklyChallenge = async () => {
    try {
      await wellnessService.createWeeklyChallenge(weeklyFormData);
      toast({
        title: 'Success',
        description: 'Weekly challenge created successfully'
      });
      setIsCreateDialogOpen(false);
      resetWeeklyForm();
      loadChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to create challenge',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteChallenge = async (challengeId: number, type: 'daily' | 'weekly') => {
    try {
      if (type === 'daily') {
        await wellnessService.deleteDailyChallenge(challengeId);
      } else {
        await wellnessService.deleteWeeklyChallenge(challengeId);
      }
      toast({
        title: 'Success',
        description: 'Challenge deleted successfully'
      });
      loadChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete challenge',
        variant: 'destructive'
      });
    }
  };

  const resetDailyForm = () => {
    setDailyFormData({
      title: '',
      description: '',
      challenge_type: 'mood_checkin',
      instructions: '',
      points_reward: 10,
      target_value: undefined,
      duration_minutes: undefined,
      is_active: true
    });
  };

  const resetWeeklyForm = () => {
    setWeeklyFormData({
      title: '',
      description: '',
      challenge_type: 'habit_building',
      instructions: '',
      target_days: 7,
      points_per_day: 10,
      bonus_points: 50,
      start_date: '',
      end_date: '',
      is_active: true
    });
  };

  const getChallengeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mood_checkin: 'bg-blue-100 text-blue-800',
      breathing: 'bg-green-100 text-green-800',
      gratitude: 'bg-purple-100 text-purple-800',
      physical: 'bg-orange-100 text-orange-800',
      social: 'bg-pink-100 text-pink-800',
      learning: 'bg-indigo-100 text-indigo-800',
      mindfulness: 'bg-teal-100 text-teal-800',
      habit_building: 'bg-yellow-100 text-yellow-800',
      fitness: 'bg-red-100 text-red-800',
      creativity: 'bg-violet-100 text-violet-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatChallengeType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary"></div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Wellness Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage daily and weekly wellness challenges for users
              </p>
              
              {/* Debug Role Information */}
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">🔍 Debug Info:</p>
                <div className="text-xs text-yellow-700 mt-1 space-y-1">
                  <div>User: {user?.username || user?.email || 'Not loaded'}</div>
                  <div>Role: {user?.role || 'Not set'}</div>
                  <div>Is Staff: {user?.is_staff ? '✅ Yes' : '❌ No'}</div>
                  <div>Is Superuser: {user?.is_superuser ? '✅ Yes' : '❌ No'}</div>
                  <div>Admin Access: {user?.role === 'admin' ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-healthcare-primary hover:bg-blue-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Challenge</DialogTitle>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="daily">Daily Challenge</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly Challenge</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="daily" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={dailyFormData.title}
                          onChange={(e) => setDailyFormData({...dailyFormData, title: e.target.value})}
                          placeholder="Challenge title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={dailyFormData.challenge_type}
                          onValueChange={(value) => setDailyFormData({...dailyFormData, challenge_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dailyChallengeTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={dailyFormData.description}
                        onChange={(e) => setDailyFormData({...dailyFormData, description: e.target.value})}
                        placeholder="Challenge description"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Instructions</label>
                      <Textarea
                        value={dailyFormData.instructions}
                        onChange={(e) => setDailyFormData({...dailyFormData, instructions: e.target.value})}
                        placeholder="Detailed instructions"
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Points Reward</label>
                        <Input
                          type="number"
                          value={dailyFormData.points_reward}
                          onChange={(e) => setDailyFormData({...dailyFormData, points_reward: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Target Value (Optional)</label>
                        <Input
                          type="number"
                          value={dailyFormData.target_value || ''}
                          onChange={(e) => setDailyFormData({...dailyFormData, target_value: e.target.value ? parseInt(e.target.value) : undefined})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Duration (minutes)</label>
                        <Input
                          type="number"
                          value={dailyFormData.duration_minutes || ''}
                          onChange={(e) => setDailyFormData({...dailyFormData, duration_minutes: e.target.value ? parseInt(e.target.value) : undefined})}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleCreateDailyChallenge} className="w-full">
                      Create Daily Challenge
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="weekly" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={weeklyFormData.title}
                          onChange={(e) => setWeeklyFormData({...weeklyFormData, title: e.target.value})}
                          placeholder="Challenge title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={weeklyFormData.challenge_type}
                          onValueChange={(value) => setWeeklyFormData({...weeklyFormData, challenge_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {weeklyChallengeTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={weeklyFormData.description}
                        onChange={(e) => setWeeklyFormData({...weeklyFormData, description: e.target.value})}
                        placeholder="Challenge description"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Instructions</label>
                      <Textarea
                        value={weeklyFormData.instructions}
                        onChange={(e) => setWeeklyFormData({...weeklyFormData, instructions: e.target.value})}
                        placeholder="Detailed instructions"
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          value={weeklyFormData.start_date}
                          onChange={(e) => setWeeklyFormData({...weeklyFormData, start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Date</label>
                        <Input
                          type="date"
                          value={weeklyFormData.end_date}
                          onChange={(e) => setWeeklyFormData({...weeklyFormData, end_date: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Target Days</label>
                        <Input
                          type="number"
                          min="1"
                          max="7"
                          value={weeklyFormData.target_days}
                          onChange={(e) => setWeeklyFormData({...weeklyFormData, target_days: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Points Per Day</label>
                        <Input
                          type="number"
                          value={weeklyFormData.points_per_day}
                          onChange={(e) => setWeeklyFormData({...weeklyFormData, points_per_day: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Bonus Points</label>
                        <Input
                          type="number"
                          value={weeklyFormData.bonus_points}
                          onChange={(e) => setWeeklyFormData({...weeklyFormData, bonus_points: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleCreateWeeklyChallenge} className="w-full">
                      Create Weekly Challenge
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Daily Challenges</p>
                  <p className="text-3xl font-bold text-gray-900">{dailyChallenges.length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Weekly Challenges</p>
                  <p className="text-3xl font-bold text-gray-900">{weeklyChallenges.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Challenges</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dailyChallenges.filter(c => c.is_active).length + weeklyChallenges.filter(c => c.is_active).length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Points Available</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dailyChallenges.reduce((sum, c) => sum + c.points_reward, 0) + 
                     weeklyChallenges.reduce((sum, c) => sum + (c.points_per_day * c.target_days + c.bonus_points), 0)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenge Lists */}
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList>
            <TabsTrigger value="daily">Daily Challenges</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Challenges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <div className="grid gap-4">
              {dailyChallenges.map((challenge) => (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                          <Badge className={getChallengeTypeColor(challenge.challenge_type)}>
                            {formatChallengeType(challenge.challenge_type)}
                          </Badge>
                          <Badge variant={challenge.is_active ? "default" : "secondary"}>
                            {challenge.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{challenge.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {challenge.points_reward} points
                          </span>
                          {challenge.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {challenge.duration_minutes} min
                            </span>
                          )}
                          {challenge.target_value && (
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              Target: {challenge.target_value}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="weekly">
            <div className="grid gap-4">
              {weeklyChallenges.map((challenge) => (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                          <Badge className={getChallengeTypeColor(challenge.challenge_type)}>
                            {formatChallengeType(challenge.challenge_type)}
                          </Badge>
                          <Badge variant={challenge.is_active ? "default" : "secondary"}>
                            {challenge.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{challenge.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {challenge.target_days} days
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {challenge.points_per_day}/day + {challenge.bonus_points} bonus
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteChallenge(challenge.id, 'weekly')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default WellnessManagement;
