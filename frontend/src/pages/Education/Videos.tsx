import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Play, Clock, User, ThumbsUp, 
  Plus, Edit, Trash2, Eye, Share2, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contentService } from '@/services/contentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import VideoPlayer from '@/components/Content/VideoPlayer';
import VideoThumbnail from '@/components/Content/VideoThumbnail';
import VideoGrid from '@/components/Content/VideoGrid';
import VideoModal from '@/components/Content/VideoModal';

interface Video {
  id: number;
  title: string;
  description: string;
  instructor: string;
  category: string;
  tags: string[];
  duration: number; // in minutes
  publishedAt: string;
  updatedAt: string;
  isPublished: boolean;
  views: number;
  likes: number;
  difficulty: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  isLiked?: boolean;
  shareCount?: number;
}

const Videos: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const categories = [
    'All', 'Meditation', 'Breathing Exercises', 'Cognitive Therapy', 
    'Mindfulness', 'Stress Management', 'Sleep Hygiene', 'Crisis Support'
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const videosData = await contentService.getVideos();
      // Handle both array and paginated response formats
      const videos = Array.isArray(videosData) ? videosData : (videosData.results || []);
      
      // Map backend fields to frontend interface
      const mappedVideos = videos.map((video: any) => ({
        ...video,
        instructor: video.author_name || video.author || 'Unknown Instructor',
        category: video.category_name || video.category || 'General',
        duration: Math.ceil((video.duration_seconds || 300) / 60), // Convert seconds to minutes
        publishedAt: video.published_at,
        updatedAt: video.updated_at,
        isPublished: video.is_published,
        views: video.view_count || 0,
        likes: video.like_count || 0,
        difficulty: video.difficulty_level || 'beginner',
        isLiked: video.isLiked || false,
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_image
      }));
      
      setVideos(mappedVideos);
    } catch (error) {
      console.error('Failed to load videos:', error);
      setVideos([]);
      toast({
        title: 'Error',
        description: 'Failed to load videos. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = Array.isArray(videos) ? videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || video.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  }) : [];

  const handleLikeVideo = async (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    const isCurrentlyLiked = video?.isLiked;
    
    try {
      // Optimistic update for better UX
      setVideos(prev => Array.isArray(prev) ? prev.map(video => 
        video.id === videoId 
          ? { 
              ...video, 
              likes: isCurrentlyLiked 
                ? Math.max((video.likes || 1) - 1, 0)
                : (video.likes || 0) + 1,
              isLiked: !isCurrentlyLiked 
            }
          : video
      ) : []);
      
      // Try to save like to database
      try {
        const response = await fetch(`/api/content/videos/${videoId}/like/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ liked: !isCurrentlyLiked }),
        });

        if (response.ok) {
          const updatedVideo = await response.json();
          // Update with actual data from server
          setVideos(prev => Array.isArray(prev) ? prev.map(video => 
            video.id === videoId ? { ...video, ...updatedVideo } : video
          ) : []);
        } else {
          console.warn('Video like API endpoint not available, using local state only');
        }
      } catch (apiError) {
        console.warn('Video like API endpoint not available, using local state only:', apiError);
        // Continue with optimistic update - don't show error to user
      }
      
      toast({
        title: isCurrentlyLiked ? 'Video Unliked' : 'Video Liked',
        description: 'Thank you for your feedback!',
      });
      
    } catch (error) {
      console.error('Failed to like video:', error);
      
      // Revert optimistic update on error
      setVideos(prev => Array.isArray(prev) ? prev.map(video => 
        video.id === videoId 
          ? { ...video, likes: video.likes, isLiked: isCurrentlyLiked }
          : video
      ) : []);
      
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleWatchVideo = async (video: Video) => {
    setSelectedVideo(video);
    setIsWatching(true);
    
    // Optimistically update view count
    setVideos(prev => Array.isArray(prev) ? prev.map(v => 
      v.id === video.id 
        ? { ...v, views: (v.views || 0) + 1 }
        : v
    ) : []);
    
    // Track video view in backend
    try {
      await fetch(`/api/content/videos/${video.id}/view/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.warn('Video view tracking API endpoint not available:', error);
      // Continue without showing error to user
    }
  };

  const handleShareVideo = async (video: Video) => {
    const shareData = {
      title: video.title,
      text: video.description,
      url: `${window.location.origin}/education/videos/${video.id}`,
    };

    try {
      // Use Web Share API if available (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
        
        // Track share in database
        try {
          await fetch(`/api/content/videos/${video.id}/share/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ method: 'native_share' }),
          });
        } catch (trackError) {
          console.warn('Video share tracking API endpoint not available:', trackError);
        }
        
        toast({
          title: 'Video Shared',
          description: 'Thank you for sharing this video!',
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        
        // Track share in database
        try {
          await fetch(`/api/content/videos/${video.id}/share/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ method: 'copy_link' }),
          });
        } catch (trackError) {
          console.warn('Video share tracking API endpoint not available:', trackError);
        }
        
        toast({
          title: 'Link Copied',
          description: 'Video link copied to clipboard!',
        });
      }
    } catch (error) {
      console.error('Failed to share video:', error);
      
      // Fallback: Try to copy link
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Link Copied',
          description: 'Video link copied to clipboard!',
        });
      } catch (clipboardError) {
        toast({
          title: 'Share Failed',
          description: 'Unable to share video. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageVideos = user?.role === 'admin' || user?.role === 'guide';

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
                Educational Videos
              </h1>
              <p className="text-gray-600">
                Guided exercises and educational content for mental wellness
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search videos..."
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
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Videos Grid */}
        <VideoGrid
          videos={filteredVideos}
          loading={loading}
          canManageVideos={canManageVideos}
          onWatchVideo={handleWatchVideo}
          onLikeVideo={handleLikeVideo}
          onShareVideo={handleShareVideo}
          onEditVideo={(video) => {
            // TODO: Implement edit functionality
            console.log('Edit video:', video.id);
          }}
          onDeleteVideo={(videoId) => {
            // TODO: Implement delete functionality
            console.log('Delete video:', videoId);
          }}
        />
      </motion.div>

      {/* Enhanced Video Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={isWatching}
        onClose={() => setIsWatching(false)}
        onLike={handleLikeVideo}
        onShare={handleShareVideo}
      />
    </div>
  );
};

export default Videos;
