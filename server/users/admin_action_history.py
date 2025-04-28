from django.contrib import admin
from .models_action_history import ActionHistory

@admin.register(ActionHistory)
class ActionHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'action_type', 'target_repr', 'action_datetime', 'ip_address')
    list_filter = ('action_type', 'action_datetime', 'ip_address')
    search_fields = ('user__email', 'target_repr', 'ip_address', 'user_agent')
    readonly_fields = ('user', 'action_type', 'target_id', 'target_repr', 'action_datetime', 'ip_address', 'user_agent')
    ordering = ('-action_datetime',)
