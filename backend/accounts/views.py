
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    LoginSerializer, RegisterSerializer, UserSerializer,
    UserProfileSerializer, GuideProfileSerializer, UserPublicSerializer,
    OnboardingSerializer
)
from .models import User
from django.db.models import Count, Q
from datetime import datetime, timedelta

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(APIView):
    def post(self, request):
        try:
            if not request.data:
                return Response({
                    "detail": "No data provided",
                    "code": "no_data",
                    "errors": None
                }, status=status.HTTP_400_BAD_REQUEST)

            email = request.data.get('email')
            username = request.data.get('username')

            # Validate required fields
            if not email:
                return Response({
                    "detail": "Email is required",
                    "code": "email_required",
                    "errors": {"email": ["This field is required."]}
                }, status=status.HTTP_400_BAD_REQUEST)

            if not username:
                return Response({
                    "detail": "Username is required",
                    "code": "username_required",
                    "errors": {"username": ["This field is required."]}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if email or username already exists
            if User.objects.filter(email=email).exists():
                return Response({
                    "detail": "An account with this email already exists",
                    "code": "email_exists",
                    "errors": {"email": ["This email is already registered."]}
                }, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(username=username).exists():
                return Response({
                    "detail": "An account with this username already exists",
                    "code": "username_exists",
                    "errors": {"username": ["This username is already taken."]}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate and save the new user
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                user.is_active = True
                user.is_approved = True
                user.save()
                
                # Send welcome notification to user
                from notifications.utils import notify_user_registration, create_notification
                notify_user_registration(user)
                
                # Notify all admins about new user registration
                try:
                    UserModel = get_user_model()
                    admins = UserModel.objects.filter(role='admin', is_active=True)
                    for admin in admins:
                        create_notification(
                            user=admin,
                            notification_type='user_registration',
                            title='New User Registered',
                            message=f'New user {user.first_name} {user.last_name} ({user.email}) has registered.',
                            priority='medium',
                            action_url='/admin/users',
                            action_text='View Users'
                        )
                except Exception as e:
                    print(f'Notification error: {e}')
                
                return Response({
                    "detail": "Account created successfully",
                    "code": "success",
                    "user": serializer.data
                }, status=status.HTTP_201_CREATED)

            # Return serializer validation errors
            return Response({
                "detail": "Invalid registration data",
                "code": "validation_error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Log the error here
            print(f"Registration error: {str(e)}")
            return Response({
                "detail": "An error occurred during registration",
                "code": "server_error",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class LoginView(APIView):
    def post(self, request):
        try:
            if not request.data:
                return Response({
                    "detail": "No data provided",
                    "code": "no_data"
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = LoginSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    "detail": "Invalid email or password",
                    "code": "invalid_credentials",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            user = serializer.validated_data
            
            if not user.is_active:
                return Response({
                    "detail": "Account is disabled",
                    "code": "account_disabled"
                }, status=status.HTTP_403_FORBIDDEN)

            tokens = get_tokens_for_user(user)
            user_serializer = UserSerializer(user)

            return Response({
                "detail": "Login successful",
                "code": "success",
                "token": tokens,
                "user": user_serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "detail": "An error occurred during login",
                "code": "server_error",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    """Logout user - for JWT, logout is typically handled client-side by removing tokens"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # For JWT authentication, logout is typically handled on the client side
        # by removing the tokens from storage. This endpoint confirms the logout.
        return Response({
            "detail": "Successfully logged out. Please remove tokens from client storage."
        }, status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.user.is_guide():
            return GuideProfileSerializer
        return UserProfileSerializer

class UserDetailView(generics.RetrieveAPIView):
    """Get current user details"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class OnboardingView(APIView):
    """Complete user onboarding"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OnboardingSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(onboarding_completed=True)
            return Response({
                "detail": "Onboarding completed successfully.",
                "user": UserSerializer(request.user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    """List users for community features (guides only)"""
    serializer_class = UserPublicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only guides can see user lists
        if not self.request.user.is_guide() and not self.request.user.is_staff:
            return User.objects.none()
        return User.objects.filter(is_active=True)

class ClientListView(generics.ListAPIView):
    """List clients (users with role 'user') for guides and admins"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only guides and admins can see client lists
        if not (self.request.user.is_guide() or self.request.user.role == 'admin' or self.request.user.is_staff):
            return User.objects.none()
        return User.objects.filter(role='user', is_active=True).order_by('first_name', 'last_name')

class AdminUserListView(generics.ListCreateAPIView):
    """Admin view for managing all users"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only admins can see all users
        if not (self.request.user.role == 'admin' or self.request.user.is_staff):
            return User.objects.none()
        return User.objects.all().order_by('-date_joined')
    
    def perform_create(self, serializer):
        # Only admins can create users
        if not (self.request.user.role == 'admin' or self.request.user.is_staff):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only admins can create users")
        serializer.save()


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view for managing individual users"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only admins can manage users
        if not (self.request.user.role == 'admin' or self.request.user.is_staff):
            return User.objects.none()
        return User.objects.all()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_user_info(request):
    """Debug endpoint to check user permissions and data"""
    user = request.user
    total_users = User.objects.count()
    
    return Response({
        "current_user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        },
        "permissions": {
            "can_see_admin_users": user.role == 'admin' or user.is_staff,
            "can_moderate": user.can_moderate(),
            "is_guide": user.is_guide(),
        },
        "database_stats": {
            "total_users": total_users,
            "admin_users": User.objects.filter(role='admin').count(),
            "guide_users": User.objects.filter(role='guide').count(),
            "regular_users": User.objects.filter(role='user').count(),
            "active_users": User.objects.filter(is_active=True).count(),
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_mood_checkin(request):
    """Update user's last mood check-in timestamp"""
    user = request.user
    user.last_mood_checkin = timezone.now()
    user.save(update_fields=['last_mood_checkin'])

    return Response({
        "detail": "Mood check-in updated successfully.",
        "last_mood_checkin": user.last_mood_checkin
    }, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    """Request password reset email"""

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({
                "detail": "Email address is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, is_active=True)

            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Create reset link (in production, use your domain)
            reset_link = f"http://localhost:3001/reset-password/{uid}/{token}/"

            # Send email (in development, just log it)
            subject = "EduMindSolutions - Password Reset Request"
            message = f"""
            Hello {user.first_name},

            You have requested a password reset for your EduMindSolutions account.

            Click the link below to reset your password:
            {reset_link}

            This link will expire in 1 hour for security reasons.

            If you did not request this password reset, please ignore this email.

            Best regards,
            EduMindSolutions Healthcare Team
            """

            # In development, print to console
            print(f"Password reset email for {email}:")
            print(f"Reset link: {reset_link}")

            # In production, uncomment this:
            # send_mail(
            #     subject,
            #     message,
            #     settings.DEFAULT_FROM_EMAIL,
            #     [email],
            #     fail_silently=False,
            # )

            return Response({
                "detail": "Password reset email sent successfully."
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({
                "detail": "Password reset email sent successfully."
            }, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    """Confirm password reset with token"""

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([uid, token, new_password]):
            return Response({
                "detail": "UID, token, and new password are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)

            # Verify token
            if default_token_generator.check_token(user, token):
                # Set new password
                user.set_password(new_password)
                user.save()

                return Response({
                    "detail": "Password reset successfully."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "detail": "Invalid or expired reset token."
                }, status=status.HTTP_400_BAD_REQUEST)

        except (User.DoesNotExist, ValueError, TypeError):
            return Response({
                "detail": "Invalid reset link."
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminStatsView(APIView):
    """
    Admin dashboard statistics endpoint
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is admin
        if not request.user.is_staff and request.user.role != 'admin':
            return Response({
                'error': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Calculate user statistics
        total_users = User.objects.count()
        
        # Active users (logged in within last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_users = User.objects.filter(last_login__gte=thirty_days_ago).count()
        
        # Total guides
        total_guides = User.objects.filter(role='guide').count()
        
        # New users this month
        first_day_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_this_month = User.objects.filter(date_joined__gte=first_day_of_month).count()
        
        # User role distribution
        role_distribution = User.objects.values('role').annotate(count=Count('role'))
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'total_guides': total_guides,
            'new_users_this_month': new_users_this_month,
            'role_distribution': list(role_distribution),
            'user_growth': {
                'current_month': new_users_this_month,
                'previous_month': User.objects.filter(
                    date_joined__gte=first_day_of_month - timedelta(days=30),
                    date_joined__lt=first_day_of_month
                ).count()
            }
        }, status=status.HTTP_200_OK)


class AvailableSupportersView(APIView):
    """Get available users who can provide peer support"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Only admin and guide users can access this endpoint
        if not hasattr(request.user, 'role') or request.user.role not in ['admin', 'guide']:
            return Response({'error': 'Admin or Guide access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get users who are available for peer support
        # Filter users who have opted in for peer matching and are not the current requester
        available_supporters = User.objects.filter(
            allow_peer_matching=True,
            is_active=True
        ).exclude(
            id=request.user.id
        ).select_related().order_by('first_name', 'last_name')
        
        # Format the response to match frontend expectations
        supporters_data = []
        for user in available_supporters:
            # Get user's preferred topics from their profile or set defaults
            available_topics = []
            if hasattr(user, 'preferred_support_topics') and user.preferred_support_topics:
                available_topics = user.preferred_support_topics
            else:
                # Default topics based on user role or general support
                if user.role == 'guide':
                    available_topics = ['anxiety', 'depression', 'stress', 'academic', 'relationships']
                else:
                    available_topics = ['general', 'peer-support']
            
            # Determine experience level
            experience_level = 'Peer'
            if user.role == 'guide':
                experience_level = 'Professional Guide'
            elif user.role == 'admin':
                experience_level = 'Administrator'
            
            # Format availability
            availability = 'Available for matching'
            if hasattr(user, 'availability_schedule') and user.availability_schedule:
                availability = user.availability_schedule
            
            supporters_data.append({
                'id': user.id,
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'age_range': getattr(user, 'age_range', None) or f"{user.age}-{user.age+5}" if user.age else 'Not specified',
                'gender': getattr(user, 'gender', None) or 'Not specified',
                'available_topics': available_topics,
                'experience_level': experience_level,
                'availability': availability,
                'role': user.role
            })
        
        return Response(supporters_data, status=status.HTTP_200_OK)