#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from notifications.utils import create_notification

User = get_user_model()

# Get admin user
try:
    admin = User.objects.get(email='admin@edumindsolution.com')
    print(f"Creating notifications for admin: {admin.email}")
except User.DoesNotExist:
    print("Admin user not found")
    exit()

# Get all regular users
users = User.objects.filter(role='user', is_active=True)
print(f"Found {users.count()} regular users")

# Create admin notifications
admin_notifications = [
    {
        'type': 'user_registration',
        'title': 'New User Registered',
        'message': 'A new user has joined the platform.',
        'priority': 'medium',
        'action_url': '/admin/users',
        'action_text': 'View Users'
    },
    {
        'type': 'system_update',
        'title': 'System Update Available',
        'message': 'New features and improvements are ready.',
        'priority': 'low',
        'action_url': '/admin',
        'action_text': 'View Admin Panel'
    },
    {
        'type': 'crisis_alert',
        'title': 'Crisis Alert Triggered',
        'message': 'A user has triggered a crisis alert. Immediate attention required.',
        'priority': 'urgent',
        'action_url': '/admin/crisis',
        'action_text': 'Handle Crisis'
    }
]

for notif in admin_notifications:
    create_notification(
        user=admin,
        notification_type=notif['type'],
        title=notif['title'],
        message=notif['message'],
        priority=notif['priority'],
        action_url=notif['action_url'],
        action_text=notif['action_text']
    )
    print(f"Created admin notification: {notif['title']}")

# Create user notifications
user_notifications = [
    {
        'type': 'user_registration',
        'title': 'Welcome to EduMindSolutions!',
        'message': 'Your account is ready. Start exploring mental health resources.',
        'priority': 'medium',
        'action_url': '/dashboard',
        'action_text': 'Go to Dashboard'
    },
    {
        'type': 'assessment_reminder',
        'title': 'Weekly Assessment Due',
        'message': 'Complete your weekly mental health check-in.',
        'priority': 'high',
        'action_url': '/assessments',
        'action_text': 'Take Assessment'
    },
    {
        'type': 'community_reply',
        'title': 'New Reply in Forum',
        'message': 'Someone replied to your post in the community forum.',
        'priority': 'low',
        'action_url': '/community/forums',
        'action_text': 'View Reply'
    },
    {
        'type': 'content_recommendation',
        'title': 'New Articles Available',
        'message': 'Check out our latest mental health articles.',
        'priority': 'low',
        'action_url': '/education/articles',
        'action_text': 'Read Articles'
    },
    {
        'type': 'guide_message',
        'title': 'Message from Your Guide',
        'message': 'Your mental health guide has sent you a message.',
        'priority': 'medium',
        'action_url': '/messages',
        'action_text': 'Read Message'
    }
]

for user in users:
    for notif in user_notifications:
        create_notification(
            user=user,
            notification_type=notif['type'],
            title=notif['title'],
            message=notif['message'],
            priority=notif['priority'],
            action_url=notif['action_url'],
            action_text=notif['action_text']
        )
    print(f"Created {len(user_notifications)} notifications for: {user.email}")

print(f"\nDone! Created notifications for admin and {users.count()} users.")
print("Login to frontend to see notifications in the bell icon.")