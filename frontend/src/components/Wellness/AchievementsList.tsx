import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Award, 
  Star,
  Calendar,
  Target,
  Heart,
  Zap,
  Users,
  BookOpen,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';

interface Achievement {
  id: number;
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  achievement_category: string;
  earned_at: string;
  points_earned: number;
}

interface AvailableAchievement {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  points_reward: number;
  criteria: any;
  is_repeatable: boolean;
}

interface AchievementsListProps {
  achievements?: Achievement[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const AchievementsList: React.FC<AchievementsListProps> = ({ achievements: propAchievements }) => {
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>(propAchievements || []);
  const [availableAchievements, setAvailableAchievements] = useState<AvailableAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'earned' | 'available'>('earned');

  useEffect(() => {
    if (!propAchievements) {
      loadAchievements();
    }
    loadAvailableAchievements();
  }, [propAchievements]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await wellnessService.getUserAchievements();
      setEarnedAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableAchievements = async () => {
    try {
      const data = await wellnessService.getAvailableAchievements();
      setAvailableAchievements(data);
    } catch (error) {
      console.error('Error loading available achievements:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      engagement: <Target className="h-5 w-5" />,
      wellness: <Heart className="h-5 w-5" />,
      community: <Users className="h-5 w-5" />,
      learning: <BookOpen className="h-5 w-5" />,
      milestone: <Star className="h-5 w-5" />
    };
    return icons[category] || <Award className="h-5 w-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      engagement: 'bg-blue-100 text-blue-800 border-blue-200',
      wellness: 'bg-green-100 text-green-800 border-green-200',
      community: 'bg-purple-100 text-purple-800 border-purple-200',
      learning: 'bg-orange-100 text-orange-800 border-orange-200',
      milestone: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getAchievementProgress = (achievement: AvailableAchievement) => {
    // This would typically come from the backend based on user's current progress
    // For now, we'll show a placeholder progress
    if (achievement.criteria?.target) {
      return Math.floor(Math.random() * achievement.criteria.target);
    }
    return 0;
  };

  const isAchievementEarned = (achievementId: number) => {
    return earnedAchievements.some(earned => earned.id === achievementId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
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
                Achievements
              </h1>
              <p className="text-gray-600 text-lg">Track your wellness milestones and celebrate your progress</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1 text-sm border-purple-200 text-purple-700">
                <Sparkles className="w-4 h-4 mr-1" />
                Progress Tracking
              </Badge>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1">
                <Trophy className="h-4 w-4 mr-1" />
                {earnedAchievements.reduce((total, achievement) => total + achievement.points_earned, 0)} pts earned
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-lg border border-blue-100">
            <motion.button
              onClick={() => setActiveTab('earned')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'earned'
                  ? 'bg-white text-blue-600 shadow-md border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Trophy className="h-5 w-5" />
              <span className="font-medium">Earned</span>
              <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
                {earnedAchievements.length}
              </Badge>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('available')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'available'
                  ? 'bg-white text-blue-600 shadow-md border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Target className="h-5 w-5" />
              <span className="font-medium">Available</span>
              <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-1">
                {availableAchievements.filter(a => !isAchievementEarned(a.id)).length}
              </Badge>
            </motion.button>
          </div>
        </motion.div>

        {/* Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* Earned Achievements */}
          {activeTab === 'earned' && (
            <motion.div 
              key="earned"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Your Achievements</h3>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2">
                  <Zap className="h-4 w-4 mr-1" />
                  {earnedAchievements.reduce((total, achievement) => total + achievement.points_earned, 0)} total points
                </Badge>
              </div>

              {earnedAchievements.length === 0 ? (
                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-gray-200 shadow-lg">
                    <CardContent className="text-center py-16">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                      </motion.div>
                      <h4 className="text-xl font-semibold text-gray-600 mb-4">No achievements earned yet</h4>
                      <p className="text-gray-500 max-w-md mx-auto">Complete challenges and track your mood to earn your first achievement!</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid gap-6 md:grid-cols-2"
                  variants={containerVariants}
                >
                  {earnedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          {getCategoryIcon(achievement.achievement_category)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-lg">{achievement.achievement_name}</h4>
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        </div>
                        <p className="text-gray-600 mb-3">{achievement.achievement_description}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getCategoryColor(achievement.achievement_category)}>
                            {formatCategory(achievement.achievement_category)}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Zap className="h-4 w-4" />
                            <span>+{achievement.points_earned} points</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-500">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

          {/* Available Achievements */}
          {activeTab === 'available' && (
            <motion.div 
              key="available"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Available Achievements</h3>
                <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-2">
                  <Target className="h-4 w-4 mr-1" />
                  {availableAchievements.filter(a => !isAchievementEarned(a.id)).length} remaining
                </Badge>
              </div>

              {availableAchievements.length === 0 ? (
                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-gray-200 shadow-lg">
                    <CardContent className="text-center py-16">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, -5, 5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Award className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                      </motion.div>
                      <h4 className="text-xl font-semibold text-gray-600 mb-4">No achievements available</h4>
                      <p className="text-gray-500">Check back later for new challenges!</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid gap-6 md:grid-cols-2"
                  variants={containerVariants}
                >
                  {availableAchievements.map((achievement, index) => {
                const isEarned = isAchievementEarned(achievement.id);
                const progress = getAchievementProgress(achievement);
                const target = achievement.criteria?.target || 100;
                const progressPercentage = (progress / target) * 100;

                    return (
                      <motion.div
                        key={achievement.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card 
                          className={isEarned 
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 opacity-75 shadow-lg' 
                            : 'bg-white hover:shadow-xl transition-all duration-300 shadow-lg border-gray-200'
                          }
                        >
                          <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isEarned ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {isEarned ? (
                              <Trophy className="h-6 w-6 text-green-600" />
                            ) : (
                              getCategoryIcon(achievement.category)
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">{achievement.name}</h4>
                            {isEarned && <Badge variant="default">Earned</Badge>}
                          </div>
                          <p className="text-gray-600 mb-3">{achievement.description}</p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={getCategoryColor(achievement.category)}>
                              {formatCategory(achievement.category)}
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Zap className="h-4 w-4" />
                              <span>+{achievement.points_reward} points</span>
                            </div>
                          </div>

                          {!isEarned && achievement.criteria?.target && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span>{progress} / {target}</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          )}

                          {achievement.is_repeatable && (
                            <Badge variant="outline" className="mt-2">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Repeatable
                            </Badge>
                          )}
                        </div>
                      </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
