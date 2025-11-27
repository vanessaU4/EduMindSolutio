from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import json

class AssessmentType(models.Model):
    """Types of mental health assessments available"""
    # Standard assessment types (for reference)
    STANDARD_ASSESSMENT_CHOICES = [
        ('PHQ9', 'Patient Health Questionnaire-9 (Depression)'),
        ('GAD7', 'Generalized Anxiety Disorder-7'),
        ('PCL5', 'PTSD Checklist for DSM-5'),
    ]

    name = models.CharField(max_length=50, unique=True, help_text="Unique identifier for the assessment type")
    display_name = models.CharField(max_length=100)
    description = models.TextField()
    instructions = models.TextField()
    total_questions = models.PositiveIntegerField(default=0)
    max_score = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_standard = models.BooleanField(default=False, help_text="True for standard assessments (PHQ9, GAD7, PCL5)")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, help_text="User who created this assessment type")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assessments_type'
        verbose_name = 'Assessment Type'
        verbose_name_plural = 'Assessment Types'

    def clean(self):
        """Validate the assessment type data"""
        from django.core.exceptions import ValidationError
        import re
        
        # Validate name format (alphanumeric and underscores only)
        if not re.match(r'^[A-Za-z0-9_]+$', self.name):
            raise ValidationError({'name': 'Name can only contain letters, numbers, and underscores.'})
        
        # Ensure name is uppercase for consistency
        self.name = self.name.upper()
        
        # Check if this is a standard assessment
        standard_names = [choice[0] for choice in self.STANDARD_ASSESSMENT_CHOICES]
        self.is_standard = self.name in standard_names

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.display_name

class AssessmentQuestion(models.Model):
    """Individual questions for each assessment type"""
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('multiple_select', 'Multiple Select'),
        ('text_input', 'Text Input'),
        ('rating_scale', 'Rating Scale'),
        ('yes_no', 'Yes/No'),
        ('likert_scale', 'Likert Scale'),
    ]
    
    assessment_type = models.ForeignKey(AssessmentType, on_delete=models.CASCADE, related_name='questions')
    question_number = models.IntegerField()
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='multiple_choice')
    is_reverse_scored = models.BooleanField(default=False)
    is_required = models.BooleanField(default=True)
    min_value = models.IntegerField(null=True, blank=True)  # For rating scales
    max_value = models.IntegerField(null=True, blank=True)  # For rating scales
    scale_labels = models.JSONField(null=True, blank=True)  # For custom scale labels
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assessments_question'
        unique_together = ['assessment_type', 'question_number']
        ordering = ['assessment_type', 'question_number']

    def __str__(self):
        return f"{self.assessment_type.name} Q{self.question_number}"

class Assessment(models.Model):
    """Individual assessment instances taken by users"""
    RISK_LEVELS = [
        ('minimal', 'Minimal'),
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('moderately_severe', 'Moderately Severe'),
        ('severe', 'Severe'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessments')
    assessment_type = models.ForeignKey(AssessmentType, on_delete=models.CASCADE)
    total_score = models.PositiveIntegerField()
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    interpretation = models.TextField()
    recommendations = models.JSONField(default=list)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assessments_assessment'
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} - {self.assessment_type.name} ({self.completed_at.date()})"

    def get_percentage_score(self):
        """Calculate percentage score"""
        return round((self.total_score / self.assessment_type.max_score) * 100, 1)

class QuestionOption(models.Model):
    """Options for multiple choice questions"""
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=500)
    score = models.IntegerField()
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'assessments_question_option'
        ordering = ['question', 'order']
        
    def __str__(self):
        return f"{self.question} - {self.text}"

class AssessmentResponse(models.Model):
    """Individual responses to assessment questions"""
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    selected_option_id = models.ForeignKey(QuestionOption, on_delete=models.CASCADE, null=True, blank=True)
    selected_option_ids = models.JSONField(null=True, blank=True)  # For multiple select
    text_response = models.TextField(null=True, blank=True)  # For text input questions
    numeric_response = models.IntegerField(null=True, blank=True)  # For rating scales
    response_value = models.IntegerField()  # Final calculated score
    response_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assessments_response'
        unique_together = ['assessment', 'question']

    def __str__(self):
        return f"{self.assessment} - Q{self.question.question_number}: {self.response_value}"

class AssessmentRecommendation(models.Model):
    """Predefined recommendations based on assessment results"""
    assessment_type = models.ForeignKey(AssessmentType, on_delete=models.CASCADE, related_name='recommendations')
    risk_level = models.CharField(max_length=20, choices=Assessment.RISK_LEVELS)
    title = models.CharField(max_length=200)
    description = models.TextField()
    action_items = models.JSONField(default=list)
    resources = models.JSONField(default=list)
    priority = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'assessments_recommendation'
        ordering = ['assessment_type', 'priority']

    def __str__(self):
        return f"{self.assessment_type.name} - {self.risk_level}: {self.title}"

class AssessmentRequest(models.Model):
    """Model for guides to request new assessments or modifications"""
    REQUEST_TYPES = [
        ('new_assessment', 'New Assessment Type'),
        ('modify_assessment', 'Modify Existing Assessment'),
        ('add_questions', 'Add Questions to Assessment'),
        ('modify_scoring', 'Modify Scoring System'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessment_requests')
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    justification = models.TextField(help_text="Why is this assessment needed?")
    target_assessment = models.ForeignKey(AssessmentType, on_delete=models.CASCADE, null=True, blank=True, 
                                        help_text="For modifications to existing assessments")
    proposed_questions = models.JSONField(default=list, help_text="Proposed questions and options")
    expected_outcomes = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, 
                                  related_name='reviewed_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'assessments_request'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

class ClientAssessmentAssignment(models.Model):
    """Model for guides to assign specific assessments to clients"""
    guide = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_assessments')
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessment_assignments')
    assessment_type = models.ForeignKey(AssessmentType, on_delete=models.CASCADE)
    assigned_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium')
    notes = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    reminder_sent = models.BooleanField(default=False)

    class Meta:
        db_table = 'assessments_assignment'
        unique_together = ['guide', 'client', 'assessment_type']
        ordering = ['-assigned_date']

    def __str__(self):
        return f"{self.client.username} - {self.assessment_type.name} (by {self.guide.username})"
