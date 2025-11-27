import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, Bot, Download, Reply, MoreHorizontal } from 'lucide-react';
import MediaPlayer from '../media/MediaPlayer';

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

interface EnhancedChatMessageProps {
  message: ChatMessage;
  isOwn?: boolean;
  showAvatar?: boolean;
  onReply?: (message: ChatMessage) => void;
  onDownload?: (message: ChatMessage) => void;
  className?: string;
}

export const EnhancedChatMessage: React.FC<EnhancedChatMessageProps> = ({
  message,
  isOwn = false,
  showAvatar = true,
  onReply,
  onDownload,
  className = ''
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getMessageIcon = () => {
    if (message.is_system_message) return <Bot size={16} className="text-blue-500" />;
    return <User size={16} className="text-gray-500" />;
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'voice':
      case 'video':
      case 'image':
        if (message.media_url) {
          return (
            <div className="max-w-md">
              <MediaPlayer
                mediaUrl={message.media_url}
                mediaType={message.message_type}
                fileName={message.media_filename}
                duration={message.duration}
                className="w-full"
              />
              {message.content && (
                <p className="mt-2 text-sm text-gray-700">{message.content}</p>
              )}
            </div>
          );
        }
        break;

      case 'file':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {message.media_filename || 'Unknown file'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(message.file_size)} • {message.mime_type}
                </p>
              </div>
              {message.media_url && (
                <button
                  onClick={() => onDownload?.(message)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Download size={16} />
                </button>
              )}
            </div>
            {message.content && (
              <p className="mt-2 text-sm text-gray-700">{message.content}</p>
            )}
          </div>
        );

      case 'system':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-800">{message.content}</p>
          </div>
        );

      default:
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-900 whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        );
    }
  };

  if (message.is_system_message) {
    return (
      <div className={`flex justify-center my-4 ${className}`}>
        {renderMessageContent()}
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6 group ${className}`}>
      <div className={`flex max-w-xs lg:max-w-2xl ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isOwn ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white text-sm font-semibold">
              {message.author_display_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-full`}>
          {/* Author and Time */}
          {!isOwn && (
            <div className="flex items-center space-x-2 mb-2 px-1">
              <span className="text-sm font-semibold text-gray-700">
                {message.author_display_name}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`relative px-4 py-3 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md hover:shadow-md transition-shadow'
            } ${message.message_type !== 'text' ? 'p-3' : ''}`}
          >
            {renderMessageContent()}

            {/* Message Actions */}
            <div className={`absolute top-2 ${isOwn ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full mr-2'} opacity-0 group-hover:opacity-100 transition-all duration-200`}>
              <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                {onReply && (
                  <button
                    onClick={() => onReply(message)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Reply"
                  >
                    <Reply size={16} />
                  </button>
                )}
                {message.media_url && onDownload && (
                  <button
                    onClick={() => onDownload(message)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                )}
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  title="More options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Message Status Indicators */}
            {isOwn && (
              <div className="absolute -bottom-1 -right-1">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          {/* Time for own messages */}
          {isOwn && (
            <span className="text-xs text-gray-500 mt-1 px-1">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Own Avatar */}
        {showAvatar && isOwn && (
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white text-sm font-semibold">You</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatMessage;
