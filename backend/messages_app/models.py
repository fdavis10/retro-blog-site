from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Conversation(models.Model):
    """Диалог между двумя пользователями"""
    participant1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations_as_p1',
        verbose_name=_('участник 1')
    )
    participant2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations_as_p2',
        verbose_name=_('участник 2')
    )
    created_at = models.DateTimeField(_('создан'), auto_now_add=True)
    updated_at = models.DateTimeField(_('обновлён'), auto_now=True)

    class Meta:
        verbose_name = _('диалог')
        verbose_name_plural = _('диалоги')
        unique_together = ['participant1', 'participant2']
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.participant1.username} ↔ {self.participant2.username}'

    def get_other_participant(self, user):
        """Возвращает второго участника диалога"""
        return self.participant2 if user == self.participant1 else self.participant1

    @classmethod
    def get_or_create_between(cls, user1, user2):
        """Получить или создать диалог между двумя пользователями (канонический порядок)"""
        p1, p2 = sorted([user1, user2], key=lambda u: u.id)
        conv, _ = cls.objects.get_or_create(participant1=p1, participant2=p2)
        return conv


class Message(models.Model):
    """Сообщение в диалоге"""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name=_('диалог')
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name=_('отправитель')
    )
    content = models.TextField(_('текст'), max_length=2000)
    created_at = models.DateTimeField(_('отправлено'), auto_now_add=True)
    is_read = models.BooleanField(_('прочитано'), default=False)
    read_at = models.DateTimeField(_('прочитано в'), null=True, blank=True)

    class Meta:
        verbose_name = _('сообщение')
        verbose_name_plural = _('сообщения')
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}...'
