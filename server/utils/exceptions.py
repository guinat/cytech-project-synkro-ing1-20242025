from rest_framework.exceptions import APIException
from rest_framework import status
from .api_responses import ErrorCodeEnum


class AppBaseException(APIException):
    """Base exception for all application exceptions"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "An error has occurred."
    default_code = ErrorCodeEnum.SYSTEM_ERROR
    
    def __init__(self, detail=None, code=None, status_code=None):
        if status_code:
            self.status_code = status_code
        if not detail:
            detail = self.default_detail
        if not code:
            code = self.default_code
        self.detail = {'message': detail, 'error_code': code}


class ResourceNotFoundException(AppBaseException):
    """Exception raised when a resource is not found"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "The requested resource was not found."
    default_code = ErrorCodeEnum.RESOURCE_NOT_FOUND


class ValidationException(AppBaseException):
    """Exception raised for validation errors"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Data validation error."
    default_code = ErrorCodeEnum.VALIDATION_ERROR
    
    def __init__(self, detail=None, code=None, errors=None):
        super().__init__(detail, code, self.status_code)
        if errors:
            self.detail['errors'] = errors


class PermissionDeniedException(AppBaseException):
    """Exception raised for permission issues"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have permission to perform this action."
    default_code = ErrorCodeEnum.PERMISSION_DENIED


class AuthenticationException(AppBaseException):
    """Exception raised for authentication issues"""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Authentication required."
    default_code = ErrorCodeEnum.AUTHENTICATION_FAILED


class BusinessLogicException(AppBaseException):
    """Exception raised for business logic errors"""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = "Unable to process this request."
    default_code = ErrorCodeEnum.SYSTEM_ERROR


class DeviceOfflineException(BusinessLogicException):
    """Exception raised when a device is offline"""
    default_detail = "The device is currently offline."
    default_code = ErrorCodeEnum.DEVICE_OFFLINE


class ScenarioExecutionException(BusinessLogicException):
    """Exception raised when a scenario execution fails"""
    default_detail = "The scenario execution has failed."
    default_code = ErrorCodeEnum.SCENARIO_EXECUTION_FAILED


class OperationFailedException(BusinessLogicException):
    """Exception raised when a system operation fails"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "The system operation has failed."
    default_code = ErrorCodeEnum.OPERATION_FAILED 