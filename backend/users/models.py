from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class User(AbstractUser):
    """
    Кастомная модель пользователя.
    Регистрация только через администратора.
    """
    email = models.EmailField(_('email адрес'), unique=True)
    is_approved = models.BooleanField(
        _('одобрен'),
        default=False,
        help_text=_('Пользователь одобрен администратором для доступа к сайту')
    )
    is_admin_user = models.BooleanField(
        _('администратор блога'),
        default=False,
        help_text=_('Может публиковать посты')
    )
    created_at = models.DateTimeField(_('дата регистрации'), auto_now_add=True)
    updated_at = models.DateTimeField(_('дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('пользователь')
        verbose_name_plural = _('пользователи')
        ordering = ['-created_at']

    def __str__(self):
        return self.username


class Profile(models.Model):
    """
    Профиль пользователя с дополнительной информацией.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('пользователь')
    )
    avatar = models.ImageField(
        _('аватар'),
        upload_to='profiles/avatars/%Y/%m/%d/',
        blank=True,
        null=True
    )
    bio = models.TextField(
        _('о себе'),
        max_length=500,
        blank=True
    )
    birth_date = models.DateField(
        _('дата рождения'),
        blank=True,
        null=True
    )
    location = models.CharField(
        _('местоположение'),
        max_length=100,
        blank=True
    )
    website = models.URLField(
        _('веб-сайт'),
        max_length=200,
        blank=True
    )
    
    class Meta:
        verbose_name = _('профиль')
        verbose_name_plural = _('профили')

    def __str__(self):
        return f'Профиль {self.user.username}'


class RegistrationRequest(models.Model):
    """
    Заявка на регистрацию от нового пользователя.
    """
    STATUS_CHOICES = [
        ('pending', 'Ожидает рассмотрения'),
        ('approved', 'Одобрена'),
        ('rejected', 'Отклонена'),
    ]
    
    username = models.CharField(_('имя пользователя'), max_length=150, unique=True)
    email = models.EmailField(_('email'), unique=True)
    password = models.CharField(_('пароль'), max_length=128)  # Будет хеширован
    first_name = models.CharField(_('имя'), max_length=150)
    last_name = models.CharField(_('фамилия'), max_length=150)
    
    # Дополнительная информация из анкеты
    reason = models.TextField(
        _('почему хотите присоединиться'),
        max_length=500,
        help_text=_('Расскажите немного о себе и почему хотите присоединиться к блогу')
    )
    age = models.PositiveIntegerField(_('возраст'), blank=True, null=True)
    occupation = models.CharField(_('род деятельности'), max_length=200, blank=True)
    
    # Статус заявки
    status = models.CharField(
        _('статус'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Даты
    created_at = models.DateTimeField(_('дата подачи'), auto_now_add=True)
    processed_at = models.DateTimeField(_('дата обработки'), blank=True, null=True)
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_requests',
        verbose_name=_('обработана пользователем')
    )
    
    # Комментарий админа
    admin_comment = models.TextField(
        _('комментарий администратора'),
        blank=True,
        help_text=_('Причина отклонения или заметки')
    )
    
    class Meta:
        verbose_name = _('заявка на регистрацию')
        verbose_name_plural = _('заявки на регистрацию')
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Заявка от {self.username} ({self.get_status_display()})'