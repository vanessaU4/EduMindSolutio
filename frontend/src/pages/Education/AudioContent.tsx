import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Play, Pause, Clock, User, Heart, 
  Plus, Edit, Trash2, Eye, Download, Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contentService, AudioContent as AudioContentType, extractArrayFromResponse } from '@/services/contentService';
import AudioGrid from '@/components/Content/AudioGrid';
import AudioModal from '@/components/Content/AudioModal';

// Using AudioContent type from contentService

const AudioContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [audioContent, setAudioContent] = useState<AudioContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<AudioContentType | null>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);

  const categories = [
    'All', 'Meditation', 'Sleep Stories', 'Guided Imagery', 
    'Podcasts', 'Affirmations', 'Nature Sounds', 'Breathing Exercises'
  ];

  const types = ['All', 'meditation', 'podcast', 'exercise', 'story'];

  // Mock audio content data
  const mockAudioContent: any[] = [
    {
      id: 1,
      title: 'Deep Sleep Meditation',
      description: 'A calming meditation to help you fall asleep peacefully.',
      narrator: 'Sarah Williams',
      category: 'Meditation',
      tags: ['sleep', 'meditation', 'relaxation'],
      duration: 20,
      publishedAt: '2024-10-01',
      updatedAt: '2024-10-01',
      isPublished: true,
      plays: 3421,
      likes: 287,
      difficulty: 'Beginner',
      audioUrl: '/audio/deep-sleep-meditation.mp3',
      type: 'meditation',
      thumbnail_image: 'https://picsum.photos/400/300?random=1'
    },
    {
      id: 2,
      title: 'Anxiety Relief Breathing Exercise',
      description: 'Guided breathing techniques to reduce anxiety and promote calm.',
      narrator: 'Dr. Michael Chen',
      category: 'Breathing Exercises',
      tags: ['anxiety', 'breathing', 'calm'],
      duration: 8,
      publishedAt: '2024-09-28',
      updatedAt: '2024-09-28',
      isPublished: true,
      plays: 2156,
      likes: 198,
      difficulty: 'Beginner',
      audioUrl: '/audio/anxiety-breathing.mp3',
      type: 'exercise',
      thumbnail_image: 'https://picsum.photos/400/300?random=2'
    },
    {
      id: 3,
      title: 'Mental Health Matters Podcast - Episode 12',
      description: 'Discussion on coping strategies for workplace stress.',
      narrator: 'Dr. Lisa Martinez & Dr. James Wilson',
      category: 'Podcasts',
      tags: ['workplace', 'stress', 'coping'],
      duration: 35,
      publishedAt: '2024-09-25',
      updatedAt: '2024-09-25',
      isPublished: true,
      plays: 1876,
      likes: 143,
      difficulty: 'Intermediate',
      audioUrl: '/audio/podcast-episode-12.mp3',
      type: 'podcast',
      thumbnail_image: 'https://picsum.photos/400/300?random=3'
    },
    {
      id: 4,
      title: 'Forest Rain Sleep Story',
      description: 'A peaceful story set in a forest during gentle rainfall.',
      narrator: 'Emma Thompson',
      category: 'Sleep Stories',
      tags: ['sleep', 'story', 'nature'],
      duration: 25,
      publishedAt: '2024-09-20',
      updatedAt: '2024-09-20',
      isPublished: true,
      plays: 4102,
      likes: 321,
      difficulty: 'Beginner',
      audioUrl: '/audio/forest-rain-story.mp3',
      type: 'story',
      thumbnail_image: 'https://picsum.photos/400/300?random=4'
    },
    {
      id: 5,
      title: 'Daily Affirmations for Self-Worth',
      description: 'Positive affirmations to boost self-esteem and confidence.',
      narrator: 'Dr. Patricia Davis',
      category: 'Affirmations',
      tags: ['self-worth', 'confidence', 'positive thinking'],
      duration: 12,
      publishedAt: '2024-09-18',
      updatedAt: '2024-09-18',
      isPublished: true,
      plays: 2743,
      likes: 234,
      difficulty: 'Beginner',
      audioUrl: '/audio/daily-affirmations.mp3',
      type: 'meditation',
      thumbnail_image: 'https://picsum.photos/400/300?random=5'
    }
  ];

  useEffect(() => {
    loadAudioContent();
  }, []);

  const loadAudioContent = async () => {
    setLoading(true);
    try {
      const response = await contentService.getAudioContent();
      const audioArray = extractArrayFromResponse(response);
      
      // Map backend fields to frontend interface
      const mappedAudio = audioArray.map((audio: any) => ({
        ...audio,
        author_name: audio.author_name || audio.author || 'Unknown Author',
        category_name: audio.category_name || audio.category || 'General',
        isLiked: audio.isLiked || false
      }));
      
      setAudioContent(mappedAudio);
    } catch (error) {
      console.error('Failed to load audio content:', error);
      // Fallback to mock data for demo
      setAudioContent(mockAudioContent as any);
      toast({
        title: 'Demo Mode',
        description: 'Displaying sample audio content. Backend integration in progress.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = audioContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || 
                           content.category_name === selectedCategory || 
                           content.category === selectedCategory;
    const matchesType = selectedType === 'All' || content.audio_type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handlePlay = (audio: AudioContentType) => {
    setPlayingId(audio.id);
    // Update play count optimistically
    setAudioContent(prev => prev.map(a => 
      a.id === audio.id 
        ? { ...a, play_count: (a.play_count || 0) + 1 }
        : a
    ));
  };

  const handlePause = () => {
    setPlayingId(null);
  };

  const handleLike = async (audioId: number) => {
    const audio = audioContent.find(a => a.id === audioId);
    const isCurrentlyLiked = audio?.isLiked;
    
    try {
      // Optimistic update
      setAudioContent(prev => prev.map(audio => 
        audio.id === audioId 
          ? { 
              ...audio, 
              like_count: isCurrentlyLiked 
                ? Math.max((audio.like_count || 1) - 1, 0)
                : (audio.like_count || 0) + 1,
              isLiked: !isCurrentlyLiked 
            }
          : audio
      ));
      
      // Try to save to backend
      try {
        await contentService.likeAudioContent(audioId);
      } catch (apiError) {
        console.warn('Audio like API not available, using local state only');
      }
      
      toast({
        title: isCurrentlyLiked ? 'Audio Unliked' : 'Audio Liked',
        description: 'Thank you for your feedback!',
      });
    } catch (error) {
      // Revert on error
      setAudioContent(prev => prev.map(audio => 
        audio.id === audioId 
          ? { ...audio, like_count: audio.like_count, isLiked: isCurrentlyLiked }
          : audio
      ));
      
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async (audio: AudioContentType) => {
    const shareData = {
      title: audio.title,
      text: audio.description,
      url: `${window.location.origin}/education/audio/${audio.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await contentService.shareAudioContent(audio.id, 'native_share');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        await contentService.shareAudioContent(audio.id, 'copy_link');
        toast({
          title: 'Link Copied',
          description: 'Audio link copied to clipboard!',
        });
      }
    } catch (error) {
      console.error('Failed to share audio:', error);
      toast({
        title: 'Share Failed',
        description: 'Unable to share audio. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (audio: AudioContentType) => {
    const audioSource = audio.audio_file || audio.audio_url;
    if (audioSource) {
      try {
        const link = document.createElement('a');
        link.href = audioSource;
        link.download = `${audio.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
        link.target = '_blank'; // Open in new tab if direct download fails
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Download Started',
          description: `Downloading "${audio.title}"`,
        });
      } catch (error) {
        console.error('Download failed:', error);
        toast({
          title: 'Download Failed',
          description: 'Unable to download audio file. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'No Audio File',
        description: 'This audio content has no downloadable file.',
        variant: 'destructive',
      });
    }
  };

  const viewAudio = (audio: AudioContentType) => {
    setSelectedAudio(audio);
    setShowAudioModal(true);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'bg-purple-100 text-purple-800';
      case 'podcast': return 'bg-blue-100 text-blue-800';
      case 'exercise': return 'bg-green-100 text-green-800';
      case 'story': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageContent = user?.role === 'admin' || user?.role === 'guide';

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
          <div className="mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Audio Content
              </h1>
              <p className="text-gray-600">
                Guided meditations, podcasts, and audio exercises for mental wellness
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search audio content..."
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

        {/* Audio Content Grid */}
        <AudioGrid
          audioContent={filteredContent as any}
          loading={loading}
          canManageContent={canManageContent}
          playingId={playingId}
          onPlay={handlePlay as any}
          onPause={handlePause}
          onLike={handleLike}
          onShare={handleShare as any}
          onDownload={handleDownload as any}
        />
      </motion.div>

      {/* Audio Detail Modal */}
      <AudioModal
        audio={selectedAudio as any}
        isOpen={showAudioModal}
        onClose={() => {
          setShowAudioModal(false);
          setSelectedAudio(null);
        }}
        onLike={handleLike}
        onShare={handleShare as any}
        onDownload={handleDownload as any}
      />
    </div>
  );
};

export default AudioContent;
