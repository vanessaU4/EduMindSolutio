import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Smile, Frown, Meh, Heart, AlertCircle, Camera, CameraOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MoodData {
  emotion: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'calm' | 'frustrated';
  confidence: number;
  timestamp: number;
}

interface MoodDetectionProps {
  isActive: boolean;
  onMoodDetected?: (mood: MoodData) => void;
  showPreview?: boolean;
  className?: string;
}

export const MoodDetection: React.FC<MoodDetectionProps> = ({
  isActive,
  onMoodDetected,
  showPreview = true,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [currentMood, setCurrentMood] = useState<MoodData | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<MoodData[]>([]);

  // Mock mood detection function (in real implementation, you'd use a ML library like face-api.js or TensorFlow.js)
  const detectMoodFromFrame = useCallback((canvas: HTMLCanvasElement): MoodData | null => {
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Mock detection - in real implementation, this would analyze facial features
    const emotions = ['happy', 'sad', 'neutral', 'excited', 'anxious', 'calm', 'frustrated'] as const;
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence

    return {
      emotion: randomEmotion,
      confidence,
      timestamp: Date.now()
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.videoWidth === 0) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Detect mood from the frame
    const mood = detectMoodFromFrame(canvas);
    if (mood) {
      setCurrentMood(mood);
      setDetectionHistory(prev => [...prev.slice(-9), mood]); // Keep last 10 detections
      onMoodDetected?.(mood);
    }
  }, [detectMoodFromFrame, onMoodDetected]);

  // Start/stop detection based on isActive prop
  useEffect(() => {
    if (isActive) {
      startCamera();
      setIsDetecting(true);
    } else {
      stopCamera();
      setIsDetecting(false);
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  // Detection loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isDetecting && isActive) {
      intervalId = setInterval(captureFrame, 2000); // Detect every 2 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isDetecting, isActive, captureFrame]);

  const getMoodIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return <Smile className="w-5 h-5 text-green-500" />;
      case 'sad':
      case 'frustrated':
        return <Frown className="w-5 h-5 text-red-500" />;
      case 'anxious':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'calm':
        return <Heart className="w-5 h-5 text-blue-500" />;
      default:
        return <Meh className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMoodColor = (emotion: string) => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return 'bg-green-100 text-green-800';
      case 'sad':
      case 'frustrated':
        return 'bg-red-100 text-red-800';
      case 'anxious':
        return 'bg-yellow-100 text-yellow-800';
      case 'calm':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Camera Preview */}
      {showPreview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              {isActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              Mood Detection Camera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-48 bg-gray-900 rounded-lg object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                  <div className="text-center text-white">
                    <CameraOff className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{cameraError}</p>
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {!isActive && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
                  <div className="text-center text-white">
                    <CameraOff className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Camera off</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Mood Display */}
      {currentMood && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Current Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMoodIcon(currentMood.emotion)}
                <div>
                  <Badge className={getMoodColor(currentMood.emotion)}>
                    {currentMood.emotion.charAt(0).toUpperCase() + currentMood.emotion.slice(1)}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(currentMood.confidence * 100)}% confidence
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(currentMood.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood History */}
      {detectionHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Mood Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {detectionHistory.slice(-5).map((mood, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                >
                  {getMoodIcon(mood.emotion)}
                  <span>{mood.emotion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection Status */}
      <div className="text-center">
        <Badge variant={isDetecting ? "default" : "secondary"}>
          {isDetecting ? "Detecting..." : "Detection Off"}
        </Badge>
      </div>
    </div>
  );
};

export default MoodDetection;
