from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permission for administrators.
    """
    def has_permission(self, request, view):
        return request.user.is_superuser or (hasattr(request.user, 'role') and request.user.role == 'admin')


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to verify that the user is either the owner of the object
    or an administrator.
    """
    owner_field = 'owner'
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or (hasattr(request.user, 'role') and request.user.role == 'admin'):
            return True
            
        # Check if object has owner field
        if hasattr(obj, self.owner_field):
            owner = getattr(obj, self.owner_field)
            return owner == request.user
            
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission to allow read operations to all users,
    but restrict modifications to the object's owner.
    """
    owner_field = 'owner'
    
    def has_object_permission(self, request, view, obj):
        # Allow GET, HEAD or OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check if user is administrator
        if request.user.is_superuser or (hasattr(request.user, 'role') and request.user.role == 'admin'):
            return True
            
        # Check if object has owner field
        if hasattr(obj, self.owner_field):
            owner = getattr(obj, self.owner_field)
            return owner == request.user
            
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission to allow read operations to all users,
    but restrict modifications to administrators.
    """
    def has_permission(self, request, view):
        # Allow GET, HEAD or OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check if user is administrator
        return request.user.is_superuser or (hasattr(request.user, 'role') and request.user.role == 'admin')


class IsHomeOwnerOrMember(permissions.BasePermission):
    """
    Permission to verify that the user is either the owner or a member
    of the home associated with the object.
    """
    home_field = 'home'
    
    def has_object_permission(self, request, view, obj):
        # If user is administrator
        if request.user.is_superuser or (hasattr(request.user, 'role') and request.user.role == 'admin'):
            return True
            
        # Check if object has home field
        if hasattr(obj, self.home_field):
            home = getattr(obj, self.home_field)
            
            # Check if user is home owner
            if home.owner == request.user:
                return True
                
            # Check if user is home member
            if hasattr(home, 'members') and request.user in home.members.all():
                return True
                
        return False


class IsUserComplexOrAbove(permissions.BasePermission):
    """
    Permission to verify that the user has at least the 'complex' role.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role in ['complex', 'admin']
        )


class IsUserSimpleOrAbove(permissions.BasePermission):
    """
    Permission to verify that the user has at least the 'simple' role.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role in ['simple', 'complex', 'admin']
        ) 