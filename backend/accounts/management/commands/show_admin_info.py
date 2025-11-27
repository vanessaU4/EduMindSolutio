import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Show admin user information for login'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Admin User Information:')
        self.stdout.write('=' * 50)

        # Get admin users
        admin_users = User.objects.filter(role='admin', is_superuser=True)

        if not admin_users.exists():
            self.stdout.write(
                self.style.ERROR('❌ No admin users found!')
            )
            return

        for admin_user in admin_users:
            self.stdout.write(f'👤 Username: {admin_user.username}')
            self.stdout.write(f'📧 Email: {admin_user.email}')
            self.stdout.write(f'✅ Active: {admin_user.is_active}')
            self.stdout.write(f'✅ Approved: {admin_user.is_approved}')
            self.stdout.write(f'🔑 Superuser: {admin_user.is_superuser}')
            self.stdout.write(f'👥 Role: {admin_user.get_role_display()}')
            
            # Show environment-based password info
            env_password = os.getenv('ADMIN_PASSWORD', 'AdminPass123!')
            self.stdout.write(f'🔐 Default Password: {env_password}')
            
            self.stdout.write('-' * 30)

        self.stdout.write('')
        self.stdout.write('🌐 Login URLs:')
        self.stdout.write('• Frontend: https://edu-mind-solutions.vercel.app/')
        self.stdout.write('• Backend Admin: https://edumindsolutions.onrender.com/admin/')
        self.stdout.write('• API Health: https://edumindsolutions.onrender.com/health/')
        
        self.stdout.write('')
        self.stdout.write('⚠️  Note: If using environment password, check Render dashboard for ADMIN_PASSWORD value')
