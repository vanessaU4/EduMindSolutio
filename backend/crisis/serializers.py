from rest_framework import serializers
from .models import CrisisHotline, CrisisResource, CrisisAlert, UserSafetyPlan
from django.contrib.auth import get_user_model

User = get_user_model()

class CrisisHotlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrisisHotline
        fields = [
            'id', 'name', 'description', 'hotline_type', 'phone_number',
            'text_number', 'website', 'chat_url', 'is_24_7', 'hours_description',
            'languages', 'country', 'regions_served', 'is_international',
            'is_active', 'priority_order'
        ]

class CrisisResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrisisResource
        fields = [
            'id', 'title', 'description', 'resource_type', 'instructions',
            'estimated_time_minutes', 'crisis_situations', 'age_appropriate',
            'is_active', 'priority_order', 'created_at'
        ]

class CrisisAlertSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    responder_name = serializers.CharField(source='responder.get_full_name', read_only=True)
    
    class Meta:
        model = CrisisAlert
        fields = [
            'id', 'user', 'user_name', 'alert_type', 'severity_level',
            'trigger_content', 'context_data', 'status', 'responder',
            'responder_name', 'response_notes', 'follow_up_required',
            'follow_up_completed', 'follow_up_date', 'created_at',
            'acknowledged_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'created_at', 'acknowledged_at', 'resolved_at']

class CreateCrisisAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrisisAlert
        fields = [
            'alert_type', 'severity_level', 'trigger_content', 'context_data'
        ]

class UserSafetyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSafetyPlan
        fields = [
            'id', 'warning_signs', 'triggers', 'coping_strategies', 'distractions',
            'support_contacts', 'professional_contacts', 'environment_safety',
            'emergency_contacts', 'emergency_plan', 'created_at', 'updated_at',
            'last_reviewed'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CreateSafetyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSafetyPlan
        fields = [
            'warning_signs', 'triggers', 'coping_strategies', 'distractions',
            'support_contacts', 'professional_contacts', 'environment_safety',
            'emergency_contacts', 'emergency_plan'
        ]

class CrisisStatsSerializer(serializers.Serializer):
    """Serializer for crisis management statistics"""
    total_alerts = serializers.IntegerField()
    active_alerts = serializers.IntegerField()
    high_risk_alerts = serializers.IntegerField()
    resolved_alerts = serializers.IntegerField()
    users_with_safety_plans = serializers.IntegerField()
    alerts_this_week = serializers.IntegerField()
    response_time_avg = serializers.FloatField()

class CrisisResponseSerializer(serializers.Serializer):
    """Serializer for crisis alert responses"""
    action = serializers.ChoiceField(choices=['acknowledge', 'resolve', 'escalate'])
    response_notes = serializers.CharField(required=False, allow_blank=True)
    follow_up_date = serializers.DateTimeField(required=False, allow_null=True)
