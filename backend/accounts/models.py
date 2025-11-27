from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('user', 'Standard User'),
        ('guide', 'Guide/Mentor'),
        ('admin', 'Administrator'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('non_binary', 'Non-binary'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]

    # Basic Information
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    # Profile Information for Mental Health Context
    age = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="User's age (optional)"
    )
    date_of_birth = models.DateField(
        null=True, blank=True,
        help_text="User's date of birth (optional)"
    )
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    bio = models.TextField(max_length=500, blank=True, help_text="Tell us a bit about yourself")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # Privacy & Preferences
    is_anonymous_preferred = models.BooleanField(
        default=True,
        help_text="Prefer anonymous interactions in community features"
    )
    allow_peer_matching = models.BooleanField(
        default=True,
        help_text="Allow matching with peers for support"
    )
    crisis_contact_phone = models.CharField(
        max_length=20, blank=True,
        help_text="Emergency contact number (optional)"
    )

    # Onboarding & Engagement
    onboarding_completed = models.BooleanField(default=False)
    last_mood_checkin = models.DateTimeField(null=True, blank=True)
    notification_preferences = models.JSONField(
        default=dict,
        help_text="User notification preferences"
    )

    # Professional Information (for guides/mentors)
    professional_title = models.CharField(max_length=200, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    specializations = models.JSONField(
        default=list,
        help_text="Areas of mental health specialization"
    )
    years_experience = models.PositiveIntegerField(null=True, blank=True)

    # System Fields
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True, help_text="Admin approval status")
    approved_at = models.DateTimeField(null=True, blank=True, help_text="When user was approved")
    approved_by = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, 
                                   related_name='approved_users', help_text="Admin who approved this user")
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_active = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'accounts_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def display_name(self):
        """Return appropriate display name based on privacy preferences"""
        # For chat messages, use context-specific anonymity instead of global preference
        return self.full_name or self.username or f"User {self.id}"

    def is_guide(self):
        """Check if user is a guide/mentor"""
        return self.role == 'guide'

    def is_standard_user(self):
        """Check if user is a standard platform user"""
        return self.role == 'user'

    def can_moderate(self):
        """Check if user can moderate community content"""
        return self.role in ['guide', 'admin'] or self.is_staff
    
    def approve_user(self, approved_by_user):
        """Approve user and activate their account"""
        self.is_approved = True
        self.is_active = True
        self.approved_at = timezone.now()
        self.approved_by = approved_by_user
        self.save(update_fields=['is_approved', 'is_active', 'approved_at', 'approved_by'])
