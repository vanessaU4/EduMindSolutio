import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Clock, User, ThumbsUp, Eye, Share2, Edit, Trash2
} from 'lucide-react';
import VideoThumbnail from './VideoThumbnail';

interface Video {
  id: number;
  title: string;
  description: string;
  instructor: string;
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

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
  canManageVideos?: boolean;
  onWatchVideo: (video: Video) => void;
  onLikeVideo: (videoId: number) => void;
  onShareVideo: (video: Video) => void;
  onEditVideo?: (video: Video) => void;
  onDeleteVideo?: (videoId: number) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  loading = false,
  canManageVideos = false,
  onWatchVideo,
  onLikeVideo,
  onShareVideo,
  onEditVideo,
  onDeleteVideo
}) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
        <p className="text-gray-500">
          Try adjusting your search criteria or check back later for new content.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <VideoThumbnail
              videoUrl={video.videoUrl || ''}
              title={video.title}
              thumbnailUrl={video.thumbnailUrl}
              duration={video.duration * 60} // Convert minutes to seconds
              views={video.views}
              onClick={() => onWatchVideo(video)}
              className="rounded-t-lg"
            />
            
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge className={getDifficultyColor(video.difficulty)}>
                  {video.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight line-clamp-2">
                {video.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="truncate">{video.instructor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(video.duration)}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {video.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {video.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{video.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {(video.views || 0).toLocaleString()}
                  </div>
                  <button
                    onClick={() => onLikeVideo(video.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      video.isLiked 
                        ? 'text-blue-500 hover:text-blue-600' 
                        : 'hover:text-blue-500'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${video.isLiked ? 'fill-current' : ''}`} />
                    {video.likes || 0}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onWatchVideo(video)}
                    className="hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Watch
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onShareVideo(video)}
                    className="hover:bg-gray-100"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  {canManageVideos && (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onEditVideo?.(video)}
                        className="hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => onDeleteVideo?.(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default VideoGrid;
