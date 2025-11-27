import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Clock, Eye, Heart, Share2, X, Download, Music, Headphones, 
  Mic, BookOpen, Volume2, Calendar, Tag
} from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface AudioContent {
  id: number;
  title: string;
  description: string;
  audio_type: 'meditation' | 'podcast' | 'music' | 'exercise' | 'story';
  audio_file?: string | null;
  audio_url: string;
  duration_seconds: number;
  tags: string[];
  author: string;
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

interface AudioModalProps {
  audio: AudioContent | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (audioId: number) => void;
  onShare: (audio: AudioContent) => void;
  onDownload?: (audio: AudioContent) => void;
}

const AudioModal: React.FC<AudioModalProps> = ({
  audio,
  isOpen,
  onClose,
  onLike,
  onShare,
  onDownload
}) => {
  if (!audio) return null;

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return <Volume2 className="w-5 h-5" />;
      case 'podcast': return <Mic className="w-5 h-5" />;
      case 'music': return <Music className="w-5 h-5" />;
      case 'exercise': return <Headphones className="w-5 h-5" />;
      case 'story': return <BookOpen className="w-5 h-5" />;
      default: return <Volume2 className="w-5 h-5" />;
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getAudioSource = () => {
    return audio.audio_file || audio.audio_url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 overflow-hidden">
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
              {/* Header */}
              <DialogHeader>
                <div className="flex items-start gap-4 pr-12">
                  <img
                    src={audio.thumbnail_image || 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Audio+Content'}
                    alt={audio.title}
                    className="w-20 h-20 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Audio+Content';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {audio.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mb-3">
                      Listen to this audio content and explore the details
                    </DialogDescription>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={`${getTypeColor(audio.audio_type)} flex items-center gap-1`}>
                        {getTypeIcon(audio.audio_type)}
                        {audio.audio_type.charAt(0).toUpperCase() + audio.audio_type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Audio Player */}
              <AudioPlayer
                audioUrl={getAudioSource()}
                title={audio.title}
                artist={audio.author_name || audio.author}
                thumbnailUrl={audio.thumbnail_image || undefined}
                duration={audio.duration_seconds}
                onLike={() => onLike(audio.id)}
                onShare={() => onShare(audio)}
                showDownload={!!onDownload}
                className="bg-gray-50"
              />

              {/* Audio Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Author:</span>
                    <span>{audio.author_name || audio.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Duration:</span>
                    <span>{formatDuration(audio.duration_seconds)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">Plays:</span>
                    <span>{(audio.play_count || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">Likes:</span>
                    <span>{(audio.like_count || 0).toLocaleString()}</span>
                  </div>
                  {audio.published_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Published:</span>
                      <span>{formatDate(audio.published_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Updated:</span>
                    <span>{formatDate(audio.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Audio Actions */}
              <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLike(audio.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      audio.isLiked
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${audio.isLiked ? 'fill-current' : ''}`} />
                    <span>{audio.isLiked ? 'Liked' : 'Like'}</span>
                    <span className="text-sm">({audio.like_count || 0})</span>
                  </button>
                  
                  <button 
                    onClick={() => onShare(audio)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  {onDownload && (
                    <button 
                      onClick={() => onDownload(audio)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Audio Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">About this audio</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {audio.description}
                  </p>
                </div>
              </div>

              {/* Audio Tags */}
              {audio.tags && audio.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {audio.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Technical Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Type:</span> {audio.audio_type}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {formatDuration(audio.duration_seconds)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {audio.is_published ? 'Published' : 'Draft'}
                  </div>
                  <div>
                    <span className="font-medium">Audio ID:</span> {audio.id}
                  </div>
                  <div>
                    <span className="font-medium">Source:</span> {audio.audio_file ? 'Uploaded File' : 'External URL'}
                  </div>
                </div>
              </div>

              {/* Transcript Section (placeholder) */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Transcript</h4>
                <p className="text-sm text-blue-700">
                  Transcript feature coming soon. This will display the full text transcript of the audio content for accessibility.
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioModal;
