from django.urls import path
from . import views
from .test_views import test_database_connection
from .video_views import VideoLikeView, VideoViewView, VideoShareView
from .audio_views import AudioLikeView, AudioViewView, AudioShareView
from .management_views import (
    ContentManagementDashboardView, BulkContentActionView, ContentSearchView,
    duplicate_content, content_analytics
)

urlpatterns = [
    # Articles
    path('articles/', views.ArticleListView.as_view(), name='article-list'),
    path('articles/<int:pk>/like/', views.ArticleLikeView.as_view(), name='article-like'),
    path('articles/<int:pk>/view/', views.ArticleViewView.as_view(), name='article-view'),
    path('articles/<int:pk>/share/', views.ArticleShareView.as_view(), name='article-share'),
    path('articles/<slug:slug>/', views.ArticleDetailView.as_view(), name='article-detail'),
    
    # Videos
    path('videos/', views.VideoListView.as_view(), name='video-list'),
    path('videos/<int:pk>/like/', VideoLikeView.as_view(), name='video-like'),
    path('videos/<int:pk>/view/', VideoViewView.as_view(), name='video-view'),
    path('videos/<int:pk>/share/', VideoShareView.as_view(), name='video-share'),
    path('videos/<int:pk>/', views.VideoDetailView.as_view(), name='video-detail'),
    
    # Audio Content
    path('audio/', views.AudioContentListView.as_view(), name='audio-list'),
    path('audio/<int:pk>/like/', AudioLikeView.as_view(), name='audio-like'),
    path('audio/<int:pk>/view/', AudioViewView.as_view(), name='audio-view'),
    path('audio/<int:pk>/share/', AudioShareView.as_view(), name='audio-share'),
    path('audio/<int:pk>/', views.AudioContentDetailView.as_view(), name='audio-detail'),
    
    # Mental Health Resources
    path('resources/', views.MentalHealthResourceListView.as_view(), name='resource-list'),
    path('resources/<int:pk>/', views.MentalHealthResourceDetailView.as_view(), name='resource-detail'),
    
    # Statistics
    path('stats/', views.content_stats, name='content-stats'),
    
    # Content Management
    path('management/dashboard/', ContentManagementDashboardView.as_view(), name='content-management-dashboard'),
    path('management/bulk-action/', BulkContentActionView.as_view(), name='bulk-content-action'),
    path('management/search/', ContentSearchView.as_view(), name='content-search'),
    path('management/duplicate/<str:content_type>/<int:content_id>/', duplicate_content, name='duplicate-content'),
    path('management/analytics/', content_analytics, name='content-analytics'),
    
    # Test endpoint
    path('test-db/', test_database_connection, name='test-database'),
]
