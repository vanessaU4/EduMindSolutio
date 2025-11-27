from django.core.management.base import BaseCommand
from django.core.management import call_command
from community.models import ForumCategory, ForumPost
from accounts.models import User


class Command(BaseCommand):
    help = 'Set up initial community data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up community data...'))
        
        # Load fixtures
        try:
            call_command('loaddata', 'initial_categories.json')
            self.stdout.write(self.style.SUCCESS('✓ Forum categories loaded'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Categories might already exist: {e}'))
        
        # Create sample posts if none exist
        if not ForumPost.objects.exists():
            try:
                # Get or create a system user for sample posts
                system_user, created = User.objects.get_or_create(
                    username='community_admin',
                    defaults={
                        'email': 'admin@edumindsolutions.com',
                        'first_name': 'Community',
                        'last_name': 'Admin',
                        'role': 'admin'
                    }
                )
                
                # Create welcome posts for each category
                categories = ForumCategory.objects.all()
                for category in categories:
                    ForumPost.objects.create(
                        title=f"Welcome to {category.name}",
                        content=f"This is a safe space for {category.description.lower()}. Please be respectful and supportive to everyone in our community.",
                        author=system_user,
                        category=category,
                        is_anonymous=False,
                        is_pinned=True,
                        is_approved=True
                    )
                
                self.stdout.write(self.style.SUCCESS('✓ Sample posts created'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating sample posts: {e}'))
        
        self.stdout.write(self.style.SUCCESS('Community setup complete!'))
