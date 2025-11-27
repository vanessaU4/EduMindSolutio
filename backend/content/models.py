from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Article(models.Model):
    """Educational articles about mental health"""
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    excerpt = models.TextField(max_length=300, help_text="Brief summary")
    content = models.TextField()
    tags = models.JSONField(default=list, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    featured_image = models.ImageField(upload_to='articles/', blank=True, null=True)
    estimated_read_time = models.PositiveIntegerField(default=5, help_text="Minutes")
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Video(models.Model):
    """Video content for mental health education"""
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    video_url = models.URLField(help_text="YouTube, Vimeo, or direct video URL")
    thumbnail_image = models.ImageField(upload_to='video_thumbnails/', blank=True, null=True)
    duration_seconds = models.PositiveIntegerField(help_text="Video duration in seconds")
    tags = models.JSONField(default=list, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title


class AudioContent(models.Model):
    """Audio content like guided meditations, podcasts"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    audio_type = models.CharField(max_length=20)
    audio_file = models.FileField(upload_to='audio/', blank=True, null=True)
    audio_url = models.URLField(blank=True, null=True, help_text="External audio URL")
    duration_seconds = models.IntegerField(help_text="Audio duration in seconds", default=1, null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    thumbnail_image = models.ImageField(upload_to='audio_thumbnails/', blank=True, null=True)
    play_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title


class MentalHealthResource(models.Model):
    """Directory of mental health resources and services"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    resource_type = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    address = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    services_offered = models.JSONField(default=list, blank=True)
    specializations = models.JSONField(default=list, blank=True)
    age_groups_served = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)
    hours_of_operation = models.JSONField(default=dict, blank=True)
    is_24_7 = models.BooleanField(default=False)
    accepts_walk_ins = models.BooleanField(default=False)
    cost_level = models.CharField(max_length=20, default='varies')
    insurance_accepted = models.JSONField(default=list, blank=True)
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ArticleLike(models.Model):
    """Track user likes for articles"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='user_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'article']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} likes {self.article.title}"


class ArticleView(models.Model):
    """Track article views for analytics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='user_views')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"View of {self.article.title} by {self.user.username if self.user else 'Anonymous'}"


class ArticleShare(models.Model):
    """Track article shares for analytics"""
    SHARE_METHOD_CHOICES = [
        ('native_share', 'Native Share'),
        ('copy_link', 'Copy Link'),
        ('social_media', 'Social Media'),
        ('email', 'Email'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='user_shares')
    method = models.CharField(max_length=20, choices=SHARE_METHOD_CHOICES, default='copy_link')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Share of {self.article.title} via {self.method}"


class VideoLike(models.Model):
    """Track user likes for videos"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='user_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'video']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} likes {self.video.title}"


class VideoView(models.Model):
    """Track video views for analytics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='user_views')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"View of {self.video.title} by {self.user.username if self.user else 'Anonymous'}"


class VideoShare(models.Model):
    """Track video shares for analytics"""
    SHARE_METHOD_CHOICES = [
        ('native_share', 'Native Share'),
        ('copy_link', 'Copy Link'),
        ('social_media', 'Social Media'),
        ('email', 'Email'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='user_shares')
    method = models.CharField(max_length=20, choices=SHARE_METHOD_CHOICES, default='copy_link')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Share of {self.video.title} via {self.method}"


class AudioLike(models.Model):
    """Track user likes for audio content"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    audio = models.ForeignKey(AudioContent, on_delete=models.CASCADE, related_name='user_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'audio']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} likes {self.audio.title}"


class AudioView(models.Model):
    """Track audio plays for analytics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    audio = models.ForeignKey(AudioContent, on_delete=models.CASCADE, related_name='user_views')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Play of {self.audio.title} by {self.user.username if self.user else 'Anonymous'}"


class AudioShare(models.Model):
    """Track audio shares for analytics"""
    SHARE_METHOD_CHOICES = [
        ('native_share', 'Native Share'),
        ('copy_link', 'Copy Link'),
        ('social_media', 'Social Media'),
        ('email', 'Email'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    audio = models.ForeignKey(AudioContent, on_delete=models.CASCADE, related_name='user_shares')
    method = models.CharField(max_length=20, choices=SHARE_METHOD_CHOICES, default='copy_link')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Share of {self.audio.title} via {self.method}"
