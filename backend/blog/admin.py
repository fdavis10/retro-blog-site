from django.contrib import admin
from .models import Post, PostImage, PostAttachment, Comment, Like


class PostImageInline(admin.TabularInline):
    model = PostImage
    extra = 1


class PostAttachmentInline(admin.TabularInline):
    model = PostAttachment
    extra = 1


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_published', 'created_at', 'likes_count', 'comments_count']
    list_filter = ['is_published', 'created_at', 'author']
    search_fields = ['title', 'content', 'author__username']
    inlines = [PostImageInline, PostAttachmentInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'created_at', 'content_preview']
    list_filter = ['created_at', 'author']
    search_fields = ['content', 'author__username', 'post__title']

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Содержание'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'post__title']