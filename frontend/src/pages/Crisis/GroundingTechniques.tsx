import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Play, Pause, Clock, Target, Heart, 
  Plus, Edit, Trash2, Eye, Bookmark, Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GroundingTechnique {
  id: number;
  title: string;
  description: string;
  category: string;
  type: '5-4-3-2-1' | 'breathing' | 'physical' | 'cognitive' | 'sensory' | 'movement';
  duration: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  instructions: string[];
  benefits: string[];
  whenToUse: string[];
  isGuided: boolean;
  audioUrl?: string;
  videoUrl?: string;
  createdBy: string;
  isBookmarked: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
}

const GroundingTechniques: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [techniques, setTechniques] = useState<GroundingTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [playingId, setPlayingId] = useState<number | null>(null);

  const categories = [
    'All', 'Anxiety Relief', 'Panic Attack', 'PTSD', 'General Stress', 
    'Sleep Preparation', 'Workplace', 'Emergency'
  ];

  const types = ['All', '5-4-3-2-1', 'breathing', 'physical', 'cognitive', 'sensory', 'movement'];

  // Mock grounding techniques data
  const mockTechniques: GroundingTechnique[] = [
    {
      id: 1,
      title: '5-4-3-2-1 Grounding Technique',
      description: 'A simple sensory technique to bring you back to the present moment.',
      category: 'Anxiety Relief',
      type: '5-4-3-2-1',
      duration: 5,
      difficulty: 'Easy',
      instructions: [
        'Name 5 things you can see around you',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ],
      benefits: [
        'Reduces anxiety quickly',
        'Brings focus to the present',
        'Can be done anywhere',
        'No equipment needed'
      ],
      whenToUse: [
        'During panic attacks',
        'When feeling overwhelmed',
        'Before stressful situations',
        'When experiencing dissociation'
      ],
      isGuided: true,
      audioUrl: '/audio/5-4-3-2-1-guided.mp3',
      createdBy: 'Dr. Sarah Johnson',
      isBookmarked: false,
      usageCount: 1247,
      rating: 4.8,
      tags: ['anxiety', 'panic', 'sensory', 'quick relief']
    },
    {
      id: 2,
      title: 'Box Breathing (4-4-4-4)',
      description: 'A structured breathing pattern to calm the nervous system.',
      category: 'Panic Attack',
      type: 'breathing',
      duration: 3,
      difficulty: 'Easy',
      instructions: [
        'Inhale for 4 counts',
        'Hold your breath for 4 counts',
        'Exhale for 4 counts',
        'Hold empty for 4 counts',
        'Repeat for 5-10 cycles'
      ],
      benefits: [
        'Activates parasympathetic nervous system',
        'Reduces heart rate',
        'Improves focus',
        'Decreases stress hormones'
      ],
      whenToUse: [
        'During panic attacks',
        'Before important meetings',
        'When feeling angry',
        'To improve sleep'
      ],
      isGuided: true,
      audioUrl: '/audio/box-breathing.mp3',
      createdBy: 'Dr. Michael Chen',
      isBookmarked: true,
      usageCount: 892,
      rating: 4.6,
      tags: ['breathing', 'panic', 'stress', 'focus']
    },
    {
      id: 3,
      title: 'Progressive Muscle Relaxation',
      description: 'Systematically tense and release muscle groups to reduce physical tension.',
      category: 'General Stress',
      type: 'physical',
      duration: 15,
      difficulty: 'Medium',
      instructions: [
        'Start with your toes - tense for 5 seconds, then release',
        'Move to your calves - tense and release',
        'Continue with thighs, abdomen, hands, arms',
        'Tense shoulders, neck, and face muscles',
        'Notice the contrast between tension and relaxation'
      ],
      benefits: [
        'Reduces muscle tension',
        'Improves body awareness',
        'Promotes deep relaxation',
        'Helps with sleep'
      ],
      whenToUse: [
        'Before bedtime',
        'During chronic stress',
        'When experiencing physical tension',
        'As part of daily routine'
      ],
      isGuided: true,
      audioUrl: '/audio/progressive-muscle-relaxation.mp3',
      createdBy: 'Dr. Lisa Martinez',
      isBookmarked: false,
      usageCount: 634,
      rating: 4.7,
      tags: ['muscle tension', 'relaxation', 'sleep', 'stress']
    },
    {
      id: 4,
      title: 'Cognitive Reframing',
      description: 'Challenge and reframe negative thoughts to reduce distress.',
      category: 'PTSD',
      type: 'cognitive',
      duration: 10,
      difficulty: 'Advanced',
      instructions: [
        'Identify the negative thought',
        'Ask: "Is this thought realistic?"',
        'Look for evidence for and against the thought',
        'Create a more balanced, realistic thought',
        'Practice the new thought pattern'
      ],
      benefits: [
        'Reduces negative thinking patterns',
        'Improves emotional regulation',
        'Builds resilience',
        'Enhances problem-solving'
      ],
      whenToUse: [
        'When stuck in negative thoughts',
        'During depressive episodes',
        'After traumatic reminders',
        'In therapy sessions'
      ],
      isGuided: false,
      createdBy: 'Dr. James Wilson',
      isBookmarked: true,
      usageCount: 423,
      rating: 4.5,
      tags: ['cognitive', 'thoughts', 'reframing', 'therapy']
    },
    {
      id: 5,
      title: 'Cold Water Face Technique',
      description: 'Use cold water to activate the dive response and quickly calm anxiety.',
      category: 'Emergency',
      type: 'physical',
      duration: 2,
      difficulty: 'Easy',
      instructions: [
        'Fill a bowl with cold water (50-60°F)',
        'Hold your breath and immerse your face for 30 seconds',
        'Or hold a cold pack over your eyes and cheeks',
        'Breathe normally when you lift your head',
        'Repeat if needed'
      ],
      benefits: [
        'Rapidly reduces heart rate',
        'Activates vagus nerve',
        'Interrupts panic response',
        'Works within seconds'
      ],
      whenToUse: [
        'During intense panic attacks',
        'When other techniques aren\'t working',
        'For immediate relief',
        'In emergency situations'
      ],
      isGuided: false,
      createdBy: 'Dr. Patricia Davis',
      isBookmarked: false,
      usageCount: 312,
      rating: 4.4,
      tags: ['emergency', 'panic', 'quick', 'physical']
    }
  ];

  useEffect(() => {
    loadTechniques();
  }, []);

  const loadTechniques = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTechniques(mockTechniques);
      
      toast({
        title: 'Demo Mode',
        description: 'Displaying sample grounding techniques. Backend integration in progress.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load grounding techniques.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTechniques = techniques.filter(technique => {
    const matchesSearch = technique.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technique.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technique.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || technique.category === selectedCategory;
    const matchesType = selectedType === 'All' || technique.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handlePlayPause = (techniqueId: number) => {
    if (playingId === techniqueId) {
      setPlayingId(null);
      toast({
        title: 'Audio Paused',
        description: 'Guided technique paused.',
      });
    } else {
      setPlayingId(techniqueId);
      setTechniques(prev => prev.map(technique => 
        technique.id === techniqueId 
          ? { ...technique, usageCount: technique.usageCount + 1 }
          : technique
      ));
      toast({
        title: 'Starting Guided Technique',
        description: 'Audio guidance would start here in full implementation.',
      });
    }
  };

  const handleBookmark = (techniqueId: number) => {
    setTechniques(prev => prev.map(technique => 
      technique.id === techniqueId 
        ? { ...technique, isBookmarked: !technique.isBookmarked }
        : technique
    ));
    
    const technique = techniques.find(t => t.id === techniqueId);
    toast({
      title: technique?.isBookmarked ? 'Bookmark Removed' : 'Technique Bookmarked',
      description: technique?.isBookmarked ? 'Removed from your saved techniques.' : 'Added to your saved techniques.',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '5-4-3-2-1': return 'bg-purple-100 text-purple-800';
      case 'breathing': return 'bg-blue-100 text-blue-800';
      case 'physical': return 'bg-green-100 text-green-800';
      case 'cognitive': return 'bg-orange-100 text-orange-800';
      case 'sensory': return 'bg-pink-100 text-pink-800';
      case 'movement': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageTechniques = user?.role === 'admin' || user?.role === 'guide';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Grounding Techniques
              </h1>
              <p className="text-gray-600">
                Evidence-based techniques to help you stay present and manage overwhelming emotions
              </p>
            </div>
            {canManageTechniques && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Technique
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search techniques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Techniques Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTechniques.map((technique) => (
            <Card key={technique.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getDifficultyColor(technique.difficulty)}>
                      {technique.difficulty}
                    </Badge>
                    <Badge className={getTypeColor(technique.type)}>
                      {technique.type}
                    </Badge>
                    <Badge variant="outline">{technique.category}</Badge>
                    {technique.isGuided && (
                      <Badge className="bg-blue-100 text-blue-800">Guided</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookmark(technique.id)}
                      className={`p-1 rounded ${technique.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    {canManageTechniques && (
                      <>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl">{technique.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {technique.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {technique.usageCount} uses
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {technique.rating}/5
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">{technique.description}</p>
                
                {/* Instructions */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                  <ol className="space-y-1">
                    {technique.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm text-gray-600 flex">
                        <span className="font-medium text-blue-600 mr-2">{index + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                  <div className="flex flex-wrap gap-1">
                    {technique.benefits.slice(0, 3).map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* When to Use */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">When to Use:</h4>
                  <div className="flex flex-wrap gap-1">
                    {technique.whenToUse.slice(0, 2).map((situation, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {situation}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {technique.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    By {technique.createdBy}
                  </div>
                  
                  <div className="flex gap-2">
                    {technique.isGuided && technique.audioUrl && (
                      <Button
                        onClick={() => handlePlayPause(technique.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {playingId === technique.id ? (
                          <Pause className="w-4 h-4 mr-1" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        {playingId === technique.id ? 'Pause' : 'Start'}
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Heart className="w-4 h-4 mr-1" />
                      Try It
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTechniques.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No techniques found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or check back later for new techniques.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GroundingTechniques;
