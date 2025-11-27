from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer, 
    NotificationPreferenceSerializer,
    NotificationCreateSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user notifications.
    
    Endpoints:
    - GET /api/notifications/ - List all notifications for current user
    - GET /api/notifications/unread/ - List unread notifications
    - GET /api/notifications/{id}/ - Get specific notification
    - POST /api/notifications/{id}/mark_read/ - Mark notification as read
    - POST /api/notifications/mark_all_read/ - Mark all notifications as read
    - DELETE /api/notifications/{id}/ - Delete notification
    - DELETE /api/notifications/clear_all/ - Clear all read notifications
    """
    
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get notifications for current user"""
        user = self.request.user
        queryset = Notification.objects.filter(user=user)
        
        # Filter out expired notifications
        queryset = queryset.exclude(
            Q(expires_at__isnull=False) & Q(expires_at__lt=timezone.now())
        )
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """List all notifications with pagination"""
        queryset = self.get_queryset()
        
        # Get unread count
        unread_count = queryset.filter(is_read=False).count()
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['unread_count'] = unread_count
            return response
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'unread_count': unread_count
        })
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get only unread notifications"""
        queryset = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a specific notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        updated_count = self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({
            'message': f'{updated_count} notifications marked as read',
            'count': updated_count
        })
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Clear all read notifications"""
        deleted_count, _ = self.get_queryset().filter(is_read=True).delete()
        return Response({
            'message': f'{deleted_count} notifications cleared',
            'count': deleted_count
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get notification statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'unread': queryset.filter(is_read=False).count(),
            'by_type': {},
            'by_priority': {}
        }
        
        # Count by type
        for notification_type, _ in Notification.NOTIFICATION_TYPES:
            count = queryset.filter(notification_type=notification_type).count()
            if count > 0:
                stats['by_type'][notification_type] = count
        
        # Count by priority
        for priority, _ in Notification.PRIORITY_LEVELS:
            count = queryset.filter(priority=priority).count()
            if count > 0:
                stats['by_priority'][priority] = count
        
        return Response(stats)


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notification preferences.
    
    Endpoints:
    - GET /api/notification-preferences/ - Get current user's preferences
    - PUT/PATCH /api/notification-preferences/ - Update preferences
    """
    
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'put', 'patch']
    
    def get_object(self):
        """Get or create notification preferences for current user"""
        preference, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference
    
    def list(self, request, *args, **kwargs):
        """Return current user's notification preferences"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Update notification preferences"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
