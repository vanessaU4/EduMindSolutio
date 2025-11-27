from django.contrib import admin
from .models import (
    MoodEntry, Achievement, UserAchievement, UserPoints,
    DailyChallenge, UserChallengeCompletion, WellnessTip, UserWellnessTip,
    WeeklyChallenge, UserWeeklyChallengeProgress, MoodPattern
)

@admin.register(DailyChallenge)
class DailyChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'challenge_type', 'points_reward', 'is_active', 'created_at')
    list_filter = ('challenge_type', 'is_active', 'created_at')
    search_fields = ('title', 'description')
    list_editable = ('is_active', 'points_reward')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'challenge_type', 'instructions')
        }),
        ('Challenge Parameters', {
            'fields': ('points_reward', 'target_value', 'duration_minutes')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

@admin.register(WeeklyChallenge)
class WeeklyChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'challenge_type', 'start_date', 'end_date', 'target_days', 'points_per_day', 'is_active')
    list_filter = ('challenge_type', 'is_active', 'start_date')
    search_fields = ('title', 'description')
    list_editable = ('is_active',)
    ordering = ('-start_date',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'challenge_type', 'instructions')
        }),
        ('Challenge Period', {
            'fields': ('start_date', 'end_date')
        }),
        ('Rewards & Goals', {
            'fields': ('target_days', 'points_per_day', 'bonus_points')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

@admin.register(UserChallengeCompletion)
class UserChallengeCompletionAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'completion_date', 'points_earned', 'completed_at')
    list_filter = ('completion_date', 'challenge__challenge_type')
    search_fields = ('user__username', 'challenge__title')
    readonly_fields = ('completed_at',)
    ordering = ('-completed_at',)

@admin.register(UserWeeklyChallengeProgress)
class UserWeeklyChallengeProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'days_completed', 'total_points_earned', 'is_completed')
    list_filter = ('is_completed', 'challenge__challenge_type')
    search_fields = ('user__username', 'challenge__title')
    readonly_fields = ('created_at', 'updated_at', 'completed_at')
    ordering = ('-created_at',)

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'points_reward', 'is_repeatable', 'is_active')
    list_filter = ('category', 'is_repeatable', 'is_active')
    search_fields = ('name', 'description')
    list_editable = ('is_active', 'points_reward')
    ordering = ('category', 'name')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'points_earned', 'earned_at')
    list_filter = ('achievement__category', 'earned_at')
    search_fields = ('user__username', 'achievement__name')
    readonly_fields = ('earned_at',)
    ordering = ('-earned_at',)

@admin.register(UserPoints)
class UserPointsAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_points', 'level', 'current_streak', 'longest_streak', 'last_activity_date')
    list_filter = ('level', 'last_activity_date')
    search_fields = ('user__username',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-total_points',)

@admin.register(WellnessTip)
class WellnessTipAdmin(admin.ModelAdmin):
    list_display = ('title', 'tip_type', 'is_active', 'created_at')
    list_filter = ('tip_type', 'is_active', 'created_at')
    search_fields = ('title', 'content')
    list_editable = ('is_active',)
    ordering = ('-created_at',)

@admin.register(MoodEntry)
class MoodEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'mood_rating', 'energy_level', 'anxiety_level', 'sleep_quality')
    list_filter = ('date', 'mood_rating', 'energy_level')
    search_fields = ('user__username',)
    readonly_fields = ('created_at',)
    ordering = ('-date',)

@admin.register(MoodPattern)
class MoodPatternAdmin(admin.ModelAdmin):
    list_display = ('user', 'pattern_type', 'title', 'confidence_score', 'created_at')
    list_filter = ('pattern_type', 'created_at')
    search_fields = ('user__username', 'title')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
