from django.shortcuts import render
from rest_framework import status, permissions, views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone

from utils.permissions import IsAdminUser
from utils.tokens import TokenGenerator
from utils.api_responses import APIResponse, ErrorCodeEnum

from .serializers import (
    UserLoginSerializer,
    UserSerializer, 
    UserRegistrationSerializer,
    PasswordChangeSerializer,
    AdminUserSerializer,
    ProfileUpdateSerializer,
    EmailChangeRequestSerializer,
    EmailChangeConfirmSerializer,
    AvatarUploadSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .email import send_verification_email, send_password_reset_email
from utils.mixins import APIResponseMixin

User = get_user_model()


class UserRegisterView(APIResponseMixin, APIView):
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
            
            return APIResponse.success(
                data={
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                },
                message='User registered successfully. Please verify your email.',
                status_code=status.HTTP_201_CREATED
            )
        
        return APIResponse.error(
            message='Registration Error',
            errors=APIResponse.format_serializer_errors(serializer.errors),
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCodeEnum.VALIDATION_ERROR
        )


class UserLoginView(APIResponseMixin, APIView):
    """View for user login"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            user.last_login = timezone.now()
            user.points += 10
            user.update_level()
            
            user.save(update_fields=['last_login', 'points', 'level'])
            
            refresh = RefreshToken.for_user(user)
            
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
                        
            return APIResponse.success(data={
                'refresh': refresh_token,
                'access': access_token,
                'user': UserSerializer(user).data
            })
        
        return APIResponse.error(
            message='Login Error',
            errors=APIResponse.format_serializer_errors(serializer.errors),
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCodeEnum.INVALID_CREDENTIALS
        )


class UserLogoutView(APIResponseMixin, APIView):
    """View for user logout"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout user"""
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as e:
                return APIResponse.error(
                    message='Logout Error',
                    errors={'detail': str(e)},
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_code=ErrorCodeEnum.TOKEN_INVALID
                )
        return APIResponse.success(message='Logged out successfully')


class UserProfileView(APIResponseMixin, APIView):
    """View for user profile operations"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get(self, request):
        """Get user profile"""
        serializer = self.serializer_class(request.user)
        return APIResponse.success(
            message='User profile retrieved successfully',
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    
    def patch(self, request):
        """Update user profile"""
        serializer = self.serializer_class(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if not serializer.is_valid():
            return APIResponse.error(
                message='Validation Error',
                errors=APIResponse.format_serializer_errors(serializer.errors),
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.VALIDATION_ERROR
            )
        
        serializer.save()
        
        return APIResponse.success(
            message='User profile updated successfully',
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )


class UserPasswordChangeView(APIResponseMixin, APIView):
    """View for changing password"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            # Check if old password is correct
            if not request.user.check_password(serializer.validated_data['old_password']):
                return APIResponse.error(
                    message='Authentication Error',
                    errors={'old_password': 'Current password is incorrect'},
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_code=ErrorCodeEnum.INVALID_CREDENTIALS
                )
            
            # Set new password
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            
            return APIResponse.success(
                message='Password changed successfully.',
                status_code=status.HTTP_200_OK
            )
        
        return APIResponse.error(
            message='Password Change Error',
            errors=APIResponse.format_serializer_errors(serializer.errors),
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCodeEnum.VALIDATION_ERROR
        )


class UserVerifyEmailView(APIResponseMixin, APIView):
    """View for verifying email address"""
    permission_classes = [AllowAny]
    
    def post(self, request, token):
        """Verify email with token"""
        user = TokenGenerator.get_user_from_token(token, 'email_verification')
        
        if not user:
            return APIResponse.error(
                message='Token Error',
                errors={'token': 'Invalid or expired verification token'},
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.TOKEN_INVALID
            )
        
        # Mark email as verified
        user.email_verified = True
        user.save(update_fields=['email_verified'])
        
        return APIResponse.success(
            message='Email verified successfully',
            status_code=status.HTTP_200_OK
        )


class UserResendVerificationEmailView(APIResponseMixin, APIView):
    """View for resending verification email"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Resend verification email to the user"""
        user = request.user
        
        # Check if email is already verified
        if user.email_verified:
            return APIResponse.error(
                message='Already Verified',
                errors={'email_verified': 'Email is already verified'},
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.VALIDATION_ERROR
            )
        
        # Send verification email
        send_verification_email(user, request)
        
        return APIResponse.success(
            message='Verification email sent successfully',
            status_code=status.HTTP_200_OK
        )


class UserForgotPasswordView(APIResponseMixin, APIView):
    """View for sending password reset email"""
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer
    
    def post(self, request):
        """Send password reset email"""
        serializer = self.serializer_class(data=request.data)
        
        if not serializer.is_valid():
            return APIResponse.error(
                message='Validation Error',
                errors=APIResponse.format_serializer_errors(serializer.errors),
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.VALIDATION_ERROR
            )
        
        email = serializer.validated_data.get('email')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return APIResponse.error(
                message='User not found',
                errors={'email': 'No user found with this email address'},
                status_code=status.HTTP_404_NOT_FOUND,
                error_code=ErrorCodeEnum.NOT_FOUND
            )
        
        # Send password reset email
        send_password_reset_email(user, request)
        
        return APIResponse.success(
            message='Password reset instructions sent to your email',
            status_code=status.HTTP_200_OK
        )


class UserResetPasswordView(APIResponseMixin, APIView):
    """View for resetting password with token"""
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    
    def post(self, request, token):
        """Reset password with token"""
        user = TokenGenerator.get_user_from_token(token, 'password_reset')
        
        if not user:
            return APIResponse.error(
                message='Token Error',
                errors={'token': 'Invalid or expired password reset token'},
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.TOKEN_INVALID
            )
        
        serializer = self.serializer_class(data=request.data)
        
        if not serializer.is_valid():
            return APIResponse.error(
                message='Validation Error',
                errors=APIResponse.format_serializer_errors(serializer.errors),
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.VALIDATION_ERROR
            )
        
        # Update password
        password = serializer.validated_data.get('password')
        user.set_password(password)
        user.save(update_fields=['password'])
        
        # Logout user from all devices
        Token.objects.filter(user=user).delete()
        
        return APIResponse.success(
            message='Password reset successfully',
            status_code=status.HTTP_200_OK
        )


class AdminUserListView(APIResponseMixin, APIView):
    """View for admin to list all users"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """List all users"""
        users = User.objects.all().order_by('-date_joined')
        serializer = AdminUserSerializer(users, many=True)
        return APIResponse.success(data=serializer.data)


class AdminUserDetailView(APIResponseMixin, APIView):
    """View for admin to retrieve, update or delete a user"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_object(self, pk):
        return get_object_or_404(User, pk=pk)
    
    def get(self, request, pk):
        """Get user details"""
        user = self.get_object(pk)
        serializer = AdminUserSerializer(user)
        return APIResponse.success(data=serializer.data)
    
    def patch(self, request, pk):
        """Update user details"""
        user = self.get_object(pk)
        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message='User updated successfully'
            )
        
        return APIResponse.error(
            message='User Update Error',
            errors=APIResponse.format_serializer_errors(serializer.errors),
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCodeEnum.VALIDATION_ERROR
        )
    
    def delete(self, request, pk):
        """Delete user"""
        user = self.get_object(pk)
        
        # Prevent self-deletion
        if user == request.user:
            return APIResponse.error(
                message='Self Deletion Error',
                errors={'user': 'You cannot delete your own account'},
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.VALIDATION_ERROR
            )
        
        user.delete()
        return APIResponse.success(
            message='User deleted successfully',
            status_code=status.HTTP_204_NO_CONTENT
        )


class UserProfileUpdateView(APIResponseMixin, APIView):
    """View for updating user profile"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        """Update user profile"""
        print(f"Profile update request received with method PUT")
        print(f"Request data: {request.data}")
        
        serializer = ProfileUpdateSerializer(instance=request.user, data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                # Log the updated fields
                updated_fields = list(serializer.validated_data.keys())
                print(f"Profile updated for user {user.username}. Updated fields: {updated_fields}")
                
                return APIResponse.success(
                    data={
                        'user': UserSerializer(user).data,
                        'updated_fields': updated_fields
                    },
                    message='Profile updated successfully'
                )
            except Exception as e:
                # Log the error for debugging
                import traceback
                print(f"ERROR updating profile: {str(e)}")
                print(traceback.format_exc())
                
                return APIResponse.error(
                    message='Error updating profile',
                    errors={'detail': str(e)},
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    error_code=ErrorCodeEnum.SERVER_ERROR
                )
        
        return APIResponse.error(
            message='Profile Update Error',
            errors=APIResponse.format_serializer_errors(serializer.errors),
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCodeEnum.VALIDATION_ERROR
        )
    
    def patch(self, request):
        """Partially update user profile"""
        print(f"Profile update request received with method PATCH")
        print(f"Request data: {request.data}")
        
        serializer = ProfileUpdateSerializer(instance=request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                # Log the updated fields
                updated_fields = list(serializer.validated_data.keys())
                print(f"Profile updated for user {user.username}. Updated fields: {updated_fields}")
                
                return APIResponse.success(
                    data={
                        'user': UserSerializer(user).data,
                        'updated_fields': updated_fields
                    },
                    message='Profile updated successfully'
                )
            except Exception as e:
                # Log the error for debugging
                import traceback
                print(f"ERROR updating profile: {str(e)}")
                print(traceback.format_exc())
                
                return APIResponse.error(
                    message='Error updating profile',
                    errors={'detail': str(e)},
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    error_code=ErrorCodeEnum.SERVER_ERROR
                )
        
        return APIResponse.error(
            message='Profile Update Error',
            errors=APIResponse.format_serializer_errors(serializer.errors),
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCodeEnum.VALIDATION_ERROR
        )


class UserEmailChangeRequestView(APIResponseMixin, APIView):
    """View for requesting email change with OTP verification"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Request to change email with OTP verification"""
        serializer = EmailChangeRequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Extract data
            new_email = serializer.validated_data['new_email']
            
            # Check if new email is different from current
            if request.user.email == new_email:
                return APIResponse.error(
                    message='Email Unchanged',
                    errors={'new_email': 'New email must be different from current email'},
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_code=ErrorCodeEnum.VALIDATION_ERROR
                )
            
            # Check if new email is already in use
            if User.objects.filter(email=new_email).exists():
                return APIResponse.error(
                    message='Email Taken',
                    errors={'new_email': 'This email is already in use'},
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_code=ErrorCodeEnum.VALIDATION_ERROR
                )
            
            # Generate and store OTP
            from random import randint
            otp = str(randint(100000, 999999))
            
            from users.models import EmailChangeRequest
            from django.utils import timezone
            
            # Mark old requests as used
            EmailChangeRequest.objects.filter(user=request.user, is_used=False).update(is_used=True)
            
            # Create new request
            EmailChangeRequest.objects.create(
                user=request.user,
                new_email=new_email,
                otp_code=otp,
                expires_at=timezone.now() + timezone.timedelta(minutes=15)
            )
            
            # Send OTP via email
            from users.email import send_email_change_otp
            
            # Send OTP directly to the current email address (not the new one)
            try:
                # Pass both the current user (with current email) and the new email for reference
                send_email_change_otp(request.user, otp, new_email)
                email_sent = True
            except Exception as e:
                # Log the error but don't fail the request
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send email change OTP: {str(e)}")
                email_sent = False
            
            # Standard success message
            success_message = 'Verification code sent to your current email address. Please verify within 15 minutes.'
            if not email_sent:
                success_message += ' Warning: Email sending failed, please contact administrator.'
            
            # Never return OTP in response
            return APIResponse.success(
                message=success_message,
                data={'email_sent': email_sent}
            )
        
        return APIResponse.error(
            message='Email Change Error',
            errors=APIResponse.format_serializer_errors(serializer.errors),
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCodeEnum.VALIDATION_ERROR
        )


class UserEmailChangeConfirmView(APIResponseMixin, APIView):
    """View for confirming email change with OTP code"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Confirm email change with OTP"""
        serializer = EmailChangeConfirmSerializer(data=request.data)
        if serializer.is_valid():
            otp = serializer.validated_data['otp_code']
            
            # Get email change request from database
            from users.models import EmailChangeRequest
            
            try:
                # Get the most recent unused request for this user
                email_change_request = EmailChangeRequest.objects.filter(
                    user=request.user,
                    is_used=False,
                    otp_code=otp,
                    expires_at__gt=timezone.now()
                ).latest('created_at')
                
                # Request exists and is not expired
                new_email = email_change_request.new_email
                
                # Change email
                old_email = request.user.email
                request.user.email = new_email
                request.user.email_verified = False  # Require verification of new email
                request.user.save()
                
                # Mark request as used
                email_change_request.is_used = True
                email_change_request.save()
                
                # Send verification email to new address
                send_verification_email(request.user, request)
                
                # Return complete user data
                from .serializers import UserSerializer
                
                return APIResponse.success(
                    message=f'Email successfully changed from {old_email} to {new_email}. Please verify your new email.',
                    data=UserSerializer(request.user).data
                )
                
            except EmailChangeRequest.DoesNotExist:
                # No valid request found
                return APIResponse.error(
                    message='No Pending Request',
                    errors={'otp': 'No pending email change request found or OTP is invalid/expired'},
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_code=ErrorCodeEnum.VALIDATION_ERROR
                )
            
        return APIResponse.error(
            message='Email Change Confirmation Error',
            errors=APIResponse.format_serializer_errors(serializer.errors),
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCodeEnum.VALIDATION_ERROR
        )


class UserAvatarUploadView(APIResponseMixin, APIView):
    """View for uploading user avatar"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Handle avatar upload"""
        serializer = AvatarUploadSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Prepare response data
            response_data = {
                'avatar_url': f"data:{user.avatar_mime_type};base64,{user.avatar}"
            }
            
            return APIResponse.success(
                data=response_data,
                message='Avatar uploaded successfully',
                status_code=status.HTTP_200_OK
            )
        
        return APIResponse.error(
            message='Image Upload Error',
            errors=APIResponse.format_serializer_errors(serializer.errors),
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=ErrorCodeEnum.VALIDATION_ERROR
        )
