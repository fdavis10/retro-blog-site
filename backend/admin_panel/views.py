from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser as DjangoIsAdminUser
from django.contrib.auth import get_user_model
from django.db.models import Count
from .serializers import AdminUserListSerializer, StatsSerializer
from users.serializers import UserCreateSerializer, UserSerializer
from blog.models import Post, Comment, Like

User = get_user_model()


class UserListView(generics.ListAPIView):
    serializer_class = AdminUserListSerializer
    permission_classes = [DjangoIsAdminUser]
    queryset = User.objects.all().order_by('-created_at')
    
    def get_queryset(self):
        queryset = super().get_queryset()
        

        is_approved = self.request.query_params.get('is_approved')
        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == 'true')
        

        is_admin = self.request.query_params.get('is_admin_user')
        if is_admin is not None:
            queryset = queryset.filter(is_admin_user=is_admin.lower() == 'true')
        
        return queryset


class UserCreateView(generics.CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = [DjangoIsAdminUser]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [DjangoIsAdminUser]
    queryset = User.objects.all()


class UserApproveView(views.APIView):
    permission_classes = [DjangoIsAdminUser]
    
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'Пользователь не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user.is_approved = not user.is_approved
        user.save()
        
        return Response({
            'message': f'Пользователь {"одобрен" if user.is_approved else "снят с одобрения"}',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class UserDeleteView(generics.DestroyAPIView):
    permission_classes = [DjangoIsAdminUser]
    queryset = User.objects.all()


class StatsView(views.APIView):
    permission_classes = [DjangoIsAdminUser]
    
    def get(self, request):
        stats = {
            'total_users': User.objects.count(),
            'approved_users': User.objects.filter(is_approved=True).count(),
            'pending_users': User.objects.filter(is_approved=False).count(),
            'admin_users': User.objects.filter(is_admin_user=True).count(),
            'total_posts': Post.objects.count(),
            'published_posts': Post.objects.filter(is_published=True).count(),
            'total_comments': Comment.objects.count(),
            'total_likes': Like.objects.count(),
        }
        
        serializer = StatsSerializer(stats)
        return Response(serializer.data)