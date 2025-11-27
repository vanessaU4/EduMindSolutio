from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import AssessmentType, AssessmentQuestion, QuestionOption
from .serializers import (
    AssessmentTypeSerializer, AssessmentQuestionSerializer, 
    CreateQuestionSerializer, QuestionOptionSerializer
)
from .permissions import IsAdminOrGuide
from .response_tracking import QuestionResponseTracker, RealTimeNotifications
import json

class QuestionManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assessment questions dynamically
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AssessmentQuestion.objects.all()
    
    def get_serializer_class(self):
        return AssessmentQuestionSerializer

    # Note: assessment_types method removed - use /assessments/types/ endpoint instead
    # which uses AssessmentTypeSerializer and includes questions automatically

    def create(self, request):
        """Create a new question for an assessment type"""
        if not (request.user.role == 'admin' or request.user.role == 'guide'):
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CreateQuestionSerializer(data=request.data)
        if serializer.is_valid():
            question = serializer.save()
            return Response(
                AssessmentQuestionSerializer(question).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """Update an existing question"""
        if not (request.user.role == 'admin' or request.user.role == 'guide'):
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        question = get_object_or_404(AssessmentQuestion, pk=pk)
        serializer = AssessmentQuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            question = serializer.save()
            return Response(AssessmentQuestionSerializer(question).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete a question"""
        if not (request.user.role == 'admin' or request.user.role == 'guide'):
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        question = get_object_or_404(AssessmentQuestion, pk=pk)
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get real-time question analytics"""
        try:
            analytics_data = QuestionResponseTracker.get_real_time_question_analytics()
            return Response(analytics_data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def track_response(self, request):
        """Track a question response"""
        try:
            tracker = QuestionResponseTracker()
            question_id = request.data.get('question_id')
            user_id = request.user.id
            response_data = request.data.get('response_data', {})
            
            tracker.track_response(question_id, user_id, response_data)
            return Response({'status': 'success'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def completion_rates(self, request):
        """Get assessment completion rates"""
        try:
            completion_data = QuestionResponseTracker.get_assessment_completion_rates()
            return Response(completion_data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['put'])
    def update_question(self, request, pk=None):
        """Update an existing question"""
        try:
            question = get_object_or_404(AssessmentQuestion, id=pk)
            
            # Check user permissions
            if request.user.role not in ['admin', 'guide']:
                return Response(
                    {'error': 'Permission denied. Only admins and guides can edit questions.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            data = request.data
            
            # Update question fields
            if 'question_text' in data:
                question.question_text = data['question_text']
            if 'options' in data:
                question.options = data['options']
            if 'is_reverse_scored' in data:
                question.is_reverse_scored = data['is_reverse_scored']
            
            question.save()
            
            return Response({
                'id': question.id,
                'question_number': question.question_number,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'options': question.options.all().values('id', 'text', 'score', 'order'),
                'is_reverse_scored': question.is_reverse_scored,
                'is_required': question.is_required
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['delete'])
    def delete_question(self, request, pk=None):
        """Delete a question"""
        try:
            question = get_object_or_404(AssessmentQuestion, id=pk)
            
            # Check user permissions
            if request.user.role not in ['admin', 'guide']:
                return Response(
                    {'error': 'Permission denied. Only admins and guides can delete questions.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            assessment_type = question.assessment_type
            question.delete()
            
            # Update question numbers for remaining questions
            remaining_questions = AssessmentQuestion.objects.filter(
                assessment_type=assessment_type
            ).order_by('question_number')
            
            for i, q in enumerate(remaining_questions, 1):
                if q.question_number != i:
                    q.question_number = i
                    q.save()
            
            # Update assessment type counts
            assessment_type.total_questions = assessment_type.questions.count()
            if assessment_type.questions.exists():
                assessment_type.max_score = sum([
                    max([opt.get('score', 0) for opt in q.options]) 
                    for q in assessment_type.questions.all() 
                    if q.options
                ])
            else:
                assessment_type.max_score = 0
            assessment_type.save()
            
            return Response({'message': 'Question deleted successfully'})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def question_analytics(self, request):
        """
        Get real-time analytics for all questions
        """
        if not (request.user.role == 'admin' or request.user.role == 'guide'):
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            analytics_data = QuestionResponseTracker.get_real_time_question_analytics()
            return Response(analytics_data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def bulk_create_questions(self, request):
        """Create multiple questions at once"""
        try:
            # Check user permissions
            if request.user.role not in ['admin', 'guide']:
                return Response(
                    {'error': 'Permission denied. Only admins and guides can create questions.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            data = request.data
            assessment_type_id = data.get('assessment_type_id')
            questions_data = data.get('questions', [])
            
            assessment_type = get_object_or_404(AssessmentType, id=assessment_type_id)
            
            created_questions = []
            
            with transaction.atomic():
                # Get starting question number
                last_question = AssessmentQuestion.objects.filter(
                    assessment_type=assessment_type
                ).order_by('-question_number').first()
                
                start_number = (last_question.question_number + 1) if last_question else 1
                
                for i, question_data in enumerate(questions_data):
                    question = AssessmentQuestion.objects.create(
                        assessment_type=assessment_type,
                        question_number=start_number + i,
                        question_text=question_data.get('question_text', ''),
                        options=question_data.get('options', []),
                        is_reverse_scored=question_data.get('is_reverse_scored', False)
                    )
                    
                    created_questions.append({
                        'id': question.id,
                        'question_number': question.question_number,
                        'question_text': question.question_text,
                        'options': question.options,
                        'is_reverse_scored': question.is_reverse_scored
                    })
                
                # Update assessment type totals
                assessment_type.total_questions = assessment_type.questions.count()
                assessment_type.max_score = sum([
                    max([opt.get('score', 0) for opt in q.options]) 
                    for q in assessment_type.questions.all() 
                    if q.options
                ])
                assessment_type.save()
            
            return Response({
                'created_questions': created_questions,
                'count': len(created_questions)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
