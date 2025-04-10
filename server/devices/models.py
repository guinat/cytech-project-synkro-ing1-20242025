from django.db import models
from django.utils import timezone
from django.conf import settings
import uuid

class DeviceType(models.Model):
    """
    Represents categories of devices (e.g., 'Smart Bulb', 'Thermostat', 'Washing Machine')
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name


class Home(models.Model):
    """
    Represents a home/dashboard that contains rooms and devices
    """
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_homes')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='member_homes', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} (Owner: {self.owner.username})"
    
    def save(self, *args, **kwargs):
        # Generate a unique code for the home when first created
        if not self.code:
            self.code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)


class Room(models.Model):
    """
    Represents a room in a home
    """
    name = models.CharField(max_length=100)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['name', 'home']
    
    def __str__(self):
        return f"{self.name} in {self.home.name}"


class Device(models.Model):
    """
    Represents an individual connected device in the smart home system
    """
    STATUS_CHOICES = (
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('error', 'Error'),
        ('maintenance', 'Maintenance'),
    )
    
    name = models.CharField(max_length=100)
    device_type = models.ForeignKey(DeviceType, on_delete=models.CASCADE, related_name='devices')
    location = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='devices')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, related_name='devices', null=True, blank=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='devices', null=True, blank=True)
    registration_date = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(default=timezone.now)
    
    # Additional fields
    manufacturer = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    serial_number = models.CharField(max_length=100, blank=True, unique=True)
    mac_address = models.CharField(max_length=17, blank=True, null=True, unique=True)
    firmware_version = models.CharField(max_length=50, blank=True)
    
    # For device authentication with the backend
    api_key = models.CharField(max_length=64, blank=True, null=True, unique=True)
    
    class Meta:
        ordering = ['-last_seen']
        unique_together = ['name', 'owner']
    
    def __str__(self):
        return f"{self.name} ({self.device_type.name})"
    
    def update_last_seen(self):
        """Update the last_seen timestamp"""
        self.last_seen = timezone.now()
        self.save(update_fields=['last_seen'])


class DeviceDataPoint(models.Model):
    """
    Stores time-series data reported by devices
    """
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='data_points')
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    data = models.JSONField()
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['device', 'timestamp']),
        ]
    
    def __str__(self):
        return f"Data for {self.device.name} at {self.timestamp}"


class DeviceCommand(models.Model):
    """
    Represents a command sent to a device and its execution status
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('executed', 'Executed'),
        ('failed', 'Failed'),
    )
    
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='commands')
    command = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    executed_at = models.DateTimeField(blank=True, null=True)
    result = models.JSONField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                   related_name='device_commands', blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Command for {self.device.name}: {self.status}"


class HomeMembership(models.Model):
    """
    Represents a pending invitation for a user to join a home
    """
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('guest', 'Guest'),
    )
    
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    code = models.CharField(max_length=50, unique=True, editable=False)
    token = models.CharField(max_length=100, unique=True, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Invitation for {self.email} to {self.home.name}"
    
    def save(self, *args, **kwargs):
        # Generate a unique code for the invitation when first created
        if not self.code:
            self.code = str(uuid.uuid4())
        
        # Set expiration date if not already set
        if not self.expires_at:
            # Par défaut, les invitations expirent après 15 minutes
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
            
        super().save(*args, **kwargs)
