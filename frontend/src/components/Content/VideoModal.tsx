import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Clock, Eye, ThumbsUp, Share2, X
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';

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

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (videoId: number) => void;
  onShare: (video: Video) => void;
}

const VideoModal: React.FC<VideoModalProps> = ({
  video,
  isOpen,
  onClose,
  onLike,
  onShare
}) => {
  if (!video) return null;

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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </Button>

          <ScrollArea className="max-h-[95vh]">
            <div className="p-6 space-y-6">
              {/* Video Title */}
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 pr-12">
                  {video.title}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Watch this educational video and interact with the content
                </DialogDescription>
              </DialogHeader>

              {/* Video Player */}
              <VideoPlayer
                videoUrl={video.videoUrl || ''}
                title={video.title}
                thumbnailUrl={video.thumbnailUrl}
                autoPlay={false}
                controls={true}
                onPlay={() => console.log('Video started playing')}
                onPause={() => console.log('Video paused')}
                onEnded={() => console.log('Video ended')}
                onTimeUpdate={(currentTime, duration) => {
                  // Optional: Track video progress for analytics
                  console.log(`Video progress: ${currentTime}/${duration}`);
                }}
                className="rounded-lg"
              />

              {/* Video Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-b pb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{video.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(video.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{(video.views || 0).toLocaleString()} views</span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {video.category}
                </Badge>
                <Badge className={getDifficultyColor(video.difficulty)}>
                  {video.difficulty}
                </Badge>
              </div>

              {/* Video Actions */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLike(video.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      video.isLiked
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${video.isLiked ? 'fill-current' : ''}`} />
                    <span>{video.isLiked ? 'Liked' : 'Like'}</span>
                    <span className="text-sm">({video.likes || 0})</span>
                  </button>
                  
                  <button 
                    onClick={() => onShare(video)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  Published {formatDate(video.publishedAt)}
                </div>
              </div>

              {/* Video Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">About this video</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Video Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-900">Video Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Duration:</span> {formatDuration(video.duration)}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {video.category}
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> {video.difficulty}
                  </div>
                  <div>
                    <span className="font-medium">Views:</span> {(video.views || 0).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Published:</span> {formatDate(video.publishedAt)}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {formatDate(video.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
