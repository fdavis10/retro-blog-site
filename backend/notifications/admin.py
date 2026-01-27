from django.contrib import admin
from .models import Notification, UserNotificationStatus


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'is_active', 'created_by', 'created_at']
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['title', 'message']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'message', 'type')
        }),
        ('Настройки', {
            'fields': ('is_active',)
        }),
        ('Системная информация', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserNotificationStatus)
class UserNotificationStatusAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification', 'is_read', 'is_dismissed', 'read_at', 'dismissed_at']
    list_filter = ['is_read', 'is_dismissed', 'notification__type']
    search_fields = ['user__username', 'notification__title']
    readonly_fields = ['read_at', 'dismissed_at']