from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import Profile, RegistrationRequest
import json

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    """Сериализатор профиля пользователя"""
    
    class Meta:
        model = Profile
        fields = [
            'avatar', 'bio', 'birth_date', 'location', 'website', 'email_notifications',
            'relationship_status', 'political_views', 'religious_views', 'interests',
            'favorite_music', 'favorite_movies', 'favorite_books',
            'smoking', 'drinking', 'life_position'
        ]


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя с профилем"""
    profile = ProfileSerializer(read_only=True)
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_approved', 'is_admin_user', 'is_staff', 'is_superuser',
            'created_at', 'last_seen', 'is_online', 'profile'
        ]
        read_only_fields = ['id', 'created_at', 'is_approved', 'is_admin_user', 'is_staff', 'is_superuser', 'last_seen']

    def get_is_online(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        if not obj.last_seen:
            return False
        return (timezone.now() - obj.last_seen) < timedelta(minutes=5)


class UserCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания пользователя (только для администратора)"""
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'is_approved', 'is_admin_user'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Пароли не совпадают")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления профиля"""
    
    class Meta:
        model = Profile
        fields = ['avatar', 'bio', 'birth_date', 'location', 'website', 'email_notifications']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления данных пользователя и профиля - ИСПРАВЛЕНО"""
    profile = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'profile', 'avatar']
        read_only_fields = ['username']
    
    def update(self, instance, validated_data):
        # Извлекаем данные профиля и аватар
        profile_json = validated_data.pop('profile', None)
        avatar = validated_data.pop('avatar', None)
        
        # Обновляем данные пользователя
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Обновляем профиль
        profile = instance.profile
        
        # Парсим JSON с данными профиля
        if profile_json:
            try:
                profile_data = json.loads(profile_json)
                print(f"📝 Updating profile with data: {profile_data}")
                
                for attr, value in profile_data.items():
                    if hasattr(profile, attr):
                        # Для полей, которые могут быть пустыми (текстовые поля)
                        if attr in ['location', 'website', 'bio', 'religious_views',
                                   'interests', 'favorite_music', 'favorite_movies',
                                   'favorite_books', 'life_position']:
                            setattr(profile, attr, value if value else '')
                        # Для выборочных полей (CharField с choices)
                        elif attr in ['relationship_status', 'political_views', 'smoking', 'drinking']:
                            setattr(profile, attr, value if value else '')
                        # Для даты рождения: пустая строка или None -> None
                        elif attr == 'birth_date':
                            setattr(profile, attr, value if value else None)
                        # Для остальных полей (например, email_notifications)
                        else:
                            setattr(profile, attr, value)
                        print(f"  ✓ Set {attr} = {value}")
            except (json.JSONDecodeError, TypeError) as e:
                print(f"❌ Error parsing profile JSON: {e}")
                raise serializers.ValidationError(f"Invalid profile data: {e}")
        
        # Обновляем аватар отдельно
        if avatar:
            profile.avatar = avatar
            print(f"  ✓ Updated avatar")
        
        profile.save()
        print(f"✅ Profile saved successfully")
        
        # Перезагружаем instance чтобы получить свежие данные
        instance.refresh_from_db()
        
        return instance
    
    def to_representation(self, instance):
        """Возвращаем полные данные пользователя с профилем"""
        if hasattr(instance, 'profile'):
            instance.profile.refresh_from_db()
        
        return UserSerializer(instance).data


class LoginSerializer(serializers.Serializer):
    """Сериализатор для входа"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})


class RegistrationRequestSerializer(serializers.ModelSerializer):
    """Сериализатор для создания заявки на регистрацию"""
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        model = RegistrationRequest
        fields = [
            'id', 'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'reason', 'age', 'occupation',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        
        # Проверка уникальности username
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Пользователь с таким именем уже существует"})
        
        # Проверка уникальности email
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Пользователь с таким email уже существует"})
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Хешируем пароль
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class RegistrationRequestDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для просмотра заявки (для админа)"""
    processed_by_username = serializers.CharField(source='processed_by.username', read_only=True)
    
    class Meta:
        model = RegistrationRequest
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'reason', 'age', 'occupation', 'status', 'created_at',
            'processed_at', 'processed_by', 'processed_by_username', 'admin_comment'
        ]
        read_only_fields = ['id', 'created_at', 'processed_at', 'processed_by']


class EmailVerificationSerializer(serializers.Serializer):
    """Сериализатор для подтверждения email"""
    request_id = serializers.IntegerField()
    code = serializers.CharField(max_length=6, min_length=6)