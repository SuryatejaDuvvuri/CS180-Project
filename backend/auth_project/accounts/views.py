from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
# Create your views here.

User = get_user_model()

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")
    user = authenticate(request, username=email, password=password)

    if user:
        login(request, user)
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
    
    return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_user(request):
    logout(request)
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def check_authentication(request):
    if request.user.is_authenticated:
        return Response({"is_authenticated": True, "user": request.user.email})
    return Response({"is_authenticated": False})


@api_view(['GET'])
def test_firebase(request):
    return Response({"message": "Firebase connection successful"}, status=status.HTTP_200_OK)
