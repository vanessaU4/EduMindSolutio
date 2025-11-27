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

# Get all users
users = User.objects.filter(is_active=True)

if not users.exists():
    print("No users found. Please create users first.")
    exit()

print(f"Creating notifications for {users.count()} users...")

for user in users:
    # Create welcome notification
    create_notification(
        user=user,
        notification_type='user_registration',
        title='Welcome to EduMindSolutions!',
        message=f'Hello {user.first_name or user.username}! Your account is ready. Explore our mental health resources.',
        priority='medium',
        action_url='/dashboard',
        action_text='Go to Dashboard'
    )
    
    # Create content notification
    create_notification(
        user=user,
        notification_type='content_recommendation',
        title='New Articles Available',
        message='Check out our latest mental health articles and educational content.',
        priority='low',
        action_url='/education/articles',
        action_text='View Articles'
    )
    
    # Create assessment reminder
    create_notification(
        user=user,
        notification_type='assessment_reminder',
        title='Weekly Check-in Available',
        message='Take a moment to complete your weekly mental health assessment.',
        priority='high',
        action_url='/assessments',
        action_text='Take Assessment'
    )
    
    print(f"Created notifications for: {user.email}")

print(f"\nDone! Created 3 notifications for each user.")
print(f"Users can now see notifications in the bell icon at top-right of the page.")