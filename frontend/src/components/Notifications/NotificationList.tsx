import React from 'react';
import { Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/services/notificationService';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: number) => void;
  onRefresh: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  onMarkAsRead,
  onRefresh
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">No new notifications</p>
        <Button variant="ghost" size="sm" onClick={onRefresh} className="mt-2">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="max-h-96">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>
      <ScrollArea className="max-h-80">
        {notifications.map((notification) => (
          <div key={notification.id} className="p-3 border-b hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(notification.priority)}`} />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {notification.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{notification.time_ago}</span>
                  <div className="flex items-center gap-1">
                    {notification.action_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={notification.action_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default NotificationList;