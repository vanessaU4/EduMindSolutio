from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WellnessCenterView, MoodEntryListView, MoodEntryDetailView, MoodStatsView,
    DailyChallengeListView, CompleteChallengeView, UserChallengeCompletionListView,
    AchievementListView, UserAchievementListView, WellnessDataView, WellnessTipListView,
    DailyWellnessTipView, MarkTipHelpfulView, AdminDailyChallengeView,
    AdminDailyChallengeDetailView, AdminAchievementView, AdminAchievementDetailView,
    AdminWellnessTipView, AdminWellnessTipDetailView, WellnessStatsView
)
from .enhanced_views import (
    MoodEntryViewSet, DailyChallengeViewSet, WeeklyChallengeViewSet,
    AIWellnessInsightsView, MoodPatternViewSet, AchievementViewSet,
    UserAchievementViewSet, WellnessTipViewSet, WellnessDashboardView,
    UserProgressView
)

# Router for ViewSets
router = DefaultRouter()
router.register(r'mood-entries-v2', MoodEntryViewSet, basename='mood-entries-v2')
router.register(r'daily-challenges-v2', DailyChallengeViewSet, basename='daily-challenges-v2')
router.register(r'weekly-challenges', WeeklyChallengeViewSet, basename='weekly-challenges')
router.register(r'mood-patterns', MoodPatternViewSet, basename='mood-patterns')
router.register(r'achievements-v2', AchievementViewSet, basename='achievements-v2')
router.register(r'user-achievements-v2', UserAchievementViewSet, basename='user-achievements-v2')
router.register(r'wellness-tips-v2', WellnessTipViewSet, basename='wellness-tips-v2')

urlpatterns = [
    # Enhanced API endpoints with ViewSets
    path('api/v2/', include(router.urls)),
    
    # Enhanced wellness endpoints
    path('dashboard/', WellnessDashboardView.as_view(), name='wellness-dashboard'),
    path('ai-insights/', AIWellnessInsightsView.as_view(), name='ai-wellness-insights'),
    path('progress/', UserProgressView.as_view(), name='user-progress'),
    
    # Legacy endpoints (v1)
    path('', WellnessCenterView.as_view(), name='wellness-center'),
    path('stats/', WellnessStatsView.as_view(), name='wellness-stats'),
    
    # Mood tracking endpoints
    path('mood-entries/', MoodEntryListView.as_view(), name='mood-entries'),
    path('mood-entries/<int:pk>/', MoodEntryDetailView.as_view(), name='mood-entry-detail'),
    path('mood-stats/', MoodStatsView.as_view(), name='mood-stats'),
    
    # Daily challenges endpoints
    path('challenges/', DailyChallengeListView.as_view(), name='daily-challenges'),
    path('challenges/<int:challenge_id>/complete/', CompleteChallengeView.as_view(), name='complete-challenge'),
    path('challenge-completions/', UserChallengeCompletionListView.as_view(), name='challenge-completions'),
    
    # Achievements endpoints
    path('achievements/', AchievementListView.as_view(), name='achievements'),
    path('user-achievements/', UserAchievementListView.as_view(), name='user-achievements'),
    
    # Wellness tips endpoints
    path('tips/', WellnessTipListView.as_view(), name='wellness-tips'),
    path('daily-tip/', DailyWellnessTipView.as_view(), name='daily-wellness-tip'),
    path('tips/<int:tip_id>/helpful/', MarkTipHelpfulView.as_view(), name='mark-tip-helpful'),
    
    # Admin endpoints
    path('admin/challenges/', AdminDailyChallengeView.as_view(), name='admin-daily-challenges'),
    path('admin/challenges/<int:pk>/', AdminDailyChallengeDetailView.as_view(), name='admin-daily-challenge-detail'),
    path('admin/achievements/', AdminAchievementView.as_view(), name='admin-achievements'),
    path('admin/achievements/<int:pk>/', AdminAchievementDetailView.as_view(), name='admin-achievement-detail'),
    path('admin/tips/', AdminWellnessTipView.as_view(), name='admin-wellness-tips'),
    path('admin/tips/<int:pk>/', AdminWellnessTipDetailView.as_view(), name='admin-wellness-tip-detail'),
    path('data/', WellnessDataView.as_view(), name='wellness-data'),
]
