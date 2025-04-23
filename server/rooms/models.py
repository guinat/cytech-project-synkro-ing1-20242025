import uuid
from django.db import models
from homes.models import Home


class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    home = models.ForeignKey(
        Home, 
        on_delete=models.CASCADE, 
        related_name='rooms'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} in {self.home.name}"

    class Meta:
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        ordering = ['home', 'name']
        unique_together = ('home', 'name')

