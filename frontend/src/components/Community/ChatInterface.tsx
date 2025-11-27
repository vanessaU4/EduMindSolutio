import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Send, Users, Settings, LogOut, Copy, Hash, 
  MessageCircle, Clock, User, Crown, Shield, Phone, Video, 
  Paperclip, Image, FileText, Mic, MicOff, VideoOff,
  MoreVertical, Search, Pin, Archive, Smile, 
  Download, Eye, Calendar, MapPin, CheckCircle2, AlertCircle
} from 'lucide-react';
import { communityService, ChatMessage, ChatRoom } from '@/services/communityService';
import { useToast } from '@/hooks/use-toast';
import { ChatMessageInput } from '../chat/ChatMessageInput';
import { ChatMessage as ChatMessageComponent } from '../chat/ChatMessage';
import CallControls from '../media/CallControls';
import CallInterface from '../media/CallInterface';
import EnhancedChatMessage from '../chat/EnhancedChatMessage';
import { mediaService } from '@/services/mediaService';

interface ChatInterfaceProps {
  roomId: number;
  onLeave: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ roomId, onLeave }) => {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  // Call-related state
  const [hasActiveCall, setHasActiveCall] = useState(false);
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video'>('audio');
  const [isInCall, setIsInCall] = useState(false);
  const [callParticipants, setCallParticipants] = useState<any[]>([]);
  const [callEndpointsAvailable, setCallEndpointsAvailable] = useState(true);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  // Mock mode removed - using real backend only
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRoomData();
    loadCurrentUser();
    
    // Check call status once on mount
    checkCallStatus();
    
    // Fallback polling for development
    const pollInterval = setInterval(() => {
      if (!isConnected) {
        loadMessages();
        // Only check call status if endpoints are available
        if (callEndpointsAvailable) {
          checkCallStatus();
        }
      }
    }, 5000);
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [roomId]);

  const loadCurrentUser = async () => {
    try {
      // Try to get current user from API
      const user = await communityService.getCurrentUser();
      setCurrentUser(user);
      
      // Cache user info in localStorage
      localStorage.setItem('user_info', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to load current user:', error);
      
      // Try to get from localStorage as fallback
      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          setCurrentUser(user);
        } catch (parseError) {
          console.error('Failed to parse cached user info:', parseError);
          setFallbackUser();
        }
      } else {
        setFallbackUser();
      }
    }
  };

  const setFallbackUser = () => {
    // Fallback user info for development
    setCurrentUser({ 
      id: 1, 
      username: 'CurrentUser', 
      display_name: 'Current User',
      first_name: 'Current',
      last_name: 'User',
      email: 'current@example.com'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRoomData = async () => {
    try {
      setLoading(true);
      const [roomData, messagesData, participantsData] = await Promise.all([
        communityService.getChatRoom(roomId),
        communityService.getChatMessages(roomId),
        communityService.getChatRoomParticipants(roomId)
      ]);
      
      setRoom(roomData);
      setMessages(Array.isArray(messagesData) ? messagesData : (messagesData as any)?.results || []);
      setParticipants(participantsData.participants || []);
    } catch (error) {
      console.error('Failed to load room data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat room',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await communityService.getChatMessages(roomId);
      setMessages(Array.isArray(messagesData) ? messagesData : (messagesData as any)?.results || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (messageData: {
    type: 'text' | 'voice' | 'video' | 'image' | 'file';
    content?: string;
    file?: File;
    duration?: number;
  }) => {
    try {
      let sentMessage;
      
      if (messageData.type === 'text') {
        // Send text message
        if (!messageData.content?.trim()) {
          toast({
            title: 'Empty Message',
            description: 'Please enter a message before sending',
            variant: 'destructive',
          });
          return;
        }
        
        sentMessage = await communityService.sendChatMessage(roomId, messageData.content.trim(), false);
      } else {
        // Send media message
        if (!messageData.file) {
          toast({
            title: 'No File',
            description: 'Please select a file to send',
            variant: 'destructive',
          });
          return;
        }
        
        // Use the new media API endpoint
        const formData = new FormData();
        formData.append('room_id', roomId.toString());
        formData.append('message_type', messageData.type);
        formData.append('is_anonymous', 'False');
        
        if (messageData.content) {
          formData.append('content', messageData.content);
        }
        
        if (messageData.duration) {
          formData.append('duration', messageData.duration.toString());
        }
        
        // Append the appropriate file field based on type
        switch (messageData.type) {
          case 'voice':
            formData.append('voice_file', messageData.file);
            break;
          case 'video':
            formData.append('video_file', messageData.file);
            break;
          case 'image':
            formData.append('image_file', messageData.file);
            break;
          case 'file':
            formData.append('attachment_file', messageData.file);
            break;
        }
        
        // Send via the media API endpoint
        sentMessage = await communityService.sendMediaMessage(roomId, formData);
      }
      
      // Add message to local state immediately
      setMessages(prev => [...prev, sentMessage]);
      
      toast({
        title: 'Message Sent',
        description: `Your ${messageData.type} message has been sent successfully`,
      });
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      let errorMessage = 'Failed to send message';
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.detail || error.response?.data?.error || 'Invalid message format';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to send messages in this room';
      } else if (error.response?.status === 404) {
        errorMessage = 'Chat room not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please check the backend logs for details.';
        console.error('🚨 500 Internal Server Error - Check Django backend logs:', error.response?.data);
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await communityService.leaveChatRoom(roomId);
      onLeave();
      toast({
        title: 'Left Room',
        description: 'You have left the chat room',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave room',
        variant: 'destructive',
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: 'File Selected',
        description: `${file.name} ready to send`,
      });
    }
  };

  // Call management functions
  const checkCallStatus = async () => {
    try {
      const status = await mediaService.getCallStatus(roomId);
      setHasActiveCall(status.has_active_call);
      if (status.has_active_call) {
        setActiveCallType(status.type || 'audio');
      }
      // If we get here, endpoints are working
      setCallEndpointsAvailable(true);
    } catch (error) {
      // Endpoints not available - disable future polling
      setCallEndpointsAvailable(false);
      setHasActiveCall(false);
    }
  };

  const handleStartAudioCall = async () => {
    try {
      await mediaService.startCall(roomId, 'audio');
      setIsInCall(true);
      setActiveCallType('audio');
      await checkCallStatus();
      toast({
        title: 'Audio Call Started',
        description: 'Audio call has been initiated',
      });
    } catch (error) {
      console.error('Failed to start audio call:', error);
      toast({
        title: 'Call Failed',
        description: 'Could not start audio call',
        variant: 'destructive',
      });
    }
  };

  const handleStartVideoCall = async () => {
    try {
      await mediaService.startCall(roomId, 'video');
      setIsInCall(true);
      setActiveCallType('video');
      await checkCallStatus();
      toast({
        title: 'Video Call Started',
        description: 'Video call has been initiated',
      });
    } catch (error) {
      console.error('Failed to start video call:', error);
      toast({
        title: 'Call Failed',
        description: 'Could not start video call',
        variant: 'destructive',
      });
    }
  };

  const handleJoinCall = async () => {
    // Prevent duplicate join attempts
    if (isJoiningCall || isInCall) {
      return;
    }

    setIsJoiningCall(true);
    try {
      await mediaService.joinCall(roomId);
      setIsInCall(true);
      await checkCallStatus();
      toast({
        title: 'Joined Call',
        description: 'You have joined the call',
      });
    } catch (error: any) {
      console.error('Failed to join call:', error);
      
      // Handle specific error for already being in call
      if (error.message?.includes('already in this call')) {
        setIsInCall(true);
        await checkCallStatus();
        toast({
          title: 'Already in Call',
          description: 'You are already participating in this call',
        });
      } else {
        toast({
          title: 'Join Failed',
          description: 'Could not join the call',
          variant: 'destructive',
        });
      }
    } finally {
      setIsJoiningCall(false);
    }
  };

  const handleEndCall = async () => {
    try {
      await mediaService.endCall(roomId);
      setIsInCall(false);
      await checkCallStatus();
      toast({
        title: 'Call Ended',
        description: 'The call has been ended',
      });
    } catch (error) {
      console.error('Failed to end call:', error);
      toast({
        title: 'Error',
        description: 'Could not end the call',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAudio = () => {
    const isMuted = mediaService.toggleAudio();
    setIsMuted(isMuted);
  };

  const handleToggleVideo = () => {
    const isVideoOff = mediaService.toggleVideo();
    setIsVideoOff(isVideoOff);
  };

  const handleSendFile = async () => {
    if (selectedFile) {
      try {
        // For now, simulate file upload
        const fileMessage = await communityService.sendChatMessage(
          roomId, 
          `📎 Shared file: ${selectedFile.name}`, 
          false // Show real name for file uploads
        );
        
        setMessages(prev => [...prev, fileMessage]);
        
        toast({
          title: 'File Sent',
          description: `${selectedFile.name} has been shared`,
        });
        
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to send file',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Room not found</p>
          <Button onClick={onLeave} className="mt-4">Back to Rooms</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24 min-h-screen">
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Enhanced Header */}
          <Card className="rounded-t-xl border-0 shadow-none bg-white border-b border-gray-200">
            <CardHeader className="pb-4 pt-6 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-blue-200">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                        {room.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800">{room.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{participants.length} participants</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            isConnected ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {room.topic && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 font-medium">
                      {room.topic}
                    </Badge>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: 'Settings',
                            description: 'Chat settings panel coming soon',
                          });
                        }}
                        className="hover:bg-blue-100"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Chat settings</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowParticipants(!showParticipants)}
                        className="hover:bg-blue-100"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle participants</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleLeaveRoom} className="hover:bg-red-50 hover:border-red-300">
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Leave room</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Call Controls */}
          <div className="mb-4">
            <CallControls
              roomId={roomId}
              roomName={room?.name || 'Chat Room'}
              participantCount={participants.length}
              hasActiveCall={hasActiveCall}
              activeCallType={activeCallType}
              onStartAudioCall={handleStartAudioCall}
              onStartVideoCall={handleStartVideoCall}
              onJoinCall={handleJoinCall}
              onEndCall={handleEndCall}
              isJoiningCall={isJoiningCall}
            />
          </div>

          {/* Active Call Interface */}
          {isInCall && (
            <div className="mb-4">
              <CallInterface
                callId={roomId.toString()}
                callType={activeCallType}
                participants={callParticipants}
                onEndCall={handleEndCall}
                onToggleAudio={handleToggleAudio}
                onToggleVideo={handleToggleVideo}
              />
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            {/* Enhanced Messages Area */}
            <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
              {/* Messages Display */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {Array.isArray(messages) && messages.map((message, index) => {
                    // Check if this message is from the current user
                    let isMyMessage = false;
                    
                    if (currentUser) {
                      isMyMessage = (
                        message.author === currentUser.id || 
                        message.author_display_name === 'You' ||
                        message.author_display_name === currentUser.display_name ||
                        message.author_display_name === currentUser.username ||
                        // Also check if it's a message we just sent (recent timestamp)
                        (Date.now() - new Date(message.created_at).getTime() < 5000 && message.author === currentUser.id)
                      );
                    }
                    
                    // Ensure message has required fields for the component
                    const messageWithDefaults = {
                      ...message,
                      message_type: message.message_type || 'text' as const
                    };
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <EnhancedChatMessage
                          message={messageWithDefaults}
                          isOwn={isMyMessage}
                          onReply={(msg) => {
                            setNewMessage(`@${msg.author_display_name} `);
                          }}
                          onDownload={(msg) => {
                            if (msg.media_url) {
                              const link = document.createElement('a');
                              link.href = msg.media_url;
                              link.download = msg.media_filename || 'media-file';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {(!Array.isArray(messages) || messages.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                    <p>Start the conversation by sending the first message!</p>
                  </div>
                )}
                
                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 italic">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>
                      {typingUsers.length === 1 
                        ? `${typingUsers[0]} is typing...`
                        : `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing...`
                      }
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <ChatMessageInput
                onSendMessage={handleSendMessage}
                disabled={loading}
                placeholder="Type a message..."
              />
            </div>

            {/* Enhanced Participants Sidebar */}
            {showParticipants && (
              <Card className="w-80 rounded-none border-0 bg-white border-l border-gray-200">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                      <Users className="w-4 h-4 text-green-600" />
                      Participants ({participants.length})
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowParticipants(false)}
                      className="hover:bg-green-100"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Online Status */}
                  <div className="p-4 border-b bg-green-50">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-green-800">
                        {participants.length} online now
                      </span>
                    </div>
                  </div>
                  
                  {/* Participants List */}
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-1 p-2">
                      {participants.map((participant) => (
                        <div 
                          key={participant.id} 
                          className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                        >
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="text-sm font-medium bg-blue-100 text-blue-600">
                                {participant.display_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {participant.display_name}
                              </p>
                              {participant.is_creator && (
                                <Crown className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(participant.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 hover:bg-blue-50">
                              <Phone className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 hover:bg-green-50">
                              <Video className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Room Info */}
                  <div className="p-4 border-t bg-gray-50">
                    <h4 className="font-medium text-sm mb-3 text-gray-800">Room Information</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>Created {new Date(room.created_at).toLocaleDateString()}</span>
                      </div>
                      {room.topic && (
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3" />
                          <span>{room.topic}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span>{room.is_moderated ? 'Moderated' : 'Open'} room</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatInterface;
