import React, { useState, useRef } from 'react';
import { Send, Mic, Video, Image, Paperclip, X } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { VideoRecorder } from './VideoRecorder';

interface ChatMessageInputProps {
  onSendMessage: (message: {
    type: 'text' | 'voice' | 'video' | 'image' | 'file';
    content?: string;
    file?: File;
    duration?: number;
  }) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSendText = () => {
    if (message.trim() && !disabled) {
      onSendMessage({
        type: 'text',
        content: message.trim()
      });
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleVoiceRecording = (audioBlob: Blob, duration: number) => {
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: 'audio/webm;codecs=opus'
    });
    
    onSendMessage({
      type: 'voice',
      file: audioFile,
      duration
    });
    
    setShowVoiceRecorder(false);
  };

  const handleVideoRecording = (videoBlob: Blob, duration: number) => {
    const videoFile = new File([videoBlob], `video-${Date.now()}.webm`, {
      type: 'video/webm;codecs=vp9,opus'
    });
    
    onSendMessage({
      type: 'video',
      file: videoFile,
      duration
    });
    
    setShowVideoRecorder(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onSendMessage({
        type: 'image',
        file
      });
    }
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const sendSelectedFile = () => {
    if (selectedFile) {
      onSendMessage({
        type: 'file',
        file: selectedFile
      });
      
      clearSelectedFile();
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show voice recorder modal
  if (showVoiceRecorder) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full">
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            onCancel={() => setShowVoiceRecorder(false)}
            maxDuration={300}
          />
        </div>
      </div>
    );
  }

  // Show video recorder modal
  if (showVideoRecorder) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-2xl w-full">
          <VideoRecorder
            onRecordingComplete={handleVideoRecording}
            onCancel={() => setShowVideoRecorder(false)}
            maxDuration={300}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {filePreview && (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={sendSelectedFile}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
              <button
                onClick={clearSelectedFile}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end space-x-3">
        {/* Media Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={() => setShowVoiceRecorder(true)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Record Voice Message"
          >
            <Mic size={20} />
          </button>
          
          <button
            onClick={() => setShowVideoRecorder(true)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Record Video Message"
          >
            <Video size={20} />
          </button>
          
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send Image"
          >
            <Image size={20} />
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach File"
          >
            <Paperclip size={20} />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              minHeight: '40px',
              maxHeight: '120px'
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendText}
          disabled={disabled || !message.trim()}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send Message"
        >
          <Send size={20} />
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        onChange={handleImageSelect}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};
