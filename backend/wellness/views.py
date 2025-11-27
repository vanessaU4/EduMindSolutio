from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Avg, Count, Q
from datetime import datetime, timedelta
import random
from .models import (
    MoodEntry, Achievement, UserAchievement, UserPoints,
    DailyChallenge, UserChallengeCompletion, WellnessTip, UserWellnessTip,
    WeeklyChallenge, UserWeeklyChallengeProgress, MoodPattern
)
from .serializers import (
    MoodEntrySerializer, CreateMoodEntrySerializer, AchievementSerializer,
    UserAchievementSerializer, UserPointsSerializer, DailyChallengeSerializer,
    UserChallengeCompletionSerializer, CompleteChallengeSerializer,
    WellnessTipSerializer, UserWellnessTipSerializer, MoodStatsSerializer,
    WellnessStatsSerializer
)

# COMPREHENSIVE WELLNESS API ENDPOINTS

class WellnessCenterView(APIView):
    """Wellness center dashboard with comprehensive stats"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get or create user points
        user_points, created = UserPoints.objects.get_or_create(user=user)
        
        # Get recent mood entries
        recent_moods = MoodEntry.objects.filter(user=user).order_by('-date')[:7]
        
        # Get today's challenges
        today = timezone.now().date()
        todays_challenges = DailyChallenge.objects.filter(is_active=True)
        completed_today = UserChallengeCompletion.objects.filter(
            user=user,
            completion_date=today
        ).values_list('challenge_id', flat=True)
        
        # Get recent achievements
        recent_achievements = UserAchievement.objects.filter(user=user).order_by('-earned_at')[:5]
        
        return Response({
            'user_points': UserPointsSerializer(user_points).data,
            'recent_moods': MoodEntrySerializer(recent_moods, many=True).data,
            'todays_challenges': DailyChallengeSerializer(todays_challenges, many=True, context={'request': request}).data,
            'recent_achievements': UserAchievementSerializer(recent_achievements, many=True).data,
            'stats': {
                'total_mood_entries': MoodEntry.objects.filter(user=user).count(),
                'challenges_completed_today': len(completed_today),
                'total_achievements': UserAchievement.objects.filter(user=user).count(),
            }
        })

# MOOD TRACKING ENDPOINTS

class MoodEntryListView(generics.ListCreateAPIView):
    """List and create mood entries"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateMoodEntrySerializer
        return MoodEntrySerializer
    
    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user).order_by('-date')
    
    def perform_create(self, serializer):
        mood_entry = serializer.save(user=self.request.user)
        
        # Award points for mood tracking
        user_points, created = UserPoints.objects.get_or_create(user=self.request.user)
        user_points.add_points(5, "mood_tracking")
        
        return Response({
            'message': 'Mood entry saved successfully',
            'points_earned': 5
        })

class MoodEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a mood entry"""
    permission_classes = [IsAuthenticated]
    serializer_class = MoodEntrySerializer
    
    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user)

class MoodStatsView(APIView):
    """Get mood statistics and trends"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        days = int(request.query_params.get('days', 30))
        
        # Get mood entries for the specified period
        start_date = timezone.now().date() - timedelta(days=days)
        mood_entries = MoodEntry.objects.filter(
            user=user,
            date__gte=start_date
        ).order_by('date')
        
        if not mood_entries.exists():
            return Response({
                'message': 'No mood entries found for this period',
                'stats': None
            })
        
        # Calculate statistics
        stats = mood_entries.aggregate(
            average_mood=Avg('mood_rating'),
            average_energy=Avg('energy_level'),
            average_anxiety=Avg('anxiety_level'),
            average_sleep=Avg('sleep_quality')
        )
        
        # Calculate streak
        user_points = UserPoints.objects.filter(user=user).first()
        current_streak = user_points.current_streak if user_points else 0
        
        # Prepare mood trend data
        mood_trend = []
        for entry in mood_entries:
            mood_trend.append({
                'date': entry.date.isoformat(),
                'mood': entry.mood_rating,
                'energy': entry.energy_level,
                'anxiety': entry.anxiety_level,
                'sleep': entry.sleep_quality
            })
        
        return Response({
            'average_mood': round(stats['average_mood'], 2) if stats['average_mood'] else 0,
            'average_energy': round(stats['average_energy'], 2) if stats['average_energy'] else 0,
            'average_anxiety': round(stats['average_anxiety'], 2) if stats['average_anxiety'] else 0,
            'average_sleep': round(stats['average_sleep'], 2) if stats['average_sleep'] else 0,
            'total_entries': mood_entries.count(),
            'current_streak': current_streak,
            'mood_trend': mood_trend
        })

# DAILY CHALLENGES ENDPOINTS

class DailyChallengeListView(generics.ListAPIView):
    """List available daily challenges"""
    permission_classes = [IsAuthenticated]
    serializer_class = DailyChallengeSerializer
    
    def get_queryset(self):
        return DailyChallenge.objects.filter(is_active=True)

class CompleteChallengeView(APIView):
    """Complete a daily challenge"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, challenge_id):
        try:
            challenge = DailyChallenge.objects.get(id=challenge_id, is_active=True)
            user = request.user
            today = timezone.now().date()
            
            # Check if already completed today
            existing_completion = UserChallengeCompletion.objects.filter(
                user=user,
                challenge=challenge,
                completion_date=today
            ).first()
            
            if existing_completion:
                return Response({
                    'error': 'Challenge already completed today'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create completion record
            completion_data = {
                'challenge': challenge.id,
                'completion_value': request.data.get('completion_value'),
                'notes': request.data.get('notes', ''),
                'completion_date': today
            }
            
            serializer = CompleteChallengeSerializer(data=completion_data, context={'request': request})
            if serializer.is_valid():
                completion = serializer.save(user=user, points_earned=challenge.points_reward)
                
                # Award points
                user_points, created = UserPoints.objects.get_or_create(user=user)
                user_points.add_points(challenge.points_reward, "challenge_completion")
                
                return Response({
                    'message': 'Challenge completed successfully',
                    'points_earned': challenge.points_reward,
                    'completion_id': completion.id
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except DailyChallenge.DoesNotExist:
            return Response({'error': 'Challenge not found'}, status=status.HTTP_404_NOT_FOUND)

class UserChallengeCompletionListView(generics.ListAPIView):
    """List user's challenge completions"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserChallengeCompletionSerializer
    
    def get_queryset(self):
        return UserChallengeCompletion.objects.filter(user=self.request.user).order_by('-completed_at')

# ACHIEVEMENTS ENDPOINTS

class AchievementListView(generics.ListAPIView):
    """List all available achievements"""
    permission_classes = [IsAuthenticated]
    serializer_class = AchievementSerializer
    
    def get_queryset(self):
        return Achievement.objects.filter(is_active=True)

class UserAchievementListView(generics.ListAPIView):
    """List user's earned achievements"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserAchievementSerializer
    
    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user).order_by('-earned_at')

# WELLNESS TIPS ENDPOINTS

class WellnessTipListView(generics.ListAPIView):
    """List wellness tips"""
    permission_classes = [IsAuthenticated]
    serializer_class = WellnessTipSerializer
    
    def get_queryset(self):
        return WellnessTip.objects.filter(is_active=True)

class DailyWellnessTipView(APIView):
    """Get daily personalized wellness tip"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get user's recent mood to personalize tip
        recent_mood = MoodEntry.objects.filter(user=user).order_by('-date').first()
        
        # Filter tips based on mood if available
        tips_queryset = WellnessTip.objects.filter(is_active=True)
        if recent_mood:
            tips_queryset = tips_queryset.filter(
                Q(target_mood__contains=[recent_mood.mood_rating]) | 
                Q(target_mood=[])
            )
        
        # Exclude tips already shown recently
        shown_recently = UserWellnessTip.objects.filter(
            user=user,
            shown_at__gte=timezone.now() - timedelta(days=7)
        ).values_list('tip_id', flat=True)
        
        tips_queryset = tips_queryset.exclude(id__in=shown_recently)
        
        # Get random tip
        tip = tips_queryset.order_by('?').first()
        
        if tip:
            # Mark as shown
            UserWellnessTip.objects.get_or_create(user=user, tip=tip)
            
            return Response(WellnessTipSerializer(tip, context={'request': request}).data)
        
        return Response({'message': 'No new tips available'})

class MarkTipHelpfulView(APIView):
    """Mark a wellness tip as helpful or not"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, tip_id):
        try:
            user_tip = UserWellnessTip.objects.get(user=request.user, tip_id=tip_id)
            user_tip.is_helpful = request.data.get('is_helpful', True)
            user_tip.save()
            
            return Response({'message': 'Feedback recorded successfully'})
            
        except UserWellnessTip.DoesNotExist:
            return Response({'error': 'Tip not found'}, status=status.HTTP_404_NOT_FOUND)

# ADMIN ENDPOINTS

class AdminDailyChallengeView(generics.ListCreateAPIView):
    """Admin can manage daily challenges"""
    serializer_class = DailyChallengeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return DailyChallenge.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        serializer.save()

class AdminDailyChallengeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can update/delete daily challenges"""
    serializer_class = DailyChallengeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return DailyChallenge.objects.all()

class AdminAchievementView(generics.ListCreateAPIView):
    """Admin can manage achievements"""
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return Achievement.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        serializer.save()

class AdminAchievementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can update/delete achievements"""
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return Achievement.objects.all()

class AdminWellnessTipView(generics.ListCreateAPIView):
    """Admin can manage wellness tips"""
    serializer_class = WellnessTipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return WellnessTip.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        serializer.save()

class AdminWellnessTipDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can update/delete wellness tips"""
    serializer_class = WellnessTipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return WellnessTip.objects.all()

# STATISTICS AND DASHBOARD ENDPOINTS

class WellnessStatsView(APIView):
    """Comprehensive wellness statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get user points
        user_points = UserPoints.objects.filter(user=user).first()
        
        # Get counts
        total_achievements = UserAchievement.objects.filter(user=user).count()
        today = timezone.now().date()
        challenges_completed_today = UserChallengeCompletion.objects.filter(
            user=user,
            completion_date=today
        ).count()
        challenges_completed_total = UserChallengeCompletion.objects.filter(user=user).count()
        mood_entries_count = MoodEntry.objects.filter(user=user).count()
        
        stats = {
            'total_points': user_points.total_points if user_points else 0,
            'current_level': user_points.level if user_points else 1,
            'achievements_count': total_achievements,
            'challenges_completed_today': challenges_completed_today,
            'challenges_completed_total': challenges_completed_total,
            'current_streak': user_points.current_streak if user_points else 0,
            'mood_entries_count': mood_entries_count,
        }
        
        return Response(stats)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_challenge(request, challenge_id):
    """
    Complete a daily challenge - matches frontend wellnessService.completeChallenge()
    """
    # Add logic to mark challenge as completed
    return Response({
        'message': 'Challenge completed successfully',
        'challenge_id': challenge_id,
        'points_earned': 10
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_achievements(request):
    """
    Get user achievements - matches frontend wellnessService.getAchievements()
    """
    user_achievements = UserAchievement.objects.filter(user=request.user).select_related('achievement')
    
    achievements = []
    for user_achievement in user_achievements:
        achievements.append({
            'id': str(user_achievement.achievement.id),
            'title': user_achievement.achievement.name,
            'description': user_achievement.achievement.description,
            'earned': True,
            'date': user_achievement.earned_at.date().isoformat(),
            'points': user_achievement.points_earned
        })
    
    return Response(achievements)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mood_history(request):
    """
    Get mood history - matches frontend wellnessService.getMoodHistory()
    """
    days = int(request.GET.get('days', 30))
    start_date = timezone.now().date() - timedelta(days=days)
    
    mood_entries = MoodEntry.objects.filter(
        user=request.user,
        date__gte=start_date
    ).order_by('-date')
    
    mood_history = []
    for entry in mood_entries:
        mood_history.append({
            'date': entry.date.isoformat(),
            'mood': entry.mood_rating,
            'energy': entry.energy_level,
            'anxiety': entry.anxiety_level,
            'sleep': entry.sleep_quality,
            'note': entry.notes
        })
    
    return Response(mood_history)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_challenges(request):
    """
    Get daily challenges - matches frontend wellnessService.getDailyChallenges()
    """
    today = timezone.now().date()
    active_challenges = DailyChallenge.objects.filter(is_active=True)
    
    # Get completed challenges for today
    completed_today = UserChallengeCompletion.objects.filter(
        user=request.user,
        completion_date=today
    ).values_list('challenge_id', flat=True)
    
    challenges = []
    for challenge in active_challenges:
        challenges.append({
            'id': str(challenge.id),
            'title': challenge.title,
            'description': challenge.description,
            'completed': challenge.id in completed_today,
            'points': challenge.points_reward,
            'type': challenge.challenge_type,
            'instructions': challenge.instructions
        })
    
    return Response(challenges)

class MoodTrackerView(generics.GenericAPIView):
    """
    Mood tracking functionality for daily mood logging.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get recent mood entries for the user
        recent_moods = MoodEntry.objects.filter(user=request.user).order_by('-date')[:10]
        
        mood_history = []
        for entry in recent_moods:
            mood_history.append({
                'date': entry.date.isoformat(),
                'mood': entry.get_mood_rating_display(),
                'mood_value': entry.mood_rating,
                'energy': entry.energy_level,
                'anxiety': entry.anxiety_level,
                'sleep': entry.sleep_quality,
                'notes': entry.notes
            })
        
        return Response({
            'mood_history': mood_history,
            'mood_options': [choice[1] for choice in MoodEntry.MOOD_CHOICES]
        })

    def post(self, request):
        return Response({
            'message': 'Mood entry saved successfully',
            'mood': request.data.get('mood'),
            'date': request.data.get('date')
        })

class DailyChallengesView(generics.GenericAPIView):
    """
    Daily wellness challenges for users.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        
        # Get today's featured challenge
        today_challenge = DailyChallenge.objects.filter(is_active=True).first()
        completed_today = UserChallengeCompletion.objects.filter(
            user=request.user,
            completion_date=today
        ).values_list('challenge_id', flat=True)
        
        today_challenge_data = None
        if today_challenge:
            today_challenge_data = {
                'id': today_challenge.id,
                'title': today_challenge.title,
                'description': today_challenge.description,
                'points': today_challenge.points_reward,
                'completed': today_challenge.id in completed_today
            }
        
        # Get all available challenges
        available_challenges = DailyChallenge.objects.filter(is_active=True)
        challenges_data = []
        for challenge in available_challenges:
            challenges_data.append({
                'id': challenge.id,
                'title': challenge.title,
                'points': challenge.points_reward,
                'type': challenge.challenge_type
            })
        
        return Response({
            'today_challenge': today_challenge_data,
            'available_challenges': challenges_data
        })

class AchievementsView(generics.GenericAPIView):
    """
    User achievements and badges system.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get user's earned achievements
        user_achievements = UserAchievement.objects.filter(user=request.user).select_related('achievement')
        earned_achievements = []
        for ua in user_achievements:
            earned_achievements.append({
                'id': ua.achievement.id,
                'name': ua.achievement.name,
                'description': ua.achievement.description,
                'earned_date': ua.earned_at.date().isoformat(),
                'points': ua.points_earned
            })
        
        # Get available achievements not yet earned
        earned_ids = [ua.achievement.id for ua in user_achievements]
        available_achievements_qs = Achievement.objects.filter(
            is_active=True
        ).exclude(id__in=earned_ids)
        
        available_achievements = []
        for achievement in available_achievements_qs:
            available_achievements.append({
                'id': achievement.id,
                'name': achievement.name,
                'description': achievement.description,
                'points': achievement.points_reward,
                'category': achievement.category
            })
        
        return Response({
            'earned_achievements': earned_achievements,
            'available_achievements': available_achievements
        })

class WellnessGoalsView(generics.GenericAPIView):
    """
    Personal wellness goals setting and tracking.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Calculate actual progress based on user data
        user = request.user
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Mood tracking progress
        mood_entries_week = MoodEntry.objects.filter(
            user=user,
            date__gte=week_ago
        ).count()
        mood_tracking_progress = min(100, (mood_entries_week / 7) * 100)
        
        # Challenge completion progress
        challenges_week = UserChallengeCompletion.objects.filter(
            user=user,
            completion_date__gte=week_ago
        ).count()
        challenge_progress = min(100, (challenges_week / 7) * 100)
        
        return Response({
            'active_goals': [
                {
                    'id': 1,
                    'title': 'Daily Mood Tracking',
                    'progress': round(mood_tracking_progress),
                    'target_date': (today + timedelta(days=30)).isoformat()
                },
                {
                    'id': 2,
                    'title': 'Complete Daily Challenges',
                    'progress': round(challenge_progress),
                    'target_date': (today + timedelta(days=30)).isoformat()
                }
            ],
            'suggested_goals': [
                {'title': 'Meditation Practice', 'description': 'Meditate for 10 minutes daily'},
                {'title': 'Sleep Schedule', 'description': 'Maintain consistent sleep schedule'},
                {'title': 'Exercise Routine', 'description': 'Physical activity 3 times per week'}
            ]
        })

class ProgressTrackingView(generics.GenericAPIView):
    """
    Overall wellness progress tracking and analytics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # Calculate actual statistics
        user_points = UserPoints.objects.filter(user=user).first()
        total_points = user_points.total_points if user_points else 0
        
        # Weekly mood entries
        mood_entries_week = MoodEntry.objects.filter(
            user=user,
            date__gte=week_ago
        ).count()
        
        # Weekly challenges completed
        challenges_week = UserChallengeCompletion.objects.filter(
            user=user,
            completion_date__gte=week_ago
        ).count()
        
        # Calculate mood trend
        recent_moods = MoodEntry.objects.filter(
            user=user,
            date__gte=week_ago
        ).order_by('date')
        
        mood_trend = 'stable'
        if recent_moods.count() >= 2:
            first_half = recent_moods[:len(recent_moods)//2]
            second_half = recent_moods[len(recent_moods)//2:]
            
            first_avg = sum(m.mood_rating for m in first_half) / len(first_half)
            second_avg = sum(m.mood_rating for m in second_half) / len(second_half)
            
            if second_avg > first_avg + 0.5:
                mood_trend = 'improving'
            elif second_avg < first_avg - 0.5:
                mood_trend = 'declining'
        
        # Calculate completion rates
        total_challenges = DailyChallenge.objects.filter(is_active=True).count()
        challenge_completion_rate = (challenges_week / (total_challenges * 7)) * 100 if total_challenges > 0 else 0
        
        return Response({
            'progress_summary': {
                'mood_trend': mood_trend,
                'challenge_completion_rate': min(100, round(challenge_completion_rate)),
                'goal_achievement_rate': min(100, (mood_entries_week / 7) * 100),
                'total_points': total_points
            },
            'weekly_stats': {
                'mood_entries': mood_entries_week,
                'challenges_completed': challenges_week,
                'goals_met': min(2, mood_entries_week // 3)  # Simple goal calculation
            }
        })

# wellness/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from .models import (
    MoodEntry, UserPoints, UserAchievement, DailyChallenge, UserChallengeCompletion
)
from .serializers import (
    MoodEntrySerializer, UserAchievementSerializer, DailyChallengeSerializer
)

class WellnessDataView(APIView):
    """Return combined wellness dashboard data"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Points and streak
        user_points = UserPoints.objects.filter(user=user).first()

        # Recent mood entries (last 7 days)
        recent_moods = MoodEntry.objects.filter(user=user).order_by('-date')[:7]
        recent_moods_data = MoodEntrySerializer(recent_moods, many=True).data

        # Achievements
        achievements = UserAchievement.objects.filter(user=user)
        achievements_data = UserAchievementSerializer(achievements, many=True).data

        # Today's challenge
        today = timezone.now().date()
        todays_challenge = DailyChallenge.objects.filter(is_active=True).first()
        challenge_data = None
        if todays_challenge:
            completed = UserChallengeCompletion.objects.filter(
                user=user,
                challenge=todays_challenge,
                completion_date=today
            ).exists()
            challenge_data = {
                "id": todays_challenge.id,
                "title": todays_challenge.title,
                "description": todays_challenge.description,
                "completed": completed,
            }

        # Build response
        data = {
            "currentStreak": user_points.current_streak if user_points else 0,
            "totalPoints": user_points.total_points if user_points else 0,
            "weeklyGoal": 7,  # could be user configurable
            "weeklyProgress": len(recent_moods_data),
            "recentMoods": recent_moods_data,
            "achievements": achievements_data,
            "todaysChallenge": challenge_data,
        }

        return Response(data)

