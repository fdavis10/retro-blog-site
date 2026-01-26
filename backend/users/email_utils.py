from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)


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
    
    # HTML версия
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f0f2f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 30px; text-align: center; background: linear-gradient(#4e69a2, #3b5998); border-radius: 8px 8px 0 0;">
                                <h1 style="color: white; margin: 0; font-size: 28px;">vld.blog</h1>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 30px;">
                                <h2 style="color: #333; margin-top: 0;">Привет, {username}!</h2>
                                
                                <p style="color: #666; line-height: 1.6; font-size: 15px;">
                                    Спасибо за регистрацию на vld.blog!
                                </p>
                                
                                <div style="background-color: #f0f2f5; padding: 30px; border-radius: 5px; text-align: center; margin: 30px 0;">
                                    <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">Ваш код подтверждения:</p>
                                    <div style="background-color: white; padding: 20px; border-radius: 5px; display: inline-block;">
                                        <span style="color: #3b5998; letter-spacing: 8px; font-size: 42px; font-weight: bold; font-family: 'Courier New', monospace;">{code}</span>
                                    </div>
                                </div>
                                
                                <p style="color: #999; font-size: 13px; margin-top: 20px;">
                                    ⏱️ Код действителен в течение 15 минут.
                                </p>
                                
                                <p style="color: #999; font-size: 13px;">
                                    🔒 Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    С уважением,<br>
                                    <strong style="color: #3b5998;">Команда vld.blog</strong>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    try:
        # Используем EmailMultiAlternatives для отправки HTML и текста
        email_message = EmailMultiAlternatives(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        email_message.attach_alternative(html_message, "text/html")
        email_message.send(fail_silently=False)
        
        logger.info(f"✅ Verification email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"❌ Error sending verification email to {email}: {e}")
        return False


def send_new_post_notification(post, users):
    """
    Отправляет уведомление о новом посте всем одобренным пользователям
    """
    if not users or not users.exists():
        logger.info("No users to notify about new post")
        return
    
    subject = f'Новый пост: {post.title} - vld.blog'
    
    # Получаем превью контента (первые 200 символов без HTML)
    import re
    content_preview = re.sub('<[^<]+?>', '', post.content)[:200]
    if len(post.content) > 200:
        content_preview += '...'
    
    author_name = f"{post.author.first_name} {post.author.last_name}".strip() if post.author.first_name else post.author.username
    post_url = f"{settings.SITE_URL}/post/{post.id}"
    
    success_count = 0
    fail_count = 0
    
    for user in users:
        user_name = user.first_name if user.first_name else user.username
        
        # Текстовая версия
        message = f"""
Привет, {user_name}!

На vld.blog опубликован новый пост:

"{post.title}"
Автор: {author_name}

{content_preview}

Читайте на сайте: {post_url}

---
Вы получили это письмо, потому что подписаны на уведомления vld.blog.
Чтобы отписаться, зайдите в настройки профиля: {settings.SITE_URL}/profile/edit
        """
        
        # HTML версия
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f0f2f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 30px; text-align: center; background: linear-gradient(#4e69a2, #3b5998); border-radius: 8px 8px 0 0;">
                                    <h1 style="color: white; margin: 0; font-size: 28px;">vld.blog</h1>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 30px;">
                                    <h2 style="color: #333; margin-top: 0;">Привет, {user_name}!</h2>
                                    
                                    <p style="color: #666; line-height: 1.6; font-size: 15px; margin-bottom: 25px;">
                                        На vld.blog опубликован новый пост:
                                    </p>
                                    
                                    <!-- Post Preview -->
                                    <div style="background-color: #f0f2f5; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b5998;">
                                        <h3 style="color: #3b5998; margin: 0 0 10px 0; font-size: 20px;">{post.title}</h3>
                                        <p style="color: #999; margin: 0 0 15px 0; font-size: 13px;">
                                            ✍️ <strong>{author_name}</strong>
                                        </p>
                                        <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">
                                            {content_preview}
                                        </p>
                                    </div>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 20px 0;">
                                                <a href="{post_url}" style="display: inline-block; background: linear-gradient(#4e69a2, #3b5998); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                                    📖 Читать полностью
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                    <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
                                        Вы получили это письмо, потому что подписаны на уведомления vld.blog.
                                    </p>
                                    <p style="margin: 0;">
                                        <a href="{settings.SITE_URL}/profile/edit" style="color: #3b5998; font-size: 12px; text-decoration: none;">
                                            ⚙️ Управление подписками
                                        </a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        try:
            email_message = EmailMultiAlternatives(
                subject=subject,
                body=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            email_message.attach_alternative(html_message, "text/html")
            email_message.send(fail_silently=False)
            
            logger.info(f"✅ Notification sent to {user.email}")
            success_count += 1
        except Exception as e:
            logger.error(f"❌ Error sending notification to {user.email}: {e}")
            fail_count += 1
    
    logger.info(f"📊 Post notification stats: {success_count} sent, {fail_count} failed")
    return success_count, fail_count