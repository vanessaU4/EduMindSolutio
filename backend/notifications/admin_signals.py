from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .utils import create_notification

User = get_user_model()

@receiver(post_save, sender=LogEntry)
def notify_admin_actions(sender, instance, created, **kwargs):
    if created:
        # Get all users to notify about admin actions
        users = User.objects.filter(is_active=True)
        
        action_map = {
            ADDITION: 'created',
            CHANGE: 'updated', 
            DELETION: 'deleted'
        }
        
        action = action_map.get(instance.action_flag, 'modified')
        
        # Create notifications for different admin actions
        if 'article' in instance.object_repr.lower():
            title = f'Article {action.title()}'
            message = f'An article has been {action} by admin.'
            action_url = '/education/articles'
            
        elif 'video' in instance.object_repr.lower():
            title = f'Video {action.title()}'
            message = f'A video has been {action} by admin.'
            action_url = '/education/videos'
            
        elif 'user' in instance.object_repr.lower():
            title = f'User {action.title()}'
            message = f'A user account has been {action} by admin.'
            action_url = '/profile'
            
        elif 'assessment' in instance.object_repr.lower():
            title = f'Assessment {action.title()}'
            message = f'An assessment has been {action} by admin.'
            action_url = '/assessments'
            
        else:
            title = f'System {action.title()}'
            message = f'System content has been {action} by admin.'
            action_url = '/dashboard'
        
        # Notify all users about admin actions
        for user in users:
            create_notification(
                user=user,
                notification_type='system_update',
                title=title,
                message=message,
                priority='low',
                action_url=action_url,
                action_text='View Changes'
            )