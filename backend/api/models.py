from django.db import models

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
