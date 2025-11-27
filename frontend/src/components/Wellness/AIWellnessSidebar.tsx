import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Heart,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Target,
  Award,
  Calendar,
  Zap
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { toast } from 'sonner';

interface AIInsights {
  wellness_score: {
    total_score: number;
    factors: Record<string, number>;
    level: {
      name: string;
      color: string;
    };
  };
  mood_analysis: any;
  recommendations: string[];
  daily_affirmation: string;
  suggested_challenges: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

interface AIWellnessSidebarProps {
  aiInsights?: AIInsights;
  onInsightUpdate?: () => void;
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
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const AIWellnessSidebar: React.FC<AIWellnessSidebarProps> = ({ 
  aiInsights: initialInsights, 
  onInsightUpdate 
}) => {
  const [insights, setInsights] = useState<AIInsights | null>(initialInsights || null);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!initialInsights) {
      loadInsights();
    }
  }, [initialInsights]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await wellnessService.getWellnessInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading wellness insights:', error);
      toast.error('Failed to load wellness insights');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    await loadInsights();
    if (onInsightUpdate) {
      onInsightUpdate();
    }
    toast.success('Insights refreshed!');
  };

  const generateMoodPattern = async () => {
    try {
      setLoading(true);
      await wellnessService.generateMoodPattern({ days: 30 });
      await loadInsights();
      toast.success('New mood pattern generated!');
    } catch (error) {
      console.error('Error generating mood pattern:', error);
      toast.error('Failed to generate mood pattern');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-orange-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  if (loading && !insights) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="sticky top-6"
      >
        <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/30 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!insights) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="sticky top-6"
      >
        <Card className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-gray-200 shadow-lg">
          <CardContent className="p-6 text-center">
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
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            </motion.div>
            <p className="text-gray-500 mb-4">Wellness insights not available</p>
            <Button 
              onClick={loadInsights} 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Load Insights
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 sticky top-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Wellness Score */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                >
                  <Brain className="h-5 w-5 text-purple-600" />
                </motion.div>
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">Wellness Score</span>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshInsights}
                  disabled={loading}
                  className="hover:bg-purple-100"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </motion.div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center mb-6">
              <motion.div 
                className={`text-5xl font-bold ${getScoreColor(insights.wellness_score.total_score)} mb-2`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {insights.wellness_score.total_score}
              </motion.div>
              <div className="text-sm text-gray-600 mb-3">out of 100</div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Badge 
                  className={`bg-gradient-to-r ${getScoreGradient(insights.wellness_score.total_score)} text-white px-4 py-2 text-sm shadow-lg`}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {insights.wellness_score.level.name}
                </Badge>
              </motion.div>
            </div>

            <div className="space-y-3">
              {Object.entries(insights.wellness_score.factors).map(([factor, score], index) => (
                <motion.div 
                  key={factor} 
                  className="flex items-center justify-between text-sm p-2 bg-white/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="capitalize font-medium text-gray-700">{factor.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={(score / 30) * 100} className="w-20 h-2" />
                    <span className="text-xs font-semibold text-gray-600 w-8">{Math.round(score)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wellness Recommendations */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg hover:shadow-xl transition-shadow border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-orange-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 4
                }}
              >
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </motion.div>
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent font-bold">Wellness Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {insights.recommendations.slice(0, 3).map((recommendation, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  </motion.div>
                  <p className="text-sm text-gray-700 font-medium">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          
            {insights.recommendations.length > 3 && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-4 bg-white/50 hover:bg-white/80 border border-yellow-200"
                  onClick={() => setExpandedSection(expandedSection === 'recommendations' ? null : 'recommendations')}
                >
                  {expandedSection === 'recommendations' ? 'Show Less' : `Show ${insights.recommendations.length - 3} More`}
                  <motion.div
                    animate={{ rotate: expandedSection === 'recommendations' ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </motion.div>
                </Button>
              </motion.div>
            )}

            <AnimatePresence>
              {expandedSection === 'recommendations' && (
                <motion.div 
                  className="space-y-3 mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {insights.recommendations.slice(3).map((recommendation, index) => (
                    <motion.div 
                      key={index + 3} 
                      className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      </motion.div>
                      <p className="text-sm text-gray-700 font-medium">{recommendation}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Suggested Challenges */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg hover:shadow-xl transition-shadow border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Target className="h-5 w-5 text-blue-500" />
            <span>Suggested Challenges</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {insights.suggested_challenges.map((challenge, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm text-blue-900 mb-1">
                  {challenge.title}
                </h4>
                <p className="text-xs text-blue-700 mb-2">
                  {challenge.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {challenge.type.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Analysis */}
      {insights.mood_analysis && (
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Mood Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {insights.mood_analysis.averages && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-700">
                      {insights.mood_analysis.averages.mood?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-xs text-green-600">Avg Mood</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-700">
                      {insights.mood_analysis.averages.energy?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-xs text-blue-600">Avg Energy</div>
                  </div>
                </div>

                {insights.mood_analysis.consistency_score && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Tracking Consistency</span>
                      <span>{Math.round(insights.mood_analysis.consistency_score)}%</span>
                    </div>
                    <Progress value={insights.mood_analysis.consistency_score} className="h-2" />
                  </div>
                )}
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={generateMoodPattern}
              disabled={loading}
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Deep Analysis
            </Button>
          </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg hover:shadow-xl transition-shadow border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => window.location.href = '#mood-tracker'}
            >
              <Heart className="h-4 w-4 mr-2" />
              Log Mood
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => window.location.href = '#challenges'}
            >
              <Target className="h-4 w-4 mr-2" />
              View Challenges
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => window.location.href = '#achievements'}
            >
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </Button>
          </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wellness Tip */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Heart className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-pink-900 mb-1">Daily Wellness Tip</h4>
              <p className="text-sm text-pink-700">
                Take a moment to appreciate three things that went well today, no matter how small they might seem.
              </p>
            </div>
          </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
