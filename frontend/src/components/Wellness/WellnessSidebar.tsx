import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  Lightbulb, 
  Target,
  Heart,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Activity,
  Calendar
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { useToast } from '@/hooks/use-toast';

interface WellnessSidebarProps {
  initialInsights?: any;
  onInsightUpdate?: () => void;
  className?: string;
}

interface WellnessInsight {
  overall_score: number;
  mood_trend: 'improving' | 'stable' | 'declining';
  activity_level: 'low' | 'moderate' | 'high';
  sleep_quality: 'poor' | 'fair' | 'good' | 'excellent';
  stress_level: 'low' | 'moderate' | 'high';
  recommendations: string[];
  weekly_summary: {
    mood_entries: number;
    activities_completed: number;
    challenges_completed: number;
    achievements_earned: number;
  };
  metrics: {
    name: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
    description: string;
  }[];
}

const WellnessSidebar: React.FC<WellnessSidebarProps> = ({ 
  initialInsights, 
  onInsightUpdate,
  className = ''
}) => {
  const [insights, setInsights] = useState<WellnessInsight | null>(initialInsights || null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: 'Error',
        description: 'Failed to load wellness insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    await loadInsights();
    if (onInsightUpdate) {
      onInsightUpdate();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

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

  if (loading && !insights) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="shadow-lg border-gray-200 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
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
      </div>
    );
  }

  return (
    <motion.div 
      className={`space-y-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Wellness Score */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg hover:shadow-xl transition-shadow border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/30">
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
            <div className="text-center mb-4">
              <motion.div 
                className={`text-4xl font-bold ${getScoreColor(insights.overall_score)} mb-2`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                {Math.round(insights.overall_score)}
              </motion.div>
              <Progress 
                value={insights.overall_score} 
                className="w-full h-3 mb-3" 
              />
              <div className="flex items-center justify-center space-x-2">
                {getTrendIcon(insights.mood_trend)}
                <span className="text-sm text-gray-600 capitalize">
                  {insights.mood_trend} trend
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {insights.metrics.slice(0, 4).map((metric, index) => (
                <motion.div 
                  key={metric.name}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-purple-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(metric.trend)}
                    <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={(metric.score / 30) * 100} className="w-20 h-2" />
                    <span className="text-xs font-semibold text-gray-600 w-8">{Math.round(metric.score)}</span>
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
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  </motion.div>
                  <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Summary */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg hover:shadow-xl transition-shadow border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Calendar className="h-5 w-5 text-green-500" />
              </motion.div>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">This Week</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="text-center p-3 bg-white/50 rounded-lg border border-green-100"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {insights.weekly_summary.mood_entries}
                </div>
                <div className="text-xs text-gray-600">Mood Entries</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-3 bg-white/50 rounded-lg border border-green-100"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {insights.weekly_summary.activities_completed}
                </div>
                <div className="text-xs text-gray-600">Activities</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-3 bg-white/50 rounded-lg border border-green-100"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {insights.weekly_summary.challenges_completed}
                </div>
                <div className="text-xs text-gray-600">Challenges</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-3 bg-white/50 rounded-lg border border-green-100"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {insights.weekly_summary.achievements_earned}
                </div>
                <div className="text-xs text-gray-600">Achievements</div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default WellnessSidebar;
