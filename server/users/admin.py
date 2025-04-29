#TODO:
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from .models_login_history import LoginHistory
from .models_action_history import ActionHistory

class LoginHistoryInline(admin.TabularInline):
    model = LoginHistory
    extra = 0
    fields = ('login_datetime', 'ip_address', 'user_agent')
    readonly_fields = ('login_datetime', 'ip_address', 'user_agent')
    can_delete = False
    verbose_name = 'Connexion'
    verbose_name_plural = 'Connexions'
    show_change_link = False

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = (
        'email', 'username', 'role', 'level', 'points', 'is_email_verified',
        'date_joined', 'last_login', 'is_staff', 'is_superuser'
    )
    list_filter = ('role', 'level', 'is_email_verified', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('email', 'username')
    readonly_fields = ('date_joined', 'last_login')
    ordering = ('-date_joined',)
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password', 'profile_photo')}),
        ('Rôle et permissions', {'fields': ('role', 'level', 'points', 'guest_permissions', 'is_email_verified')}),
        ('Permissions Django', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('date_joined', 'last_login'), 'classes': ('collapse',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'level', 'points', 'is_email_verified'),
        }),
    )
    filter_horizontal = ('groups', 'user_permissions')
    inlines = [LoginHistoryInline]

@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'login_datetime', 'ip_address', 'user_agent')
    list_filter = ('login_datetime', 'ip_address')
    search_fields = ('user__email', 'ip_address', 'user_agent')
    readonly_fields = ('login_datetime', 'ip_address', 'user_agent', 'user')
    ordering = ('-login_datetime',)

@admin.register(ActionHistory)
class ActionHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'action_type', 'target_repr', 'action_datetime', 'ip_address')
    list_filter = ('action_type', 'action_datetime', 'ip_address')
    search_fields = ('user__email', 'target_repr', 'ip_address', 'user_agent')
    readonly_fields = ('user', 'action_type', 'target_id', 'target_repr', 'action_datetime', 'ip_address', 'user_agent')
    ordering = ('-action_datetime',)