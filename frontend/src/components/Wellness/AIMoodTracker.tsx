import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart,
  Zap,
  Brain,
  Moon,
  Plus,
  X,
  Calendar,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Activity,
  AlertCircle,
  Lightbulb,
  Target,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { toast } from 'sonner';

interface MoodEntry {
  mood_rating: number;
  energy_level: number;
  anxiety_level: number;
  sleep_quality: number;
  notes: string;
  activities: string[];
  triggers: string[];
  date: string;
}

interface AIInsight {
  type: 'pattern' | 'recommendation' | 'alert' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  relatedChallenges?: string[];
}

interface MoodTrackerProps {
  onMoodTracked?: (moodData?: MoodEntry) => void;
  compact?: boolean;
}

const MOOD_EMOJIS = {
  1: { emoji: '😢', label: 'Very Low', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  2: { emoji: '😔', label: 'Low', color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  3: { emoji: '😐', label: 'Neutral', color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  4: { emoji: '😊', label: 'Good', color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  5: { emoji: '😄', label: 'Very Good', color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
};

const COMMON_ACTIVITIES = [
  'Exercise', 'Work', 'Social Time', 'Reading', 'Music', 'Meditation', 
  'Cooking', 'Walking', 'Gaming', 'Learning', 'Family Time', 'Rest'
];

const COMMON_TRIGGERS = [
  'Work Stress', 'Relationship Issues', 'Health Concerns', 'Financial Worry',
  'Sleep Deprivation', 'Social Pressure', 'Weather', 'News/Media', 'Traffic', 'Deadlines'
];

export const AIMoodTracker: React.FC<MoodTrackerProps> = ({ onMoodTracked, compact = false }) => {
  const [moodEntry, setMoodEntry] = useState<MoodEntry>({
    mood_rating: 3,
    energy_level: 3,
    anxiety_level: 3,
    sleep_quality: 3,
    notes: '',
    activities: [],
    triggers: [],
    date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);
  const [newActivity, setNewActivity] = useState('');
  const [newTrigger, setNewTrigger] = useState('');

  useEffect(() => {
    loadRecentMoods();
  }, []);

  useEffect(() => {
    if (moodEntry.mood_rating !== 3 || moodEntry.notes) {
      generateAIInsights();
    }
  }, [moodEntry.mood_rating, moodEntry.energy_level, moodEntry.anxiety_level, moodEntry.sleep_quality]);

  const loadRecentMoods = async () => {
    try {
      const moods = await wellnessService.getMoodHistory(7);
      setRecentMoods(Array.isArray(moods) ? moods : []);
    } catch (error) {
      console.error('Error loading recent moods:', error);
    }
  };

  const generateAIInsights = async () => {
    setLoadingInsights(true);
    try {
      // Simulate AI analysis based on current entry and recent history
      const insights: AIInsight[] = [];

      // Pattern detection
      if (recentMoods.length > 0) {
        const avgMood = recentMoods.reduce((sum, m) => sum + m.mood_rating, 0) / recentMoods.length;
        if (moodEntry.mood_rating > avgMood + 0.5) {
          insights.push({
            type: 'pattern',
            title: 'Mood Improvement Detected',
            description: 'Your mood is trending upward compared to recent entries. Keep up the positive momentum!',
            confidence: 85,
            actionable: true,
            relatedChallenges: ['gratitude', 'mindfulness']
          });
        } else if (moodEntry.mood_rating < avgMood - 0.5) {
          insights.push({
            type: 'alert',
            title: 'Mood Dip Noticed',
            description: 'Your mood seems lower than usual. Consider reaching out for support or trying a wellness activity.',
            confidence: 78,
            actionable: true,
            relatedChallenges: ['breathing', 'social']
          });
        }
      }

      // Energy-mood correlation
      if (moodEntry.energy_level < 2 && moodEntry.mood_rating < 3) {
        insights.push({
          type: 'recommendation',
          title: 'Low Energy & Mood Connection',
          description: 'Low energy often correlates with mood. Try light exercise or a short walk to boost both.',
          confidence: 92,
          actionable: true,
          relatedChallenges: ['physical', 'energy']
        });
      }

      // Sleep quality impact
      if (moodEntry.sleep_quality < 3) {
        insights.push({
          type: 'recommendation',
          title: 'Sleep Quality Impact',
          description: 'Poor sleep can significantly affect mood. Consider establishing a better sleep routine.',
          confidence: 88,
          actionable: true,
          relatedChallenges: ['sleep', 'habit_building']
        });
      }

      // Anxiety management
      if (moodEntry.anxiety_level > 3) {
        insights.push({
          type: 'recommendation',
          title: 'Anxiety Management',
          description: 'High anxiety levels detected. Try deep breathing exercises or mindfulness techniques.',
          confidence: 90,
          actionable: true,
          relatedChallenges: ['breathing', 'mindfulness']
        });
      }

      // Achievement recognition
      if (moodEntry.mood_rating >= 4 && moodEntry.energy_level >= 4) {
        insights.push({
          type: 'achievement',
          title: 'Great Day Recognition',
          description: 'You\'re having a great day with high mood and energy! Consider what contributed to this positive state.',
          confidence: 95,
          actionable: false
        });
      }

      setAIInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Try the AI-powered endpoint first, fallback to regular endpoint
      let response;
      try {
        response = await wellnessService.createMoodEntryWithAI(moodEntry);
        toast.success('Mood entry saved with AI analysis!');
      } catch (aiError) {
        console.warn('AI endpoint not available, using regular endpoint:', aiError);
        response = await wellnessService.createMoodEntry(moodEntry);
        toast.success('Mood entry saved successfully!');
      }
      
      // Pass mood data to parent for challenge recommendations
      if (onMoodTracked) {
        onMoodTracked(moodEntry);
      }
      
      // Reset form
      const resetEntry = {
        mood_rating: 3,
        energy_level: 3,
        anxiety_level: 3,
        sleep_quality: 3,
        notes: '',
        activities: [],
        triggers: [],
        date: new Date().toISOString().split('T')[0]
      };
      setMoodEntry(resetEntry);
      
      setAIInsights([]);
      await loadRecentMoods();
    } catch (error) {
      console.error('Error saving mood entry:', error);
      
      // Provide more helpful error message
      if (error.message?.includes('500')) {
        toast.error('Server error: The mood tracking service is currently unavailable. Please try again later.');
      } else if (error.message?.includes('404')) {
        toast.error('Mood tracking endpoint not found. Please check your server configuration.');
      } else {
        toast.error('Failed to save mood entry. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addActivity = () => {
    if (newActivity && !moodEntry.activities.includes(newActivity)) {
      setMoodEntry(prev => ({
        ...prev,
        activities: [...prev.activities, newActivity]
      }));
      setNewActivity('');
    }
  };

  const addTrigger = () => {
    if (newTrigger && !moodEntry.triggers.includes(newTrigger)) {
      setMoodEntry(prev => ({
        ...prev,
        triggers: [...prev.triggers, newTrigger]
      }));
      setNewTrigger('');
    }
  };

  const removeActivity = (activity: string) => {
    setMoodEntry(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a !== activity)
    }));
  };

  const removeTrigger = (trigger: string) => {
    setMoodEntry(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'achievement': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'recommendation': return 'bg-green-50 border-green-200 text-green-700';
      case 'alert': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'achievement': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>Quick Mood Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
              <div className="flex justify-between items-center space-x-2">
                {Object.entries(MOOD_EMOJIS).map(([rating, data]) => (
                  <button
                    key={rating}
                    onClick={() => setMoodEntry(prev => ({ ...prev, mood_rating: parseInt(rating) }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      moodEntry.mood_rating === parseInt(rating)
                        ? `${data.bgColor} ${data.borderColor} scale-110`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{data.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Save Mood
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Mood Entry Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI-Powered Mood Tracker</h3>
                <p className="text-sm text-gray-600">Track your mood and get personalized insights</p>
              </div>
            </CardTitle>
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Rating */}
          <div>
            <label className="text-sm font-medium mb-3 block">Overall Mood</label>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(MOOD_EMOJIS).map(([rating, data]) => (
                <motion.button
                  key={rating}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMoodEntry(prev => ({ ...prev, mood_rating: parseInt(rating) }))}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    moodEntry.mood_rating === parseInt(rating)
                      ? `${data.bgColor} ${data.borderColor} scale-105 shadow-md`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{data.emoji}</div>
                  <div className={`text-xs font-medium ${moodEntry.mood_rating === parseInt(rating) ? data.color : 'text-gray-600'}`}>
                    {data.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Advanced Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                Energy Level: {moodEntry.energy_level}
              </label>
              <Slider
                value={[moodEntry.energy_level]}
                onValueChange={(value) => setMoodEntry(prev => ({ ...prev, energy_level: value[0] }))}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center">
                <Heart className="w-4 h-4 mr-1 text-red-500" />
                Anxiety Level: {moodEntry.anxiety_level}
              </label>
              <Slider
                value={[moodEntry.anxiety_level]}
                onValueChange={(value) => setMoodEntry(prev => ({ ...prev, anxiety_level: value[0] }))}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center">
                <Moon className="w-4 h-4 mr-1 text-indigo-500" />
                Sleep Quality: {moodEntry.sleep_quality}
              </label>
              <Slider
                value={[moodEntry.sleep_quality]}
                onValueChange={(value) => setMoodEntry(prev => ({ ...prev, sleep_quality: value[0] }))}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-4 h-4 ml-2" />
              </motion.div>
            </Button>
          </div>

          {/* Advanced Options */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Activities */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Activities Today</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_ACTIVITIES.map(activity => (
                      <Badge
                        key={activity}
                        variant={moodEntry.activities.includes(activity) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (moodEntry.activities.includes(activity)) {
                            removeActivity(activity);
                          } else {
                            setMoodEntry(prev => ({ ...prev, activities: [...prev.activities, activity] }));
                          }
                        }}
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add custom activity..."
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                    />
                    <Button size="sm" onClick={addActivity}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {moodEntry.activities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {moodEntry.activities.map(activity => (
                        <Badge key={activity} className="bg-blue-100 text-blue-800">
                          {activity}
                          <button onClick={() => removeActivity(activity)} className="ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Triggers */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Mood Triggers</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_TRIGGERS.map(trigger => (
                      <Badge
                        key={trigger}
                        variant={moodEntry.triggers.includes(trigger) ? "destructive" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (moodEntry.triggers.includes(trigger)) {
                            removeTrigger(trigger);
                          } else {
                            setMoodEntry(prev => ({ ...prev, triggers: [...prev.triggers, trigger] }));
                          }
                        }}
                      >
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add custom trigger..."
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTrigger()}
                    />
                    <Button size="sm" onClick={addTrigger}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {moodEntry.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {moodEntry.triggers.map(trigger => (
                        <Badge key={trigger} className="bg-red-100 text-red-800">
                          {trigger}
                          <button onClick={() => removeTrigger(trigger)} className="ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Additional Notes</label>
                  <Textarea
                    placeholder="How are you feeling? What's on your mind?"
                    value={moodEntry.notes}
                    onChange={(e) => setMoodEntry(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            )}
            Save Mood Entry
          </Button>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AnimatePresence>
        {aiInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>AI Insights</span>
                  {loadingInsights && <RefreshCw className="w-4 h-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{insight.title}</h4>
                          <p className="text-sm mb-2">{insight.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                            {insight.relatedChallenges && insight.relatedChallenges.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Target className="w-3 h-3" />
                                <span className="text-xs">Suggested challenges available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Mood Trend */}
      {recentMoods.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Recent Mood Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2 h-20">
              {recentMoods.slice(-7).map((mood, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                    style={{ height: `${(mood.mood_rating / 5) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(mood.date).toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIMoodTracker;
