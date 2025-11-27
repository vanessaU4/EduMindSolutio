import React, { useState } from 'react';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: number | string;
    author_display_name: string;
    content: string;
    message_type: 'text' | 'voice' | 'video' | 'image' | 'file';
    media_url?: string;
    media_filename?: string;
    duration?: number;
    file_size?: number;
    mime_type?: string;
    created_at: string;
    is_anonymous: boolean;
    is_system_message: boolean;
  };
  isOwnMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAudioPlay = (audio: HTMLAudioElement) => {
    setIsPlaying(true);
    
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const renderTextMessage = () => (
    <div className="prose prose-sm max-w-none">
      <p className="mb-0 whitespace-pre-wrap">{message.content}</p>
    </div>
  );

  const renderVoiceMessage = () => (
    <div className="bg-gray-50 rounded-lg p-3 max-w-xs">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <Volume2 size={20} className="text-blue-500" />
        </div>
        <div className="flex-1">
          <audio
            controls
            src={message.media_url}
            className="w-full h-8"
            onPlay={(e) => handleAudioPlay(e.target as HTMLAudioElement)}
            onPause={handleAudioPause}
            preload="metadata"
          />
          {message.duration && (
            <p className="text-xs text-gray-500 mt-1">
              Duration: {formatTime(message.duration)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderVideoMessage = () => (
    <div className="max-w-sm">
      <video
        controls
        src={message.media_url}
        className="w-full rounded-lg"
        preload="metadata"
        style={{ maxHeight: '300px' }}
      />
      {message.duration && (
        <p className="text-xs text-gray-500 mt-1">
          Duration: {formatTime(message.duration)}
        </p>
      )}
    </div>
  );

  const renderImageMessage = () => (
    <div className="max-w-sm">
      <img
        src={message.media_url}
        alt="Shared image"
        className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(message.media_url, '_blank')}
      />
      {message.content && (
        <p className="text-sm text-gray-700 mt-2">{message.content}</p>
      )}
    </div>
  );

  const renderFileMessage = () => (
    <div className="bg-gray-50 rounded-lg p-3 max-w-xs">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-xs font-medium">
              {message.media_filename?.split('.').pop()?.toUpperCase() || 'FILE'}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {message.media_filename || 'Unknown file'}
          </p>
          {message.file_size && (
            <p className="text-xs text-gray-500">
              {formatFileSize(message.file_size)}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <a
            href={message.media_url}
            download={message.media_filename}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            title="Download file"
          >
            <Download size={16} />
          </a>
        </div>
      </div>
      {message.content && (
        <p className="text-sm text-gray-700 mt-2">{message.content}</p>
      )}
    </div>
  );

  const renderSystemMessage = () => (
    <div className="text-center">
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {message.content}
      </span>
    </div>
  );

  const renderMessageContent = () => {
    if (message.is_system_message) {
      return renderSystemMessage();
    }

    switch (message.message_type) {
      case 'voice':
        return renderVoiceMessage();
      case 'video':
        return renderVideoMessage();
      case 'image':
        return renderImageMessage();
      case 'file':
        return renderFileMessage();
      case 'text':
      default:
        return renderTextMessage();
    }
  };

  if (message.is_system_message) {
    return (
      <div className="flex justify-center my-2">
        {renderMessageContent()}
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Author name */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 mb-1 px-1">
            {message.author_display_name}
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`rounded-lg px-3 py-2 ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {renderMessageContent()}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-400 mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};
