#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from notifications.utils import create_notification

User = get_user_model()

# Get or create test user
test_email = 'test@example.com'
try:
    user = User.objects.get(email=test_email)
    print(f"Using existing user: {user.email}")
except User.DoesNotExist:
    user = User.objects.create_user(
        email=test_email,
        username='testuser',
        password='testpass123',
        first_name='Test',
        last_name='User',
        is_active=True,
        is_approved=True
    )
    print(f"Created test user: {user.email}")

# Create test notifications
notifications = [
    {
        'notification_type': 'user_registration',
        'title': 'Welcome to EduMindSolutions!',
        'message': 'Your account has been created successfully.',
        'priority': 'medium'
    },
    {
        'notification_type': 'community_reply',
        'title': 'New Reply to Your Post',
        'message': 'Someone replied to your community post about anxiety management.',
        'priority': 'low',
        'action_url': '/community/posts/123',
        'action_text': 'View Reply'
    },
    {
        'notification_type': 'assessment_reminder',
        'title': 'Weekly Assessment Due',
        'message': 'Your weekly mental health assessment is ready to complete.',
        'priority': 'high',
        'action_url': '/assessments/weekly',
        'action_text': 'Take Assessment'
    },
    {
        'notification_type': 'crisis_alert',
        'title': 'Crisis Support Available',
        'message': 'If you need immediate help, crisis support is available 24/7.',
        'priority': 'urgent',
        'action_url': '/crisis',
        'action_text': 'Get Help Now'
    }
]

print(f"\nCreating {len(notifications)} test notifications for {user.email}...")

for notif in notifications:
    create_notification(
        user=user,
        notification_type=notif['notification_type'],
        title=notif['title'],
        message=notif['message'],
        priority=notif['priority'],
        action_url=notif.get('action_url', ''),
        action_text=notif.get('action_text', '')
    )
    print(f"Created: {notif['title']}")

print(f"\n=== Test Complete ===")
print(f"User: {user.email}")
print(f"Password: testpass123")
print(f"Total notifications: {user.notifications.count()}")
print(f"\nTo test:")
print(f"1. Login with test user credentials")
print(f"2. Check notification bell in top bar")
print(f"3. API: GET http://localhost:8000/api/notifications/")