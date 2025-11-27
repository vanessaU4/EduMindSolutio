import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Square, Send, Trash2, Camera } from 'lucide-react';

interface VideoRecorderProps {
  onRecordingComplete: (videoBlob: Blob, duration: number) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 300 // 5 minutes default
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      
      // Show video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Try different MIME types for better browser compatibility
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { 
          type: mimeType 
        });
        setVideoBlob(videoBlob);
        
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
        setHasRecording(true);
        setIsPreviewMode(true);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Clear video preview
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting video recording:', error);
      
      let errorMessage = 'Could not access camera/microphone. ';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera and microphone permissions in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera or microphone found. Please connect a camera/microphone.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Camera/microphone is already in use by another application.';
        } else {
          errorMessage += 'Please check your camera and microphone settings.';
        }
      }
      
      alert(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const discardRecording = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setHasRecording(false);
    setIsPreviewMode(false);
    setRecordingTime(0);
    
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
  };

  const sendRecording = () => {
    if (videoBlob) {
      onRecordingComplete(videoBlob, recordingTime);
      discardRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingStatus = () => {
    if (isRecording && !isPaused) return 'Recording...';
    if (isPaused) return 'Paused';
    if (hasRecording) return 'Ready to send';
    return 'Ready to record';
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Video Message</h3>
        <span className="text-sm text-gray-500">{getRecordingStatus()}</span>
      </div>

      {/* Video Preview/Playback */}
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {!isPreviewMode && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        )}
        
        {isPreviewMode && videoUrl && (
          <video
            ref={playbackRef}
            src={videoUrl}
            controls
            className="w-full h-full object-cover"
            preload="metadata"
          />
        )}
        
        {!isRecording && !hasRecording && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <Camera size={48} className="text-gray-400" />
          </div>
        )}
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">REC</span>
          </div>
        )}
        
        {/* Recording Time Overlay */}
        {isRecording && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm font-mono">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isRecording && !hasRecording && (
          <button
            onClick={startRecording}
            className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Start Recording"
          >
            <Video size={24} />
          </button>
        )}

        {isRecording && (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="flex items-center justify-center w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
                title="Pause Recording"
              >
                <VideoOff size={20} />
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                title="Resume Recording"
              >
                <Video size={20} />
              </button>
            )}
            
            <button
              onClick={stopRecording}
              className="flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
              title="Stop Recording"
            >
              <Square size={20} />
            </button>
          </>
        )}
      </div>

      {/* Recording Time */}
      <div className="text-center">
        <div className="text-2xl font-mono text-gray-700">
          {formatTime(recordingTime)}
        </div>
        {maxDuration && (
          <div className="text-sm text-gray-500">
            Max: {formatTime(maxDuration)}
          </div>
        )}
      </div>

      {/* Recording Progress */}
      {isRecording && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
          />
        </div>
      )}

      {/* Action Buttons */}
      {hasRecording && (
        <div className="flex justify-center space-x-3">
          <button
            onClick={discardRecording}
            className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Trash2 size={16} className="mr-2" />
            Discard
          </button>
          
          <button
            onClick={sendRecording}
            className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Send size={16} className="mr-2" />
            Send Video Message
          </button>
        </div>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
