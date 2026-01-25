from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer, UserCreateSerializer
from blog.models import Post, Comment, Like

User = get_user_model()


class AdminUserListSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_approved', 'is_admin_user', 'is_active', 'created_at',
            'posts_count', 'comments_count', 'likes_count'
        ]
    
    def get_posts_count(self, obj):
        return obj.posts.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_likes_count(self, obj):
        return obj.likes.count()


class StatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    approved_users = serializers.IntegerField()
    pending_users = serializers.IntegerField()
    admin_users = serializers.IntegerField()
    total_posts = serializers.IntegerField()
    published_posts = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    total_likes = serializers.IntegerField()