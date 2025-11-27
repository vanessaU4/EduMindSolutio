from rest_framework import permissions


class IsAdminOrGuide(permissions.BasePermission):
    """
    Custom permission to only allow admins and guides to modify questions.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to admins and guides
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role in ['admin', 'guide']
        )


class IsAdminOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role == 'admin'
        )


class IsGuideOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow guides and admins.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and
            request.user.role in ['guide', 'admin']
        )
