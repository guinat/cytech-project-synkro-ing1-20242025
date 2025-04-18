from rest_framework import permissions



class IsAdminUser(permissions.BasePermission):
    """
    Permission allowing full access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or 
            (hasattr(request.user, 'role') and request.user.role == 'admin')
        )


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

class IsHomeMember(permissions.BasePermission):
    """
    Permission to verify that the user is a member of the home
    """
    def has_object_permission(self, request, view, obj):
        return IsHomeOwnerOrMember().has_object_permission(request, view, obj)

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

class IsHomeOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to verify that the user is either the owner of the home
    or an administrator.
    """
    def has_object_permission(self, request, view, obj):
        # Check first if the user is an administrator
        if request.user.is_superuser or (hasattr(request.user, 'role') and request.user.role == 'admin'):
            return True
        
        # If the object is an instance of Home, check directly if the user is the owner
        from devices.models import Home
        if isinstance(obj, Home):
            return obj.owner == request.user
        
        # Otherwise, check via IsHomeOwnerOrMember
        return IsHomeOwnerOrMember().has_object_permission(request, view, obj)


class IsComplexOrAdminUser(permissions.BasePermission):
    """
    Permission allowing complex users and admin users to perform certain actions.
    Complex users are users with the 'intermediate', 'advanced', or 'expert' level.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin users always have permission
        if request.user.role == 'admin':
            return True
        
        # Complex users (defined by level) have permission for safe methods and POST but not DELETE
        complex_levels = ['intermediate', 'advanced', 'expert']
        if request.user.level in complex_levels:
            if request.method == 'DELETE':
                return False
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


class ReadOnly(permissions.BasePermission):
    """
    Permission allowing read-only access to authenticated users
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS and request.user.is_authenticated


# Device-specific permissions

class DeviceAccessPermission(permissions.BasePermission):
    """
    Permission class for device-related views
    - Admin users can perform all operations
    - Home owners can create, update, and view devices in their own homes
    - Complex users (intermediate, advanced, expert) can view, create, and update devices
    - Simple users (beginner) can only view devices
    - Device owners can update their own devices
    """
    def has_permission(self, request, view):
        """return request.user.is_authenicated """ # Autorise tout utilisateur connecté, a supprimer après test

        # Ensure user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin users can do everything
        if request.user.role == 'admin':
            return True
        
        # For safe methods (GET, HEAD, OPTIONS), all authenticated users have permission
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For POST (create), check if user is complex or home owner
        if request.method == 'POST':
            # Allow if the user is creating a device for a home they own
            if 'home' in request.data:
                from devices.models import Home
                try:
                    home_id = int(request.data.get('home'))
                    home = Home.objects.get(id=home_id)
                    if home.owner == request.user:
                        return True
                except (ValueError, Home.DoesNotExist):
                    pass
            
            # Or if they have a complex level
            return request.user.level in ['intermediate', 'advanced', 'expert']
        
        # For other methods (PUT, PATCH, DELETE), permission will be checked at object level
        return True
    
    def has_object_permission(self, request, view, obj):
        # Admin users can do everything
        if request.user.role == 'admin':
            return True
        
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Home owners can update devices in their homes
        if obj.home and obj.home.owner == request.user:
            return True
        
        # Only complex users and above can update, and only their own devices
        if request.method in ['PUT', 'PATCH']:
            is_complex = request.user.level in ['intermediate', 'advanced', 'expert']
            is_owner = obj.owner == request.user
            return is_complex and is_owner
        
        # Only admin users can delete
        if request.method == 'DELETE':
            return request.user.role == 'admin'
        
        return False


class DeviceDataPermission(permissions.BasePermission):
    """
    Permission class for device data views
    - All authenticated users can view data
    - Only the device or admin can create data points
    - Only admin can update or delete data points
    """
    def has_permission(self, request, view):
        # Ensure user is authenticated
        if not request.user or not request.user.is_authenticated:
            return True  # We'll further check in has_object_permission for non-GET methods
        
        # Admin users can do everything
        if request.user.role == 'admin':
            return True
        
        # Only safe methods allowed for non-admin users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Further permission checks at object level
        return True
    
    def has_object_permission(self, request, view, obj):
        # Admin users can do everything
        if request.user.role == 'admin':
            return True
        
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For update and delete, only admin
        return False


class DeviceCommandPermission(permissions.BasePermission):
    """
    Permission class for device command views
    - Admin users can send commands to any device
    - Complex users can send commands to their own devices
    - Simple users can only view command history
    """
    def has_permission(self, request, view):
        # Ensure user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin users can do everything
        if request.user.role == 'admin':
            return True
        
        # For safe methods (GET, HEAD, OPTIONS), all authenticated users have permission
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For POST (create command), only complex users and above
        if request.method == 'POST':
            return request.user.level in ['intermediate', 'advanced', 'expert']
        
        # No other actions permitted
        return False
    
    def has_object_permission(self, request, view, obj):
        # Admin users can do everything
        if request.user.role == 'admin':
            return True
        
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For update and delete, only admin
        return False 