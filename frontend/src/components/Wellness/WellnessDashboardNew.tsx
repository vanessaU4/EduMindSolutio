import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  Target, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Smile,
  Zap,
  Moon,
  Brain,
  Star,
  Award,
  Activity,
  BarChart3,
  Sparkles,
  Clock,
  CheckCircle2,
  Plus,
  Users,
  Flame,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { MoodTracker } from './MoodTracker';
import { ChallengeList } from './ChallengeList';
import { AchievementsList } from './AchievementsList';
import { AIWellnessSidebar } from './AIWellnessSidebar';
import { toast } from 'sonner';

interface WellnessStats {
  total_points: number;
  current_level: number;
  mood_entries_count: number;
  challenges_completed: number;
  achievements_earned: number;
  current_streak: number;
  weekly_progress: number;
  wellness_score: number;
}

interface UserPoints {
  total_points: number;
  current_streak: number;
  last_activity_date: string;
}

interface DashboardData {
  user_points: UserPoints;
  stats: WellnessStats;
  recent_moods: any[];
  recent_achievements: any[];
  active_challenges: any[];
  ai_insights: any;
  daily_affirmation: string;
}

// Animation variants
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

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
  loading?: boolean;
}> = ({ icon, title, value, subtitle, trend, color, loading }) => {
  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-4 w-24 mt-4" />
          <Skeleton className="h-3 w-16 mt-2" />
        </CardContent>
      </Card>
    );
  }

  const colorClasses = {
    blue: 'border-l-blue-500 bg-blue-50 text-blue-600',
    green: 'border-l-green-500 bg-green-50 text-green-600',
    purple: 'border-l-purple-500 bg-purple-50 text-purple-600',
    orange: 'border-l-orange-500 bg-orange-50 text-orange-600',
    pink: 'border-l-pink-500 bg-pink-50 text-pink-600',
    indigo: 'border-l-indigo-500 bg-indigo-50 text-indigo-600'
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className={`relative overflow-hidden border-l-4 ${colorClasses[color as keyof typeof colorClasses]?.split(' ')[0] || 'border-l-gray-500'} hover:shadow-lg transition-all duration-300 group cursor-pointer`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]?.split(' ')[1] || 'bg-gray-50'} ${colorClasses[color as keyof typeof colorClasses]?.split(' ')[2] || 'text-gray-600'} group-hover:scale-110 transition-transform duration-200`}>
              {icon}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              {trend && (
                <div className={`flex items-center text-sm ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : 
                   trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : 
                   <TrendingUp className="w-3 h-3 mr-1" />}
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-gray-700">{title}</h3>
            {subtitle && !trend && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const WellnessDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'mood' | 'challenges' | 'achievements'>('overview');
  const [showMoodTracker, setShowMoodTracker] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await wellnessService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load wellness dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMoodTracked = () => {
    setShowMoodTracker(false);
    loadDashboardData();
  };

  const handleChallengeCompleted = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <Skeleton className="h-12 w-80 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <StatCard key={i} icon={<Target />} title="" value="" loading />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load wellness dashboard</p>
      </div>
    );
  }

  const { user_points, stats, recent_moods, recent_achievements, active_challenges, daily_affirmation } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30">
      <motion.div 
        className="container mx-auto px-6 py-8 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Header */}
        <motion.div className="mb-12" variants={itemVariants}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Wellness Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Track your mental health journey and build healthy habits</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1 text-sm border-purple-200 text-purple-700">
                <Sparkles className="w-4 h-4 mr-1" />
                Smart Tracking
              </Badge>
              <Button 
                onClick={() => setShowMoodTracker(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Quick Mood Check
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Daily Affirmation */}
        {daily_affirmation && (
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Heart className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Today's Affirmation</h3>
                    <p className="text-purple-100 text-lg">{daily_affirmation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            title="Total Points"
            value={user_points?.total_points || 0}
            subtitle="Wellness points earned"
            color="blue"
          />
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            title="Current Streak"
            value={`${user_points?.current_streak || 0} days`}
            subtitle="Keep it going!"
            trend="up"
            color="orange"
          />
          <StatCard
            icon={<Smile className="w-6 h-6" />}
            title="Mood Entries"
            value={stats?.mood_entries_count || 0}
            subtitle="This month"
            color="green"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title="Challenges Done"
            value={stats?.challenges_completed || 0}
            subtitle="Keep challenging yourself"
            color="purple"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Content - 3 columns */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="mood" className="flex items-center space-x-2">
                  <Smile className="w-4 h-4" />
                  <span>Mood</span>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Challenges</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>Achievements</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Recent Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recent_moods?.slice(0, 3).map((mood, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Smile className="w-5 h-5 text-blue-500" />
                            <div className="flex-1">
                              <p className="font-medium">Mood logged</p>
                              <p className="text-sm text-gray-500">Rating: {mood.mood_rating}/5</p>
                            </div>
                            <span className="text-xs text-gray-400">{mood.date}</span>
                          </div>
                        ))}
                        {(!recent_moods || recent_moods.length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            <Smile className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No recent activity</p>
                            <Button 
                              onClick={() => setShowMoodTracker(true)}
                              className="mt-4"
                              variant="outline"
                            >
                              Log your first mood
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="w-5 h-5" />
                        <span>Recent Achievements</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recent_achievements?.slice(0, 3).map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            <div className="flex-1">
                              <p className="font-medium">{achievement.name}</p>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                            </div>
                            <Badge variant="secondary">+{achievement.points_reward} pts</Badge>
                          </div>
                        ))}
                        {(!recent_achievements || recent_achievements.length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No achievements yet</p>
                            <p className="text-sm">Complete challenges to earn your first achievement!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="mood">
                <MoodTracker onMoodTracked={handleMoodTracked} />
              </TabsContent>

              <TabsContent value="challenges">
                <ChallengeList onChallengeCompleted={handleChallengeCompleted} />
              </TabsContent>

              <TabsContent value="achievements">
                <AchievementsList />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <AIWellnessSidebar />
          </div>
        </div>

        {/* Mood Tracker Modal */}
        <AnimatePresence>
          {showMoodTracker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowMoodTracker(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Quick Mood Check</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowMoodTracker(false)}
                    >
                      ×
                    </Button>
                  </div>
                  <MoodTracker onMoodTracked={handleMoodTracked} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
