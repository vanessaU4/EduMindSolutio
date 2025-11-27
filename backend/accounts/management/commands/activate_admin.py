from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models

User = get_user_model()

class Command(BaseCommand):
    help = 'Activate and approve existing admin users'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Checking for inactive admin users...')

        # Find admin users that are inactive or unapproved
        admin_users = User.objects.filter(
            role='admin',
            is_superuser=True
        ).filter(
            models.Q(is_active=False) | models.Q(is_approved=False)
        )

        if not admin_users.exists():
            self.stdout.write(
                self.style.SUCCESS('✅ All admin users are already active and approved!')
            )
            return

        for admin_user in admin_users:
            admin_user.is_active = True
            admin_user.is_approved = True
            admin_user.approved_at = timezone.now()
            admin_user.save(update_fields=['is_active', 'is_approved', 'approved_at'])
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Activated admin user: {admin_user.username} ({admin_user.email})')
            )

        self.stdout.write(
            self.style.SUCCESS(f'🎉 Successfully activated {admin_users.count()} admin user(s)!')
        )
