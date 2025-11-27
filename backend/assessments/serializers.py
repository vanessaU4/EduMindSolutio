from rest_framework import serializers
from .models import (
    AssessmentType, AssessmentQuestion, Assessment, 
    AssessmentResponse, AssessmentRecommendation, AssessmentRequest, 
    ClientAssessmentAssignment, QuestionOption
)
from django.contrib.auth import get_user_model

User = get_user_model()

class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'score', 'order']

class AssessmentQuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = AssessmentQuestion
        fields = [
            'id', 'question_number', 'question_text', 'question_type', 
            'options', 'is_reverse_scored', 'is_required', 'min_value', 
            'max_value', 'scale_labels'
        ]

class CreateQuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, required=False)
    
    class Meta:
        model = AssessmentQuestion
        fields = [
            'assessment_type', 'question_text', 'question_type', 
            'options', 'is_reverse_scored', 'is_required', 'min_value', 
            'max_value', 'scale_labels'
        ]
    
    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        
        # Get the next question number for this assessment type
        assessment_type = validated_data['assessment_type']
        last_question = AssessmentQuestion.objects.filter(
            assessment_type=assessment_type
        ).order_by('-question_number').first()
        
        question_number = (last_question.question_number + 1) if last_question else 1
        validated_data['question_number'] = question_number
        
        question = AssessmentQuestion.objects.create(**validated_data)
        
        # Create options for the question
        for i, option_data in enumerate(options_data):
            option_data['order'] = i
            QuestionOption.objects.create(question=question, **option_data)
        
        return question

class AssessmentTypeSerializer(serializers.ModelSerializer):
    questions = AssessmentQuestionSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    name = serializers.CharField(required=False)  # Make name optional for updates
    
    class Meta:
        model = AssessmentType
        fields = [
            'id', 'name', 'display_name', 'description', 'instructions',
            'total_questions', 'max_score', 'is_active', 'is_standard', 
            'created_by', 'created_by_name', 'created_at', 'updated_at', 'questions'
        ]
        read_only_fields = ['id', 'is_standard', 'created_at', 'updated_at']
        extra_kwargs = {
            'name': {'required': False},  # Make name optional for partial updates
            'display_name': {'required': False},  # Make optional for partial updates
            'description': {'required': False},  # Make optional for partial updates
        }
    
    def validate_name(self, value):
        """Validate assessment name format"""
        if value is None:
            return value
            
        import re
        if not re.match(r'^[A-Za-z0-9_]+$', value):
            raise serializers.ValidationError(
                'Name can only contain letters, numbers, and underscores.'
            )
        return value.upper()  # Convert to uppercase for consistency
    
    def validate(self, attrs):
        """Custom validation for updates"""
        # If this is an update operation and the instance is a standard assessment
        if self.instance and getattr(self.instance, 'is_standard', False):
            # Remove name from attrs if it's being updated for standard assessments
            if 'name' in attrs:
                attrs.pop('name')
        
        return attrs

class CreateAssessmentTypeSerializer(serializers.ModelSerializer):
    """Serializer for creating custom assessment types"""
    questions_data = serializers.ListField(
        child=serializers.DictField(), 
        write_only=True, 
        required=False,
        help_text="List of questions to create with the assessment"
    )
    
    class Meta:
        model = AssessmentType
        fields = [
            'name', 'display_name', 'description', 'instructions',
            'is_active', 'questions_data'
        ]
    
    def validate_name(self, value):
        """Validate assessment name format"""
        import re
        if not re.match(r'^[A-Za-z0-9_]+$', value):
            raise serializers.ValidationError(
                'Name can only contain letters, numbers, and underscores.'
            )
        return value.upper()
    
    def create(self, validated_data):
        """Create assessment type with optional questions"""
        questions_data = validated_data.pop('questions_data', [])
        
        # Set the created_by field
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        
        # Create the assessment type
        assessment_type = AssessmentType.objects.create(**validated_data)
        
        # Create questions if provided
        total_score = 0
        for i, question_data in enumerate(questions_data):
            question = AssessmentQuestion.objects.create(
                assessment_type=assessment_type,
                question_number=i + 1,
                question_text=question_data.get('question_text', ''),
                question_type=question_data.get('question_type', 'multiple_choice'),
                is_reverse_scored=question_data.get('is_reverse_scored', False),
                is_required=question_data.get('is_required', True)
            )
            
            # Create options for the question
            options_data = question_data.get('options', [])
            for j, option_data in enumerate(options_data):
                option = QuestionOption.objects.create(
                    question=question,
                    text=option_data.get('text', ''),
                    score=option_data.get('score', j),
                    order=j
                )
                total_score = max(total_score, option.score)
        
        # Update assessment type with calculated values
        assessment_type.total_questions = len(questions_data)
        assessment_type.max_score = total_score * len(questions_data) if questions_data else 0
        assessment_type.save()
        
        return assessment_type

class AssessmentResponseSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    selected_option_text = serializers.CharField(source='selected_option_id.text', read_only=True)
    
    class Meta:
        model = AssessmentResponse
        fields = ['question', 'question_text', 'selected_option_id', 'selected_option_text', 'response_value']

class AssessmentSerializer(serializers.ModelSerializer):
    responses = AssessmentResponseSerializer(many=True, read_only=True)
    assessment_type_name = serializers.CharField(source='assessment_type.display_name', read_only=True)
    assessment_type = serializers.SerializerMethodField()
    percentage_score = serializers.ReadOnlyField(source='get_percentage_score')
    
    class Meta:
        model = Assessment
        fields = [
            'id', 'assessment_type', 'assessment_type_name', 'total_score', 
            'percentage_score', 'risk_level', 'interpretation', 'recommendations',
            'completed_at', 'responses'
        ]
        read_only_fields = ['id', 'completed_at', 'total_score', 'risk_level', 'interpretation']
    
    def get_assessment_type(self, obj):
        """Return assessment type details"""
        return {
            'id': obj.assessment_type.id,
            'name': obj.assessment_type.name,
            'display_name': obj.assessment_type.display_name,
            'max_score': obj.assessment_type.max_score
        }

class TakeAssessmentSerializer(serializers.Serializer):
    """Serializer for taking an assessment"""
    assessment_type_id = serializers.IntegerField()
    responses = serializers.ListField(
        child=serializers.DictField(
            child=serializers.IntegerField()
        )
    )
    
    def validate_assessment_type_id(self, value):
        try:
            assessment_type = AssessmentType.objects.get(id=value, is_active=True)
        except AssessmentType.DoesNotExist:
            raise serializers.ValidationError("Invalid assessment type.")
        return value
    
    def validate_responses(self, value):
        if not value:
            raise serializers.ValidationError("Responses are required.")
        
        # Validate response format
        for response in value:
            if 'question_id' not in response or 'selected_option_index' not in response:
                raise serializers.ValidationError(
                    "Each response must have 'question_id' and 'selected_option_index'."
                )
        
        return value

class AssessmentRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentRecommendation
        fields = [
            'id', 'assessment_type', 'risk_level', 'title', 'description',
            'action_items', 'resources', 'priority'
        ]

class AssessmentHistorySerializer(serializers.ModelSerializer):
    """Simplified serializer for assessment history"""
    assessment_type = serializers.SerializerMethodField()
    percentage_score = serializers.ReadOnlyField(source='get_percentage_score')
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Assessment
        fields = [
            'id', 'user', 'assessment_type', 'total_score', 'percentage_score',
            'risk_level', 'interpretation', 'completed_at'
        ]
    
    def get_user(self, obj):
        """Return user details"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'full_name': obj.user.get_full_name() if hasattr(obj.user, 'get_full_name') else f"{obj.user.first_name} {obj.user.last_name}".strip()
        }
    
    def get_assessment_type(self, obj):
        """Return assessment type details"""
        return {
            'id': obj.assessment_type.id,
            'name': obj.assessment_type.name,
            'display_name': obj.assessment_type.display_name,
            'max_score': obj.assessment_type.max_score
        }

class AssessmentRequestSerializer(serializers.ModelSerializer):
    """Serializer for assessment requests"""
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    target_assessment_name = serializers.CharField(source='target_assessment.display_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta:
        model = AssessmentRequest
        fields = [
            'id', 'requester', 'requester_name', 'request_type', 'title', 'description',
            'justification', 'target_assessment', 'target_assessment_name', 'proposed_questions',
            'expected_outcomes', 'status', 'admin_notes', 'reviewed_by', 'reviewed_by_name',
            'created_at', 'updated_at', 'reviewed_at'
        ]
        read_only_fields = ['id', 'requester', 'created_at', 'updated_at', 'reviewed_at']

class CreateAssessmentRequestSerializer(serializers.ModelSerializer):
    """Serializer for creating assessment requests"""
    
    class Meta:
        model = AssessmentRequest
        fields = [
            'request_type', 'title', 'description', 'justification',
            'target_assessment', 'proposed_questions', 'expected_outcomes'
        ]

class ClientAssessmentAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for client assessment assignments"""
    guide_name = serializers.CharField(source='guide.get_full_name', read_only=True)
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    assessment_type_name = serializers.CharField(source='assessment_type.display_name', read_only=True)
    
    class Meta:
        model = ClientAssessmentAssignment
        fields = [
            'id', 'guide', 'guide_name', 'client', 'client_name', 'assessment_type',
            'assessment_type_name', 'assigned_date', 'due_date', 'priority', 'notes',
            'is_completed', 'completed_at', 'reminder_sent'
        ]
        read_only_fields = ['id', 'guide', 'assigned_date', 'completed_at']

class CreateAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for creating assessment assignments"""
    
    class Meta:
        model = ClientAssessmentAssignment
        fields = ['client', 'assessment_type', 'due_date', 'priority', 'notes']
