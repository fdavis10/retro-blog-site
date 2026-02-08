from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from .models import Profile, RegistrationRequest
from .serializers import (
    UserSerializer, LoginSerializer, ProfileUpdateSerializer,
    UserProfileUpdateSerializer, RegistrationRequestSerializer,
    RegistrationRequestDetailSerializer, EmailVerificationSerializer
)
from .permissions import IsApprovedUser, IsOwnerOrReadOnly
from .email_utils_old import send_verification_email
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class LoginView(views.APIView):
    """
    Вход пользователя с проверкой одобрения.
    Возвращает JWT токены.
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response(
                {'error': 'Неверные учетные данные'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_approved:
            return Response(
                {'error': 'Ваш аккаунт еще не одобрен администратором'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        User.objects.filter(pk=user.pk).update(last_seen=timezone.now())
        
        # Создаем токены
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


class LogoutView(views.APIView):
    """
    Выход пользователя (добавление токена в черный список).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Вы успешно вышли из системы'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Неверный токен'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveAPIView):
    """
    Получение профиля текущего пользователя.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get_object(self):
        return self.request.user


class UserProfileView(generics.RetrieveAPIView):
    """
    Получение профиля пользователя по username.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]
    lookup_field = 'username'
    queryset = User.objects.filter(is_approved=True)


class ProfileUpdateView(generics.UpdateAPIView):
    """
    Обновление профиля текущего пользователя.
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        logger.info(f'Profile update request for user: {request.user.username}')
        
        # Используем partial=True — обновляем только переданные поля (email и др. не обязательны)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        # ИСПРАВЛЕНИЕ: Логируем ответ
        response_data = serializer.data
        logger.info(f'Profile update response: {response_data}')
        logger.info(f'Response contains username: {response_data.get("username")}')
        logger.info(f'Response contains is_admin_user: {response_data.get("is_admin_user")}')
        
        return Response(response_data)


# uncoment later

class RegistrationRequestCreateView(generics.CreateAPIView):
    """
    Создание заявки на регистрацию (доступно всем).
    Отправляет код подтверждения на email.
    """
    serializer_class = RegistrationRequestSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Сохраняем заявку со статусом 'pending_email'
        registration_request = serializer.save()
        
        # Генерируем и отправляем код подтверждения
        code = registration_request.generate_verification_code()
        email_sent = send_verification_email(
            registration_request.email,
            code,
            registration_request.username
        )
        
        if not email_sent:
            # Если письмо не отправилось, удаляем заявку
            registration_request.delete()
            return Response({
                'error': 'Ошибка отправки email. Проверьте правильность адреса и попробуйте снова.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Код подтверждения отправлен на ваш email. Проверьте почту и введите код.',
            'request_id': registration_request.id,
            'email': registration_request.email
        }, status=status.HTTP_201_CREATED)


class EmailVerificationView(views.APIView):
    """
    Подтверждение email кодом.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        request_id = serializer.validated_data['request_id']
        code = serializer.validated_data['code']
        
        try:
            reg_request = RegistrationRequest.objects.get(id=request_id)
        except RegistrationRequest.DoesNotExist:
            return Response({
                'error': 'Заявка не найдена'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Проверяем, не подтвержден ли уже email
        if reg_request.email_verified:
            return Response({
                'error': 'Email уже подтвержден'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем код
        if not reg_request.is_verification_code_valid(code):
            return Response({
                'error': 'Неверный или истекший код подтверждения'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Подтверждаем email и меняем статус
        reg_request.email_verified = True
        reg_request.status = 'pending'
        reg_request.save()
        
        return Response({
            'message': 'Email успешно подтвержден! Ваша заявка отправлена на рассмотрение администратору.',
            'request': RegistrationRequestDetailSerializer(reg_request).data
        }, status=status.HTTP_200_OK)


class ResendVerificationCodeView(views.APIView):
    """
    Повторная отправка кода подтверждения.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        request_id = request.data.get('request_id')
        
        if not request_id:
            return Response({
                'error': 'Требуется request_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reg_request = RegistrationRequest.objects.get(id=request_id)
        except RegistrationRequest.DoesNotExist:
            return Response({
                'error': 'Заявка не найдена'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Проверяем, не подтвержден ли уже email
        if reg_request.email_verified:
            return Response({
                'error': 'Email уже подтвержден'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Генерируем новый код и отправляем
        code = reg_request.generate_verification_code()
        email_sent = send_verification_email(
            reg_request.email,
            code,
            reg_request.username
        )
        
        if not email_sent:
            return Response({
                'error': 'Ошибка отправки email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Новый код отправлен на ваш email'
        }, status=status.HTTP_200_OK)