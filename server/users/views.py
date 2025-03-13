from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404

from .serializers import (
    UserLoginSerializer,
    UserSerializer, 
    UserRegistrationSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    AdminUserSerializer,
    ProfileUpdateSerializer,
    EmailChangeRequestSerializer,
    EmailChangeConfirmSerializer
)
from .tokens import TokenGenerator
from .email import send_verification_email, send_password_reset_email

User = get_user_model()


class RegisterView(APIView):
    """View for user registration"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Send verification email
            send_verification_email(user, request)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully. Please verify your email.',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
                {
                    'error': 'Registration Failed',
                    'details': formatted_errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    """View for user login"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            
            # Update last_login timestamp
            from django.utils import timezone
            user.last_login = timezone.now()
            
            # Award points for login
            user.points += 10  # Award 10 points for each login
            
            # Update user level based on new points
            user.update_level()
            
            # Save all changes
            user.save(update_fields=['last_login', 'points', 'level'])
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
                {
                    'error': 'Authentication Failed',
                    'details': formatted_errors
                }, 
                status=status.HTTP_400_BAD_REQUEST
        )


class UserProfileView(APIView):
    """View for retrieving and updating user profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user profile data"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update user profile data"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
            {
                'error': 'Profile Update Error',
                'details': formatted_errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )


class PasswordChangeView(APIView):
    """View for changing password"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            # Check if old password is correct
            if not request.user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {
                        'error': 'Authentication Error',
                        'details': {'old_password': 'Current password is incorrect'}
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            
            return Response({'message': 'Password changed successfully.'}, 
                            status=status.HTTP_200_OK)
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
            {
                'error': 'Password Change Error',
                'details': formatted_errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )


class VerifyEmailView(APIView):
    """View for verifying email address"""
    permission_classes = [AllowAny]
    
    def post(self, request, token):
        """Verify email with token"""
        user = TokenGenerator.verify_token(token, 'email_verification')
        
        if not user:
            return Response(
                {
                    'error': 'Token Error',
                    'details': {'token': 'Invalid or expired verification token'}
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark email as verified
        user.email_verified = True
        user.save(update_fields=['email_verified'])
        
        return Response({'message': 'Email verified successfully'}, 
                        status=status.HTTP_200_OK)


class ResendVerificationEmailView(APIView):
    """View for resending verification email"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Resend verification email to the user"""
        user = request.user
        
        # Check if email is already verified
        if user.email_verified:
            return Response(
                {
                    'error': 'Already Verified',
                    'details': {'email_verified': 'Email is already verified'}
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send verification email
        send_verification_email(user, request)
        
        return Response({'message': 'Verification email sent successfully'}, 
                        status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """View for requesting password reset"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            
            # Always return success response for security reasons,
            # even if email doesn't exist
            if user:
                send_password_reset_email(user, request)
            
            return Response({'message': 'If the email exists, we have sent a password reset link.'}, 
                            status=status.HTTP_200_OK)
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
            {
                'error': 'Password Reset Request Error',
                'details': formatted_errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )


class PasswordResetConfirmView(APIView):
    """View for confirming password reset"""
    permission_classes = [AllowAny]
    
    def post(self, request, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user = TokenGenerator.verify_token(token, 'password_reset')
            
            if not user:
                return Response(
                    {
                        'error': 'Token Error',
                        'details': {'token': 'Invalid or expired reset token'}
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.validated_data['password'])
            user.save()
            
            return Response({'message': 'Password reset successfully'}, 
                            status=status.HTTP_200_OK)
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
            {
                'error': 'Password Reset Confirmation Error',
                'details': formatted_errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )


# Admin views
class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class AdminUserListView(APIView):
    """View for admin to list all users"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminUserDetailView(APIView):
    """View for admin to retrieve, update or delete a user"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_object(self, pk):
        return get_object_or_404(User, pk=pk)
    
    def get(self, request, pk):
        user = self.get_object(pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        user = self.get_object(pk)
        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data)
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
            {
                'error': 'User Update Error',
                'details': formatted_errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def delete(self, request, pk):
        user = self.get_object(pk)
        
        # Prevent admin from deleting themselves
        if user.id == request.user.id:
            return Response(
                {"error": "You cannot delete your own account"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Add the new views for profile update and email change

class ProfileUpdateView(APIView):
    """View for updating user profile"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        """Update user profile data"""
        serializer = ProfileUpdateSerializer(request.user, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': UserSerializer(request.user).data
            })
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
            {
                'error': 'Profile Update Validation Error',
                'details': formatted_errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )


class EmailChangeRequestView(APIView):
    """View for requesting email change with OTP verification"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Request email change and send OTP to current email"""
        serializer = EmailChangeRequestSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            new_email = serializer.validated_data['new_email']
            
            # Generate a 6-digit OTP code
            import random
            otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            # Calculate expiration time (15 minutes from now)
            from django.utils import timezone
            import datetime
            expires_at = timezone.now() + datetime.timedelta(minutes=15)
            
            # Create or update the email change request
            from .models import EmailChangeRequest
            email_change_request, created = EmailChangeRequest.objects.update_or_create(
                user=user,
                is_used=False,
                defaults={
                    'new_email': new_email,
                    'otp_code': otp_code,
                    'expires_at': expires_at,
                }
            )
            
            # Send OTP to current email
            from .email import send_email_change_otp
            send_email_change_otp(user, otp_code)
            
            return Response({
                'message': 'Verification code sent to your current email'
            }, status=status.HTTP_200_OK)
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
            {
                'error': 'Email Change Request Error',
                'details': formatted_errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )


class EmailChangeConfirmView(APIView):
    """View for confirming email change with OTP code"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Confirm email change with OTP code"""
        serializer = EmailChangeConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            otp_code = serializer.validated_data['otp_code']
            
            # Find the email change request
            from .models import EmailChangeRequest
            try:
                email_change_request = EmailChangeRequest.objects.get(
                    user=user,
                    otp_code=otp_code,
                    is_used=False
                )
                
                # Check if the request is still valid
                if not email_change_request.is_valid():
                    return Response(
                        {
                            'error': 'OTP Error',
                            'details': {'otp_code': 'OTP code has expired'}
                        }, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Update user's email
                old_email = user.email
                user.email = email_change_request.new_email
                
                # If email changes, reset email_verified
                if old_email != email_change_request.new_email:
                    user.email_verified = False
                
                user.save(update_fields=['email', 'email_verified'])
                
                # Mark request as used
                email_change_request.is_used = True
                email_change_request.save(update_fields=['is_used'])
                
                # Send verification email to new address
                send_verification_email(user, request)
                
                return Response({
                    'message': 'Email changed successfully. Please verify your new email address.',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            
            except EmailChangeRequest.DoesNotExist:
                return Response(
                    {
                        'error': 'OTP Error',
                        'details': {'otp_code': 'Invalid OTP code'}
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Format error response
        formatted_errors = {}
        for field, error_list in serializer.errors.items():
            formatted_errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response(
            {
                'error': 'Email Change Confirmation Error',
                'details': formatted_errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )
