from rest_framework import serializers
from .models import FriendRequest, Friendship, Subscription, BlockedUser, InternalNotification
from users.serializers import UserSerializer


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'status', 'status_display', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class FriendshipSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()
    
    class Meta:
        model = Friendship
        fields = ['id', 'friend', 'created_at']
        read_only_fields = ['created_at']
    
    def get_friend(self, obj):
        request = self.context.get('request')
        if request and request.user:
            friend = obj.user2 if obj.user1 == request.user else obj.user1
            return UserSerializer(friend).data
        return None


class SubscriptionSerializer(serializers.ModelSerializer):
    subscriber = UserSerializer(read_only=True)
    subscribed_to = UserSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'subscriber', 'subscribed_to', 'created_at']
        read_only_fields = ['created_at']


class BlockedUserSerializer(serializers.ModelSerializer):
    blocked = UserSerializer(read_only=True)
    
    class Meta:
        model = BlockedUser
        fields = ['id', 'blocked', 'created_at']
        read_only_fields = ['created_at']


class InternalNotificationSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = InternalNotification
        fields = ['id', 'notification_type', 'type_display', 'from_user', 'is_read', 'created_at']
        read_only_fields = ['created_at']