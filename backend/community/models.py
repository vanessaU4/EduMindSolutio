from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinLengthValidator, MinValueValidator, MaxValueValidator

class ForumCategory(models.Model):
    """Categories for organizing forum discussions"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class name")
    color = models.CharField(max_length=7, default="#3B82F6", help_text="Hex color code")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'community_forum_category'
        verbose_name = 'Forum Category'
        verbose_name_plural = 'Forum Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

class ForumPost(models.Model):
    """Main forum posts/topics"""
    MOOD_CHOICES = [
        ('struggling', 'Struggling'),
        ('neutral', 'Neutral'),
        ('hopeful', 'Hopeful'),
        ('positive', 'Positive'),
    ]

    title = models.CharField(max_length=200, validators=[MinLengthValidator(5)])
    content = models.TextField(validators=[MinLengthValidator(10)])
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_posts')
    category = models.ForeignKey(ForumCategory, on_delete=models.CASCADE, related_name='posts')

    # Privacy and moderation
    is_anonymous = models.BooleanField(default=True)
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)

    # Engagement tracking
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)

    # Mood context
    author_mood = models.CharField(max_length=20, choices=MOOD_CHOICES, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'community_forum_post'
        ordering = ['-last_activity']

    def __str__(self):
        return self.title

    @property
    def author_display_name(self):
        if self.is_anonymous:
            return f"Anonymous User {self.author.id}"
        return self.author.display_name

class ForumComment(models.Model):
    """Comments on forum posts with nested reply support"""
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(validators=[MinLengthValidator(1)])
    is_anonymous = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True)
    like_count = models.PositiveIntegerField(default=0)
    reply_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'community_forum_comment'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username}: {self.content[:50]}"

    @property
    def author_display_name(self):
        if self.is_anonymous:
            return f"Anonymous User {self.author.id}"
        return self.author.display_name
    
    @property
    def is_reply(self):
        return self.parent is not None
    
    def get_thread_comments(self):
        """Get all comments in this thread (parent + replies)"""
        if self.parent:
            return self.parent.replies.filter(is_approved=True).order_by('created_at')
        return self.replies.filter(is_approved=True).order_by('created_at')

class PostLike(models.Model):
    """Track likes on posts"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'community_post_like'
        unique_together = ['user', 'post']

    def __str__(self):
        return f"{self.user.username} likes {self.post.title}"


class CommentLike(models.Model):
    """Track likes on comments"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.ForeignKey(ForumComment, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'community_comment_like'
        unique_together = ['user', 'comment']

    def __str__(self):
        return f"{self.user.username} likes comment {self.comment.id}"

class PeerSupportMatch(models.Model):
    """Peer-to-peer support matching system"""
    STATUS_CHOICES = [
        ('pending_approval', 'Pending Admin/Guide Approval'),
        ('pending', 'Pending Match'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    ]

    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'), 
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    CONTACT_CHOICES = [
        ('chat', 'Text Chat'),
        ('video', 'Video Call'),
        ('phone', 'Phone Call'),
        ('email', 'Email'),
    ]

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_requests'
    )
    supporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_provided',
        null=True, blank=True
    )
    
    # Request details
    reason = models.CharField(max_length=200, help_text="Brief reason for support")
    description = models.TextField(help_text="Detailed description of support needed")
    urgency_level = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    
    # Matching criteria
    preferred_topics = models.JSONField(default=list, help_text="Topics user wants support with")
    preferred_age_range = models.CharField(max_length=20, blank=True)
    preferred_gender = models.CharField(max_length=20, blank=True)
    contact_preference = models.CharField(max_length=20, choices=CONTACT_CHOICES, default='chat')
    availability = models.TextField(blank=True, help_text="User's availability schedule")
    previous_support = models.BooleanField(default=False, help_text="Has received peer support before")
    
    # Approval workflow
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='approved_support_requests',
        null=True, blank=True,
        help_text="Admin or Guide who approved this request"
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, help_text="Reason for rejection if applicable")

    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_approval')
    matched_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Feedback
    requester_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    supporter_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'community_peer_support_match'
        ordering = ['-created_at']

    def __str__(self):
        return f"Support match: {self.requester.username} - {self.status}"

class ModerationReport(models.Model):
    """Reports for inappropriate content"""
    REPORT_TYPES = [
        ('inappropriate_content', 'Inappropriate Content'),
        ('harassment', 'Harassment'),
        ('spam', 'Spam'),
        ('self_harm', 'Self-harm Content'),
        ('crisis', 'Crisis Situation'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_made')
    report_type = models.CharField(max_length=30, choices=REPORT_TYPES)
    description = models.TextField()

    # Content being reported (one of these will be filled)
    reported_post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, null=True, blank=True)
    reported_comment = models.ForeignKey(ForumComment, on_delete=models.CASCADE, null=True, blank=True)
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='reports_against'
    )

    # Moderation
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    moderator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='moderated_reports'
    )
    moderator_notes = models.TextField(blank=True)
    action_taken = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'community_moderation_report'
        ordering = ['-created_at']

    def __str__(self):
        return f"Report: {self.report_type} - {self.status}"

class ChatRoom(models.Model):
    """Real-time chat rooms for peer support - designed for 3 users"""
    ROOM_TYPES = [
        ('support', 'Support Group'),
        ('study', 'Study Session'),
        ('social', 'Social Chat'),
        ('therapy', 'Therapy Circle'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    topic = models.CharField(max_length=100, blank=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='support')
    max_participants = models.PositiveIntegerField(default=100)  # Allow up to 100 users
    is_active = models.BooleanField(default=True)
    is_moderated = models.BooleanField(default=True)
    is_private = models.BooleanField(default=False)
    room_code = models.CharField(max_length=10, unique=True, blank=True)
    
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_chatrooms'
    )
    
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='ChatRoomParticipant',
        related_name='joined_chatrooms'
    )

    moderators = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='moderated_chatrooms',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'community_chat_room'
        ordering = ['-last_activity']

    def __str__(self):
        return f"{self.name} ({self.get_participant_count()}/{self.max_participants})"
    
    def get_participant_count(self):
        return self.participants.count()
    
    def is_full(self):
        return self.get_participant_count() >= self.max_participants
    
    def can_join(self, user):
        return not self.is_full() and user not in self.participants.all()
    
    def save(self, *args, **kwargs):
        if not self.room_code:
            import random
            import string
            self.room_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        super().save(*args, **kwargs)


class ChatRoomParticipant(models.Model):
    """Through model for chat room participants"""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    last_seen = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'community_chat_room_participant'
        unique_together = ['room', 'user']
    
    def __str__(self):
        return f"{self.user.display_name} in {self.room.name}"

class ChatMessage(models.Model):
    """Messages in chat rooms"""
    MESSAGE_TYPES = [
        ('text', 'Text Message'),
        ('voice', 'Voice Message'),
        ('video', 'Video Message'),
        ('image', 'Image'),
        ('file', 'File'),
        ('system', 'System Message'),
    ]
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(blank=True, help_text="Text content for text messages")
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    
    # Media fields
    voice_file = models.FileField(upload_to='chat/voice/%Y/%m/', blank=True, null=True)
    video_file = models.FileField(upload_to='chat/video/%Y/%m/', blank=True, null=True)
    image_file = models.ImageField(upload_to='chat/images/%Y/%m/', blank=True, null=True)
    attachment_file = models.FileField(upload_to='chat/files/%Y/%m/', blank=True, null=True)
    
    # Media metadata
    duration = models.PositiveIntegerField(null=True, blank=True, help_text="Duration in seconds for voice/video")
    file_size = models.PositiveIntegerField(null=True, blank=True, help_text="File size in bytes")
    mime_type = models.CharField(max_length=100, blank=True)
    
    is_anonymous = models.BooleanField(default=True)
    is_system_message = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'community_chat_message'
        ordering = ['created_at']

    def __str__(self):
        if self.message_type == 'text':
            return f"{self.room.name}: {self.content[:50]}"
        else:
            return f"{self.room.name}: {self.get_message_type_display()}"

    @property
    def author_display_name(self):
        if self.is_system_message:
            return "System"
        if self.is_anonymous:
            return "Anonymous"  # Simple anonymous label
        return self.author.display_name
    
    @property
    def media_url(self):
        """Get the URL for the media file based on message type"""
        from django.conf import settings
        
        file_url = None
        if self.message_type == 'voice' and self.voice_file:
            file_url = self.voice_file.url
        elif self.message_type == 'video' and self.video_file:
            file_url = self.video_file.url
        elif self.message_type == 'image' and self.image_file:
            file_url = self.image_file.url
        elif self.message_type == 'file' and self.attachment_file:
            file_url = self.attachment_file.url
        
        if file_url:
            # Return full URL for frontend consumption
            if hasattr(settings, 'MEDIA_BASE_URL'):
                return f"{settings.MEDIA_BASE_URL}{file_url}"
            else:
                # Default to localhost for development
                return f"http://localhost:8000{file_url}"
        return None
    
    @property
    def media_filename(self):
        """Get the filename for the media file"""
        if self.message_type == 'voice' and self.voice_file:
            return self.voice_file.name.split('/')[-1]
        elif self.message_type == 'video' and self.video_file:
            return self.video_file.name.split('/')[-1]
        elif self.message_type == 'image' and self.image_file:
            return self.image_file.name.split('/')[-1]
        elif self.message_type == 'file' and self.attachment_file:
            return self.attachment_file.name.split('/')[-1]
        return None


class Call(models.Model):
    """Audio/Video calls in chat rooms"""
    CALL_TYPES = [
        ('audio', 'Audio Call'),
        ('video', 'Video Call'),
    ]
    
    CALL_STATUS = [
        ('active', 'Active'),
        ('ended', 'Ended'),
        ('connecting', 'Connecting'),
    ]
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='calls')
    call_type = models.CharField(max_length=10, choices=CALL_TYPES, default='audio')
    status = models.CharField(max_length=20, choices=CALL_STATUS, default='connecting')
    initiator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='initiated_calls')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, through='CallParticipant', related_name='calls')
    
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'community_call'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.get_call_type_display()} call in {self.room.name}"
    
    @property
    def duration(self):
        """Get call duration in seconds"""
        if self.ended_at:
            return (self.ended_at - self.started_at).total_seconds()
        elif self.status == 'active':
            from django.utils import timezone
            return (timezone.now() - self.started_at).total_seconds()
        return 0
    
    @property
    def participant_count(self):
        """Get number of participants"""
        return self.participants.count()


class CallParticipant(models.Model):
    """Participants in a call"""
    call = models.ForeignKey(Call, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    is_muted = models.BooleanField(default=False)
    is_video_off = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'community_call_participant'
        unique_together = ['call', 'user']
    
    def __str__(self):
        return f"{self.user.display_name} in {self.call}"
    
    @property
    def is_active(self):
        """Check if participant is still in the call"""
        return self.left_at is None
