# Generated by Django 5.1.6 on 2025-02-12 23:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='project',
            old_name='image_url',
            new_name='img_url',
        ),
    ]
