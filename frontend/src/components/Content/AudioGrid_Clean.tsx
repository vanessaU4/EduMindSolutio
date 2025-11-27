import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Clock, User, Heart, Eye, Volume2, Music, Headphones, Mic, BookOpen
} from 'lucide-react';

interface AudioContentItem {
  id: number;
  title: string;
  description: string;
  audio_type: 'meditation' | 'podcast' | 'music' | 'exercise' | 'story';
  audio_file?: string | null;
  audio_url: string;
  duration_seconds: number;
  tags: string[];
  author: string | number;
  author_name?: string;
  thumbnail_image?: string | null;
  play_count: number;
  like_count: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  isLiked?: boolean;
}

interface AudioGridProps {
  audioContent: AudioContentItem[];
  loading?: boolean;
  canManageContent?: boolean;
  playingId?: number | null;
  onPlay: (audio: AudioContentItem) => void;
  onPause: () => void;
  onLike: (audioId: number) => void;
  onShare: (audio: AudioContentItem) => void;
  onEdit?: (audio: AudioContentItem) => void;
  onDelete?: (audioId: number) => void;
  onDownload?: (audio: AudioContentItem) => void;
}

const AudioGrid: React.FC<AudioGridProps> = ({
  audioContent,
  loading = false,
  onPlay,
  onLike
}) => {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return <Volume2 className="w-4 h-4" />;
      case 'podcast': return <Mic className="w-4 h-4" />;
      case 'music': return <Music className="w-4 h-4" />;
      case 'exercise': return <Headphones className="w-4 h-4" />;
      case 'story': return <BookOpen className="w-4 h-4" />;
      default: return <Volume2 className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'bg-purple-100 text-purple-800';
      case 'podcast': return 'bg-blue-100 text-blue-800';
      case 'music': return 'bg-green-100 text-green-800';
      case 'exercise': return 'bg-orange-100 text-orange-800';
      case 'story': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (audioContent.length === 0) {
    return (
      <div className="text-center py-12">
        <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No audio content found</h3>
        <p className="text-gray-500">
          Try adjusting your search criteria or check back later for new content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {audioContent.map((audio, index) => (
        <motion.div
          key={audio.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-all duration-300 border border-gray-200 bg-white">
            <div className="p-4">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {audio.thumbnail_image ? (
                    <img 
                      src={audio.thumbnail_image} 
                      alt={audio.title}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
                      <Volume2 className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {audio.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getTypeColor(audio.audio_type)} flex items-center gap-1 text-xs`}>
                          {getTypeIcon(audio.audio_type)}
                          {audio.audio_type.charAt(0).toUpperCase() + audio.audio_type.slice(1)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDuration(audio.duration_seconds)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-3">
                    {audio.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="font-medium">{audio.author_name || audio.author}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{audio.play_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{audio.like_count || 0}</span>
                      </div>
                      <span className="text-gray-400">
                        {new Date(audio.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AudioGrid;
