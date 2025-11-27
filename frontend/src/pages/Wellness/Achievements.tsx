import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Star, Target, Lock, Loader2 } from 'lucide-react';
import { wellnessService, Achievement } from '@/services/wellnessService';
import { useAuth } from '@/hooks/useAuth';

interface AchievementData {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  points_reward: number;
  earned?: boolean;
  earned_at?: string;
  progress?: number;
  total?: number;
}

interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  completionRate: number;
}

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalPoints: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      // Load both available achievements and user's earned achievements
      const [availableAchievements, earnedAchievements] = await Promise.all([
        wellnessService.getAvailableAchievements(),
        wellnessService.getUserAchievements().catch(() => []) // Fallback to empty array if fails
      ]);

      console.log('Available achievements:', availableAchievements);
      console.log('User achievements:', earnedAchievements);

      setAchievements(availableAchievements || []);
      setUserAchievements(earnedAchievements || []);

      // Calculate stats
      const totalAchievements = availableAchievements?.length || 0;
      const unlockedAchievements = earnedAchievements?.length || 0;
      let totalPoints = 0;
      if (earnedAchievements && earnedAchievements.length > 0) {
        for (const ach of earnedAchievements) {
          totalPoints += ach.points_earned || 0;
        }
      }
      const completionRate = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0;

      setStats({
        totalAchievements,
        unlockedAchievements,
        totalPoints,
        completionRate
      });

    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get icon component based on category or name
  const getIconComponent = (iconName: string, category: string) => {
    switch (iconName?.toLowerCase() || category?.toLowerCase()) {
      case 'star':
      case 'streak':
        return Star;
      case 'trophy':
      case 'challenge':
        return Trophy;
      case 'award':
      case 'wellness':
        return Award;
      case 'target':
      case 'engagement':
        return Target;
      default:
        return Award;
    }
  };

  // Check if achievement is earned by user
  const isAchievementEarned = (achievementId: number) => {
    return userAchievements.some(userAch => userAch.id === achievementId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-healthcare-primary" />
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
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Achievements</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track your progress and celebrate milestones</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <span className="text-3xl font-bold text-yellow-900">{stats.unlockedAchievements}</span>
              </div>
              <p className="text-sm text-yellow-700 font-medium">Achievements Unlocked</p>
              <p className="text-xs text-yellow-600 mt-1">out of {stats.totalAchievements} total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-900">{stats.totalPoints}</span>
              </div>
              <p className="text-sm text-blue-700 font-medium">Total Points</p>
              <p className="text-xs text-blue-600 mt-1">from achievements</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-purple-900">{Math.round(stats.completionRate)}%</span>
              </div>
              <p className="text-sm text-purple-700 font-medium">Completion Rate</p>
              <p className="text-xs text-purple-600 mt-1">achievement progress</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {achievements.length > 0 ? achievements.map((achievement) => {
            const isEarned = isAchievementEarned(achievement.id);
            const IconComponent = getIconComponent(achievement.icon, achievement.category);
            const earnedAchievement = userAchievements.find(ua => ua.id === achievement.id);
            
            return (
              <Card 
                key={achievement.id} 
                className={`hover:shadow-lg transition-shadow ${
                  isEarned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'border-gray-200'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                      isEarned 
                        ? 'bg-yellow-100' 
                        : 'bg-gray-100'
                    }`}>
                      {isEarned ? (
                        <IconComponent className="w-8 h-8 text-yellow-600" />
                      ) : (
                        <Lock className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                        {isEarned && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Trophy className="w-3 h-3 mr-1" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      
                      {/* Achievement Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Reward:</span>
                          <span className="font-medium text-blue-600">{achievement.points_reward} points</span>
                        </div>
                        
                        {isEarned && earnedAchievement?.earned_at && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Earned:</span>
                            <span className="text-green-600 font-medium">
                              {new Date(earnedAchievement.earned_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Category:</span>
                          <Badge variant="outline" className="text-xs">
                            {achievement.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="col-span-full text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Achievements Available</h3>
              <p className="text-gray-500">Check back later for new achievements to unlock!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Achievements;