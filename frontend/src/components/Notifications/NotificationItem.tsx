import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Heart,
  Calendar,
  AlertTriangle,
  Users,
  MessageSquare,
  Bell,
  Award,
  Smile,
  FileText,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import type { Notification, NotificationType } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  const iconClass = "h-5 w-5";
  
  switch (type) {
    case 'community_reply':
      return <MessageCircle className={iconClass} />;
    case 'community_like':
      return <Heart className={iconClass} />;
    case 'assessment_reminder':
      return <Calendar className={iconClass} />;
    case 'crisis_alert':
      return <AlertTriangle className={cn(iconClass, "text-red-500")} />;
    case 'peer_match':
      return <Users className={iconClass} />;
    case 'guide_message':
      return <MessageSquare className={iconClass} />;
    case 'system_update':
      return <Bell className={iconClass} />;
    case 'achievement':
      return <Award className={cn(iconClass, "text-yellow-500")} />;
    case 'mood_checkin':
      return <Smile className={iconClass} />;
    case 'content_recommendation':
      return <FileText className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'border-l-4 border-red-500 bg-red-50';
    case 'high':
      return 'border-l-4 border-orange-500 bg-orange-50';
    case 'medium':
      return 'border-l-4 border-blue-500';
    case 'low':
      return 'border-l-4 border-gray-300';
    default:
      return '';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      className={cn(
        'p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group',
        !notification.is_read && 'bg-blue-50/50',
        getPriorityColor(notification.priority)
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex-shrink-0 mt-1',
          notification.priority === 'urgent' && 'text-red-500',
          notification.priority === 'high' && 'text-orange-500',
          notification.priority === 'medium' && 'text-blue-500',
          notification.priority === 'low' && 'text-gray-500'
        )}>
          {getNotificationIcon(notification.notification_type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'text-sm font-medium',
              !notification.is_read && 'font-semibold'
            )}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {notification.time_ago}
            </span>
            
            {notification.action_text && (
              <span className="text-xs text-healthcare-primary font-medium">
                {notification.action_text} →
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </Button>
      </div>
    </div>
  );
};
