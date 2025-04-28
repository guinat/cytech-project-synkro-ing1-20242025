from django.contrib import admin
from .models import Home, HomeInvitation

class HomeInvitationInline(admin.TabularInline):
    model = HomeInvitation
    extra = 0
    fields = ('email', 'status', 'inviter', 'created_at', 'expires_at')
    readonly_fields = ('created_at', 'updated_at')
    show_change_link = True
    can_delete = True
    verbose_name = 'Invitation'
    verbose_name_plural = 'Invitations'

@admin.register(Home)
class HomeAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'color', 'created_at', 'updated_at', 'member_count')
    list_filter = ('owner', 'color', 'created_at')
    search_fields = ('name', 'owner__email', 'owner__username')
    filter_horizontal = ('members',)
    inlines = [HomeInvitationInline]
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {
            'fields': ('name', 'color', 'owner', 'members')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Number of Members'

@admin.register(HomeInvitation)
class HomeInvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'home', 'inviter', 'status', 'created_at', 'expires_at')
    list_filter = ('status', 'created_at', 'expires_at')
    search_fields = ('email', 'home__name', 'inviter__email', 'inviter__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)