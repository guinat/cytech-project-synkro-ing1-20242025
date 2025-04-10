import os
from pathlib import Path
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import datetime
import uuid
from django.utils import timezone
from utils.tokens import TokenGenerator

FRONTEND_URL = "http://localhost:5173"

# Using the central email directory instead of a local directory
EMAIL_DIR = Path(__file__).resolve().parent.parent / 'emails'

def send_home_invitation_email(invitation, request):
    """Send an invitation email to join a home"""
    
    # Get data needed for email
    home = invitation.home
    recipient_email = invitation.email
    expiration_date = invitation.expires_at
    role = invitation.role
    
    # Generate a JWT token for this invitation
    token = TokenGenerator.generate_home_invitation_token(
        home_id=home.id,
        email=recipient_email,
        role=role,
        expiry_time_minutes=15  # 15 minutes expiration
    )
    
    # Save the token in the invitation
    invitation.token = token
    invitation.save()
    
    # Construct invitation URL with token - point to frontend
    invitation_url = f"{FRONTEND_URL}/join-home/{token}"
    
    # Prepare context for email template
    context = {
        'home_name': home.name,
        'owner_name': home.owner.username,
        'invitation_url': invitation_url,
        'role': role,
        'expiration_date': expiration_date.strftime('%d/%m/%Y at %H:%M'),
        'token': token,
        'year': datetime.datetime.now().year
    }
    
    # Ensure email directory exists
    os.makedirs(EMAIL_DIR, exist_ok=True)
    
    # Render email content from template
    html_message = render_to_string(os.path.join(EMAIL_DIR, 'home_invitation.html'), context)
    plain_message = strip_tags(html_message)
    
    # Send email
    send_mail(
        subject=f'Invitation to join home {home.name} - Synkro',
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@synkro.com',
        recipient_list=[recipient_email],
        html_message=html_message,
        fail_silently=False
    )
    
    return True

