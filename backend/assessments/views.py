from rest_framework import generics, status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import (
    AssessmentType, AssessmentQuestion, Assessment, AssessmentResponse, 
    AssessmentRecommendation, AssessmentRequest, ClientAssessmentAssignment
)
from .serializers import (
    AssessmentTypeSerializer, AssessmentSerializer, TakeAssessmentSerializer,
    AssessmentHistorySerializer, AssessmentRecommendationSerializer,
    AssessmentRequestSerializer, CreateAssessmentRequestSerializer,
    ClientAssessmentAssignmentSerializer, CreateAssignmentSerializer,
    CreateAssessmentTypeSerializer
)
from accounts.permissions import HasCompletedOnboarding
from django.db.models import Count, Avg
from datetime import datetime, timedelta
from django.utils import timezone

class AssessmentTypeListView(generics.ListAPIView):
    """List available assessment types"""
    queryset = AssessmentType.objects.filter(is_active=True)
    serializer_class = AssessmentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class AssessmentDetailView(generics.RetrieveAPIView):
    """Get specific assessment type with questions"""
    queryset = AssessmentType.objects.filter(is_active=True)
    serializer_class = AssessmentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Override to support both ID and name lookups"""
        queryset = self.get_queryset()
        
        # Check if we have 'pk' (numeric ID) or 'name' (string) in URL
        if 'pk' in self.kwargs:
            # Numeric ID lookup
            return get_object_or_404(queryset, pk=self.kwargs['pk'])
        elif 'name' in self.kwargs:
            # String name lookup
            name = self.kwargs['name'].upper()  # Convert to uppercase for consistency
            return get_object_or_404(queryset, name=name)
        else:
            # Fallback to default behavior
            return super().get_object()

class TakeAssessmentView(APIView):
    """Submit assessment responses and get results"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TakeAssessmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        assessment_type_id = serializer.validated_data['assessment_type_id']
        responses_data = serializer.validated_data['responses']

        try:
            with transaction.atomic():
                assessment_type = AssessmentType.objects.get(id=assessment_type_id)
                print(f"Processing assessment submission for type: {assessment_type.name} (ID: {assessment_type.id})")

                # Calculate total score
                total_score = 0
                assessment_responses = []

                for response_data in responses_data:
                    print(f"Processing response: {response_data}")
                    question = AssessmentQuestion.objects.get(
                        id=response_data['question_id'],
                        assessment_type=assessment_type
                    )
                    print(f"Found question: {question.question_text} (ID: {question.id})")

                    selected_index = response_data['selected_option_index']

                    # Get score from question options
                    options = list(question.options.all().order_by('order'))
                    print(f"Question has {len(options)} options, selected index: {selected_index}")
                    if selected_index < len(options):
                        score = options[selected_index].score
                        print(f"Selected option: '{options[selected_index].text}' with score: {score}")
                        if question.is_reverse_scored:
                            # Reverse scoring logic
                            max_score = max([opt.score for opt in options])
                            score = max_score - score
                            print(f"Reverse scored: {score}")
                    else:
                        print(f"ERROR: Invalid option index {selected_index} for question with {len(options)} options")
                        return Response(
                            {"error": f"Invalid option index {selected_index} for question. Available options: {len(options)}."},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    total_score += score
                    print(f"Running total score: {total_score}")
                    assessment_responses.append({
                        'question': question,
                        'selected_option_index': selected_index,
                        'score': score
                    })

                # Determine risk level based on assessment type and score
                if assessment_type.max_score > 0:
                    risk_level = self._calculate_risk_level(assessment_type, total_score)
                else:
                    risk_level = 'minimal'  # Default if max_score is 0

                # Get interpretation and recommendations
                interpretation = self._get_interpretation(assessment_type, risk_level, total_score)
                recommendations = self._get_recommendations(assessment_type, risk_level)

                # Create assessment record
                assessment = Assessment.objects.create(
                    user=request.user,
                    assessment_type=assessment_type,
                    total_score=total_score,
                    risk_level=risk_level,
                    interpretation=interpretation,
                    recommendations=recommendations
                )

                # Create response records
                print(f"Creating {len(assessment_responses)} response records...")
                for response_data in assessment_responses:
                    # Get the selected option object
                    question = response_data['question']
                    selected_index = response_data['selected_option_index']
                    options = list(question.options.all().order_by('order'))
                    selected_option = options[selected_index] if selected_index < len(options) else None
                    
                    print(f"Creating response for question {question.id}: option {selected_option.text if selected_option else 'None'}, score {response_data['score']}")
                    
                    AssessmentResponse.objects.create(
                        assessment=assessment,
                        question=question,
                        selected_option_id=selected_option,
                        response_value=response_data['score']
                    )

                # Return assessment results
                print(f"Assessment completed successfully! Final score: {total_score}, Risk level: {risk_level}")
                
                # Create a simple response without the complex serializer to avoid field issues
                response_data = {
                    'id': assessment.id,
                    'assessment_type': {
                        'id': assessment_type.id,
                        'name': assessment_type.name,
                        'display_name': assessment_type.display_name
                    },
                    'total_score': total_score,
                    'risk_level': risk_level,
                    'interpretation': interpretation,
                    'recommendations': recommendations,
                    'completed_at': assessment.completed_at.isoformat(),
                    'percentage_score': round((total_score / assessment_type.max_score) * 100, 1)
                }
                
                return Response(response_data, status=status.HTTP_201_CREATED)

        except AssessmentQuestion.DoesNotExist as e:
            print(f"Question not found error: {e}")
            return Response(
                {"error": "Invalid question ID or question does not belong to this assessment type."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Unexpected error in assessment submission: {e}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"An error occurred while processing the assessment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _calculate_risk_level(self, assessment_type, total_score):
        """Calculate risk level based on assessment type and score"""
        if assessment_type.max_score == 0:
            return 'minimal'
        percentage = (total_score / assessment_type.max_score) * 100

        if assessment_type.name == 'PHQ9':
            if percentage <= 20:  # 0-4
                return 'minimal'
            elif percentage <= 40:  # 5-9
                return 'mild'
            elif percentage <= 60:  # 10-14
                return 'moderate'
            elif percentage <= 80:  # 15-19
                return 'moderately_severe'
            else:  # 20-27
                return 'severe'

        elif assessment_type.name == 'GAD7':
            if percentage <= 25:  # 0-4
                return 'minimal'
            elif percentage <= 50:  # 5-9
                return 'mild'
            elif percentage <= 75:  # 10-14
                return 'moderate'
            else:  # 15-21
                return 'severe'

        elif assessment_type.name == 'PCL5':
            if percentage < 50:  # < 33
                return 'minimal'
            elif percentage < 65:  # 33-43
                return 'mild'
            elif percentage < 80:  # 44-52
                return 'moderate'
            else:  # 53+
                return 'severe'

        # Default categorization
        if percentage <= 25:
            return 'minimal'
        elif percentage <= 50:
            return 'mild'
        elif percentage <= 75:
            return 'moderate'
        else:
            return 'severe'

    def _get_interpretation(self, assessment_type, risk_level, total_score):
        """Get interpretation text based on results"""
        interpretations = {
            'PHQ9': {
                'minimal': 'Your responses suggest minimal depression symptoms. This is a positive sign for your mental health.',
                'mild': 'Your responses suggest mild depression symptoms. Consider speaking with a mental health professional.',
                'moderate': 'Your responses suggest moderate depression symptoms. We recommend seeking professional support.',
                'moderately_severe': 'Your responses suggest moderately severe depression symptoms. Professional help is strongly recommended.',
                'severe': 'Your responses suggest severe depression symptoms. Please seek immediate professional help.'
            },
            'GAD7': {
                'minimal': 'Your responses suggest minimal anxiety symptoms.',
                'mild': 'Your responses suggest mild anxiety symptoms. Consider stress management techniques.',
                'moderate': 'Your responses suggest moderate anxiety symptoms. Professional support may be helpful.',
                'severe': 'Your responses suggest severe anxiety symptoms. Please consider seeking professional help.'
            },
            'PCL5': {
                'minimal': 'Your responses suggest minimal PTSD symptoms.',
                'mild': 'Your responses suggest some trauma-related symptoms. Consider speaking with a professional.',
                'moderate': 'Your responses suggest moderate PTSD symptoms. Professional evaluation is recommended.',
                'severe': 'Your responses suggest significant PTSD symptoms. Please seek professional help.'
            }
        }

        return interpretations.get(assessment_type.name, {}).get(
            risk_level,
            f'Your total score is {total_score}. Please consult with a mental health professional for proper evaluation.'
        )

    def _get_recommendations(self, assessment_type, risk_level):
        """Get recommendations based on results"""
        try:
            recommendations = AssessmentRecommendation.objects.filter(
                assessment_type=assessment_type,
                risk_level=risk_level
            ).order_by('priority')

            return [
                {
                    'title': rec.title,
                    'description': rec.description,
                    'action_items': rec.action_items,
                    'resources': rec.resources
                }
                for rec in recommendations
            ]
        except:
            return []

class UserAssessmentHistoryView(generics.ListAPIView):
    """Get user's assessment history"""
    serializer_class = AssessmentHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Assessment.objects.filter(user=self.request.user).order_by('-completed_at')

class AssessmentResultView(generics.RetrieveAPIView):
    """Get detailed assessment result"""
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Assessment.objects.filter(user=self.request.user)

class AssessmentRecommendationsView(generics.ListAPIView):
    """Get recommendations for specific assessment type and risk level"""
    serializer_class = AssessmentRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        assessment_type = self.request.query_params.get('assessment_type')
        risk_level = self.request.query_params.get('risk_level')

        queryset = AssessmentRecommendation.objects.all()

        if assessment_type:
            queryset = queryset.filter(assessment_type__name=assessment_type)
        if risk_level:
            queryset = queryset.filter(risk_level=risk_level)

        return queryset.order_by('priority')

# ROLE-BASED VIEWS FOR GUIDES AND ADMINS

class GuideAssessmentRequestView(generics.ListCreateAPIView):
    """Guide can view their requests and create new ones"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateAssessmentRequestSerializer
        return AssessmentRequestSerializer
    
    def get_queryset(self):
        if not (self.request.user.role == 'guide' or self.request.user.role == 'admin'):
            return AssessmentRequest.objects.none()
        
        if self.request.user.role == 'guide':
            return AssessmentRequest.objects.filter(requester=self.request.user)
        else:  # admin can see all requests
            return AssessmentRequest.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'guide':
            raise permissions.PermissionDenied("Only guides can create assessment requests")
        serializer.save(requester=self.request.user)

class AdminAssessmentRequestView(generics.ListAPIView):
    """Admin view to see all assessment requests"""
    serializer_class = AssessmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        
        status_filter = self.request.query_params.get('status', None)
        queryset = AssessmentRequest.objects.all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

class AdminReviewRequestView(APIView):
    """Admin can approve/reject assessment requests"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, request_id):
        if request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        
        try:
            assessment_request = AssessmentRequest.objects.get(id=request_id)
        except AssessmentRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)
        
        action = request.data.get('action')
        admin_notes = request.data.get('admin_notes', '')
        
        if action == 'approve':
            assessment_request.status = 'approved'
        elif action == 'reject':
            assessment_request.status = 'rejected'
        elif action == 'request_changes':
            assessment_request.status = 'pending'
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
        assessment_request.admin_notes = admin_notes
        assessment_request.reviewed_by = request.user
        assessment_request.reviewed_at = timezone.now()
        assessment_request.save()
        
        return Response({
            "message": f"Request {action}d successfully",
            "status": assessment_request.status
        })

class GuideClientAssignmentView(generics.ListCreateAPIView):
    """Guide can assign assessments to their clients"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateAssignmentSerializer
        return ClientAssessmentAssignmentSerializer
    
    def get_queryset(self):
        if self.request.user.role != 'guide':
            return ClientAssessmentAssignment.objects.none()
        
        return ClientAssessmentAssignment.objects.filter(guide=self.request.user)
    
    def perform_create(self, serializer):
        if self.request.user.role != 'guide':
            raise permissions.PermissionDenied("Only guides can assign assessments")
        serializer.save(guide=self.request.user)

class AdminAssessmentTypeManagementView(generics.ListCreateAPIView):
    """Admin can create new assessment types"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateAssessmentTypeSerializer
        return AssessmentTypeSerializer
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return AssessmentType.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        serializer.save()
    
    def create(self, request, *args, **kwargs):
        """Create a new assessment type with enhanced error handling"""
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': f'Failed to create assessment type: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

class AdminAssessmentTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can update/delete assessment types"""
    serializer_class = AssessmentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return AssessmentType.objects.all()
    
    def update(self, request, *args, **kwargs):
        """Update assessment type with enhanced error handling"""
        try:
            # Use partial=True for PATCH requests to allow partial updates
            kwargs['partial'] = True
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': f'Failed to update assessment type: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete assessment type with safety checks"""
        try:
            instance = self.get_object()
            
            # Check if assessment has been taken by users
            assessment_count = Assessment.objects.filter(assessment_type=instance).count()
            if assessment_count > 0:
                return Response(
                    {'error': f'Cannot delete assessment type. {assessment_count} assessments have been taken using this type.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if it's a standard assessment
            if instance.is_standard:
                return Response(
                    {'error': 'Cannot delete standard assessment types (PHQ9, GAD7, PCL5)'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': f'Failed to delete assessment type: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

class GuideAssessmentStatsView(APIView):
    """Guide dashboard statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'guide':
            raise permissions.PermissionDenied("Guide access required")
        
        # Get guide's statistics
        assigned_assessments = ClientAssessmentAssignment.objects.filter(guide=request.user)
        pending_assignments = assigned_assessments.filter(is_completed=False)
        completed_assignments = assigned_assessments.filter(is_completed=True)
        
        pending_requests = AssessmentRequest.objects.filter(
            requester=request.user, 
            status='pending'
        ).count()
        
        stats = {
            'total_assignments': assigned_assessments.count(),
            'pending_assignments': pending_assignments.count(),
            'completed_assignments': completed_assignments.count(),
            'pending_requests': pending_requests,
            'recent_assignments': ClientAssessmentAssignmentSerializer(
                assigned_assessments.order_by('-assigned_date')[:5], 
                many=True
            ).data
        }
        
        return Response(stats)

class AdminDashboardStatsView(APIView):
    """Admin dashboard statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        
        # Get admin statistics
        total_requests = AssessmentRequest.objects.count()
        pending_requests = AssessmentRequest.objects.filter(status='pending').count()
        approved_requests = AssessmentRequest.objects.filter(status='approved').count()
        rejected_requests = AssessmentRequest.objects.filter(status='rejected').count()
        
        total_assessments = Assessment.objects.count()
        total_assignments = ClientAssessmentAssignment.objects.count()
        
        stats = {
            'total_requests': total_requests,
            'pending_requests': pending_requests,
            'approved_requests': approved_requests,
            'rejected_requests': rejected_requests,
            'total_assessments': total_assessments,
            'total_assignments': total_assignments,
            'recent_requests': AssessmentRequestSerializer(
                AssessmentRequest.objects.order_by('-created_at')[:5],
                many=True
            ).data
        }
        
        return Response(stats)


class AdminAssessmentStatsView(APIView):
    """
    Admin dashboard assessment statistics endpoint
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is admin
        if not request.user.is_staff and request.user.role != 'admin':
            return Response({
                'error': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Total assessments taken
        total_assessments = Assessment.objects.count()
        
        # Assessments this month
        first_day_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        assessments_this_month = Assessment.objects.filter(completed_at__gte=first_day_of_month).count()
        
        # Assessment completion rate
        total_requests = AssessmentRequest.objects.count()
        completion_rate = (total_assessments / total_requests * 100) if total_requests > 0 else 0
        
        # Popular assessment types
        popular_assessments = AssessmentType.objects.annotate(
            usage_count=Count('assessment')
        ).order_by('-usage_count')[:5]
        
        # Average scores by assessment type
        assessment_scores = []
        for assessment_type in AssessmentType.objects.all():
            avg_score = Assessment.objects.filter(
                assessment_type=assessment_type
            ).aggregate(avg_score=Avg('total_score'))['avg_score']
            
            if avg_score is not None:
                assessment_scores.append({
                    'type': assessment_type.name,
                    'average_score': round(avg_score, 2)
                })
        
        return Response({
            'total_assessments': total_assessments,
            'assessments_this_month': assessments_this_month,
            'completion_rate': round(completion_rate, 2),
            'popular_assessments': [
                {
                    'name': assessment.name,
                    'count': assessment.usage_count
                } for assessment in popular_assessments
            ],
            'assessment_scores': assessment_scores,
            'assessment_growth': {
                'current_month': assessments_this_month,
                'previous_month': Assessment.objects.filter(
                    completed_at__gte=first_day_of_month - timedelta(days=30),
                    completed_at__lt=first_day_of_month
                ).count()
            }
        }, status=status.HTTP_200_OK)


# Test endpoint for debugging authentication
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def test_auth(request):
    """Test endpoint to check authentication"""
    return Response({
        'message': 'Authentication working',
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'role': getattr(request.user, 'role', 'unknown'),
            'is_authenticated': request.user.is_authenticated,
        }
    })
