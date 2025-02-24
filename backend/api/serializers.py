from rest_framework import serializers
from .models import Project, Author


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'email', 'created_at']
class ProjectSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 
                  'start_date', 'end_date', 
                  'no_of_people', 'category', 
                  'img_url', 'weekly_hours', 
                  'authors', 'color']