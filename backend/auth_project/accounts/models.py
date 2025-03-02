from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
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
