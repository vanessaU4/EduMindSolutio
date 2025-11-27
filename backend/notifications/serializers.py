from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    time_ago = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'priority', 'title', 
            'message', 'action_url', 'action_text', 'metadata',
            'is_read', 'read_at', 'created_at', 'expires_at',
            'time_ago', 'is_expired'
        ]
        read_only_fields = ['created_at', 'read_at', 'time_ago', 'is_expired']
    
    def get_time_ago(self, obj):
        """Get human-readable time ago string"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        elif diff < timedelta(days=30):
            weeks = diff.days // 7
            return f"{weeks} week{'s' if weeks != 1 else ''} ago"
        else:
            return obj.created_at.strftime("%b %d, %Y")
    
    def get_is_expired(self, obj):
        """Check if notification is expired"""
        return obj.is_expired()


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for NotificationPreference model"""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'email_enabled', 'push_enabled',
            'community_notifications', 'assessment_reminders',
            'crisis_alerts', 'guide_messages', 'system_updates',
            'quiet_hours_start', 'quiet_hours_end', 'updated_at'
        ]
        read_only_fields = ['updated_at']


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications"""
    
    class Meta:
        model = Notification
        fields = [
            'user', 'notification_type', 'priority', 
            'title', 'message', 'action_url', 'action_text',
            'metadata', 'expires_at'
        ]
