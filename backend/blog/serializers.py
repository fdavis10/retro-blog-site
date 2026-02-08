from rest_framework import serializers
from .models import Post, PostImage, PostAttachment, Comment, Like, Category
from users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'color']


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image', 'caption', 'order', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class PostAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostAttachment
        fields = ['id', 'file', 'file_type', 'file_name', 'file_size', 'uploaded_at']
        read_only_fields = ['file_name', 'file_size', 'uploaded_at']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'author', 'post']


class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['created_at', 'user']


class PostListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'images', 'categories',
            'created_at', 'updated_at', 'is_published',
            'likes_count', 'comments_count', 'is_liked'
        ]
        read_only_fields = ['created_at', 'updated_at', 'author']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    attachments = PostAttachmentSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'images', 'attachments',
            'comments', 'categories', 'created_at', 'updated_at', 'is_published',
            'likes_count', 'comments_count', 'is_liked'
        ]
        read_only_fields = ['created_at', 'updated_at', 'author']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, read_only=True)
    attachments = PostAttachmentSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    uploaded_attachments = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    category_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'is_published', 'categories', 'category_name',
            'images', 'attachments', 'uploaded_images', 'uploaded_attachments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        uploaded_attachments = validated_data.pop('uploaded_attachments', [])
        category_name = validated_data.pop('category_name', None)
        
        post = Post.objects.create(**validated_data)
        
        # Обрабатываем множественные рубрики через запятую
        if category_name:
            category_names = [name.strip() for name in category_name.split(',') if name.strip()]
            for cat_name in category_names:
                category = Category.get_or_create_with_color(cat_name)
                post.categories.add(category)
        
        for order, image in enumerate(uploaded_images):
            PostImage.objects.create(post=post, image=image, order=order)
        
        for file in uploaded_attachments:
            file_type = 'other'
            if file.content_type.startswith('audio/'):
                file_type = 'audio'
            elif file.content_type in ['application/pdf', 'application/msword', 
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
                file_type = 'document'
            
            PostAttachment.objects.create(post=post, file=file, file_type=file_type)
        
        return post
    
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        uploaded_attachments = validated_data.pop('uploaded_attachments', [])
        category_name = validated_data.pop('category_name', None)
        
        # Обновляем рубрики если указаны
        if category_name is not None:
            instance.categories.clear()
            if category_name:
                category_names = [name.strip() for name in category_name.split(',') if name.strip()]
                for cat_name in category_names:
                    category = Category.get_or_create_with_color(cat_name)
                    instance.categories.add(category)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if uploaded_images:
            current_max_order = instance.images.count()
            for order, image in enumerate(uploaded_images):
                PostImage.objects.create(
                    post=instance,
                    image=image,
                    order=current_max_order + order
                )
        
        if uploaded_attachments:
            for file in uploaded_attachments:
                file_type = 'other'
                if file.content_type.startswith('audio/'):
                    file_type = 'audio'
                elif file.content_type in ['application/pdf', 'application/msword',
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
                    file_type = 'document'
                
                PostAttachment.objects.create(post=instance, file=file, file_type=file_type)
        
        return instance