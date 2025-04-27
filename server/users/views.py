from rest_framework import viewsets, status
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer, UserMeSerializer
from utils.responses import ApiResponse
from utils.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from utils.emails import send_email
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_email_verified', 'role', 'level', 'date_joined']
    search_fields = ['email', 'username']
    ordering_fields = ['email', 'username', 'date_joined']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action == 'update':
            return UserUpdateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return ApiResponse.success(
            UserSerializer(user).data,
            message="User created successfully",
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return ApiResponse.success(
            UserSerializer(user).data,
            message="User updated successfully"
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return ApiResponse.success(
            message="User deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def me(request):    
    
    if request.method == 'GET':
        serializer = UserMeSerializer(request.user)
        return ApiResponse.success(serializer.data)
    elif request.method == 'PATCH':
        data = request.data.copy()
        user = request.user
        new_email = data.get('email')
        otp_code = data.get('otp_code')

        if otp_code:
            session_code = request.session.get('email_change_otp')
            session_new_email = request.session.get('email_change_new_email')
            session_payload = request.session.get('profile_update_payload')
            if session_code and session_new_email and session_payload and otp_code == session_code:
                payload = session_payload.copy()
                payload['email'] = session_new_email
                current_password = payload.get('current_password')
                if not current_password or not user.check_password(current_password):
                    return ApiResponse.error(
                        message="The current password is incorrect.",
                        status_code=400,
                    )
                try:
                    serializer = UserUpdateSerializer(user, data=payload, partial=True)
                    serializer.is_valid(raise_exception=True)
                    user = serializer.save()
                    user.is_email_verified = False
                    user.save()
                    try:
                        send_email(user, 'email_verification')
                    except Exception as e:
                        return ApiResponse.error(message=f"Failed to send verification email: {e}", status_code=400)
                except Exception as e:
                    return ApiResponse.error(message=f"Failed to update user profile: {e}", status_code=400)
                request.session.pop('email_change_otp', None)
                request.session.pop('email_change_new_email', None)
                request.session.pop('profile_update_payload', None)
                return ApiResponse.success(
                    UserMeSerializer(user).data,
                    message="Your email has been changed. A verification email has been sent to your new address. Please click on the link received to activate your account.",
                )
            else:
                return ApiResponse.error(
                    message="Invalid or expired OTP, or missing modification data.",
                    status_code=400,
                )

        if new_email and new_email != user.email:
            import random
            code = f"{random.randint(100000, 999999)}"
            payload_to_store = {k: v for k, v in data.items() if k != 'otp_code'}
            request.session['email_change_otp'] = code
            request.session['email_change_new_email'] = new_email
            request.session['profile_update_payload'] = payload_to_store
            send_email(user, 'email_change_otp', context={'otp_code': code})
            return ApiResponse.success(
                {"otp_required": True},
                message="A one-time code has been sent to your current email address."
            )

        new_password = data.get('new_password')
        new_password_confirm = data.get('new_password_confirm')
        current_password = data.get('current_password')
        errors = {}
        success_messages = []
        profile_updated = False
        password_changed = False

        if not current_password or not user.check_password(current_password):
            return ApiResponse.error(
                message="The current password is incorrect.",
                status_code=400,
            )

        if new_password or new_password_confirm:
            if not new_password or not new_password_confirm:
                errors['new_password'] = "Please provide the new password and its confirmation."
            elif new_password != new_password_confirm:
                errors['new_password_confirm'] = "The confirmation of the new password does not match."
            elif len(new_password) < 8:
                errors['new_password'] = "The new password must contain at least 8 characters."
            else:
                user.set_password(new_password)
                user.save()
                password_changed = True
                success_messages.append("Password changed successfully.")
        
        profile_fields = {k: v for k, v in data.items() if k not in ['new_password', 'new_password_confirm', 'current_password']}
        if profile_fields:
            serializer = UserUpdateSerializer(user, data=profile_fields, partial=True)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            profile_updated = True
            success_messages.append("Profile updated successfully.")

        if errors:
            return ApiResponse.error(
                message="Some changes could not be applied.",
                errors=errors,
                status_code=400,
            )
        if not (profile_updated or password_changed):
            return ApiResponse.error(
                message="No changes detected.",
                status_code=400,
            )
        return ApiResponse.success(
            UserMeSerializer(user).data,
            message=" ".join(success_messages)
        )
    elif request.method == 'DELETE':
        request.user.delete()
        return ApiResponse.success(
            message="Account deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )

