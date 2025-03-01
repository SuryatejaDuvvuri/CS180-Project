
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model, authenticate, login, logout
from .serializers import RegisterSerializer
from rest_framework import status
import firebase_admin
from firebase_admin import auth, credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

User = get_user_model()
db = firestore.client()

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()

        user_data = {
            "email": user.email,
            "name": request.data.get("name"),
            "netId": request.data.get("netId"),
            "skills": request.data.get("skills", []),
            "interests": request.data.get("interests", []),
            "experience": request.data.get("experience"),
            "location": request.data.get("location"),
            "weeklyHours": request.data.get("weeklyHours"),
            "password": request.data.get("password"),
            "created_at": firestore.SERVER_TIMESTAMP,
        }
        db.collection("users").document(user.email).set(user_data)

        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user_ref = db.collection("users").where("email", "==", email).get()
    
    if not user_ref:
        return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=email, password=password)
    if user:
        login(request, user)
        return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def google_login(request):
    try:
        id_token = request.data.get("idToken")
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token.get("email")

        if not email:
            return Response({"error": "Invalid token, email not found"}, status=400)

        user, created = User.objects.get_or_create(email=email, defaults={"username": email.split('@')[0]})

        doc_ref = db.collection("users").document(user.email)
        doc_ref.set({"email": user.email, "username": user.username, "created_at": firestore.SERVER_TIMESTAMP})

        return Response({"message": "Google login successful!", "email": email}, status=200)
    
    except Exception as e:
        return Response({"error": str(e)}, status=400)

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
