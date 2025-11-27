import React, { useState } from 'react';
import { Play, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VideoThumbnailProps {
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  views?: number;
  isHovered?: boolean;
  onClick?: () => void;
  className?: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  videoUrl,
  title,
  thumbnailUrl,
  duration,
  views = 0,
  onClick,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate thumbnail from video URL if not provided
  const getVideoThumbnail = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      
      // YouTube thumbnail
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        let videoId = '';
        if (urlObj.hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get('v') || '';
        }
        
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      // Vimeo thumbnail (would need API call in real implementation)
      if (urlObj.hostname.includes('vimeo.com')) {
        // For now, return null - in production you'd fetch from Vimeo API
        return null;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (viewCount: number): string => {
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M`;
    }
    if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K`;
    }
    return viewCount.toString();
  };

  const displayThumbnail = thumbnailUrl || getVideoThumbnail(videoUrl);

  return (
    <div 
      className={`relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Image */}
      {displayThumbnail && !imageError ? (
        <img
          src={displayThumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <Play className="w-12 h-12 text-blue-600 opacity-50" />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
        <div className={`transform transition-all duration-300 ${
          isHovered ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}>
          <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-90 rounded-full shadow-lg">
            <Play className="w-6 h-6 text-gray-800 ml-1" />
          </div>
        </div>
      </div>

      {/* Duration Badge */}
      <div className="absolute bottom-2 right-2">
        <Badge variant="secondary" className="bg-black bg-opacity-75 text-white text-xs px-2 py-1">
          <Clock className="w-3 h-3 mr-1" />
          {formatDuration(duration)}
        </Badge>
      </div>

      {/* Views Badge */}
      {views > 0 && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black bg-opacity-75 text-white text-xs px-2 py-1">
            <Eye className="w-3 h-3 mr-1" />
            {formatViews(views)}
          </Badge>
        </div>
      )}

      {/* Hover Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient overlay for better text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Subtle border highlight */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-lg transition-colors duration-300" />
      </div>
    </div>
  );
};

export default VideoThumbnail;
