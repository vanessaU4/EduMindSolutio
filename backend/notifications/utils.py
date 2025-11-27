from django.utils import timezone
from .models import Notification, NotificationPreference

def create_notification(user, notification_type, title, message, priority='medium', action_url='', action_text='', metadata=None, expires_at=None):
    """Create a notification for a user"""
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        priority=priority,
        action_url=action_url,
        action_text=action_text,
        metadata=metadata or {},
        expires_at=expires_at
    )

def notify_user_registration(user):
    """Send notification when user registers"""
    create_notification(
        user=user,
        notification_type='user_registration',
        title='Welcome to EduMindSolutions!',
        message='Your account has been created successfully. Start exploring our mental health resources.',
        priority='medium',
        action_url='/dashboard',
        action_text='Go to Dashboard'
    )

def notify_account_activated(user):
    """Send notification when account is activated"""
    create_notification(
        user=user,
        notification_type='account_activated',
        title='Account Activated',
        message='Your account is now active and ready to use.',
        priority='high'
    )