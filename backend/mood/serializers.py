from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MoodEntry, MoodAnalysisSession, MoodTrend, MoodInsight
import base64
import json
from datetime import datetime, timedelta

User = get_user_model()

class MoodEntrySerializer(serializers.ModelSerializer):
    """Serializer for mood entries"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    emotion_percentage = serializers.ReadOnlyField(source='get_emotion_percentage')
    emotions_breakdown_formatted = serializers.ReadOnlyField(source='get_emotions_breakdown_formatted')
    
    class Meta:
        model = MoodEntry
        fields = [
            'id', 'user', 'user_name', 'timestamp', 'emotion', 'confidence', 
            'emotion_percentage', 'emotions_breakdown', 'emotions_breakdown_formatted',
            'notes', 'image_data', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'timestamp', 'created_at', 'updated_at']
    
    def validate_emotions_breakdown(self, value):
        """Validate emotions breakdown structure"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Emotions breakdown must be a dictionary")
        
        expected_emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']
        
        for emotion in expected_emotions:
            if emotion not in value:
                raise serializers.ValidationError(f"Missing emotion: {emotion}")
            
            if not isinstance(value[emotion], (int, float)) or not (0 <= value[emotion] <= 1):
                raise serializers.ValidationError(f"Invalid value for {emotion}: must be between 0 and 1")
        
        return value
    
    def validate_image_data(self, value):
        """Validate base64 image data"""
        if value:
            try:
                # Check if it's valid base64
                if value.startswith('data:image'):
                    # Remove data URL prefix
                    value = value.split(',')[1]
                base64.b64decode(value)
            except Exception:
                raise serializers.ValidationError("Invalid base64 image data")
        
        return value


class MoodEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating mood entries"""
    
    class Meta:
        model = MoodEntry
        fields = [
            'emotion', 'confidence', 'emotions_breakdown', 'notes', 'image_data'
        ]
    
    def create(self, validated_data):
        """Create mood entry with current user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class EmotionAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for emotion analysis requests"""
    
    image_data = serializers.CharField()
    include_breakdown = serializers.BooleanField(default=True)
    analysis_method = serializers.ChoiceField(
        choices=['mock', 'azure', 'aws', 'google'],
        default='mock'
    )
    
    def validate_image_data(self, value):
        """Validate base64 image data"""
        try:
            if value.startswith('data:image'):
                # Remove data URL prefix
                value = value.split(',')[1]
            base64.b64decode(value)
        except Exception:
            raise serializers.ValidationError("Invalid base64 image data")
        
        return value


class EmotionAnalysisResponseSerializer(serializers.Serializer):
    """Serializer for emotion analysis responses"""
    
    emotion = serializers.CharField()
    confidence = serializers.FloatField()
    emotions = serializers.DictField()
    processing_time = serializers.FloatField()
    analysis_method = serializers.CharField()


class MoodStatsSerializer(serializers.Serializer):
    """Serializer for mood statistics"""
    
    total_entries = serializers.IntegerField()
    most_common_emotion = serializers.CharField()
    average_confidence = serializers.FloatField()
    mood_trend = serializers.ChoiceField(choices=['improving', 'declining', 'stable'])
    entries_this_week = serializers.IntegerField()
    entries_this_month = serializers.IntegerField()
    streak_days = serializers.IntegerField()
    
    # Emotion distribution
    emotion_distribution = serializers.DictField()
    
    # Recent trends
    weekly_trend = serializers.ListField()
    monthly_trend = serializers.ListField()


class MoodTrendSerializer(serializers.ModelSerializer):
    """Serializer for mood trends"""
    
    class Meta:
        model = MoodTrend
        fields = [
            'id', 'user', 'date', 'dominant_emotion', 'average_confidence',
            'total_entries', 'emotion_distribution', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class MoodAnalysisSessionSerializer(serializers.ModelSerializer):
    """Serializer for mood analysis sessions"""
    
    success_rate = serializers.ReadOnlyField(source='get_success_rate')
    
    class Meta:
        model = MoodAnalysisSession
        fields = [
            'id', 'user', 'session_id', 'started_at', 'ended_at',
            'processing_time', 'analysis_method', 'total_captures',
            'successful_analyses', 'success_rate'
        ]
        read_only_fields = ['id', 'user', 'started_at']


class MoodInsightSerializer(serializers.ModelSerializer):
    """Serializer for mood insights"""
    
    related_entries_count = serializers.IntegerField(source='related_entries.count', read_only=True)
    
    class Meta:
        model = MoodInsight
        fields = [
            'id', 'user', 'insight_type', 'title', 'description',
            'confidence_score', 'related_entries_count', 'date_range_start',
            'date_range_end', 'is_active', 'is_acknowledged',
            'acknowledged_at', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class MoodHistorySerializer(serializers.ModelSerializer):
    """Simplified serializer for mood history"""
    
    emotion_percentage = serializers.ReadOnlyField(source='get_emotion_percentage')
    
    class Meta:
        model = MoodEntry
        fields = [
            'id', 'timestamp', 'emotion', 'confidence', 'emotion_percentage',
            'notes', 'created_at'
        ]


class MoodDashboardSerializer(serializers.Serializer):
    """Serializer for mood dashboard data"""
    
    # Current stats
    total_entries = serializers.IntegerField()
    entries_today = serializers.IntegerField()
    entries_this_week = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    
    # Current mood state
    latest_emotion = serializers.CharField(allow_null=True)
    latest_confidence = serializers.FloatField(allow_null=True)
    latest_timestamp = serializers.DateTimeField(allow_null=True)
    
    # Trends
    mood_trend = serializers.CharField()
    dominant_emotion_week = serializers.CharField(allow_null=True)
    average_confidence_week = serializers.FloatField(allow_null=True)
    
    # Recent entries
    recent_entries = MoodHistorySerializer(many=True)
    
    # Insights
    active_insights_count = serializers.IntegerField()
    latest_insight = MoodInsightSerializer(allow_null=True)
