from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import FriendRequest, Friendship, Subscription, InternalNotification


@receiver(post_save, sender=FriendRequest)
def notify_friend_request(sender, instance, created, **kwargs):
    if created and instance.status == 'pending':
        InternalNotification.objects.create(
            user=instance.to_user,
            notification_type='friend_request',
            from_user=instance.from_user
        )
        print(f"🔔 {instance.from_user.username} отправил заявку в друзья {instance.to_user.username}")


@receiver(post_save, sender=FriendRequest)
def notify_friend_request_status(sender, instance, created, **kwargs):
    if not created:
        if instance.status == 'accepted':
            InternalNotification.objects.create(
                user=instance.from_user,
                notification_type='friend_accepted',
                from_user=instance.to_user
            )
            print(f"✅ {instance.to_user.username} принял заявку от {instance.from_user.username}")
        elif instance.status == 'rejected':
            InternalNotification.objects.create(
                user=instance.from_user,
                notification_type='friend_rejected',
                from_user=instance.to_user
            )
            print(f"❌ {instance.to_user.username} отклонил заявку от {instance.from_user.username}")


@receiver(post_save, sender=Subscription)
def notify_new_subscriber(sender, instance, created, **kwargs):
    if created:
        InternalNotification.objects.create(
            user=instance.subscribed_to,
            notification_type='new_subscriber',
            from_user=instance.subscriber
        )
        print(f"👤 {instance.subscriber.username} подписался на {instance.subscribed_to.username}")