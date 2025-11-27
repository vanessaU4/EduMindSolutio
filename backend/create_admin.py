#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create admin user
admin_username = 'admin'
admin_email = 'admin@edumindsolution.com'
admin_password = 'EduMind2024!'

# Check if admin user already exists
if User.objects.filter(username=admin_username).exists():
    print(f"Admin user '{admin_username}' already exists.")
    admin_user = User.objects.get(username=admin_username)
    
    # Ensure existing admin has all required permissions and status
    admin_user.is_active = True
    admin_user.is_approved = True
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.role = 'admin'
    admin_user.save()
    print("Updated existing admin user with full permissions.")
else:
    # Create the admin user with all permissions and active status
    admin_user = User.objects.create_superuser(
        username=admin_username,
        email=admin_email,
        password=admin_password,
        first_name='System',
        last_name='Administrator',
        role='admin',
        is_active=True,
        is_approved=True,
        is_staff=True,
        is_superuser=True
    )
    print(f"Admin user '{admin_username}' created successfully!")

print(f"""
=== EduMindSolutions Admin User ===
Username: {admin_user.username}
Email: {admin_user.email}
Password: EduMind2024!
Role: admin
Status: {'Active' if admin_user.is_active else 'Inactive'}

=== Access Information ===
Admin Panel: http://localhost:8000/admin/
API Access: http://localhost:8000/api/
Frontend: http://localhost:3001/

=== Security Note ===
Please change the default password after first login!
""")
