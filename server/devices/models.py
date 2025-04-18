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


""" DEVICES TYPES"""

class EnvironmentalSensor(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE) #lien direct avec la class devices donc théoriquement ça se connecte avec le front 
    sensor_type = models.CharField(max_length=50)
    current_value = models.FloatField()
    unit = models.CharField(max_length=20)
    last_reading = models.DateTimeField()
    alert_threshold = models.DecimalField(max_digits=6, decimal_places=2)

class Camera(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    resolution = models.CharField(max_length=20)
    is_recording = models.BooleanField(default=False)
    storage_path = models.TextField()
    retention_days = models.IntegerField()

class Blind(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    position = models.IntegerField()
    is_automated = models.BooleanField(default=False)
    schedule = models.JSONField(blank=True, null=True)

class AudioSystem(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    volume = models.IntegerField()
    input_source = models.CharField(max_length=50)
    equalizer_settings = models.JSONField()

class Light(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    brightness = models.IntegerField()
    color = models.CharField(max_length=20)
    color_temperature = models.IntegerField()
    is_on = models.BooleanField(default=False)

class SmartLock(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    is_locked = models.BooleanField(default=True)
    battery_level = models.FloatField()
    last_lock_change = models.DateTimeField()

class WashingMachine(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    program = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    time_remaining = models.IntegerField()
    temperature = models.IntegerField()
    spin_speed = models.IntegerField()

class Refrigerator(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity_level = models.DecimalField(max_digits=5, decimal_places=2)
    door_status = models.CharField(max_length=50)
    energy_consumption = models.DecimalField(max_digits=10, decimal_places=2)

class Oven(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    temperature = models.IntegerField()
    mode = models.CharField(max_length=50)
    is_preheating = models.BooleanField(default=False)

class Thermostat(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    current_temp = models.DecimalField(max_digits=5, decimal_places=2)
    target_temp = models.DecimalField(max_digits=5, decimal_places=2)
    humidity_level = models.DecimalField(max_digits=5, decimal_places=2)
    mode = models.CharField(max_length=20)
    schedule = models.JSONField()

class WaterDevice(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    flow_rate = models.DecimalField(max_digits=6, decimal_places=2)
    total_consumption = models.DecimalField(max_digits=10, decimal_places=2)
    device_type = models.CharField(max_length=50)
    alert_threshold = models.DecimalField(max_digits=6, decimal_places=2)

class TV(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    channel = models.CharField(max_length=50)
    volume = models.IntegerField()
    is_on = models.BooleanField(default=False)
    smart_mode = models.CharField(max_length=50)

class WeatherStation(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    temperature = models.FloatField()
    humidity = models.FloatField()
    pressure = models.FloatField()
    wind_speed = models.FloatField()
    rain_level = models.FloatField()

class MotionDetector(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    sensitivity_level = models.IntegerField()
    is_armed = models.BooleanField(default=False)
    last_detection = models.DateTimeField(null=True, blank=True)

class DeviceStat(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    stat_type = models.CharField(max_length=50)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

class Alert(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=50)
    severity = models.CharField(max_length=10)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
