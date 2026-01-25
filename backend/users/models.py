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
    # Новое поле для подписки на уведомления
    email_notifications = models.BooleanField(
        _('email уведомления о новых постах'),
        default=True,
        help_text=_('Получать уведомления на email о публикации новых постов')
    )
    
    class Meta:
        verbose_name = _('профиль')
        verbose_name_plural = _('профили')

    def __str__(self):
        return f'Профиль {self.user.username}'