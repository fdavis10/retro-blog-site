from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'is_approved', 'is_admin_user', 'is_staff', 'created_at']
    list_filter = ['is_approved', 'is_admin_user', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительные настройки', {
            'fields': ('is_approved', 'is_admin_user')
        }),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'birth_date']
    search_fields = ['user__username', 'user__email', 'location']
    list_filter = ['location']