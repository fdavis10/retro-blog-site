# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_profile_email_notifications'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='relationship_status',
            field=models.CharField(blank=True, choices=[('', 'Не указано'), ('single', 'Не женат / Не замужем'), ('in_relationship', 'В отношениях'), ('engaged', 'Помолвлен(а)'), ('married', 'Женат / Замужем'), ('complicated', 'Всё сложно'), ('open', 'В открытых отношениях'), ('widowed', 'Вдовец / Вдова'), ('separated', 'В разводе')], max_length=30, verbose_name='семейное положение'),
        ),
        migrations.AddField(
            model_name='profile',
            name='political_views',
            field=models.CharField(blank=True, choices=[('', 'Не указано'), ('very_conservative', 'Очень консервативные'), ('conservative', 'Консервативные'), ('moderate', 'Умеренные'), ('liberal', 'Либеральные'), ('very_liberal', 'Очень либеральные'), ('apolitical', 'Аполитичен')], max_length=30, verbose_name='политические взгляды'),
        ),
        migrations.AddField(
            model_name='profile',
            name='religious_views',
            field=models.CharField(blank=True, max_length=100, verbose_name='религиозные взгляды'),
        ),
        migrations.AddField(
            model_name='profile',
            name='interests',
            field=models.TextField(blank=True, help_text='Музыка, книги, фильмы, хобби...', max_length=500, verbose_name='интересы'),
        ),
        migrations.AddField(
            model_name='profile',
            name='favorite_music',
            field=models.TextField(blank=True, max_length=300, verbose_name='любимая музыка'),
        ),
        migrations.AddField(
            model_name='profile',
            name='favorite_movies',
            field=models.TextField(blank=True, max_length=300, verbose_name='любимые фильмы'),
        ),
        migrations.AddField(
            model_name='profile',
            name='favorite_books',
            field=models.TextField(blank=True, max_length=300, verbose_name='любимые книги'),
        ),
        migrations.AddField(
            model_name='profile',
            name='smoking',
            field=models.CharField(blank=True, choices=[('', 'Не указано'), ('no', 'Не курю'), ('yes', 'Курю'), ('sometimes', 'Иногда')], max_length=20, verbose_name='курение'),
        ),
        migrations.AddField(
            model_name='profile',
            name='drinking',
            field=models.CharField(blank=True, choices=[('', 'Не указано'), ('no', 'Не пью'), ('yes', 'Пью'), ('sometimes', 'Иногда'), ('socially', 'В компании')], max_length=20, verbose_name='алкоголь'),
        ),
        migrations.AddField(
            model_name='profile',
            name='life_position',
            field=models.TextField(blank=True, help_text='Главное в жизни, взгляды на жизнь...', max_length=300, verbose_name='жизненная позиция'),
        ),
    ]