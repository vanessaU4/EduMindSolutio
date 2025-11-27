from django.core.management.base import BaseCommand
from community.models import ForumCategory

class Command(BaseCommand):
    help = 'Create default forum categories'

    def handle(self, *args, **options):
        categories = [
            {
                'name': 'General Discussion',
                'description': 'General mental health discussions and support',
                'icon': 'MessageSquare',
                'color': '#3B82F6',
                'order': 1
            },
            {
                'name': 'Anxiety & Stress',
                'description': 'Support and coping strategies for anxiety and stress',
                'icon': 'Heart',
                'color': '#EF4444',
                'order': 2
            },
            {
                'name': 'Depression Support',
                'description': 'Community support for those dealing with depression',
                'icon': 'Users',
                'color': '#8B5CF6',
                'order': 3
            },
            {
                'name': 'Coping Strategies',
                'description': 'Share and learn healthy coping mechanisms',
                'icon': 'Shield',
                'color': '#10B981',
                'order': 4
            },
            {
                'name': 'Success Stories',
                'description': 'Share your recovery and success stories',
                'icon': 'TrendingUp',
                'color': '#F59E0B',
                'order': 5
            },
            {
                'name': 'Questions & Advice',
                'description': 'Ask questions and get advice from the community',
                'icon': 'HelpCircle',
                'color': '#06B6D4',
                'order': 6
            }
        ]

        for category_data in categories:
            category, created = ForumCategory.objects.get_or_create(
                name=category_data['name'],
                defaults=category_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {category.name}')
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully set up forum categories!')
        )
