from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Post(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name=_('автор')
    )
    title = models.CharField(_('заголовок'), max_length=200)
    content = models.TextField(_('содержание'))  
    created_at = models.DateTimeField(_('дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('дата обновления'), auto_now=True)
    is_published = models.BooleanField(_('опубликовано'), default=True)
    
    class Meta:
        verbose_name = _('пост')
        verbose_name_plural = _('посты')
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def comments_count(self):
        return self.comments.count()


class PostImage(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_('пост')
    )
    image = models.ImageField(
        _('изображение'),
        upload_to='posts/images/%Y/%m/%d/'
    )
    caption = models.CharField(
        _('подпись'),
        max_length=200,
        blank=True
    )
    order = models.PositiveIntegerField(_('порядок'), default=0)
    uploaded_at = models.DateTimeField(_('дата загрузки'), auto_now_add=True)

    class Meta:
        verbose_name = _('изображение поста')
        verbose_name_plural = _('изображения постов')
        ordering = ['order', 'uploaded_at']

    def __str__(self):
        return f'Изображение для {self.post.title}'


class PostAttachment(models.Model):
    FILE_TYPES = [
        ('audio', _('Аудио')),
        ('document', _('Документ')),
        ('other', _('Другое')),
    ]
    
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name=_('пост')
    )
    file = models.FileField(
        _('файл'),
        upload_to='posts/attachments/%Y/%m/%d/'
    )
    file_type = models.CharField(
        _('тип файла'),
        max_length=20,
        choices=FILE_TYPES,
        default='other'
    )
    file_name = models.CharField(_('название файла'), max_length=255)
    file_size = models.PositiveIntegerField(_('размер файла'), default=0)
    uploaded_at = models.DateTimeField(_('дата загрузки'), auto_now_add=True)

    class Meta:
        verbose_name = _('вложение поста')
        verbose_name_plural = _('вложения постов')
        ordering = ['uploaded_at']

    def __str__(self):
        return f'{self.file_name} - {self.post.title}'

    def save(self, *args, **kwargs):
        if self.file:
            self.file_name = self.file.name.split('/')[-1]
            self.file_size = self.file.size
        super().save(*args, **kwargs)


class Comment(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name=_('пост')
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name=_('автор')
    )
    content = models.TextField(_('содержание'))
    created_at = models.DateTimeField(_('дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('комментарий')
        verbose_name_plural = _('комментарии')
        ordering = ['created_at']

    def __str__(self):
        return f'Комментарий от {self.author.username} к {self.post.title}'


class Like(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name=_('пост')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name=_('пользователь')
    )
    created_at = models.DateTimeField(_('дата создания'), auto_now_add=True)

    class Meta:
        verbose_name = _('лайк')
        verbose_name_plural = _('лайки')
        unique_together = ['post', 'user']  
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} лайкнул {self.post.title}'