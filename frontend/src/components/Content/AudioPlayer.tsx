import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, RotateCcw, SkipBack, SkipForward,
  Download, Share2, Heart, Clock, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AudioPlayerProps {
  audioUrl: string;
  audioFile?: string;
  title: string;
  artist?: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  autoPlay?: boolean;
  showControls?: boolean;
  showDownload?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onLike?: () => void;
  onShare?: () => void;
  className?: string;
  compact?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioFile,
  title,
  artist,
  thumbnailUrl,
  duration: providedDuration,
  autoPlay = false,
  showControls = true,
  showDownload = true,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onLike,
  onShare,
  className = '',
  compact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(providedDuration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Get the actual audio source
  const audioSource = audioFile || audioUrl;

  useEffect(() => {
    if (!audioSource) {
      setError('No audio source provided');
      setIsLoading(false);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime, audio.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handleError = () => {
      setError('Failed to load audio. Please check the audio source.');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    // Set initial volume
    audio.volume = volume;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioSource, volume, onPlay, onPause, onEnded, onTimeUpdate]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        setError('Failed to play audio. Please try again.');
      });
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
    
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMuted = !isMuted;
    audio.muted = newMuted;
    setIsMuted(newMuted);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const handleDownload = () => {
    if (audioSource) {
      const link = document.createElement('a');
      link.href = audioSource;
      link.download = `${title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  if (error) {
    return (
      <Card className={`p-4 bg-red-50 border-red-200 ${className}`}>
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Audio Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${className}`}>
        <audio ref={audioRef} src={audioSource} preload="metadata" />
        
        <Button
          size="sm"
          onClick={togglePlayPause}
          disabled={isLoading}
          className="w-10 h-10 rounded-full"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{title}</p>
          {artist && <p className="text-xs text-gray-500 truncate">{artist}</p>}
        </div>

        <div className="text-xs text-gray-500">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <audio ref={audioRef} src={audioSource} preload="metadata" />
      
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-16 h-16 rounded-lg object-cover bg-gray-200"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{title}</h3>
          {artist && (
            <p className="text-gray-600 truncate">{artist}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[getProgressPercentage()]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full"
          disabled={isLoading || duration === 0}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => skip(-10)}
          disabled={isLoading}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={restart}
          disabled={isLoading}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          size="lg"
          onClick={togglePlayPause}
          disabled={isLoading}
          className="w-12 h-12 rounded-full"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => skip(10)}
          disabled={isLoading}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Volume Control */}
      {showControls && (
        <div className="flex items-center gap-3 mb-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <div className="flex-1 max-w-32">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
            />
          </div>
          <span className="text-xs text-gray-500 w-8">
            {Math.round(isMuted ? 0 : volume * 100)}%
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          {onLike && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          )}
          {onShare && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {showDownload && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AudioPlayer;
