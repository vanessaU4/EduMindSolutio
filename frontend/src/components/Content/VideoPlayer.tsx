import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  controls?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

interface VideoSource {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown';
  embedUrl?: string;
  videoId?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  thumbnailUrl,
  autoPlay = false,
  controls = true,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoSource, setVideoSource] = useState<VideoSource>({ type: 'unknown' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse video URL to determine source type
  useEffect(() => {
    if (!videoUrl) {
      setError('No video URL provided');
      setIsLoading(false);
      return;
    }

    const parseVideoUrl = (url: string): VideoSource => {
      try {
        const urlObj = new URL(url);
        
        // YouTube detection
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
          let videoId = '';
          if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1);
          } else {
            videoId = urlObj.searchParams.get('v') || '';
          }
          
          if (videoId) {
            return {
              type: 'youtube',
              videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`
            };
          }
        }
        
        // Vimeo detection
        if (urlObj.hostname.includes('vimeo.com')) {
          const videoId = urlObj.pathname.split('/').pop();
          if (videoId) {
            return {
              type: 'vimeo',
              videoId,
              embedUrl: `https://player.vimeo.com/video/${videoId}`
            };
          }
        }
        
        // Direct video file detection
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
        const hasVideoExtension = videoExtensions.some(ext => 
          urlObj.pathname.toLowerCase().includes(ext)
        );
        
        if (hasVideoExtension || urlObj.protocol === 'blob:') {
          return { type: 'direct' };
        }
        
        return { type: 'unknown' };
      } catch (error) {
        console.error('Error parsing video URL:', error);
        return { type: 'unknown' };
      }
    };

    const source = parseVideoUrl(videoUrl);
    setVideoSource(source);
    setIsLoading(false);
  }, [videoUrl]);

  // Video event handlers
  const handlePlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause?.();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      onTimeUpdate?.(current, total);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onEnded?.();
  };

  const handleError = () => {
    setError('Failed to load video. Please check the video URL.');
    setIsLoading(false);
  };

  // Control handlers
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(handleError);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(handleError);
    }
  };

  // Format time display
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={`aspect-video bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`aspect-video bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
          <p className="font-medium">Video Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  // YouTube/Vimeo embed
  if (videoSource.type === 'youtube' || videoSource.type === 'vimeo') {
    return (
      <div ref={containerRef} className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={videoSource.embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video file or unknown type
  return (
    <div ref={containerRef} className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      {videoSource.type === 'direct' ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={thumbnailUrl}
          autoPlay={autoPlay}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleError}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      ) : (
        // Fallback for unknown video types
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <Play className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium">Unsupported Video Format</p>
            <p className="text-sm text-gray-300 mb-4">
              This video format is not supported for inline playback
            </p>
            <Button
              onClick={() => window.open(videoUrl, '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Open in New Tab
            </Button>
          </div>
        </div>
      )}

      {/* Custom Controls for Direct Videos */}
      {controls && videoSource.type === 'direct' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlayPause}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={restart}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                  />
                </div>
              </div>

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
