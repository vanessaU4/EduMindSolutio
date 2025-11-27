export type NotificationType = 
  | 'community_reply'
  | 'community_like'
  | 'assessment_reminder'
  | 'crisis_alert'
  | 'peer_match'
  | 'guide_message'
  | 'system_update'
  | 'achievement'
  | 'mood_checkin'
  | 'content_recommendation';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: number;
  notification_type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url: string;
  action_text: string;
  metadata: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  expires_at: string | null;
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
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  updated_at: string;
}

export interface NotificationListResponse {
  results: Notification[];
  unread_count: number;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}
