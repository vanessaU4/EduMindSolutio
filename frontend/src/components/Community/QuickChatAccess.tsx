import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, Users, Plus, ArrowRight, X, 
  Crown, Globe, Lock, Sparkles, Hash
} from 'lucide-react';
import { communityService, ChatRoom } from '@/services/communityService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface QuickChatAccessProps {
  onJoinRoom?: (roomId: number) => void;
  showCreateOption?: boolean;
  maxRoomsToShow?: number;
}

const QuickChatAccess: React.FC<QuickChatAccessProps> = ({ 
  onJoinRoom, 
  showCreateOption = true,
  maxRoomsToShow = 3 
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadQuickRooms();
  }, []);

  const loadQuickRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await communityService.getChatRooms();
      setChatRooms(roomsData.slice(0, maxRoomsToShow));
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: number) => {
    if (onJoinRoom) {
      onJoinRoom(roomId);
    } else {
      // Navigate to chat rooms page and join
      navigate(`/community/chat?join=${roomId}`);
    }
  };

  const handleCreateRoom = () => {
    navigate('/community/chat?create=true');
  };

  const goToChatRooms = () => {
    navigate('/community/chat');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Quick Chat
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={goToChatRooms}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {chatRooms.length === 0 ? (
          <div className="text-center py-4">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-3">No active chat rooms</p>
            {showCreateOption && (
              <Button size="sm" onClick={handleCreateRoom}>
                <Plus className="w-4 h-4 mr-1" />
                Create Room
              </Button>
            )}
          </div>
        ) : (
          <>
            {chatRooms.map((room) => (
              <div 
                key={room.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                onClick={() => handleJoinRoom(room.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{room.name}</h4>
                    {room.is_moderated ? (
                      <Lock className="w-3 h-3 text-green-500" />
                    ) : (
                      <Globe className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{room.active_users || 0}/{room.max_participants}</span>
                    {room.topic && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {room.topic}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="ml-2">
                  {room.is_member ? 'Open' : 'Join'}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
            
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={goToChatRooms} className="flex-1">
                View All
              </Button>
              {showCreateOption && (
                <Button size="sm" onClick={handleCreateRoom}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickChatAccess;
