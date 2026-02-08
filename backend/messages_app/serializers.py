from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_first_name = serializers.CharField(source='sender.first_name', read_only=True)
    sender_last_name = serializers.CharField(source='sender.last_name', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_username', 'sender_first_name', 'sender_last_name',
                  'content', 'created_at', 'is_read']
        read_only_fields = ['id', 'sender', 'created_at', 'is_read']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content']
        extra_kwargs = {'content': {'max_length': 2000}}


class ConversationListSerializer(serializers.ModelSerializer):
    """Список диалогов с последним сообщением"""
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'other_user', 'last_message', 'unread_count', 'updated_at']

    def get_other_user(self, obj):
        from django.core.exceptions import ObjectDoesNotExist
        current_user = self.context['request'].user
        other = obj.get_other_participant(current_user)
        avatar_url = None
        try:
            if other.profile.avatar:
                avatar_url = self.context['request'].build_absolute_uri(other.profile.avatar.url)
        except (ObjectDoesNotExist, AttributeError, ValueError):
            pass
        return {
            'id': other.id,
            'username': other.username,
            'first_name': other.first_name,
            'last_name': other.last_name,
            'profile': {'avatar': avatar_url}
        }

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if not last:
            return None
        return {
            'content': last.content[:80] + ('...' if len(last.content) > 80 else ''),
            'sender_username': last.sender.username,
            'created_at': last.created_at,
        }

    def get_unread_count(self, obj):
        current_user = self.context['request'].user
        return obj.messages.filter(
            conversation=obj,
            is_read=False
        ).exclude(sender=current_user).count()
