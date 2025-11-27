from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
    
    def ready(self):
        try:
            import notifications.signals
            import notifications.admin_signals
        except ImportError:
            pass
    verbose_name = 'Notifications'
