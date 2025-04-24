
import uuid
from django.db import models
from django.conf import settings
from rooms.models import Room




from .device_catalogue import DEVICE_TYPE_MAP

class Device(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    room = models.ForeignKey(
        Room, 
        on_delete=models.CASCADE, 
        related_name='devices'
    )
    type = models.CharField(max_length=50) 
    product_code = models.CharField(max_length=6)
    state = models.JSONField(default=dict, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} in {self.room.name}"

    @property
    def capabilities(self):
        return DEVICE_TYPE_MAP.get(self.type, {}).get('capabilities', [])

    @property
    def type_info(self):
        return DEVICE_TYPE_MAP.get(self.type, {})

    class Meta:
        verbose_name = 'Device'
        verbose_name_plural = 'Devices'
        ordering = ['room', 'name']
        unique_together = ('room', 'name')


class DeviceCommand(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(
        Device, 
        on_delete=models.CASCADE, 
        related_name='commands'
    )
    capability = models.CharField(max_length=50) 
    parameters = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=Status.choices,
        default=Status.PENDING
    )
    response = models.JSONField(default=dict, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        related_name='device_commands',
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    executed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.capability} on {self.device.name}"

    class Meta:
        verbose_name = 'Device Command'
        verbose_name_plural = 'Device Commands'
        ordering = ['-created_at']

