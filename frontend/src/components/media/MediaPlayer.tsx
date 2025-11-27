import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Maximize2, RotateCcw } from 'lucide-react';

interface MediaPlayerProps {
  mediaUrl: string;
  mediaType: 'voice' | 'video' | 'image';
  fileName?: string;
  duration?: number;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  mediaUrl,
  mediaType,
  fileName,
  duration,
  autoPlay = false,
  showControls = true,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    // Debug logging
    console.log('MediaPlayer - Loading media:', {
      url: mediaUrl,
      type: mediaType,
      fileName: fileName
    });

    const handleLoadedMetadata = () => {
      console.log('Media loaded successfully:', mediaUrl);
      setTotalDuration(media.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('Media loading error:', e);
      console.error('Media URL:', mediaUrl);
      console.error('Media type:', mediaType);
      
      const target = e.target as HTMLMediaElement;
      let errorMessage = 'Failed to load media file';
      let errorDetails = '';
      
      if (target && target.error) {
        console.error('Error code:', target.error.code);
        console.error('Error message:', target.error.message);
        
        switch (target.error.code) {
          case target.error.MEDIA_ERR_ABORTED:
            errorMessage = 'Media loading was aborted';
            errorDetails = 'User aborted loading';
            break;
          case target.error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error - Cannot access media file';
            errorDetails = 'Check if Django server is running and serving media files';
            break;
          case target.error.MEDIA_ERR_DECODE:
            errorMessage = 'Cannot decode media - Format or codec issue';
            errorDetails = 'WebM may not be supported by your browser';
            break;
          case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Media format not supported';
            errorDetails = 'Browser cannot play this file type';
            break;
          default:
            errorMessage = 'Unknown media error';
            errorDetails = `Error code: ${target.error.code}`;
        }
      }
      
      // Test if URL is accessible
      fetch(mediaUrl, { method: 'HEAD' })
        .then(response => {
          console.log('File accessibility test:', {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length')
          });
          
          if (response.status === 404) {
            setError('Media file not found (404) - File may have been deleted');
          } else if (response.status === 403) {
            setError('Access denied (403) - Check file permissions');
          } else if (!response.ok) {
            setError(`Server error (${response.status}) - ${response.statusText}`);
          } else {
            setError(`${errorMessage}. ${errorDetails}`);
          }
        })
        .catch(err => {
          console.error('Accessibility test failed:', err);
          setError(`${errorMessage}. Cannot reach server: ${err.message}`);
        });
      
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('ended', handleEnded);
    media.addEventListener('error', handleError);
    media.addEventListener('loadstart', handleLoadStart);

    return () => {
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('ended', handleEnded);
      media.removeEventListener('error', handleError);
      media.removeEventListener('loadstart', handleLoadStart);
    };
  }, [mediaUrl]);

  const togglePlayPause = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const media = mediaRef.current;
    const progressBar = progressRef.current;
    if (!media || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * totalDuration;
    
    media.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;

    media.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const newVolume = parseFloat(e.target.value);
    media.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = fileName || 'media-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    const media = mediaRef.current;
    if (!media || mediaType !== 'video') return;

    if (!isFullscreen) {
      if (media.requestFullscreen) {
        media.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetMedia = () => {
    const media = mediaRef.current;
    if (!media) return;

    media.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Validate media URL
  if (!mediaUrl || mediaUrl === 'null' || mediaUrl === 'undefined') {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center text-gray-500">
          <p className="text-sm">No media file available</p>
        </div>
      </div>
    );
  }

  if (mediaType === 'image') {
    return (
      <div className={`relative group ${className}`}>
        <img
          src={mediaUrl}
          alt={fileName || 'Shared image'}
          className="max-w-full max-h-96 rounded-lg shadow-md"
          onError={(e) => {
            console.error('Image loading error:', mediaUrl);
            setError('Failed to load image');
          }}
          onLoad={() => console.log('Image loaded successfully:', mediaUrl)}
        />
        {showControls && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              title="Download image"
            >
              <Download size={16} />
            </button>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center p-4">
              <p className="text-red-500 text-sm font-medium">{error}</p>
              <p className="text-gray-400 text-xs mt-1">URL: {mediaUrl}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm overflow-hidden ${className}`}>
      {/* Media Element */}
      <div className="relative">
        {mediaType === 'video' ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={mediaUrl}
            className="w-full max-h-64 bg-black"
            autoPlay={autoPlay}
            muted={isMuted}
            playsInline
          />
        ) : (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={mediaUrl}
            autoPlay={autoPlay}
            muted={isMuted}
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <p className="text-red-500 text-sm font-medium">{error}</p>
              <p className="text-gray-400 text-xs mt-1">URL: {mediaUrl}</p>
              <p className="text-gray-400 text-xs">Type: {mediaType}</p>
            </div>
          </div>
        )}

        {/* Voice Message Waveform Placeholder */}
        {mediaType === 'voice' && !error && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex space-x-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-blue-400 rounded-full transition-all duration-150 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      opacity: currentTime > (i / 20) * totalDuration ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && !error && (
        <div className="p-3 bg-gray-50 border-t">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer mb-3"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                disabled={isLoading}
                className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              {/* Reset */}
              <button
                onClick={resetMedia}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Reset"
              >
                <RotateCcw size={16} />
              </button>

              {/* Time Display */}
              <span className="text-sm text-gray-600 font-mono">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Volume Controls */}
              <button
                onClick={toggleMute}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />

              {/* Fullscreen (Video only) */}
              {mediaType === 'video' && (
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 size={16} />
                </button>
              )}

              {/* Download */}
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Download"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* File Info */}
          {fileName && (
            <div className="mt-2 text-xs text-gray-500 truncate">
              {fileName}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaPlayer;
