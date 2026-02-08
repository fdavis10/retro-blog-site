from django.utils import timezone
from datetime import timedelta


class LastSeenMiddleware:
    """
    Обновляет last_seen для аутентифицированных пользователей.
    Выполняется после обработки запроса (в т.ч. JWT-аутентификации в DRF).
    Ограничение: не чаще раза в 5 минут для снижения нагрузки на БД.
    """
    THROTTLE_MINUTES = 5

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if hasattr(request, 'user') and request.user.is_authenticated:
            now = timezone.now()
            last_seen = getattr(request.user, 'last_seen', None)
            if last_seen is None or (now - last_seen) > timedelta(minutes=self.THROTTLE_MINUTES):
                from django.contrib.auth import get_user_model
                User = get_user_model()
                User.objects.filter(pk=request.user.pk).update(last_seen=now)

        return response
