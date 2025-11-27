from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from content.models import Article, Video, AudioContent
from .utils import create_notification

User = get_user_model()

@receiver(post_save, sender=Article)
def notify_article_created(sender, instance, created, **kwargs):
    if created and instance.is_published:
        users = User.objects.filter(is_active=True)
        for user in users:
            create_notification(
                user=user,
                notification_type='content_recommendation',
                title='New Article Published',
                message=f'Check out the new article: {instance.title}',
                priority='low',
                action_url=f'/education/articles/{instance.id}',
                action_text='Read Article'
            )

@receiver(post_save, sender=Video)
def notify_video_created(sender, instance, created, **kwargs):
    if created and instance.is_published:
        users = User.objects.filter(is_active=True)
        for user in users:
            create_notification(
                user=user,
                notification_type='content_recommendation',
                title='New Video Available',
                message=f'Watch the new video: {instance.title}',
                priority='low',
                action_url=f'/education/videos/{instance.id}',
                action_text='Watch Video'
            )

@receiver(post_save, sender=AudioContent)
def notify_audio_created(sender, instance, created, **kwargs):
    if created and instance.is_published:
        users = User.objects.filter(is_active=True)
        for user in users:
            create_notification(
                user=user,
                notification_type='content_recommendation',
                title='New Audio Content',
                message=f'Listen to: {instance.title}',
                priority='low',
                action_url=f'/education/audio/{instance.id}',
                action_text='Listen Now'
            )

@receiver(post_save, sender=User)
def notify_user_actions(sender, instance, created, **kwargs):
    if created:
        # Notify admins of new user
        admins = User.objects.filter(role='admin', is_active=True)
        for admin in admins:
            create_notification(
                user=admin,
                notification_type='user_registration',
                title='New User Registered',
                message=f'{instance.first_name} {instance.last_name} ({instance.email}) joined.',
                priority='medium',
                action_url='/admin/users',
                action_text='View Users'
            )

# Assessment notifications will be added when assessment models are available