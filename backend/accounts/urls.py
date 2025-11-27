
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    LoginView, RegisterView, LogoutView, UserProfileView, UserDetailView, OnboardingView,
    UserListView, ClientListView, PasswordResetRequestView, PasswordResetConfirmView,
    AdminStatsView, AdminUserListView, AdminUserDetailView, debug_user_info,
    update_mood_checkin, AvailableSupportersView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User Profile Management
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('onboarding/', OnboardingView.as_view(), name='user-onboarding'),
    path('mood-checkin/', update_mood_checkin, name='mood-checkin'),

    # User Lists (for community features)
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/supporters/', AvailableSupportersView.as_view(), name='available-supporters'),
    path('clients/', ClientListView.as_view(), name='client-list'),
    
    # Admin User Management
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    
    # Debug endpoint
    path('debug/', debug_user_info, name='debug-user-info'),
]
