from django.urls import path
from . import views
from . import chat_views
from . import call_views

urlpatterns = [
    # Forum URLs
    path('categories/', views.ForumCategoryListView.as_view(), name='forum-categories'),
    
    path('posts/', views.ForumPostListView.as_view(), name='forum-posts'),
    path('posts/<int:pk>/', views.ForumPostDetailView.as_view(), name='forum-post-detail'),
    path('posts/<int:pk>/like/', views.PostLikeView.as_view(), name='toggle-post-like'),
    
    path('comments/', views.ForumCommentListView.as_view(), name='forum-comments'),
    path('comments/<int:pk>/', views.ForumCommentDetailView.as_view(), name='forum-comment-detail'),
    path('comments/<int:pk>/like/', views.CommentLikeView.as_view(), name='toggle-comment-like'),
    path('comments/<int:pk>/reply/', views.ForumCommentReplyView.as_view(), name='comment-reply'),
    
    # Chat URLs
    path('chat-rooms/', views.ChatRoomCRUDView.as_view(), name='chat-rooms'),
    path('chat-rooms/<int:pk>/', views.ChatRoomDetailView.as_view(), name='chat-room-detail'),
    path('chat-rooms/<int:pk>/join/', views.ChatRoomJoinView.as_view(), name='join-chat-room'),
    path('chat-rooms/<int:pk>/leave/', views.ChatRoomLeaveView.as_view(), name='leave-chat-room'),
    path('chat-messages/', views.ChatMessageCRUDView.as_view(), name='chat-messages'),
    path('chat-rooms/<int:pk>/participants/', views.ChatRoomParticipantsView.as_view(), name='chat-room-participants'),
    path('chat-rooms/join-by-code/', views.ChatRoomJoinByCodeView.as_view(), name='join-chat-room-by-code'),
    path('chat-rooms/stats/', views.ChatRoomStatsView.as_view(), name='chat-room-stats'),
    
    # New Media Chat URLs
    path('chat/<int:room_id>/send-message/', chat_views.send_message, name='send-chat-message'),
    path('chat/<int:room_id>/get-messages/', chat_views.get_messages, name='get-chat-messages'),
    path('chat/<int:room_id>/room-info/', chat_views.get_room_info, name='get-room-info'),
    path('chat/upload-media/', chat_views.upload_media, name='upload-chat-media'),
    
    # Call URLs
    path('chat-rooms/<int:room_id>/call/status/', call_views.get_call_status, name='get-call-status'),
    path('chat-rooms/<int:room_id>/call/start/', call_views.start_call, name='start-call'),
    path('chat-rooms/<int:room_id>/call/join/', call_views.join_call, name='join-call'),
    path('chat-rooms/<int:room_id>/call/leave/', call_views.leave_call, name='leave-call'),
    path('chat-rooms/<int:room_id>/call/end/', call_views.end_call, name='end-call'),
    
    # Peer Support URLs
    path('peer-support/matches/', views.PeerSupportView.as_view(), name='peer-support-matches'),
    path('peer-support/matching/<int:pk>/', views.PeerSupportMatchingView.as_view(), name='peer-support-matching'),
    
    # Moderation Reports
    path('reports/', views.ModerationReportView.as_view(), name='moderation-reports'),
    path('admin/reports/<int:report_id>/', views.AdminModerationView.as_view(), name='admin-moderation'),
    
    # Community Stats
    path('stats/', views.CommunityStatsView.as_view(), name='community-stats'),
    # Admin endpoints
    path('admin/categories/', views.AdminForumCategoryView.as_view(), name='admin-forum-categories'),
    path('admin/categories/<int:pk>/', views.AdminForumCategoryDetailView.as_view(), name='admin-forum-category-detail'),
    path('admin/posts/', views.AdminForumPostView.as_view(), name='admin-forum-posts'),
    path('admin/posts/<int:pk>/', views.AdminForumPostDetailView.as_view(), name='admin-forum-post-detail'),
    path('admin/chatrooms/', views.AdminChatRoomView.as_view(), name='admin-chat-rooms'),
    path('admin/chatrooms/<int:pk>/', views.AdminChatRoomDetailView.as_view(), name='admin-chat-room-detail'),
    path('admin/peer-support/', views.PeerSupportMatchingView.as_view(), name='admin-peer-support'),
]
