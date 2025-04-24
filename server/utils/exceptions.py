from rest_framework.exceptions import APIException
from rest_framework import status


class ResourceNotFoundError(APIException):
    
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "The requested resource was not found."
    default_code = "resource_not_found"


class ValidationError(APIException):
    
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = "Invalid input data."
    default_code = "validation_error"


class AuthenticationError(APIException):
    
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Authentication failed."
    default_code = "authentication_error"


class PermissionDeniedError(APIException):
    
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have permission to perform this action."
    default_code = "permission_denied"


class ServiceUnavailableError(APIException):
    
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "The service is currently unavailable. Please try again later."
    default_code = "service_unavailable"


class BusinessLogicError(APIException):
    
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Unable to complete the requested operation."
    default_code = "business_logic_error" 