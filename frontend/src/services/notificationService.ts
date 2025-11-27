import apiClient from './apiClient';

export interface Notification {
  id: number;
  notification_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  metadata: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
  time_ago: string;
  is_expired: boolean;
}

export interface NotificationPreference {
  email_enabled: boolean;
  push_enabled: boolean;
  community_notifications: boolean;
  assessment_reminders: boolean;
  crisis_alerts: boolean;
  guide_messages: boolean;
  system_updates: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  updated_at: string;
}

class NotificationService {
  async getNotifications(): Promise<{ results: Notification[]; unread_count: number }> {
    return apiClient.get('/notifications/notifications/');
  }

  async getUnreadNotifications(): Promise<{ results: Notification[]; count: number }> {
    return apiClient.get('/notifications/notifications/unread/');
  }

  async markAsRead(id: number): Promise<Notification> {
    return apiClient.post(`/notifications/notifications/${id}/mark_read/`);
  }

  async markAllAsRead(): Promise<{ message: string; count: number }> {
    return apiClient.post('/notifications/notifications/mark_all_read/');
  }

  async deleteNotification(id: number): Promise<void> {
    return apiClient.delete(`/notifications/notifications/${id}/`);
  }

  async clearAllRead(): Promise<{ message: string; count: number }> {
    return apiClient.delete('/notifications/notifications/clear_all/');
  }

  async getStats(): Promise<any> {
    return apiClient.get('/notifications/notifications/stats/');
  }

  async getPreferences(): Promise<NotificationPreference> {
    return apiClient.get('/notifications/notification-preferences/');
  }

  async updatePreferences(preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
    return apiClient.put('/notifications/notification-preferences/', preferences);
  }
}

export const notificationService = new NotificationService();
export default notificationService;