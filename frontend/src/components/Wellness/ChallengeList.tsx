import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  Clock, 
  Trophy, 
  CheckCircle, 
  Circle,
  Calendar,
  Zap,
  Plus,
  Timer,
  Sparkles,
  Star,
  Award,
  Flame,
  TrendingUp
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { toast } from 'sonner';

interface Challenge {
  id: number;
  title: string;
  description: string;
  challenge_type: string;
  instructions: string;
  points_reward: number;
  target_value?: number;
  duration_minutes?: number;
  is_completed_today: boolean;
}

interface WeeklyChallenge {
  id: number;
  title: string;
  description: string;
  challenge_type: string;
  instructions: string;
  target_days: number;
  points_per_day: number;
  bonus_points: number;
  start_date: string;
  end_date: string;
  progress?: {
    days_completed: number;
    total_points_earned: number;
    is_completed: boolean;
    completion_percentage: number;
  };
  is_enrolled: boolean;
}

interface ChallengeListProps {
  onChallengeCompleted?: () => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({ onChallengeCompleted }) => {
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingChallenge, setCompletingChallenge] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionValue, setCompletionValue] = useState<number | ''>('');

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
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (challengeId: number) => {
    try {
      setCompletingChallenge(challengeId);
      
      const completionData: any = {
        completion_date: new Date().toISOString().split('T')[0]
      };

      if (completionNotes) {
        completionData.notes = completionNotes;
      }

      if (completionValue !== '') {
        completionData.completion_value = Number(completionValue);
      }

      await wellnessService.completeChallenge(challengeId, completionData);
      
      toast.success('Challenge completed! Points earned!');
      setCompletionNotes('');
      setCompletionValue('');
      
      // Refresh challenges
      await loadChallenges();
      
      if (onChallengeCompleted) {
        onChallengeCompleted();
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast.error('Failed to complete challenge');
    } finally {
      setCompletingChallenge(null);
    }
  };

  const enrollInWeeklyChallenge = async (challengeId: number) => {
    try {
      await wellnessService.enrollInWeeklyChallenge(challengeId);
      toast.success('Enrolled in weekly challenge!');
      await loadChallenges();
    } catch (error) {
      console.error('Error enrolling in challenge:', error);
      toast.error('Failed to enroll in challenge');
    }
  };

  const completeWeeklyChallenge = async (challengeId: number) => {
    try {
      await wellnessService.completeWeeklyChallengeDay(challengeId);
      toast.success('Daily progress recorded!');
      await loadChallenges();
      
      if (onChallengeCompleted) {
        onChallengeCompleted();
      }
    } catch (error) {
      console.error('Error completing weekly challenge day:', error);
      toast.error('Failed to record progress');
    }
  };

  const getChallengeTypeColor = (type: string) => {
    const colors: Record<string, { bg: string, text: string, icon: string, gradient: string }> = {
      mood_checkin: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'text-blue-500', gradient: 'from-blue-400 to-blue-600' },
      breathing: { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-500', gradient: 'from-green-400 to-green-600' },
      gratitude: { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'text-purple-500', gradient: 'from-purple-400 to-purple-600' },
      physical: { bg: 'bg-orange-100', text: 'text-orange-800', icon: 'text-orange-500', gradient: 'from-orange-400 to-orange-600' },
      social: { bg: 'bg-pink-100', text: 'text-pink-800', icon: 'text-pink-500', gradient: 'from-pink-400 to-pink-600' },
      learning: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: 'text-indigo-500', gradient: 'from-indigo-400 to-indigo-600' },
      mindfulness: { bg: 'bg-teal-100', text: 'text-teal-800', icon: 'text-teal-500', gradient: 'from-teal-400 to-teal-600' },
      habit_building: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-500', gradient: 'from-yellow-400 to-yellow-600' },
      fitness: { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-500', gradient: 'from-red-400 to-red-600' },
      creativity: { bg: 'bg-violet-100', text: 'text-violet-800', icon: 'text-violet-500', gradient: 'from-violet-400 to-violet-600' }
    };
    return colors[type] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'text-gray-500', gradient: 'from-gray-400 to-gray-600' };
  };

  const formatChallengeType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
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
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
        />
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
                Wellness Challenges
              </h1>
              <p className="text-gray-600 text-lg">Complete daily and weekly challenges to boost your wellness journey</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1 text-sm border-purple-200 text-purple-700">
                <Sparkles className="w-4 h-4 mr-1" />
                Smart Goals
              </Badge>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1">
                <Star className="h-4 w-4 mr-1" />
                {(Array.isArray(dailyChallenges) ? dailyChallenges : []).reduce((sum, c) => sum + (c.is_completed_today ? c.points_reward : 0), 0) + 
                 (Array.isArray(weeklyChallenges) ? weeklyChallenges : []).reduce((sum, c) => sum + (c.progress?.total_points_earned || 0), 0)} pts earned
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div variants={itemVariants} className="mb-8">
        <div className="flex space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-lg border border-blue-100">
          <motion.button
            onClick={() => setActiveTab('daily')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'daily'
                ? 'bg-white text-blue-600 shadow-md border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className={`p-1 rounded-full ${
              activeTab === 'daily' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Target className="h-4 w-4" />
            </div>
            <span className="font-medium">Daily Challenges</span>
            {activeTab === 'daily' && (
              <Badge className="bg-blue-500 text-white">
                {dailyChallenges.filter(c => !c.is_completed_today).length}
              </Badge>
            )}
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('weekly')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'weekly'
                ? 'bg-white text-blue-600 shadow-md border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className={`p-1 rounded-full ${
              activeTab === 'weekly' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-medium">Weekly Challenges</span>
            {activeTab === 'weekly' && (
              <Badge className="bg-purple-500 text-white">
                {weeklyChallenges.filter(c => c.is_enrolled).length}
              </Badge>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Daily Challenges */}
      <AnimatePresence mode="wait">
        {activeTab === 'daily' && (
          <motion.div 
            key="daily"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Today's Challenges
                </h3>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  {dailyChallenges.filter(c => c.is_completed_today).length} / {dailyChallenges.length} completed
                </Badge>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1">
                  <Star className="h-4 w-4 mr-1" />
                  {dailyChallenges.reduce((sum, c) => sum + (c.is_completed_today ? c.points_reward : 0), 0)} pts
                </Badge>
              </motion.div>
            </motion.div>

            {dailyChallenges.length === 0 ? (
              <motion.div variants={itemVariants} className="mx-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-blue-50">
                  <CardContent className="text-center py-16 px-8">
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Target className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                    </motion.div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-3">No challenges available today</h4>
                    <p className="text-gray-500 mb-4">You've completed all today's challenges!</p>
                    <p className="text-sm text-gray-400">Check back tomorrow for new challenges!</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div className="grid gap-6 px-4" variants={containerVariants}>
                {dailyChallenges.map((challenge, index) => {
                  const typeColors = getChallengeTypeColor(challenge.challenge_type);
                  return (
                    <motion.div
                      key={challenge.id}
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="mx-2"
                    >
                      <Card className={`border-0 shadow-lg transition-all duration-300 overflow-hidden ${
                        challenge.is_completed_today 
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-400' 
                          : 'bg-gradient-to-br from-white to-gray-50 hover:shadow-xl'
                      }`}>
                        <CardContent className="p-0">
                          {/* Header with gradient */}
                          <div className={`bg-gradient-to-r ${typeColors.gradient} p-4 text-white`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <motion.div
                                  animate={challenge.is_completed_today ? { scale: [1, 1.2, 1] } : {}}
                                  transition={{ duration: 0.5 }}
                                >
                                  {challenge.is_completed_today ? (
                                    <CheckCircle className="h-6 w-6" />
                                  ) : (
                                    <Circle className="h-6 w-6" />
                                  )}
                                </motion.div>
                                <div>
                                  <h4 className="font-bold text-lg">{challenge.title}</h4>
                                  <Badge className="bg-white/20 text-white border-white/30 mt-1">
                                    {formatChallengeType(challenge.challenge_type)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-1 text-white/90">
                                  <Zap className="h-4 w-4" />
                                  <span className="font-bold">+{challenge.points_reward}</span>
                                </div>
                                {challenge.duration_minutes && (
                                  <div className="flex items-center space-x-1 text-white/80 text-sm mt-1">
                                    <Timer className="h-3 w-3" />
                                    <span>{challenge.duration_minutes} min</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-8">
                            <p className="text-gray-600 mb-6 leading-relaxed text-base">{challenge.description}</p>
                            
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100 mb-6">
                              <div className="flex items-center space-x-2 mb-3">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                                <p className="text-sm font-semibold text-blue-700">Instructions:</p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{challenge.instructions}</p>
                            </div>

                            {!challenge.is_completed_today && (
                              <div className="space-y-6">
                                {challenge.target_value && (
                                  <div>
                                    <label className="block text-sm font-medium mb-3 text-gray-700">
                                      Target Value (Optional)
                                    </label>
                                    <input
                                      type="number"
                                      value={completionValue}
                                      onChange={(e) => setCompletionValue(e.target.value === '' ? '' : Number(e.target.value))}
                                      placeholder={`Target: ${challenge.target_value}`}
                                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    />
                                  </div>
                                )}
                                
                                <div>
                                  <label className="block text-sm font-medium mb-3 text-gray-700">
                                    Notes (Optional)
                                  </label>
                                  <Textarea
                                    value={completionNotes}
                                    onChange={(e) => setCompletionNotes(e.target.value)}
                                    placeholder="How did it go? Any thoughts?"
                                    rows={3}
                                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 p-4"
                                  />
                                </div>

                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="mt-6"
                                >
                                  <Button
                                    onClick={() => completeChallenge(challenge.id)}
                                    disabled={completingChallenge === challenge.id}
                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg text-base"
                                  >
                                    {completingChallenge === challenge.id ? (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Completing...</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-5 w-5" />
                                        <span>Mark as Complete</span>
                                      </div>
                                    )}
                                  </Button>
                                </motion.div>
                              </div>
                            )}

                            {challenge.is_completed_today && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center py-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200 mt-6"
                              >
                                <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
                                <span className="font-semibold text-green-700 text-lg">Challenge Completed!</span>
                                <Award className="h-6 w-6 ml-3 text-yellow-500" />
                              </motion.div>
                            )}
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

      {/* Weekly Challenges */}
      <AnimatePresence mode="wait">
        {activeTab === 'weekly' && (
          <motion.div 
            key="weekly"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Weekly Challenges
                </h3>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                  <Trophy className="h-4 w-4 mr-1 text-purple-500" />
                  {weeklyChallenges.filter(c => c.is_enrolled).length} active
                </Badge>
              </motion.div>
            </motion.div>

            {weeklyChallenges.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-purple-50">
                  <CardContent className="text-center py-16">
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                    </motion.div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-3">No weekly challenges available</h4>
                    <p className="text-gray-500 mb-4">New challenges are added regularly!</p>
                    <p className="text-sm text-gray-400">Check back soon for exciting weekly challenges!</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div className="grid gap-6" variants={containerVariants}>
                {weeklyChallenges.map((challenge) => {
                  const typeColors = getChallengeTypeColor(challenge.challenge_type);
                  return (
                    <motion.div
                      key={challenge.id}
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <Card className={`border-0 shadow-lg transition-all duration-300 overflow-hidden ${
                        challenge.progress?.is_completed 
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-l-yellow-400' 
                          : 'bg-gradient-to-br from-white to-gray-50 hover:shadow-xl'
                      }`}>
                        <CardContent className="p-0">
                          {/* Header with gradient */}
                          <div className={`bg-gradient-to-r ${typeColors.gradient} p-4 text-white`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <motion.div
                                  animate={challenge.progress?.is_completed ? { scale: [1, 1.2, 1] } : {}}
                                  transition={{ duration: 0.5 }}
                                >
                                  {challenge.progress?.is_completed ? (
                                    <Trophy className="h-6 w-6" />
                                  ) : (
                                    <Calendar className="h-6 w-6" />
                                  )}
                                </motion.div>
                                <div>
                                  <h4 className="font-bold text-lg">{challenge.title}</h4>
                                  <Badge className="bg-white/20 text-white border-white/30 mt-1">
                                    {formatChallengeType(challenge.challenge_type)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-1 text-white/90">
                                  <Zap className="h-4 w-4" />
                                  <span className="font-bold">+{challenge.points_per_day}/day</span>
                                </div>
                                <div className="flex items-center space-x-1 text-white/80 text-sm mt-1">
                                  <Trophy className="h-3 w-3" />
                                  <span>+{challenge.bonus_points} bonus</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-6">
                            <p className="text-gray-600 mb-4 leading-relaxed">{challenge.description}</p>
                            
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100 mb-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                                <p className="text-sm font-semibold text-blue-700">Instructions:</p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{challenge.instructions}</p>
                            </div>

                            <div className="text-sm text-gray-500 mb-4 flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>Duration: {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}</span>
                            </div>

                            {challenge.is_enrolled && challenge.progress && (
                              <div className="space-y-4 mb-4">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Progress</span>
                                    <span className="text-sm text-gray-600">
                                      {challenge.progress.days_completed} / {challenge.target_days} days
                                    </span>
                                  </div>
                                  <Progress value={challenge.progress.completion_percentage} className="h-3" />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm font-medium">Points Earned: {challenge.progress.total_points_earned}</span>
                                  </div>
                                  {!challenge.progress.is_completed && (
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        size="sm"
                                        onClick={() => completeWeeklyChallenge(challenge.id)}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                      >
                                        Complete Today
                                      </Button>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            )}

                            {!challenge.is_enrolled && (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  onClick={() => enrollInWeeklyChallenge(challenge.id)}
                                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg"
                                >
                                  <Plus className="h-5 w-5 mr-2" />
                                  Enroll in Challenge
                                </Button>
                              </motion.div>
                            )}

                            {challenge.progress?.is_completed && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center py-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200"
                              >
                                <Trophy className="h-6 w-6 mr-3 text-yellow-600" />
                                <span className="font-semibold text-yellow-700 text-lg">Challenge Completed!</span>
                                <Sparkles className="h-6 w-6 ml-3 text-orange-500" />
                              </motion.div>
                            )}
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
