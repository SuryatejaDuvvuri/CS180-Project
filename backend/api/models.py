from django.db import models


class Author(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    no_of_people = models.IntegerField()
    category = models.CharField(max_length=100)
    img_url = models.URLField(blank=True)
    weekly_hours = models.IntegerField()
    # authors = models.ManyToManyField('Author', related_name='projects')
    color = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name
