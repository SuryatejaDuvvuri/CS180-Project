from django.shortcuts import render

# Create your views here.

import os
import random
import re
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
from django.contrib.auth import get_user_model, authenticate, login, logout
import json
import firebase_admin
from firebase_admin import auth, credentials, firestore
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.generics import DestroyAPIView, RetrieveUpdateAPIView
from .models import Project
from .serializers import ProjectSerializer
from firebase import db
import ollama
import requests
from google.cloud import storage
import uuid
from .recommendations import recommend_projects
from .sendEmail import sendEmail
import datetime

User = get_user_model()
# db = firestore.client()
OLLAMA_URL = os.getenv("OLLAMA_API_URL", "http://127.0.0.1:11434")
def get_user_id_by_email(email):
        users_query = db.collection("users").where("email", "==", email).stream()
        
        for user_doc in users_query:
            return user_doc.id 
    
        return None 

def serialize_firestore_data(document):
    """
    Convert Firestore document to a JSON-serializable format.
    """
    data = document.to_dict()
    for key, value in data.items():
        if isinstance(value, firestore.SERVER_TIMESTAMP) or isinstance(value, datetime.datetime):
            data[key] = value.isoformat()  # Convert timestamp to ISO format
    return data

class FeedBackViewSet(viewsets.ViewSet):
    def list(self,request,project_id):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return JsonResponse({"error": "Unauthorized"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            user_email = decoded_token.get("email")
           

            users_ref = db.collection("users").stream()
            owner_email = None
            owner_id = None

            for user_doc in users_ref:
                user_projects_ref = db.collection("users").document(user_doc.id).collection("projects_created").document(project_id)
                if user_projects_ref.get().exists:
                    owner_email = user_doc.get("email")  
                    owner_id = user_doc.id
                   
                    break
            if not owner_email:
                return JsonResponse({"error": "Project not found"}, status=404)
            
            feedbacks_ref = db.collection("users").document(owner_id).collection("projects_created").document(project_id).collection("Feedback").stream()
            feedbacks = [{**feedback.to_dict(), "id": feedback.id} for feedback in feedbacks_ref]
            return JsonResponse({"feedback": feedbacks}, status=200)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=500)
    def create(self, request, project_id):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return JsonResponse({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            user_email = decoded_token.get("email")
            user_name = decoded_token.get("name", "Anonymous")
            owner_id = None
            owner_email = None

            users_ref = db.collection("users").stream()
            for user_doc in users_ref:
                user_projects_ref = db.collection("users").document(user_doc.id).collection("projects_created").document(project_id)
                if user_projects_ref.get().exists:
                    owner_email = user_doc.get("email")
                    owner_id = user_doc.id
                   
                    break

            if not owner_email or not owner_id:
                return JsonResponse({"error": "Project not found"}, status=404)


            user_query = db.collection("users").where("email", "==", user_email).stream()
            user_doc = next(user_query, None)

            if not user_doc:
                return JsonResponse({"error": "User not found"}, status=404)

            user_id = user_doc.id 
            print(f"✅ Found Firestore User ID: {user_id}")

            joined_projects_ref = db.collection("users").document(user_id).collection("projects_joined").document(project_id)
            joined_doc = joined_projects_ref.get()

            if not joined_doc.exists:
                return JsonResponse({"error": "User is not a member of this project"}, status=403)

            try:
                data = json.loads(request.body)
                experience = data.get("experience", "").strip()
                improvements = data.get("improvements", "").strip()
            except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON format"}, status=400)

            if not experience or not improvements:
                return JsonResponse({"error": "Feedback fields cannot be empty"}, status=400)

            feedback_collection_path = f"users/{owner_id}/projects_created/{project_id}/Feedback"

            feedback_ref = db.collection("users").document(owner_id).collection("projects_created").document(project_id).collection("Feedback").document()

            feedback_data = {
                "name": user_name,
                "email": user_email,
                "experience": experience,
                "improvements": improvements,
                "date_submitted": firestore.SERVER_TIMESTAMP, 
            }

            try:
                feedback_ref.set(feedback_data)
                print(f"Feedback successfully added: {feedback_data}")
            except Exception as firestore_error:

                return JsonResponse({"error": str(firestore_error)}, status=500)
            stored_feedback = feedback_ref.get().to_dict()

            return JsonResponse(
                {"message": "Feedback submitted successfully", "feedback": stored_feedback},
                status=201
            )

        except Exception as e:
            print(f"ERROR: {str(e)}")
            return JsonResponse({"error": str(e)}, status=500)
class ApplicantViewSet(viewsets.ViewSet):
    def list(self,request,project_id,email):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            firebase_email = decoded_token.get("email")

            if firebase_email != email:
                return Response({"error": "Unauthorized access"}, status=403)

            users_query = db.collection("users").where("email", "==", email).stream()
            user_doc = next(users_query, None)
            
            user_id = get_user_id_by_email(firebase_email)

            if not user_doc or not user_doc.exists:
                return Response({"error": "User not found"}, status=404)

            applicants_ref = db.collection("users").document(user_id).collection("projects_created").document(project_id).collection("Applicants").stream()
            applicants = [{**applicant.to_dict(), "id": applicant.id} for applicant in applicants_ref]

            return JsonResponse({"applicants": applicants}, status=200)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=500)
    # def create(self, request):
    #     try:
    #         data = json.loads(request.body)
    #         required_fields = ["name", "email", "project_id"]
    #         missing = [field for field in required_fields if field not in data]
    #         if missing:
    #             return Response({"error": f"Missing fields: {', '.join(missing)}"}, status=400)

    #         applicant_ref = db.collection("Applicants").document()
    #         applicant_data = {
    #             "name": data["name"],
    #             "email": data["email"],
    #             "project_id": data["project_id"],
    #             "position":data["position"],
    #             "status": data.get("status", "pending"),
    #             "submission_date": data.get("submission_date", None),
    #         }

    #         applicant_ref.set(applicant_data) 

    #         print("Applicant successfully added:", applicant_data) 

    #         return JsonResponse(
    #             {"message": "Applicant created successfully", "applicant": applicant_data},
    #             status=201
    #         )

    #     except json.JSONDecodeError:
    #         print("Invalid JSON format received!")
    #         return Response({"error": "Invalid JSON format"}, status=400)

    #     except Exception as e:
    #         return JsonResponse({"error": str(e)}, status=500)
    def delete(self, request, applicant_id=None):
        try:
            if not applicant_id:
                return Response({"error": "Applicant ID is required"}, status=400)

            applicant_ref = db.collection("Applicants").document(applicant_id)
            applicant_data = applicant_ref.get()

            if not applicant_data.exists:
                return Response({"error": "Applicant not found"}, status=404)

            print(f"Deleting applicant: {applicant_id}, Data: {applicant_data.to_dict()}")
            applicant_ref.delete()

            return Response({"message": f"Applicant {applicant_id} deleted successfully"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    @csrf_exempt
    def apply_to_project(self, request, project_id):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            applicant_email = decoded_token.get("email") 

            data = json.loads(request.body)
            project_id = data.get("project_id")
            owner_email = data.get("owner_email")
            position = data.get("position")
            cv_base64 = data.get("cv", None)
            applicant_query = db.collection("users").where("email", "==", applicant_email).stream()
            owner_user_id = get_user_id_by_email(owner_email)
            applicant_data = None

            for doc in applicant_query:
                applicant_data = doc.to_dict()
                break  

            if not applicant_data:
                return JsonResponse({"error": "Applicant profile not found"}, status=404)

            
            # user_docs = list(applicant_query)
            # if not user_docs:
            #     return Response({"error": "User not found"}, status=404)
            # user_doc = user_docs[0]
            # user_id = user_doc.id  
            
            
            project_ref = db.collection("users").document(owner_user_id).collection("projects_created").document(project_id)
            application_ref = project_ref.collection("Applicants").document(applicant_email)

            if application_ref.get().exists:
                return JsonResponse({"error": "You have already applied to this project"}, status=400)
            project_doc = project_ref.get()
            if not project_doc.exists:
                return JsonResponse({"error": "Project not found"}, status=404)

            project_data = project_doc.to_dict() 
            print(f"Project Data Retrieved: {project_data}") 
            
            application_data = {
                    "email": applicant_email,
                    "fullname": applicant_data.get("fullname", "Unknown"),
                    "pronouns": applicant_data.get("pronouns", ""),
                    "skills": applicant_data.get("skills", []),
                    "interests": applicant_data.get("interests", []),
                    "experience": applicant_data.get("experience", ""),
                    "github": applicant_data.get("github", ""),
                    "linkedin": applicant_data.get("linkedin", ""),
                    "resume": applicant_data.get("resume",None),
                    "cv": cv_base64,
                    "position": position,
                    "status": "Pending", 
                    "applied_at": firestore.SERVER_TIMESTAMP
                }

            application_ref.set(application_data)
            sendEmail(
                recipient_email=owner_email,  
                name=project_data["owner"],
                subject=f"New Applicant for {project_data['name']}",
                email_type="new_application",
                project_name=project_data["name"],
                applicant_name=applicant_data.get("fullname"),
                position=position,
                applicant_email=applicant_email,
                linkedin=applicant_data.get("linkedin", "N/A"),
                github=applicant_data.get("github", "N/A")
            )


            sendEmail(
                recipient_email=applicant_email,
                name=applicant_data["fullname"],
                subject=f"Application Confirmation for {project_data['name']}",
                email_type="thanks",
                project_name=project_data["name"]
            )

            return JsonResponse({"message": "Application submitted successfully"}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    

        
    def modify(self, request, project_id, applicant_email):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Unauthorized"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            owner_email = decoded_token.get("email")
            owner_id = get_user_id_by_email(owner_email)
            project_ref = db.collection("users").document(owner_id).collection("projects_created").document(project_id)
            project_doc = project_ref.get()
            
            if not project_doc.exists:
                return Response({"error": "Project not found"}, status=404)

            project_data = project_doc.to_dict()

            if project_data.get("owner") != owner_email:
                return Response({"error": "You are not authorized to manage applications"}, status=403)

            data = request.data
            new_status = data.get("status")

            if new_status not in ["Accepted", "Rejected"]:
                return Response({"error": "Invalid status. Choose 'Accepted' or 'Rejected'"}, status=400)

            applicants_ref = project_ref.collection("Applicants").document(applicant_email)
            applicant_doc = applicants_ref.get()

            if not applicant_doc.exists:
                return Response({"error": "Applicant not found"}, status=404)
            
            applicant_data = applicant_doc.to_dict()
            applicant_name = applicant_data.get("fullname", "Applicant")
            
            subject = f"Application Update for {project_data['name']}"
            email_type = "accept" if new_status == "Accepted" else "reject"

            sendEmail(
                recipient_email=applicant_email,
                name=applicant_name,
                subject=subject,
                email_type=email_type,
                project_name=project_data["name"]
            )
            
            print(new_status)
            if new_status == "Rejected":
                applicants_ref.delete()
                return Response({"message": f"Applicant {applicant_email} has been rejected and removed."}, status=200)
            else:
                applicants_ref.update({"status": new_status})
                new_team_size = project_data.get("number_of_people", 0) + 1
                project_ref.update({"number_of_people": new_team_size})
                if applicant_doc:
                    applicant_id = applicant_doc.id
                    applicant_uid = get_user_id_by_email(applicant_id)
                    joined_ref = db.collection("users").document(applicant_uid).collection("projects_joined").document(project_id)
                    # joined_ref.set({"name": project_data.get("name", "Unnamed Project"), "status": "Accepted"})
                    joined_doc = joined_ref.get()
                    if not joined_ref.get().exists:
                        
                        joined_ref.set({
                            "name": project_data.get("name", "Unnamed Project"),
                            "status": "Accepted",
                            "owner": project_data.get("owner", ""),
                            "category": project_data.get("category", "N/A"),
                            "looking_for": project_data.get("looking_for", "N/A"),
                            "weekly_hours": project_data.get("weekly_hours", 0),
                            "team_size": project_data.get("team_size", 1),
                            "start_date": project_data.get("start_date", ""),
                            "end_date": project_data.get("end_date", ""),
                            "role": applicant_data.get("position") 
                        })
                    
                    return Response({**joined_ref.get().to_dict(), "id": joined_ref.id}, status=200)
            
           

            return Response({"message": f"Applicant {applicant_name} has been {new_status}"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class UserProfileViewSet(viewsets.ViewSet):
    @csrf_exempt
    def list(self,request):
        try:
            users_ref = db.collection("users").stream()
            users = [{**user.to_dict(),"id": user.id} for user in users_ref]
            return JsonResponse({"users": users}, status=200)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=500)
        
    def retrieve(self, request, email):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            firebase_email = decoded_token.get("email")

            is_self = firebase_email == email
            is_project_owner = db.collection("projects").where("owner", "==", firebase_email).limit(1).stream()

            # if not is_self and not any(is_project_owner):
            #     return Response({"error": "Unauthorized access"}, status=403)

            users_query = db.collection("users").where("email", "==", email).stream()
            user_doc = next(users_query, None)

            if not user_doc:
                return Response({"error": "User not found"}, status=404)

            return Response({**user_doc.to_dict(), "id": user_doc.id}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    @csrf_exempt
    def login_user(self,request):
        data = json.loads(request.body.decode("utf-8"))
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password are required"}, status=400)
        user_docs = db.collection("users").where("email", "==", email).stream()
        user_data = None
        for doc in user_docs:
            user_data = doc.to_dict()
            break 

        if not user_data:
            return JsonResponse({"error": "User not found"}, status=400)

        stored_password = user_data.get("password")
        if password != stored_password:
            return JsonResponse({"error": "Invalid credentials"}, status=400)

        return JsonResponse({"message": "Login successful!", "user": {"fullname": user_data.get("fullname"), "net_id": user_data.get("net_id")}}, status=200)
    @csrf_exempt
    def create(self, request):
        try:
            if not request.body:
                return JsonResponse({"error": "Empty request body"}, status=400)

            data = json.loads(request.body.decode("utf-8"))
            print("Received Data:", data)

            email = data.get("email")
            if not email:
                return JsonResponse({"error": "Email is required"}, status=400)

            existing_users = list(db.collection("users").where("email", "==", email).stream())
            if existing_users:
                return Response({"error": "User with this Email already exists"}, status=400)

            user_ref = db.collection("users").document()

            weekly_hours = data.get("weekly_hours", 0)
            if isinstance(weekly_hours, str) and not weekly_hours.isdigit():
                return JsonResponse({"error": "weekly_hours must be a number"}, status=400)

            user_data = {
                "id": user_ref.id,
                "fullname": data.get("fullname", ""),
                "net_id": data.get("net_id"),
                "email": data.get("email", ""),
                "password": data.get("password", ""),
                "pronouns": data.get("pronouns", ""),
                "skills": data.get("skills", []),
                "interests": data.get("interests", []),
                "experience": data.get("experience", ""),
                "location": data.get("location", ""),
                "weekly_hours": int(weekly_hours),
                "github": data.get("github", "").strip(),
                "linkedin": data.get("linkedin", "").strip(),
                "resume": data.get("resume", ""),
            }


            user_ref.collection("projects_created").document("init").set({"initialized": True})
            user_ref.collection("projects_joined").document("init").set({"initialized": True})


            user_ref.set(user_data)

            return JsonResponse({"message": "User profile created successfully", "user": user_data}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            print(f"Signup Error: {e}")
            return JsonResponse({"error": str(e)}, status=500)
    def list_projects(self, request, user_id):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)
            
            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            firebase_uid = decoded_token.get("uid")
            email_pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
            if re.match(email_pattern, user_id):
                # Convert email to Firestore ID
                user_query = db.collection("users").where("email", "==", user_id).stream()
                user_doc = next(user_query, None)

                if not user_doc:
                    return Response({"error": "User not found"}, status=404)

                user_id = user_doc.id 
            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return Response({"error": "User not found"}, status=404)


            created_projects_ref = user_ref.collection("projects_created").stream()
            created_projects = [
                {**proj.to_dict(), "id": proj.id} for proj in created_projects_ref
            ]
            joined_projects_ref = user_ref.collection("projects_joined").stream()
            joined_projects = [
                {**proj.to_dict(), "id": proj.id} for proj in joined_projects_ref
            ]
            


            return Response({
                "projects_created": created_projects,
                "projects_joined": joined_projects
            }, status=200)

        except Exception as e:
             return Response({"error": str(e)}, status=500)
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
        

    def logout_user(request):
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

    def check_authentication(request):
        if request.user.is_authenticated:
            return Response({"is_authenticated": True, "user": request.user.email})
        return Response({"is_authenticated": False})
    @csrf_exempt
    def update(self, request, user_id):
         try:
            data = json.loads(request.body)

            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return Response({"error": "User not found"}, status=404)

            update_data = {
                key: data[key] for key in data if key in user_doc.to_dict() and data[key]
            }

            user_ref.update(update_data)

            return Response({"message": "User profile updated successfully", "updated_data": update_data}, status=200)
         except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    @csrf_exempt
    def delete(self, request, user_id):
        try:
            user_ref = db.collection("users").document(user_id)
            user_doc = user_ref.get()

            if not user_doc.exists():
                return Response({"error": "User not found"}, status=404)

            user_ref.delete()
            return Response({"message": f"User {user_id} deleted successfully"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ProjectViewSet(viewsets.ViewSet):
    def generate_summary(self, description):
        try:
            print("Project Description:", description)

            prompt = f"""
            Summarize a project in one short sentence.
            Here is a project description:

            {description}

            Summary:
            """


            response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "llama3.2", 
                    "prompt": prompt,
                    "stream": False
                }
            ).json()

          
            summary = response.get("response", "").strip()

            if not summary:
                return "No summary available"

            return summary

        except Exception as e:
            print(f"Error generating summary: {e}")
            return "No summary available"
        
    def list(self, request):
        try:
            auth_header = request.headers.get("Authorization")
            user_projects_ref = db.collection("users").stream()
            public_projects = []
            if not auth_header or not auth_header.startswith("Bearer "):
                for user_doc in user_projects_ref:
                    user_id = user_doc.id
                    created_projects_ref = db.collection("users").document(user_id).collection("projects_created").stream()
                    created_projects = [{**proj.to_dict(), "id": proj.id} for proj in created_projects_ref]

                   
                    public_projects.extend(created_projects)
                random_projects = random.sample(public_projects, min(5, len(public_projects)))
                return Response(random_projects, status=200)
            
            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            
            email = decoded_token.get("email")
            projects = []
            for user_doc in user_projects_ref:
                user_data = user_doc.to_dict()
                if user_data.get("email") == email:
                    continue  
                created_projects_ref = db.collection("users").document(user_doc.id).collection("projects_created").stream()
                created_projects = [{**proj.to_dict(), "id": proj.id} for proj in created_projects_ref]
                
                joined_projects_ref = db.collection("users").document(user_doc.id).collection("projects_joined").stream()
                joined_projects = [{**proj.to_dict(), "id": proj.id} for proj in joined_projects_ref]
                projects.extend(created_projects + joined_projects)
            # proj_ref = db.collection("Projects")
            category_filter = request.GET.get("category", None)
            
            if category_filter and category_filter != "All":
                created_projects = [proj for proj in created_projects if proj.get("category") == category_filter]
                joined_projects = [proj for proj in joined_projects if proj.get("category") == category_filter]

            return Response(projects, status=200)
        
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    def retrieve(self, request, project_id):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return JsonResponse({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            user_email = decoded_token.get("email")

            print(f"🔹 Request for project ID: {project_id} by {user_email}")

            projects_ref = db.collection("users").stream()
            found_project = None

            for user_doc in projects_ref:
                project_ref = db.collection("users").document(user_doc.id).collection("projects_created").document(project_id)
                project_doc = project_ref.get()
                if project_doc.exists:
                    found_project = project_doc.to_dict()
                    found_project["id"] = project_id
                    print(f"✅ Found project: {found_project}")
                    break
            
            if not found_project:
                return JsonResponse({"error": "Project not found"}, status=404)

            return JsonResponse(found_project, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    def create(self,request):
        try:
            if not request.body:
                return JsonResponse({"error": "Empty request body"}, status=400)
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return Response({"error": "Missing or invalid Authorization token"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            firebase_email = decoded_token.get("email")
            firebase_uid = decoded_token.get("uid") 

            print(firebase_email)
            data = json.loads(request.body.decode("utf-8"))
            if not data.get("name") or not data.get("category"):
                return JsonResponse({"error": "Project name and category are required"}, status=400)
            summary = self.generate_summary(data.get("description", ""))

            user_query = db.collection("users").where("email", "==", firebase_email).stream()
            user_docs = list(user_query)
            if not user_docs:
                return JsonResponse({"error": "User not found"}, status=404)

            user_doc = user_docs[0]
            user_id = user_doc.id 
            print(f"User ID: {user_id}")
  
            project_ref = db.collection("users").document(user_id).collection("projects_created").document()

            project_data = {
                "id": project_ref.id,
                "name": data.get("name", "Unnamed Project"),
                "description": data.get("description", ""),
                "owner": firebase_email, 
                "summary": summary,
                "category": data.get("category", "Uncategorized"),
                "weekly_hours": int(data.get("weekly_hours", 1)),
                "no_of_people": int(data.get("no_of_people", 1)),
                "start_date": data.get("start_date", None),
                "end_date": data.get("end_date", None),
                # "image_url": data.get("image_url", ""),
                "image": data.get("image", ""),
                "color": data.get("color", "blue"),
                "looking_for": data.get("looking_for", "No one"),
                "location": data.get("location", ""),
            }

            project_ref.set(project_data)
            
            applicants_ref = project_ref.collection("Applicants").document("init")
            feedback_ref = project_ref.collection("Feedback").document("init")
            
            applicants_ref.set({})
            feedback_ref.set({})

            return JsonResponse({"message": "Project created successfully", "project": project_data}, status=201)

        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)



class ProjectDeleteView(DestroyAPIView):
    def delete(self,request, project_id):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return JsonResponse({"error": "Unauthorized"}, status=401)

            id_token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            user_email = decoded_token.get("email")

            user_ref = db.collection("users").where("email", "==", user_email).stream()
            user_doc = next(user_ref, None)

            if not user_doc:
                return JsonResponse({"error": "User not found"}, status=404)

            user_id = user_doc.id

            db.collection("users").document(user_id).collection("projects_joined").document(project_id).delete()
            users_ref = db.collection("users").stream()
            for user_doc in users_ref:
                user_projects_ref = db.collection("users").document(user_doc.id).collection("projects_created").document(project_id)
                if user_projects_ref.get().exists:
                    owner_email = user_doc.get("email")
                    owner_id = user_doc.id
                    break
            applicant_ref = db.collection("users").document(owner_id).collection("projects_created").document(project_id).collection("Applicants").document(user_email)
        
            if applicant_ref.get().exists:
                applicant_ref.delete()
                return JsonResponse({"message": "Successfully left the project"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ProjectUpdateView(RetrieveUpdateAPIView):
    
    lookup = "project_id"
    def update(self, request, *args, **kwargs):
        try:
            proj_id = kwargs.get("project_id") 
            if not proj_id:
                return Response({"error": "Project ID is required"}, status=400)

            data = json.loads(request.body) 

            proj_ref = db.collection("Projects").document(proj_id)
            proj_data = proj_ref.get()

            if not proj_data.exists:
                return Response({"error": "Project not found"}, status=404)

            allowed_fields = [
                "name", "description", "owner", "category", "weekly_hours",
                "no_of_people", "start_date", "end_date", "image_url", "color", "looking_for"
            ]
            update_data = {key: data[key] for key in data if key in allowed_fields and data[key]}

            if not update_data:
                return Response({"error": "No valid fields provided for update"}, status=400)
            
            print(f"Updating project {proj_id} with:", update_data)
            proj_ref.update(update_data)

            return Response({"message": "Project updated successfully", "updated_data": update_data}, status=200)

        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ProjectRecommendationViewSet(viewsets.ViewSet):
     def list(self, request, email):
        print("Hello")
        if not email:
            return Response({"error": "Email parameter is required"}, status=400)
    
        print("🔍 Received email:", email)
        recommended_projects = recommend_projects(email)
        return JsonResponse(recommended_projects, safe=False)
     