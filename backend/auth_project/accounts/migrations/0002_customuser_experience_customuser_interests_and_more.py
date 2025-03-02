# Generated by Django 5.1.5 on 2025-03-01 18:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="experience",
            field=models.CharField(default="Beginner", max_length=255),
        ),
        migrations.AddField(
            model_name="customuser",
            name="interests",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="customuser",
            name="location",
            field=models.CharField(default="Unknown", max_length=255),
        ),
        migrations.AddField(
            model_name="customuser",
            name="name",
            field=models.CharField(default="Unknown", max_length=255),
        ),
        migrations.AddField(
            model_name="customuser",
            name="netId",
            field=models.CharField(default="None", max_length=255),
        ),
        migrations.AddField(
            model_name="customuser",
            name="skills",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="customuser",
            name="weeklyHours",
            field=models.IntegerField(default=0),
        ),
    ]
