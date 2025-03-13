from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    PasswordChangeView,
    VerifyEmailView,
    ResendVerificationEmailView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ProfileUpdateView,
    EmailChangeRequestView,
    EmailChangeConfirmView
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile_update'),
    
    # Email change
    path('email/change/request/', EmailChangeRequestView.as_view(), name='email_change_request'),
    path('email/change/confirm/', EmailChangeConfirmView.as_view(), name='email_change_confirm'),
    
    # Password management
    path('password/change/', PasswordChangeView.as_view(), name='password_change'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Email verification
    path('email/verify/<str:token>/', VerifyEmailView.as_view(), name='verify_email'),
    path('email/resend-verification/', ResendVerificationEmailView.as_view(), name='resend_verification'),
] 