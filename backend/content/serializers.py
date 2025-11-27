from rest_framework import serializers
import json
from .models import (
    Article, Video, AudioContent, MentalHealthResource, 
    ArticleLike, VideoLike
)


class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.display_name', read_only=True)
    isLiked = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content',
            'tags', 'difficulty_level', 'author', 'author_name', 'featured_image',
            'estimated_read_time', 'view_count', 'like_count', 'is_published',
            'is_featured', 'published_at', 'created_at', 'updated_at', 'isLiked'
        ]
        read_only_fields = ['author', 'view_count', 'like_count', 'created_at', 'updated_at', 'isLiked']
    
    def get_isLiked(self, obj):
        """Check if the current user has liked this article"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ArticleLike.objects.filter(user=request.user, article=obj).exists()
        return False


class VideoSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.display_name', read_only=True)
    isLiked = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'video_url', 'thumbnail_image',
            'duration_seconds', 'tags',
            'difficulty_level', 'author', 'author_name', 'view_count',
            'like_count', 'is_published', 'is_featured', 'published_at',
            'created_at', 'updated_at', 'isLiked'
        ]
        read_only_fields = ['author', 'view_count', 'like_count', 'created_at', 'updated_at', 'isLiked']
    
    def get_isLiked(self, obj):
        """Check if the current user has liked this video"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                return VideoLike.objects.filter(user=request.user, video=obj).exists()
            except Exception:
                return False
        return False


class AudioContentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.display_name', read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = AudioContent
        fields = [
            'id', 'title', 'description', 'audio_type', 'audio_file',
            'audio_url', 'duration_seconds',
            'tags', 'author', 'author_name', 'thumbnail_image',
            'play_count', 'like_count', 'is_published', 'published_at',
            'created_at', 'updated_at', 'is_liked'
        ]
        read_only_fields = ['author', 'play_count', 'like_count', 'created_at', 'updated_at', 'is_liked']
    
    def get_is_liked(self, obj):
        """Check if current user has liked this audio"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import AudioLike
            return AudioLike.objects.filter(user=request.user, audio=obj).exists()
        return False


class MentalHealthResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentalHealthResource
        fields = [
            'id', 'name', 'description', 'resource_type', 'phone_number',
            'email', 'website', 'address', 'city', 'state', 'zip_code',
            'latitude', 'longitude', 'services_offered', 'specializations',
            'age_groups_served', 'languages', 'hours_of_operation', 'is_24_7',
            'accepts_walk_ins', 'cost_level', 'insurance_accepted', 'is_verified',
            'rating', 'created_at', 'updated_at'
        ]