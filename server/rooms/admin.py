#TODO:
from django.contrib import admin
from .models import Room

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'home', 'created_at', 'updated_at')
    list_filter = ('home', 'created_at')
    search_fields = ('name', 'home__name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('home', 'name')
    fieldsets = (
        (None, {
            'fields': ('name', 'home')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )