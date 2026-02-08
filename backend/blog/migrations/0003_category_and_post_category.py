# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0002_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='название')),
                ('color', models.CharField(choices=[('#1877F2', 'Primary (синий)'), ('#65676B', 'Secondary (серый)'), ('#42B72A', 'Success (зеленый)'), ('#F02849', 'Danger (красный)'), ('#F7B928', 'Warning (желтый)'), ('#45BD62', 'Info (голубой)')], max_length=7, verbose_name='цвет')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='дата создания')),
            ],
            options={
                'verbose_name': 'рубрика',
                'verbose_name_plural': 'рубрики',
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='post',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='posts', to='blog.category', verbose_name='рубрика'),
        ),
    ]
