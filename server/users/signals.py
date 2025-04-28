from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
from django.utils import timezone

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    from .models_login_history import LoginHistory  # Import déplacé ici
    ip = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
    else:   
        user_agent = ''
    LoginHistory.objects.create(
        user=user,
        login_datetime=timezone.now(),
        ip_address=ip,
        user_agent=user_agent
    )