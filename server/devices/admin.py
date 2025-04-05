from django.contrib import admin
from .models import DeviceType, Device, DeviceDataPoint, DeviceCommand


@admin.register(DeviceType)
class DeviceTypeAdmin(admin.ModelAdmin):
    """Admin interface for DeviceType model"""
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    """Admin interface for Device model"""
    list_display = ('name', 'device_type', 'location', 'status', 'owner', 'last_seen')
    list_filter = ('device_type', 'status', 'location')
    search_fields = ('name', 'location', 'serial_number', 'mac_address')
    readonly_fields = ('registration_date', 'last_seen')
    ordering = ('-last_seen',)
    date_hierarchy = 'registration_date'
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'device_type', 'location', 'status', 'owner')
        }),
        ('Hardware Information', {
            'fields': ('manufacturer', 'model', 'serial_number', 'mac_address', 'firmware_version')
        }),
        ('API Information', {
            'fields': ('api_key',)
        }),
        ('Timestamps', {
            'fields': ('registration_date', 'last_seen')
        }),
    )


@admin.register(DeviceDataPoint)
class DeviceDataPointAdmin(admin.ModelAdmin):
    """Admin interface for DeviceDataPoint model"""
    list_display = ('device', 'timestamp', 'get_data_preview')
    list_filter = ('device', 'timestamp')
    search_fields = ('device__name',)
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    ordering = ('-timestamp',)
    
    def get_data_preview(self, obj):
        """Return a short preview of the data content"""
        data_str = str(obj.data)
        if len(data_str) > 50:
            return data_str[:50] + '...'
        return data_str
    get_data_preview.short_description = 'Data Preview'


@admin.register(DeviceCommand)
class DeviceCommandAdmin(admin.ModelAdmin):
    """Admin interface for DeviceCommand model"""
    list_display = ('device', 'get_command_preview', 'status', 'created_at', 'executed_at', 'created_by')
    list_filter = ('device', 'status', 'created_at', 'executed_at')
    search_fields = ('device__name', 'created_by__username')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    def get_command_preview(self, obj):
        """Return a short preview of the command content"""
        cmd_str = str(obj.command)
        if len(cmd_str) > 50:
            return cmd_str[:50] + '...'
        return cmd_str
    get_command_preview.short_description = 'Command Preview'
