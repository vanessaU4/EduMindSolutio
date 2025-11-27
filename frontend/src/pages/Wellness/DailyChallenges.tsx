import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, Calendar, Trophy, CheckCircle, 
  Flame, Star, TrendingUp, Users, Award,
  Zap, Clock, Activity
} from 'lucide-react';
import { ChallengeList } from '@/components/Wellness/ChallengeList';
import { wellnessService } from '@/services/wellnessService';
import { useAuth } from '@/hooks/useAuth';

interface ChallengeStats {
  totalChallenges: number;
  completedToday: number;
  currentStreak: number;
  totalPoints: number;
  weeklyProgress: number;
  weeklyGoal: number;
}

const DailyChallenges: React.FC = () => {
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load actual data from the wellness service
      const [dailyChallenges, weeklyChallenges, wellnessData] = await Promise.all([
        wellnessService.getDailyChallenges(),
        wellnessService.getWeeklyChallenges(),
        wellnessService.getWellnessData().catch(() => null) // Fallback if wellness data fails
      ]);

      // Calculate stats from real data
      const totalDaily = Array.isArray(dailyChallenges) ? dailyChallenges.length : 0;
      const totalWeekly = Array.isArray(weeklyChallenges) ? weeklyChallenges.length : 0;
      const completedDaily = Array.isArray(dailyChallenges) ? dailyChallenges.filter(c => c.is_completed_today).length : 0;
      
      // Use wellness data if available, otherwise use calculated values
      const statsData: ChallengeStats = {
        totalChallenges: totalDaily,
        completedToday: completedDaily,
        currentStreak: wellnessData?.currentStreak || 0,
        totalPoints: wellnessData?.totalPoints || 0,
        weeklyProgress: wellnessData?.weeklyProgress || 0,
        weeklyGoal: wellnessData?.weeklyGoal || 7
      };

      setStats(statsData);
    } catch (error) {
      console.error('Failed to load challenge stats:', error);
      // Fallback to default values if API fails
      setStats({
        totalChallenges: 0,
        completedToday: 0,
        currentStreak: 0,
        totalPoints: 0,
        weeklyProgress: 0,
        weeklyGoal: 7
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeCompleted = () => {
    // Refresh stats when a challenge is completed
    loadStats();
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
                Daily Challenges
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Complete wellness activities and build healthy habits
              </p>
            </div>
            
            {user?.role === 'admin' && (
              <Button 
                onClick={() => window.location.href = '/admin/wellness'}
                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              >
                <Target className="w-4 h-4 mr-2" />
                Manage Challenges
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Today's Progress</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {stats.completedToday}/{stats.totalChallenges}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <Progress 
                  value={(stats.completedToday / stats.totalChallenges) * 100} 
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.currentStreak}</p>
                  </div>
                  <Flame className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-xs text-orange-700 mt-2">Keep it going! 🔥</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Total Points</p>
                    <p className="text-3xl font-bold text-yellow-900">{stats.totalPoints}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
                <p className="text-xs text-yellow-700 mt-2">Earn more points!</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Weekly Goal</p>
                    <p className="text-3xl font-bold text-green-900">
                      {stats.weeklyProgress}/{stats.weeklyGoal}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <Progress 
                  value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Motivational Section */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Great job, {user?.first_name || 'there'}! 
                  </h3>
                  <p className="text-purple-700">
                    {stats?.totalChallenges === 0 
                      ? "No challenges available yet. Ask your admin to create some wellness challenges!" 
                      : stats?.completedToday === 0 
                        ? "Ready to start today's wellness journey?" 
                        : `You've completed ${stats?.completedToday} challenges today. Keep going!`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-600 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Level {Math.floor((stats?.totalPoints || 0) / 100) + 1}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/wellness'}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Wellness Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">View your overall wellness progress and insights</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/wellness/achievements'}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Check out your earned badges and milestones</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/wellness/mood-tracker'}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Mood Tracker</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Track your daily mood and emotional patterns</p>
            </CardContent>
          </Card>
        </div>

        {/* Challenge List */}
        <ChallengeList onChallengeCompleted={handleChallengeCompleted} />
      </motion.div>
    </div>
  );
};

export default DailyChallenges;