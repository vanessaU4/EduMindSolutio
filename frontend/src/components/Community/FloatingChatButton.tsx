import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, X, Users, Plus, ArrowRight,
  Minimize2, Maximize2
} from 'lucide-react';
import { communityService, ChatRoom } from '@/services/communityService';
import { useNavigate } from 'react-router-dom';
import QuickChatAccess from './QuickChatAccess';

interface FloatingChatButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnPages?: string[]; // Show only on specific pages
  hideOnPages?: string[]; // Hide on specific pages
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  position = 'bottom-right',
  showOnPages,
  hideOnPages
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeRoomsCount, setActiveRoomsCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadActiveRoomsCount();
    // Update count every 30 seconds
    const interval = setInterval(loadActiveRoomsCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveRoomsCount = async () => {
    try {
      const roomsData = await communityService.getChatRooms();
      setActiveRoomsCount(roomsData.length);
    } catch (error) {
      console.error('Failed to load active rooms count:', error);
    }
  };

  const handleJoinRoom = (roomId: number) => {
    setIsOpen(false);
    navigate(`/community/chat?join=${roomId}`);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  const getPopupPosition = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-16 left-0';
      case 'top-right':
        return 'top-16 right-0';
      case 'top-left':
        return 'top-16 left-0';
      case 'bottom-right':
      default:
        return 'bottom-16 right-0';
    }
  };

  // Check if we should show the button on current page
  const currentPath = window.location.pathname;
  if (showOnPages && !showOnPages.some(page => currentPath.includes(page))) {
    return null;
  }
  if (hideOnPages && hideOnPages.some(page => currentPath.includes(page))) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`absolute ${getPopupPosition()} w-80 mb-2`}
          >
            <Card className="shadow-lg border-2">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-3 border-b">
                  <h3 className="font-semibold text-sm">Quick Chat Access</h3>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsMinimized(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsOpen(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <QuickChatAccess 
                    onJoinRoom={handleJoinRoom}
                    showCreateOption={true}
                    maxRoomsToShow={3}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute ${getPopupPosition()} mb-2`}
          >
            <Card className="shadow-lg">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium">Chat minimized</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsMinimized(false)}
                    className="h-6 w-6 p-0"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          size="sm"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {activeRoomsCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500 text-white"
              >
                {activeRoomsCount > 9 ? '9+' : activeRoomsCount}
              </Badge>
            )}
          </div>
        </Button>
      </motion.div>
    </div>
  );
};

export default FloatingChatButton;
