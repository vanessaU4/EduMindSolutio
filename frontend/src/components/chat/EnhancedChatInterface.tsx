import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, Video, Phone, X } from 'lucide-react';
import EnhancedChatMessage from './EnhancedChatMessage';
import CallControls from '../media/CallControls';
import CallInterface from '../media/CallInterface';
import { VoiceRecorder } from './VoiceRecorder';
import { mediaService } from '../../services/mediaService';
import { communityService } from '../../services/communityService';

interface ChatMessage {
  id: number;
  content: string;
  message_type: 'text' | 'voice' | 'video' | 'image' | 'file' | 'system';
  author_display_name: string;
  is_anonymous: boolean;
  is_system_message: boolean;
  created_at: string;
  media_url?: string;
  media_filename?: string;
  duration?: number;
  file_size?: number;
  mime_type?: string;
}

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHost: boolean;
}

interface EnhancedChatInterfaceProps {
  roomId: number;
  roomName: string;
  currentUserId: number;
  className?: string;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  roomId,
  roomName,
  currentUserId,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  // Call state
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callParticipants, setCallParticipants] = useState<CallParticipant[]>([]);
  const [hasActiveCall, setHasActiveCall] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    checkCallStatus();
    
    // Set up polling for new messages and call status
    const messageInterval = setInterval(loadMessages, 3000);
    const callInterval = setInterval(checkCallStatus, 5000);
    
    return () => {
      clearInterval(messageInterval);
      clearInterval(callInterval);
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await communityService.getChatMessages(roomId);
      setMessages(response);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const checkCallStatus = async () => {
    try {
      const status = await mediaService.getCallStatus(roomId);
      setHasActiveCall(status.has_active_call);
      if (status.has_active_call) {
        setCallType(status.type || 'audio');
        setParticipantCount(status.participants?.length || 0);
      }
    } catch (error) {
      console.error('Failed to check call status:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const messageData = {
        room: roomId,
        content: newMessage.trim(),
        is_anonymous: false,
      };

      await communityService.sendChatMessage(roomId, newMessage.trim(), false);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob, duration: number) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('room_id', roomId.toString());
      formData.append('message_type', 'voice');
      formData.append('is_anonymous', 'False');
      formData.append('voice_file', audioBlob, `voice-${Date.now()}.webm`);
      formData.append('duration', duration.toString());

      await communityService.sendMediaMessage(roomId, formData);
      setShowVoiceRecorder(false);
      await loadMessages();
    } catch (error) {
      console.error('Failed to send voice message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('room_id', roomId.toString());
      
      // Determine message type based on file type
      let messageType = 'file';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('video/')) messageType = 'video';
      else if (file.type.startsWith('audio/')) messageType = 'voice';
      
      formData.append('message_type', messageType);
      formData.append('is_anonymous', 'False');
      
      // Append file with appropriate field name
      const fieldName = messageType === 'image' ? 'image_file' : 
                       messageType === 'video' ? 'video_file' :
                       messageType === 'voice' ? 'voice_file' : 'attachment_file';
      formData.append(fieldName, file);

      await communityService.sendMediaMessage(roomId, formData);
      setShowFileUpload(false);
      await loadMessages();
    } catch (error) {
      console.error('Failed to send file:', error);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartAudioCall = async () => {
    try {
      await mediaService.startCall(roomId, 'audio');
      setIsInCall(true);
      setCallType('audio');
      await checkCallStatus();
    } catch (error) {
      console.error('Failed to start audio call:', error);
    }
  };

  const handleStartVideoCall = async () => {
    try {
      await mediaService.startCall(roomId, 'video');
      setIsInCall(true);
      setCallType('video');
      await checkCallStatus();
    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  };

  const handleJoinCall = async () => {
    try {
      await mediaService.joinCall(roomId);
      setIsInCall(true);
      await checkCallStatus();
    } catch (error) {
      console.error('Failed to join call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      await mediaService.endCall(roomId);
      setIsInCall(false);
      await checkCallStatus();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleLeaveCall = async () => {
    try {
      await mediaService.leaveCall(roomId);
      setIsInCall(false);
      await checkCallStatus();
    } catch (error) {
      console.error('Failed to leave call:', error);
    }
  };

  const handleToggleAudio = () => {
    const isMuted = mediaService.toggleAudio();
    console.log('Audio toggled:', isMuted ? 'muted' : 'unmuted');
  };

  const handleToggleVideo = () => {
    const isMuted = mediaService.toggleVideo();
    console.log('Video toggled:', isMuted ? 'muted' : 'unmuted');
  };

  const handleScreenShare = async () => {
    try {
      await mediaService.startScreenShare();
      console.log('Screen sharing started');
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
    }
  };

  const handleReplyToMessage = (message: ChatMessage) => {
    setNewMessage(`@${message.author_display_name} `);
  };

  const handleDownloadMedia = (message: ChatMessage) => {
    if (message.media_url) {
      const link = document.createElement('a');
      link.href = message.media_url;
      link.download = message.media_filename || 'media-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Call Controls */}
      <div className="flex-shrink-0 p-4 border-b">
        <CallControls
          roomId={roomId}
          roomName={roomName}
          participantCount={participantCount}
          hasActiveCall={hasActiveCall}
          activeCallType={callType}
          onStartAudioCall={handleStartAudioCall}
          onStartVideoCall={handleStartVideoCall}
          onJoinCall={handleJoinCall}
          onEndCall={handleEndCall}
        />
      </div>

      {/* Active Call Interface */}
      {isInCall && (
        <div className="flex-shrink-0">
          <CallInterface
            callId={roomId.toString()}
            callType={callType}
            participants={callParticipants}
            onEndCall={handleLeaveCall}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleScreenShare}
          />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <EnhancedChatMessage
            key={message.id}
            message={message}
            isOwn={message.author_display_name === 'You'} // This should be based on actual user comparison
            onReply={handleReplyToMessage}
            onDownload={handleDownloadMedia}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Record Voice Message</h3>
              <button
                onClick={() => setShowVoiceRecorder(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecording}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-2">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />

          {/* Voice Recording */}
          <button
            onClick={() => setShowVoiceRecorder(true)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Record voice message"
          >
            <Mic size={20} />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
