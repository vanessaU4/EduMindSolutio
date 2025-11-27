import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, Users, ArrowRight, Plus, 
  Clock, Sparkles, Crown, Globe, Lock
} from 'lucide-react';
import { communityService, ChatRoom } from '@/services/communityService';
import { useNavigate } from 'react-router-dom';

interface ChatWidgetProps {
  title?: string;
  showStats?: boolean;
  maxRooms?: number;
  showCreateButton?: boolean;
  compact?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  title = "Community Chat",
  showStats = true,
  maxRooms = 4,
  showCreateButton = true,
  compact = false
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadChatData();
  }, []);

  const loadChatData = async () => {
    try {
      setLoading(true);
      const [roomsData, statsData] = await Promise.all([
        communityService.getChatRooms(),
        showStats ? communityService.getChatRoomStats() : Promise.resolve(null)
      ]);
      
      setChatRooms(roomsData.slice(0, maxRooms));
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load chat data:', error);
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId: number) => {
    navigate(`/community/chat?join=${roomId}`);
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className={compact ? "pb-3" : ""}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={goToChatRooms}>
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {showStats && stats && !compact && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.available_rooms}</div>
              <div className="text-xs text-gray-600">Active Rooms</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.user_rooms}</div>
              <div className="text-xs text-gray-600">Your Rooms</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {chatRooms.length === 0 ? (
          <div className="text-center py-6">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 mb-4">No active chat rooms</p>
            {showCreateButton && (
              <Button onClick={handleCreateRoom} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create First Room
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {chatRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{room.name}</h4>
                        <div className="flex items-center gap-1">
                          {room.is_moderated ? (
                            <Lock className="w-3 h-3 text-green-500" />
                          ) : (
                            <Globe className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{room.active_users || 0}/{room.max_participants}</span>
                        </div>
                        
                        {room.topic && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {room.topic}
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(room.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {room.is_member ? 'Open' : 'Join'}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-3 border-t">
              <Button variant="outline" onClick={goToChatRooms} className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                All Rooms
              </Button>
              {showCreateButton && (
                <Button onClick={handleCreateRoom}>
                  <Plus className="w-4 h-4 mr-2" />
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

export default ChatWidget;
