from django.db import models

# Create your models here.

from django.db import models

class Rooms(models.Model):
    room_name = models.CharField(max_length=100)
    floor_number = models.IntegerField()
    room_type = models.CharField(max_length=100)

class DeviceType(models.Model):
    type_name = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    specifications = models.TextField()

    def __str__(self):
        return self.type_name

class Category(models.Model):
    category_name = models.CharField(max_length=100)
    in_scor_system = models.BooleanField()
    description = models.TextField()

    def __str__(self):
        return self.category_name

class Device(models.Model):
    device_name = models.CharField(max_length=100)
    device_type = models.ForeignKey(DeviceType, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    installation_date = models.DateField()
    firmware_version = models.CharField(max_length=50)
    ip_address = models.GenericIPAddressField()
    mac_address = models.CharField(max_length=50)
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.device_name

class EnvironmentalSensor(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE, primary_key=True)
    sensor_type = models.CharField(max_length=50)
    current_value = models.DecimalField(max_digits=8, decimal_places=2)
    unit = models.CharField(max_length=20)
    last_reading = models.DateTimeField()
    alert_threshold = models.DecimalField(max_digits=8, decimal_places=2)

class Camera(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE, primary_key=True)
    resolution = models.CharField(max_length=20)
    iso_reading = models.TextField()
    storage_path = models.CharField(max_length=255)
    retention_days = models.IntegerField()

class SmartLock(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE, primary_key=True)
    is_locked = models.BooleanField()
    battery_level = models.IntegerField()
    last_lock_change = models.DateTimeField()

class Light(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE, primary_key=True)
    brightness = models.IntegerField()
    color = models.CharField(max_length=50)
    color_temperature = models.IntegerField()
    is_on = models.BooleanField(default=False)

class Thermostat(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE, primary_key=True)
    current_temp = models.DecimalField(max_digits=5, decimal_places=2)
    target_temp = models.DecimalField(max_digits=5, decimal_places=2)
    mode = models.CharField(max_length=50)
    schedule = models.JSONField()

class Refrigerator(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE, primary_key=True)
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    door_status = models.BooleanField()
    energy_consumption = models.DecimalField(max_digits=8, decimal_places=2)

class WashingMachine(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE, primary_key=True)
    program = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    time_remaining = models.IntegerField()
    spin_speed = models.IntegerField()

class TV(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE, primary_key=True)
    volume = models.IntegerField()
    input_source = models.CharField(max_length=50)
    applied_settings = models.JSONField()

class Alert(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=50)
    message = models.TextField()
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.alert_type

class EnergyConsumption(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    consumption_value = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)
    timestamp = models.DateTimeField()

class LockAccessHistory(models.Model):
    lock = models.ForeignKey(SmartLock, on_delete=models.CASCADE)
    access_time = models.DateTimeField()
    access_type = models.CharField(max_length=50)
    access_method = models.CharField(max_length=50)

class Maintenance(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    maintenance_type = models.CharField(max_length=50)
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    technician = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.maintenance_type} for {self.device.device_name}"
