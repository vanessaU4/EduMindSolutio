from django.apps import AppConfig


class MoodConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mood'
    verbose_name = 'Mood Tracking'
    
    def ready(self):
        # Import signals if any
        pass
