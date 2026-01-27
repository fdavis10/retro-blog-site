from rest_framework import serializers
from .models import Notification, UserNotificationStatus
from users.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    colors = serializers.SerializerMethodField()
    is_dismissed = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'type', 'type_display', 'colors',
            'is_active', 'created_by', 'created_by_username',
            'created_at', 'updated_at', 'is_dismissed', 'is_read'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_colors(self, obj):
        return Notification.TYPE_COLORS.get(obj.type, Notification.TYPE_COLORS['info'])
    
    def get_is_dismissed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            status = UserNotificationStatus.objects.filter(
                user=request.user,
                notification=obj
            ).first()
            return status.is_dismissed if status else False
        return False
    
    def get_is_read(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            status = UserNotificationStatus.objects.filter(
                user=request.user,
                notification=obj
            ).first()
            return status.is_read if status else False
        return False


class NotificationCreateUpdateSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserNotificationStatusSerializer(serializers.ModelSerializer):
    notification = NotificationSerializer(read_only=True)
    class Meta:
        model = UserNotificationStatus
        fields = ['id', 'notification', 'is_read', 'is_dismissed', 'read_at', 'dismissed_at']
        read_only_fields = ['read_at', 'dismissed_at']