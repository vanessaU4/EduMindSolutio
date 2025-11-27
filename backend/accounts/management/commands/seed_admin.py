"""
Management command to create admin user on server startup
Usage: python manage.py seed_admin
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Create admin user if it does not exist'

    def handle(self, *args, **options):
        admin_email = settings.ADMIN_EMAIL
        admin_first_name = settings.ADMIN_FIRST_NAME
        admin_last_name = settings.ADMIN_LAST_NAME
        admin_password = settings.ADMIN_PASSWORD
        admin_role = settings.ADMIN_ROLE

        try:
            # Check if admin user already exists
            admin_user = User.objects.get(email=admin_email)
            self.stdout.write(
                self.style.WARNING(f'Admin user {admin_email} already exists')
            )
            
            # Update admin user properties if needed
            updated = False
            if not admin_user.is_staff:
                admin_user.is_staff = True
                updated = True
            if not admin_user.is_superuser:
                admin_user.is_superuser = True
                updated = True
            if not admin_user.is_active:
                admin_user.is_active = True
                updated = True
            if not admin_user.is_approved:
                admin_user.is_approved = True
                admin_user.approved_at = timezone.now()
                updated = True
            if admin_user.role != admin_role:
                admin_user.role = admin_role
                updated = True
            if admin_user.first_name != admin_first_name:
                admin_user.first_name = admin_first_name
                updated = True
            if admin_user.last_name != admin_last_name:
                admin_user.last_name = admin_last_name
                updated = True
                
            if updated:
                admin_user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated admin user {admin_email}')
                )
            
        except User.DoesNotExist:
            # Create new admin user
            admin_user = User.objects.create_user(
                email=admin_email,
                username=f"{admin_first_name.lower()}{admin_last_name.lower()}",
                password=admin_password,
                first_name=admin_first_name,
                last_name=admin_last_name,
                role=admin_role,
                is_staff=True,
                is_superuser=True,
                is_active=True,
                is_approved=True,
                approved_at=timezone.now()
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Created admin user: {admin_email}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Username: {admin_user.username}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Password: {admin_password}')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating admin user: {str(e)}')
            )
