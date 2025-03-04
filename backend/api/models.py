from django.db import models
from django.contrib.auth.models import AbstractUser

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    owner = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    weekly_hours = models.IntegerField()
    no_of_people = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    image_url = models.URLField(blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name
class User(AbstractUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, default="Unknown")   
    netId = models.CharField(max_length=255, default="None")   
    skills = models.JSONField(default=list)  
    interests = models.JSONField(default=list)  
    experience = models.CharField(max_length=255, default="Beginner")
    location = models.CharField(max_length=255, default="Unknown")
    weeklyHours = models.IntegerField(default=0) 

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name', 'netId']  

    def __str__(self):
        return self.email
