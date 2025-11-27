import React, { useState } from 'react';
import { Phone, Video, PhoneOff, Users, Clock } from 'lucide-react';

interface CallControlsProps {
  roomId: number;
  roomName: string;
  participantCount: number;
  hasActiveCall?: boolean;
  activeCallType?: 'audio' | 'video';
  onStartAudioCall?: () => void;
  onStartVideoCall?: () => void;
  onJoinCall?: () => void;
  onEndCall?: () => void;
  isJoiningCall?: boolean;
  className?: string;
}

export const CallControls: React.FC<CallControlsProps> = ({
  roomId,
  roomName,
  participantCount,
  hasActiveCall = false,
  activeCallType,
  onStartAudioCall,
  onStartVideoCall,
  onJoinCall,
  onEndCall,
  isJoiningCall = false,
  className = ''
}) => {
  const [showCallOptions, setShowCallOptions] = useState(false);

  const handleStartAudioCall = () => {
    onStartAudioCall?.();
    setShowCallOptions(false);
  };

  const handleStartVideoCall = () => {
    onStartVideoCall?.();
    setShowCallOptions(false);
  };

  if (hasActiveCall) {
    return (
      <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                {activeCallType === 'video' ? (
                  <Video size={20} className="text-white" />
                ) : (
                  <Phone size={20} className="text-white" />
                )}
              </div>
              <div>
                <span className="font-semibold text-green-800 text-lg">
                  {activeCallType === 'video' ? 'Video' : 'Audio'} Call Active
                </span>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Users size={14} />
                  <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onJoinCall}
              disabled={isJoiningCall}
              className={`px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 ${
                isJoiningCall ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isJoiningCall ? 'Joining...' : 'Join Call'}
            </button>
            <button
              onClick={onEndCall}
              className="p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              title="End Call"
            >
              <PhoneOff size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <span className="font-semibold text-gray-800 text-lg">{roomName}</span>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{participantCount} participant{participantCount !== 1 ? 's' : ''} online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showCallOptions ? (
            <div className="flex items-center space-x-3 animate-in slide-in-from-right duration-300">
              <button
                onClick={handleStartAudioCall}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Phone size={16} />
                <span>Audio</span>
              </button>
              <button
                onClick={handleStartVideoCall}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Video size={16} />
                <span>Video</span>
              </button>
              <button
                onClick={() => setShowCallOptions(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCallOptions(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Phone size={16} />
              <span>Start Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Call History/Status */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock size={14} />
            <span>Ready to connect</span>
          </div>
          <span className="text-green-600 font-medium">● Available for calls</span>
        </div>
      </div>
    </div>
  );
};

export default CallControls;
