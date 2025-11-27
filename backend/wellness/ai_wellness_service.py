"""
AI-Powered Wellness Service for generating insights and recommendations
"""
import json
import random
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Avg, Count, Q
from .models import MoodEntry, MoodPattern, UserPoints, UserChallengeCompletion

class AIWellnessService:
    """Service for AI-powered wellness insights and recommendations"""
    
    @staticmethod
    def analyze_mood_patterns(user, days=30):
        """Analyze user mood patterns over specified period"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        mood_entries = MoodEntry.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        ).order_by('date')
        
        if not mood_entries.exists():
            return None
            
        # Calculate averages
        avg_mood = mood_entries.aggregate(Avg('mood_rating'))['mood_rating__avg']
        avg_energy = mood_entries.aggregate(Avg('energy_level'))['energy_level__avg']
        avg_anxiety = mood_entries.aggregate(Avg('anxiety_level'))['anxiety_level__avg']
        avg_sleep = mood_entries.aggregate(Avg('sleep_quality'))['sleep_quality__avg']
        
        # Weekly trend analysis
        weekly_trends = []
        current_date = start_date
        while current_date <= end_date:
            week_end = min(current_date + timedelta(days=6), end_date)
            week_moods = mood_entries.filter(date__range=[current_date, week_end])
            
            if week_moods.exists():
                week_avg = week_moods.aggregate(Avg('mood_rating'))['mood_rating__avg']
                weekly_trends.append({
                    'week_start': current_date.isoformat(),
                    'week_end': week_end.isoformat(),
                    'avg_mood': round(week_avg, 2)
                })
            
            current_date += timedelta(days=7)
        
        # Identify triggers
        low_mood_entries = mood_entries.filter(mood_rating__lte=2)
        common_triggers = []
        for entry in low_mood_entries:
            if entry.triggers:
                common_triggers.extend(entry.triggers)
        
        trigger_counts = {}
        for trigger in common_triggers:
            trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
        
        top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Generate insights
        insights = {
            'period': {'start': start_date.isoformat(), 'end': end_date.isoformat()},
            'averages': {
                'mood': round(avg_mood, 2),
                'energy': round(avg_energy, 2),
                'anxiety': round(avg_anxiety, 2),
                'sleep': round(avg_sleep, 2)
            },
            'weekly_trends': weekly_trends,
            'top_triggers': [{'trigger': t[0], 'count': t[1]} for t in top_triggers],
            'total_entries': mood_entries.count(),
            'consistency_score': min(100, (mood_entries.count() / days) * 100)
        }
        
        return insights
    
    @staticmethod
    def generate_mood_recommendations(user, mood_data):
        """Generate AI-powered recommendations based on mood analysis"""
        recommendations = []
        
        if not mood_data:
            return ["Start tracking your mood daily to get personalized insights!"]
        
        avg_mood = mood_data['averages']['mood']
        avg_energy = mood_data['averages']['energy']
        avg_anxiety = mood_data['averages']['anxiety']
        avg_sleep = mood_data['averages']['sleep']
        
        # Mood-based recommendations
        if avg_mood < 3:
            recommendations.extend([
                "Consider incorporating daily gratitude practice",
                "Try spending 10 minutes in nature each day",
                "Connect with a friend or family member regularly"
            ])
        elif avg_mood >= 4:
            recommendations.extend([
                "Great mood patterns! Keep up your current routine",
                "Consider sharing your wellness strategies with others"
            ])
        
        # Energy-based recommendations
        if avg_energy < 3:
            recommendations.extend([
                "Try light exercise like walking or stretching",
                "Consider your sleep schedule and nutrition",
                "Take short breaks throughout the day"
            ])
        
        # Anxiety-based recommendations
        if avg_anxiety > 3:
            recommendations.extend([
                "Practice deep breathing exercises daily",
                "Try progressive muscle relaxation",
                "Consider mindfulness meditation"
            ])
        
        # Sleep-based recommendations
        if avg_sleep < 3:
            recommendations.extend([
                "Establish a consistent bedtime routine",
                "Limit screen time before bed",
                "Create a comfortable sleep environment"
            ])
        
        # Trigger-based recommendations
        if mood_data['top_triggers']:
            top_trigger = mood_data['top_triggers'][0]['trigger']
            recommendations.append(f"Work on coping strategies for '{top_trigger}' - your most common trigger")
        
        return recommendations[:5]  # Return top 5 recommendations
    
    @staticmethod
    def generate_daily_affirmation(user):
        """Generate personalized daily affirmation"""
        # Get recent mood to personalize
        recent_mood = MoodEntry.objects.filter(user=user).order_by('-date').first()
        
        affirmations = {
            'low': [
                "Today is a new opportunity to feel better",
                "I am stronger than my challenges",
                "Small steps forward are still progress",
                "I deserve compassion, especially from myself"
            ],
            'neutral': [
                "I am capable of creating positive change",
                "Every day brings new possibilities",
                "I choose to focus on what I can control",
                "I am worthy of happiness and peace"
            ],
            'high': [
                "I radiate positivity and attract good things",
                "My positive energy impacts everyone around me",
                "I am grateful for this moment of joy",
                "I celebrate my progress and achievements"
            ]
        }
        
        if recent_mood:
            if recent_mood.mood_rating <= 2:
                category = 'low'
            elif recent_mood.mood_rating >= 4:
                category = 'high'
            else:
                category = 'neutral'
        else:
            category = 'neutral'
        
        return random.choice(affirmations[category])
    
    @staticmethod
    def calculate_wellness_score(user):
        """Calculate overall wellness score based on various factors"""
        score = 0
        factors = {}
        
        # Mood consistency (30 points max)
        recent_moods = MoodEntry.objects.filter(
            user=user,
            date__gte=timezone.now().date() - timedelta(days=7)
        )
        if recent_moods.exists():
            mood_score = min(30, recent_moods.count() * 5)  # 5 points per day
            avg_mood = recent_moods.aggregate(Avg('mood_rating'))['mood_rating__avg']
            mood_quality = (avg_mood - 1) / 4 * 20  # Scale 1-5 to 0-20
            factors['mood_tracking'] = mood_score
            factors['mood_quality'] = mood_quality
            score += mood_score + mood_quality
        
        # Challenge completion (25 points max)
        recent_completions = UserChallengeCompletion.objects.filter(
            user=user,
            completion_date__gte=timezone.now().date() - timedelta(days=7)
        )
        challenge_score = min(25, recent_completions.count() * 5)
        factors['challenge_completion'] = challenge_score
        score += challenge_score
        
        # Streak bonus (15 points max)
        user_points = UserPoints.objects.filter(user=user).first()
        if user_points:
            streak_score = min(15, user_points.current_streak * 3)
            factors['streak_bonus'] = streak_score
            score += streak_score
        
        # Engagement bonus (10 points max)
        total_entries = MoodEntry.objects.filter(user=user).count()
        engagement_score = min(10, total_entries // 5)  # 1 point per 5 entries
        factors['engagement'] = engagement_score
        score += engagement_score
        
        return {
            'total_score': min(100, score),
            'factors': factors,
            'level': AIWellnessService._get_wellness_level(score)
        }
    
    @staticmethod
    def _get_wellness_level(score):
        """Determine wellness level based on score"""
        if score >= 80:
            return {'name': 'Wellness Champion', 'color': 'green'}
        elif score >= 60:
            return {'name': 'Wellness Warrior', 'color': 'blue'}
        elif score >= 40:
            return {'name': 'Wellness Explorer', 'color': 'orange'}
        else:
            return {'name': 'Wellness Beginner', 'color': 'gray'}
    
    @staticmethod
    def suggest_challenges(user):
        """Suggest personalized challenges based on user patterns"""
        # Analyze recent mood patterns
        recent_moods = MoodEntry.objects.filter(
            user=user,
            date__gte=timezone.now().date() - timedelta(days=14)
        )
        
        suggestions = []
        
        if not recent_moods.exists():
            suggestions.extend([
                {'type': 'mood_checkin', 'title': 'Start Daily Mood Tracking'},
                {'type': 'mindfulness', 'title': 'Try 5-Minute Meditation'}
            ])
            return suggestions
        
        avg_mood = recent_moods.aggregate(Avg('mood_rating'))['mood_rating__avg']
        avg_energy = recent_moods.aggregate(Avg('energy_level'))['energy_level__avg']
        avg_anxiety = recent_moods.aggregate(Avg('anxiety_level'))['anxiety_level__avg']
        
        # Mood-based suggestions
        if avg_mood < 3:
            suggestions.append({
                'type': 'gratitude',
                'title': 'Daily Gratitude Practice',
                'description': 'Write down 3 things you\'re grateful for'
            })
        
        # Energy-based suggestions
        if avg_energy < 3:
            suggestions.append({
                'type': 'physical',
                'title': '10-Minute Walk',
                'description': 'Take a short walk to boost energy'
            })
        
        # Anxiety-based suggestions
        if avg_anxiety > 3:
            suggestions.append({
                'type': 'breathing',
                'title': 'Deep Breathing Exercise',
                'description': 'Practice 4-7-8 breathing technique'
            })
        
        # Always include general wellness
        suggestions.append({
            'type': 'social',
            'title': 'Connect with Someone',
            'description': 'Reach out to a friend or family member'
        })
        
        return suggestions[:3]  # Return top 3 suggestions
