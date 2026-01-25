from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
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
