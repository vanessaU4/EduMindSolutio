from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={
            'required': 'Password is required',
            'min_length': 'Password must be at least 8 characters long'
        }
    )
    confirm_password = serializers.CharField(
        write_only=True,
        error_messages={'required': 'Please confirm your password'}
    )

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'confirm_password',
            'first_name', 'last_name', 'role', 'age', 'date_of_birth', 'gender', 'bio',
            'is_anonymous_preferred', 'allow_peer_matching', 'crisis_contact_phone',
            'professional_title', 'license_number', 'specializations', 'years_experience'
        ]
        extra_kwargs = {
            'email': {
                'required': True,
                'error_messages': {
                    'required': 'Email is required',
                    'invalid': 'Please enter a valid email address'
                }
            },
            'username': {
                'required': True,
                'error_messages': {
                    'required': 'Username is required'
                }
            },
            'age': {'required': False},
            'date_of_birth': {'required': False},
            'professional_title': {'required': False},
            'license_number': {'required': False},
            'specializations': {'required': False},
            'years_experience': {'required': False},
        }

    def validate_email(self, value):
        try:
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError({
                    "detail": "This email is already registered",
                    "code": "email_exists"
                })
            return value
        except Exception as e:
            raise serializers.ValidationError({
                "detail": "Email validation failed",
                "code": "email_validation_error",
                "error": str(e)
            })

    def validate_username(self, value):
        try:
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError({
                    "detail": "This username is already taken",
                    "code": "username_exists"
                })
            return value
        except Exception as e:
            raise serializers.ValidationError({
                "detail": "Username validation failed",
                "code": "username_validation_error",
                "error": str(e)
            })

    def validate_role(self, value):
        valid_roles = ['user', 'guide', 'admin']
        if value not in valid_roles:
            raise serializers.ValidationError({
                "detail": f"Role must be one of: {', '.join(valid_roles)}",
                "code": "invalid_role"
            })
        return value


    def validate(self, data):
        try:
            if data.get('password') != data.get('confirm_password'):
                raise serializers.ValidationError({
                    "detail": "Passwords do not match",
                    "code": "passwords_mismatch"
                })

            # Validate guide-specific fields
            if data.get('role') == 'guide':
                if not data.get('professional_title'):
                    raise serializers.ValidationError({
                        "detail": "Professional title is required for guides",
                        "code": "missing_professional_title"
                    })
                if not data.get('years_experience'):
                    raise serializers.ValidationError({
                        "detail": "Years of experience is required for guides",
                        "code": "missing_years_experience"
                    })

            return data
        except serializers.ValidationError:
            raise
        except Exception as e:
            raise serializers.ValidationError({
                "detail": "Validation failed",
                "code": "validation_error",
                "error": str(e)
            })

    def create(self, validated_data):
        try:
            validated_data.pop('confirm_password')
            password = validated_data.pop('password')
            user = User(**validated_data)
            user.set_password(password)
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError({
                "detail": "Failed to create user",
                "code": "user_creation_failed",
                "error": str(e)
            })


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={
        'required': 'Email is required',
        'invalid': 'Please enter a valid email address'
    })
    password = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={'required': 'Password is required'}
    )

    def validate(self, data):
        try:
            user = authenticate(email=data['email'], password=data['password'])
            if not user:
                raise serializers.ValidationError({
                    "detail": "Invalid email or password",
                    "code": "invalid_credentials"
                })
            if not user.is_active:
                raise serializers.ValidationError({
                    "detail": "Account is disabled",
                    "code": "account_disabled"
                })
            return user
        except Exception as e:
            raise serializers.ValidationError({
                "detail": "Login failed",
                "code": "login_failed",
                "error": str(e)
            })
    
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    display_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name', 'display_name',
            'role', 'age', 'date_of_birth', 'gender', 'bio', 'avatar', 'is_anonymous_preferred',
            'allow_peer_matching', 'onboarding_completed', 'last_mood_checkin',
            'professional_title', 'license_number', 'specializations', 'years_experience',
            'is_active', 'date_joined', 'last_active'
        ]
        read_only_fields = ['id', 'date_joined', 'last_active', 'full_name', 'display_name']

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates"""

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'age', 'bio', 'avatar', 'gender',
            'is_anonymous_preferred', 'allow_peer_matching', 'crisis_contact_phone',
            'notification_preferences'
        ]

class GuideProfileSerializer(serializers.ModelSerializer):
    """Serializer for guide/mentor profile updates"""

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'avatar', 'professional_title',
            'license_number', 'specializations', 'years_experience'
        ]

class UserPublicSerializer(serializers.ModelSerializer):
    """Public user information for community features"""
    display_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'display_name', 'role', 'avatar', 'bio', 'specializations']

class OnboardingSerializer(serializers.ModelSerializer):
    """Serializer for completing user onboarding"""

    class Meta:
        model = User
        fields = [
            'age', 'gender', 'bio', 'is_anonymous_preferred', 'allow_peer_matching',
            'crisis_contact_phone', 'notification_preferences', 'onboarding_completed'
        ]

