import os
from pathlib import Path
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import datetime
from utils.tokens import TokenGenerator
import logging

FRONTEND_URL = "http://localhost:5173"

EMAIL_DIR = Path(settings.BASE_DIR) / 'emails'

def send_verification_email(user, request):
    """Send an email verification link to the user"""
    
    # Generate verification token
    token = TokenGenerator.generate_user_token(
        user_id=user.id,
        token_type='email_verification',
        expiry_time_minutes=settings.EMAIL_VERIFICATION_TIMEOUT // 60
    )
    
    # Construct verification URL with token - point to frontend
    verification_url = f"{FRONTEND_URL}/verify-email?token={token}"
    
    # Prepare context for email template
    context = {
        'user': user,
        'verification_url': verification_url,
        'year': datetime.datetime.now().year
    }
    
    # Render email content from template - use the template name directly
    html_message = render_to_string('emails/verification_email.html', context)
    plain_message = strip_tags(html_message)
    
    # Send email
    send_mail(
        subject='Verify Your Email - Synkro',
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@synkro.com',
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False
    )


def send_password_reset_email(user, request):
    """Send a password reset link to the user"""
    
    # Generate password reset token
    token = TokenGenerator.generate_user_token(
        user_id=user.id,
        token_type='password_reset',
        expiry_time_minutes=settings.EMAIL_VERIFICATION_TIMEOUT // 60
    )
    
    # Construct reset URL with token - point to frontend
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    
    # Prepare context for email template
    context = {
        'user': user,
        'reset_url': reset_url,
        'year': datetime.datetime.now().year
    }
    
    # Render email content from template - use the template name directly
    html_message = render_to_string('emails/password_reset.html', context)
    plain_message = strip_tags(html_message)
    
    # Send email
    send_mail(
        subject='Reset Your Password - Synkro',
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@synkro.com',
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False
    )


def send_email_change_otp(user, otp_code, new_email=None):
    """Send an OTP code to verify email change
    
    Args:
        user: The user with their current email address
        otp_code: The generated OTP code
        new_email: The new email address the user wants to change to (for displaying in the email)
    """
    
    # Prepare context for email template
    context = {
        'user': user,
        'otp_code': otp_code,
        'new_email': new_email,  # Include the new email in the context
        'year': datetime.datetime.now().year
    }
    
    # Render email content from template - use the template name directly
    html_message = render_to_string('emails/email_change_otp.html', context)
    plain_message = strip_tags(html_message)
    
    # Send email to the current (old) email address
    send_mail(
        subject='Verify Your Email Change - Synkro',
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@synkro.com',
        recipient_list=[user.email],  # Send to the current email address
        html_message=html_message,
        fail_silently=False
    )
    
    # Log that we've sent the email
    logger = logging.getLogger(__name__)
    logger.info(f"Email change OTP sent to current email {user.email} for change to {new_email}") 