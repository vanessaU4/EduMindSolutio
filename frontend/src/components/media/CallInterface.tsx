import React, { useState, useRef, useEffect } from 'react';
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
  MoreVertical
} from 'lucide-react';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHost: boolean;
}

interface CallInterfaceProps {
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
  className?: string;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
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

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTime = useRef<number>(Date.now());

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

  const handleToggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
    onToggleAudio?.();
  };

  const handleToggleVideo = () => {
    setIsVideoMuted(!isVideoMuted);
    onToggleVideo?.();
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    onToggleScreenShare?.();
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    onEndCall?.();
  };

  const handleAcceptCall = () => {
    setCallStatus('connected');
    callStartTime.current = Date.now();
    onAccept?.();
  };

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
        </div>

        <div className="flex items-center space-x-2">
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

      {/* Video Area */}
      <div className="relative flex-1 bg-black">
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
              </div>
              {participants[0]?.isVideoMuted && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <VideoOff size={40} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                You
              </div>
              {isVideoMuted && (
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
                    <div className="flex items-center justify-center mt-2">
                      {participant.isAudioMuted ? (
                        <MicOff size={16} className="text-red-400" />
                      ) : (
                        <Mic size={16} className="text-green-400" />
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
      </div>

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
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                  <option>Default Camera</option>
                  <option>External Camera</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Audio Output</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                <option>Default Speakers</option>
                <option>Headphones</option>
              </select>
            </div>
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

export default CallInterface;
