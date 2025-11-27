import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, Users, Lock, Globe, Plus, Search, 
  ArrowRight, Loader2, Crown, Hash, Calendar, Sparkles,
  UserPlus, Settings, Copy, Eye, MessageSquare
} from 'lucide-react';
import { communityService, ChatRoom } from '@/services/communityService';
import { useToast } from '@/hooks/use-toast';
import ChatInterface from '@/components/Community/ChatInterface';
import { useSearchParams } from 'react-router-dom';

interface ChatRoomStats {
  user_rooms: number;
  created_rooms: number;
  total_messages: number;
  available_rooms: number;
  max_participants_per_room: number;
}

const ChatRooms: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [myRooms, setMyRooms] = useState<ChatRoom[]>([]);
  const [stats, setStats] = useState<ChatRoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinByCodeOpen, setIsJoinByCodeOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    topic: '',
    room_type: 'support',
    is_private: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Handle URL parameters
    const joinRoomId = searchParams.get('join');
    const shouldCreate = searchParams.get('create');
    
    if (joinRoomId) {
      const roomId = parseInt(joinRoomId);
      if (!isNaN(roomId)) {
        handleJoinRoom(roomId);
        // Clear the parameter
        setSearchParams({});
      }
    }
    
    if (shouldCreate === 'true') {
      setIsCreateRoomOpen(true);
      // Clear the parameter
      setSearchParams({});
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, myRoomsData, statsData] = await Promise.all([
        communityService.getChatRooms(),
        communityService.getChatRooms({ my_rooms: 'true' }),
        communityService.getChatRoomStats()
      ]);
      
      // Debug: Log the API responses
      console.log('🔍 Rooms Data:', roomsData);
      console.log('🔍 My Rooms Data:', myRoomsData);
      console.log('🔍 Stats Data:', statsData);
      
      setChatRooms(Array.isArray(roomsData) ? roomsData : []);
      setMyRooms(Array.isArray(myRoomsData) ? myRoomsData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      setChatRooms([]);
      setMyRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim() || !newRoom.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const createdRoom = await communityService.createChatRoom(newRoom);
      setNewRoom({ name: '', description: '', topic: '', room_type: 'support', is_private: false });
      setIsCreateRoomOpen(false);
      
      // Automatically join the created room
      if (createdRoom && createdRoom.id) {
        setActiveRoomId(createdRoom.id);
        toast({
          title: 'Success',
          description: 'Chat room created! Welcome to your new room!',
        });
      } else {
        loadData();
        toast({
          title: 'Success',
          description: 'Chat room created successfully!',
        });
      }
    } catch (error) {
      console.error('Create room error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat room',
        variant: 'destructive',
      });
    }
  };

  // Quick test room creation
  const createTestRoom = async () => {
    try {
      const testRoom = {
        name: 'Welcome Chat',
        description: 'A friendly space for newcomers to connect and chat',
        topic: 'General Support',
        room_type: 'support',
        is_private: false
      };
      
      const createdRoom = await communityService.createChatRoom(testRoom);
      if (createdRoom && createdRoom.id) {
        setActiveRoomId(createdRoom.id);
        toast({
          title: 'Welcome!',
          description: 'Test room created! You can start chatting now.',
        });
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Test room creation failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test room',
        variant: 'destructive',
      });
    }
  };

  const handleJoinRoom = async (roomId: number) => {
    try {
      const result = await communityService.joinChatRoom(roomId);
      setActiveRoomId(roomId); // Enter the chat interface
      
      // Show appropriate message based on whether user was already a member
      if (result.message.includes('already') || result.message.includes('Already')) {
        toast({
          title: 'Welcome back!',
          description: 'Opening your chat room...',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Successfully joined chat room!',
        });
      }
    } catch (error: any) {
      console.error('Join room error:', error);
      
      // Check if it's the "already in room" error that somehow wasn't caught
      const errorMessage = error.message || error.response?.data?.detail || error.response?.data?.error || '';
      if (errorMessage.includes('You are already in this chat room') || errorMessage.toLowerCase().includes('already')) {
        // Still allow entering the room
        setActiveRoomId(roomId);
        toast({
          title: 'Welcome back!',
          description: 'You were already in this room. Opening chat...',
        });
        return;
      }
      
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to join chat room',
        variant: 'destructive',
      });
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room code',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await communityService.joinChatRoomByCode(joinCode.toUpperCase());
      setJoinCode('');
      setIsJoinByCodeOpen(false);
      setActiveRoomId(response.room_id); // Enter the chat interface
      toast({
        title: 'Success',
        description: 'Successfully joined chat room!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid room code',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveRoom = () => {
    setActiveRoomId(null);
    loadData(); // Refresh the room list
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Room code copied to clipboard',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-healthcare-primary" />
      </div>
    );
  }

  // Show chat interface if user has joined a room
  if (activeRoomId) {
    return <ChatInterface roomId={activeRoomId} onLeave={handleLeaveRoom} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Chat Rooms</h1>
              <p className="text-gray-600 text-sm sm:text-base">Join real-time conversations in safe, moderated spaces</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isJoinByCodeOpen} onOpenChange={setIsJoinByCodeOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Hash className="w-4 h-4 mr-2" />
                    Join by Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Room by Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter room code (e.g., ABC123)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsJoinByCodeOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleJoinByCode}>Join Room</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Chat Room</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Name *</label>
                      <Input
                        placeholder="e.g., Evening Support Group"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description *</label>
                      <Textarea
                        placeholder="Describe what this room is for..."
                        value={newRoom.description}
                        onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Topic (Optional)</label>
                      <Input
                        placeholder="e.g., Anxiety, Depression, General Support"
                        value={newRoom.topic}
                        onChange={(e) => setNewRoom({...newRoom, topic: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Type</label>
                      <Select value={newRoom.room_type} onValueChange={(value) => setNewRoom({...newRoom, room_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="support">Support Group</SelectItem>
                          <SelectItem value="general">General Chat</SelectItem>
                          <SelectItem value="peer">Peer Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateRoomOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRoom}>Create Room</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.available_rooms}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">My Rooms</p>
                    <p className="text-2xl font-bold text-green-600">{stats.user_rooms}</p>
                  </div>
                  <Crown className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created Rooms</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.created_rooms}</p>
                  </div>
                  <Plus className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Messages</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.total_messages}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for different room views */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="my-rooms">My Rooms</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatRooms.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg font-medium">No chat rooms available</p>
                    <p className="text-sm text-gray-500 mt-2 mb-6">Be the first to create a chat room and start connecting!</p>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={() => setIsCreateRoomOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Room
                      </Button>
                      <Button 
                        onClick={createTestRoom}
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Quick Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                chatRooms.map((room) => (
                  <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} onCopyCode={copyRoomCode} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="my-rooms" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRooms.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <Crown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">You haven't joined any rooms yet</p>
                    <p className="text-sm text-gray-500 mt-2">Join a room or create your own!</p>
                  </CardContent>
                </Card>
              ) : (
                myRooms.map((room) => (
                  <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} onCopyCode={copyRoomCode} isMyRoom />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="available" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatRooms.filter(room => room.is_active).length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No available rooms</p>
                    <p className="text-sm text-gray-500 mt-2">All rooms are currently full</p>
                  </CardContent>
                </Card>
              ) : (
                chatRooms.filter(room => room.is_active).map((room) => (
                  <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} onCopyCode={copyRoomCode} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle>Chat Room Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Be respectful and supportive of all participants</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Keep conversations focused on mental health support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Respect privacy - don't share personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Report any concerning behavior to moderators</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Room Card Component
interface RoomCardProps {
  room: ChatRoom;
  onJoin: (roomId: number) => void;
  onCopyCode: (code: string) => void;
  isMyRoom?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin, onCopyCode, isMyRoom = false }) => {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
      onClick={() => onJoin(room.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{room.name}</CardTitle>
          <div className="flex gap-2">
            {(room.is_member || isMyRoom) && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <Crown className="w-3 h-3 mr-1" />
                Member
              </Badge>
            )}
            {room.is_moderated ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Lock className="w-3 h-3 mr-1" />
                Moderated
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Globe className="w-3 h-3 mr-1" />
                Open
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">{room.description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{room.active_users || 0} / {room.max_participants} online</span>
          </div>
          {room.topic && (
            <Badge variant="outline">{room.topic}</Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onJoin(room.id);
            }}
            disabled={!room.is_active}
          >
            {room.is_member || isMyRoom ? 'Open Chat' : 'Join & Chat'}
            <MessageCircle className="w-4 h-4 ml-2" />
          </Button>
          
          {/* Show room code if available */}
          {(room as any).room_code && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onCopyCode((room as any).room_code);
              }}
              className="px-3"
            >
              <Copy className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          <span>Created {new Date(room.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="mt-2 text-xs text-blue-600 font-medium">
          {room.is_member || isMyRoom ? 'Click to open chat room' : 'Click to join and enter chat'}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatRooms;