from django.contrib import admin
from .models import (
    ForumCategory, ForumPost, ForumComment, PostLike, CommentLike,
    ChatRoom, ChatMessage, ChatRoomParticipant, PeerSupportMatch,
    Call, CallParticipant, ModerationReport
)


@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'order', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    ordering = ['order', 'name']


@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'is_anonymous', 'is_pinned', 'view_count', 'like_count', 'created_at']
    list_filter = ['category', 'is_anonymous', 'is_pinned', 'is_locked', 'is_approved', 'created_at']
    search_fields = ['title', 'content', 'author__username']
    readonly_fields = ['view_count', 'like_count', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(ForumComment)
class ForumCommentAdmin(admin.ModelAdmin):
    list_display = ['post', 'author', 'is_anonymous', 'like_count', 'created_at']
    list_filter = ['is_anonymous', 'is_approved', 'created_at']
    search_fields = ['content', 'author__username', 'post__title']
    readonly_fields = ['like_count', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'topic', 'max_participants', 'is_active', 'is_moderated', 'created_at']
    list_filter = ['is_active', 'is_moderated']
    search_fields = ['name', 'description', 'topic']
    filter_horizontal = ['moderators']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['room', 'author', 'is_anonymous', 'is_system_message', 'created_at']
    list_filter = ['room', 'is_anonymous', 'is_system_message', 'created_at']
    search_fields = ['content', 'author__username']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(PeerSupportMatch)
class PeerSupportMatchAdmin(admin.ModelAdmin):
    list_display = ['requester', 'supporter', 'status', 'matched_at', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['requester__username', 'supporter__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ModerationReport)
class ModerationReportAdmin(admin.ModelAdmin):
    list_display = ['reporter', 'report_type', 'status', 'moderator', 'created_at']
    list_filter = ['report_type', 'status', 'created_at']
    search_fields = ['reporter__username', 'description']
    readonly_fields = ['created_at', 'resolved_at']


@admin.register(Call)
class CallAdmin(admin.ModelAdmin):
    list_display = ['room', 'call_type', 'status', 'initiator', 'participant_count', 'started_at', 'ended_at']
    list_filter = ['call_type', 'status', 'started_at']
    search_fields = ['room__name', 'initiator__username']
    readonly_fields = ['started_at', 'duration', 'participant_count']
    ordering = ['-started_at']


@admin.register(CallParticipant)
class CallParticipantAdmin(admin.ModelAdmin):
    list_display = ['call', 'user', 'joined_at', 'left_at', 'is_muted', 'is_video_off', 'is_active']
    list_filter = ['is_muted', 'is_video_off', 'joined_at']
    search_fields = ['call__room__name', 'user__username']
    readonly_fields = ['joined_at', 'is_active']
    ordering = ['-joined_at']


admin.site.register(PostLike)
admin.site.register(CommentLike)
