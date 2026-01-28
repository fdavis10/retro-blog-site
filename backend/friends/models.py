from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('accepted', 'Принята'),
        ('rejected', 'Отклонена'),
    ]
    
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_friend_requests',
        verbose_name=_('от кого')
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_friend_requests',
        verbose_name=_('кому')
    )
    status = models.CharField(
        _('статус'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(_('дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('дата обновления'), auto_now=True)
    
    class Meta:
        verbose_name = _('заявка в друзья')
        verbose_name_plural = _('заявки в друзья')
        unique_together = ['from_user', 'to_user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.from_user.username} -> {self.to_user.username} ({self.get_status_display()})'


class Friendship(models.Model):
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='friendships_as_user1',
        verbose_name=_('пользователь 1')
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='friendships_as_user2',
        verbose_name=_('пользователь 2')
    )
    created_at = models.DateTimeField(_('дата добавления'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('дружба')
        verbose_name_plural = _('дружба')
        unique_together = ['user1', 'user2']
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user1.username} ↔ {self.user2.username}'


class Subscription(models.Model):
    subscriber = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        verbose_name=_('подписчик')
    )
    subscribed_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscribers',
        verbose_name=_('на кого подписан')
    )
    created_at = models.DateTimeField(_('дата подписки'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('подписка')
        verbose_name_plural = _('подписки')
        unique_together = ['subscriber', 'subscribed_to']
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.subscriber.username} → {self.subscribed_to.username}'


class BlockedUser(models.Model):
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocked_users',
        verbose_name=_('кто заблокировал')
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocked_by',
        verbose_name=_('кого заблокировали')
    )
    created_at = models.DateTimeField(_('дата блокировки'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('блокировка')
        verbose_name_plural = _('блокировки')
        unique_together = ['blocker', 'blocked']
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.blocker.username} ⛔ {self.blocked.username}'


class InternalNotification(models.Model):
    TYPE_CHOICES = [
        ('friend_request', 'Заявка в друзья'),
        ('friend_accepted', 'Заявка принята'),
        ('friend_rejected', 'Заявка отклонена'),
        ('new_subscriber', 'Новый подписчик'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='internal_notifications',
        verbose_name=_('пользователь')
    )
    notification_type = models.CharField(
        _('тип'),
        max_length=30,
        choices=TYPE_CHOICES
    )
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_notifications',
        verbose_name=_('от кого'),
        null=True
    )
    is_read = models.BooleanField(_('прочитано'), default=False)
    created_at = models.DateTimeField(_('дата создания'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('внутреннее уведомление')
        verbose_name_plural = _('внутренние уведомления')
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} - {self.get_notification_type_display()}'