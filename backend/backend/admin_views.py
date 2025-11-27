from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
import psutil
import os

# Import models from different apps
from accounts.models import User
from assessments.models import Assessment, AssessmentRequest
from community.models import ForumPost, ForumComment, ChatRoom
from content.models import Article, Video, AudioContent


class SystemStatsView(APIView):
    """
    System-wide admin dashboard statistics endpoint
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is admin
        if not request.user.is_staff and request.user.role != 'admin':
            return Response({
                'error': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # System health metrics
            cpu_usage = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Database statistics
            total_users = User.objects.count()
            total_assessments = Assessment.objects.count()
            total_forum_posts = ForumPost.objects.count()
            total_content_items = (
                Article.objects.count() + 
                Video.objects.count() + 
                AudioContent.objects.count()
            )
            
            # Activity in last 24 hours
            yesterday = timezone.now() - timedelta(days=1)
            recent_activity = {
                'new_users': User.objects.filter(date_joined__gte=yesterday).count(),
                'new_assessments': Assessment.objects.filter(completed_at__gte=yesterday).count(),
                'new_forum_posts': ForumPost.objects.filter(created_at__gte=yesterday).count(),
                'new_comments': ForumComment.objects.filter(created_at__gte=yesterday).count(),
            }
            
            # System alerts (basic checks)
            alerts = []
            if cpu_usage > 80:
                alerts.append({
                    'type': 'warning',
                    'message': f'High CPU usage: {cpu_usage}%'
                })
            if memory.percent > 85:
                alerts.append({
                    'type': 'warning',
                    'message': f'High memory usage: {memory.percent}%'
                })
            if disk.percent > 90:
                alerts.append({
                    'type': 'critical',
                    'message': f'Low disk space: {disk.percent}% used'
                })
            
            # Content reports (placeholder - would need actual reporting system)
            content_reports = 0  # This would come from a reporting system
            
            return Response({
                'system_health': 'healthy' if len(alerts) == 0 else 'warning' if any(a['type'] == 'warning' for a in alerts) else 'critical',
                'system_alerts': len(alerts),
                'content_reports': content_reports,
                'system_metrics': {
                    'cpu_usage': cpu_usage,
                    'memory_usage': memory.percent,
                    'disk_usage': disk.percent,
                    'available_memory_gb': round(memory.available / (1024**3), 2),
                    'total_memory_gb': round(memory.total / (1024**3), 2)
                },
                'database_stats': {
                    'total_users': total_users,
                    'total_assessments': total_assessments,
                    'total_forum_posts': total_forum_posts,
                    'total_content_items': total_content_items
                },
                'recent_activity': recent_activity,
                'alerts': alerts,
                'uptime_hours': round((timezone.now().timestamp() - psutil.boot_time()) / 3600, 1)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to fetch system stats: {str(e)}',
                'system_health': 'error',
                'system_alerts': 1,
                'content_reports': 0
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
