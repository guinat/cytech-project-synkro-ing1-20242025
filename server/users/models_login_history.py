from django.db import models
from django.conf import settings

class LoginHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='login_histories')
    login_datetime = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} @ {self.login_datetime} ({self.ip_address})"

    class Meta:
        verbose_name = 'Login History'
        verbose_name_plural = 'Login Histories'
        ordering = ['-login_datetime']
