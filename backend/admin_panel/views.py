from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser as DjangoIsAdminUser
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.db.models import Count
from django.utils import timezone
from .serializers import AdminUserListSerializer, StatsSerializer, RegistrationRequestAdminSerializer
from users.serializers import UserCreateSerializer, UserSerializer
from users.models import RegistrationRequest
from blog.models import Post, Comment, Like

User = get_user_model()


class UserListView(generics.ListAPIView):
    """
    Список всех пользователей для админ-панели.
    Доступно только суперпользователям.
    """
    serializer_class = AdminUserListSerializer
    permission_classes = [DjangoIsAdminUser]
    queryset = User.objects.all().order_by('-created_at')
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по статусу одобрения
        is_approved = self.request.query_params.get('is_approved')
        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == 'true')
        
        # Фильтрация по админ-статусу
        is_admin = self.request.query_params.get('is_admin_user')
        if is_admin is not None:
            queryset = queryset.filter(is_admin_user=is_admin.lower() == 'true')
        
        return queryset


class UserCreateView(generics.CreateAPIView):
    """
    Создание нового пользователя.
    Доступно только суперпользователям.
    """
    serializer_class = UserCreateSerializer
    permission_classes = [DjangoIsAdminUser]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Просмотр, обновление и удаление пользователя.
    Доступно только суперпользователям.
    """
    serializer_class = UserSerializer
    permission_classes = [DjangoIsAdminUser]
    queryset = User.objects.all()


class UserApproveView(views.APIView):
    """
    Одобрение или отмена одобрения пользователя.
    Доступно только суперпользователям.
    """
    permission_classes = [DjangoIsAdminUser]
    
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'Пользователь не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Переключаем статус одобрения
        user.is_approved = not user.is_approved
        user.save()
        
        return Response({
            'message': f'Пользователь {"одобрен" if user.is_approved else "снят с одобрения"}',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class UserDeleteView(generics.DestroyAPIView):
    """
    Удаление пользователя.
    Доступно только суперпользователям.
    """
    permission_classes = [DjangoIsAdminUser]
    queryset = User.objects.all()


class StatsView(views.APIView):
    """
    Статистика блога.
    Доступно только суперпользователям.
    """
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


class RegistrationRequestListView(generics.ListAPIView):
    """
    Список всех заявок на регистрацию.
    Доступно только суперпользователям.
    """
    serializer_class = RegistrationRequestAdminSerializer
    permission_classes = [DjangoIsAdminUser]
    queryset = RegistrationRequest.objects.all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


class RegistrationRequestDetailView(generics.RetrieveAPIView):
    """
    Детали заявки на регистрацию.
    Доступно только суперпользователям.
    """
    serializer_class = RegistrationRequestAdminSerializer
    permission_classes = [DjangoIsAdminUser]
    queryset = RegistrationRequest.objects.all()


class RegistrationRequestApproveView(views.APIView):
    """
    Одобрение заявки и создание пользователя.
    Доступно только суперпользователям.
    """
    permission_classes = [DjangoIsAdminUser]
    
    def post(self, request, pk):
        try:
            reg_request = RegistrationRequest.objects.get(pk=pk)
        except RegistrationRequest.DoesNotExist:
            return Response(
                {'error': 'Заявка не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if reg_request.status != 'pending':
            return Response(
                {'error': f'Заявка уже обработана ({reg_request.get_status_display()})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Создаем пользователя
        user = User.objects.create(
            username=reg_request.username,
            email=reg_request.email,
            password=reg_request.password,  # Уже хеширован
            first_name=reg_request.first_name,
            last_name=reg_request.last_name,
            is_approved=True,  # Сразу одобряем
            is_admin_user=False
        )
        
        # Обновляем заявку
        reg_request.status = 'approved'
        reg_request.processed_at = timezone.now()
        reg_request.processed_by = request.user
        reg_request.save()
        
        return Response({
            'message': 'Заявка одобрена, пользователь создан',
            'user': UserSerializer(user).data,
            'request': RegistrationRequestAdminSerializer(reg_request).data
        }, status=status.HTTP_200_OK)


class RegistrationRequestRejectView(views.APIView):
    """
    Отклонение заявки.
    Доступно только суперпользователям.
    """
    permission_classes = [DjangoIsAdminUser]
    
    def post(self, request, pk):
        try:
            reg_request = RegistrationRequest.objects.get(pk=pk)
        except RegistrationRequest.DoesNotExist:
            return Response(
                {'error': 'Заявка не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if reg_request.status != 'pending':
            return Response(
                {'error': f'Заявка уже обработана ({reg_request.get_status_display()})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем комментарий админа
        admin_comment = request.data.get('admin_comment', '')
        
        # Обновляем заявку
        reg_request.status = 'rejected'
        reg_request.processed_at = timezone.now()
        reg_request.processed_by = request.user
        reg_request.admin_comment = admin_comment
        reg_request.save()
        
        return Response({
            'message': 'Заявка отклонена',
            'request': RegistrationRequestAdminSerializer(reg_request).data
        }, status=status.HTTP_200_OK)


class RegistrationRequestDeleteView(generics.DestroyAPIView):
    """
    Удаление заявки.
    Доступно только суперпользователям.
    """
    permission_classes = [DjangoIsAdminUser]
    queryset = RegistrationRequest.objects.all()