from rest_framework.response import Response
from rest_framework import status
from .api_responses import APIResponse


class APIResponseMixin:
    """
    Mixin that adds standardized API response methods
    """
    
    def success_response(self, data=None, message=None, status_code=status.HTTP_200_OK, metadata=None):
        """Returns a standardized success response"""
        return APIResponse.success(data, message, status_code, metadata)
    
    def error_response(self, message=None, errors=None, status_code=status.HTTP_400_BAD_REQUEST, error_code=None):
        """Returns a standardized error response"""
        return APIResponse.error(message, errors, status_code, error_code)
    
    def format_serializer_errors(self, serializer_errors):
        """Formats serializer errors"""
        return APIResponse.format_serializer_errors(serializer_errors)
    
    def paginated_response(self, data, paginator, request, message=None, metadata=None):
        """Returns a standardized paginated response"""
        return APIResponse.paginated_response(data, paginator, request, message, metadata)


class OwnershipFilterMixin:
    """
    Mixin to filter objects based on ownership (current user)
    """
    owner_field = 'owner'  # Default field for ownership
    
    def get_queryset(self):
        """Filters the queryset to return only objects owned by the current user"""
        queryset = super().get_queryset()
        
        # If user is admin, return all objects
        if hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return queryset
        
        # Otherwise, filter by owner
        filter_kwargs = {self.owner_field: self.request.user}
        return queryset.filter(**filter_kwargs)


class DynamicSerializerMixin:
    """
    Mixin to dynamically choose the serializer based on the action
    """
    serializer_class_mapping = {}  # To be replaced in child classes
    
    def get_serializer_class(self):
        """Returns the appropriate serializer class based on the current action"""
        if self.action in self.serializer_class_mapping:
            return self.serializer_class_mapping[self.action]
        return super().get_serializer_class()


class LoggingMixin:
    """
    Mixin to add logging capabilities to views
    """
    
    def log_action(self, action, message=None, **kwargs):
        """Logs an action with additional metadata"""
        log_data = {
            'action': action,
            'user_id': self.request.user.id if self.request.user.is_authenticated else None,
            'path': self.request.path,
            'method': self.request.method,
        }
        
        if message:
            log_data['message'] = message
            
        log_data.update(kwargs)
        
        # Use appropriate level based on severity
        severity = kwargs.get('severity', 'info')
        if severity == 'error':
            self.logger.error(log_data)
        elif severity == 'warning':
            self.logger.warning(log_data)
        else:
            self.logger.info(log_data)
            
    @property
    def logger(self):
        """Returns the logger instance"""
        import logging
        return logging.getLogger('api_views') 