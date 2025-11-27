"""
Management command to populate wellness app with sample data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from wellness.models import (
    Achievement, DailyChallenge, WeeklyChallenge, WellnessTip
)

class Command(BaseCommand):
    help = 'Populate wellness app with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Populating wellness data...')
        
        # Create Achievements
        self.create_achievements()
        
        # Create Daily Challenges
        self.create_daily_challenges()
        
        # Create Weekly Challenges
        self.create_weekly_challenges()
        
        # Create Wellness Tips
        self.create_wellness_tips()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated wellness data!')
        )

    def create_achievements(self):
        achievements = [
            {
                'name': 'First Mood Entry',
                'description': 'Log your first mood entry',
                'category': 'wellness',
                'icon': 'smile',
                'points_reward': 10,
                'criteria': {'type': 'mood_count', 'target': 1},
                'is_repeatable': False
            },
            {
                'name': '3-Day Streak',
                'description': 'Log your mood for 3 consecutive days',
                'category': 'wellness',
                'icon': 'fire',
                'points_reward': 25,
                'criteria': {'type': 'mood_streak', 'target': 3},
                'is_repeatable': False
            },
            {
                'name': '7-Day Streak',
                'description': 'Log your mood for 7 consecutive days',
                'category': 'wellness',
                'icon': 'star',
                'points_reward': 50,
                'criteria': {'type': 'mood_streak', 'target': 7},
                'is_repeatable': False
            },
            {
                'name': '30-Day Streak',
                'description': 'Log your mood for 30 consecutive days',
                'category': 'wellness',
                'icon': 'trophy',
                'points_reward': 200,
                'criteria': {'type': 'mood_streak', 'target': 30},
                'is_repeatable': False
            },
            {
                'name': 'First Challenge',
                'description': 'Complete your first daily challenge',
                'category': 'engagement',
                'icon': 'target',
                'points_reward': 15,
                'criteria': {'type': 'challenge_count', 'target': 1},
                'is_repeatable': False
            },
            {
                'name': '10 Challenges',
                'description': 'Complete 10 daily challenges',
                'category': 'engagement',
                'icon': 'award',
                'points_reward': 75,
                'criteria': {'type': 'challenge_count', 'target': 10},
                'is_repeatable': False
            },
            {
                'name': '50 Challenges',
                'description': 'Complete 50 daily challenges',
                'category': 'engagement',
                'icon': 'medal',
                'points_reward': 250,
                'criteria': {'type': 'challenge_count', 'target': 50},
                'is_repeatable': False
            },
            {
                'name': 'Wellness Explorer',
                'description': 'Try all types of wellness activities',
                'category': 'milestone',
                'icon': 'compass',
                'points_reward': 100,
                'criteria': {'type': 'activity_variety', 'target': 5},
                'is_repeatable': False
            }
        ]

        for achievement_data in achievements:
            achievement, created = Achievement.objects.get_or_create(
                name=achievement_data['name'],
                defaults=achievement_data
            )
            if created:
                self.stdout.write(f'Created achievement: {achievement.name}')

    def create_daily_challenges(self):
        challenges = [
            {
                'title': 'Morning Gratitude',
                'description': 'Write down 3 things you\'re grateful for today',
                'challenge_type': 'gratitude',
                'instructions': 'Take a moment to reflect on positive aspects of your life. Write down three specific things you\'re grateful for, no matter how big or small.',
                'points_reward': 10,
                'duration_minutes': 5
            },
            {
                'title': 'Deep Breathing Exercise',
                'description': 'Practice 4-7-8 breathing technique for 5 minutes',
                'challenge_type': 'breathing',
                'instructions': 'Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat this cycle for 5 minutes to reduce stress and anxiety.',
                'points_reward': 15,
                'duration_minutes': 5
            },
            {
                'title': '10-Minute Walk',
                'description': 'Take a 10-minute walk outside or indoors',
                'challenge_type': 'physical',
                'instructions': 'Go for a brisk 10-minute walk. Focus on your surroundings and try to clear your mind. Fresh air and movement boost mood and energy.',
                'points_reward': 12,
                'duration_minutes': 10,
                'target_value': 10
            },
            {
                'title': 'Connect with Someone',
                'description': 'Reach out to a friend, family member, or colleague',
                'challenge_type': 'social',
                'instructions': 'Send a message, make a call, or have a conversation with someone you care about. Social connections are vital for mental health.',
                'points_reward': 8,
                'duration_minutes': 10
            },
            {
                'title': 'Mindful Meditation',
                'description': 'Practice mindfulness meditation for 10 minutes',
                'challenge_type': 'mindfulness',
                'instructions': 'Find a quiet space, sit comfortably, and focus on your breath. When your mind wanders, gently bring attention back to breathing.',
                'points_reward': 20,
                'duration_minutes': 10
            },
            {
                'title': 'Learn Something New',
                'description': 'Spend 15 minutes learning about a topic that interests you',
                'challenge_type': 'learning',
                'instructions': 'Read an article, watch an educational video, or practice a new skill. Continuous learning keeps the mind active and engaged.',
                'points_reward': 15,
                'duration_minutes': 15
            },
            {
                'title': 'Hydration Check',
                'description': 'Drink 8 glasses of water throughout the day',
                'challenge_type': 'physical',
                'instructions': 'Stay hydrated by drinking at least 8 glasses of water. Keep track throughout the day and notice how proper hydration affects your energy.',
                'points_reward': 8,
                'target_value': 8
            },
            {
                'title': 'Digital Detox Hour',
                'description': 'Spend 1 hour without screens or social media',
                'challenge_type': 'mindfulness',
                'instructions': 'Take a break from all digital devices for one hour. Use this time for reading, walking, or other offline activities.',
                'points_reward': 18,
                'duration_minutes': 60
            },
            {
                'title': 'Positive Affirmations',
                'description': 'Practice 5 positive affirmations about yourself',
                'challenge_type': 'gratitude',
                'instructions': 'Look in the mirror and say 5 positive things about yourself. Focus on your strengths, achievements, and positive qualities.',
                'points_reward': 10,
                'duration_minutes': 5,
                'target_value': 5
            },
            {
                'title': 'Stretch Break',
                'description': 'Do 10 minutes of stretching exercises',
                'challenge_type': 'physical',
                'instructions': 'Take time to stretch your body. Focus on areas that feel tense. Stretching improves flexibility and reduces physical stress.',
                'points_reward': 12,
                'duration_minutes': 10
            }
        ]

        for challenge_data in challenges:
            challenge, created = DailyChallenge.objects.get_or_create(
                title=challenge_data['title'],
                defaults=challenge_data
            )
            if created:
                self.stdout.write(f'Created daily challenge: {challenge.title}')

    def create_weekly_challenges(self):
        today = timezone.now().date()
        next_week = today + timedelta(days=7)
        
        challenges = [
            {
                'title': 'Daily Mood Tracking',
                'description': 'Log your mood every day for a week',
                'challenge_type': 'habit_building',
                'instructions': 'Make it a habit to check in with yourself daily. Rate your mood, energy, and note any significant events or feelings.',
                'target_days': 7,
                'points_per_day': 15,
                'bonus_points': 50,
                'start_date': today,
                'end_date': next_week
            },
            {
                'title': 'Exercise Every Day',
                'description': 'Do at least 20 minutes of physical activity daily',
                'challenge_type': 'fitness',
                'instructions': 'Engage in any form of physical activity for at least 20 minutes each day. This could be walking, dancing, yoga, or any exercise you enjoy.',
                'target_days': 7,
                'points_per_day': 20,
                'bonus_points': 75,
                'start_date': today,
                'end_date': next_week
            },
            {
                'title': 'Meditation Week',
                'description': 'Practice meditation for 10 minutes daily',
                'challenge_type': 'mindfulness',
                'instructions': 'Dedicate 10 minutes each day to meditation or mindfulness practice. Use guided meditations if you\'re a beginner.',
                'target_days': 7,
                'points_per_day': 18,
                'bonus_points': 60,
                'start_date': today,
                'end_date': next_week
            },
            {
                'title': 'Social Connection Challenge',
                'description': 'Connect with someone meaningful each day',
                'challenge_type': 'social',
                'instructions': 'Reach out to friends, family, or colleagues daily. Have meaningful conversations and strengthen your social bonds.',
                'target_days': 5,
                'points_per_day': 12,
                'bonus_points': 40,
                'start_date': today,
                'end_date': next_week
            },
            {
                'title': 'Creative Expression Week',
                'description': 'Engage in creative activities daily',
                'challenge_type': 'creativity',
                'instructions': 'Spend time on creative activities like drawing, writing, music, crafts, or any form of artistic expression that brings you joy.',
                'target_days': 5,
                'points_per_day': 15,
                'bonus_points': 45,
                'start_date': today,
                'end_date': next_week
            }
        ]

        for challenge_data in challenges:
            challenge, created = WeeklyChallenge.objects.get_or_create(
                title=challenge_data['title'],
                start_date=challenge_data['start_date'],
                defaults=challenge_data
            )
            if created:
                self.stdout.write(f'Created weekly challenge: {challenge.title}')

    def create_wellness_tips(self):
        tips = [
            {
                'title': 'Start Your Day with Gratitude',
                'content': 'Begin each morning by thinking of three things you\'re grateful for. This simple practice can shift your mindset toward positivity and set a better tone for your day.',
                'tip_type': 'affirmation',
                'target_mood': [1, 2, 3],
                'target_age_range': 'all'
            },
            {
                'title': 'The 5-4-3-2-1 Grounding Technique',
                'content': 'When feeling anxious, identify 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This helps bring you back to the present moment.',
                'tip_type': 'coping_strategy',
                'target_mood': [1, 2],
                'target_age_range': 'all'
            },
            {
                'title': 'Take Micro-Breaks',
                'content': 'Every hour, take a 2-3 minute break to stand up, stretch, or take deep breaths. These micro-breaks can prevent burnout and maintain your energy throughout the day.',
                'tip_type': 'self_care',
                'target_mood': [2, 3],
                'target_age_range': 'all'
            },
            {
                'title': 'Practice the 4-7-8 Breathing',
                'content': 'Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. This breathing pattern activates your parasympathetic nervous system and promotes relaxation.',
                'tip_type': 'mindfulness',
                'target_mood': [1, 2, 3],
                'target_age_range': 'all'
            },
            {
                'title': 'Create a Wind-Down Routine',
                'content': 'Establish a calming evening routine 1 hour before bed. Dim lights, avoid screens, and engage in relaxing activities like reading or gentle stretching.',
                'tip_type': 'self_care',
                'target_mood': [1, 2, 3, 4],
                'target_age_range': 'all'
            },
            {
                'title': 'You Are Stronger Than You Think',
                'content': 'Remember that you have overcome challenges before, and you have the strength to overcome current ones too. Every difficult moment is temporary.',
                'tip_type': 'motivation',
                'target_mood': [1, 2],
                'target_age_range': 'all'
            },
            {
                'title': 'Connect with Nature',
                'content': 'Spend at least 10 minutes outdoors daily, even if it\'s just sitting by a window with plants. Nature exposure reduces stress hormones and improves mood.',
                'tip_type': 'self_care',
                'target_mood': [1, 2, 3],
                'target_age_range': 'all'
            },
            {
                'title': 'Progress, Not Perfection',
                'content': 'Focus on small improvements rather than perfection. Celebrate small wins and be patient with yourself as you work toward your goals.',
                'tip_type': 'motivation',
                'target_mood': [2, 3, 4],
                'target_age_range': 'all'
            },
            {
                'title': 'Stay Hydrated for Mental Clarity',
                'content': 'Dehydration can affect mood and cognitive function. Aim for 8 glasses of water daily and notice how proper hydration impacts your mental clarity.',
                'tip_type': 'self_care',
                'target_mood': [2, 3, 4],
                'target_age_range': 'all'
            },
            {
                'title': 'Practice Self-Compassion',
                'content': 'Treat yourself with the same kindness you would offer a good friend. When you make mistakes, respond with understanding rather than harsh self-criticism.',
                'tip_type': 'affirmation',
                'target_mood': [1, 2, 3],
                'target_age_range': 'all'
            }
        ]

        for tip_data in tips:
            tip, created = WellnessTip.objects.get_or_create(
                title=tip_data['title'],
                defaults=tip_data
            )
            if created:
                self.stdout.write(f'Created wellness tip: {tip.title}')
