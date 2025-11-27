"""Email notification utilities for the eduMindSolutions platform"""

from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


def send_user_registration_notification_to_admin(user):
    """
    Send email notification to admin when a new user registers
    
    Args:
        user: User instance that just registered
    """
    try:
        subject = f'New User Registration - {user.email}'
        
        # Create email content
        context = {
            'user': user,
            'user_role': user.get_role_display(),
            'registration_date': user.date_joined,
            'admin_url': f'{settings.CORS_ALLOWED_ORIGINS[0]}/admin/accounts/user/{user.id}/change/' if settings.CORS_ALLOWED_ORIGINS else '#'
        }
        
        # HTML email content
        html_message = f"""
        <html>
        <body>
            <h2>New User Registration</h2>
            <p>A new user has registered on the eduMindSolutions platform:</p>
            
            <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
                <tr><td><strong>Email:</strong></td><td>{user.email}</td></tr>
                <tr><td><strong>Username:</strong></td><td>{user.username}</td></tr>
                <tr><td><strong>Full Name:</strong></td><td>{user.full_name or 'Not provided'}</td></tr>
                <tr><td><strong>Role:</strong></td><td>{user.get_role_display()}</td></tr>
                <tr><td><strong>Age:</strong></td><td>{user.age or 'Not provided'}</td></tr>
                <tr><td><strong>Gender:</strong></td><td>{user.get_gender_display() if user.gender else 'Not provided'}</td></tr>
                <tr><td><strong>Registration Date:</strong></td><td>{user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}</td></tr>
                <tr><td><strong>Status:</strong></td><td>{'Approved' if user.is_approved else 'Pending Approval'}</td></tr>
            </table>
            
            <p><strong>Bio:</strong> {user.bio or 'Not provided'}</p>
            
            {'<p><strong>Professional Information:</strong></p><ul>' if user.role == 'guide' else ''}
            {f'<li>Title: {user.professional_title}</li>' if user.professional_title else ''}
            {f'<li>License: {user.license_number}</li>' if user.license_number else ''}
            {f'<li>Experience: {user.years_experience} years</li>' if user.years_experience else ''}
            {'</ul>' if user.role == 'guide' else ''}
            
            <p>
                <strong>Action Required:</strong> 
                {'This user is pending approval. Please review and approve their account to grant access.' if not user.is_approved else 'User has been automatically approved.'}
            </p>
            
            <p><a href="{context['admin_url']}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review User in Admin Panel</a></p>
        </body>
        </html>
        """
        
        # Plain text version
        plain_message = f"""
        New User Registration
        
        A new user has registered on the eduMindSolutions platform:
        
        Email: {user.email}
        Username: {user.username}
        Full Name: {user.full_name or 'Not provided'}
        Role: {user.get_role_display()}
        Age: {user.age or 'Not provided'}
        Gender: {user.get_gender_display() if user.gender else 'Not provided'}
        Registration Date: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}
        Status: {'Approved' if user.is_approved else 'Pending Approval'}
        
        Bio: {user.bio or 'Not provided'}
        
        {'Professional Information:' if user.role == 'guide' else ''}
        {f'- Title: {user.professional_title}' if user.professional_title else ''}
        {f'- License: {user.license_number}' if user.license_number else ''}
        {f'- Experience: {user.years_experience} years' if user.years_experience else ''}
        
        Action Required: {'This user is pending approval. Please review and approve their account to grant access.' if not user.is_approved else 'User has been automatically approved.'}
        
        Review User: {context['admin_url']}
        """
        
        # Send email
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.ADMIN_EMAIL]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send()
        
        logger.info(f"User registration notification sent to admin for user: {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send user registration notification: {str(e)}")
        return False


def send_user_approval_notification(user):
    """
    Send email notification to user when their account is approved
    
    Args:
        user: User instance that was approved
    """
    try:
        subject = 'Welcome to eduMindSolutions - Your Account is Approved!'
        
        # HTML email content
        html_message = f"""
        <html>
        <body>
            <h2>Welcome to eduMindSolutions!</h2>
            <p>Dear {user.first_name or user.username},</p>
            
            <p>Great news! Your account has been approved and you now have full access to the eduMindSolutions platform.</p>
            
            <div style="background-color: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3>What you can do now:</h3>
                <ul>
                    <li>✅ Complete your profile and onboarding</li>
                    <li>✅ Take mental health assessments</li>
                    <li>✅ Join community discussions</li>
                    <li>✅ Access wellness resources</li>
                    <li>✅ Track your mood and progress</li>
                    {'<li>✅ Connect with peers for support</li>' if user.allow_peer_matching else ''}
                </ul>
            </div>
            
            <p>Your account details:</p>
            <ul>
                <li><strong>Email:</strong> {user.email}</li>
                <li><strong>Role:</strong> {user.get_role_display()}</li>
                <li><strong>Approved on:</strong> {user.approved_at.strftime('%Y-%m-%d %H:%M:%S') if user.approved_at else 'Recently'}</li>
            </ul>
            
            <p>
                <a href="{settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else '#'}" 
                   style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                   Access Your Account
                </a>
            </p>
            
            <p>If you have any questions or need support, please don't hesitate to reach out to our team.</p>
            
            <p>Welcome aboard!<br>
            The eduMindSolutions Team</p>
        </body>
        </html>
        """
        
        # Plain text version
        plain_message = f"""
        Welcome to eduMindSolutions!
        
        Dear {user.first_name or user.username},
        
        Great news! Your account has been approved and you now have full access to the eduMindSolutions platform.
        
        What you can do now:
        - Complete your profile and onboarding
        - Take mental health assessments
        - Join community discussions
        - Access wellness resources
        - Track your mood and progress
        {'- Connect with peers for support' if user.allow_peer_matching else ''}
        
        Your account details:
        - Email: {user.email}
        - Role: {user.get_role_display()}
        - Approved on: {user.approved_at.strftime('%Y-%m-%d %H:%M:%S') if user.approved_at else 'Recently'}
        
        Access your account: {settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else 'Visit our platform'}
        
        If you have any questions or need support, please don't hesitate to reach out to our team.
        
        Welcome aboard!
        The eduMindSolutions Team
        """
        
        # Send email
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send()
        
        logger.info(f"User approval notification sent to user: {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send user approval notification: {str(e)}")
        return False


def send_admin_user_approved_notification(user, approved_by):
    """
    Send notification to admin when a user is approved
    
    Args:
        user: User instance that was approved
        approved_by: Admin user who approved the account
    """
    try:
        subject = f'User Approved - {user.email}'
        
        html_message = f"""
        <html>
        <body>
            <h2>User Account Approved</h2>
            <p>The following user account has been approved:</p>
            
            <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
                <tr><td><strong>User:</strong></td><td>{user.email} ({user.full_name or user.username})</td></tr>
                <tr><td><strong>Role:</strong></td><td>{user.get_role_display()}</td></tr>
                <tr><td><strong>Approved by:</strong></td><td>{approved_by.email} ({approved_by.full_name or approved_by.username})</td></tr>
                <tr><td><strong>Approved on:</strong></td><td>{user.approved_at.strftime('%Y-%m-%d %H:%M:%S')}</td></tr>
            </table>
            
            <p>The user has been notified via email and can now access the platform.</p>
        </body>
        </html>
        """
        
        plain_message = f"""
        User Account Approved
        
        The following user account has been approved:
        
        User: {user.email} ({user.full_name or user.username})
        Role: {user.get_role_display()}
        Approved by: {approved_by.email} ({approved_by.full_name or approved_by.username})
        Approved on: {user.approved_at.strftime('%Y-%m-%d %H:%M:%S')}
        
        The user has been notified via email and can now access the platform.
        """
        
        # Send email
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.ADMIN_EMAIL]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send()
        
        logger.info(f"Admin notification sent for user approval: {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send admin user approval notification: {str(e)}")
        return False
