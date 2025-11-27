import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Heart, 
  Calendar,
  Lightbulb,
  Target,
  Activity,
  Smile,
  Moon,
  Zap,
  Award,
  Clock,
  RefreshCw,
  Download,
  Share2,
  Filter,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { toast } from 'sonner';

interface InsightData {
  mood_patterns: {
    average_mood: number;
    mood_trend: 'improving' | 'stable' | 'declining';
    best_day: string;
    worst_day: string;
    patterns: Array<{
      day: string;
      mood: number;
      energy: number;
      anxiety: number;
    }>;
  };
  activity_insights: {
    most_active_time: string;
    preferred_activities: string[];
    completion_rate: number;
    streak_data: {
      current: number;
      longest: number;
      average: number;
    };
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>;
  wellness_score: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    breakdown: {
      mood: number;
      activity: number;
      consistency: number;
      engagement: number;
    };
  };
}

const WellnessInsights: React.FC = () => {
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'recommendations' | 'analytics'>('overview');
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [timeRange]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await wellnessService.getWellnessInsights();
      setInsightData(data);
    } catch (error) {
      console.error('Error loading wellness insights:', error);
      toast.error('Failed to load wellness insights');
    } finally {
      setLoading(false);
    }
  };

  const generateMoodPattern = async () => {
    try {
      setGeneratingInsights(true);
      await wellnessService.generateMoodPattern({ days: parseInt(timeRange) });
      toast.success('AI insights generated successfully!');
      await loadInsights();
    } catch (error) {
      console.error('Error generating mood pattern:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-green-600 bg-green-100';
    if (mood >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
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
                Wellness Insights
              </h1>
              <p className="text-gray-600 text-lg">AI-powered analysis of your wellness journey</p>
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
              <Button 
                onClick={generateMoodPattern}
                disabled={generatingInsights}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {generatingInsights ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                Generate AI Insights
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Wellness Score Overview */}
        {insightData?.wellness_score && (
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Wellness Score</h3>
                    <p className="text-indigo-100">Your overall wellness rating</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold mb-2">
                      {insightData.wellness_score.current}
                      <span className="text-2xl text-indigo-200">/100</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      {getTrendIcon(insightData.wellness_score.trend)}
                      <span className="text-sm">
                        {insightData.wellness_score.trend === 'up' ? '+' : ''}
                        {insightData.wellness_score.current - insightData.wellness_score.previous} from last period
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{insightData.wellness_score.breakdown.mood}</div>
                    <div className="text-sm text-indigo-200">Mood</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{insightData.wellness_score.breakdown.activity}</div>
                    <div className="text-sm text-indigo-200">Activity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{insightData.wellness_score.breakdown.consistency}</div>
                    <div className="text-sm text-indigo-200">Consistency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{insightData.wellness_score.breakdown.engagement}</div>
                    <div className="text-sm text-indigo-200">Engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mood Summary */}
              {insightData?.mood_patterns && (
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Smile className="w-5 h-5 text-blue-600" />
                        <span>Mood Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Average Mood</span>
                          <Badge className={getMoodColor(insightData.mood_patterns.average_mood)}>
                            {insightData.mood_patterns.average_mood.toFixed(1)}/5
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Trend</span>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(insightData.mood_patterns.mood_trend)}
                            <span className="text-sm capitalize">{insightData.mood_patterns.mood_trend}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="text-xs text-gray-500 mb-1">Best Day</div>
                          <div className="text-sm font-medium">{insightData.mood_patterns.best_day}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Activity Insights */}
              {insightData?.activity_insights && (
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-green-600" />
                        <span>Activity Insights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <Badge variant="outline">
                            {insightData.activity_insights.completion_rate}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Current Streak</span>
                          <Badge className="bg-orange-100 text-orange-600">
                            {insightData.activity_insights.streak_data.current} days
                          </Badge>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="text-xs text-gray-500 mb-1">Most Active Time</div>
                          <div className="text-sm font-medium">{insightData.activity_insights.most_active_time}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Quick Recommendations */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <span>Quick Tips</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insightData?.recommendations?.slice(0, 3).map((rec, index) => (
                        <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                          <div className="flex items-start space-x-2">
                            <Sparkles className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm">{rec.title}</div>
                              <div className="text-xs text-gray-600 mt-1">{rec.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!insightData?.recommendations || insightData.recommendations.length === 0) && (
                        <div className="text-center py-4 text-gray-500">
                          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recommendations available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Mood Patterns Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {insightData?.mood_patterns?.patterns ? (
                    <div className="space-y-4">
                      {insightData.mood_patterns.patterns.map((pattern, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium w-20">{pattern.day}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Smile className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">Mood: {pattern.mood}/5</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">Energy: {pattern.energy}/5</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span className="text-sm">Anxiety: {pattern.anxiety}/5</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pattern data available</p>
                      <Button 
                        onClick={generateMoodPattern}
                        className="mt-4"
                        variant="outline"
                      >
                        Generate Pattern Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insightData?.recommendations?.map((rec, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{rec.category}</Badge>
                        <Button size="sm" variant="ghost">
                          Learn More
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )) || (
                <motion.div variants={itemVariants} className="col-span-2">
                  <Card>
                    <CardContent className="text-center py-12">
                      <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Recommendations Yet</h3>
                      <p className="text-gray-500 mb-4">Complete more wellness activities to get personalized recommendations</p>
                      <Button onClick={generateMoodPattern}>
                        Generate Recommendations
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>Advanced Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Advanced Analytics Coming Soon</h3>
                    <p className="text-gray-500 mb-4">Detailed charts and analytics will be available in the next update</p>
                    <Button variant="outline">
                      Request Early Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default WellnessInsights;
