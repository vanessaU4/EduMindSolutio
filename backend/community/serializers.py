from rest_framework import serializers
from .models import (
    ForumCategory, ForumPost, ForumComment, ChatRoom, 
    ChatMessage, PeerSupportMatch, ModerationReport
)
from accounts.models import User


class ForumCategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumCategory
        fields = ['id', 'name', 'description', 'icon', 'color', 'is_active', 'order', 'post_count', 'created_at']
        read_only_fields = ['id', 'post_count', 'created_at']
    
    def get_post_count(self, obj):
        return obj.posts.filter(is_approved=True).count()
    
    def validate_name(self, value):
        """Validate category name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long.")
        
        # Check for uniqueness (case-insensitive)
        cleaned_name = value.strip()
        if self.instance:
            # If updating, exclude the current instance from uniqueness check
            existing = ForumCategory.objects.filter(
                name__iexact=cleaned_name
            ).exclude(pk=self.instance.pk).first()
        else:
            # If creating, check if name already exists
            existing = ForumCategory.objects.filter(
                name__iexact=cleaned_name
            ).first()
        
        if existing:
            raise serializers.ValidationError(
                f"A forum category with the name '{cleaned_name}' already exists. Please choose a different name."
            )
        
        return cleaned_name
    
    def validate_description(self, value):
        """Validate category description"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Category description must be at least 10 characters long.")
        return value.strip()
    
    def validate_color(self, value):
        """Validate hex color code"""
        if value and not value.startswith('#'):
            value = f"#{value}"
        if value and len(value) != 7:
            raise serializers.ValidationError("Color must be a valid hex color code (e.g., #3B82F6).")
        return value
    
    def validate_order(self, value):
        """Validate order is non-negative"""
        if value < 0:
            raise serializers.ValidationError("Order must be a non-negative number.")
        return value


class ForumPostSerializer(serializers.ModelSerializer):
    author_display_name = serializers.ReadOnlyField()
    comment_count = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = ForumPost
        fields = [
            'id', 'title', 'content', 'author', 'author_display_name',
            'category', 'category_name', 'is_anonymous', 'is_pinned', 
            'is_locked', 'is_approved', 'view_count', 'like_count', 'author_mood',
            'created_at', 'updated_at', 'last_activity', 'comment_count'
        ]
        read_only_fields = ['author', 'view_count', 'like_count', 'created_at', 'updated_at', 'last_activity']
    
    def get_comment_count(self, obj):
        return obj.comments.filter(is_approved=True).count()
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_title(self, value):
        """Validate post title"""
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Post title must be at least 5 characters long.")
        return value.strip()
    
    def validate_content(self, value):
        """Validate post content"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Post content must be at least 10 characters long.")
        return value.strip()
    
    def validate_category(self, value):
        """Validate category exists and is active"""
        if value is None:
            raise serializers.ValidationError("Category is required.")
        if not value.is_active:
            raise serializers.ValidationError("Selected category is not active.")
        return value
    
    def validate_author_mood(self, value):
        """Validate author mood is in allowed choices"""
        if value and value not in ['struggling', 'neutral', 'hopeful', 'positive']:
            raise serializers.ValidationError(
                "Invalid mood. Must be one of: struggling, neutral, hopeful, positive."
            )
        return value


class ForumCommentSerializer(serializers.ModelSerializer):
    author_display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = ForumComment
        fields = [
            'id', 'post', 'author', 'author_display_name', 'content',
            'parent', 'is_anonymous', 'like_count', 'reply_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'like_count', 'reply_count', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ChatRoomSerializer(serializers.ModelSerializer):
    active_participants = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'description', 'topic', 'max_participants',
            'is_active', 'is_moderated', 'active_participants', 'created_at'
        ]
    
    def get_active_participants(self, obj):
        # In a real implementation, this would track active WebSocket connections
        return 0


class ChatMessageSerializer(serializers.ModelSerializer):
    author_display_name = serializers.ReadOnlyField()
    media_url = serializers.ReadOnlyField()
    media_filename = serializers.ReadOnlyField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'room', 'author', 'author_display_name', 'content',
            'message_type', 'voice_file', 'video_file', 'image_file', 'attachment_file',
            'duration', 'file_size', 'mime_type', 'media_url', 'media_filename',
            'is_anonymous', 'is_system_message', 'created_at'
        ]
        read_only_fields = ['author', 'created_at', 'media_url', 'media_filename']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class PeerSupportMatchSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.display_name', read_only=True)
    supporter_name = serializers.CharField(source='supporter.display_name', read_only=True)
    
    class Meta:
        model = PeerSupportMatch
        fields = [
            'id', 'requester', 'requester_name', 'supporter', 'supporter_name',
            'reason', 'description', 'urgency_level', 'preferred_topics', 
            'preferred_age_range', 'preferred_gender', 'contact_preference',
            'availability', 'previous_support', 'approved_by', 'approved_at',
            'rejection_reason', 'status', 'matched_at', 'completed_at', 'created_at'
        ]
        read_only_fields = ['requester', 'approved_by', 'approved_at', 'matched_at', 'completed_at', 'created_at']
    
    def create(self, validated_data):
        validated_data['requester'] = self.context['request'].user
        return super().create(validated_data)


class ModerationReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.display_name', read_only=True)
    moderator_name = serializers.CharField(source='moderator.display_name', read_only=True)
    
    class Meta:
        model = ModerationReport
        fields = [
            'id', 'reporter', 'reporter_name', 'report_type', 'description',
            'reported_post', 'reported_comment', 'reported_user',
            'status', 'moderator', 'moderator_name', 'moderator_notes',
            'action_taken', 'created_at', 'resolved_at'
        ]
        read_only_fields = ['reporter', 'created_at', 'resolved_at']
    
    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)
