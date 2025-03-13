from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import datetime
from .tokens import TokenGenerator

FRONTEND_URL = "http://localhost:5173"

def send_verification_email(user, request):
    """Send an email verification link to the user"""
    
    # Generate verification token
    token = TokenGenerator.generate_verification_token(user)
    
    # Construct verification URL with token - point to frontend
    verification_url = f"{FRONTEND_URL}/verify-email?token={token}"
    
    # Prepare context for email template
    context = {
        'user': user,
        'verification_url': verification_url,
        'year': datetime.datetime.now().year
    }
    
    # Render email content from template
    html_message = render_to_string('emails/verification_email.html', context)
    plain_message = strip_tags(html_message)
    
    # Send email
    send_mail(
        subject='Verify Your Email - Hello Home',
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@hellohome.com',
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False
    )


def send_password_reset_email(user, request):
    """Send a password reset link to the user"""
    
    # Generate password reset token
    token = TokenGenerator.generate_password_reset_token(user)
    
    # Construct reset URL with token - point to frontend
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    
    # Prepare context for email template
    context = {
        'user': user,
        'reset_url': reset_url,
        'year': datetime.datetime.now().year
    }
    
    # Render email content from template
    html_message = render_to_string('emails/password_reset.html', context)
    plain_message = strip_tags(html_message)
    
    # Send email
    send_mail(
        subject='Reset Your Password - Hello Home',
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@hellohome.com',
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False
    )

def send_email_change_otp(user, otp_code):
    """Send an OTP code to verify email change"""
    
    # Prepare context for email template
    context = {
        'user': user,
        'otp_code': otp_code,
        'year': datetime.datetime.now().year
    }
    
    # Render email content from template
    html_message = render_to_string('emails/email_change_otp.html', context)
    plain_message = strip_tags(html_message)
    
    # Send email
    send_mail(
        subject='Verify Your Email Change - Hello Home',
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@hellohome.com',
        recipient_list=[user.email],  # Send to current email
        html_message=html_message,
        fail_silently=False
    ) 