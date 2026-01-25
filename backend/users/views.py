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
    RegistrationRequestDetailSerializer
)
from .permissions import IsApprovedUser, IsOwnerOrReadOnly

User = get_user_model()


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


class RegistrationRequestCreateView(generics.CreateAPIView):
    """
    Создание заявки на регистрацию (доступно всем).
    """
    serializer_class = RegistrationRequestSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'message': 'Заявка на регистрацию успешно отправлена! Ожидайте одобрения администратора.',
            'request': serializer.data
        }, status=status.HTTP_201_CREATED)