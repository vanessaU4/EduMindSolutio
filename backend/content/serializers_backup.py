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

    def to_internal_value(self, data):
        # Handle tags field if it's a JSON string from FormData
        if 'tags' in data:
            tags_value = data['tags']
            
            # Handle case where tags comes as a list (from FormData)
            if isinstance(tags_value, list) and len(tags_value) > 0:
                tags_value = tags_value[0]  # Get the first item from the list
            
            # Now handle as string
            if isinstance(tags_value, str):
                try:
                    parsed_tags = json.loads(tags_value)
                    
                    # Validate that parsed_tags is a list
                    if not isinstance(parsed_tags, list):
                        parsed_tags = []
                    
                    # Create a mutable copy of the data safely
                    if hasattr(data, '_mutable'):
                        # For QueryDict (form data with files)
                        data._mutable = True
                        data['tags'] = parsed_tags
                        data._mutable = False
                    else:
                        # For regular dict
                        data = dict(data)
                        data['tags'] = parsed_tags
                        
                except (json.JSONDecodeError, ValueError):
                    if hasattr(data, '_mutable'):
                        data._mutable = True
                        data['tags'] = []
                        data._mutable = False
                    else:
                        data = dict(data)
                        data['tags'] = []
            elif isinstance(tags_value, list):
                # Tags is already a list, use as-is
                if hasattr(data, '_mutable'):
                    data._mutable = True
                    data['tags'] = tags_value
                    data._mutable = False
                else:
                    data = dict(data)
                    data['tags'] = tags_value
            else:
                # Unknown format, default to empty list
                if hasattr(data, '_mutable'):
                    data._mutable = True
                    data['tags'] = []
                    data._mutable = False
                else:
                    data = dict(data)
                    data['tags'] = []
        
        return super().to_internal_value(data)


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
                # Handle case where VideoLike table doesn't exist yet
                return False
        return False



    def to_internal_value(self, data):
        # Handle tags field if it's a JSON string from FormData
        if 'tags' in data:
            tags_value = data['tags']
            
            # Handle case where tags comes as a list (from FormData)
            if isinstance(tags_value, list) and len(tags_value) > 0:
                tags_value = tags_value[0]  # Get the first item from the list
            
            # Now handle as string
            if isinstance(tags_value, str):
                try:
                    parsed_tags = json.loads(tags_value)
                    
                    # Validate that parsed_tags is a list
                    if not isinstance(parsed_tags, list):
                        parsed_tags = []
                    
                    # Create a mutable copy of the data safely
                    if hasattr(data, '_mutable'):
                        # For QueryDict (form data with files)
                        data._mutable = True
                        data['tags'] = parsed_tags
                        data._mutable = False
                    else:
                        # For regular dict
                        data = dict(data)
                        data['tags'] = parsed_tags
                        
                except (json.JSONDecodeError, ValueError):
                    if hasattr(data, '_mutable'):
                        data._mutable = True
                        data['tags'] = []
                        data._mutable = False
                    else:
                        data = dict(data)
                        data['tags'] = []
            elif isinstance(tags_value, list):
                # Tags is already a list, use as-is
                if hasattr(data, '_mutable'):
                    data._mutable = True
                    data['tags'] = tags_value
                    data._mutable = False
                else:
                    data = dict(data)
                    data['tags'] = tags_value
            else:
                # Unknown format, default to empty list
                if hasattr(data, '_mutable'):
                    data._mutable = True
                    data['tags'] = []
                    data._mutable = False
                else:
                    data = dict(data)
                    data['tags'] = []
        
        return super().to_internal_value(data)


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

    def to_internal_value(self, data):
        # Debug logging
        print(f"AudioContentSerializer received data: {dict(data)}")
        
        # Handle tags field if it's a JSON string from FormData
        if 'tags' in data:
            tags_value = data['tags']
            print(f"AudioContentSerializer: Processing tags value: {tags_value} (type: {type(tags_value)})")
            
            # Handle case where tags comes as a list (from FormData)
            if isinstance(tags_value, list) and len(tags_value) > 0:
                tags_value = tags_value[0]  # Get the first item from the list
                print(f"AudioContentSerializer: Extracted from list: {tags_value}")
            
            # Now handle as string
            if isinstance(tags_value, str):
                try:
                    parsed_tags = json.loads(tags_value)
                    print(f"AudioContentSerializer: Parsed tags: {parsed_tags}")
                    
                    # Validate that parsed_tags is a list
                    if not isinstance(parsed_tags, list):
                        print(f"AudioContentSerializer: Tags is not a list, converting to empty list")
                        parsed_tags = []
                    
                    # Create a mutable copy of the data safely
                    if hasattr(data, '_mutable'):
                        # For QueryDict (form data with files)
                        data._mutable = True
                        data['tags'] = parsed_tags
                        data._mutable = False
                    else:
                        # For regular dict
                        data = dict(data)
                        data['tags'] = parsed_tags
                        
                except (json.JSONDecodeError, ValueError) as e:
                    print(f"AudioContentSerializer: JSON decode error: {e}")
                    if hasattr(data, '_mutable'):
                        data._mutable = True
                        data['tags'] = []
                        data._mutable = False
                    else:
                        data = dict(data)
                        data['tags'] = []
            elif isinstance(tags_value, list):
                # Tags is already a list, use as-is
                print(f"AudioContentSerializer: Tags is already a list: {tags_value}")
                if hasattr(data, '_mutable'):
                    data._mutable = True
                    data['tags'] = tags_value
                    data._mutable = False
                else:
                    data = dict(data)
                    data['tags'] = tags_value
            else:
                # Unknown format, default to empty list
                print(f"AudioContentSerializer: Unknown tags format, defaulting to empty list")
                if hasattr(data, '_mutable'):
                    data._mutable = True
                    data['tags'] = []
                    data._mutable = False
                else:
                    data = dict(data)
                    data['tags'] = []
        
        try:
            result = super().to_internal_value(data)
            print(f"AudioContentSerializer validation successful: {result}")
            
            # Additional validation for tags field
            if 'tags' in result:
                tags = result['tags']
                if not isinstance(tags, list):
                    print(f"AudioContentSerializer: Converting non-list tags to list: {tags}")
                    result['tags'] = []
                else:
                    # Ensure all tags are strings
                    result['tags'] = [str(tag) for tag in tags if tag]
                    print(f"AudioContentSerializer: Final tags: {result['tags']}")
            
            return result
        except Exception as e:
            print(f"AudioContentSerializer validation failed: {e}")
            print(f"AudioContentSerializer: Exception details: {type(e).__name__}: {str(e)}")
            raise


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
