from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    
    TYPE_CHOICES = [
        ('maintenance', 'Технические работы'),
        ('update', 'Обновление'),
        ('news', 'Новость'),
        ('warning', 'Предупреждение'),
        ('info', 'Информация'),
    ]
    
    TYPE_COLORS = {
        'maintenance': {'bg': '#fff3cd', 'border': '#ffc107', 'text': '#856404'},
        'update': {'bg': '#d1ecf1', 'border': '#17a2b8', 'text': '#0c5460'},
        'news': {'bg': '#d4edda', 'border': '#28a745', 'text': '#155724'},
        'warning': {'bg': '#f8d7da', 'border': '#dc3545', 'text': '#721c24'},
        'info': {'bg': '#d1ecf1', 'border': '#3b5998', 'text': '#004085'},
    }
    
    title = models.CharField(_('заголовок'), max_length=200)
    message = models.TextField(_('сообщение'))
    type = models.CharField(
        _('тип уведомления'),
        max_length=20,
        choices=TYPE_CHOICES,
        default='info'
    )
    is_active = models.BooleanField(
        _('активно'),
        default=True,
        help_text=_('Показывать ли это уведомление пользователям')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_notifications',
        verbose_name=_('создано пользователем')
    )
    created_at = models.DateTimeField(_('дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('дата обновления'), auto_now=True)
    
    class Meta:
        verbose_name = _('уведомление')
        verbose_name_plural = _('уведомления')
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.get_type_display()}: {self.title}'


class UserNotificationStatus(models.Model):

    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_statuses',
        verbose_name=_('пользователь')
    )
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='user_statuses',
        verbose_name=_('уведомление')
    )
    is_read = models.BooleanField(_('прочитано'), default=False)
    is_dismissed = models.BooleanField(_('закрыто'), default=False)
    read_at = models.DateTimeField(_('дата прочтения'), null=True, blank=True)
    dismissed_at = models.DateTimeField(_('дата закрытия'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('статус уведомления')
        verbose_name_plural = _('статусы уведомлений')
        unique_together = ['user', 'notification']
        ordering = ['-notification__created_at']
    
    def __str__(self):
        return f'{self.user.username} - {self.notification.title}'