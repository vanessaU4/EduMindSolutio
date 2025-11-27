import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  Users,
  Maximize2,
  Minimize2,
  MoreVertical,
  Heart,
  Brain,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Camera,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MoodDetection from './MoodDetection';
import { mediaService } from '@/services/mediaService';

interface MoodData {
  emotion: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'calm' | 'frustrated';
  confidence: number;
  timestamp: number;
}

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHost: boolean;
  currentMood?: MoodData;
}

interface EnhancedCallInterfaceProps {
  callId: string;
  callType: 'audio' | 'video';
  participants: CallParticipant[];
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onEndCall?: () => void;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  onToggleScreenShare?: () => void;
  onMoodUpdate?: (mood: MoodData) => void;
  className?: string;
}

export const EnhancedCallInterface: React.FC<EnhancedCallInterfaceProps> = ({
  callId,
  callType,
  participants,
  isIncoming = false,
  onAccept,
  onDecline,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onMoodUpdate,
  className = ''
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  
  // Mood tracking states
  const [moodTrackingEnabled, setMoodTrackingEnabled] = useState(true);
  const [showMoodPanel, setShowMoodPanel] = useState(false);
  const [userMood, setUserMood] = useState<MoodData | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  
  // Camera and media states
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [mediaDeviceInfo, setMediaDeviceInfo] = useState<any>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTime = useRef<number>(Date.now());
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const startLocalVideo = useCallback(async () => {
    console.log('startLocalVideo called - selectedCameraId:', selectedCameraId);
    try {
      setIsInitializingCamera(true);
      setCameraError(null);
      
      // Test media devices first
      console.log('Testing media devices...');
      const deviceInfo = await mediaService.testMediaDevices();
      setMediaDeviceInfo(deviceInfo);
      console.log('Device info:', deviceInfo);
      
      if (!deviceInfo.browserSupport) {
        throw new Error('Your browser does not support camera access');
      }
      
      if (!deviceInfo.hasVideo) {
        throw new Error('No camera found. Please connect a camera and try again.');
      }
      
      if (deviceInfo.permissions.camera === 'denied') {
        throw new Error('Camera access denied. Please allow camera permissions in your browser settings.');
      }

      // Get available cameras
      console.log('Getting available cameras...');
      const cameras = await mediaService.getAvailableCameras();
      setAvailableCameras(cameras);
      console.log('Available cameras:', cameras);
      
      const constraints = {
        video: selectedCameraId ? {
          deviceId: { exact: selectedCameraId },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        } : {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      console.log('Requesting user media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      console.log('Got media stream:', stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('Set video srcObject, video element:', localVideoRef.current);
        console.log('Video element readyState:', localVideoRef.current.readyState);
        console.log('Video element paused:', localVideoRef.current.paused);
        
        // Force play the video
        try {
          await localVideoRef.current.play();
          console.log('Video play() succeeded');
        } catch (playError) {
          console.warn('Video play() failed:', playError);
        }
      } else {
        console.warn('localVideoRef.current is null');
      }
      
      // Add track event listeners
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.log(`${track.kind} track ended`);
          if (track.kind === 'video') {
            setCameraError('Camera disconnected');
          }
        });
      });
      
      console.log('Local video started successfully');
    } catch (error: any) {
      console.error('Error accessing camera/microphone:', error);
      let errorMessage = 'Failed to access camera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera settings not supported. Trying with default settings...';
        // Try again with basic constraints
        try {
          console.log('Trying basic constraints...');
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          localStreamRef.current = basicStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = basicStream;
          }
          setCameraError(null);
          console.log('Basic constraints worked');
          return;
        } catch (basicError) {
          console.error('Basic constraints failed:', basicError);
          errorMessage = 'Camera not compatible with this device.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCameraError(errorMessage);
    } finally {
      setIsInitializingCamera(false);
    }
  }, [selectedCameraId]);

  const stopLocalVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  }, []);

  // Initialize media devices info on mount
  useEffect(() => {
    const initializeDevices = async () => {
      try {
        const deviceInfo = await mediaService.testMediaDevices();
        setMediaDeviceInfo(deviceInfo);
        
        const cameras = await mediaService.getAvailableCameras();
        setAvailableCameras(cameras);
        
        if (cameras.length > 0 && !selectedCameraId) {
          setSelectedCameraId(cameras[0].deviceId);
        }
      } catch (error) {
        console.error('Failed to initialize devices:', error);
      }
    };
    
    initializeDevices();
  }, []);

  useEffect(() => {
    const initializeCall = async () => {
      console.log('EnhancedCallInterface initializing - callStatus:', callStatus, 'callType:', callType, 'participants:', participants.length);
      
      if (callStatus === 'connecting') {
        try {
          // Simulate call connection process
          await new Promise(resolve => setTimeout(resolve, 500));
          setCallStatus('connected');
          console.log('Call status changed to connected');
          
          // Start video immediately after connecting for video calls
          if (callType === 'video') {
            console.log('Starting video for video call');
            setTimeout(() => {
              console.log('Calling startLocalVideo');
              startLocalVideo();
            }, 100);
          }
        } catch (error) {
          console.error('Failed to connect call:', error);
          setCallStatus('ended');
        }
      }
    };

    initializeCall();

    return () => {
      stopLocalVideo();
    };
  }, [callType, callStatus, startLocalVideo, stopLocalVideo]);

  const handleToggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
    
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isAudioMuted; // Toggle the current state
      });
    }
    
    onToggleAudio?.();
  };

  const handleToggleVideo = () => {
    setIsVideoMuted(!isVideoMuted);
    
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoMuted; // Toggle the current state
      });
    }
    
    onToggleVideo?.();
  };
  
  const handleRetryCamera = async () => {
    setCameraError(null);
    await startLocalVideo();
  };
  
  const handleSwitchCamera = async () => {
    try {
      setIsInitializingCamera(true);
      const newStream = await mediaService.switchCamera();
      if (newStream && localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
        localStreamRef.current = newStream;
      }
    } catch (error) {
      console.error('Failed to switch camera:', error);
      setCameraError('Failed to switch camera');
    } finally {
      setIsInitializingCamera(false);
    }
  };
  
  const handleCameraSelect = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (callType === 'video' && callStatus === 'connected') {
      try {
        setIsInitializingCamera(true);
        const newStream = await mediaService.switchToCamera(deviceId);
        if (newStream && localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
          localStreamRef.current = newStream;
        }
      } catch (error) {
        console.error('Failed to switch to camera:', error);
        setCameraError('Failed to switch camera');
      } finally {
        setIsInitializingCamera(false);
      }
    }
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    onToggleScreenShare?.();
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    stopLocalVideo();
    onEndCall?.();
  };

  const handleAcceptCall = () => {
    setCallStatus('connected');
    callStartTime.current = Date.now();
    onAccept?.();
  };

  const handleMoodDetected = useCallback((mood: MoodData) => {
    setUserMood(mood);
    setMoodHistory(prev => [...prev.slice(-19), mood]); // Keep last 20 detections
    onMoodUpdate?.(mood);
  }, [onMoodUpdate]);

  const formatCallDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getMoodEmoji = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'sad': return '😢';
      case 'frustrated': return '😤';
      case 'anxious': return '😰';
      case 'calm': return '😌';
      default: return '😐';
    }
  };

  // Incoming call UI
  if (isIncoming && callStatus === 'connecting') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users size={40} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Incoming {callType} call
            </h2>
            <p className="text-gray-600">
              {participants.length > 1 ? `${participants.length} participants` : participants[0]?.name || 'Unknown caller'}
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            <button
              onClick={onDecline}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <PhoneOff size={24} />
            </button>
            <button
              onClick={handleAcceptCall}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Phone size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg overflow-hidden'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${callStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm font-medium">
              {callStatus === 'connected' ? formatCallDuration(callDuration) : 'Connecting...'}
            </span>
          </div>
          <span className="text-sm text-gray-300">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </span>
          {userMood && (
            <Badge variant="outline" className="text-xs">
              {getMoodEmoji(userMood.emotion)} {userMood.emotion}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowMoodPanel(!showMoodPanel)}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Brain size={20} />
          </Button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Main Video Area */}
        <div className="flex-1">
          {callType === 'video' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 h-96">
              {/* Remote Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  {participants[0]?.name || 'Remote'}
                  {participants[0]?.currentMood && (
                    <span className="ml-2">{getMoodEmoji(participants[0].currentMood.emotion)}</span>
                  )}
                </div>
                {participants[0]?.isVideoMuted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <VideoOff size={40} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 p-4">
                    <AlertTriangle size={40} className="text-red-400 mb-3" />
                    <p className="text-red-400 text-sm text-center mb-3">{cameraError}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRetryCamera}
                        size="sm"
                        disabled={isInitializingCamera}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isInitializingCamera ? (
                          <RefreshCw size={16} className="animate-spin mr-1" />
                        ) : (
                          <RefreshCw size={16} className="mr-1" />
                        )}
                        Retry
                      </Button>
                      {availableCameras.length > 1 && (
                        <Button
                          onClick={handleSwitchCamera}
                          size="sm"
                          variant="outline"
                          disabled={isInitializingCamera}
                        >
                          <RotateCcw size={16} className="mr-1" />
                          Switch
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={localVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                      onLoadedMetadata={() => console.log('Video metadata loaded')}
                      onCanPlay={() => console.log('Video can play')}
                      onPlay={() => console.log('Video started playing')}
                      onError={(e) => console.error('Video error:', e)}
                    />
                    {isInitializingCamera && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center text-white">
                          <RefreshCw size={32} className="animate-spin mx-auto mb-2" />
                          <p className="text-sm">Initializing camera...</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  You
                  {userMood && (
                    <span className="ml-2">{getMoodEmoji(userMood.emotion)}</span>
                  )}
                </div>
                {isVideoMuted && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <VideoOff size={40} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Audio-only call UI
            <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-900 to-purple-900">
              <div className="text-center">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  {participants.slice(0, 2).map((participant, index) => (
                    <div key={participant.id} className="text-center">
                      <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                        {participant.avatar ? (
                          <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Users size={40} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-lg font-medium">{participant.name}</p>
                      <div className="flex items-center justify-center mt-2 space-x-2">
                        {participant.isAudioMuted ? (
                          <MicOff size={16} className="text-red-400" />
                        ) : (
                          <Mic size={16} className="text-green-400" />
                        )}
                        {participant.currentMood && (
                          <span className="text-lg">{getMoodEmoji(participant.currentMood.emotion)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Audio Visualization */}
                <div className="flex items-center justify-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 bg-blue-400 rounded-full animate-pulse ${
                        callStatus === 'connected' ? 'opacity-100' : 'opacity-30'
                      }`}
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="p-4 bg-gray-800">
            <div className="flex items-center justify-center space-x-4">
              {/* Audio Toggle */}
              <button
                onClick={handleToggleAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Video Toggle (if video call) */}
              {callType === 'video' && (
                <button
                  onClick={handleToggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
              )}

              {/* Screen Share (video calls only) */}
              {callType === 'video' && (
                <button
                  onClick={handleScreenShare}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <MoreVertical size={20} />
                </button>
              )}
              
              {/* Camera Switch (video calls only) */}
              {callType === 'video' && availableCameras.length > 1 && (
                <button
                  onClick={handleSwitchCamera}
                  disabled={isInitializingCamera}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
                >
                  {isInitializingCamera ? (
                    <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    <RotateCcw size={20} />
                  )}
                </button>
              )}

              {/* Mood Tracking Toggle */}
              <button
                onClick={() => setMoodTrackingEnabled(!moodTrackingEnabled)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  moodTrackingEnabled ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {moodTrackingEnabled ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Volume2 size={20} className="text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* End Call */}
              <button
                onClick={handleEndCall}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mood Panel */}
        {showMoodPanel && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Mood Tracking</h3>
                <Switch
                  checked={moodTrackingEnabled}
                  onCheckedChange={setMoodTrackingEnabled}
                />
              </div>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto max-h-96">
              {cameraError ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Mood tracking unavailable: {cameraError}
                  </AlertDescription>
                </Alert>
              ) : (
                <MoodDetection
                  isActive={moodTrackingEnabled && callType === 'video' && !isVideoMuted && !cameraError}
                  onMoodDetected={handleMoodDetected}
                  showPreview={false}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-gray-800 rounded-lg p-4 shadow-lg z-10 min-w-64">
          <h3 className="text-lg font-medium mb-4">Call Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Audio Input</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                <option>Default Microphone</option>
                <option>External Microphone</option>
              </select>
            </div>

            {callType === 'video' && (
              <div>
                <label className="block text-sm font-medium mb-2">Video Input</label>
                <select 
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  value={selectedCameraId}
                  onChange={(e) => handleCameraSelect(e.target.value)}
                >
                  {availableCameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 8)}...`}
                    </option>
                  ))}
                  {availableCameras.length === 0 && (
                    <option value="">No cameras available</option>
                  )}
                </select>
                
                {mediaDeviceInfo && (
                  <div className="mt-2 text-xs text-gray-400">
                    <p>Status: {mediaDeviceInfo.permissions.camera}</p>
                    <p>Cameras: {availableCameras.length}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Audio Output</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                <option>Default Speakers</option>
                <option>Headphones</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mood Tracking</label>
              <Switch
                checked={moodTrackingEnabled}
                onCheckedChange={setMoodTrackingEnabled}
              />
            </div>
            
            {callType === 'video' && cameraError && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {cameraError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedCallInterface;
