from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'notification_type', 'title', 
        'priority', 'is_read', 'created_at'
    ]
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['user__email', 'user__username', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User & Type', {
            'fields': ('user', 'notification_type', 'priority')
        }),
        ('Content', {
            'fields': ('title', 'message', 'action_url', 'action_text')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at', 'created_at', 'expires_at')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'email_enabled', 'push_enabled',
        'community_notifications', 'assessment_reminders',
        'crisis_alerts', 'updated_at'
    ]
    list_filter = [
        'email_enabled', 'push_enabled', 
        'community_notifications', 'assessment_reminders'
    ]
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['updated_at']
