from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Like
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateUpdateSerializer,
    CommentSerializer, LikeSerializer
)
from users.permissions import IsApprovedUser, IsAdminUser, IsCommentAuthorOrReadOnly


class PostListView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [IsApprovedUser]
    
    def get_queryset(self):
        return Post.objects.filter(is_published=True).select_related('author').prefetch_related('images')


class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostDetailSerializer
    permission_classes = [IsApprovedUser]
    queryset = Post.objects.filter(is_published=True)


class PostCreateView(generics.CreateAPIView):
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostUpdateView(generics.UpdateAPIView):
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Post.objects.all()


class PostDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = Post.objects.all()


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsApprovedUser]
    
    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id).select_related('author')
    
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