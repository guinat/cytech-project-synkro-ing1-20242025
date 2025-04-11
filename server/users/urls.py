from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegisterView,
    UserLoginView,
    UserLogoutView,

    UserProfileView,
    UserProfileUpdateView,
    UserAvatarUploadView,

    UserEmailChangeRequestView,
    UserEmailChangeConfirmView,

    UserVerifyEmailView,
    UserResendVerificationEmailView,

    UserPasswordChangeView,
    UserForgotPasswordView,
    UserResetPasswordView,
    
    AdminUserListView,
    AdminUserDetailView,
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', UserRegisterView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),

    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='profile_update'),
    path('profile/avatar/', UserAvatarUploadView.as_view(), name='avatar_upload'),
    
    # Email change
    path('email/change/request/', UserEmailChangeRequestView.as_view(), name='email_change_request'),
    path('email/change/confirm/', UserEmailChangeConfirmView.as_view(), name='email_change_confirm'),

    # Email verification
    path('email/verify/<str:token>/', UserVerifyEmailView.as_view(), name='verify_email'),
    path('email/resend-verification/', UserResendVerificationEmailView.as_view(), name='resend_verification'),
    
    # Password management
    path('password/change/', UserPasswordChangeView.as_view(), name='password_change'),
    path('password/reset/', UserForgotPasswordView.as_view(), name='password_reset_request'),
    path('password/reset/<str:token>/', UserResetPasswordView.as_view(), name='password_reset_confirm'),

    # Admin
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    
] 