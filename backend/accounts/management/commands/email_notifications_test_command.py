"""
Management command to test email notification functionality
Usage: python manage.py test_email_notifications
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.email_utils import (
    send_user_registration_notification_to_admin,
    send_user_approval_notification,
    send_admin_user_approved_notification
)
from notifications.utils import (
    create_user_registration_notification,
    create_user_approved_notification
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Test email notification functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-type',
            type=str,
            choices=['registration', 'approval', 'all'],
            default='all',
            help='Type of notification to test'
        )
        parser.add_argument(
            '--user-email',
            type=str,
            help='Email of existing user to test with'
        )

    def handle(self, *args, **options):
        test_type = options['test_type']
        user_email = options.get('user_email')

        self.stdout.write(
            self.style.SUCCESS('Starting email notification tests...')
        )

        # Get or create test users
        admin_user = self.get_or_create_admin()
        test_user = self.get_or_create_test_user(user_email)

        if test_type in ['registration', 'all']:
            self.test_registration_notification(admin_user, test_user)

        if test_type in ['approval', 'all']:
            self.test_approval_notification(test_user, admin_user)

        self.stdout.write(
            self.style.SUCCESS('Email notification tests completed!')
        )

    def get_or_create_admin(self):
        """Get or create an admin user for testing"""
        admin_email = 'admin@edumindsolutions.com'
        try:
            admin = User.objects.get(email=admin_email)
            self.stdout.write(f'Using existing admin: {admin_email}')
        except User.DoesNotExist:
            admin = User.objects.create_user(
                email=admin_email,
                username='admin_test',
                password='testpassword123',
                role='admin',
                is_staff=True,
                is_superuser=True,
                is_active=True,
                is_approved=True
            )
            self.stdout.write(f'Created test admin: {admin_email}')
        return admin

    def get_or_create_test_user(self, user_email=None):
        """Get or create a test user"""
        if user_email:
            try:
                user = User.objects.get(email=user_email)
                self.stdout.write(f'Using existing user: {user_email}')
                return user
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User with email {user_email} not found')
                )

        # Create a new test user
        test_email = 'testuser@example.com'
        try:
            user = User.objects.get(email=test_email)
            self.stdout.write(f'Using existing test user: {test_email}')
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=test_email,
                username='test_user',
                password='testpassword123',
                first_name='Test',
                last_name='User',
                role='user',
                age=20,
                bio='This is a test user for email notifications',
                is_active=False,
                is_approved=False
            )
            self.stdout.write(f'Created test user: {test_email}')
        return user

    def test_registration_notification(self, admin_user, test_user):
        """Test user registration notification"""
        self.stdout.write('\n--- Testing Registration Notification ---')
        
        try:
            # Test email notification to admin
            success = send_user_registration_notification_to_admin(test_user)
            if success:
                self.stdout.write(
                    self.style.SUCCESS('✓ Registration email sent to admin')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('✗ Failed to send registration email')
                )

            # Test in-app notification
            notification = create_user_registration_notification(admin_user, test_user)
            if notification:
                self.stdout.write(
                    self.style.SUCCESS('✓ In-app registration notification created')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('✗ Failed to create in-app notification')
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Registration notification test failed: {str(e)}')
            )

    def test_approval_notification(self, test_user, admin_user):
        """Test user approval notification"""
        self.stdout.write('\n--- Testing Approval Notification ---')
        
        try:
            # Approve the user
            test_user.approve_user(admin_user)
            self.stdout.write(f'✓ User {test_user.email} approved')

            # Test email notification to user
            success = send_user_approval_notification(test_user)
            if success:
                self.stdout.write(
                    self.style.SUCCESS('✓ Approval email sent to user')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('✗ Failed to send approval email')
                )

            # Test in-app notification
            notification = create_user_approved_notification(test_user)
            if notification:
                self.stdout.write(
                    self.style.SUCCESS('✓ In-app approval notification created')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('✗ Failed to create in-app notification')
                )

            # Test admin notification about approval
            success = send_admin_user_approved_notification(test_user, admin_user)
            if success:
                self.stdout.write(
                    self.style.SUCCESS('✓ Admin approval confirmation email sent')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('✗ Failed to send admin confirmation email')
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Approval notification test failed: {str(e)}')
            )

    def cleanup_test_data(self):
        """Clean up test data (optional)"""
        self.stdout.write('\n--- Cleanup ---')
        try:
            User.objects.filter(email='testuser@example.com').delete()
            self.stdout.write('✓ Test user cleaned up')
        except Exception as e:
            self.stdout.write(f'Warning: Cleanup failed: {str(e)}')
