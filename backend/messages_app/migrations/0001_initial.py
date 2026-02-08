# Generated manually for messages_app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='создан')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='обновлён')),
                ('participant1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversations_as_p1', to=settings.AUTH_USER_MODEL, verbose_name='участник 1')),
                ('participant2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversations_as_p2', to=settings.AUTH_USER_MODEL, verbose_name='участник 2')),
            ],
            options={
                'verbose_name': 'диалог',
                'verbose_name_plural': 'диалоги',
                'ordering': ['-updated_at'],
                'unique_together': {('participant1', 'participant2')},
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(max_length=2000, verbose_name='текст')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='отправлено')),
                ('is_read', models.BooleanField(default=False, verbose_name='прочитано')),
                ('read_at', models.DateTimeField(blank=True, null=True, verbose_name='прочитано в')),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='messages_app.conversation', verbose_name='диалог')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to=settings.AUTH_USER_MODEL, verbose_name='отправитель')),
            ],
            options={
                'verbose_name': 'сообщение',
                'verbose_name_plural': 'сообщения',
                'ordering': ['created_at'],
            },
        ),
    ]
