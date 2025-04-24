from django.core.mail import send_mail
from django.conf import settings
from utils.tokens import TokenGenerator


def send_email(user, mail_type, context=None, request=None):
    subject = ''
    message = ''
    recipient = user.email if hasattr(user, 'email') else user
    link = None
    token = None

    if mail_type == 'email_verification':
        link = TokenGenerator.generate_action_link(user, 'email_verification')
        subject = "Verify your email"
        message = f"Welcome! Please verify your email by clicking this link: {link}"
    elif mail_type == 'password_reset':
        link = TokenGenerator.generate_action_link(user, 'password_reset')
        subject = "Password Reset"
        message = f"You requested a password reset. Click here: {link}"
    elif mail_type == 'invitation':
        if not context or not all(k in context for k in ('home_id', 'email', 'role')):
            raise ValueError('context must contain home_id, email, and role for invitation')
        token = TokenGenerator.generate_home_invitation_token(
            context['home_id'],
            context['email'],
            context['role']
        )
        base_url = "http://localhost:5173"
        link = f"{base_url}/invitations/accept/{token}"
        subject = f"Invitation to join a home"
        message = f"You have been invited to join a home. Accept here: {link}"
        recipient = context['email']
    elif mail_type == 'email_change_otp':
        if not context or 'otp_code' not in context:
            raise ValueError('context must contain otp_code for email_change_otp')
        subject = "Code for email change"
        message = f"Your email change code is: {context['otp_code']}"
    else:
        raise ValueError('Unknown mail_type for sending email')

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient]
    )
    return token 