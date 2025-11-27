from django.urls import path
from . import views

app_name = 'mood'

urlpatterns = [
    # Mood entries
    path('entries/', views.MoodEntryListCreateView.as_view(), name='mood-entries'),
    path('entries/<int:pk>/', views.MoodEntryDetailView.as_view(), name='mood-entry-detail'),
    
    # Emotion analysis
    path('analyze/', views.analyze_emotion, name='analyze-emotion'),
    
    # Statistics and analytics
    path('stats/', views.mood_stats, name='mood-stats'),
    path('trends/', views.mood_trends, name='mood-trends'),
    path('dashboard/', views.mood_dashboard, name='mood-dashboard'),
    path('admin/dashboard/', views.admin_mood_dashboard, name='admin-mood-dashboard'),
    
    # Insights
    path('insights/', views.MoodInsightListView.as_view(), name='mood-insights'),
    path('insights/<int:insight_id>/acknowledge/', views.acknowledge_insight, name='acknowledge-insight'),
]
