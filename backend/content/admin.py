from django.contrib import admin
from .models import (
    Article, Video, AudioContent, MentalHealthResource,
    ArticleLike, ArticleView, ArticleShare, VideoLike, VideoView, VideoShare,
    AudioLike, AudioView, AudioShare
)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'difficulty_level', 'is_published', 'is_featured', 'view_count', 'published_at']
    list_filter = ['difficulty_level', 'is_published', 'is_featured', 'created_at']
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['view_count', 'like_count', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'difficulty_level', 'duration_seconds', 'is_published', 'is_featured', 'view_count']
    list_filter = ['difficulty_level', 'is_published', 'is_featured', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['view_count', 'like_count', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(AudioContent)
class AudioContentAdmin(admin.ModelAdmin):
    list_display = ['title', 'audio_type', 'author', 'duration_seconds', 'is_published', 'play_count']
    list_filter = ['audio_type', 'is_published', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['play_count', 'like_count', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(MentalHealthResource)
class MentalHealthResourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'resource_type', 'city', 'state', 'cost_level', 'is_verified', 'rating']
    list_filter = ['resource_type', 'cost_level', 'is_verified', 'is_24_7', 'accepts_walk_ins', 'state']
    search_fields = ['name', 'description', 'city', 'state']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']


# Audio interaction models
@admin.register(AudioLike)
class AudioLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'audio', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'audio__title']
    ordering = ['-created_at']


@admin.register(AudioView)
class AudioViewAdmin(admin.ModelAdmin):
    list_display = ['user', 'audio', 'ip_address', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'audio__title', 'ip_address']
    ordering = ['-created_at']


@admin.register(AudioShare)
class AudioShareAdmin(admin.ModelAdmin):
    list_display = ['user', 'audio', 'method', 'created_at']
    list_filter = ['method', 'created_at']
    search_fields = ['user__username', 'audio__title']
    ordering = ['-created_at']
