from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta
from .models import CrisisHotline, CrisisResource, CrisisAlert, UserSafetyPlan
from .serializers import (
    CrisisHotlineSerializer, CrisisResourceSerializer, CrisisAlertSerializer,
    CreateCrisisAlertSerializer, UserSafetyPlanSerializer, CreateSafetyPlanSerializer,
    CrisisStatsSerializer, CrisisResponseSerializer
)

# COMPREHENSIVE CRISIS MANAGEMENT API ENDPOINTS

class CrisisHotlineListView(generics.ListAPIView):
    """List available crisis hotlines"""
    permission_classes = [IsAuthenticated]
    serializer_class = CrisisHotlineSerializer
    
    def get_queryset(self):
        return CrisisHotline.objects.filter(is_active=True).order_by('priority_order')

class CrisisResourceListView(generics.ListAPIView):
    """List crisis resources and coping strategies"""
    permission_classes = [IsAuthenticated]
    serializer_class = CrisisResourceSerializer
    
    def get_queryset(self):
        resource_type = self.request.query_params.get('type')
        queryset = CrisisResource.objects.filter(is_active=True)
        
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
            
        return queryset.order_by('priority_order')

class CrisisAlertListView(generics.ListCreateAPIView):
    """List and create crisis alerts"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateCrisisAlertSerializer
        return CrisisAlertSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Users can only see their own alerts
        if user.role == 'user':
            return CrisisAlert.objects.filter(user=user)
        
        # Guides and admins can see all alerts
        elif user.role in ['guide', 'admin']:
            return CrisisAlert.objects.all().order_by('-created_at')
        
        return CrisisAlert.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CrisisAlertDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update crisis alerts"""
    permission_classes = [IsAuthenticated]
    serializer_class = CrisisAlertSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'user':
            return CrisisAlert.objects.filter(user=user)
        elif user.role in ['guide', 'admin']:
            return CrisisAlert.objects.all()
        
        return CrisisAlert.objects.none()

class UserSafetyPlanView(APIView):
    """Get or create user's safety plan"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            safety_plan = UserSafetyPlan.objects.get(user=request.user)
            serializer = UserSafetyPlanSerializer(safety_plan)
            return Response(serializer.data)
        except UserSafetyPlan.DoesNotExist:
            # Return template for new safety plan
            return Response({
                'template': True,
                'warning_signs': [],
                'triggers': [],
                'coping_strategies': [],
                'distractions': [],
                'support_contacts': [],
                'professional_contacts': [],
                'environment_safety': [],
                'emergency_contacts': [],
                'emergency_plan': ''
            })
    
    def post(self, request):
        try:
            # Update existing plan
            safety_plan = UserSafetyPlan.objects.get(user=request.user)
            serializer = CreateSafetyPlanSerializer(safety_plan, data=request.data)
        except UserSafetyPlan.DoesNotExist:
            # Create new plan
            serializer = CreateSafetyPlanSerializer(data=request.data)
        
        if serializer.is_valid():
            safety_plan = serializer.save(user=request.user)
            safety_plan.last_reviewed = timezone.now()
            safety_plan.save()
            
            return Response({
                'message': 'Safety plan saved successfully',
                'plan_id': safety_plan.id
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class CrisisResponseView(APIView):
    """Handle crisis alert responses by guides/admins"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, alert_id):
        if request.user.role not in ['guide', 'admin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            alert = CrisisAlert.objects.get(id=alert_id)
            serializer = CrisisResponseSerializer(data=request.data)
            
            if serializer.is_valid():
                action = serializer.validated_data['action']
                response_notes = serializer.validated_data.get('response_notes', '')
                follow_up_date = serializer.validated_data.get('follow_up_date')
                
                if action == 'acknowledge':
                    alert.status = 'acknowledged'
                    alert.acknowledged_at = timezone.now()
                elif action == 'resolve':
                    alert.status = 'resolved'
                    alert.resolved_at = timezone.now()
                    alert.follow_up_completed = True
                elif action == 'escalate':
                    # Create new high-priority alert or notification
                    pass
                
                alert.responder = request.user
                alert.response_notes = response_notes
                if follow_up_date:
                    alert.follow_up_date = follow_up_date
                alert.save()
                
                return Response({'message': f'Alert {action}d successfully'})
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except CrisisAlert.DoesNotExist:
            return Response({'error': 'Alert not found'}, status=status.HTTP_404_NOT_FOUND)

# ADMIN ENDPOINTS

class AdminCrisisHotlineView(generics.ListCreateAPIView):
    """Admin can manage crisis hotlines"""
    serializer_class = CrisisHotlineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return CrisisHotline.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        serializer.save()

class AdminCrisisHotlineDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can update/delete crisis hotlines"""
    serializer_class = CrisisHotlineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return CrisisHotline.objects.all()

class AdminCrisisResourceView(generics.ListCreateAPIView):
    """Admin can manage crisis resources"""
    serializer_class = CrisisResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return CrisisResource.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        serializer.save()

class AdminCrisisResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can update/delete crisis resources"""
    serializer_class = CrisisResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return CrisisResource.objects.all()

# STATISTICS AND DASHBOARD ENDPOINTS

class CrisisStatsView(APIView):
    """Crisis management statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_role = request.user.role
        
        if user_role not in ['guide', 'admin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Calculate statistics
        total_alerts = CrisisAlert.objects.count()
        active_alerts = CrisisAlert.objects.filter(status='active').count()
        high_risk_alerts = CrisisAlert.objects.filter(
            severity_level__in=['high', 'imminent']
        ).count()
        resolved_alerts = CrisisAlert.objects.filter(status='resolved').count()
        
        users_with_safety_plans = UserSafetyPlan.objects.count()
        
        # Alerts this week
        week_ago = timezone.now() - timedelta(days=7)
        alerts_this_week = CrisisAlert.objects.filter(
            created_at__gte=week_ago
        ).count()
        
        # Calculate average response time from actual data
        from django.db.models import Avg
        response_time_avg = CrisisAlert.objects.filter(
            created_at__gte=week_ago,
            acknowledged_at__isnull=False
        ).aggregate(
            avg_response=Avg('acknowledged_at') - Avg('created_at')
        )['avg_response'] or 0
        
        stats = {
            'total_alerts': total_alerts,
            'active_alerts': active_alerts,
            'high_risk_alerts': high_risk_alerts,
            'resolved_alerts': resolved_alerts,
            'users_with_safety_plans': users_with_safety_plans,
            'alerts_this_week': alerts_this_week,
            'response_time_avg': response_time_avg
        }
        
        return Response(stats)

class EmergencyProtocolView(APIView):
    """Emergency intervention protocols"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'immediate_danger_protocol': {
                'steps': [
                    'Call 911 immediately',
                    'Stay with the person',
                    'Remove harmful objects',
                    'Contact emergency contacts'
                ],
                'warning': 'If someone is in immediate danger, call emergency services first'
            },
            'crisis_intervention_steps': [
                {
                    'step': 1,
                    'title': 'Assess Safety',
                    'description': 'Determine immediate risk level'
                },
                {
                    'step': 2,
                    'title': 'Listen Actively',
                    'description': 'Provide non-judgmental support'
                },
                {
                    'step': 3,
                    'title': 'Connect to Resources',
                    'description': 'Link to appropriate help'
                },
                {
                    'step': 4,
                    'title': 'Follow Up',
                    'description': 'Ensure continued support'
                }
            ],
            'warning_signs': [
                'Talking about death or suicide',
                'Expressing hopelessness',
                'Withdrawing from others',
                'Dramatic mood changes',
                'Giving away possessions',
                'Increased substance use'
            ]
        })

class CrisisDashboardView(APIView):
    """Crisis management dashboard"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get user's safety plan status
        has_safety_plan = UserSafetyPlan.objects.filter(user=user).exists()
        
        # Get recent alerts for user
        recent_alerts = CrisisAlert.objects.filter(user=user).order_by('-created_at')[:3]
        
        # Get crisis resources
        immediate_resources = CrisisResource.objects.filter(
            resource_type='immediate_coping',
            is_active=True
        )[:3]
        
        # Get emergency hotlines
        emergency_hotlines = CrisisHotline.objects.filter(
            is_active=True,
            hotline_type__in=['suicide_prevention', 'crisis_text', 'emergency']
        )[:3]
        
        return Response({
            'has_safety_plan': has_safety_plan,
            'recent_alerts': CrisisAlertSerializer(recent_alerts, many=True).data,
            'immediate_resources': CrisisResourceSerializer(immediate_resources, many=True).data,
            'emergency_hotlines': CrisisHotlineSerializer(emergency_hotlines, many=True).data,
            'emergency_message': 'If you are in immediate danger, call 911 or go to your nearest emergency room.'
        })
