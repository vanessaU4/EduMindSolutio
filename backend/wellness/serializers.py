from rest_framework import serializers
from .models import (
    MoodEntry, Achievement, UserAchievement, UserPoints,
    DailyChallenge, UserChallengeCompletion, WellnessTip, UserWellnessTip,
    WeeklyChallenge, UserWeeklyChallengeProgress, MoodPattern
)
from django.contrib.auth import get_user_model

User = get_user_model()

class MoodEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodEntry
        fields = [
            'id', 'mood_rating', 'energy_level', 'anxiety_level', 'sleep_quality',
            'notes', 'activities', 'triggers', 'date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CreateMoodEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodEntry
        fields = [
            'mood_rating', 'energy_level', 'anxiety_level', 'sleep_quality',
            'notes', 'activities', 'triggers', 'date'
        ]

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = [
            'id', 'name', 'description', 'category', 'icon', 'points_reward',
            'criteria', 'is_repeatable', 'is_active', 'created_at'
        ]

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement_name = serializers.CharField(source='achievement.name', read_only=True)
    achievement_description = serializers.CharField(source='achievement.description', read_only=True)
    achievement_icon = serializers.CharField(source='achievement.icon', read_only=True)
    achievement_category = serializers.CharField(source='achievement.category', read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = [
            'id', 'achievement', 'achievement_name', 'achievement_description',
            'achievement_icon', 'achievement_category', 'earned_at', 'points_earned'
        ]

class UserPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPoints
        fields = [
            'total_points', 'current_streak', 'longest_streak', 'last_activity_date',
            'level', 'points_to_next_level', 'created_at', 'updated_at'
        ]

class DailyChallengeSerializer(serializers.ModelSerializer):
    is_completed_today = serializers.SerializerMethodField()
    
    class Meta:
        model = DailyChallenge
        fields = [
            'id', 'title', 'description', 'challenge_type', 'instructions',
            'points_reward', 'target_value', 'duration_minutes', 'is_active',
            'created_at', 'is_completed_today'
        ]
    
    def get_is_completed_today(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from django.utils import timezone
            today = timezone.now().date()
            return UserChallengeCompletion.objects.filter(
                user=request.user,
                challenge=obj,
                completion_date=today
            ).exists()
        return False

class UserChallengeCompletionSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    challenge_type = serializers.CharField(source='challenge.challenge_type', read_only=True)
    
    class Meta:
        model = UserChallengeCompletion
        fields = [
            'id', 'challenge', 'challenge_title', 'challenge_type',
            'completed_at', 'completion_date', 'completion_value',
            'notes', 'points_earned'
        ]
        read_only_fields = ['id', 'completed_at', 'points_earned']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['points_earned'] = validated_data['challenge'].points_reward
        return super().create(validated_data)

class CompleteChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChallengeCompletion
        fields = ['challenge', 'completion_value', 'notes', 'completion_date']

class WellnessTipSerializer(serializers.ModelSerializer):
    is_helpful = serializers.SerializerMethodField()
    
    class Meta:
        model = WellnessTip
        fields = [
            'id', 'title', 'content', 'tip_type', 'target_mood',
            'target_age_range', 'is_active', 'created_at', 'is_helpful'
        ]
    
    def get_is_helpful(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_tip = UserWellnessTip.objects.filter(
                user=request.user,
                tip=obj
            ).first()
            return user_tip.is_helpful if user_tip else None
        return None

class UserWellnessTipSerializer(serializers.ModelSerializer):
    tip_title = serializers.CharField(source='tip.title', read_only=True)
    tip_content = serializers.CharField(source='tip.content', read_only=True)
    tip_type = serializers.CharField(source='tip.tip_type', read_only=True)
    
    class Meta:
        model = UserWellnessTip
        fields = [
            'id', 'tip', 'tip_title', 'tip_content', 'tip_type',
            'shown_at', 'is_helpful'
        ]
        read_only_fields = ['id', 'shown_at']

class MoodStatsSerializer(serializers.Serializer):
    """Serializer for mood statistics"""
    average_mood = serializers.FloatField()
    average_energy = serializers.FloatField()
    average_anxiety = serializers.FloatField()
    average_sleep = serializers.FloatField()
    total_entries = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    mood_trend = serializers.ListField(child=serializers.DictField())

class WellnessStatsSerializer(serializers.Serializer):
    """Serializer for wellness dashboard statistics"""
    total_points = serializers.IntegerField()
    current_level = serializers.IntegerField()
    achievements_count = serializers.IntegerField()
    challenges_completed_today = serializers.IntegerField()
    challenges_completed_total = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    mood_entries_count = serializers.IntegerField()

class WeeklyChallengeSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = WeeklyChallenge
        fields = [
            'id', 'title', 'description', 'challenge_type', 'instructions',
            'target_days', 'points_per_day', 'bonus_points', 'start_date',
            'end_date', 'is_active', 'created_at', 'progress', 'is_enrolled'
        ]
    
    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserWeeklyChallengeProgress.objects.filter(
                user=request.user,
                challenge=obj
            ).first()
            if progress:
                return {
                    'days_completed': progress.days_completed,
                    'total_points_earned': progress.total_points_earned,
                    'is_completed': progress.is_completed,
                    'completion_percentage': (progress.days_completed / obj.target_days) * 100
                }
        return None
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserWeeklyChallengeProgress.objects.filter(
                user=request.user,
                challenge=obj
            ).exists()
        return False

class UserWeeklyChallengeProgressSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    challenge_type = serializers.CharField(source='challenge.challenge_type', read_only=True)
    target_days = serializers.IntegerField(source='challenge.target_days', read_only=True)
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = UserWeeklyChallengeProgress
        fields = [
            'id', 'challenge', 'challenge_title', 'challenge_type', 'target_days',
            'days_completed', 'completion_dates', 'total_points_earned',
            'is_completed', 'completed_at', 'completion_percentage', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at', 'total_points_earned']
    
    def get_completion_percentage(self, obj):
        return (obj.days_completed / obj.challenge.target_days) * 100

class MoodPatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodPattern
        fields = [
            'id', 'pattern_type', 'title', 'description', 'insights',
            'recommendations', 'confidence_score', 'analysis_period_start',
            'analysis_period_end', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class AIInsightSerializer(serializers.Serializer):
    """Serializer for AI-generated wellness insights"""
    wellness_score = serializers.DictField()
    mood_analysis = serializers.DictField()
    recommendations = serializers.ListField(child=serializers.CharField())
    daily_affirmation = serializers.CharField()
    suggested_challenges = serializers.ListField(child=serializers.DictField())
