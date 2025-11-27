import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Heart, 
  Brain, 
  Moon, 
  Zap,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  RefreshCw,
  Sparkles,
  Target,
  Smile,
  Activity,
  Clock,
  Tag,
  TrendingUp,
  Star,
  CheckCircle2
} from 'lucide-react';
import { wellnessService } from '@/services/wellnessService';
import { toast } from 'sonner';

interface WellnessTip {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: number;
  tags: string[];
  helpful_count: number;
  is_helpful: boolean | null;
  is_bookmarked: boolean;
  created_at: string;
}

const WellnessTips: React.FC = () => {
  const [tips, setTips] = useState<WellnessTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarked' | 'trending'>('all');

  const categories = [
    { id: 'all', name: 'All Tips', icon: Lightbulb, color: 'bg-blue-100 text-blue-600' },
    { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: 'bg-purple-100 text-purple-600' },
    { id: 'physical', name: 'Physical Health', icon: Heart, color: 'bg-red-100 text-red-600' },
    { id: 'sleep', name: 'Sleep', icon: Moon, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'energy', name: 'Energy', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'mood', name: 'Mood', icon: Smile, color: 'bg-green-100 text-green-600' },
    { id: 'productivity', name: 'Productivity', icon: Target, color: 'bg-orange-100 text-orange-600' },
  ];

  useEffect(() => {
    loadTips();
  }, []);

  const loadTips = async () => {
    try {
      setLoading(true);
      const data = await wellnessService.getWellnessTips();
      setTips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading wellness tips:', error);
      toast.error('Failed to load wellness tips');
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  const markTipHelpful = async (tipId: number, isHelpful: boolean) => {
    try {
      await wellnessService.markTipHelpful(tipId, isHelpful);
      setTips(tips.map(tip => 
        tip.id === tipId 
          ? { 
              ...tip, 
              is_helpful: isHelpful,
              helpful_count: isHelpful ? tip.helpful_count + 1 : Math.max(0, tip.helpful_count - 1)
            }
          : tip
      ));
      toast.success(isHelpful ? 'Marked as helpful!' : 'Feedback recorded');
    } catch (error) {
      console.error('Error marking tip as helpful:', error);
      toast.error('Failed to record feedback');
    }
  };

  const toggleBookmark = (tipId: number) => {
    setTips(tips.map(tip => 
      tip.id === tipId 
        ? { ...tip, is_bookmarked: !tip.is_bookmarked }
        : tip
    ));
    toast.success('Bookmark updated');
  };

  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || tip.difficulty_level === selectedDifficulty;
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'bookmarked' && tip.is_bookmarked) ||
                      (activeTab === 'trending' && tip.helpful_count > 5);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesTab;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-600';
      case 'intermediate': return 'bg-yellow-100 text-yellow-600';
      case 'advanced': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
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
                Wellness Tips
              </h1>
              <p className="text-gray-600 text-lg">Discover personalized tips to enhance your well-being</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1 text-sm border-purple-200 text-purple-700">
                <Sparkles className="w-4 h-4 mr-1" />
                {tips.length} Tips Available
              </Badge>
              <Button 
                onClick={loadTips}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tips, tags, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>All Tips</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4" />
              <span>Bookmarked</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredTips.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="text-center py-12">
                    <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {activeTab === 'bookmarked' ? 'No Bookmarked Tips' : 
                       activeTab === 'trending' ? 'No Trending Tips' : 'No Tips Found'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {activeTab === 'bookmarked' ? 'Start bookmarking tips you find helpful' :
                       activeTab === 'trending' ? 'Check back later for trending content' :
                       'Try adjusting your search or filters'}
                    </p>
                    {activeTab === 'all' && (
                      <Button onClick={loadTips}>
                        Reload Tips
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                              {tip.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge className={getDifficultyColor(tip.difficulty_level)}>
                                {tip.difficulty_level}
                              </Badge>
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{tip.estimated_time}min</span>
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(tip.id)}
                            className={tip.is_bookmarked ? 'text-yellow-600' : 'text-gray-400'}
                          >
                            <Bookmark className={`w-4 h-4 ${tip.is_bookmarked ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4 line-clamp-3">{tip.content}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {tip.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {tip.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{tip.tags.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markTipHelpful(tip.id, true)}
                              className={`${tip.is_helpful === true ? 'text-green-600 bg-green-50' : 'text-gray-400'}`}
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {tip.helpful_count}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markTipHelpful(tip.id, false)}
                              className={`${tip.is_helpful === false ? 'text-red-600 bg-red-50' : 'text-gray-400'}`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span>Your Wellness Journey</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{tips.filter(t => t.is_helpful === true).length}</div>
                  <div className="text-sm text-gray-600">Tips Found Helpful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{tips.filter(t => t.is_bookmarked).length}</div>
                  <div className="text-sm text-gray-600">Bookmarked Tips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{new Set(tips.map(t => t.category)).size}</div>
                  <div className="text-sm text-gray-600">Categories Explored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{tips.reduce((sum, t) => sum + t.estimated_time, 0)}</div>
                  <div className="text-sm text-gray-600">Total Minutes Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WellnessTips;
