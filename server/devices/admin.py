#TODO:


from django.contrib import admin
from .models import Device, DeviceCommand

class DeviceCommandInline(admin.TabularInline):
    model = DeviceCommand
    extra = 0
    fields = ('capability', 'parameters', 'status', 'executed_at', 'user', 'created_at')
    readonly_fields = ('created_at', 'updated_at', 'executed_at', 'user')
    show_change_link = True
    can_delete = True
    verbose_name = 'Commande'
    verbose_name_plural = 'Commandes'

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'room', 'type', 'brand', 'product_code', 'created_at', 'updated_at', 'command_count')
    list_filter = ('room', 'type', 'brand', 'created_at')
    search_fields = ('name', 'room__name', 'type', 'brand', 'product_code')
    inlines = [DeviceCommandInline]
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('room', 'name')
    fieldsets = (
        (None, {
            'fields': ('name', 'room', 'type', 'brand', 'product_code', 'state')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    def command_count(self, obj):
        return obj.commands.count()
    command_count.short_description = 'Nb commandes'

@admin.register(DeviceCommand)
class DeviceCommandAdmin(admin.ModelAdmin):
    list_display = ('capability', 'device', 'user', 'status', 'executed_at', 'created_at')
    list_filter = ('status', 'capability', 'created_at', 'executed_at')
    search_fields = ('capability', 'device__name', 'user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at', 'executed_at', 'user')
    ordering = ('-created_at',)
