from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    API root endpoint to display available endpoints
    """
    return Response({
        # Authentication
        'register': reverse('users:register', request=request, format=format),
        'login': reverse('users:login', request=request, format=format),
        'token_refresh': reverse('users:token_refresh', request=request, format=format),
        
        # User profile
        'profile': reverse('users:profile', request=request, format=format),
        
        # Password management
        'password_change': reverse('users:password_change', request=request, format=format),
        'password_reset_request': reverse('users:password_reset_request', request=request, format=format),
        
        # Email verification
        'resend_verification_email': reverse('users:resend_verification', request=request, format=format),
    })
