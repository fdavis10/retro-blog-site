from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    # Posts
    path('posts/', views.PostListView.as_view(), name='post_list'),
    path('posts/create/', views.PostCreateView.as_view(), name='post_create'),
    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post_detail'),
    path('posts/<int:pk>/update/', views.PostUpdateView.as_view(), name='post_update'),
    path('posts/<int:pk>/delete/', views.PostDeleteView.as_view(), name='post_delete'),
    
    # Comments
    path('posts/<int:post_id>/comments/', views.CommentListCreateView.as_view(), name='comment_list_create'),
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment_detail'),
    
    # Likes
    path('posts/<int:post_id>/like/', views.LikeToggleView.as_view(), name='like_toggle'),
]