from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed initial data including user roles and permissions'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding initial data...')

        # Create user groups/roles
        self.create_user_groups()
        
        # Create sample data if needed
        self.create_sample_data()

        self.stdout.write(
            self.style.SUCCESS('✅ Initial data seeding completed!')
        )

    def create_user_groups(self):
        """Create user groups for different roles"""
        roles = [
            {
                'name': 'Admin',
                'permissions': ['add_user', 'change_user', 'delete_user', 'view_user']
            },
            {
                'name': 'Professional',
                'permissions': ['view_user', 'add_assessment', 'change_assessment']
            },
            {
                'name': 'Patient',
                'permissions': ['view_user', 'change_user']  # Only their own profile
            }
        ]

        for role_data in roles:
            group, created = Group.objects.get_or_create(name=role_data['name'])
            if created:
                self.stdout.write(f'✅ Created group: {role_data["name"]}')
                
                # Add permissions to group
                for perm_codename in role_data['permissions']:
                    try:
                        permission = Permission.objects.get(codename=perm_codename)
                        group.permissions.add(permission)
                    except Permission.DoesNotExist:
                        self.stdout.write(
                            self.style.WARNING(f'⚠️ Permission not found: {perm_codename}')
                        )
            else:
                self.stdout.write(f'ℹ️ Group already exists: {role_data["name"]}')

    def create_sample_data(self):
        """Create any additional sample data needed"""
        # Add any app-specific initial data here
        # For example: default categories, settings, etc.
        
        self.stdout.write('ℹ️ Sample data creation completed')
