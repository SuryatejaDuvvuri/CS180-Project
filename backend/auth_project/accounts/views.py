from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
import firebase_admin
from firebase_admin import credentials, firestore
# Create your views here.
cred = credentials.Certificate("firebase_key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


User = get_user_model()

db = firestore.client() 

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()  # Save in Django

        # Save user info in Firebase Firestore
        doc_ref = db.collection("users").document(str(user.id))
        doc_ref.set({
            "email": user.email,
            "username": user.username,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        return Response({"message": "User registered successfully in Firebase & Django!"}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# check in firebase if user exists
@api_view(['POST'])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    # Check Firebase for the user's email
    user_ref = db.collection("users").where("email", "==", email).get()
    
    if not user_ref:
        return Response({"error": "User not found in Firebase"}, status=status.HTTP_400_BAD_REQUEST)

    # Authenticate with Django
    user = authenticate(request, username=email, password=password)
    if user:
        login(request, user)
        return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)

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
