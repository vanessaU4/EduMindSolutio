import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Create admin user with default credentials'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default=os.getenv('ADMIN_USERNAME', 'admin'),
            help='Admin username (default: admin)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default=os.getenv('ADMIN_EMAIL', 'admin@edumindsolutions.com'),
            help='Admin email'
        )
        parser.add_argument(
            '--password',
            type=str,
            default=os.getenv('ADMIN_PASSWORD', 'AdminPass123!'),
            help='Admin password'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        try:
            # Check if admin user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f'Admin user "{username}" already exists. Skipping creation.')
                )
                return

            # Create admin user
            admin_user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                first_name='Admin',
                last_name='User',
                role='admin',
                is_active=True,  # Ensure admin is active
                is_approved=True,  # Ensure admin is approved
                approved_at=timezone.now()
            )

            self.stdout.write(
                self.style.SUCCESS(f'✅ Successfully created admin user: {username}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'📧 Email: {email}')
            )
            self.stdout.write(
                self.style.WARNING('🔐 Please change the default password after first login!')
            )

        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error creating admin user: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Unexpected error: {e}')
            )
