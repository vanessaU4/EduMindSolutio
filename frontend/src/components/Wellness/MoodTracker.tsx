import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
  CheckCircle2
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

interface MoodTrackerProps {
  onMoodSubmitted?: () => void;
  compact?: boolean;
}

const MOOD_EMOJIS = {
  1: { emoji: '😢', label: 'Very Low', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  2: { emoji: '😔', label: 'Low', color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  3: { emoji: '😐', label: 'Neutral', color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  4: { emoji: '😊', label: 'Good', color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  5: { emoji: '😄', label: 'Very Good', color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
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

const COMMON_ACTIVITIES = [
  'Exercise', 'Work', 'Socializing', 'Reading', 'Cooking', 'Music', 
  'Gaming', 'Walking', 'Meditation', 'Shopping', 'Cleaning', 'Learning'
];

const COMMON_TRIGGERS = [
  'Work Stress', 'Relationship Issues', 'Health Concerns', 'Financial Worry',
  'Sleep Issues', 'Weather', 'Social Media', 'News', 'Traffic', 'Deadlines'
];

export const MoodTracker: React.FC<MoodTrackerProps> = ({ 
  onMoodSubmitted, 
  compact = false 
}) => {
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
  const [loading, setLoading] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const [newTrigger, setNewTrigger] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await wellnessService.createMoodEntry(moodEntry);
      toast.success('Mood entry saved successfully!');
      
      // Reset form
      setMoodEntry({
        mood_rating: 3,
        energy_level: 3,
        anxiety_level: 3,
        sleep_quality: 3,
        notes: '',
        activities: [],
        triggers: [],
        date: new Date().toISOString().split('T')[0]
      });
      
      if (onMoodSubmitted) {
        onMoodSubmitted();
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      toast.error('Failed to save mood entry');
    } finally {
      setLoading(false);
    }
  };

  const addActivity = (activity: string) => {
    if (activity && !moodEntry.activities.includes(activity)) {
      setMoodEntry(prev => ({
        ...prev,
        activities: [...prev.activities, activity]
      }));
    }
  };

  const removeActivity = (activity: string) => {
    setMoodEntry(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a !== activity)
    }));
  };

  const addTrigger = (trigger: string) => {
    if (trigger && !moodEntry.triggers.includes(trigger)) {
      setMoodEntry(prev => ({
        ...prev,
        triggers: [...prev.triggers, trigger]
      }));
    }
  };

  const removeTrigger = (trigger: string) => {
    setMoodEntry(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }));
  };

  const handleCustomActivity = () => {
    if (newActivity.trim()) {
      addActivity(newActivity.trim());
      setNewActivity('');
    }
  };

  const handleCustomTrigger = () => {
    if (newTrigger.trim()) {
      addTrigger(newTrigger.trim());
      setNewTrigger('');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className={`${compact ? '' : 'max-w-2xl mx-auto'} shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30`}>
        <CardHeader className="pb-4">
          <motion.div variants={itemVariants}>
            <CardTitle className="flex items-center justify-center space-x-3 text-center">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                How are you feeling today?
              </span>
            </CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.form onSubmit={handleSubmit} className="space-y-8" variants={containerVariants}>
            {/* Date */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={moodEntry.date}
                onChange={(e) => setMoodEntry(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                required
              />
            </motion.div>

            {/* Mood Rating */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-4 text-center">
                <span className="text-lg font-semibold">Overall Mood</span>
              </label>
              
              {/* Enhanced Mood Display */}
              <motion.div 
                className={`flex items-center justify-center p-6 rounded-2xl mb-6 border-2 ${MOOD_EMOJIS[moodEntry.mood_rating as keyof typeof MOOD_EMOJIS].bgColor} ${MOOD_EMOJIS[moodEntry.mood_rating as keyof typeof MOOD_EMOJIS].borderColor}`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
                key={moodEntry.mood_rating}
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl mb-2"
                  >
                    {MOOD_EMOJIS[moodEntry.mood_rating as keyof typeof MOOD_EMOJIS].emoji}
                  </motion.div>
                  <p className={`text-xl font-bold ${MOOD_EMOJIS[moodEntry.mood_rating as keyof typeof MOOD_EMOJIS].color}`}>
                    {MOOD_EMOJIS[moodEntry.mood_rating as keyof typeof MOOD_EMOJIS].label}
                  </p>
                </div>
              </motion.div>

              <Slider
                value={[moodEntry.mood_rating]}
                onValueChange={(value) => setMoodEntry(prev => ({ ...prev, mood_rating: value[0] }))}
                max={5}
                min={1}
                step={1}
                className="w-full mb-3"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>😢 Very Low</span>
                <span>😔 Low</span>
                <span>😐 Neutral</span>
                <span>😊 Good</span>
                <span>😄 Very Good</span>
              </div>
            </motion.div>

            {/* Energy Level */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Energy Level</span>
                <Badge variant="outline" className="ml-auto">
                  {moodEntry.energy_level}/5
                </Badge>
              </label>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                <Slider
                  value={[moodEntry.energy_level]}
                  onValueChange={(value) => setMoodEntry(prev => ({ ...prev, energy_level: value[0] }))}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Very Low</span>
                  <span>High</span>
                </div>
              </div>
            </motion.div>

            {/* Anxiety Level */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <span>Anxiety Level</span>
                <Badge variant="outline" className="ml-auto">
                  {moodEntry.anxiety_level}/5
                </Badge>
              </label>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <Slider
                  value={[moodEntry.anxiety_level]}
                  onValueChange={(value) => setMoodEntry(prev => ({ ...prev, anxiety_level: value[0] }))}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
            </motion.div>

            {/* Sleep Quality */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <Moon className="h-5 w-5 text-indigo-500" />
                <span>Sleep Quality</span>
                <Badge variant="outline" className="ml-auto">
                  {moodEntry.sleep_quality}/5
                </Badge>
              </label>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <Slider
                  value={[moodEntry.sleep_quality]}
                  onValueChange={(value) => setMoodEntry(prev => ({ ...prev, sleep_quality: value[0] }))}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Very Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </motion.div>

            {!compact && (
              <>
                {/* Activities */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium mb-4 flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    <span>Activities Today</span>
                  </label>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {COMMON_ACTIVITIES.map(activity => (
                        <motion.button
                          key={activity}
                          type="button"
                          onClick={() => addActivity(activity)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 text-sm rounded-full border-2 transition-all duration-200 ${
                            moodEntry.activities.includes(activity)
                              ? 'bg-green-100 border-green-400 text-green-800 shadow-md'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {activity}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Selected Activities */}
                    <AnimatePresence>
                      {moodEntry.activities.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-wrap gap-2 mb-4"
                        >
                          {moodEntry.activities.map(activity => (
                            <motion.div
                              key={activity}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Badge variant="default" className="flex items-center space-x-2 px-3 py-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>{activity}</span>
                                <button
                                  type="button"
                                  onClick={() => removeActivity(activity)}
                                  className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Custom Activity */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        placeholder="Add custom activity..."
                        className="flex-1 p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomActivity())}
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleCustomActivity}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>

              {/* Triggers */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium mb-4 flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-red-500" />
                  <span>Mood Triggers</span>
                </label>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_TRIGGERS.map(trigger => (
                      <motion.button
                        key={trigger}
                        type="button"
                        onClick={() => addTrigger(trigger)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 text-sm rounded-full border-2 transition-all duration-200 ${
                          moodEntry.triggers.includes(trigger)
                            ? 'bg-red-100 border-red-400 text-red-800 shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {trigger}
                      </motion.button>
                    ))}
                  </div>

                  {/* Selected Triggers */}
                  <AnimatePresence>
                    {moodEntry.triggers.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 mb-4"
                      >
                        {moodEntry.triggers.map(trigger => (
                          <motion.div
                            key={trigger}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Badge variant="destructive" className="flex items-center space-x-2 px-3 py-1">
                              <span>{trigger}</span>
                              <button
                                type="button"
                                onClick={() => removeTrigger(trigger)}
                                className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Custom Trigger */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      placeholder="Add custom trigger..."
                      className="flex-1 p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomTrigger())}
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleCustomTrigger}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Notes */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>Additional Notes</span>
            </label>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-1 rounded-lg border border-pink-200">
              <Textarea
                value={moodEntry.notes}
                onChange={(e) => setMoodEntry(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How are you feeling? Any thoughts or observations about your mood today?"
                className="min-h-[120px] border-0 bg-transparent focus:ring-0 resize-none"
              />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Save Mood Entry</span>
                  </div>
                )}
              </Button>
            </motion.div>
          </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
