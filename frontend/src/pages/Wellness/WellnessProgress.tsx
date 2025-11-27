import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  Activity,
  Smile,
  Heart,
  Brain,
  Zap,
  Moon,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  Share2,
  Filter,
  Clock,
  Star,
  Trophy,
  Flame,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Eye,
  Calendar as CalendarIcon
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { toast } from 'sonner';

interface ProgressData {
  overview: {
    total_points: number;
    current_streak: number;
    longest_streak: number;
    activities_completed: number;
    mood_entries: number;
    achievements_earned: number;
    wellness_score: number;
    score_trend: 'up' | 'down' | 'stable';
  };
  weekly_progress: Array<{
    week: string;
    points_earned: number;
    activities_completed: number;
    mood_average: number;
    streak_days: number;
  }>;
  monthly_summary: Array<{
    month: string;
    total_points: number;
    avg_mood: number;
    completion_rate: number;
    achievements: number;
  }>;
  category_breakdown: Array<{
    category: string;
    points: number;
    activities: number;
    completion_rate: number;
  }>;
  mood_trends: Array<{
    date: string;
    mood: number;
    energy: number;
    anxiety: number;
    sleep_quality: number;
  }>;
  milestones: Array<{
    id: number;
    title: string;
    description: string;
    achieved_at: string;
    points_reward: number;
    category: string;
  }>;
}

const WellnessProgress: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'milestones'>('overview');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const data = await wellnessService.getUserProgress(timeRange);
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'bg-green-500';
    if (mood >= 3) return 'bg-yellow-500';
    if (mood >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load progress data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div 
          className="py-6 sm:py-8 lg:py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {/* Header */}
        <motion.div className="mb-12" variants={itemVariants}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Wellness Progress
              </h1>
              <p className="text-gray-600 text-lg">Track your wellness journey and celebrate achievements</p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={(value: '7' | '30' | '90') => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={loadProgressData}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Wellness Score</p>
                    <p className="text-3xl font-bold">{progressData.overview.wellness_score}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(progressData.overview.score_trend)}
                    <Brain className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Points</p>
                    <p className="text-3xl font-bold">{progressData.overview.total_points.toLocaleString()}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Current Streak</p>
                    <p className="text-3xl font-bold">{progressData.overview.current_streak} days</p>
                  </div>
                  <Flame className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Achievements</p>
                    <p className="text-3xl font-bold">{progressData.overview.achievements_earned}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <PieChart className="w-4 h-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Milestones</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Weekly Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {progressData.weekly_progress?.map((week, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{week.week}</span>
                            <Badge variant="outline">{week.points_earned} pts</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Activities:</span>
                              <div className="font-medium">{week.activities_completed}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Avg Mood:</span>
                              <div className="font-medium">{week.mood_average.toFixed(1)}/5</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Streak:</span>
                              <div className="font-medium">{week.streak_days} days</div>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No weekly data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Activity Summary */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Activity Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Activities Completed</span>
                        <span className="text-2xl font-bold">{progressData.overview.activities_completed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Mood Entries</span>
                        <span className="text-2xl font-bold">{progressData.overview.mood_entries}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Longest Streak</span>
                        <span className="text-2xl font-bold">{progressData.overview.longest_streak} days</span>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Overall Progress</span>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <LineChart className="w-5 h-5" />
                      <span>Mood Trends</span>
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'chart' ? 'list' : 'chart')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {viewMode === 'chart' ? 'List View' : 'Chart View'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {progressData.mood_trends && progressData.mood_trends.length > 0 ? (
                    <div className="space-y-4">
                      {progressData.mood_trends.slice(0, 10).map((entry, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium w-24">{entry.date}</div>
                          <div className="flex-1 grid grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                              <Smile className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">Mood: {entry.mood}/5</span>
                              <div className={`w-2 h-2 rounded-full ${getMoodColor(entry.mood)}`} />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">Energy: {entry.energy}/5</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span className="text-sm">Anxiety: {entry.anxiety}/5</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Moon className="w-4 h-4 text-indigo-500" />
                              <span className="text-sm">Sleep: {entry.sleep_quality}/5</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <LineChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No mood trend data available</p>
                      <p className="text-sm">Start tracking your mood to see trends</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {progressData.category_breakdown?.map((category, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="capitalize">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Points Earned</span>
                          <span className="font-bold">{category.points}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Activities</span>
                          <span className="font-bold">{category.activities}</span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className="font-bold">{category.completion_rate}%</span>
                          </div>
                          <Progress value={category.completion_rate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )) || (
                <motion.div variants={itemVariants} className="col-span-3">
                  <Card>
                    <CardContent className="text-center py-12">
                      <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Category Data</h3>
                      <p className="text-gray-500">Complete activities to see category breakdown</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {progressData.milestones?.map((milestone, index) => (
                <motion.div key={milestone.id} variants={itemVariants}>
                  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <Trophy className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{milestone.title}</h3>
                          <p className="text-gray-600 mb-3">{milestone.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {milestone.category}
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Achieved</div>
                              <div className="text-sm font-medium">{new Date(milestone.achieved_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <Badge variant="outline">+{milestone.points_reward} points</Badge>
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )) || (
                <motion.div variants={itemVariants} className="col-span-2">
                  <Card>
                    <CardContent className="text-center py-12">
                      <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Milestones Yet</h3>
                      <p className="text-gray-500 mb-4">Keep up your wellness activities to unlock milestones</p>
                      <Button variant="outline">
                        View Available Milestones
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default WellnessProgress;
