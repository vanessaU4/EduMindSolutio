"""
Enhanced Wellness Views with Full CRUD Operations and AI Integration
"""
from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Avg, Count, Q, Sum
from datetime import datetime, timedelta
import json

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
    WellnessStatsSerializer, WeeklyChallengeSerializer, 
    UserWeeklyChallengeProgressSerializer, MoodPatternSerializer, AIInsightSerializer
)
from .ai_wellness_service import AIWellnessService

# MOOD TRACKING VIEWS
class MoodEntryViewSet(viewsets.ModelViewSet):
    """Complete CRUD operations for mood entries"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user).order_by('-date')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateMoodEntrySerializer
        return MoodEntrySerializer
    
    def perform_create(self, serializer):
        mood_entry = serializer.save(user=self.request.user)
        
        # Award points for mood tracking
        user_points, created = UserPoints.objects.get_or_create(user=self.request.user)
        user_points.add_points(5, "mood_tracking")
        
        # Check for achievements
        self.check_mood_achievements(self.request.user)
    
    def check_mood_achievements(self, user):
        """Check and award mood-related achievements"""
        mood_count = MoodEntry.objects.filter(user=user).count()
        
        # First mood entry achievement
        if mood_count == 1:
            self.award_achievement(user, "first_mood_entry")
        
        # Streak achievements
        consecutive_days = self.get_consecutive_mood_days(user)
        if consecutive_days >= 3:
            self.award_achievement(user, "3_day_streak")
        if consecutive_days >= 7:
            self.award_achievement(user, "7_day_streak")
        if consecutive_days >= 30:
            self.award_achievement(user, "30_day_streak")
    
    def get_consecutive_mood_days(self, user):
        """Calculate consecutive days of mood tracking"""
        today = timezone.now().date()
        consecutive_days = 0
        
        for i in range(365):  # Check up to a year
            check_date = today - timedelta(days=i)
            if MoodEntry.objects.filter(user=user, date=check_date).exists():
                consecutive_days += 1
            else:
                break
        
        return consecutive_days
    
    def award_achievement(self, user, achievement_name):
        """Award achievement if not already earned"""
        try:
            achievement = Achievement.objects.get(name=achievement_name)
            UserAchievement.objects.get_or_create(
                user=user,
                achievement=achievement,
                defaults={'points_earned': achievement.points_reward}
            )
        except Achievement.DoesNotExist:
            pass
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get mood statistics for the user"""
        user = request.user
        days = int(request.query_params.get('days', 30))
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        mood_entries = MoodEntry.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        )
        
        if not mood_entries.exists():
            return Response({
                'message': 'No mood entries found for the specified period'
            })
        
        stats = {
            'average_mood': mood_entries.aggregate(Avg('mood_rating'))['mood_rating__avg'],
            'average_energy': mood_entries.aggregate(Avg('energy_level'))['energy_level__avg'],
            'average_anxiety': mood_entries.aggregate(Avg('anxiety_level'))['anxiety_level__avg'],
            'average_sleep': mood_entries.aggregate(Avg('sleep_quality'))['sleep_quality__avg'],
            'total_entries': mood_entries.count(),
            'current_streak': self.get_consecutive_mood_days(user),
            'mood_trend': self.get_mood_trend(mood_entries)
        }
        
        serializer = MoodStatsSerializer(stats)
        return Response(serializer.data)
    
    def get_mood_trend(self, mood_entries):
        """Calculate weekly mood trends"""
        trends = []
        for entry in mood_entries.order_by('date'):
            trends.append({
                'date': entry.date.isoformat(),
                'mood': entry.mood_rating,
                'energy': entry.energy_level
            })
        return trends

# CHALLENGE VIEWS
class DailyChallengeViewSet(viewsets.ModelViewSet):
    """CRUD operations for daily challenges"""
    serializer_class = DailyChallengeSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Temporarily allow any authenticated user to create/update/delete challenges
            # TODO: Change back to IsAdminUser after fixing user permissions
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Anyone authenticated can view challenges
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        # Admins can see all challenges, users only see active ones
        if self.request.user.is_staff:
            return DailyChallenge.objects.all().order_by('-created_at')
        return DailyChallenge.objects.filter(is_active=True)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a daily challenge"""
        challenge = self.get_object()
        today = timezone.now().date()
        
        # Check if already completed today
        if UserChallengeCompletion.objects.filter(
            user=request.user,
            challenge=challenge,
            completion_date=today
        ).exists():
            return Response(
                {'error': 'Challenge already completed today'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CompleteChallengeSerializer(data=request.data)
        if serializer.is_valid():
            completion = serializer.save(
                user=request.user,
                challenge=challenge,
                points_earned=challenge.points_reward
            )
            
            # Award points
            user_points, created = UserPoints.objects.get_or_create(user=request.user)
            user_points.add_points(challenge.points_reward, "challenge_completion")
            
            # Check for challenge achievements
            self.check_challenge_achievements(request.user)
            
            return Response(
                UserChallengeCompletionSerializer(completion).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def check_challenge_achievements(self, user):
        """Check and award challenge-related achievements"""
        total_completions = UserChallengeCompletion.objects.filter(user=user).count()
        
        if total_completions == 1:
            self.award_achievement(user, "first_challenge")
        elif total_completions == 10:
            self.award_achievement(user, "10_challenges")
        elif total_completions == 50:
            self.award_achievement(user, "50_challenges")
    
    def award_achievement(self, user, achievement_name):
        """Award achievement if not already earned"""
        try:
            achievement = Achievement.objects.get(name=achievement_name)
            UserAchievement.objects.get_or_create(
                user=user,
                achievement=achievement,
                defaults={'points_earned': achievement.points_reward}
            )
        except Achievement.DoesNotExist:
            pass

class WeeklyChallengeViewSet(viewsets.ModelViewSet):
    """CRUD operations for weekly challenges"""
    serializer_class = WeeklyChallengeSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Temporarily allow any authenticated user to create/update/delete challenges
            # TODO: Change back to IsAdminUser after fixing user permissions
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Anyone authenticated can view challenges
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        # Admins can see all challenges, users only see active ones
        if self.request.user.is_staff:
            return WeeklyChallenge.objects.all().order_by('-start_date')
        return WeeklyChallenge.objects.filter(is_active=True).order_by('-start_date')
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll in a weekly challenge"""
        challenge = self.get_object()
        
        # Check if already enrolled
        if UserWeeklyChallengeProgress.objects.filter(
            user=request.user,
            challenge=challenge
        ).exists():
            return Response(
                {'error': 'Already enrolled in this challenge'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        progress = UserWeeklyChallengeProgress.objects.create(
            user=request.user,
            challenge=challenge
        )
        
        serializer = UserWeeklyChallengeProgressSerializer(progress)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def complete_day(self, request, pk=None):
        """Mark a day as completed for weekly challenge"""
        challenge = self.get_object()
        today = timezone.now().date()
        
        try:
            progress = UserWeeklyChallengeProgress.objects.get(
                user=request.user,
                challenge=challenge
            )
        except UserWeeklyChallengeProgress.DoesNotExist:
            return Response(
                {'error': 'Not enrolled in this challenge'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already completed today
        if today.isoformat() in progress.completion_dates:
            return Response(
                {'error': 'Already completed today'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add today to completion dates
        progress.completion_dates.append(today.isoformat())
        progress.days_completed += 1
        progress.total_points_earned += challenge.points_per_day
        
        # Check if challenge is completed
        if progress.days_completed >= challenge.target_days:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.total_points_earned += challenge.bonus_points
        
        progress.save()
        
        # Award points
        user_points, created = UserPoints.objects.get_or_create(user=request.user)
        points_to_add = challenge.points_per_day
        if progress.is_completed:
            points_to_add += challenge.bonus_points
        user_points.add_points(points_to_add, "weekly_challenge")
        
        serializer = UserWeeklyChallengeProgressSerializer(progress)
        return Response(serializer.data)

# AI WELLNESS VIEWS
class AIWellnessInsightsView(APIView):
    """AI-powered wellness insights and recommendations"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Generate AI insights
        mood_analysis = AIWellnessService.analyze_mood_patterns(user)
        wellness_score = AIWellnessService.calculate_wellness_score(user)
        recommendations = AIWellnessService.generate_mood_recommendations(user, mood_analysis)
        daily_affirmation = AIWellnessService.generate_daily_affirmation(user)
        suggested_challenges = AIWellnessService.suggest_challenges(user)
        
        insights = {
            'wellness_score': wellness_score,
            'mood_analysis': mood_analysis,
            'recommendations': recommendations,
            'daily_affirmation': daily_affirmation,
            'suggested_challenges': suggested_challenges
        }
        
        serializer = AIInsightSerializer(insights)
        return Response(serializer.data)

class MoodPatternViewSet(viewsets.ModelViewSet):
    """CRUD operations for mood patterns"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MoodPatternSerializer
    
    def get_queryset(self):
        return MoodPattern.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate_insights(self, request):
        """Generate new mood pattern insights using AI"""
        user = request.user
        days = int(request.data.get('days', 30))
        
        # Generate AI analysis
        mood_data = AIWellnessService.analyze_mood_patterns(user, days)
        
        if not mood_data:
            return Response(
                {'error': 'Not enough mood data to generate insights'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create mood pattern record
        pattern = MoodPattern.objects.create(
            user=user,
            pattern_type='ai_analysis',
            title=f"Mood Analysis for {days} Days",
            description="AI-generated mood pattern analysis",
            insights=mood_data,
            recommendations=AIWellnessService.generate_mood_recommendations(user, mood_data),
            confidence_score=0.85,  # Default confidence
            analysis_period_start=timezone.now().date() - timedelta(days=days),
            analysis_period_end=timezone.now().date()
        )
        
        serializer = MoodPatternSerializer(pattern)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# ACHIEVEMENT VIEWS
class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only view for available achievements"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AchievementSerializer
    queryset = Achievement.objects.filter(is_active=True)

class UserAchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only view for user's earned achievements"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserAchievementSerializer
    
    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user).order_by('-earned_at')

# WELLNESS TIPS VIEWS
class WellnessTipViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only view for wellness tips"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WellnessTipSerializer
    
    def get_queryset(self):
        return WellnessTip.objects.filter(is_active=True)
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """Mark a tip as helpful or not helpful"""
        tip = self.get_object()
        is_helpful = request.data.get('is_helpful', True)
        
        user_tip, created = UserWellnessTip.objects.get_or_create(
            user=request.user,
            tip=tip,
            defaults={'is_helpful': is_helpful}
        )
        
        if not created:
            user_tip.is_helpful = is_helpful
            user_tip.save()
        
        return Response({'status': 'success', 'is_helpful': is_helpful})

# DASHBOARD VIEWS
class WellnessDashboardView(APIView):
    """Comprehensive wellness dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get or create user points
        user_points, created = UserPoints.objects.get_or_create(user=user)
        
        # Get today's stats
        today = timezone.now().date()
        challenges_completed_today = UserChallengeCompletion.objects.filter(
            user=user,
            completion_date=today
        ).count()
        
        # Get total stats
        total_achievements = UserAchievement.objects.filter(user=user).count()
        total_challenges = UserChallengeCompletion.objects.filter(user=user).count()
        total_mood_entries = MoodEntry.objects.filter(user=user).count()
        
        # Get recent data
        recent_moods = MoodEntry.objects.filter(user=user).order_by('-date')[:7]
        recent_achievements = UserAchievement.objects.filter(user=user).order_by('-earned_at')[:5]
        active_challenges = DailyChallenge.objects.filter(is_active=True)[:5]
        
        # Get AI insights
        ai_insights = AIWellnessService.calculate_wellness_score(user)
        daily_affirmation = AIWellnessService.generate_daily_affirmation(user)
        
        dashboard_data = {
            'user_points': UserPointsSerializer(user_points).data,
            'stats': {
                'total_points': user_points.total_points,
                'current_level': user_points.level,
                'achievements_count': total_achievements,
                'challenges_completed_today': challenges_completed_today,
                'challenges_completed_total': total_challenges,
                'current_streak': user_points.current_streak,
                'mood_entries_count': total_mood_entries
            },
            'recent_moods': MoodEntrySerializer(recent_moods, many=True).data,
            'recent_achievements': UserAchievementSerializer(recent_achievements, many=True).data,
            'active_challenges': DailyChallengeSerializer(active_challenges, many=True, context={'request': request}).data,
            'ai_insights': ai_insights,
            'daily_affirmation': daily_affirmation
        }
        
        return Response(dashboard_data)

# USER PROGRESS VIEWS
class UserProgressView(APIView):
    """User progress tracking and analytics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        period = request.query_params.get('period', '30')  # days
        
        try:
            days = int(period)
        except ValueError:
            days = 30
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Mood progress
        mood_entries = MoodEntry.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        ).order_by('date')
        
        # Challenge progress
        challenge_completions = UserChallengeCompletion.objects.filter(
            user=user,
            completion_date__range=[start_date, end_date]
        ).order_by('completion_date')
        
        # Weekly challenge progress
        weekly_progress = UserWeeklyChallengeProgress.objects.filter(
            user=user,
            created_at__date__range=[start_date, end_date]
        )
        
        progress_data = {
            'period': {'start': start_date.isoformat(), 'end': end_date.isoformat()},
            'mood_entries': MoodEntrySerializer(mood_entries, many=True).data,
            'challenge_completions': UserChallengeCompletionSerializer(challenge_completions, many=True).data,
            'weekly_progress': UserWeeklyChallengeProgressSerializer(weekly_progress, many=True).data,
            'summary': {
                'mood_entries_count': mood_entries.count(),
                'challenges_completed': challenge_completions.count(),
                'weekly_challenges_active': weekly_progress.count(),
                'average_mood': mood_entries.aggregate(Avg('mood_rating'))['mood_rating__avg'] or 0
            }
        }
        
        return Response(progress_data)
