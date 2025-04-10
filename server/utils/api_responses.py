from rest_framework.response import Response
from rest_framework import status


class APIResponse:
    """
    Utility class to standardize API responses
    """
    @staticmethod
    def success(data=None, message=None, status_code=status.HTTP_200_OK, metadata=None):
        """
        Returns a standardized success response
        
        Args:
            data: Data to return
            message: Success message (optional)
            status_code: HTTP success code (default 200)
            metadata: Additional metadata (optional)
        """
        response_data = {
            "status": "success",
        }
        
        if data is not None:
            response_data["data"] = data
        
        if message:
            response_data["message"] = message
            
        if metadata:
            response_data["metadata"] = metadata
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(message=None, errors=None, status_code=status.HTTP_400_BAD_REQUEST, error_code=None):
        """
        Returns a standardized error response
        
        Args:
            message: Main error message
            errors: Error details (e.g., form validation)
            status_code: HTTP error code (default 400)
            error_code: Application-specific error code (optional)
        """
        response_data = {
            "status": "error",
        }
        
        if message:
            response_data["message"] = message
            
        if errors:
            response_data["errors"] = errors
            
        if error_code:
            response_data["error_code"] = error_code
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def format_serializer_errors(serializer_errors):
        """
        Formats serializer errors into a standardized format
        
        Args:
            serializer_errors: Serializer errors
            
        Returns:
            A dictionary of formatted errors
        """
        formatted_errors = {}
        for field, error_items in serializer_errors.items():
            # Handle different types of errors (list, dict, str, etc.)
            if isinstance(error_items, list) and error_items:
                # If it's a non-empty list, take the first element
                formatted_errors[field] = str(error_items[0])
            elif isinstance(error_items, dict):
                # If it's a dictionary, format it recursively
                formatted_errors[field] = APIResponse.format_serializer_errors(error_items)
            elif error_items:
                # If it's another non-empty type, convert it to string
                formatted_errors[field] = str(error_items)
            else:
                # Default value for cases where error_items is empty
                formatted_errors[field] = "Invalid data"
        return formatted_errors
    
    @staticmethod
    def paginated_response(data, paginator, request, message=None, metadata=None):
        """
        Returns a standardized paginated response
        
        Args:
            data: Serialized data
            paginator: Paginator instance
            request: HTTP request
            message: Success message (optional)
            metadata: Additional metadata (optional)
        """
        # Initialize pagination dictionary
        pagination_info = {}
        
        # Get total number of items (compatible with different paginator types)
        if hasattr(paginator, 'count'):
            # For LimitOffsetPagination
            pagination_info["count"] = paginator.count
        elif hasattr(paginator, 'page') and hasattr(paginator.page, 'paginator'):
            # For PageNumberPagination
            pagination_info["count"] = paginator.page.paginator.count
        else:
            # Default value if no method works
            pagination_info["count"] = len(data)
        
        # Get navigation links (compatible with different paginator types)
        if hasattr(paginator, 'get_next_link'):
            pagination_info["next"] = paginator.get_next_link()
            pagination_info["previous"] = paginator.get_previous_link()
        
        # Get page information (for PageNumberPagination)
        if hasattr(paginator, 'page_size'):
            pagination_info["page_size"] = paginator.page_size
        
        if hasattr(paginator, 'page'):
            if hasattr(paginator.page, 'paginator') and hasattr(paginator.page.paginator, 'num_pages'):
                pagination_info["total_pages"] = paginator.page.paginator.num_pages
            if hasattr(paginator.page, 'number'):
                pagination_info["current_page"] = paginator.page.number
                
        # For LimitOffsetPagination
        if hasattr(paginator, 'limit'):
            pagination_info["limit"] = paginator.limit
            pagination_info["offset"] = paginator.offset
        
        # Build response
        response_data = {
            "status": "success",
            "data": data,
            "pagination": pagination_info
        }
        
        if message:
            response_data["message"] = message
            
        if metadata:
            response_data["metadata"] = metadata
            
        return Response(response_data)


class ErrorCodeEnum:
    """
    Standardized error codes for the application
    """
    # Authentication errors (1000-1999)
    AUTHENTICATION_FAILED = 1000
    INVALID_CREDENTIALS = 1001
    TOKEN_EXPIRED = 1002
    TOKEN_INVALID = 1003
    USER_INACTIVE = 1004
    EMAIL_NOT_VERIFIED = 1005
    
    # Validation errors (2000-2999)
    VALIDATION_ERROR = 2000
    REQUIRED_FIELD_MISSING = 2001
    INVALID_FORMAT = 2002
    UNIQUE_CONSTRAINT_VIOLATED = 2003
    
    # Authorization errors (3000-3999)
    PERMISSION_DENIED = 3000
    INSUFFICIENT_PRIVILEGES = 3001
    OBJECT_OWNERSHIP_ERROR = 3002
    
    # Resource errors (4000-4999)
    RESOURCE_NOT_FOUND = 4000
    RESOURCE_ALREADY_EXISTS = 4001
    RESOURCE_IN_USE = 4002
    
    # System errors (5000-5999)
    SYSTEM_ERROR = 5000
    DATABASE_ERROR = 5001
    EXTERNAL_SERVICE_ERROR = 5002
    OPERATION_FAILED = 5003
    
    # Business-specific errors (10000+)
    DEVICE_OFFLINE = 10000
    SCENARIO_EXECUTION_FAILED = 10001
    INVALID_DEVICE_COMMAND = 10002
    AUTOMATION_RULE_CONFLICT = 10003 