import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, TrendingUp, Target, Award, 
  Activity, Smile, ArrowRight, Calendar,
  CheckCircle, Flame, Star, Trophy, Users, BarChart3
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { useAuth } from '@/hooks/useAuth';

interface WellnessData {
  currentStreak: number;
  totalPoints: number;
  weeklyGoal: number;
  weeklyProgress: number;
  recentMoods: { date: string; mood: number; note?: string }[];
  achievements: { id: string; title: string; description: string; earned: boolean; date?: string }[];
  todaysChallenge: { id: string; title: string; description: string; completed: boolean };
}

const WellnessCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { user: authUser } = useAuth();
  const [wellnessData, setWellnessData] = useState<WellnessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWellnessData();
  }, []);

  const loadWellnessData = async () => {
    try {
      setLoading(true);
      const data = await wellnessService.getWellnessData();
      setWellnessData(data);
    } catch (error) {
      console.error('Failed to load wellness data:', error);
      setWellnessData(null);
    } finally {
      setLoading(false);
    }
  };

  // Role-based features - different features available based on user role
  const getFeatures = () => {
    const baseFeatures = [
      {
        title: 'Mood Tracker',
        description: 'Track your daily mood and emotions',
        icon: Smile,
        color: 'bg-blue-100 text-blue-600',
        path: '/wellness/mood-tracker',
        roles: ['user', 'guide', 'admin']
      },
      {
        title: 'Daily Challenges',
        description: 'Complete wellness activities and build healthy habits',
        icon: Target,
        color: 'bg-green-100 text-green-600',
        path: '/wellness/challenges',
        roles: ['user', 'guide', 'admin']
      },
      {
        title: 'Achievements',
        description: 'Track your progress and celebrate milestones',
        icon: Award,
        color: 'bg-purple-100 text-purple-600',
        path: '/wellness/achievements',
        roles: ['user', 'guide', 'admin']
      },
    ];

    // Add guide-specific features
    if (authUser?.role === 'guide' || authUser?.role === 'admin') {
      baseFeatures.push({
        title: 'Client Wellness Overview',
        description: 'Monitor client wellness progress and trends',
        icon: Users,
        color: 'bg-indigo-100 text-indigo-600',
        path: '/guide/client-wellness',
        roles: ['guide', 'admin']
      });
    }

    // Add admin-specific features
    if (authUser?.role === 'admin') {
      baseFeatures.push(
        {
          title: 'Wellness Management',
          description: 'Create and manage wellness challenges for users',
          icon: Target,
          color: 'bg-purple-100 text-purple-600',
          path: '/admin/wellness',
          roles: ['admin']
        },
        {
          title: 'Wellness Analytics',
          description: 'Platform-wide wellness metrics and insights',
          icon: BarChart3,
          color: 'bg-orange-100 text-orange-600',
          path: '/admin/wellness-analytics',
          roles: ['admin']
        }
      );
    }

    return baseFeatures.filter(feature => 
      feature.roles.includes(authUser?.role || 'user')
    );
  };

  const features = getFeatures();

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😔';
    return '😢';
  };

  const handleCompleteChallenge = () => {
    if (wellnessData) {
      setWellnessData({
        ...wellnessData,
        todaysChallenge: { ...wellnessData.todaysChallenge, completed: true },
        totalPoints: wellnessData.totalPoints + 50,
        weeklyProgress: Math.min(wellnessData.weeklyProgress + 1, wellnessData.weeklyGoal)
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary"></div>
      </div>
    );
  }

  if (!wellnessData) return null;

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
     

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 text-orange-600" />
                <span className="text-3xl font-bold text-gray-900">{wellnessData.currentStreak}</span>
              </div>
              <p className="text-sm text-gray-600">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-yellow-600" />
                <span className="text-3xl font-bold text-gray-900">{wellnessData.totalPoints}</span>
              </div>
              <p className="text-sm text-gray-600">Total Points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">{wellnessData.weeklyProgress}/{wellnessData.weeklyGoal}</span>
              </div>
              <p className="text-sm text-gray-600">Weekly Goal</p>
              <Progress value={(wellnessData.weeklyProgress / wellnessData.weeklyGoal) * 100} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-gray-900">{wellnessData.achievements.filter(a => a.earned).length}</span>
              </div>
              <p className="text-sm text-gray-600">Achievements</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Challenge */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Target className="w-5 h-5" />
              Today's Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">{wellnessData.todaysChallenge.title}</h3>
                <p className="text-green-700 mb-4">{wellnessData.todaysChallenge.description}</p>
              </div>
              <div className="ml-4">
                {wellnessData.todaysChallenge.completed ? (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Button onClick={handleCompleteChallenge} className="bg-green-600 hover:bg-green-700">
                    Complete Challenge
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Mood Tracking */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-blue-600" />
              Recent Mood Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wellnessData.recentMoods.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{new Date(entry.date).toLocaleDateString()}</p>
                      {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
                    </div>
                  </div>
                  <Badge variant="outline">{entry.mood}/10</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/wellness/mood-tracker')}>
              Track Mood Today
            </Button>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(feature.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wellnessData.achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`p-4 rounded-lg border ${
                    achievement.earned 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${achievement.earned ? 'text-purple-900' : 'text-gray-600'}`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${achievement.earned ? 'text-purple-700' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-purple-600 mt-1">
                          Earned on {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="ml-2">
                      {achievement.earned ? (
                        <Trophy className="w-6 h-6 text-purple-600" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/wellness/achievements')}>
              View All Achievements
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WellnessCenter;