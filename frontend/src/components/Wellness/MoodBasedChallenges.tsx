import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Brain, 
  Heart,
  Zap,
  Moon,
  Smile,
  Activity,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { toast } from 'sonner';

interface MoodBasedChallenge {
  id: number;
  title: string;
  description: string;
  challenge_type: string;
  instructions: string;
  points_reward: number;
  duration_minutes?: number;
  mood_relevance: number;
  ai_reason: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  expected_mood_impact: number;
}

interface MoodBasedChallengesProps {
  moodRating: number;
  activities: string[];
  triggers: string[];
  onChallengeAccepted?: (challengeId: number) => void;
}

const CHALLENGE_TYPE_ICONS = {
  breathing: Heart,
  mindfulness: Brain,
  physical: Activity,
  social: Smile,
  gratitude: Star,
  energy: Zap,
  sleep: Moon,
  habit_building: Target,
  creativity: Lightbulb,
  mood_checkin: TrendingUp
};

const CHALLENGE_TYPE_COLORS = {
  breathing: 'bg-green-100 text-green-600 border-green-200',
  mindfulness: 'bg-purple-100 text-purple-600 border-purple-200',
  physical: 'bg-orange-100 text-orange-600 border-orange-200',
  social: 'bg-pink-100 text-pink-600 border-pink-200',
  gratitude: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  energy: 'bg-red-100 text-red-600 border-red-200',
  sleep: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  habit_building: 'bg-teal-100 text-teal-600 border-teal-200',
  creativity: 'bg-violet-100 text-violet-600 border-violet-200',
  mood_checkin: 'bg-blue-100 text-blue-600 border-blue-200'
};

export const MoodBasedChallenges: React.FC<MoodBasedChallengesProps> = ({
  moodRating,
  activities,
  triggers,
  onChallengeAccepted
}) => {
  const [challenges, setChallenges] = useState<MoodBasedChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptingChallenge, setAcceptingChallenge] = useState<number | null>(null);

  useEffect(() => {
    if (moodRating !== 3 || activities.length > 0 || triggers.length > 0) {
      loadMoodBasedChallenges();
    }
  }, [moodRating, activities, triggers]);

  const loadMoodBasedChallenges = async () => {
    setLoading(true);
    try {
      const response = await wellnessService.getMoodBasedChallenges(moodRating, activities, triggers);
      setChallenges(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading mood-based challenges:', error);
      // Fallback to generated challenges based on mood
      setChallenges(generateFallbackChallenges());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackChallenges = (): MoodBasedChallenge[] => {
    const baseChallenges: MoodBasedChallenge[] = [];

    // Low mood challenges
    if (moodRating <= 2) {
      baseChallenges.push(
        {
          id: 1,
          title: '5-Minute Breathing Exercise',
          description: 'Practice deep breathing to calm your mind and reduce stress',
          challenge_type: 'breathing',
          instructions: 'Find a quiet space, sit comfortably, and focus on slow, deep breaths for 5 minutes.',
          points_reward: 15,
          duration_minutes: 5,
          mood_relevance: 95,
          ai_reason: 'Breathing exercises are highly effective for improving low mood and reducing anxiety.',
          difficulty_level: 'easy',
          expected_mood_impact: 1.5
        },
        {
          id: 2,
          title: 'Gratitude Reflection',
          description: 'Write down three things you\'re grateful for today',
          challenge_type: 'gratitude',
          instructions: 'Take a moment to reflect and write down three specific things you appreciate today.',
          points_reward: 10,
          duration_minutes: 10,
          mood_relevance: 88,
          ai_reason: 'Gratitude practice helps shift focus from negative to positive aspects of life.',
          difficulty_level: 'easy',
          expected_mood_impact: 1.2
        }
      );
    }

    // Neutral mood challenges
    if (moodRating === 3) {
      baseChallenges.push(
        {
          id: 3,
          title: '10-Minute Walk',
          description: 'Take a refreshing walk to boost your energy and mood',
          challenge_type: 'physical',
          instructions: 'Step outside or walk indoors for 10 minutes, focusing on your surroundings.',
          points_reward: 20,
          duration_minutes: 10,
          mood_relevance: 85,
          ai_reason: 'Light physical activity can help elevate neutral mood and increase energy.',
          difficulty_level: 'easy',
          expected_mood_impact: 1.0
        },
        {
          id: 4,
          title: 'Mindful Moment',
          description: 'Practice 5 minutes of mindfulness meditation',
          challenge_type: 'mindfulness',
          instructions: 'Sit quietly and focus on the present moment, observing your thoughts without judgment.',
          points_reward: 15,
          duration_minutes: 5,
          mood_relevance: 80,
          ai_reason: 'Mindfulness helps maintain emotional balance and prevents mood dips.',
          difficulty_level: 'medium',
          expected_mood_impact: 0.8
        }
      );
    }

    // High mood challenges
    if (moodRating >= 4) {
      baseChallenges.push(
        {
          id: 5,
          title: 'Share Positivity',
          description: 'Reach out to someone and share something positive',
          challenge_type: 'social',
          instructions: 'Send a kind message, compliment, or positive thought to a friend or family member.',
          points_reward: 25,
          duration_minutes: 15,
          mood_relevance: 90,
          ai_reason: 'Sharing positivity when you feel good helps maintain high mood and strengthens relationships.',
          difficulty_level: 'medium',
          expected_mood_impact: 0.5
        },
        {
          id: 6,
          title: 'Creative Expression',
          description: 'Spend 15 minutes on a creative activity',
          challenge_type: 'creativity',
          instructions: 'Draw, write, sing, or engage in any creative activity that brings you joy.',
          points_reward: 30,
          duration_minutes: 15,
          mood_relevance: 85,
          ai_reason: 'Creative activities help maintain positive mood and provide a sense of accomplishment.',
          difficulty_level: 'medium',
          expected_mood_impact: 0.7
        }
      );
    }

    // Activity-based challenges
    if (activities.includes('Work') && triggers.includes('Work Stress')) {
      baseChallenges.push({
        id: 7,
        title: 'Work Break Meditation',
        description: 'Take a 5-minute meditation break during work',
        challenge_type: 'mindfulness',
        instructions: 'Step away from work, close your eyes, and practice deep breathing or meditation.',
        points_reward: 20,
        duration_minutes: 5,
        mood_relevance: 92,
        ai_reason: 'Work stress detected. Short meditation breaks can significantly reduce work-related stress.',
        difficulty_level: 'easy',
        expected_mood_impact: 1.3
      });
    }

    if (triggers.includes('Sleep Deprivation')) {
      baseChallenges.push({
        id: 8,
        title: 'Sleep Hygiene Check',
        description: 'Review and improve your sleep environment',
        challenge_type: 'sleep',
        instructions: 'Check your bedroom temperature, lighting, and prepare for better sleep tonight.',
        points_reward: 15,
        duration_minutes: 10,
        mood_relevance: 88,
        ai_reason: 'Sleep issues detected. Improving sleep hygiene can significantly impact mood.',
        difficulty_level: 'easy',
        expected_mood_impact: 1.0
      });
    }

    return baseChallenges.slice(0, 4); // Return top 4 most relevant challenges
  };

  const acceptChallenge = async (challenge: MoodBasedChallenge) => {
    setAcceptingChallenge(challenge.id);
    try {
      // Here you would typically create a challenge acceptance record
      toast.success(`Challenge "${challenge.title}" accepted! Good luck!`);
      
      if (onChallengeAccepted) {
        onChallengeAccepted(challenge.id);
      }
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast.error('Failed to accept challenge');
    } finally {
      setAcceptingChallenge(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getMoodImpactColor = (impact: number) => {
    if (impact >= 1.5) return 'text-green-600';
    if (impact >= 1.0) return 'text-blue-600';
    if (impact >= 0.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600">Analyzing your mood and generating personalized challenges...</span>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Personalized Challenges</h3>
          <p className="text-gray-500">Complete your mood entry to get AI-powered challenge recommendations!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI-Recommended Challenges</h3>
            <p className="text-sm text-gray-600">Personalized based on your current mood and activities</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge, index) => {
            const IconComponent = CHALLENGE_TYPE_ICONS[challenge.challenge_type as keyof typeof CHALLENGE_TYPE_ICONS] || Target;
            const colorClass = CHALLENGE_TYPE_COLORS[challenge.challenge_type as keyof typeof CHALLENGE_TYPE_COLORS] || 'bg-gray-100 text-gray-600 border-gray-200';
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-2 border-transparent hover:border-purple-200 transition-all duration-300">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{challenge.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getDifficultyColor(challenge.difficulty_level)}>
                              {challenge.difficulty_level}
                            </Badge>
                            {challenge.duration_minutes && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {challenge.duration_minutes}min
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <Star className="w-4 h-4" />
                          <span className="font-bold">+{challenge.points_reward}</span>
                        </div>
                        <div className={`text-xs mt-1 ${getMoodImpactColor(challenge.expected_mood_impact)}`}>
                          +{challenge.expected_mood_impact} mood boost
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {challenge.description}
                    </p>

                    {/* AI Reasoning */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg mb-4 border border-purple-100">
                      <div className="flex items-start space-x-2">
                        <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-purple-700 mb-1">AI Insight</p>
                          <p className="text-xs text-purple-600">{challenge.ai_reason}</p>
                        </div>
                      </div>
                    </div>

                    {/* Instructions Preview */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-gray-600 font-medium mb-1">Quick Instructions:</p>
                      <p className="text-xs text-gray-700">{challenge.instructions}</p>
                    </div>

                    {/* Relevance Score */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-600">Relevance to your mood:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${challenge.mood_relevance}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-purple-600">{challenge.mood_relevance}%</span>
                      </div>
                    </div>

                    {/* Accept Button */}
                    <Button
                      onClick={() => acceptChallenge(challenge)}
                      disabled={acceptingChallenge === challenge.id}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
                    >
                      {acceptingChallenge === challenge.id ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Accept Challenge
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={loadMoodBasedChallenges}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Get New Recommendations</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodBasedChallenges;
