from django.db import models
from django.conf import settings
from django.utils import timezone

class CrisisHotline(models.Model):
    """Crisis hotlines and emergency contacts"""
    HOTLINE_TYPES = [
        ('suicide_prevention', 'Suicide Prevention'),
        ('crisis_text', 'Crisis Text Line'),
        ('domestic_violence', 'Domestic Violence'),
        ('substance_abuse', 'Substance Abuse'),
        ('lgbtq', 'LGBTQ+ Support'),
        ('teen_specific', 'Teen-Specific'),
        ('general_mental_health', 'General Mental Health'),
        ('emergency', 'Emergency Services'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    hotline_type = models.CharField(max_length=30, choices=HOTLINE_TYPES)

    # Contact Information
    phone_number = models.CharField(max_length=20)
    text_number = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    chat_url = models.URLField(blank=True, help_text="Online chat URL")

    # Availability
    is_24_7 = models.BooleanField(default=True)
    hours_description = models.CharField(max_length=200, blank=True)
    languages = models.JSONField(default=list, help_text="Languages supported")

    # Geographic Coverage
    country = models.CharField(max_length=100, default="United States")
    regions_served = models.JSONField(default=list, help_text="States/regions served")
    is_international = models.BooleanField(default=False)

    # Metadata
    is_active = models.BooleanField(default=True)
    priority_order = models.PositiveIntegerField(default=0, help_text="Display order priority")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crisis_hotline'
        ordering = ['priority_order', 'name']

    def __str__(self):
        return f"{self.name} ({self.phone_number})"

class CrisisResource(models.Model):
    """Crisis intervention resources and coping strategies"""
    RESOURCE_TYPES = [
        ('immediate_coping', 'Immediate Coping Strategy'),
        ('breathing_exercise', 'Breathing Exercise'),
        ('grounding_technique', 'Grounding Technique'),
        ('safety_plan', 'Safety Planning'),
        ('distraction_activity', 'Distraction Activity'),
        ('emergency_contacts', 'Emergency Contacts'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    resource_type = models.CharField(max_length=30, choices=RESOURCE_TYPES)

    # Content
    instructions = models.TextField(help_text="Step-by-step instructions")
    estimated_time_minutes = models.PositiveIntegerField(null=True, blank=True)

    # Targeting
    crisis_situations = models.JSONField(default=list, help_text="Applicable crisis situations")
    age_appropriate = models.JSONField(default=list, help_text="Appropriate age ranges")

    # Metadata
    is_active = models.BooleanField(default=True)
    priority_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crisis_resource'
        ordering = ['priority_order', 'title']

    def __str__(self):
        return self.title

class CrisisAlert(models.Model):
    """Crisis alerts triggered by user behavior or self-reporting"""
    ALERT_TYPES = [
        ('self_reported', 'Self-Reported Crisis'),
        ('sentiment_detected', 'Sentiment Analysis Alert'),
        ('assessment_triggered', 'Assessment Score Alert'),
        ('keyword_detected', 'Keyword Detection'),
        ('behavior_pattern', 'Concerning Behavior Pattern'),
    ]

    SEVERITY_LEVELS = [
        ('low', 'Low Risk'),
        ('moderate', 'Moderate Risk'),
        ('high', 'High Risk'),
        ('imminent', 'Imminent Danger'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
        ('false_positive', 'False Positive'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='crisis_alerts')
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPES)
    severity_level = models.CharField(max_length=20, choices=SEVERITY_LEVELS)

    # Alert Details
    trigger_content = models.TextField(blank=True, help_text="Content that triggered the alert")
    context_data = models.JSONField(default=dict, help_text="Additional context information")

    # Response
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    responder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='crisis_responses'
    )
    response_notes = models.TextField(blank=True)

    # Follow-up
    follow_up_required = models.BooleanField(default=True)
    follow_up_completed = models.BooleanField(default=False)
    follow_up_date = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'crisis_alert'
        ordering = ['-created_at']

    def __str__(self):
        return f"Crisis Alert: {self.user.username} - {self.severity_level} ({self.status})"

class UserSafetyPlan(models.Model):
    """Personalized safety plans for users"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='safety_plan')

    # Warning Signs
    warning_signs = models.JSONField(default=list, help_text="Personal warning signs")
    triggers = models.JSONField(default=list, help_text="Known triggers")

    # Coping Strategies
    coping_strategies = models.JSONField(default=list, help_text="Personal coping strategies")
    distractions = models.JSONField(default=list, help_text="Healthy distractions")

    # Support Network
    support_contacts = models.JSONField(default=list, help_text="Personal support contacts")
    professional_contacts = models.JSONField(default=list, help_text="Mental health professionals")

    # Environment Safety
    environment_safety = models.JSONField(default=list, help_text="Environmental safety measures")

    # Emergency Plan
    emergency_contacts = models.JSONField(default=list, help_text="Emergency contacts")
    emergency_plan = models.TextField(blank=True, help_text="Emergency action plan")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_reviewed = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'crisis_user_safety_plan'

    def __str__(self):
        return f"Safety Plan: {self.user.username}"
