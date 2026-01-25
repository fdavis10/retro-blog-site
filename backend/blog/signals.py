from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Post
from users.email_utils import send_new_post_notification

User = get_user_model()


@receiver(post_save, sender=Post)
def notify_users_about_new_post(sender, instance, created, **kwargs):
    """
    Отправляет уведомления пользователям о новом посте.
    Срабатывает только при создании нового опубликованного поста.
    """
    if created and instance.is_published:
        users_to_notify = User.objects.filter(
            is_approved=True,
            is_active=True,
            profile__email_notifications=True
        ).exclude(
            id=instance.author.id  
        )
        
        if users_to_notify.exists():
            send_new_post_notification(instance, users_to_notify)
            
            print(f"✉️ Отправлено {users_to_notify.count()} уведомлений о новом посте: {instance.title}")