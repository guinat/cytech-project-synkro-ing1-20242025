from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsHomeOwner(permissions.BasePermission):
    
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsHomeMember(permissions.BasePermission):

    
    def has_permission(self, request, view):
        home_pk = view.kwargs.get('home_pk')
        if home_pk:
            from homes.models import Home
            
            try:
                home = Home.objects.get(id=home_pk) 
                return request.user in home.members.all()
            except Home.DoesNotExist:
                return False
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'members'):
            home = obj
        elif hasattr(obj, 'home'):
            home = obj.home
        elif hasattr(obj, 'room') and hasattr(obj.room, 'home'):
            home = obj.room.home
        else:
            return False
        
        if not home:
            return False
        return request.user in home.members.all()


class IsHomeOwnerOrMember(permissions.BasePermission):
    def has_permission(self, request, view):
        home_pk = view.kwargs.get('home_pk')
        if home_pk:
            from homes.models import Home
            try:
                home = Home.objects.get(id=home_pk)
                return (request.user == home.owner) or (request.user in home.members.all())
            except Home.DoesNotExist:
                return False
        return True

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'members') and hasattr(obj, 'owner'):
            home = obj
        elif hasattr(obj, 'home') and hasattr(obj.home, 'owner'):
            home = obj.home
        elif hasattr(obj, 'room') and hasattr(obj.room, 'home') and hasattr(obj.room.home, 'owner'):
            home = obj.room.home
        else:
            return False
        if not home:
            return False
        return (request.user == home.owner) or (request.user in home.members.all())


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return hasattr(obj, 'owner') and obj.owner == request.user


class ReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS 