from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'netId', 'skills', 'interests', 'experience', 'location', 'weeklyHours']

    def create(self, validated_data):
        email = validated_data.get("email")
        username = email.split("@")[0]  # Auto-generate username from email
        user = User.objects.create_user(username=username, **validated_data)
        return user
