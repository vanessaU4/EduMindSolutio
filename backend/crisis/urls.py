from django.urls import path
from .views import (
    CrisisHotlineListView, CrisisResourceListView, CrisisAlertListView,
    CrisisAlertDetailView, UserSafetyPlanView, CrisisResponseView,
    AdminCrisisHotlineView, AdminCrisisHotlineDetailView, AdminCrisisResourceView,
    AdminCrisisResourceDetailView, CrisisStatsView, EmergencyProtocolView,
    CrisisDashboardView
)

urlpatterns = [
    # Crisis dashboard and overview
    path('', CrisisDashboardView.as_view(), name='crisis-dashboard'),
    path('stats/', CrisisStatsView.as_view(), name='crisis-stats'),
    path('protocols/', EmergencyProtocolView.as_view(), name='emergency-protocols'),
    
    # Crisis hotlines
    path('hotlines/', CrisisHotlineListView.as_view(), name='crisis-hotlines'),
    
    # Crisis resources
    path('resources/', CrisisResourceListView.as_view(), name='crisis-resources'),
    
    # Crisis alerts
    path('alerts/', CrisisAlertListView.as_view(), name='crisis-alerts'),
    path('alerts/<int:pk>/', CrisisAlertDetailView.as_view(), name='crisis-alert-detail'),
    path('alerts/<int:alert_id>/respond/', CrisisResponseView.as_view(), name='crisis-response'),
    
    # Safety planning
    path('safety-plan/', UserSafetyPlanView.as_view(), name='user-safety-plan'),
    
    # Admin endpoints
    path('admin/hotlines/', AdminCrisisHotlineView.as_view(), name='admin-crisis-hotlines'),
    path('admin/hotlines/<int:pk>/', AdminCrisisHotlineDetailView.as_view(), name='admin-crisis-hotline-detail'),
    path('admin/resources/', AdminCrisisResourceView.as_view(), name='admin-crisis-resources'),
    path('admin/resources/<int:pk>/', AdminCrisisResourceDetailView.as_view(), name='admin-crisis-resource-detail'),
]
