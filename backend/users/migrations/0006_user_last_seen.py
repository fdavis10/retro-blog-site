from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_profile_extended_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_seen',
            field=models.DateTimeField(blank=True, help_text='Время последней активности на сайте', null=True, verbose_name='последняя активность'),
        ),
    ]
