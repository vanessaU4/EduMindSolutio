import React from 'react';
import ChatWidget from '../Community/ChatWidget';
import QuickChatAccess from '../Community/QuickChatAccess';

interface DashboardChatSectionProps {
  variant?: 'widget' | 'quick' | 'compact';
  showStats?: boolean;
}

const DashboardChatSection: React.FC<DashboardChatSectionProps> = ({ 
  variant = 'widget',
  showStats = true 
}) => {
  switch (variant) {
    case 'quick':
      return (
        <QuickChatAccess 
          showCreateOption={true}
          maxRoomsToShow={3}
        />
      );
    
    case 'compact':
      return (
        <ChatWidget 
          title="Quick Chat"
          showStats={false}
          maxRooms={2}
          showCreateButton={true}
          compact={true}
        />
      );
    
    case 'widget':
    default:
      return (
        <ChatWidget 
          title="Community Chat"
          showStats={showStats}
          maxRooms={4}
          showCreateButton={true}
          compact={false}
        />
      );
  }
};

export default DashboardChatSection;
