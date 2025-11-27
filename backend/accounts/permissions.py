from rest_framework import permissions

class IsGuideOrAdmin(permissions.BasePermission):
    """
    Permission class that allows access only to guides and admins
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_guide() or request.user.is_staff or request.user.role == 'admin')
        )

class IsStandardUser(permissions.BasePermission):
    """
    Permission class that allows access only to standard users
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_standard_user()
        )

class IsOwnerOrGuide(permissions.BasePermission):
    """
    Permission class that allows access to object owner or guides
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for guides
        if request.user.is_guide() or request.user.is_staff:
            return True
        
        # Write permissions only to the owner
        return obj.user == request.user if hasattr(obj, 'user') else obj == request.user

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows read access to all authenticated users,
    but write access only to the owner
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions only to the owner
        return obj.user == request.user if hasattr(obj, 'user') else obj == request.user

class CanModerate(permissions.BasePermission):
    """
    Permission class for content moderation
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.can_moderate()
        )

class IsAdultUser(permissions.BasePermission):
    """
    Permission class that requires user to be 18+ for certain features
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.age and 
            request.user.age >= 18
        )

class HasCompletedOnboarding(permissions.BasePermission):
    """
    Permission class that requires completed onboarding
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.onboarding_completed
        )
