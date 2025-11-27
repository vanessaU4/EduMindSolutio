import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Minus, Calendar, Target, 
  Award, Activity, Brain, Heart, BarChart3, Loader2,
  CheckCircle, AlertCircle, Clock, ArrowUp, ArrowDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProgressData {
  date: string;
  moodScore: number;
  anxietyLevel: number;
  depressionLevel: number;
  stressLevel: number;
  sleepQuality: number;
  activityLevel: number;
}

interface Goal {
  id: number;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'mood' | 'activity' | 'social' | 'self-care';
  deadline: string;
  status: 'active' | 'completed' | 'paused';
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  achievedDate: string;
  category: string;
  icon: string;
}

const ProgressTracker: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadProgressData();
  }, [selectedTimeframe]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const [progressResponse, goalsResponse, milestonesResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/wellness/progress/?timeframe=${selectedTimeframe}`),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/wellness/goals/`),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/wellness/milestones/`)
      ]);

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setProgressData(progressData.data || []);
      }

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData.data || []);
      } else {
        // Fallback goals if API not available
        const fallbackGoals: Goal[] = [
          {
            id: 1,
            title: 'Daily Mood Check-ins',
            description: 'Complete mood tracking every day',
            targetValue: 30,
            currentValue: 22,
            unit: 'days',
            category: 'mood',
            deadline: '2024-02-29',
            status: 'active'
          },
          {
            id: 2,
            title: 'Weekly Exercise',
            description: 'Exercise at least 3 times per week',
            targetValue: 12,
            currentValue: 8,
            unit: 'sessions',
            category: 'activity',
            deadline: '2024-02-29',
            status: 'active'
          },
          {
            id: 3,
            title: 'Social Connections',
            description: 'Have meaningful conversations with friends',
            targetValue: 20,
            currentValue: 15,
            unit: 'conversations',
            category: 'social',
            deadline: '2024-02-29',
            status: 'active'
          },
          {
            id: 4,
            title: 'Meditation Practice',
            description: 'Practice mindfulness meditation',
            targetValue: 25,
            currentValue: 25,
            unit: 'sessions',
            category: 'self-care',
            deadline: '2024-01-31',
            status: 'completed'
          }
        ];
        setGoals(fallbackGoals);
      }

      if (milestonesResponse.ok) {
        const milestonesData = await milestonesResponse.json();
        setMilestones(milestonesData.data || []);
      } else {
        // Fallback milestones if API not available
        const fallbackMilestones: Milestone[] = [
          {
            id: 1,
            title: 'First Assessment Completed',
            description: 'Completed your first mental health assessment',
            achievedDate: '2024-01-05',
            category: 'Assessment',
            icon: '🧠'
          },
          {
            id: 2,
            title: '7-Day Streak',
            description: 'Maintained mood tracking for 7 consecutive days',
            achievedDate: '2024-01-12',
            category: 'Consistency',
            icon: '🔥'
          },
          {
            id: 3,
            title: 'Community Contributor',
            description: 'Made your first post in the community forums',
            achievedDate: '2024-01-18',
            category: 'Community',
            icon: '💬'
          },
          {
            id: 4,
            title: 'Wellness Warrior',
            description: 'Completed 10 wellness activities',
            achievedDate: '2024-01-25',
            category: 'Wellness',
            icon: '⭐'
          }
        ];
        setMilestones(fallbackMilestones);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load progress data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getGoalStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'mood':
        return 'bg-purple-100 text-purple-800';
      case 'activity':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-blue-100 text-blue-800';
      case 'self-care':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const currentMood = progressData.length > 0 ? progressData[progressData.length - 1].moodScore : 0;
  const previousMood = progressData.length > 1 ? progressData[progressData.length - 2].moodScore : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-healthcare-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Progress Tracker</h1>
          <p className="text-gray-600">Monitor your mental health journey and celebrate your achievements</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Mood</p>
                  <p className="text-3xl font-bold text-gray-900">{currentMood}/10</p>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(currentMood, previousMood)}
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Goals</p>
                  <p className="text-3xl font-bold text-gray-900">{goals.filter(g => g.status === 'active').length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Milestones</p>
                  <p className="text-3xl font-bold text-gray-900">{milestones.length}</p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Streak Days</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mood Trends</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe('week')}
                    >
                      Week
                    </Button>
                    <Button
                      variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe('month')}
                    >
                      Month
                    </Button>
                    <Button
                      variant={selectedTimeframe === 'quarter' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe('quarter')}
                    >
                      Quarter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="moodScore"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      name="Mood Score"
                    />
                    <Area
                      type="monotone"
                      dataKey="anxietyLevel"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                      name="Anxiety Level"
                    />
                    <Area
                      type="monotone"
                      dataKey="sleepQuality"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      name="Sleep Quality"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Completed mood check-in</span>
                      <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Joined community discussion</span>
                      <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Completed wellness challenge</span>
                      <span className="text-xs text-gray-500 ml-auto">2 days ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Achieved 7-day streak</span>
                      <span className="text-xs text-gray-500 ml-auto">3 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mood Check-ins</span>
                      <Badge variant="secondary">7/7</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Exercise Sessions</span>
                      <Badge variant="secondary">3/3</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Community Posts</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Meditation Minutes</span>
                      <Badge variant="secondary">150</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(goal.category)}>
                          {goal.category}
                        </Badge>
                        <Badge className={getGoalStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                        </div>
                        <Progress value={getGoalProgress(goal)} className="h-2" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                      {goal.status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Goal Completed!</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestones.map((milestone) => (
                <Card key={milestone.id} className="text-center">
                  <CardHeader>
                    <div className="text-4xl mb-4">{milestone.icon}</div>
                    <CardTitle className="text-lg">{milestone.title}</CardTitle>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="mb-2">
                      {milestone.category}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Achieved on {new Date(milestone.achievedDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Positive Trend</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Your mood scores have improved by 25% over the past month.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Activity Correlation</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Higher activity levels correlate with better sleep quality.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-800">Pattern Recognition</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        Your best mood days typically occur after social activities.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Continue Your Streak</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        You're doing great with daily check-ins. Keep it up!
                      </p>
                      <Button size="sm" variant="outline">
                        Log Today's Mood
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Try a New Activity</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Based on your progress, you might enjoy mindfulness exercises.
                      </p>
                      <Button size="sm" variant="outline">
                        Explore Activities
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Connect with Others</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Social connections seem to boost your mood. Consider joining a discussion.
                      </p>
                      <Button size="sm" variant="outline">
                        Visit Community
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ProgressTracker;