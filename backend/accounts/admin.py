from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'full_name', 'role', 'is_approved', 'is_active', 'date_joined', 'approval_actions']
    list_filter = ['role', 'is_approved', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    readonly_fields = ['date_joined', 'last_active', 'approved_at', 'approved_by']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('username', 'first_name', 'last_name', 'role', 'age', 'gender', 'bio')}),
        (_('Profile'), {'fields': ('avatar', 'is_anonymous_preferred', 'allow_peer_matching', 'crisis_contact_phone')}),
        (_('Professional Info'), {'fields': ('professional_title', 'license_number', 'specializations', 'years_experience')}),
        (_('Approval Status'), {'fields': ('is_approved', 'approved_at', 'approved_by')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined', 'last_active')}),
        (_('Preferences'), {'fields': ('notification_preferences', 'onboarding_completed', 'last_mood_checkin')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role'),
        }),
    )

    actions = ['approve_users', 'deactivate_users', 'activate_users']

    def approval_actions(self, obj):
        """Display approval action buttons"""
        if not obj.is_approved:
            approve_url = reverse('admin:approve_user', args=[obj.pk])
            return format_html(
                '<a class="button" href="{}">Approve User</a>',
                approve_url
            )
        else:
            return format_html(
                '<span style="color: green;">✓ Approved</span> ({})',
                obj.approved_at.strftime('%Y-%m-%d') if obj.approved_at else 'Unknown'
            )
    approval_actions.short_description = 'Approval Actions'
    approval_actions.allow_tags = True

    def approve_users(self, request, queryset):
        """Bulk approve users"""
        approved_count = 0
        for user in queryset.filter(is_approved=False):
            user.approve_user(request.user)
            approved_count += 1
        
        self.message_user(request, f'{approved_count} users were successfully approved.')
    approve_users.short_description = "Approve selected users"

    def deactivate_users(self, request, queryset):
        """Bulk deactivate users"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users were deactivated.')
    deactivate_users.short_description = "Deactivate selected users"

    def activate_users(self, request, queryset):
        """Bulk activate users (only approved users)"""
        updated = queryset.filter(is_approved=True).update(is_active=True)
        self.message_user(request, f'{updated} approved users were activated.')
    activate_users.short_description = "Activate selected approved users"

    def get_urls(self):
        """Add custom URLs for user approval"""
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:user_id>/approve/',
                self.admin_site.admin_view(self.approve_user_view),
                name='approve_user',
            ),
        ]
        return custom_urls + urls

    def approve_user_view(self, request, user_id):
        """Custom view to approve a single user"""
        from django.shortcuts import get_object_or_404, redirect
        from django.contrib import messages
        
        user = get_object_or_404(User, pk=user_id)
        if not user.is_approved:
            user.approve_user(request.user)
            messages.success(request, f'User {user.email} has been approved successfully.')
        else:
            messages.info(request, f'User {user.email} is already approved.')
        
        return redirect('admin:accounts_user_changelist')

admin.site.register(User, UserAdmin)
