import json
import logging
import traceback
from django.http import JsonResponse
from rest_framework import status
from .api_responses import ErrorCodeEnum

logger = logging.getLogger('django')


class ExceptionMiddleware:
    """
    Middleware to intercept and handle all unhandled exceptions
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """Processes unhandled exceptions and returns a standardized JSON response"""
        # Log the exception
        log_data = {
            'path': request.path,
            'method': request.method,
            'user_id': request.user.id if request.user.is_authenticated else None,
            'ip': self.get_client_ip(request),
            'exception': str(exception),
            'traceback': traceback.format_exc()
        }
        logger.error(f"Unhandled exception: {json.dumps(log_data)}")
        
        # Create error response
        error_response = {
            'status': 'error',
            'message': "An error occurred while processing your request.",
            'error_code': ErrorCodeEnum.SYSTEM_ERROR
        }
        
        # In debug mode, add more information
        if hasattr(exception, 'detail'):
            error_response.update(exception.detail)
        
        return JsonResponse(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Gets the client's IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class RequestLoggingMiddleware:
    """
    Middleware to log all requests
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('api_requests')

    def __call__(self, request):
        # Log the request
        self.log_request(request)
        
        # Process the request
        response = self.get_response(request)
        
        # Log the response
        self.log_response(request, response)
        
        return response
    
    def log_request(self, request):
        """Logs request details"""
        data = {
            'path': request.path,
            'method': request.method,
            'user_id': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
            'ip': self.get_client_ip(request)
        }
        
        # Don't log passwords and sensitive information
        if request.method in ['POST', 'PUT', 'PATCH'] and hasattr(request, 'body'):
            try:
                body = json.loads(request.body)
                # Mask sensitive information
                if 'password' in body:
                    body['password'] = '******'
                if 'password_confirm' in body:
                    body['password_confirm'] = '******'
                data['body'] = body
            except:
                pass
        
        self.logger.info(f"REQUEST: {json.dumps(data)}")
    
    def log_response(self, request, response):
        """Logs response details"""
        data = {
            'path': request.path,
            'method': request.method,
            'status_code': response.status_code,
        }
        
        self.logger.info(f"RESPONSE: {json.dumps(data)}")
    
    def get_client_ip(self, request):
        """Gets the client's IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip 