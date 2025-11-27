# Guide views - simplified to work with essential models only
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.utils import timezone
from assessments.models import ClientAssessmentAssignment, Assessment
from crisis.models import CrisisAlert

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_clients(request):
    """Get all users with role 'user' for guides and admins"""
    if request.user.role not in ['guide', 'admin']:
        return Response({'error': 'Permission denied'}, status=403)
    
    # Get all users with role 'user'
    users = User.objects.filter(role='user').order_by('date_joined')
    
    clients_data = []
    for user in users:
        # Get latest assessment
        latest_assessment = Assessment.objects.filter(
            user=user
        ).order_by('-completed_at').first()
        
        # Get assignment info if exists
        assignment = ClientAssessmentAssignment.objects.filter(
            client=user,
            guide=request.user
        ).first() if request.user.role == 'guide' else None
        
        # Determine status based on recent activity
        status = 'active'
        if latest_assessment:
            days_since_assessment = (timezone.now().date() - latest_assessment.completed_at.date()).days
            if days_since_assessment > 30:
                status = 'inactive'
            elif latest_assessment.risk_level in ['high', 'critical']:
                status = 'at_risk'
        else:
            status = 'inactive'
        
        client_data = {
            'id': user.id,
            'name': user.display_name or f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email if not getattr(user, 'is_anonymous_preferred', False) else 'Anonymous User',
            'age': getattr(user, 'age', 0) or 0,
            'status': status,
            'lastAssessment': latest_assessment.completed_at.isoformat() if latest_assessment else None,
            'riskLevel': latest_assessment.risk_level.lower() if latest_assessment and latest_assessment.risk_level else 'low',
            'lastContact': user.last_login.isoformat() if user.last_login else user.date_joined.isoformat(),
            'assignedDate': assignment.assigned_date.isoformat() if assignment else user.date_joined.isoformat(),
            'assessmentCount': Assessment.objects.filter(user=user).count(),
        }
        
        clients_data.append(client_data)
    
    return Response(clients_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_crisis_alerts(request):
    """Get crisis alerts for guide to respond to"""
    if request.user.role not in ['guide', 'admin']:
        return Response({'error': 'Permission denied'}, status=403)
    
    alerts = CrisisAlert.objects.filter(
        status__in=['active', 'acknowledged']
    ).order_by('-created_at')
    
    alerts_data = []
    for alert in alerts:
        alerts_data.append({
            'id': alert.id,
            'user': alert.user.display_name,
            'userId': alert.user.id,
            'alertType': alert.alert_type,
            'severity': alert.severity_level,
            'status': alert.status,
            'triggerContent': alert.trigger_content,
            'createdAt': alert.created_at,
            'followUpRequired': alert.follow_up_required
        })
    
    return Response(alerts_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics(request):
    """Get analytics data for guide dashboard"""
    if request.user.role not in ['guide', 'admin']:
        return Response({'error': 'Permission denied'}, status=403)
    
    total_clients = ClientAssessmentAssignment.objects.filter(
        guide=request.user
    ).values('client').distinct().count()
    
    active_assignments = ClientAssessmentAssignment.objects.filter(
        guide=request.user,
        is_completed=False
    ).count()
    
    crisis_alerts = CrisisAlert.objects.filter(
        status__in=['active', 'acknowledged']
    ).count()
    
    return Response({
        'totalClients': total_clients,
        'activeAssignments': active_assignments,
        'crisisAlerts': crisis_alerts,
        'responseTime': '2.3 hours',
        'completionRate': '85%'
    })
