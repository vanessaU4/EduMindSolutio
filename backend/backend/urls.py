from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from .admin_views import SystemStatsView
from .analytics_views import SystemAnalyticsView, GuideAnalyticsView

def api_root(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'EduMindSolutions API is running',
        'version': '1.0.0',
        'docs': '/api/docs/',
        'health': '/health/'
    })
from .monitoring_views import (
    system_metrics, application_metrics, health_metrics,
    security_metrics, performance_trends, alert_webhook
)

from .health_check import health_check, detailed_health_check
from django.conf.urls.static import static


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),

    # Health check endpoints
    path('health/', health_check, name='health-check'),
    path('health/detailed/', detailed_health_check, name='detailed-health-check'),

    # Monitoring and observability endpoints
    path('monitoring/system/', system_metrics, name='system-metrics'),
    path('monitoring/application/', application_metrics, name='application-metrics'),
    path('monitoring/health/', health_metrics, name='health-metrics'),
    path('monitoring/security/', security_metrics, name='security-metrics'),
    path('monitoring/trends/', performance_trends, name='performance-trends'),
    path('monitoring/alerts/webhook/', alert_webhook, name='alert-webhook'),

    # API endpoints
    path('api/accounts/', include('accounts.urls')),
    # Healthcare Platform APIs
    path('api/assessments/', include('assessments.urls')),
    path('api/community/', include('community.urls')),
    path('api/wellness/', include('wellness.urls')),
    path('api/mood/', include('mood.urls')),
    path('api/content/', include('content.urls')),
    path('api/crisis/', include('crisis.urls')),
    path('api/guide/', include('guide.urls')),
    path('api/notifications/', include('notifications.urls')),
    
    # Admin system stats
    path('api/admin/system/stats/', SystemStatsView.as_view(), name='admin-system-stats'),
    
    # Analytics endpoints
    path('api/analytics/', SystemAnalyticsView.as_view(), name='system-analytics'),
    path('api/guide/analytics/', GuideAnalyticsView.as_view(), name='guide-analytics'),
]

# Always serve media files in development (localhost)
import socket
hostname = socket.gethostname()
if settings.DEBUG or 'localhost' in str(settings.ALLOWED_HOSTS) or '127.0.0.1' in str(settings.ALLOWED_HOSTS):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)