from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_verification_email(email, code, username):
    """
    Отправляет email с кодом подтверждения
    """
    subject = 'Подтверждение email - vld.blog'
    
    # Текстовая версия
    message = f"""
Привет, {username}!

Спасибо за регистрацию на vld.blog!

Ваш код подтверждения: {code}

Код действителен в течение 15 минут.

Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.

---
С уважением,
Команда vld.blog
    """
    
    # HTML версия (опционально)
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f0f2f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3b5998; margin: 0;">vld.blog</h1>
            </div>
            
            <h2 style="color: #333;">Привет, {username}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
                Спасибо за регистрацию на vld.blog!
            </p>
            
            <div style="background-color: #f0f2f5; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
                <p style="color: #666; margin: 0 0 10px 0;">Ваш код подтверждения:</p>
                <h1 style="color: #3b5998; letter-spacing: 5px; margin: 0; font-size: 36px;">{code}</h1>
            </div>
            
            <p style="color: #999; font-size: 14px;">
                Код действителен в течение 15 минут.
            </p>
            
            <p style="color: #999; font-size: 14px;">
                Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
                С уважением,<br>
                Команда vld.blog
            </p>
        </div>
    </body>
    </html>
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Ошибка отправки email: {e}")
        return False


def send_new_post_notification(post, users):
    """
    Отправляет уведомление о новом посте всем одобренным пользователям
    """
    subject = f'Новый пост: {post.title} - vld.blog'
    
    for user in users:
        message = f"""
Привет, {user.first_name or user.username}!

На vld.blog опубликован новый пост:

"{post.title}"
Автор: {post.author.first_name} {post.author.last_name}

Читайте на сайте: {settings.SITE_URL}/post/{post.id}

---
Вы получили это письмо, потому что подписаны на уведомления vld.blog.
Чтобы отписаться, зайдите в настройки профиля.
        """
        
        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f0f2f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #3b5998; margin: 0;">vld.blog</h1>
                </div>
                
                <h2 style="color: #333;">Привет, {user.first_name or user.username}!</h2>
                
                <p style="color: #666; line-height: 1.6;">
                    На vld.blog опубликован новый пост:
                </p>
                
                <div style="background-color: #f0f2f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #3b5998; margin: 0 0 10px 0;">{post.title}</h3>
                    <p style="color: #666; margin: 0;">Автор: {post.author.first_name} {post.author.last_name}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{settings.SITE_URL}/post/{post.id}" 
                       style="display: inline-block; background-color: #3b5998; color: white; 
                              padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                              font-weight: bold;">
                        Читать пост
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Вы получили это письмо, потому что подписаны на уведомления vld.blog.<br>
                    Чтобы отписаться, зайдите в настройки профиля.
                </p>
            </div>
        </body>
        </html>
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=True,  # Не падаем, если одно письмо не отправилось
            )
        except Exception as e:
            print(f"Ошибка отправки уведомления пользователю {user.email}: {e}")