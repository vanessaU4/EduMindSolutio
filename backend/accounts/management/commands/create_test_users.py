from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test users for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Number of test users to create',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        with transaction.atomic():
            # Create admin user
            admin_user, created = User.objects.get_or_create(
                email='admin@edumind.com',
                defaults={
                    'username': 'admin',
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'role': 'admin',
                    'is_staff': True,
                    'is_superuser': True,
                    'age': 25,
                    'gender': 'prefer_not_to_say',
                    'bio': 'System administrator',
                    'onboarding_completed': True,
                }
            )
            if created:
                admin_user.set_password('admin123')
                admin_user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Created admin user: {admin_user.email}')
                )

            # Create guide users
            for i in range(1, 4):
                guide_user, created = User.objects.get_or_create(
                    email=f'guide{i}@edumind.com',
                    defaults={
                        'username': f'guide{i}',
                        'first_name': f'Guide',
                        'last_name': f'User{i}',
                        'role': 'guide',
                        'age': 25 + i,
                        'gender': 'prefer_not_to_say',
                        'bio': f'Mental health guide #{i}',
                        'onboarding_completed': True,
                        'years_experience': 2 + i,
                    }
                )
                if created:
                    guide_user.set_password('guide123')
                    guide_user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'Created guide user: {guide_user.email}')
                    )

            # Create regular users
            for i in range(1, count - 3):
                user, created = User.objects.get_or_create(
                    email=f'user{i}@edumind.com',
                    defaults={
                        'username': f'user{i}',
                        'first_name': f'Test',
                        'last_name': f'User{i}',
                        'role': 'user',
                        'age': 18 + (i % 5),
                        'gender': ['male', 'female', 'non_binary', 'prefer_not_to_say'][i % 4],
                        'bio': f'Test user #{i} for platform testing',
                        'onboarding_completed': i % 3 == 0,
                        'is_active': i % 10 != 0,  # Make some inactive for testing
                    }
                )
                if created:
                    user.set_password('user123')
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'Created user: {user.email}')
                    )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created test users!')
        )
        
        # Print summary
        total_users = User.objects.count()
        admin_count = User.objects.filter(role='admin').count()
        guide_count = User.objects.filter(role='guide').count()
        user_count = User.objects.filter(role='user').count()
        active_count = User.objects.filter(is_active=True).count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nUser Summary:\n'
                f'Total Users: {total_users}\n'
                f'Admins: {admin_count}\n'
                f'Guides: {guide_count}\n'
                f'Regular Users: {user_count}\n'
                f'Active Users: {active_count}\n'
            )
        )
