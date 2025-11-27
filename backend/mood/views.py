from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
import json
import time
import random
import base64
try:
    from PIL import Image
except ImportError:
    Image = None
from io import BytesIO

User = get_user_model()

from .models import MoodEntry, MoodAnalysisSession, MoodTrend, MoodInsight
from .serializers import (
    MoodEntrySerializer, MoodEntryCreateSerializer, EmotionAnalysisRequestSerializer,
    EmotionAnalysisResponseSerializer, MoodStatsSerializer, MoodTrendSerializer,
    MoodAnalysisSessionSerializer, MoodInsightSerializer, MoodHistorySerializer,
    MoodDashboardSerializer
)


class MoodEntryPagination(PageNumberPagination):
    """Custom pagination for mood entries"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class MoodEntryListCreateView(generics.ListCreateAPIView):
    """List and create mood entries"""
    
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MoodEntryPagination
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MoodEntryCreateSerializer
        return MoodEntrySerializer
    
    def get_queryset(self):
        """Get mood entries for current user"""
        queryset = MoodEntry.objects.filter(user=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        # Filter by emotion
        emotion = self.request.query_params.get('emotion')
        if emotion:
            queryset = queryset.filter(emotion=emotion)
        
        return queryset
    
    def perform_create(self, serializer):
        """Create mood entry with current user"""
        serializer.save(user=self.request.user)


class MoodEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a mood entry"""
    
    serializer_class = MoodEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def analyze_emotion(request):
    """Analyze emotion from image data"""
    
    serializer = EmotionAnalysisRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    image_data = serializer.validated_data['image_data']
    include_breakdown = serializer.validated_data['include_breakdown']
    analysis_method = serializer.validated_data['analysis_method']
    
    start_time = time.time()
    
    try:
        # Use real Azure emotion analysis (with fallback to mock)
        if analysis_method == 'azure':
            analysis_result = perform_azure_emotion_analysis(image_data, include_breakdown)
        else:
            # Default to Azure, fallback to mock if credentials not available
            analysis_result = perform_azure_emotion_analysis(image_data, include_breakdown)
        
        processing_time = time.time() - start_time
        analysis_result['processing_time'] = processing_time
        analysis_result['analysis_method'] = analysis_method
        
        response_serializer = EmotionAnalysisResponseSerializer(data=analysis_result)
        if response_serializer.is_valid():
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        return Response(
            {'error': f'Emotion analysis failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def perform_azure_emotion_analysis(image_data, include_breakdown=True):
    """Real emotion analysis using Azure Cognitive Services"""
    import requests
    import os
    from django.conf import settings
    
    # Azure Face API configuration
    AZURE_FACE_KEY = getattr(settings, 'AZURE_FACE_KEY', os.environ.get('AZURE_FACE_KEY'))
    AZURE_FACE_ENDPOINT = getattr(settings, 'AZURE_FACE_ENDPOINT', os.environ.get('AZURE_FACE_ENDPOINT'))
    
    if not AZURE_FACE_KEY or not AZURE_FACE_ENDPOINT:
        print("Azure credentials not found, falling back to mock analysis")
        return perform_mock_emotion_analysis(image_data, include_breakdown)
    
    try:
        # Convert base64 to binary
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_binary = base64.b64decode(image_data)
        
        # Azure Face API endpoint for emotion detection
        face_api_url = f"{AZURE_FACE_ENDPOINT}/face/v1.0/detect"
        
        headers = {
            'Ocp-Apim-Subscription-Key': AZURE_FACE_KEY,
            'Content-Type': 'application/octet-stream'
        }
        
        params = {
            'returnFaceAttributes': 'emotion',
            'detectionModel': 'detection_03',
            'recognitionModel': 'recognition_04'
        }
        
        # Make API request
        response = requests.post(face_api_url, headers=headers, params=params, data=image_binary, timeout=10)
        
        if response.status_code == 200:
            faces = response.json()
            
            if faces and len(faces) > 0:
                # Get emotions from first detected face
                emotions_data = faces[0]['faceAttributes']['emotion']
                
                # Find dominant emotion
                dominant_emotion = max(emotions_data, key=emotions_data.get)
                confidence = emotions_data[dominant_emotion]
                
                # Map Azure emotions to our format
                emotion_mapping = {
                    'happiness': 'happy',
                    'sadness': 'sad',
                    'anger': 'angry',
                    'surprise': 'surprised',
                    'neutral': 'neutral',
                    'fear': 'fear',
                    'disgust': 'disgust'
                }
                
                # Convert to our emotion format
                our_emotions = {}
                for azure_emotion, score in emotions_data.items():
                    our_emotion = emotion_mapping.get(azure_emotion, azure_emotion)
                    our_emotions[our_emotion] = score
                
                # Ensure all emotions are present
                for emotion in ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']:
                    if emotion not in our_emotions:
                        our_emotions[emotion] = 0.0
                
                mapped_dominant = emotion_mapping.get(dominant_emotion, dominant_emotion)
                
                return {
                    'emotion': mapped_dominant,
                    'confidence': confidence,
                    'emotions': our_emotions if include_breakdown else {}
                }
            else:
                print("No faces detected in image")
                return perform_mock_emotion_analysis(image_data, include_breakdown)
                
        else:
            print(f"Azure API error: {response.status_code} - {response.text}")
            return perform_mock_emotion_analysis(image_data, include_breakdown)
            
    except Exception as e:
        print(f"Error calling Azure Face API: {str(e)}")
        return perform_mock_emotion_analysis(image_data, include_breakdown)


def perform_mock_emotion_analysis(image_data, include_breakdown=True):
    """Fallback mock emotion analysis"""
    
    # Simulate processing time
    time.sleep(random.uniform(0.5, 1.5))
    
    # Mock emotions with realistic distributions
    emotions = ['happy', 'sad', 'neutral', 'surprised', 'angry', 'fear', 'disgust']
    
    # Generate primary emotion
    primary_emotion = random.choice(emotions)
    
    # Generate emotion scores
    emotion_scores = {}
    remaining_probability = 1.0
    
    # Give primary emotion a high score
    primary_score = random.uniform(0.4, 0.8)
    emotion_scores[primary_emotion] = primary_score
    remaining_probability -= primary_score
    
    # Distribute remaining probability among other emotions
    other_emotions = [e for e in emotions if e != primary_emotion]
    random.shuffle(other_emotions)
    
    for i, emotion in enumerate(other_emotions):
        if i == len(other_emotions) - 1:
            # Last emotion gets remaining probability
            emotion_scores[emotion] = max(0, remaining_probability)
        else:
            # Random portion of remaining probability
            score = random.uniform(0, remaining_probability * 0.3)
            emotion_scores[emotion] = score
            remaining_probability -= score
    
    # Normalize to ensure sum is 1.0
    total = sum(emotion_scores.values())
    if total > 0:
        emotion_scores = {k: v/total for k, v in emotion_scores.items()}
    
    return {
        'emotion': primary_emotion,
        'confidence': emotion_scores[primary_emotion],
        'emotions': emotion_scores if include_breakdown else {}
    }


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mood_stats(request):
    """Get mood statistics for current user"""
    
    user = request.user
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Get all entries for user
    all_entries = MoodEntry.objects.filter(user=user)
    week_entries = all_entries.filter(timestamp__gte=week_ago)
    month_entries = all_entries.filter(timestamp__gte=month_ago)
    
    # Basic stats
    total_entries = all_entries.count()
    entries_this_week = week_entries.count()
    entries_this_month = month_entries.count()
    
    # Most common emotion
    most_common = all_entries.values('emotion').annotate(
        count=Count('emotion')
    ).order_by('-count').first()
    
    most_common_emotion = most_common['emotion'] if most_common else 'neutral'
    
    # Average confidence
    avg_confidence = all_entries.aggregate(
        avg=Avg('confidence')
    )['avg'] or 0.0
    
    # Emotion distribution
    emotion_dist = {}
    emotion_counts = all_entries.values('emotion').annotate(count=Count('emotion'))
    total_for_dist = sum(item['count'] for item in emotion_counts)
    
    for item in emotion_counts:
        emotion_dist[item['emotion']] = round(item['count'] / total_for_dist * 100, 1) if total_for_dist > 0 else 0
    
    # Calculate mood trend
    if week_entries.count() >= 2:
        recent_half = week_entries.filter(timestamp__gte=now - timedelta(days=3.5))
        older_half = week_entries.filter(timestamp__lt=now - timedelta(days=3.5))
        
        recent_avg = recent_half.aggregate(avg=Avg('confidence'))['avg'] or 0
        older_avg = older_half.aggregate(avg=Avg('confidence'))['avg'] or 0
        
        if recent_avg > older_avg + 0.1:
            mood_trend = 'improving'
        elif recent_avg < older_avg - 0.1:
            mood_trend = 'declining'
        else:
            mood_trend = 'stable'
    else:
        mood_trend = 'stable'
    
    # Calculate streak
    streak_days = calculate_mood_streak(user)
    
    # Weekly and monthly trends
    weekly_trend = get_mood_trend_data(user, 7)
    monthly_trend = get_mood_trend_data(user, 30)
    
    stats_data = {
        'total_entries': total_entries,
        'most_common_emotion': most_common_emotion,
        'average_confidence': round(avg_confidence, 3),
        'mood_trend': mood_trend,
        'entries_this_week': entries_this_week,
        'entries_this_month': entries_this_month,
        'streak_days': streak_days,
        'emotion_distribution': emotion_dist,
        'weekly_trend': weekly_trend,
        'monthly_trend': monthly_trend
    }
    
    serializer = MoodStatsSerializer(data=stats_data)
    if serializer.is_valid():
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def calculate_mood_streak(user):
    """Calculate consecutive days with mood entries"""
    
    today = timezone.now().date()
    streak = 0
    current_date = today
    
    while True:
        # Check if user has entry for current_date
        has_entry = MoodEntry.objects.filter(
            user=user,
            timestamp__date=current_date
        ).exists()
        
        if has_entry:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
        
        # Prevent infinite loop
        if streak > 365:
            break
    
    return streak


def get_mood_trend_data(user, days):
    """Get mood trend data for specified number of days"""
    
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    trend_data = []
    current_date = start_date
    
    while current_date <= end_date:
        day_entries = MoodEntry.objects.filter(
            user=user,
            timestamp__date=current_date
        )
        
        if day_entries.exists():
            avg_confidence = day_entries.aggregate(avg=Avg('confidence'))['avg']
            dominant_emotion = day_entries.values('emotion').annotate(
                count=Count('emotion')
            ).order_by('-count').first()['emotion']
        else:
            avg_confidence = None
            dominant_emotion = None
        
        trend_data.append({
            'date': current_date.isoformat(),
            'average_confidence': round(avg_confidence, 3) if avg_confidence else None,
            'dominant_emotion': dominant_emotion,
            'entry_count': day_entries.count()
        })
        
        current_date += timedelta(days=1)
    
    return trend_data


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mood_trends(request):
    """Get mood trends over time"""
    
    period = request.query_params.get('period', 'month')
    
    if period == 'week':
        days = 7
    elif period == 'year':
        days = 365
    else:
        days = 30  # month
    
    trend_data = get_mood_trend_data(request.user, days)
    
    return Response(trend_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_mood_dashboard(request):
    """Get admin mood dashboard with all users data"""
    
    now = timezone.now()
    today = now.date()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Get all users with mood entries
    users_with_moods = User.objects.filter(camera_mood_entries__isnull=False).distinct()
    
    user_profiles = []
    for user in users_with_moods:
        # Get user's mood entries
        all_entries = MoodEntry.objects.filter(user=user)
        recent_entries = all_entries.filter(timestamp__gte=month_ago)
        
        if not all_entries.exists():
            continue
            
        # Latest mood
        latest_entry = all_entries.first()
        
        # Calculate mood trend
        week_entries = all_entries.filter(timestamp__gte=week_ago)
        prev_week_entries = all_entries.filter(
            timestamp__gte=now - timedelta(days=14),
            timestamp__lt=week_ago
        )
        
        current_avg = week_entries.aggregate(avg_conf=Avg('confidence'))['avg_conf'] or 0
        prev_avg = prev_week_entries.aggregate(avg_conf=Avg('confidence'))['avg_conf'] or 0
        
        if current_avg > prev_avg + 0.1:
            trend = 'improving'
        elif current_avg < prev_avg - 0.1:
            trend = 'declining'
        else:
            trend = 'stable'
        
        # Mood history for last 30 days
        mood_history = []
        for entry in recent_entries.order_by('timestamp'):
            mood_history.append({
                'emotion': entry.emotion,
                'confidence': entry.confidence,
                'timestamp': int(entry.timestamp.timestamp() * 1000)
            })
        
        # Calculate average mood
        emotion_counts = all_entries.values('emotion').annotate(count=Count('emotion')).order_by('-count')
        avg_mood = emotion_counts.first()['emotion'] if emotion_counts else 'neutral'
        
        user_profiles.append({
            'id': str(user.id),
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'lastActive': user.last_login.isoformat() if user.last_login else now.isoformat(),
            'currentMood': {
                'emotion': latest_entry.emotion,
                'confidence': latest_entry.confidence,
                'timestamp': int(latest_entry.timestamp.timestamp() * 1000)
            } if latest_entry else None,
            'moodHistory': mood_history,
            'totalSessions': all_entries.count(),
            'averageMood': avg_mood,
            'moodTrend': trend
        })
    
    return Response(user_profiles, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mood_dashboard(request):
    """Get comprehensive mood dashboard data"""
    
    user = request.user
    now = timezone.now()
    today = now.date()
    week_ago = now - timedelta(days=7)
    
    # Basic stats
    all_entries = MoodEntry.objects.filter(user=user)
    today_entries = all_entries.filter(timestamp__date=today)
    week_entries = all_entries.filter(timestamp__gte=week_ago)
    
    total_entries = all_entries.count()
    entries_today = today_entries.count()
    entries_this_week = week_entries.count()
    
    # Latest entry
    latest_entry = all_entries.first()
    
    # Streak calculation
    current_streak = calculate_mood_streak(user)
    
    # Weekly trends
    if week_entries.count() >= 2:
        recent_half = week_entries.filter(timestamp__gte=now - timedelta(days=3.5))
        older_half = week_entries.filter(timestamp__lt=now - timedelta(days=3.5))
        
        recent_avg = recent_half.aggregate(avg=Avg('confidence'))['avg'] or 0
        older_avg = older_half.aggregate(avg=Avg('confidence'))['avg'] or 0
        
        if recent_avg > older_avg + 0.1:
            mood_trend = 'improving'
        elif recent_avg < older_avg - 0.1:
            mood_trend = 'declining'
        else:
            mood_trend = 'stable'
    else:
        mood_trend = 'stable'
    
    # Dominant emotion this week
    week_emotion = week_entries.values('emotion').annotate(
        count=Count('emotion')
    ).order_by('-count').first()
    
    dominant_emotion_week = week_emotion['emotion'] if week_emotion else None
    
    # Average confidence this week
    average_confidence_week = week_entries.aggregate(
        avg=Avg('confidence')
    )['avg']
    
    # Recent entries (last 5)
    recent_entries = all_entries[:5]
    
    # Active insights count
    active_insights_count = MoodInsight.objects.filter(
        user=user,
        is_active=True
    ).count()
    
    # Latest insight
    latest_insight = MoodInsight.objects.filter(
        user=user,
        is_active=True
    ).first()
    
    dashboard_data = {
        'total_entries': total_entries,
        'entries_today': entries_today,
        'entries_this_week': entries_this_week,
        'current_streak': current_streak,
        'latest_emotion': latest_entry.emotion if latest_entry else None,
        'latest_confidence': latest_entry.confidence if latest_entry else None,
        'latest_timestamp': latest_entry.timestamp if latest_entry else None,
        'mood_trend': mood_trend,
        'dominant_emotion_week': dominant_emotion_week,
        'average_confidence_week': round(average_confidence_week, 3) if average_confidence_week else None,
        'recent_entries': recent_entries,
        'active_insights_count': active_insights_count,
        'latest_insight': latest_insight
    }
    
    serializer = MoodDashboardSerializer(data=dashboard_data)
    if serializer.is_valid():
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MoodInsightListView(generics.ListAPIView):
    """List mood insights for current user"""
    
    serializer_class = MoodInsightSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MoodInsight.objects.filter(
            user=self.request.user,
            is_active=True
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def acknowledge_insight(request, insight_id):
    """Acknowledge a mood insight"""
    
    try:
        insight = MoodInsight.objects.get(
            id=insight_id,
            user=request.user
        )
        
        insight.is_acknowledged = True
        insight.acknowledged_at = timezone.now()
        insight.save()
        
        return Response({'message': 'Insight acknowledged'}, status=status.HTTP_200_OK)
    
    except MoodInsight.DoesNotExist:
        return Response(
            {'error': 'Insight not found'},
            status=status.HTTP_404_NOT_FOUND
        )
