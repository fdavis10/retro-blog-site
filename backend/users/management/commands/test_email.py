from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'Тестирует отправку email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email получателя')

    def handle(self, *args, **options):
        email = options['email']
        
        self.stdout.write(self.style.WARNING(f'📧 Отправка тестового письма на {email}...'))
        self.stdout.write(f'   Host: {settings.EMAIL_HOST}')
        self.stdout.write(f'   Port: {settings.EMAIL_PORT}')
        self.stdout.write(f'   From: {settings.DEFAULT_FROM_EMAIL}')
        self.stdout.write(f'   SSL: {settings.EMAIL_USE_SSL}')
        self.stdout.write(f'   TLS: {settings.EMAIL_USE_TLS}')
        
        try:
            send_mail(
                subject='Тест отправки email - vld.blog',
                message='Это тестовое письмо от vld.blog. Если вы получили его - email работает! ✅',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            self.stdout.write(self.style.SUCCESS('✅ Письмо успешно отправлено!'))
            self.stdout.write(self.style.SUCCESS(f'   Проверьте {email}'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Ошибка отправки: {e}'))
            self.stdout.write(self.style.WARNING('Проверьте настройки EMAIL в .env файле'))