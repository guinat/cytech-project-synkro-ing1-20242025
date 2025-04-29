from django.db import models
from django.conf import settings

class ActionHistory(models.Model):
    ACTION_TYPES = [
        ("CREATE_ROOM", "Création d'une pièce"),
        ("CREATE_DEVICE", "Création d'un objet"),
        ("OTHER", "Autre action"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=32, choices=ACTION_TYPES)
    target_id = models.CharField(max_length=64, null=True, blank=True)
    target_repr = models.CharField(max_length=255, null=True, blank=True)
    action_datetime = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Historique action utilisateur'
        verbose_name_plural = 'Historiques actions utilisateurs'
        ordering = ['-action_datetime']

    def __str__(self):
        return f"{self.user} {self.get_action_type_display()} sur {self.target_repr or self.target_id} à {self.action_datetime}"
