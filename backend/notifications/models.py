from django.db import models
from django.utils import timezone
from accounts.models import User


class Notification(models.Model):
    """Model for user notifications"""
    
    NOTIFICATION_TYPES = [
        ('community_reply', 'Community Reply'),
        ('community_like', 'Community Like'),
        ('assessment_reminder', 'Assessment Reminder'),
        ('crisis_alert', 'Crisis Alert'),
        ('peer_match', 'Peer Match'),
        ('guide_message', 'Guide Message'),
        ('system_update', 'System Update'),
        ('achievement', 'Achievement'),
        ('mood_checkin', 'Mood Check-in'),
        ('content_recommendation', 'Content Recommendation'),
        ('user_registration', 'User Registration'),
        ('user_approved', 'User Approved'),
        ('account_activated', 'Account Activated'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Core fields
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        help_text="User receiving the notification"
    )
    notification_type = models.CharField(
        max_length=50, 
        choices=NOTIFICATION_TYPES,
        help_text="Type of notification"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_LEVELS,
        default='medium',
        help_text="Priority level of notification"
    )
    
    # Content
    title = models.CharField(
        max_length=200,
        help_text="Notification title/headline"
    )
    message = models.TextField(
        help_text="Notification message body"
    )
    action_url = models.CharField(
        max_length=500,
        blank=True,
        help_text="Optional URL for notification action"
    )
    action_text = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional text for action button"
    )
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional notification metadata"
    )
    
    # Status tracking
    is_read = models.BooleanField(
        default=False,
        help_text="Whether user has read the notification"
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When notification was read"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="When notification was created"
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Optional expiration time for notification"
    )
    
    class Meta:
        db_table = 'notifications_notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} for {self.user.email}: {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def is_expired(self):
        """Check if notification has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class NotificationPreference(models.Model):
    """Model for user notification preferences"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preference',
        primary_key=True
    )
    
    # Channel preferences
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    
    # Type preferences
    community_notifications = models.BooleanField(default=True)
    assessment_reminders = models.BooleanField(default=True)
    crisis_alerts = models.BooleanField(default=True)
    guide_messages = models.BooleanField(default=True)
    system_updates = models.BooleanField(default=True)
    user_registration_notifications = models.BooleanField(default=True)
    user_approval_notifications = models.BooleanField(default=True)
    account_activation_notifications = models.BooleanField(default=True)
    
    # Timing preferences
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notifications_preference'
    
    def __str__(self):
        return f"Notification preferences for {self.user.email}"
