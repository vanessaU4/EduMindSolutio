import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3, 
  Heart,
  Smile,
  Frown,
  Meh,
  Target,
  Award,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { moodService, MoodEntry, MoodStats } from '@/services/moodService';
import { useToast } from '@/hooks/use-toast';

const MoodDashboard: React.FC = () => {
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, entries, trendData] = await Promise.all([
        moodService.getMoodStats(),
        moodService.getMoodHistory(5),
        moodService.getMoodTrends('week')
      ]);
      
      setMoodStats(stats);
      setRecentEntries(entries);
      setTrends(trendData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mood dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmotionIcon = (emotion: string, size: string = 'w-5 h-5') => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return <Smile className={`${size} text-green-600`} />;
      case 'sad':
        return <Frown className={`${size} text-blue-600`} />;
      case 'angry':
        return <Frown className={`${size} text-red-600`} />;
      case 'neutral':
      default:
        return <Meh className={`${size} text-gray-600`} />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-healthcare-primary" />
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
        {/* Header */}
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Mood Dashboard
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Track your emotional well-being and mood patterns over time
              </p>
            </div>
            <Button onClick={() => navigate('/mood/tracker')}>
              <Heart className="w-4 h-4 mr-2" />
              Track Mood
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {moodStats?.total_entries || 0}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {moodStats?.entries_this_week || 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Streak Days</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {moodStats?.streak_days || 0}
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((moodStats?.average_confidence || 0) * 100)}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Mood Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Mood Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Most Common Emotion */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getEmotionIcon(moodStats?.most_common_emotion || 'neutral', 'w-8 h-8')}
                  <div>
                    <p className="font-medium capitalize">
                      {moodStats?.most_common_emotion || 'No data'}
                    </p>
                    <p className="text-sm text-gray-600">Most common emotion</p>
                  </div>
                </div>
                <Badge variant="secondary">Primary</Badge>
              </div>

              {/* Mood Trend */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTrendIcon(moodStats?.mood_trend || 'stable')}
                  <div>
                    <p className="font-medium capitalize">
                      {moodStats?.mood_trend || 'Stable'}
                    </p>
                    <p className="text-sm text-gray-600">Overall trend</p>
                  </div>
                </div>
                <Badge className={getTrendColor(moodStats?.mood_trend || 'stable')}>
                  {moodStats?.mood_trend || 'Stable'}
                </Badge>
              </div>

              {/* Weekly Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Weekly Goal Progress</span>
                  <span className="text-sm text-gray-600">
                    {moodStats?.entries_this_week || 0}/7 days
                  </span>
                </div>
                <Progress 
                  value={((moodStats?.entries_this_week || 0) / 7) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Recent Entries
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/mood/history')}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 mb-2">No entries yet</p>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/mood/tracker')}
                  >
                    Start Tracking
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getEmotionIcon(entry.emotion)}
                      <div className="flex-1">
                        <p className="font-medium capitalize text-sm">
                          {entry.emotion}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(entry.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/mood/tracker')}
                className="flex items-center justify-center gap-2 h-16"
              >
                <Heart className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Track Mood</div>
                  <div className="text-xs opacity-90">Capture your current mood</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                onClick={() => navigate('/mood/history')}
                className="flex items-center justify-center gap-2 h-16"
              >
                <Calendar className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">View History</div>
                  <div className="text-xs opacity-70">See all mood entries</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                onClick={() => navigate('/mood/analytics')}
                className="flex items-center justify-center gap-2 h-16"
              >
                <BarChart3 className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Analytics</div>
                  <div className="text-xs opacity-70">Detailed insights</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MoodDashboard;
