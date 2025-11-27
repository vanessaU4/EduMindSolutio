from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import json

User = get_user_model()

class MoodEntry(models.Model):
    """Model to store user mood entries with emotion analysis"""
    
    EMOTION_CHOICES = [
        ('happy', 'Happy'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
        ('surprised', 'Surprised'),
        ('neutral', 'Neutral'),
        ('fear', 'Fear'),
        ('disgust', 'Disgust'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='camera_mood_entries')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Primary emotion detected
    emotion = models.CharField(max_length=20, choices=EMOTION_CHOICES)
    confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Confidence score between 0 and 1"
    )
    
    # Detailed emotion breakdown (JSON field)
    emotions_breakdown = models.JSONField(
        default=dict,
        help_text="Breakdown of all emotions with scores"
    )
    
    # Optional user notes
    notes = models.TextField(blank=True, null=True)
    
    # Optional image data (base64 encoded)
    image_data = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mood_entries'
        ordering = ['-timestamp']
        verbose_name = 'Mood Entry'
        verbose_name_plural = 'Mood Entries'
    
    def __str__(self):
        return f"{self.user.username} - {self.emotion} ({self.timestamp.date()})"
    
    def get_emotion_percentage(self):
        """Get confidence as percentage"""
        return round(self.confidence * 100, 1)
    
    def get_emotions_breakdown_formatted(self):
        """Get formatted emotions breakdown"""
        if not self.emotions_breakdown:
            return {}
        
        # Sort emotions by value (highest first)
        sorted_emotions = sorted(
            self.emotions_breakdown.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        return {emotion: round(value * 100, 1) for emotion, value in sorted_emotions}


class MoodAnalysisSession(models.Model):
    """Model to track mood analysis sessions and performance"""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='camera_mood_sessions')
    session_id = models.CharField(max_length=100, unique=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    # Analysis metadata
    processing_time = models.FloatField(null=True, blank=True, help_text="Time in seconds")
    analysis_method = models.CharField(max_length=50, default='mock', help_text="AI service used")
    
    # Session statistics
    total_captures = models.IntegerField(default=0)
    successful_analyses = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'mood_analysis_sessions'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Session {self.session_id} - {self.user.username}"
    
    def get_success_rate(self):
        """Calculate success rate of analyses in this session"""
        if self.total_captures == 0:
            return 0
        return round((self.successful_analyses / self.total_captures) * 100, 1)


class MoodTrend(models.Model):
    """Model to store aggregated mood trends for analytics"""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='camera_mood_trends')
    date = models.DateField()
    
    # Daily aggregations
    dominant_emotion = models.CharField(max_length=20, choices=MoodEntry.EMOTION_CHOICES)
    average_confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    total_entries = models.IntegerField(default=0)
    
    # Emotion distribution for the day
    emotion_distribution = models.JSONField(
        default=dict,
        help_text="Distribution of emotions throughout the day"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mood_trends'
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.username} - {self.date} ({self.dominant_emotion})"


class MoodInsight(models.Model):
    """Model to store AI-generated insights about user mood patterns"""
    
    INSIGHT_TYPES = [
        ('pattern', 'Pattern Recognition'),
        ('trend', 'Trend Analysis'),
        ('recommendation', 'Recommendation'),
        ('alert', 'Alert'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='camera_mood_insights')
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPES)
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Insight metadata
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Confidence in this insight"
    )
    
    # Related data
    related_entries = models.ManyToManyField(MoodEntry, blank=True)
    date_range_start = models.DateField()
    date_range_end = models.DateField()
    
    # Status
    is_active = models.BooleanField(default=True)
    is_acknowledged = models.BooleanField(default=False)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'mood_insights'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
