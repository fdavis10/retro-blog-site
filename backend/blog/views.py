from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Like, Category
from friends.models import Friendship
from django.db.models import Q
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateUpdateSerializer,
    CommentSerializer, LikeSerializer
)
from users.permissions import IsApprovedUser, IsAdminUser, IsCommentAuthorOrReadOnly, IsPostAuthorOrAdmin


class PostListView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [IsApprovedUser]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.filter(is_published=True).select_related('author', 'category').prefetch_related('images')
        
        # Получаем список друзей пользователя
        friendships = Friendship.objects.filter(
            Q(user1=user) | Q(user2=user)
        )
        friend_ids = []
        for friendship in friendships:
            if friendship.user1 == user:
                friend_ids.append(friendship.user2.id)
            else:
                friend_ids.append(friendship.user1.id)
        
        # Если есть друзья, сортируем: сначала посты друзей, потом остальные
        if friend_ids:
            from django.db.models import Case, When, IntegerField
            queryset = queryset.annotate(
                is_friend_post=Case(
                    When(author_id__in=friend_ids, then=1),
                    default=0,
                    output_field=IntegerField()
                )
            ).order_by('-is_friend_post', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset


class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostDetailSerializer
    permission_classes = [IsApprovedUser]
    queryset = Post.objects.filter(is_published=True)


class PostCreateView(generics.CreateAPIView):
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsApprovedUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostUpdateView(generics.UpdateAPIView):
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsApprovedUser, IsPostAuthorOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Post.objects.all()


class PostDeleteView(generics.DestroyAPIView):
    permission_classes = [IsApprovedUser, IsPostAuthorOrAdmin]
    queryset = Post.objects.all()


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsApprovedUser]
    
    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id).select_related('author', 'author__profile')
    
    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id, is_published=True)
        serializer.save(author=self.request.user, post=post)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsApprovedUser, IsCommentAuthorOrReadOnly]
    queryset = Comment.objects.all()


class LikeToggleView(views.APIView):
    permission_classes = [IsApprovedUser]
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id, is_published=True)
        user = request.user
        
        like = Like.objects.filter(post=post, user=user).first()
        
        if like:
            like.delete()
            return Response({
                'message': 'Лайк удален',
                'is_liked': False,
                'likes_count': post.likes_count
            }, status=status.HTTP_200_OK)
        else:
            Like.objects.create(post=post, user=user)
            return Response({
                'message': 'Лайк поставлен',
                'is_liked': True,
                'likes_count': post.likes_count
            }, status=status.HTTP_201_CREATED)


class UserPostsView(generics.ListAPIView):
    """Получить посты конкретного пользователя"""
    serializer_class = PostListSerializer
    permission_classes = [IsApprovedUser]
    
    def get_queryset(self):
        username = self.kwargs['username']
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = get_object_or_404(User, username=username, is_approved=True)
        return Post.objects.filter(
            author=user,
            is_published=True
        ).select_related('author', 'category').prefetch_related('images').order_by('-created_at')


class UserLikedPostsView(generics.ListAPIView):
    """Получить посты, которые лайкнул пользователь"""
    serializer_class = PostListSerializer
    permission_classes = [IsApprovedUser]
    
    def get_queryset(self):
        username = self.kwargs['username']
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = get_object_or_404(User, username=username, is_approved=True)
        liked_post_ids = Like.objects.filter(user=user).values_list('post_id', flat=True)
        return Post.objects.filter(
            id__in=liked_post_ids,
            is_published=True
        ).select_related('author', 'category').prefetch_related('images').order_by('-created_at')


class SearchView(views.APIView):
    """Поиск по постам, рубрикам, комментариям"""
    permission_classes = [IsApprovedUser]
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({
                'posts': [],
                'categories': [],
                'comments': []
            })
        
        # Поиск по постам (заголовок и содержание)
        posts = Post.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query),
            is_published=True
        ).select_related('author', 'category').prefetch_related('images')[:20]
        
        # Поиск по рубрикам
        categories = Category.objects.filter(name__icontains=query)[:10]
        
        # Поиск по комментариям
        comments = Comment.objects.filter(
            content__icontains=query
        ).select_related('author', 'post', 'post__author')[:20]
        
        posts_data = PostListSerializer(posts, many=True, context={'request': request}).data
        categories_data = [{'id': cat.id, 'name': cat.name, 'color': cat.color} for cat in categories]
        comments_data = []
        
        for comment in comments:
            comments_data.append({
                'id': comment.id,
                'content': comment.content,
                'author': {
                    'id': comment.author.id,
                    'username': comment.author.username,
                    'first_name': comment.author.first_name,
                    'last_name': comment.author.last_name,
                },
                'post': {
                    'id': comment.post.id,
                    'title': comment.post.title,
                    'author': {
                        'id': comment.post.author.id,
                        'username': comment.post.author.username,
                    }
                },
                'created_at': comment.created_at
            })
        
        return Response({
            'posts': posts_data,
            'categories': categories_data,
            'comments': comments_data
        })