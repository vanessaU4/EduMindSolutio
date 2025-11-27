from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Avg, Count, Q
from .models import AssessmentType, AssessmentQuestion, Assessment, AssessmentResponse
import json

User = get_user_model()

class QuestionResponseTracker:
    """
    Real-time question response tracking system
    """
    
    @staticmethod
    def track_question_response(assessment_id, question_id, user_id, selected_option_id, response_value):
        """
        Track a user's response to a specific question in real-time
        """
        try:
            assessment = Assessment.objects.get(id=assessment_id)
            question = AssessmentQuestion.objects.get(id=question_id)
            user = User.objects.get(id=user_id)
            
            # Create or update the response
            response, created = AssessmentResponse.objects.update_or_create(
                assessment=assessment,
                question=question,
                defaults={
                    'selected_option_id': selected_option_id,
                    'response_value': response_value,
                    'response_time': timezone.now()
                }
            )
            
            # Update real-time analytics
            QuestionResponseTracker.update_question_analytics(question_id)
            
            return {
                'success': True,
                'response_id': response.id,
                'created': created,
                'timestamp': response.response_time
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def update_question_analytics(question_id):
        """
        Update real-time analytics for a specific question
        """
        try:
            question = AssessmentQuestion.objects.get(id=question_id)
            
            # Get all responses for this question
            responses = AssessmentResponse.objects.filter(question=question)
            
            # Calculate analytics
            total_responses = responses.count()
            avg_score = responses.aggregate(avg_score=Avg('response_value'))['avg_score'] or 0
            
            # Calculate option distribution
            option_distribution = {}
            for option in question.options.all():
                count = responses.filter(selected_option_id=option.id).count()
                option_distribution[option.text] = count
            
            # Store analytics in cache or update question metadata
            analytics_data = {
                'total_responses': total_responses,
                'average_score': round(avg_score, 2),
                'option_distribution': option_distribution,
                'last_updated': timezone.now().isoformat()
            }
            
            # You could store this in Redis cache for real-time access
            # or update a separate analytics table
            
            return analytics_data
            
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def get_real_time_question_analytics(question_id=None, assessment_type_id=None):
        """
        Get real-time analytics for questions
        """
        try:
            if question_id:
                questions = AssessmentQuestion.objects.filter(id=question_id)
            elif assessment_type_id:
                questions = AssessmentQuestion.objects.filter(assessment_type_id=assessment_type_id)
            else:
                questions = AssessmentQuestion.objects.all()
            
            analytics_data = []
            
            for question in questions:
                responses = AssessmentResponse.objects.filter(question=question)
                total_responses = responses.count()
                
                if total_responses > 0:
                    avg_score = responses.aggregate(avg_score=Avg('response_value'))['avg_score'] or 0
                    
                    # Option distribution
                    option_distribution = {}
                    option_percentages = {}
                    
                    for option in question.options.all():
                        count = responses.filter(selected_option_id=option.id).count()
                        option_distribution[option.text] = count
                        option_percentages[option.text] = (count / total_responses) * 100 if total_responses > 0 else 0
                    
                    analytics_data.append({
                        'question_id': question.id,
                        'question_text': question.question_text,
                        'assessment_type': question.assessment_type.name,
                        'total_responses': total_responses,
                        'average_score': round(avg_score, 2),
                        'option_distribution': option_distribution,
                        'option_percentages': {k: round(v, 1) for k, v in option_percentages.items()},
                        'options': [
                            {'text': opt.text, 'score': opt.score}
                            for opt in question.options.all()
                        ]
                    })
            
            return {
                'questions': analytics_data,
                'total_questions': len(analytics_data),
                'total_responses': sum(q['total_responses'] for q in analytics_data)
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def get_user_response_patterns(user_id):
        """
        Analyze a user's response patterns across assessments
        """
        try:
            user = User.objects.get(id=user_id)
            assessments = Assessment.objects.filter(user=user)
            
            patterns = {
                'total_assessments': assessments.count(),
                'completed_assessments': assessments.filter(is_completed=True).count(),
                'average_completion_time': None,
                'most_common_scores': {},
                'assessment_frequency': {},
                'recent_activity': []
            }
            
            # Calculate average completion time
            completed = assessments.filter(is_completed=True, completed_at__isnull=False)
            if completed.exists():
                completion_times = []
                for assessment in completed:
                    if assessment.started_at and assessment.completed_at:
                        duration = (assessment.completed_at - assessment.started_at).total_seconds() / 60
                        completion_times.append(duration)
                
                if completion_times:
                    patterns['average_completion_time'] = round(sum(completion_times) / len(completion_times), 1)
            
            # Get recent activity
            recent_assessments = assessments.order_by('-created_at')[:5]
            for assessment in recent_assessments:
                patterns['recent_activity'].append({
                    'assessment_type': assessment.assessment_type.display_name,
                    'date': assessment.created_at.isoformat(),
                    'completed': assessment.is_completed,
                    'score': assessment.total_score
                })
            
            return patterns
            
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def get_assessment_completion_rates():
        """
        Get completion rates for different assessment types
        """
        try:
            assessment_types = AssessmentType.objects.all()
            completion_data = []
            
            for assessment_type in assessment_types:
                total_started = Assessment.objects.filter(assessment_type=assessment_type).count()
                total_completed = Assessment.objects.filter(
                    assessment_type=assessment_type, 
                    is_completed=True
                ).count()
                
                completion_rate = (total_completed / total_started * 100) if total_started > 0 else 0
                
                completion_data.append({
                    'assessment_type': assessment_type.name,
                    'display_name': assessment_type.display_name,
                    'total_started': total_started,
                    'total_completed': total_completed,
                    'completion_rate': round(completion_rate, 1),
                    'average_score': Assessment.objects.filter(
                        assessment_type=assessment_type,
                        is_completed=True
                    ).aggregate(avg_score=Avg('total_score'))['avg_score'] or 0
                })
            
            return {
                'assessment_types': completion_data,
                'overall_completion_rate': round(
                    sum(d['total_completed'] for d in completion_data) / 
                    sum(d['total_started'] for d in completion_data) * 100, 1
                ) if sum(d['total_started'] for d in completion_data) > 0 else 0
            }
            
        except Exception as e:
            return {'error': str(e)}

class RealTimeNotifications:
    """
    Real-time notifications for assessment responses and analytics
    """
    
    @staticmethod
    def notify_low_completion_rate(assessment_type_id, threshold=50):
        """
        Notify when an assessment type has low completion rate
        """
        try:
            assessment_type = AssessmentType.objects.get(id=assessment_type_id)
            total_started = Assessment.objects.filter(assessment_type=assessment_type).count()
            total_completed = Assessment.objects.filter(
                assessment_type=assessment_type, 
                is_completed=True
            ).count()
            
            completion_rate = (total_completed / total_started * 100) if total_started > 0 else 0
            
            if completion_rate < threshold and total_started >= 10:  # Only notify if significant sample size
                return {
                    'alert': True,
                    'message': f"Low completion rate for {assessment_type.display_name}: {completion_rate:.1f}%",
                    'assessment_type': assessment_type.name,
                    'completion_rate': completion_rate,
                    'total_started': total_started,
                    'total_completed': total_completed
                }
            
            return {'alert': False}
            
        except Exception as e:
            return {'error': str(e)}
    
    @staticmethod
    def notify_unusual_response_pattern(user_id):
        """
        Notify if a user shows unusual response patterns that might indicate distress
        """
        try:
            user = User.objects.get(id=user_id)
            recent_assessments = Assessment.objects.filter(
                user=user,
                is_completed=True,
                completed_at__gte=timezone.now() - timezone.timedelta(days=30)
            ).order_by('-completed_at')[:5]
            
            if recent_assessments.count() < 2:
                return {'alert': False, 'reason': 'Insufficient data'}
            
            scores = [assessment.total_score for assessment in recent_assessments]
            avg_score = sum(scores) / len(scores)
            
            # Check for consistently high scores (potential crisis indicators)
            high_score_threshold = 15  # Adjust based on your scoring system
            if avg_score > high_score_threshold:
                return {
                    'alert': True,
                    'level': 'high',
                    'message': f"User {user.username} showing consistently high assessment scores",
                    'average_score': round(avg_score, 1),
                    'recent_scores': scores,
                    'recommendation': 'Consider reaching out for wellness check'
                }
            
            # Check for rapid score increases
            if len(scores) >= 3:
                recent_trend = scores[0] - scores[2]  # Most recent vs 3rd most recent
                if recent_trend > 8:  # Significant increase
                    return {
                        'alert': True,
                        'level': 'medium',
                        'message': f"User {user.username} showing rapid increase in assessment scores",
                        'score_change': recent_trend,
                        'recent_scores': scores[:3],
                        'recommendation': 'Monitor for continued trend'
                    }
            
            return {'alert': False}
            
        except Exception as e:
            return {'error': str(e)}
