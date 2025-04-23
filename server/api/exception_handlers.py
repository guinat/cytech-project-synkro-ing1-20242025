from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from utils.exceptions import (
    ResourceNotFoundError,
    ValidationError,
    AuthenticationError,
    PermissionDeniedError,
    ServiceUnavailableError,
    BusinessLogicError
)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is None:
        if isinstance(exc, Exception):
            return Response(
                {
                    "status": "error",
                    "message": str(exc),
                    "errors": []
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return None
    
    error_data = {
        "status": "error",
        "message": "An error occurred",
        "errors": []
    }
    
    if hasattr(exc, 'detail'):
        if isinstance(exc.detail, str):
            error_data["message"] = exc.detail
        elif isinstance(exc.detail, dict):
            error_data["message"] = "Validation error"
            error_data["errors"] = exc.detail
        elif isinstance(exc.detail, list):
            error_data["message"] = "Multiple errors occurred"
            error_data["errors"] = exc.detail
    
    if isinstance(exc, ResourceNotFoundError):
        error_data["message"] = exc.default_detail if not error_data["message"] else error_data["message"]
    elif isinstance(exc, ValidationError):
        error_data["message"] = exc.default_detail if not error_data["message"] else error_data["message"]
    elif isinstance(exc, AuthenticationError):
        error_data["message"] = exc.default_detail if not error_data["message"] else error_data["message"]
    elif isinstance(exc, PermissionDeniedError):
        error_data["message"] = exc.default_detail if not error_data["message"] else error_data["message"]
    elif isinstance(exc, ServiceUnavailableError):
        error_data["message"] = exc.default_detail if not error_data["message"] else error_data["message"]
    elif isinstance(exc, BusinessLogicError):
        error_data["message"] = exc.default_detail if not error_data["message"] else error_data["message"]
    
    response.data = error_data
    
    return response 