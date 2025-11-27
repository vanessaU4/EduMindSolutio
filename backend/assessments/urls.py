from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .question_views import QuestionManagementViewSet

# Create router for viewsets
router = DefaultRouter()
router.register(r'questions', QuestionManagementViewSet, basename='questions')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Assessment Types
    path('types/', views.AssessmentTypeListView.as_view(), name='assessment-types'),
    path('types/<int:pk>/', views.AssessmentDetailView.as_view(), name='assessment-type-detail'),
    path('types/<str:name>/', views.AssessmentDetailView.as_view(), name='assessment-type-by-name'),
    
    # Taking Assessments
    path('take/', views.TakeAssessmentView.as_view(), name='take-assessment'),
    
    # Assessment History & Results
    path('history/', views.UserAssessmentHistoryView.as_view(), name='assessment-history'),
    path('results/<int:pk>/', views.AssessmentResultView.as_view(), name='assessment-result'),
    
    # Recommendations
    path('recommendations/', views.AssessmentRecommendationsView.as_view(), name='recommendations'),
    
    # Question Management API endpoints
    # Note: Standard CRUD operations are handled by the router registration above
    # Custom actions are defined as ViewSet actions with @action decorator
    path('questions/analytics/', QuestionManagementViewSet.as_view({'get': 'question_analytics'}), name='question-analytics'),
    path('questions/bulk-create/', QuestionManagementViewSet.as_view({'post': 'bulk_create_questions'}), name='bulk-create-questions'),
    
    # Role-based endpoints
    path('guide/assignments/', views.GuideClientAssignmentView.as_view(), name='guide-assignments'),
    path('guide/requests/', views.GuideAssessmentRequestView.as_view(), name='guide-requests'),
    path('guide/stats/', views.GuideAssessmentStatsView.as_view(), name='guide-stats'),
    
    # Admin endpoints
    path('admin/requests/', views.AdminAssessmentRequestView.as_view(), name='admin-requests'),
    path('admin/requests/<int:pk>/review/', views.AdminReviewRequestView.as_view(), name='admin-review-request'),
    path('admin/types/', views.AdminAssessmentTypeManagementView.as_view(), name='admin-assessment-types'),
    path('admin/types/<int:pk>/', views.AdminAssessmentTypeDetailView.as_view(), name='admin-assessment-type-detail'),
    path('admin/stats/', views.AdminAssessmentStatsView.as_view(), name='admin-assessment-stats'),
]
