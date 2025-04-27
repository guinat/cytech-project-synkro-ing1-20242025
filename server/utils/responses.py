from typing import Any, Dict, List, Optional, Union
from rest_framework.response import Response
from rest_framework import status


class ApiResponse:
    @staticmethod
    def success(data: Any = None, message: str = "Operation successful", status_code: int = status.HTTP_200_OK) -> Response:
        response_data = {
            "status": "success",
            "message": message,
            "data": data
        }
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(message: str = "An error occurred", 
              errors: Optional[Union[List[str], Dict[str, Any]]] = None, 
              status_code: int = status.HTTP_400_BAD_REQUEST) -> Response:
        response_data = {
            "status": "error",
            "message": message,
            "errors": errors or []
        }
        return Response(response_data, status=status_code)
    
    @staticmethod
    def not_found(message: str = "Resource not found") -> Response:
        return ApiResponse.error(message=message, status_code=status.HTTP_404_NOT_FOUND)
    
    @staticmethod
    def unauthorized(message: str = "Unauthorized access") -> Response:
        return ApiResponse.error(message=message, status_code=status.HTTP_401_UNAUTHORIZED)
    
    @staticmethod
    def forbidden(message: str = "Access forbidden") -> Response:
        return ApiResponse.error(message=message, status_code=status.HTTP_403_FORBIDDEN)
    
    @staticmethod
    def validation_error(errors: Dict[str, List[str]]) -> Response:
        return ApiResponse.error(
            message="Validation failed",
            errors=errors,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        ) 