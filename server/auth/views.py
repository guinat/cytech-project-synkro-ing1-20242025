from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

from utils.tokens import TokenGenerator
from utils.emails import send_email
from .serializers import (
    RegisterSerializer, LoginSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    PasswordChangeSerializer
)
from utils.responses import ApiResponse

User = get_user_model()

class RegisterView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
                
            send_email(user, 'email_verification', request=request)
            user.points += 20
            user.last_login = timezone.now()
            user.save()

            refresh = RefreshToken.for_user(user)
                
            return ApiResponse.success(
                {
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'profile_photo': user.profile_photo.url if user.profile_photo else None,
                        'role': user.role,
                        'points': user.points,
                        'level': user.level,
                        'date_joined': user.date_joined,
                        'last_login': user.last_login,
                    },
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }
                    },
                message="Registration successful, please verify your email",
                status_code=status.HTTP_201_CREATED
            )

        return ApiResponse.error(
            message="Registration failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']

            user.last_login = timezone.now()
            user.points += 10
            user.save()

            refresh = RefreshToken.for_user(user)
            return ApiResponse.success(
                data={
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'profile_photo': user.profile_photo.url if hasattr(user, 'profile_photo') and user.profile_photo else None,
                        'role': user.role,
                        'points': user.points,
                        'level': user.level,
                        'is_email_verified': getattr(user, 'is_email_verified', None),
                        'owned_homes_count': getattr(user, 'owned_homes_count', None),
                        'member_homes_count': getattr(user, 'member_homes_count', None),
                        'date_joined': user.date_joined,
                        'last_login': user.last_login,
                    },
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }
                },
                message="Login successful"
            )
        return ApiResponse.error(
            message="Login failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class EmailVerifyView(views.APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        user = TokenGenerator.get_user_from_token(token, "email_verification")

        if not user:
            return ApiResponse.error(
                message="Invalid or expired token",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        if getattr(user, 'is_email_verified', False):
            return ApiResponse.error(
                message="Email has already been verified.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        user.is_email_verified = True
        user.save()
        return ApiResponse.success(message="Email verified successfully", status_code=status.HTTP_200_OK)


class ResendVerificationView(views.APIView):
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.is_email_verified:
            return ApiResponse.error(
                message="Email is already verified",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        send_email(user, 'email_verification', request=request)
        user.save()
        return ApiResponse.success(message="Verification email sent successfully", status_code=status.HTTP_200_OK)


class PasswordResetRequestView(views.APIView):
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                send_email(user, 'password_reset', request=request)
            except User.DoesNotExist:
                pass

            return ApiResponse.success(message="Password reset link sent to email if account exists")
        
        return ApiResponse.error(
            message="Invalid request",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class PasswordResetConfirmView(views.APIView):
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user = TokenGenerator.get_user_from_token(serializer.validated_data['token'], "password_reset")
            
            if not user:
                return ApiResponse.error(
                    message="Invalid token",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data['password'])
            user.save()
            
            return ApiResponse.success(message="Password reset successful")
        
        return ApiResponse.error(
            message="Password reset failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class PasswordChangeView(views.APIView):
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            user = request.user
            new_password = serializer.validated_data['new_password']
            
            user.set_password(new_password)
            user.save()
            
            return ApiResponse.success(message="Password changed successfully")
        
        return ApiResponse.error(
            message="Password change failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
